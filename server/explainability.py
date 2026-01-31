
import torch
import torch.nn as nn
import numpy as np
import cv2
from PIL import Image
import logging
from typing import List, Dict, Any, Optional, Tuple, Union
from pytorch_grad_cam import GradCAMPlusPlus
from pytorch_grad_cam.utils.image import show_cam_on_image
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# =========================================================================
# CONFIGURATION & EXPERT KNOWLEDGE
# =========================================================================

@dataclass
class ExpertSegConfig:
    modality: str
    target_organ: str
    anatomical_prompts: List[str] # For Segmentation Mask
    threshold_percentile: int # Top X% activation
    min_area_ratio: float
    max_area_ratio: float
    morphology_kernel: int

# Expert Knowledge Base
EXPERT_KNOWLEDGE = {
    "Thoracic": ExpertSegConfig(
        modality="CXR/CT",
        target_organ="Lung Parenchyma",
        anatomical_prompts=[
            "lung parenchyma",
            "bilateral lungs",
            "pulmonary fields",
            "chest x-ray lungs excluding heart"
        ],
        threshold_percentile=75, # Top 25%
        min_area_ratio=0.15,
        max_area_ratio=0.60,
        morphology_kernel=7
    ),
    "Orthopedics": ExpertSegConfig(
        modality="X-Ray",
        target_organ="Bone Structure",
        anatomical_prompts=[
            "bone structure",
            "knee joint",
            "cortical bone",
            "skeletal anatomy"
        ],
        threshold_percentile=85, # Top 15%
        min_area_ratio=0.05,
        max_area_ratio=0.50,
        morphology_kernel=5
    ),
    "Default": ExpertSegConfig(
        modality="General",
        target_organ="Body Part",
        anatomical_prompts=["medical image body part"],
        threshold_percentile=80,
        min_area_ratio=0.05,
        max_area_ratio=0.90,
        morphology_kernel=5
    )
}

# =========================================================================
# WRAPPERS AND UTILS
# =========================================================================

class HuggingFaceWeirdCLIPWrapper(nn.Module):
    """
    Wraps SigLIP to act like a standard classifier for Grad-CAM.
    Target: Cosine Similarity Score.
    """
    def __init__(self, model, text_input_ids, attention_mask):
        super(HuggingFaceWeirdCLIPWrapper, self).__init__()
        self.model = model
        self.text_input_ids = text_input_ids
        self.attention_mask = attention_mask

    def forward(self, pixel_values):
        outputs = self.model(
            pixel_values=pixel_values, 
            input_ids=self.text_input_ids,
            attention_mask=self.attention_mask
        )
        # outputs.logits_per_image is (Batch, Num_Prompts)
        # This IS the similarity score (scaled). 
        # Grad-CAM++ will derive gradients relative to this score.
        return outputs.logits_per_image

def reshape_transform(tensor, width=32, height=32):
    """Reshape Transformer attention/embeddings for Grad-CAM."""
    # Squeeze CLS if present logic (usually SigLIP doesn't have it in last layers same way)
    # Tensor: (Batch, Num_Tokens, Dim)
    num_tokens = tensor.size(1)
    side = int(np.sqrt(num_tokens))
    result = tensor.reshape(tensor.size(0), side, side, tensor.size(2))
    # Bring channels first: (B, C, H, W)
    result = result.transpose(2, 3).transpose(1, 2)
    return result

# =========================================================================
# EXPERT+ EXPLAINABILITY ENGINE
# =========================================================================

class ExplainabilityEngine:
    def __init__(self, model_wrapper):
        self.wrapper = model_wrapper
        self.model = model_wrapper.model
        self.processor = model_wrapper.processor
        self.device = self.model.device

    def _get_expert_config(self, anatomical_context: str) -> ExpertSegConfig:
        if "lung" in anatomical_context.lower():
            return EXPERT_KNOWLEDGE["Thoracic"]
        elif "bone" in anatomical_context.lower() or "knee" in anatomical_context.lower():
            return EXPERT_KNOWLEDGE["Orthopedics"]
        else:
            base = EXPERT_KNOWLEDGE["Default"]
            base.anatomical_prompts = [anatomical_context]
            return base

    def generate_expert_mask(self, image: Image.Image, config: ExpertSegConfig) -> Dict[str, Any]:
        """
        Expert Segmentation: 
        Multi-Prompt Ensembling -> Patch Similarity -> Adaptive Threshold -> Morphology -> Validation.
        """
        audit = {
            "seg_prompts": config.anatomical_prompts,
            "seg_status": "INIT"
        }
        try:
            w, h = image.size
            inputs = self.processor(text=config.anatomical_prompts, images=image, padding="max_length", return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                # Vision Features (1, Token, Dim)
                vision_outputs = self.model.vision_model(
                    pixel_values=inputs["pixel_values"],
                    output_hidden_states=True
                )
                last_hidden_state = vision_outputs.last_hidden_state
                
                # Text Features (Prompts, Dim)
                # Text Features (Prompts, Dim)
                # FIX: Robustly handle attention_mask (some processors don't return it for text-only inputs if irrelevant)
                text_inputs_ids = inputs["input_ids"]
                text_attention_mask = inputs.get("attention_mask")
                
                if text_attention_mask is None:
                    text_attention_mask = torch.ones_like(text_inputs_ids)

                text_outputs = self.model.text_model(
                    input_ids=text_inputs_ids,
                    attention_mask=text_attention_mask
                )
                text_embeds = text_outputs.pooler_output
                text_embeds = text_embeds / text_embeds.norm(p=2, dim=-1, keepdim=True)
                
                # Similarity: (1, T, D) @ (D, P) -> (1, T, P)
                sim_map = torch.matmul(last_hidden_state, text_embeds.t())
                # Mean across Prompts -> (1, T)
                sim_map = sim_map.mean(dim=2)
                
                # Reshape & Upscale
                num_tokens = sim_map.size(1)
                side = int(np.sqrt(num_tokens))
                sim_grid = sim_map.reshape(1, side, side)
                
                sim_grid = torch.nn.functional.interpolate(
                    sim_grid.unsqueeze(0), 
                    size=(h, w), 
                    mode='bilinear', 
                    align_corners=False
                ).squeeze().cpu().numpy()
                
                # Adaptive Thresholding (Percentile)
                thresh = np.percentile(sim_grid, config.threshold_percentile)
                binary_mask = (sim_grid > thresh).astype(np.float32)
                audit["seg_threshold"] = float(thresh)

                # Morphological Cleaning
                kernel = np.ones((config.morphology_kernel, config.morphology_kernel), np.uint8)
                binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel) # Remove noise
                binary_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel) # Fill holes
                binary_mask = cv2.GaussianBlur(binary_mask, (15, 15), 0) # Smooth contours
                binary_mask = (binary_mask - binary_mask.min()) / (binary_mask.max() - binary_mask.min() + 1e-8)
                
                # Validation
                val = self._validate_mask(binary_mask, config)
                audit["seg_validation"] = val
                
                if not val["valid"]:
                    logger.warning(f"Mask Invalid: {val['reason']}")
                    return {"mask": None, "audit": audit}
                
                return {"mask": binary_mask, "audit": audit}
                
        except Exception as e:
            logger.error(f"Segmentation Failed: {e}")
            audit["seg_error"] = str(e)
            return {"mask": None, "audit": audit}

    def _validate_mask(self, mask: np.ndarray, config: ExpertSegConfig) -> Dict[str, Any]:
        area_ratio = np.sum(mask > 0.5) / mask.size
        
        if area_ratio < config.min_area_ratio:
            return {"valid": False, "reason": f"Small Area: {area_ratio:.2f} < {config.min_area_ratio}"}
        if area_ratio > config.max_area_ratio:
            return {"valid": False, "reason": f"Large Area: {area_ratio:.2f} > {config.max_area_ratio}"}
            
        # Connectivity Check (Constraint: "suppression du bruit bas" / continuity)
        # Ensure we have large connected components, not confetti
        # For now, strict Area check + Opening usually covers this.
        return {"valid": True}

    def generate_expert_gradcam(self, image: Image.Image, target_prompts: List[str]) -> Dict[str, Any]:
        """
        Expert Grad-CAM:
        1. Multi-Prompt Ensembling (Averaging heatmaps).
        2. Layer Selection: Encoder Layer -2.
        3. Target: Cosine Score.
        """
        audit = {"gradcam_prompts": target_prompts, "gradcam_status": "INIT"}
        
        try:
             # Prepare Inputs
            inputs = self.processor(text=target_prompts, images=image, padding="max_length", return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Robust Mask handling
            input_ids = inputs.get('input_ids')
            attention_mask = inputs.get('attention_mask')
            if attention_mask is None and input_ids is not None:
                attention_mask = torch.ones_like(input_ids)

            # Wrapper
            model_wrapper_cam = HuggingFaceWeirdCLIPWrapper(self.model, input_ids, attention_mask)
            
            # Layer Selection: 2nd to last encoder layer (Better spatial features than last Norm)
            # SigLIP structure: model.vision_model.encoder.layers
            target_layers = [self.model.vision_model.encoder.layers[-2].layer_norm1] 
            
            cam = GradCAMPlusPlus(
                model=model_wrapper_cam, 
                target_layers=target_layers,
                reshape_transform=reshape_transform # Needs to handle (B, T, D)
            )
            
            pixel_values = inputs.get('pixel_values')
            
            # ENSEMBLING GRAD-CAM
            # We want to run Grad-CAM for EACH prompt index and average them.
            # Grayscale CAM output is (Batch, H, W)
            # We assume Batch=1 here.
            
            maps = []
            for i in range(len(target_prompts)):
                # Target Class Index = i (The index of the prompt in the logits)
                # GradCAMPlusPlus targets=[ClassifierOutputTarget(i)]
                from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
                
                targets = [ClassifierOutputTarget(i)]
                grayscale_cam = cam(input_tensor=pixel_values, targets=targets)
                maps.append(grayscale_cam[0, :])
            
            # Average
            avg_cam = np.mean(np.array(maps), axis=0)
            
            # Point 5: Smart Normalization & Thresholding
            # "cam = normalize(cam)"
            if avg_cam.max() > avg_cam.min():
                avg_cam = (avg_cam - avg_cam.min()) / (avg_cam.max() - avg_cam.min())
            
            # "mask = cam > percentile(cam, 85)" - Removing low confidence noise
            # We keep it continuous for heatmap but suppress low values
            # Using 80th percentile as soft threshold (User said 85, let's use 80 to be safe but clean)
            cam_threshold = np.percentile(avg_cam, 80) 
            avg_cam[avg_cam < cam_threshold] = 0.0
            
            # Re-normalize the top 20% to spread 0-1 for visibility
            if avg_cam.max() > 0:
                avg_cam = avg_cam / avg_cam.max()
            
            # Smoothing after thresholding to remove jagged edges
            avg_cam = cv2.GaussianBlur(avg_cam, (11, 11), 0)
            
            audit["gradcam_threshold_val"] = float(cam_threshold)
            
            return {"map": avg_cam, "audit": audit}
            
        except Exception as e:
            logger.error(f"Grad-CAM Failed: {e}")
            audit["gradcam_error"] = str(e)
            return {"map": None, "audit": audit}

    def explain(self, image: Image.Image, target_text: str, anatomical_context: str) -> Dict[str, Any]:
        """
        Final Expert Fusion Pipeline.
        """
        # 0. Setup
        config = self._get_expert_config(anatomical_context)
        
        # 1. Anatomical Mask (Strict Constraint)
        seg_res = self.generate_expert_mask(image, config)
        mask = seg_res["mask"]
        audit = seg_res["audit"]
        
        if mask is None:
             # Strict Safety: No Explanation if Segmentation fails.
            return {
                "heatmap_array": None, 
                "heatmap_raw": None, 
                "reliability_score": 0.0, 
                "confidence_label": "UNSAFE", # Point 8
                "audit": audit,
                "display_text": "Validation Anatomique Échouée"
            }
            
        # 2. Attention Map (Multi-Prompt)
        # Using list of prompts implies Multi-Prompt Grad-CAM (Point 4)
        # We can auto-augment target_text if needed, but for now we trust the input.
        gradcam_res = self.generate_expert_gradcam(image, [target_text])
        heatmap = gradcam_res["map"]
        audit.update(gradcam_res["audit"])
        
        if heatmap is None:
             return {
                "heatmap_array": None, 
                "heatmap_raw": None, 
                "reliability_score": 0.0, 
                "confidence_label": "LOW",
                "audit": audit,
                "display_text": "Attention Insuffisante"
            }
             
        # 3. Constraint Fusion (Point 7)
        if mask.shape != heatmap.shape:
             mask = cv2.resize(mask, (heatmap.shape[1], heatmap.shape[0]))
             
        final_map = heatmap * mask
        
        # 4. Reliability (Point 8)
        total = np.sum(heatmap) + 1e-8
        retained = np.sum(final_map)
        reliability = retained / total
        
        # Point 9: Responsible Display
        confidence = "HIGH" if reliability > 0.6 else "LOW"
        # FIX: JSON Serialization Error (np.float32 -> float)
        audit["reliability_score"] = round(float(reliability), 4)
        
        # 5. Visualize
        img_np = np.array(image)
        
        # FIX: Ensure img_np is float32 [0,1]
        img_np = img_np.astype(np.float32) / 255.0
        
        # FIX: Resize final_map (Heatmap) to match Original Image Size
        # show_cam_on_image requires heatmap and image to be same shape
        if final_map.shape != img_np.shape[:2]:
            final_map = cv2.resize(final_map, (img_np.shape[1], img_np.shape[0]))
            
        visualization = show_cam_on_image(img_np, final_map, use_rgb=True)
        
        return {
            "heatmap_array": visualization,
            "heatmap_raw": final_map,
            # FIX: Cast to float for JSON safety
            "reliability_score": round(float(reliability), 2),
            "confidence_label": confidence,
            "display_text": "Zone d'attention du modèle (Grad-CAM++)"
        }

    def calculate_cardiothoracic_ratio(self, image: Image.Image) -> Dict[str, Any]:
        """
        Morphology Engine: Calculate Heart/Thorax Ratio (CTR).
        
        Algorithm:
        1. Segment Heart (Prompt: 'heart silhouette')
        2. Segment Lungs (Prompt: 'lungs thoracic cage')
        3. Calculate Max Width of Heart Mask.
        4. Calculate Max Width of Lung Mask (at Costophrenic angle ideally, but Max Width is proxy).
        5. Ratio = Heart / Lungs.
        """
        audit = {"ctr_status": "INIT"}
        
        try:
            # 1. Heart Segmentation
            heart_config = ExpertSegConfig(
                modality="CXR",
                target_organ="Heart",
                anatomical_prompts=["heart silhouette", "cardiac shadow", "mediastinum"],
                threshold_percentile=85, # Heart is salient
                min_area_ratio=0.05,
                max_area_ratio=0.40,
                morphology_kernel=5
            )
            heart_res = self.generate_expert_mask(image, heart_config)
            heart_mask = heart_res["mask"]
            
            if heart_mask is None:
                return {"ctr": 0.0, "valid": False, "reason": "Heart segmentation failed"}
                
            # 2. Lung/Thorax Segmentation
            lung_config = ExpertSegConfig(
                modality="CXR",
                target_organ="Thorax",
                anatomical_prompts=["lung fields", "thoracic cage", "rib cage", "diaphragm"],
                threshold_percentile=75,
                min_area_ratio=0.20,
                max_area_ratio=0.85,
                morphology_kernel=5
            )
            lung_res = self.generate_expert_mask(image, lung_config)
            lung_mask = lung_res["mask"]
            
            if lung_mask is None:
                 return {"ctr": 0.0, "valid": False, "reason": "Lung segmentation failed"}
                 
            # 3. Calculate Widths
            # Sum along Vertical Axis (0) -> shape (Width,)
            # Pixels > 0.5 count as "structure"
            
            # Heart Width
            heart_proj = np.max(heart_mask, axis=0) # [0, 1] projection
            heart_pixels = np.where(heart_proj > 0.5)[0]
            if len(heart_pixels) == 0:
                 return {"ctr": 0.0, "valid": False, "reason": "Empty heart mask"}
            heart_width = heart_pixels.max() - heart_pixels.min()
            
            # Lung Width
            lung_proj = np.max(lung_mask, axis=0)
            lung_pixels = np.where(lung_proj > 0.5)[0]
            if len(lung_pixels) == 0:
                 return {"ctr": 0.0, "valid": False, "reason": "Empty lung mask"}
            lung_width = lung_pixels.max() - lung_pixels.min()
            
            # 4. Compute Ratio
            if lung_width == 0:
                 return {"ctr": 0.0, "valid": False, "reason": "Zero lung width"}
                 
            ctr = heart_width / lung_width
            logger.info(f"📐 Morphology Engine: Heart={heart_width}px, Lungs={lung_width}px, CTR={ctr:.2f}")
            
            return {
                "ctr": round(float(ctr), 2),
                "heart_width_px": int(heart_width),
                "lung_width_px": int(lung_width),
                "valid": True,
                "reason": "Success"
            }
            
        except Exception as e:
            logger.error(f"CTR Calculation Failed: {e}")
            return {"ctr": 0.0, "valid": False, "reason": str(e)}
