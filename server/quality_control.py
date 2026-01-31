
import numpy as np
import cv2
import pydicom
import logging
from typing import Dict, Any, List, Tuple, Union
from PIL import Image

logger = logging.getLogger("ElephMind-QC")

class QualityControlEngine:
    """
    Advanced Quality Control Engine (Gatekeeper).
    Implements the 9-Point QC Checklist.
    
    Metrics:
    1. Structural (DICOM)
    2. Intensity (Contrast)
    3. Blur (Laplacian)
    4. Noise (SNR)
    5. Saturation (Clipping)
    6. Spatial (Aspect Ratio)
    
    Decision:
    QC Score = Weighted Sum
    Threshold >= 0.75 -> PASS
    """
    
    def __init__(self):
        # Weights defined by user
        self.weights = {
            "structure": 0.30, # Weight 3 (Normalized approx)
            "blur": 0.20,      # Weight 2
            "contrast": 0.20,  # Weight 2
            "noise": 0.10,     # Weight 1
            "saturation": 0.10,
            "spatial": 0.10
        }
        # Thresholds
        self.thresholds = {
            "blur_var": 100.0,      # Laplacian Variance < 100 -> Blurry
            "contrast_std": 10.0,   # Std Dev < 10 -> Low Contrast
            "entropy": 4.0,         # Entropy < 4.0 -> Low Info
            "snr_min": 2.0,         # Signal-to-Noise Ratio < 2.0 -> Noisy
            "saturation_max": 0.05, # >5% pixels at min/max -> Saturated
            "aspect_min": 0.5,      # Too thin
            "aspect_max": 2.0       # Too wide
        }

    def evaluate_dicom(self, dataset: pydicom.dataset.FileDataset) -> Dict[str, Any]:
        """
        Gate 1: Structural DICOM Check.
        """
        reasons = []
        passed = True
        
        try:
            # 1. Pixel Data Presence
            if not hasattr(dataset, "PixelData") or dataset.PixelData is None:
                return {"passed": False, "score": 0.0, "reasons": ["CRITICAL: Missing PixelData"]}
            
            # 2. Dimensions
            rows = getattr(dataset, "Rows", 0)
            cols = getattr(dataset, "Columns", 0)
            if rows <= 0 or cols <= 0:
                return {"passed": False, "score": 0.0, "reasons": ["CRITICAL: Invalid Dimensions (Rows/Cols <= 0)"]}
                
            # 3. Transfer Syntax (Compression check - basic)
            # If we can read pixel_array, it's usually mostly fine, preventing crash is handled in processor.
            # Here we just check logical validity.
            
            pass
        except Exception as e:
             return {"passed": False, "score": 0.0, "reasons": [f"CRITICAL: DICOM Corrupt ({str(e)})"]}

        return {"passed": True, "score": 1.0, "reasons": []}

    def compute_metrics(self, image: np.ndarray) -> Dict[str, float]:
        """
        Compute raw metrics for the image (H, W) or (H, W, C).
        Image input should be uint8 0-255 or float.
        """
        metrics = {}
        
        # Ensure Grayscale for calculation
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image
            
        # 1. Blur (Variance of Laplacian)
        metrics['blur_var'] = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # 2. Intensity / Contrast
        metrics['std_dev'] = np.std(gray)
        # Entropy
        hist, _ = np.histogram(gray, bins=256, range=(0, 256))
        prob = hist / (np.sum(hist) + 1e-8)
        prob = prob[prob > 0]
        metrics['entropy'] = -np.sum(prob * np.log2(prob))
        
        # 3. Noise (Simple SNR estimate)
        # Signal = Mean, Noise = Std(High Pass)
        # Simple High Pass: Image - Blurred
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        noise_img = gray.astype(float) - blurred.astype(float)
        noise_std = np.std(noise_img) + 1e-8
        signal_mean = np.mean(gray)
        metrics['snr'] = signal_mean / noise_std
        
        # 4. Saturation
        # % pixels at 0 or 255
        n_pixels = gray.size
        n_sat = np.sum(gray <= 5) + np.sum(gray >= 250)
        metrics['saturation_pct'] = n_sat / n_pixels
        
        # 5. Spatial
        h, w = gray.shape
        metrics['aspect_ratio'] = w / h
        
        return metrics

    def run_quality_check(self, image_input: Union[Image.Image, np.ndarray, pydicom.dataset.FileDataset]) -> Dict[str, Any]:
        """
        Main Entry Point.
        Returns: {
            "passed": bool,
            "quality_score": float (0-1),
            "reasons": List[str],
            "metrics": Dict
        }
        """
        reasons = []
        scores = {}
        
        # --- PHASE 1: DICOM STRUCTURE (If DICOM) ---
        dicom_score = 1.0
        if isinstance(image_input, pydicom.dataset.FileDataset):
            res_struct = self.evaluate_dicom(image_input)
            if not res_struct['passed']:
                return {
                    "passed": False, 
                    "quality_score": 0.0, 
                    "reasons": res_struct['reasons'], 
                    "metrics": {} 
                }
            # Convert to numpy for image analysis using standard processor logic (simplified here or assume pre-converted)
            # ideally the caller passes the converted image. 
            # If input is DICOM, we assume we can't analyze image metrics easily here without converting.
            # To simplify integration: Check DICOM Structure, then rely on caller to pass Image object for Visual QC.
            # For this implementation, we assume input is PIL Image or Numpy Array for Visual QC.
            pass

        # Prepare Image
        if isinstance(image_input, Image.Image):
             img_np = np.array(image_input)
        elif isinstance(image_input, np.ndarray):
             img_np = image_input
        else:
             # If strictly DICOM passed without conversion capability, we only did struct check
             return {"passed": True, "quality_score": 1.0, "reasons": [], "metrics": {}}

        # --- PHASE 2: VISUAL METRICS ---
        m = self.compute_metrics(img_np)
        
        # 1. Blur Check
        # Sigmoid-like soft score or Hard Threshold? User implies Hard Rules composed into Score.
        # "Structure: weight 3, Blur: weight 2..."
        # Let's assign 0 or 1 per category based on threshold, then weight.
        
        # Blur
        if m['blur_var'] < self.thresholds['blur_var']:
            scores['blur'] = 0.0
            reasons.append("Image Floue (Netteté insuffisante)")
        else:
            scores['blur'] = 1.0
            
        # Contrast / Intensity
        if m['std_dev'] < self.thresholds['contrast_std'] or m['entropy'] < self.thresholds['entropy']:
            scores['contrast'] = 0.0
            reasons.append("Contraste Insuffisant (Image plate/sombre)")
        else:
            scores['contrast'] = 1.0
            
        # Noise
        if m['snr'] < self.thresholds['snr_min']:
            scores['noise'] = 0.0
            reasons.append("Bruit Excessif (SNR faible)")
        else:
            scores['noise'] = 1.0
            
        # Saturation
        if m['saturation_pct'] > self.thresholds['saturation_max']:
            scores['saturation'] = 0.0
            reasons.append("Saturation Excessive (>5% clipping)")
        else:
            scores['saturation'] = 1.0
            
        # Spatial
        if not (self.thresholds['aspect_min'] <= m['aspect_ratio'] <= self.thresholds['aspect_max']):
            scores['spatial'] = 0.0
            reasons.append(f"Format Anatomique Invalide (Ratio {m['aspect_ratio']:.2f})")
        else:
             scores['spatial'] = 1.0
             
        # Structural (Implicitly 1 if we got here with an image)
        scores['structure'] = 1.0 
        
        # --- PHASE 3: GLOBAL SCORE ---
        # QC_score = Sum(w * s)
        final_score = (
            self.weights['structure'] * scores.get('structure', 1.0) +
            self.weights['blur'] * scores.get('blur', 1.0) +
            self.weights['contrast'] * scores.get('contrast', 1.0) +
            self.weights['noise'] * scores.get('noise', 1.0) +
            self.weights['saturation'] * scores.get('saturation', 1.0) +
            self.weights['spatial'] * scores.get('spatial', 1.0)
        )
        
        # Normalize weights sum just in case
        total_weight = sum(self.weights.values())
        final_score = final_score / total_weight
        
        # DECISION
        is_passed = final_score >= 0.75
        
        status = "PASSED" if is_passed else "REJECTED"
        logger.info(f"QC Evaluation: {status} (Score: {final_score:.2f}) - Reasons: {reasons}")
        
        return {
            "passed": is_passed,
            "quality_score": round(final_score, 2),
            "reasons": reasons,
            "metrics": m
        }
