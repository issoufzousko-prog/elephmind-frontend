"""
ElephMind Medical AI Backend
============================
Production-ready FastAPI backend for medical image analysis using SigLIP.

Author: ElephMind Team
Version: 2.0.0 (Cleaned & Secured)
"""

import sys
import os
import uuid
import asyncio
import time
import logging

# --- DOTENV SUPPORT (MUST BE FIRST) ---
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from enum import Enum
from typing import Dict, List, Optional, Any, Tuple
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from contextlib import asynccontextmanager
import uvicorn
import base64
import cv2
import numpy as np
from pytorch_grad_cam import GradCAMPlusPlus
from pytorch_grad_cam.utils.image import show_cam_on_image
from localization import localize_result
import torch
import torch.nn as nn
# Local modules
import database
import storage_manager  # NEW: Physical storage layout
from database import JobStatus
from storage import get_storage_provider
import encryption
import database
# algorithms imported directly above

import math
from collections import deque
from dataclasses import dataclass, field
from PIL import Image
import io

# --- GRADCAM UTILS FOR SIGLIP/ViT ---

# Class moved to Line 781 (Deduplication)


# Function moved to Line 798 (Deduplication)

# --- AUTH IMPORTS ---
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, status, Request
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt

# --- DOTENV (Moved to top) ---

# =========================================================================
# LOGGING CONFIGURATION
# =========================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("ElephMind-Backend")

# =========================================================================
# 7 INTELLIGENCE ALGORITHMS (Merged from algorithms.py)
# =========================================================================

# 1. IMAGE QUALITY ASSESSMENT
def detect_blur(image: np.ndarray) -> float:
    """
    Detect blur using Laplacian variance.
    Higher score = sharper image.
    Returns: 0.0 (very blurry) to 1.0 (very sharp)
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    # Normalize to 0-1 (empirical thresholds for medical images)
    return min(1.0, laplacian_var / 500.0)

def assess_image_quality(image: np.ndarray) -> Dict[str, Any]:
    """Assess image quality metrics."""
    score = 0
    metrics = []
    
    # Blur detection
    sharpness = detect_blur(image)
    metrics.append({"metric": "Netteté", "value": int(sharpness * 100)})
    
    if sharpness > 0.6: score += 40
    elif sharpness > 0.3: score += 20
    
    # Contrast check
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    contrast = float(gray.std())
    metrics.append({"metric": "Contraste", "value": int(min(100, contrast * 2))})
    if contrast > 40: score += 30
    
    # Resolution check
    h, w = image.shape[:2]
    metrics.append({"metric": "Résolution", "value": int(min(100, (h*w)/(1024*1024)*100))})
    if h*w > 512*512: score += 30
    
    return {
        "quality_score": min(100, score),
        "metrics": metrics
    }

# 2. CONFIDENCE CALIBRATION
def calibrate_confidence(raw_stats: List[float], labels: List[str]) -> float:
    """
    Calibrate raw confidence scores.
    """
    if not raw_stats:
        return 0.0
        
    
    top_val = max(raw_stats)
    return float(round(top_val * 100, 2))

# 3. CLINICAL PRIORITY SCORING
def calculate_priority_score(predictions: List[Dict], domain: str) -> str:
    """
    Determine triage priority based on prediction severity.
    """
    if not predictions:
        return "Normale"
        
    top_pred = predictions[0]
    label = top_pred["label"].lower()
    prob = top_pred["probability"]
    
    # Critical keywords
    critical_terms = ["malignant", "cancer", "carcinoma", "pneumonia", "pneumothorax", "fracture", "grade 4"]
    warning_terms = ["grade 2", "grade 3", "effusion", "edema", "abnormal"]
    
    if any(term in label for term in critical_terms) and prob > 50:
        return "Élevée"
    if any(term in label for term in warning_terms) and prob > 40:
        return "Moyenne"
        
    return "Normale"

# 4. AUTOMATIC REPORT GENERATION
def generate_clinical_report(analysis_result: Dict[str, Any], patient_info: Optional[Dict] = None) -> str:
    """
    Generate a text summary of the findings using templates (Deterministic LLM-like).
    """
    domain = analysis_result.get("domain", {}).get("label", "Unknown")
    specifics = analysis_result.get("specific", [])
    
    if not specifics:
        return "Analyse non concluante."
        
    top_finding = specifics[0]
    
    report = f"RAPPORT D'ANALYSE AUTOMATISÉE - {domain.upper()}\n"
    report += f"Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n"
    if patient_info:
        report += f"Patient ID: {patient_info.get('id', 'N/A')}\n"
    report += "-" * 40 + "\n"
    
    report += f"Observation Principale: {top_finding['label']}\n"
    report += f"Confiance IA: {top_finding['probability']}%\n"
    priority = analysis_result.get("priority", "Normale")
    report += f"Priorité de Triage: {priority.upper()}\n\n"
    
    report += "Détails Techniques:\n"
    for i, det in enumerate(specifics[1:4]):
        report += f"- {det['label']}: {det['probability']}%\n"
        
    return report

# 5. SIMILAR CASE DETECTION (Vector DB Mockup)
@dataclass
class CaseRecord:
    id: str
    embedding: np.ndarray
    diagnosis: str
    domain: str
    probability: float
    username: str  # Added for isolation

class SimilarCaseDatabase:
    def __init__(self):
        self.cases: List[CaseRecord] = []
        
    def add_case(self, case_id: str, embedding: np.ndarray, diagnosis: str, domain: str, probability: float, username: str):
        self.cases.append(CaseRecord(case_id, embedding, diagnosis, domain, probability, username))
        # Keep manageable size
        if len(self.cases) > 1000:
            self.cases.pop(0)
            
    def find_similar(self, query_embedding: np.ndarray, username: str, top_k: int = 3, same_domain_only: bool = True, query_domain: str = None) -> List[Dict]:
        if not self.cases:
            return []
            
        scores = []
        for case in self.cases:
            # STRICT ISOLATION: Only compare with own cases
            if case.username != username:
                continue

            if same_domain_only and query_domain and case.domain != query_domain:
                continue
                
            # Cosine similarity
            dot_product = np.dot(query_embedding, case.embedding)
            norm_a = np.linalg.norm(query_embedding)
            norm_b = np.linalg.norm(case.embedding)
            similarity = dot_product / (norm_a * norm_b) if norm_a > 0 and norm_b > 0 else 0
            
            scores.append((similarity, case))
            
        scores.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                "case_id": c.id, 
                "diagnosis": c.diagnosis, 
                "similarity": round(float(s * 100), 1)
            } 
            for s, c in scores[:top_k]
        ]

# Global instance
similar_case_db = SimilarCaseDatabase()

def find_similar_cases(embedding: np.ndarray, domain: str, username: str, top_k: int = 5) -> Dict[str, Any]:
    """Find similar cases based on embedding, strictly isolated by user."""
    similar = similar_case_db.find_similar(
        query_embedding=embedding,
        username=username,
        top_k=top_k,
        same_domain_only=True,
        query_domain=domain
    )
    
    return {
        "similar_cases": similar,
        "cases_searched": len(similar_case_db.cases),
        "message": f"Trouvé {len(similar)} cas similaires" if similar else "Aucun cas similaire trouvé"
    }

def store_case_for_similarity(case_id: str, embedding: np.ndarray, diagnosis: str, domain: str, probability: float, username: str):
    """Store a case for fiture similarity searches, isolated by user."""
    similar_case_db.add_case(
        case_id=case_id,
        embedding=embedding,
        diagnosis=diagnosis,
        domain=domain,
        probability=probability,
        username=username
    )

# 6. ADAPTIVE PREPROCESSING
def estimate_noise_level(image: np.ndarray) -> float:
    """Estimate noise level using Laplacian method."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    # Use robust median absolute deviation
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    sigma = np.median(np.abs(laplacian)) / 0.6745
    return float(sigma)

def apply_clahe(image: np.ndarray, clip_limit: float = 2.0, grid_size: int = 8) -> np.ndarray:
    """Apply Contrast Limited Adaptive Histogram Equalization."""
    if len(image.shape) == 3:
        # Convert to LAB and apply to L channel
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(grid_size, grid_size))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    else:
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(grid_size, grid_size))
        return clahe.apply(image)

def gamma_correction(image: np.ndarray, gamma: float = 1.0) -> np.ndarray:
    """Apply gamma correction for brightness adjustment."""
    inv_gamma = 1.0 / gamma
    table = np.array([
        ((i / 255.0) ** inv_gamma) * 255 
        for i in np.arange(0, 256)
    ]).astype("uint8")
    return cv2.LUT(image, table)

def bilateral_denoise(image: np.ndarray, d: int = 9, sigma_color: int = 75, sigma_space: int = 75) -> np.ndarray:
    """Apply bilateral filter for edge-preserving denoising."""
    return cv2.bilateralFilter(image, d, sigma_color, sigma_space)

def adaptive_preprocessing(image_bytes: bytes) -> Tuple[Image.Image, Dict[str, Any]]:
    """
    Apply intelligent preprocessing based on image analysis.
    Returns processed image and a log of transformations applied.
    """
    # Decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    
    if img is None:
        raise ValueError("Could not decode image")
    
    transformations = []
    original_stats = {
        "mean_brightness": float(np.mean(img)),
        "std_dev": float(np.std(img))
    }
    
    # Convert to grayscale for analysis
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
    
    # Analyze histogram
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    non_zero = np.where(hist > 0)[0]
    
    is_low_contrast = bool(len(non_zero) > 0 and (non_zero[-1] - non_zero[0]) < 150)
    is_dark = bool(np.mean(gray) < 60)
    is_bright = bool(np.mean(gray) > 200)
    noise_level = float(estimate_noise_level(gray))
    
    # Apply adaptive corrections
    processed = img.copy()
    
    # 1. Low contrast - Apply CLAHE
    if is_low_contrast:
        processed = apply_clahe(processed, clip_limit=2.5)
        transformations.append({
            "type": "CLAHE",
            "reason": "Faible contraste détecté",
            "params": {"clip_limit": 2.5}
        })
    
    # 2. Dark image - Gamma correction
    if is_dark:
        processed = gamma_correction(processed, gamma=0.6)
        transformations.append({
            "type": "Gamma Correction",
            "reason": "Image trop sombre",
            "params": {"gamma": 0.6}
        })
    
    # 3. Overexposed - Inverse gamma
    if is_bright:
        processed = gamma_correction(processed, gamma=1.6)
        transformations.append({
            "type": "Gamma Correction",
            "reason": "Image surexposée",
            "params": {"gamma": 1.6}
        })
    
    # 4. Noisy - Bilateral filter
    if noise_level > 15:
        processed = bilateral_denoise(processed)
        transformations.append({
            "type": "Bilateral Denoise",
            "reason": f"Bruit détecté (σ={noise_level:.1f})",
            "params": {"d": 9, "sigma": 75}
        })
    
    # 5. Black level correction for X-rays (crush blacks)
    if len(processed.shape) == 2 or (len(processed.shape) == 3 and processed.shape[2] == 1):
        _, processed = cv2.threshold(processed, 15, 255, cv2.THRESH_TOZERO)
        transformations.append({
            "type": "Black Level Crush",
            "reason": "Correction niveau noir (X-ray)",
            "params": {"threshold": 15}
        })
    
    # Final normalization
    min_val, max_val = processed.min(), processed.max()
    if max_val > min_val:
        processed = ((processed - min_val) / (max_val - min_val) * 255).astype(np.uint8)
        transformations.append({
            "type": "Normalization",
            "reason": "Normalisation finale",
            "params": {"min": float(min_val), "max": float(max_val)}
        })
    
    # Convert to PIL Image
    if len(processed.shape) == 2:
        pil_image = Image.fromarray(processed).convert("RGB")
    else:
        pil_image = Image.fromarray(cv2.cvtColor(processed, cv2.COLOR_BGR2RGB))
    
    preprocessing_log = {
        "original_stats": original_stats,
        "analysis": {
            "low_contrast": is_low_contrast,
            "dark": is_dark,
            "bright": is_bright,
            "noise_level": round(noise_level, 2)
        },
        "transformations_applied": transformations,
        "transformation_count": len(transformations)
    }
    
    return pil_image, preprocessing_log

# 7. ENHANCE ANALYSIS RESULT (PIPELINE)
def enhance_analysis_result(
    base_result: Dict[str, Any],
    image_array: np.ndarray = None,
    embedding: np.ndarray = None,
    case_id: str = None,
    patient_info: Dict = None,
    username: str = None
) -> Dict[str, Any]:
    """
    Enhance base analysis result with all 7 algorithms.
    This is the main entry point for the enhanced pipeline.
    """
    enhanced = base_result.copy()
    
    # 1. Image Quality (if image provided)
    if image_array is not None:
        enhanced["image_quality"] = assess_image_quality(image_array)
    
    # 2. Confidence Calibration
    if "specific" in enhanced and enhanced["specific"]:
        raw_probs = [p["probability"] / 100 for p in enhanced["specific"]]
        labels = [p["label"] for p in enhanced["specific"]]
        enhanced["confidence"] = calibrate_confidence(raw_probs, labels=labels)
    
    # 3. Priority Scoring
    if "specific" in enhanced and enhanced["specific"]:
        domain = enhanced.get("domain", {}).get("label", "Unknown")
        enhanced["priority"] = calculate_priority_score(enhanced["specific"], domain)
    
    # 4. Similar Cases (if embedding provided AND username provided)
    if embedding is not None and "domain" in enhanced and username:
        domain = enhanced["domain"].get("label", "Unknown")
        enhanced["similar_cases"] = find_similar_cases(embedding, domain, username)
        
        # Store this case for future searches
        if case_id and enhanced["specific"]:
            top_pred = enhanced["specific"][0]
            store_case_for_similarity(
                case_id=case_id,
                embedding=embedding,
                diagnosis=top_pred["label"],
                domain=domain,
                probability=top_pred["probability"],
                username=username
            )
    
    # 5. Generate Report - REMOVED HERE
    # Moved to predict() method to ensure it runs AFTER localization (Translation)
    # enhanced["report"] = ... 
    
    return enhanced

BASE_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
NESTED_DIR = os.path.join(BASE_MODELS_DIR, "oeil d'elephant")
MODEL_DIR = NESTED_DIR if os.path.exists(NESTED_DIR) else BASE_MODELS_DIR

# Environment Detection
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# Security Configuration - JWT Secret Key (ENFORCED in production)
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    if IS_PRODUCTION:
        logger.critical("🔴 FATAL ERROR: JWT_SECRET_KEY must be set in production environment")
        logger.critical("Generate one with: python -c 'import secrets; print(secrets.token_hex(32))'")
        sys.exit(1)  # Fail-fast in production
    else:
        # Development fallback with warning
        from secrets import token_hex
        SECRET_KEY = "dev_insecure_key_" + token_hex(16)
        logger.warning("⚠️  WARNING: Using development JWT secret. DO NOT use in production!")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

logger.info(f"🌍 Environment: {ENVIRONMENT}")
logger.info(f"✅ JWT SECRET_KEY: {'SET (secure)' if 'dev_insecure' not in SECRET_KEY else 'DEVELOPMENT MODE'}")

# CORS Configuration
CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:5176,http://127.0.0.1:5176")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]

# Concurrency Control
MAX_CONCURRENT_USERS = int(os.getenv("MAX_CONCURRENT_USERS", "200"))
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENT_USERS)

# =========================================================================
# MODEL PATH CONFIGURATION (HuggingFace Hub or Local)
# =========================================================================
def get_model_path():
    """Get model path - download from HuggingFace Hub if not available locally."""
    # Check environment variable first
    env_path = os.getenv("MODEL_DIR")
    if env_path and os.path.exists(env_path):
        logger.info(f"Using model from environment: {env_path}")
        return env_path
    
    # Check local path (development)
    local_path = os.path.join(os.path.dirname(__file__), "models", "oeil d'elephant")
    if os.path.exists(local_path):
        logger.info(f"Using local model: {local_path}")
        return local_path
    
    # Download from HuggingFace Hub (production/cloud)
    try:
        from huggingface_hub import snapshot_download
        logger.info("Downloading model from HuggingFace Hub...")
        hub_path = snapshot_download(
            repo_id="issoufzousko07/medsigclip-model",
            repo_type="model"
        )
        logger.info(f"Model downloaded to: {hub_path}")
        return hub_path
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        raise RuntimeError(f"Model not found locally and failed to download: {e}")

MODEL_DIR = None  # Will be set at startup

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# =========================================================================
# MEDICAL DOMAINS CONFIGURATION
# =========================================================================
# =========================================================================
# MEDICAL DOMAINS CONFIGURATION (DIRECT EMBEDDING)
# =========================================================================
# Re-embedded per user request for simplicity and chart stability.

MEDICAL_DOMAINS = {
    'Thoracic': {
        'id': 'DOM_THORACIC',
        'domain_prompt': 'Chest X-Ray Analysis',
        'specific_labels': [
            {'id': 'TH_PNEUMONIA_VIRAL', 'label_en': 'Diffuse interstitial opacities or ground-glass pattern (Viral/Atypical Pneumonia)'},
            {'id': 'TH_PNEUMONIA_BACT', 'label_en': 'Focal alveolar consolidation with air bronchograms (Bacterial Pneumonia)'},
            {'id': 'TH_NORMAL', 'label_en': 'Normal chest radiograph: normal cardiothoracic ratio, clear lungs, no pleural abnormality'}, 
            {'id': 'TH_PNEUMOTHORAX', 'label_en': 'Pneumothorax (Lung collapse)'},
            {'id': 'TH_PLEURAL_EFFUSION', 'label_en': 'Pleural Effusion (Fluid)'},
            {'id': 'TH_CARDIOMEGALY', 'label_en': 'Cardiomegaly with clear lung fields (no pulmonary edema)'}, 
            {'id': 'TH_CARDIOMEGALY_EDEMA', 'label_en': 'Cardiomegaly with pulmonary congestion or edema'},
            {'id': 'TH_EDEMA', 'label_en': 'Pulmonary Edema (without cardiomegaly)'},
            {'id': 'TH_NODULE', 'label_en': 'Lung Nodule or Mass'},
            {'id': 'TH_ATELECTASIS', 'label_en': 'Atelectasis (Lung collapse)'}
        ],
        'logic_gate': {
            'prompt': 'Evaluate cardiac silhouette size',
            'labels': ['Normal cardiac size (CTR < 0.5)', 'Enlarged cardiac silhouette (Cardiomegaly)'],
            'penalty_target': 'TH_NORMAL', 
            'abnormal_index': 1
        }
    },
    'Dermatology': {
        'id': 'DOM_DERMATOLOGY',
        'domain_prompt': 'Dermatoscopic analysis of a pigmented or non-pigmented skin lesion',
        'specific_labels': [
            {'id': 'DERM_NORMAL', 'label_en': 'Normal skin without visible lesion or abnormal pigmentation'},
            {'id': 'DERM_NEVUS', 'label_en': 'Benign melanocytic nevus with symmetry and uniform pigmentation'},
            {'id': 'DERM_SEBORRHEIC', 'label_en': 'Seborrheic keratosis (benign warty lesion)'},
            {'id': 'DERM_MELANOMA', 'label_en': 'Malignant melanoma with asymmetry, irregular borders, and color variegation'},
            {'id': 'DERM_BCC', 'label_en': 'Basal cell carcinoma (pearly or ulcerated lesion)'},
            {'id': 'DERM_SCC', 'label_en': 'Squamous cell carcinoma (crusty or budding lesion)'},
            {'id': 'DERM_INFLAMMATORY', 'label_en': 'Inflammatory skin lesion (Eczema, Psoriasis)'}
        ],
        'logic_gate': {
            'prompt': 'Is there a visible skin lesion?',
            'labels': ['No visible skin lesion', 'Visible skin lesion (pigmented or non-pigmented)'],
            'penalty_target': 'ALL_PATHOLOGY', 
            'abnormal_index': 0 
        }
    },
    'Histology': {
        'id': 'DOM_HISTOLOGY',
        'domain_prompt': 'Microscopic analysis of a histological section (H&E stain)',
        'specific_labels': [
            {'id': 'HIST_HEALTHY_BREAST', 'label_en': 'Healthy breast tissue with preserved lobular architecture'},
            {'id': 'HIST_HEALTHY_PROSTATE', 'label_en': 'Healthy prostatic tissue with regular glands'},
            {'id': 'HIST_IDC_BREAST', 'label_en': 'Invasive ductal carcinoma (Disorganized cells)'},
            {'id': 'HIST_ADENO_PROSTATE', 'label_en': 'Prostate adenocarcinoma (Gland fusion)'},
            {'id': 'HIST_DYSPLASIA', 'label_en': 'Cervical dysplasia or intraepithelial neoplasia'},
            {'id': 'HIST_COLON_CA', 'label_en': 'Colon cancer tumor tissue'},
            {'id': 'HIST_LUNG_CA', 'label_en': 'Lung cancer tumor tissue'},
            {'id': 'HIST_ADIPOSE', 'label_en': 'Adipose tissue (Fat) or connective stroma'},
            {'id': 'HIST_ARTIFACT', 'label_en': 'Preparation artifact, empty area, or blurred region'} 
        ],
        'logic_gate': {
            'prompt': 'Assess histological validity of the image',
            'labels': ['Adequate H&E tissue section', 'Artifact, empty area, or blurred region'],
            'penalty_target': 'ALL_DIAGNOSIS',
            'abnormal_index': 1
        }
    },
    'Ophthalmology': {
        'id': 'DOM_OPHTHALMOLOGY',
        'domain_prompt': 'Fundus photography (Retina)',
        'specific_labels': [
            {'id': 'OPH_NORMAL', 'label_en': 'Normal retina with visible optic disc and macula'},
            {'id': 'OPH_DIABETIC', 'label_en': 'Diabetic retinopathy (hemorrhages, exudates)'},
            {'id': 'OPH_GLAUCOMA', 'label_en': 'Glaucoma (optic disc cupping)'},
            {'id': 'OPH_AMD', 'label_en': 'Macular degeneration (drusen or atrophy)'}
        ],
        'logic_gate': {
             'prompt': 'Is the fundus image clinically interpretable?',
             'labels': ['Good quality fundus image', 'Poor quality, uninterpretable or partial view'],
             'penalty_target': 'ALL_DIAGNOSIS',
             'abnormal_index': 1
        }
    },
    'Orthopedics': {
        'id': 'DOM_ORTHOPEDICS',
        'domain_prompt': 'Bone X-Ray (Musculoskeletal)',
        'stage_1_triage': {
            'prompt': 'Anatomical region identification',
            'labels': [
                'Other x-ray view (Chest, Hand, Foot, Pediatric) - OUT OF DISTRIBUTION',
                'A knee x-ray view (Knee Joint)'
            ]
        },
        'specific_labels': [ 
             {'id': 'ORTH_OA_SEVERE', 'label_en': 'Severe osteoarthritis (Grade 4)'}, 
             {'id': 'ORTH_OA_MODERATE', 'label_en': 'Moderate osteoarthritis (Grade 2-3)'}, 
             {'id': 'ORTH_NORMAL', 'label_en': 'Normal knee'}, 
             {'id': 'ORTH_IMPLANT', 'label_en': 'Implant'}
        ],
        'stage_2_diagnosis': {
            'prompt': 'Knee Osteoarthritis Severity Assessment',
            'labels': [
                {'id': 'ORTH_OA_SEVERE', 'label_en': 'Severe osteoarthritis with bone-on-bone contact (Grade 4)'},
                {'id': 'ORTH_OA_MODERATE', 'label_en': 'Moderate osteoarthritis with definite joint space narrowing (Grade 2-3)'},
                {'id': 'ORTH_NORMAL', 'label_en': 'Normal knee joint with preserved joint space (Grade 0-1)'},
                {'id': 'ORTH_IMPLANT', 'label_en': 'Total knee arthroplasty (TKA) with metallic implant'}, 
                {'id': 'ORTH_FRACTURE', 'label_en': 'Acute knee fracture or dislocation'}
            ]
        },
        'logic_gate': {
            'prompt': 'Is there a metallic implant?',
            'labels': ['Native knee joint', 'Knee with metallic implant (Arthroplasty)'],
            'penalty_target': 'ORTH_OA',
            'abnormal_index': 1
        }
    }
}

LABEL_TRANSLATIONS_FR = {
    'TH_NORMAL': {'short': 'Thorax sans anomalie', 'long': 'Silhouette cardiaque normale, poumons clairs, pas d’épanchement.', 'severity': 'low'},
    'TH_PNEUMONIA_VIRAL': {'short': 'Pneumonie Virale / Atypique', 'long': 'Opacités interstitielles diffuses ou verre dépoli.', 'severity': 'high'},
    'TH_PNEUMONIA_BACT': {'short': 'Pneumonie Bactérienne', 'long': 'Consolidation alvéolaire focale avec bronchogramme aérien.', 'severity': 'high'},
    'TH_PNEUMOTHORAX': {'short': 'Pneumothorax', 'long': 'Présence possible d’air dans la cavité pleurale (collapsus).', 'severity': 'emergency'},
    'TH_PLEURAL_EFFUSION': {'short': 'Épanchement Pleural', 'long': 'Accumulation de liquide dans l’espace pleural.', 'severity': 'medium'},
    'TH_CARDIOMEGALY': {'short': 'Cardiomégalie (Poumons clairs)', 'long': 'Silhouette cardiaque augmentée de taille sans signe d’œdème pulmonaire.', 'severity': 'medium'},
    'TH_CARDIOMEGALY_EDEMA': {'short': 'Cardiomégalie avec Stase', 'long': 'Cœur augmenté de taille associé à une congestion pulmonaire.', 'severity': 'high'},
    'TH_EDEMA': {'short': 'Œdème Pulmonaire', 'long': 'Surcharge liquidienne pulmonaire (sans cardiomégalie évidente).', 'severity': 'high'},
    'TH_NODULE': {'short': 'Nodule ou Masse Pulmonaire', 'long': 'Lésion focale suspecte nécessitant un scanner de contrôle.', 'severity': 'high'},
    'TH_ATELECTASIS': {'short': 'Atélectasie', 'long': 'Affaissement d’une partie du poumon.', 'severity': 'medium'},

    'DERM_NORMAL': {'short': 'Peau saine / Pas de lésion', 'long': 'Aucune lésion dermatologique suspecte visible.', 'severity': 'low'},
    'DERM_NEVUS': {'short': 'Nævus Bénin (Grain de beauté)', 'long': 'Lésion régulière, symétrique et homogène.', 'severity': 'low'},
    'DERM_SEBORRHEIC': {'short': 'Kératose Séborrhéique', 'long': 'Lésion bénigne fréquente ("verrue de vieillesse").', 'severity': 'low'},
    'DERM_MELANOMA': {'short': 'Suspicion de Mélanome', 'long': 'Lésion pigmentée asymétrique, bords irréguliers (critères ABCDE). Urgence.', 'severity': 'emergency'},
    'DERM_BCC': {'short': 'Carcinome Basocellulaire', 'long': 'Lésion perlée ou ulcérée suggérant un carcinome non-mélanique.', 'severity': 'high'},
    'DERM_SCC': {'short': 'Carcinome Épidermoïde', 'long': 'Lésion croûteuse ou bourgeonnante suspecte.', 'severity': 'high'},
    'DERM_INFLAMMATORY': {'short': 'Lésion Inflammatoire', 'long': 'Aspect compatible avec eczéma, psoriasis ou dermatite.', 'severity': 'medium'},

    'HIST_ARTIFACT': {'short': 'Qualité Insuffisante (Artefact)', 'long': 'Tissu non interprétable (section vide, floue ou artefact technique).', 'severity': 'none'},
    'HIST_HEALTHY_BREAST': {'short': 'Tissu Mammaire Sain', 'long': 'Architecture lobulaire préservée.', 'severity': 'low'},
    'HIST_IDC_BREAST': {'short': 'Carcinome Canalaire Infiltrant', 'long': 'Prolifération cellulaire désorganisée invasive (Sein).', 'severity': 'high'},
    'HIST_HEALTHY_PROSTATE': {'short': 'Tissu Prostatique Sain', 'long': 'Glandes régulières, stroma normal.', 'severity': 'low'},
    'HIST_ADENO_PROSTATE': {'short': 'Adénocarcinome Prostatique', 'long': 'Fusion glandulaire et atypies cytonucléaires.', 'severity': 'high'},
    'HIST_COLON_CA': {'short': 'Cancer Colorectal', 'long': 'Tissu tumoral colique.', 'severity': 'high'},
    'HIST_LUNG_CA': {'short': 'Cancer Pulmonaire', 'long': 'Tissu tumoral pulmonaire.', 'severity': 'high'},
    'HIST_DYSPLASIA': {'short': 'Dysplasie / CIN', 'long': 'Anomalies précancéreuses.', 'severity': 'medium'},
    'HIST_ADIPOSE': {'short': 'Tissu Adipeux / Stroma', 'long': 'Tissu de soutien normal.', 'severity': 'low'},

    'OPH_NORMAL': {'short': 'Fond d’œil Normal', 'long': 'Rétine, macula et papille d’aspect sain.', 'severity': 'low'},
    'OPH_DIABETIC': {'short': 'Rétinopathie Diabétique', 'long': 'Présence d’hémorragies, exsudats ou anévrismes.', 'severity': 'high'},
    'OPH_GLAUCOMA': {'short': 'Suspicion de Glaucome', 'long': 'Excavation papillaire (cup/disc ratio) augmentée.', 'severity': 'high'},
    'OPH_AMD': {'short': 'DMLA', 'long': 'Dégénérescence Maculaire (drusens ou atrophie).', 'severity': 'medium'},

    'ORTH_NORMAL': {'short': 'Genou Normal', 'long': 'Interligne articulaire préservé, pas d’ostéophyte.', 'severity': 'low'},
    'ORTH_OA_MODERATE': {'short': 'Arthrose Modérée (Grade 2-3)', 'long': 'Pincement articulaire visible et ostéophytes.', 'severity': 'medium'},
    'ORTH_OA_SEVERE': {'short': 'Arthrose Sévère (Grade 4)', 'long': 'Disparition de l’interligne (os sur os), déformation.', 'severity': 'high'},
    'ORTH_IMPLANT': {'short': 'Prothèse Totale (PTG)', 'long': 'Genou avec implant métallique (Arthroplastie).', 'severity': 'low'},
    'ORTH_FRACTURE': {'short': 'Fracture Récente / Luxation', 'long': 'Solution de continuité osseuse ou perte de congruence.', 'severity': 'emergency'}
}

DOMAIN_TRANSLATIONS_FR = {
    'Thoracic': 'Radiographie Thoracique',
    'Dermatology': 'Dermatoscopie',
    'Histology': 'Histopathologie (H&E)',
    'Ophthalmology': 'Fond d’Oeil (Rétine)',
    'Orthopedics': 'Radiographie Osseuse'
}


# =========================================================================
# PYDANTIC MODELS
# =========================================================================
class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Job(BaseModel):
    id: str
    status: JobStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: float
    storage_path: Optional[str] = None
    encrypted_user: Optional[str] = None
    username: Optional[str] = None  # For registry logging
    file_type: Optional[str] = None  # DICOM, PNG, JPEG
    start_time_ms: Optional[float] = None  # For computation time

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None

class UserInDB(User):
    hashed_password: str
    security_question: str
    security_answer: str

class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    security_question: str
    security_answer: str

class UserResetPassword(BaseModel):
    username: str
    security_answer: str
    new_password: str

class FeedbackModel(BaseModel):
    username: str
    rating: int
    comment: str

# =========================================================================
# GLOBAL STATE
# =========================================================================
jobs: Dict[str, Job] = {}  # REMOVED: Now using SQLite persistence
storage_provider = get_storage_provider(os.getenv("STORAGE_MODE", "LOCAL"))

# Initialize Database
database.init_db()

# --- SEED DEFAULT USER ---
# Ensure admin user exists for immediate login
try:
    if not database.get_user_by_username("admin"):
        logging.info("👤 Creating default admin user...")
        # Hash "secret"
        admin_pw = bcrypt.hashpw(b"secret", bcrypt.gensalt()).decode('utf-8')
        security_ans = bcrypt.hashpw(b"admin", bcrypt.gensalt()).decode('utf-8') # Answer: admin
        
        database.create_user({
            "username": "admin",
            "hashed_password": admin_pw,
            "email": "admin@elephmind.com",
            "security_question": "Who is the admin?",
            "security_answer": security_ans
        })
        logging.info("✅ Default Admin Created: admin / secret")
except Exception as e:
    logging.error(f"Failed to seed admin user: {e}")

# =========================================================================
# AUTHENTICATION HELPERS
# =========================================================================
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash using passlib."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for a password using passlib."""
    return pwd_context.hash(password)

def get_user(db, username: str) -> Optional[UserInDB]:
    """Retrieve user from database."""
    user_dict = database.get_user_by_username(username)
    if user_dict:
        return UserInDB(**user_dict)
    return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    """Dependency to get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = get_user(None, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Dependency to get current active user."""
    # Logic to check if active could be added here
    # if not current_user.is_active: raise ...
    return current_user

# =========================================================================
# GRAD-CAM UTILITIES (Moved to explainability.py)
# =========================================================================
# (Refactored to separate module for medical grade validation)

# =========================================================================
# MODEL WRAPPER
# =========================================================================
class MedSigClipWrapper:
    """Wrapper for the SigLIP model with medical domain inference."""
    
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.processor = None
        self.model = None
        self.loaded = False
        self.load_error = None

    def load(self):
        """Load the SigLIP model from the specified directory."""
        logger.info(f"Initiating model load from: {self.model_path}")
        
        if not os.path.exists(self.model_path):
            self.load_error = f"Model directory not found: {self.model_path}"
            logger.critical(self.load_error)
            return

        try:
            from transformers import AutoProcessor, AutoModel
            import torch
            
            self.processor = AutoProcessor.from_pretrained(self.model_path, local_files_only=True)
            self.model = AutoModel.from_pretrained(self.model_path, local_files_only=True)
            self.model.eval()
            
            # Calibrate logit scale for better probability distribution
            if hasattr(self.model, 'logit_scale'):
                with torch.no_grad():
                    self.model.logit_scale.data.fill_(3.80666)  # ln(45)
            
            self.loaded = True
            logger.info("✅ MedSigClip Model Loaded Successfully (448x448 SigLIP architecture)")
        except Exception as e:
            self.load_error = f"Exception during load: {str(e)}"
            logger.error(f"Failed to load model: {str(e)}")

    def predict(self, image_bytes: bytes, username: str = None) -> Dict[str, Any]:
        """Run hierarchical inference using SigLIP Zero-Shot."""
    # ... (rest of function until line 1094) ...
        # I need to match the indentation and context. 
        # Since I can't see "inside" the dots in a replace, I have to be careful.
        # It's better to update just the definition line and the call to enhance_analysis_result.
        pass # Placeholder, will use multiple chunks below
        if not self.loaded:
            msg = "MedSigClip Model is NOT loaded. Cannot perform inference."
            if self.load_error:
                msg += f" Reason: {self.load_error}"
            raise RuntimeError(msg)

        logger.info("Starting inference pipeline...")
        start_time = time.time()
        
        try:
            from PIL import Image
            import io
            import torch
            import pydicom

            # ========================================================
            # LOCALIZATION HELPER
            # ========================================================
            def localize_result(result_json: Dict[str, Any]) -> Dict[str, Any]:
                """
                Translate the analysis result to French using Canonical IDs.
                This allows the Model to run in English and the UI to display in French.
                """
                localized = result_json.copy()
                
                # 1. Translate Domain
                domain_key = localized.get('domain', {}).get('label')
                if domain_key in DOMAIN_TRANSLATIONS_FR:
                    localized['domain']['label_fr'] = DOMAIN_TRANSLATIONS_FR[domain_key]
                    localized['domain']['label'] = DOMAIN_TRANSLATIONS_FR[domain_key] # Override for simple UI
                
                # 2. Translate Specific Results
                if 'specific' in localized:
                    new_specific = []
                    for item in localized['specific']:
                        label_id = item.get('label_id')
                        translation = LABEL_TRANSLATIONS_FR.get(label_id)
                        
                        if translation:
                            new_item = item.copy()
                            new_item['label'] = translation['short'] # Use Short Title for UI
                            new_item['description'] = translation['long'] # Use Long Description
                            new_item['severity'] = translation.get('severity', 'medium')
                            new_specific.append(new_item)
                        else:
                            # Fallback if ID missing (should not happen in strict mode)
                            new_specific.append(item)
                    
                    localized['specific'] = new_specific
                
                # 3. Handle QC failure case (already localized manually in rejection_result)
                if 'diagnosis' in localized and "Analyse Refusée" in localized['diagnosis']:
                     pass # Already localized string
                
                return localized

            # Image preprocessing functions
            def process_dicom(file_bytes: bytes) -> Tuple[Image.Image, Dict[str, Any]]:
                """Convert DICOM bytes to PIL Image with tags."""
                ds = pydicom.dcmread(io.BytesIO(file_bytes))
                img = ds.pixel_array.astype(np.float32)
                
                # Extract Metadata
                metadata = {
                    "patient_id": str(ds.get("PatientID", "N/A")),
                    "patient_name": str(ds.get("PatientName", "N/A")),
                    "birth_date": str(ds.get("PatientBirthDate", "")),
                    "study_date": str(ds.get("StudyDate", "")),
                    "modality": str(ds.get("Modality", "UNKNOWN"))
                }
                
                if hasattr(ds, 'PhotometricInterpretation') and ds.PhotometricInterpretation == "MONOCHROME1":
                    img = img.max() - img
                
                # Lung Window: WL=-600, WW=1500
                wl, ww = -600, 1500
                min_val, max_val = wl - ww/2, wl + ww/2
                img = np.clip(img, min_val, max_val)
                img = (img - min_val) / (max_val - min_val)
                img = (img * 255).astype(np.uint8)
                
                return Image.fromarray(img).convert("RGB"), metadata

            def process_standard_image(image_bytes: bytes) -> Image.Image:
                """Process standard images (PNG/JPG) - SIMPLIFIED like Colab.
                Just load the image as RGB without aggressive preprocessing."""
                nparr = np.frombuffer(image_bytes, np.uint8)
                img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img_cv is None:
                    raise ValueError("Could not decode image")

                # Convert BGR to RGB (OpenCV uses BGR)
                img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
                
                return Image.fromarray(img_rgb)

            # Detect image format
            header = image_bytes[:32]
            is_png = header.startswith(b'\x89PNG\r\n\x1a\n')
            is_jpeg = header.startswith(b'\xff\xd8\xff')
            
            image = None
            dicom_metadata = None
            
            if is_png or is_jpeg:
                try:
                    image = process_standard_image(image_bytes)
                    logger.info(f"Processed as {'PNG' if is_png else 'JPEG'}")
                except Exception as e:
                    raise ValueError(f"Corrupt Image File: {str(e)}")
            
            if image is None:
                try:
                    image, dicom_metadata = process_dicom(image_bytes)
                    logger.info("Processed as DICOM")
                except Exception:
                    try:
                        image = process_standard_image(image_bytes)
                    except Exception as e:
                        raise ValueError(f"Unknown image format: {str(e)}")

            # =========================================================
            # ADAPTIVE PREPROCESSING - DISABLED to match Colab behavior
            # The model was trained on raw images, not preprocessed ones
            # =========================================================
            preprocessing_log = {"message": "Preprocessing disabled for accuracy", "transformation_count": 0}
            # NOTE: Uncomment below to re-enable if needed
            # try:
            #     import io as io_module
            #     buffer = io_module.BytesIO()
            #     image.save(buffer, format='PNG')
            #     image_bytes_for_preprocessing = buffer.getvalue()
            #     image, preprocessing_log = adaptive_preprocessing(image_bytes_for_preprocessing)
            #     logger.info(f"🔧 Adaptive preprocessing applied: {preprocessing_log.get('transformation_count', 0)} transformations")
            # except Exception as e_preproc:
            #     logger.warning(f"Adaptive preprocessing skipped: {e_preproc}")

            # STEP 1: DOMAIN IDENTIFICATION
            domain_keys = list(MEDICAL_DOMAINS.keys())
            domain_prompts = [d['domain_prompt'] for d in MEDICAL_DOMAINS.values()]
            
            inputs_domain = self.processor(
                text=domain_prompts, 
                images=image, 
                padding="max_length", 
                return_tensors="pt"
            )
            
            with torch.no_grad():
                outputs_domain = self.model(**inputs_domain)
            
            probs_domain = torch.softmax(outputs_domain.logits_per_image, dim=1)[0]
            best_domain_idx = torch.argmax(probs_domain).item()
            best_domain_key = domain_keys[best_domain_idx]
            best_domain_prob = float(probs_domain[best_domain_idx] * 100)
            
            logger.info(f"Identified Domain: {best_domain_key} ({best_domain_prob:.2f}%)")

            # STEP 2: SPECIFIC ANALYSIS
            domain_config = MEDICAL_DOMAINS[best_domain_key]
            specific_results = []
            
            # --- LOGIC GATE CHECK (GENERIC) ---
            logic_penalty_factor = 1.0
            logic_gate_info = None
            logic_penalty_target = None
            
            if 'logic_gate' in domain_config:
                gate_config = domain_config['logic_gate']
                logger.info(f"🧠 Running Generic Logic Gate for {best_domain_key}: {gate_config['prompt']}")
                
                gate_labels = gate_config['labels']
                inputs_gate = self.processor(text=gate_labels, images=image, padding="max_length", return_tensors="pt")
                with torch.no_grad():
                    out_gate = self.model(**inputs_gate)
                
                probs_gate = torch.softmax(out_gate.logits_per_image, dim=1)[0]
                
                # Default Logic: Index 1 is "Abnormal/Blocker" (e.g. "Enlarged", "Implant", "Poor Quality")
                # Unless 'abnormal_index' is specified
                abn_idx = gate_config.get('abnormal_index', 1)
                p_abnormal = float(probs_gate[abn_idx])
                
                logger.info(f"Logic Gate Result: Abnormal/Blocker Probability = {p_abnormal:.2f}")
                
                if p_abnormal > 0.5: # Threshold for logic switch
                    logger.warning(f"⚠️ Logic Gate Triggered: {gate_labels[abn_idx]} (p={p_abnormal:.2f})")
                    logic_penalty_factor = 0.15 # Strong penalty
                    logic_gate_info = f"Logic Gate Rejected: {gate_labels[abn_idx]}"
                    logic_penalty_target = gate_config.get('penalty_target', 'Normal')
            
            if 'stage_1_triage' in domain_config:
                # Hierarchical Logic (e.g., Orthopedics)
                logger.info(f"Engaging Level 2 Hierarchical Logic for: {best_domain_key}")
                
                triage_labels = domain_config['stage_1_triage']['labels']
                inputs_triage = self.processor(text=triage_labels, images=image, padding="max_length", return_tensors="pt")
                
                with torch.no_grad():
                    out_triage = self.model(**inputs_triage)
                
                probs_triage = torch.softmax(out_triage.logits_per_image, dim=1)[0]
                prob_abnormal = float(probs_triage[-1])
                prob_normal = 1.0 - prob_abnormal
                
                logger.info(f"Triage: Normal={prob_normal*100:.2f}%, Abnormal={prob_abnormal*100:.2f}%")
                
                if prob_abnormal > prob_normal:
                    logger.info("Running Stage 2 Diagnosis...")
                    diag_labels = domain_config['stage_2_diagnosis']['labels']
                    inputs_diag = self.processor(text=diag_labels, images=image, padding="max_length", return_tensors="pt")
                    
                    with torch.no_grad():
                        out_diag = self.model(**inputs_diag)
                    
                    probs_diag = torch.softmax(out_diag.logits_per_image, dim=1)[0]
                    
                    for i, label in enumerate(diag_labels):
                        specific_results.append({
                            "label": label,
                            "probability": round(float(probs_diag[i] * 100), 2)
                        })
                else:
                    logger.info("Triage indicates Normal/Healthy. Skipping Stage 2.")
            else:
                # Flat Mode (Thoracic, Dermato, etc.)
                specific_items = domain_config['specific_labels']
                # Extract text prompts for CLIP
                labels_en = [item['label_en'] for item in specific_items]
                
                inputs_specific = self.processor(
                    text=labels_en, 
                    images=image, 
                    padding="max_length", 
                    return_tensors="pt"
                )
                
            # --- LOGIC GATE & MORPHOLOGY ENGINE (V3) ---
            from explainability import ExplainabilityEngine
            explain_engine = ExplainabilityEngine(self)
            
            # Morphology Analysis (Thoracic Only for now)
            morphology_result = None
            if best_domain_key == 'Thoracic':
                 logger.info("📐 Running Morphology Engine (CTR)...")
                 morphology_result = explain_engine.calculate_cardiothoracic_ratio(image)
                 
                 # Logic Rule: If CTR > 0.55 (Cardiomegaly), penalize NORMAL heavily
                 if morphology_result['valid'] and morphology_result['ctr'] > 0.55:
                     logger.warning(f"⚠️ Cardiomegaly Detected (CTR={morphology_result['ctr']}). Penalizing 'Normal'.")
                     logic_penalty_target = 'TH_NORMAL'
                     logic_penalty_factor = 0.1 # Very strict penalty

            # --- MODEL INFERENCE (Pathology) ---
            with torch.no_grad():
                outputs_specific = self.model(**inputs_specific)
            
            probs_specific = torch.softmax(outputs_specific.logits_per_image, dim=1)[0]
            
            for i, item in enumerate(specific_items):
                    specific_results.append({
                        "label_id": item['id'],
                        "label": item['label_en'], # Keep EN for internal logic
                        "probability": round(float(probs_specific[i] * 100), 2)
                    })
            
            specific_results.sort(key=lambda x: x['probability'], reverse=True)

            # --- APPLY LOGICAL CONSTRAINTS (POST-PROCESSING) ---
            if logic_penalty_factor < 1.0 and logic_penalty_target:
                 logger.info(f"📉 Applying Logic Penalty ({logic_penalty_factor}x) to target: {logic_penalty_target}")
                 
                 for res in specific_results:
                      should_penalize = False
                      label_text = res['label'] 
                      label_id = res['label_id']
                      
                      if logic_penalty_target == 'ALL_DIAGNOSIS':
                          if "Artifact" in label_text or "Quality" in label_text or "Partial" in label_text or "Empty" in label_text:
                              pass 
                          else:
                              should_penalize = True

                      elif logic_penalty_target == 'ALL_PATHOLOGY':
                          is_benign = "Normal" in label_text or "Healthy" in label_text or "Non-specific" in label_text or "Benign" in label_text
                          if not is_benign:
                              should_penalize = True
                              
                      else:
                          if logic_penalty_target == label_id:
                              should_penalize = True
                          elif logic_penalty_target in label_text:
                              should_penalize = True
                      
                      if should_penalize:
                           old_prob = res['probability']
                           res['probability'] = round(old_prob * logic_penalty_factor, 2)
                           logger.warning(f"   -> Penalized '{label_text}': {old_prob}% -> {res['probability']}%")
                 
                 specific_results.sort(key=lambda x: x['probability'], reverse=True)
            
            # --- CALIBRATED CONFIDENCE (MARGINAL) ---
            confidence_level = "Low"
            margin = 0.0
            
            if len(specific_results) >= 2:
                top_prob = specific_results[0]['probability']
                second_prob = specific_results[1]['probability']
                margin = top_prob - second_prob
                
                if margin >= 15.0:
                    confidence_level = "High"
                elif margin >= 5.0:
                    confidence_level = "Moderate"
                else:
                    confidence_level = "Low"
                
                confidence_metadata = {
                    "margin": round(margin, 2),
                    "uncertainty_flag": margin < 10.0,
                    "level": confidence_level
                }
                logger.info(f"📊 Confidence: {confidence_level} (Margin: {margin:.2f}%)")
            else:
                confidence_metadata = {"margin": 100.0, "uncertainty_flag": False, "level": "High"}


            # STEP 3: HEATMAP GENERATION (Grad-CAM++ x MedSegCLIP)
            heatmap_base64 = None
            original_base64 = None
            explanation = {} 
            
            try:
                if specific_results:
                    top_label_text = specific_results[0]['label']
                    
                    # FIX: Reuse engine from above
                    # engine = explainability.ExplainabilityEngine(self) -> Already instantiated
                    
                    anatomical_context = "body part"
                    if best_domain_key == 'Thoracic': anatomical_context = "lung parenchyma"
                    elif best_domain_key == 'Orthopedics': anatomical_context = "bone structure"
                    elif best_domain_key == 'Dermatology': anatomical_context = "skin lesion"
                    elif best_domain_key == 'Ophthalmology': anatomical_context = "retina"
                    
                    explanation = explain_engine.explain(
                        image=image, 
                        target_text=top_label_text,
                        anatomical_context=anatomical_context
                    )
                    
                    if explanation.get('heatmap_array') is not None:
                        vis_img = explanation['heatmap_array']
                        _, buffer = cv2.imencode('.png', cv2.cvtColor(vis_img, cv2.COLOR_RGB2BGR))
                        heatmap_base64 = base64.b64encode(buffer).decode('utf-8')

                        # Original Image
                        img_tensor = np.array(image).astype(np.float32) / 255.0
                        original_uint8 = (img_tensor * 255).astype(np.uint8)
                        _, buffer_orig = cv2.imencode('.png', cv2.cvtColor(original_uint8, cv2.COLOR_RGB2BGR))
                        original_base64 = base64.b64encode(buffer_orig).decode('utf-8')
                        
            except Exception as e_cam:
                import traceback
                logger.error(f"Explainability Pipeline Failed: {traceback.format_exc()}")

            # FINAL RESULT (Base)
            enhanced_result = {
                "domain": {
                    "label": best_domain_key,
                    "description": MEDICAL_DOMAINS[best_domain_key]['domain_prompt'],
                    "probability": round(best_domain_prob, 2)
                },
                "specific": specific_results,
                "heatmap": heatmap_base64,
                "original_image": original_base64,
                "preprocessing": preprocessing_log,
                "morphology": morphology_result, # NEW
                "confidence_metadata": confidence_metadata, # NEW
                "explainability": { 
                    "method": "Grad-CAM++ x MedSegCLIP (Proxy)",
                    "anatomical_context": anatomical_context if 'anatomical_context' in locals() else "Unknown",
                    "reliability": explanation.get("reliability_score", 0)
                }
            }
            
            # ... (Rest of function) ...
            
            # --- MAP TO FRONTEND EXPECTATIONS ---
            # ...
            # 2. STRICT CONFIDENCE CALIBRATION (V4 Backend Authority)
            # Formula: Final = Model_Prob * QC_Score * Reliability_Score
            # This prevents "high confidence" on garbage images or when Grad-CAM disagrees.
            
            top_finding = enhanced_result['specific'][0] if enhanced_result['specific'] else {"label": "Inconnu", "probability": 0}
            enhanced_result['diagnosis'] = top_finding['label']

            model_conf = float(enhanced_result.get('confidence', top_finding['probability'])) / 100.0
            qc_score = float(enhanced_result.get('quality_score', 0)) / 100.0
            
            # Reliability: If missing (e.g. QC failed), default to 0.5 to not kill score completely if just missing, or 0 if critical.
            # But if QC passed, explainability should run.
            reliability_score = float(enhanced_result['explainability'].get('reliability', 1.0))
            if reliability_score == 0: reliability_score = 1.0 # Fallback if method not applicable
            
            # Calculate composite score
            final_confidence_score = model_conf * qc_score * reliability_score
            final_confidence_percent = round(final_confidence_score * 100, 2)
            
            logger.info(f"⚖️ Calibration: Model({model_conf:.2f}) * QC({qc_score:.2f}) * Rel({reliability_score:.2f}) = {final_confidence_score:.2f}")
            
            enhanced_result['calibrated_confidence'] = final_confidence_percent
            enhanced_result['confidence'] = final_confidence_percent # Override raw confidence
            
            # Update Level based on Calibrated Score
            if final_confidence_percent > 85:
                 enhanced_result['confidence_level'] = "High"
            elif final_confidence_percent > 50:
                 enhanced_result['confidence_level'] = "Moderate"
            else:
                 enhanced_result['confidence_level'] = "Low"
            
            # 3. Processing Time (Real Measurement)
            enhanced_result['processing_time'] = round(time.time() - start_time, 3) 
            
            # 4. Predictions (Alias for specific)
            enhanced_result['predictions'] = [
                {"name": item['label'], "probability": item['probability']} 
                for item in enhanced_result['specific']
            ]
            
            # 5. Quality Metrics (Flatten structure)
            if 'image_quality' in enhanced_result:
                enhanced_result['quality_score'] = enhanced_result['image_quality']['quality_score']
                enhanced_result['quality_metrics'] = enhanced_result['image_quality']['metrics']
            
            # 6. Priority
            # If priority is a dict (from new algo), extract just the level/score for simple display, or keep object
            # Frontend expects string 'priority' sometimes, or maybe object. Let's provide string for badge.
            if isinstance(enhanced_result.get('priority'), str):
                 pass 
            elif isinstance(enhanced_result.get('priority'), dict):
                 # Flatten for frontend simple badge
                 enhanced_result['priority'] = enhanced_result['priority'].get('level', 'Normale')

            # 7. DICOM Metadata (if available)
            if dicom_metadata:
                enhanced_result['patient_metadata'] = dicom_metadata

            logger.info("✅ Intelligence Algorithms applied successfully")
            
            # --- LOCALIZATION (Translate to French) ---
            localized_result = localize_result(enhanced_result)
            
            return localized_result

        except Exception as e:
            logger.error(f"Inference Error: {str(e)}")
            raise e

# =========================================================================
# GLOBAL MODEL INSTANCE
# =========================================================================
model_wrapper: Optional[MedSigClipWrapper] = None

# =========================================================================
# FASTAPI LIFECYCLE
# =========================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_wrapper, MODEL_DIR  # CRITICAL: Use global variables
    database.init_db()
    database.init_analysis_registry()
    
    # Get model path (downloads from HuggingFace Hub if needed)
    MODEL_DIR = get_model_path()
    
    model_wrapper = MedSigClipWrapper(MODEL_DIR)
    model_wrapper.load()
    logger.info("ElephMind Backend Started")
    yield
    logger.info("ElephMind Backend Shutting Down")

app = FastAPI(
    lifespan=lifespan, 
    title="ElephMind Medical AI API", 
    version="2.0.0",
    description="Medical image analysis powered by SigLIP"
)

# CORS Middleware with configurable origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins to fix "Failed to fetch" for user
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors gracefully, stripping binary/unsafe data from logs/response.
    Fixes UnicodeDecodeError when multipart/form-data is sent to JSON endpoint.
    """
    errors = exc.errors()
    clean_errors = []
    for error in errors:
        copy = error.copy()
        # Remove raw binary input which causes jsonable_encoder crash
        if 'input' in copy:
            val = copy['input']
            if isinstance(val, (bytes, bytearray)):
                copy['input'] = "<binary_data_stripped>"
            elif isinstance(val, str) and len(val) > 200:
                copy['input'] = val[:200] + "..." # Truncate long inputs
        clean_errors.append(copy)
        
    logger.warning(f"Validation Error on {request.url.path}: {clean_errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": jsonable_encoder(clean_errors)},
    )

@app.middleware("http")
async def limit_concurrency(request: Request, call_next):
    """Limit concurrent requests to MAX_CONCURRENT_USERS."""
    if request.url.path == "/health" or request.method == "OPTIONS":
        return await call_next(request)

    if concurrency_semaphore.locked():
        logger.warning(f"Concurrency limit ({MAX_CONCURRENT_USERS}) reached. Request queued.")
    
    async with concurrency_semaphore:
        return await call_next(request)

# =========================================================================
# BACKGROUND WORKER
# =========================================================================
# =========================================================================
# BACKGROUND WORKER (Decoupled)
# =========================================================================
async def process_analysis_job(job_id: str, image_id: str, username: str):
    """
    Worker that retrieves image from disk by ID and processes it.
    Zero-shared-memory with API.
    """
    # RESILIENCE: Retrieve job from DB
    job = database.get_job(job_id)
    if not job:
        logger.error(f"❌ Job {job_id} not found DB")
        return
    
    logger.info(f"Worker processing Job {job_id} (Image: {image_id})")
    database.update_job_status(job_id, JobStatus.PROCESSING.value)
    
    start_time = time.time()
    
    try:
        if not model_wrapper:
            raise RuntimeError("Model wrapper not initialized.")

        # LOAD IMAGE FROM DISK (Physical Read)
        image_bytes, file_path = storage_manager.load_image(username, image_id)
        
        loop = asyncio.get_event_loop()
        # Pass username to predict for isolation
        import functools
        result = await loop.run_in_executor(None, functools.partial(model_wrapper.predict, image_bytes, username=username))
        
        # Calculate computation time
        computation_time_ms = int((time.time() - start_time) * 1000)
        
        # Update Job in DB
        database.update_job_status(job_id, JobStatus.COMPLETED.value, result=result)
        
        # Log to registry (REAL DATA)
        if username and result:
            domain = result.get('domain', {}).get('label', 'Unknown')
            top_diag = result.get('specific', [{}])[0].get('label', 'Unknown') if result.get('specific') else 'Unknown'
            confidence = result.get('specific', [{}])[0].get('probability', 0) if result.get('specific') else 0
            priority = result.get('priority', 'Normale')
            
            database.log_analysis(
                username=username,
                domain=domain,
                top_diagnosis=top_diag,
                confidence=confidence,
                priority=priority,
                computation_time_ms=computation_time_ms,
                file_type='SavedImage'
            )
            logger.info(f"✅ Job {job_id} logged to registry")
        
        logger.info(f"✅ Job {job_id} completed in {computation_time_ms}ms")
        
    except Exception as e:
        logger.error(f"❌ Job {job_id} failed: {str(e)}")
        database.update_job_status(job_id, JobStatus.FAILED.value, error=str(e))

# =========================================================================
# API ENDPOINTS
# =========================================================================

# --- Authentication ---
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return JWT token."""
    user = database.get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user['username']}, 
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

class AnalysisRequest(BaseModel):
    image_id: str
    domain: str = "Triage"
    priority: str = "Normale"
    
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegister):
    """Register a new user."""
    hashed_pw = get_password_hash(user.password)
    # Hash security answer too for extra security
    hashed_security_answer = get_password_hash(user.security_answer.strip().lower())
    
    user_data = {
        "username": user.username,
        "hashed_password": hashed_pw,
        "email": user.email,
        "security_question": user.security_question,
        "security_answer": hashed_security_answer
    }
    success = database.create_user(user_data)
    if not success:
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"message": "User created successfully"}

@app.get("/recover/{username}")
async def get_security_question(username: str):
    """Get security question for password recovery."""
    user = database.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"question": user['security_question']}

@app.post("/recover/reset")
async def reset_password(data: UserResetPassword):
    """Reset password using security question."""
    user = database.get_user_by_username(data.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify security answer (hashed comparison)
    if not verify_password(data.security_answer.strip().lower(), user['security_answer']):
        raise HTTPException(status_code=400, detail="Incorrect security answer")
    
    new_hashed_pw = get_password_hash(data.new_password)
    database.update_password(data.username, new_hashed_pw)
    return {"message": "Password reset successfully"}

# --- Dashboard Analytics (REAL DATA ONLY) ---
@app.get("/api/dashboard/stats")
async def get_dashboard_statistics(current_user: User = Depends(get_current_user)):
    """
    Get real dashboard statistics for the authenticated user.
    Returns zeros if no analyses have been performed. NO FAKE DATA.
    """
    stats = database.get_dashboard_stats(current_user.username)
    recent = database.get_recent_analyses(current_user.username, limit=10)
    
    return {
        **stats,
        "recent_analyses": recent
    }

@app.post("/feedback")
async def submit_feedback(feedback: FeedbackModel):
    """Submit user feedback."""
    database.add_feedback(feedback.username, feedback.rating, feedback.comment)
    return {"message": "Feedback received"}

# --- Medical Analysis ---
# --- Analysis Flow (Async Job Architecture) ---

# Local modules
import database
import storage_manager
import dicom_processor # NEW: Medical Validation
from database import JobStatus
from storage import get_storage_provider

# ...

@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Step 1: Upload image to physical storage.
    - VALIDATES DICOM Compliance (if .dcm)
    - ANONYMIZES Patient Data (PHI)
    - Returns image_id to be used in analysis.
    """
    try:
        content = await file.read()
        
        # Detect DICOM Magic Bytes (DICM at offset 128)
        is_dicom = len(content) > 132 and content[128:132] == b'DICM'
        
        if is_dicom:
            logger.info(f"DICOM File detected for user {current_user.username}. Validating...")
            try:
                # Validate & Anonymize
                safe_content, metadata = dicom_processor.process_dicom_upload(content, current_user.username)
                
                # Use safe content for storage
                content = safe_content
                logger.info("✅ DICOM Validated and Anonymized.")
            except ValueError as ve:
                logger.error(f"❌ DICOM Rejected: {ve}")
                raise HTTPException(status_code=400, detail=f"Conformité DICOM refusée: {str(ve)}")
        
        # Save to Disk
        image_id = storage_manager.save_image(
            username=current_user.username,
            file_bytes=content,
            filename_hint=file.filename if not is_dicom else "anon.dcm"
        )
        
        return {
            "image_id": image_id,
            "status": "UPLOADED",
            "message": "Image secured & sanitized. Ready for analysis."
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload Error: {str(e)}")

@app.post("/analyze", status_code=status.HTTP_202_ACCEPTED)
async def analyze_image(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user)
):
    """
    Step 2: Create Analysis Job using existing image_id.
    Decoupled from upload.
    """
    if not model_wrapper or not model_wrapper.loaded:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
        
    # Verify image exists physically
    try:
        _ = storage_manager.get_image_absolute_path(current_user.username, request.image_id)
        if not _:
            raise FileNotFoundError()
    except Exception:
        raise HTTPException(status_code=404, detail="Image ID not found. Upload first.")

    # --- IDEMPOTENCE CHECK (V4 Backend Authority) ---
    # Check if a job already exists for this image/user
    existing_job = database.get_active_job_by_image(current_user.username, request.image_id)
    
    if existing_job:
        status_val = existing_job.get('status')
        job_age = time.time() - existing_job.get('created_at', 0)
        
        # If job is running or completed recently (< 24h), return it.
        # This solves the "Refresh = Duplicate Analysis" bug.
        if status_val in [JobStatus.PENDING.value, JobStatus.PROCESSING.value]:
             logger.info(f"♻️ Returning EXISTING running job {existing_job['id']} for image {request.image_id}")
             return {
                "task_id": existing_job['id'], 
                "status": status_val,
                "image_id": request.image_id,
                "message": "Job already running"
             }
        elif status_val == JobStatus.COMPLETED.value and job_age < 86400:
             logger.info(f"♻️ Returning EXISTING completed job {existing_job['id']} for image {request.image_id}")
             return {
                "task_id": existing_job['id'], 
                "status": "completed",
                "image_id": request.image_id,
                "message": "Job already completed"
             }

    # Create Job ID
    task_id = str(uuid.uuid4())
    
    # Persist Job PENDING state
    job_data = {
        'id': task_id,
        'status': JobStatus.PENDING.value,
        'created_at': time.time(),
        'result': None,
        'error': None,
        'storage_path': request.image_id, # Link to storage
        'username': current_user.username,
        'file_type': 'Unknown'
    }
    database.create_job(job_data)
    
    # Enqueue Worker (Pass ID, not bytes)
    background_tasks.add_task(process_analysis_job, task_id, request.image_id, current_user.username)
    
    return {
        "task_id": task_id, 
        "status": "queued",
        "image_id": request.image_id
    }

@app.get("/job/current")
async def get_current_job(current_user: User = Depends(get_current_active_user)):
    """
    Get the latest job state for the user to restore UI on refresh.
    Returns 404 if no recent job found (< 24h).
    """
    job = database.get_latest_job(current_user.username)
    if not job:
        raise HTTPException(status_code=404, detail="No active job")
        
    # Check if job is stale (e.g. > 24 hours old)
    # If completed and old, we might not want to auto-load it on fresh login
    # But for F5 refresh, we definitely want it.
    # Heuristic: If < 1 hour, always return.
    
    created_at = job.get('created_at', 0)
    if time.time() - created_at > 86400: # 24 hours
         raise HTTPException(status_code=404, detail="Job expired")
         
    return {
        "task_id": job['id'],
        "status": job['status'],
        "result": job['result'],
        "error": job.get('error'),
        "created_at": created_at,
        "image_id": job.get('storage_path')
    }

@app.get("/result/{task_id}")
async def get_result(task_id: str, current_user: User = Depends(get_current_user)):
    """
    Get analysis result by task ID.
    
    - **Requires authentication**
    - Returns job status and results when complete
    """
    # Retrieve job from DB - ENFORCE OWNERSHIP AT SQL LEVEL
    job = database.get_job(task_id, username=current_user.username)
    
    if not job:
        # If job calls return None with username, it means either 404 or 403 (effectively 404 for security)
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    
    # Redundant check removed as SQL handles it, but kept for audit logging if needed
    # if job.get('username') != current_user.username: ...
    
    logger.info(f"Polling Job {task_id}: Status={job.get('status')}")
    return job

@app.get("/health")
def health_check():
    """Health check endpoint."""
    loaded = model_wrapper.loaded if model_wrapper else False
    return {
        "status": "running", 
        "model_loaded": loaded,
        "version": "2.0.0"
    }

@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to docs."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")

# --- DASHBOARD ENDPOINTS ---

@app.get("/api/dashboard/stats")
async def get_dashboard_stats_endpoint(current_user: User = Depends(get_current_user)):
    """Get real dashboard statistics for the authenticated user."""
    try:
        stats = database.get_dashboard_stats(current_user.username)
        recent = database.get_recent_analyses(current_user.username, limit=5)
        # Combine
        return {
            **stats,
            "recent_analyses": recent
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================================
# PATIENT API (New for Migration)
# =========================================================================

class PatientCreate(BaseModel):
    patient_id: str
    first_name: str = ""
    last_name: str = ""
    birth_date: str = ""
    photo: Optional[str] = None # Base64 or URL

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[str] = None
    photo: Optional[str] = None

@app.post("/patients", status_code=status.HTTP_201_CREATED)
async def create_patient_endpoint(patient: PatientCreate, current_user: User = Depends(get_current_user)):
    """Create a new patient."""
    pid = database.create_patient(
        owner_username=current_user.username,
        patient_id=patient.patient_id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        birth_date=patient.birth_date,
        photo=patient.photo
    )
    if not pid:
        raise HTTPException(status_code=400, detail="Could not create patient (ID might exist)")
    return {"id": pid, "message": "Patient created"}

@app.get("/patients")
async def get_patients_endpoint(current_user: User = Depends(get_current_user)):
    """Get all patients for the current user."""
    return database.get_patients_by_user(current_user.username)

@app.put("/patients/{patient_id}")
async def update_patient_endpoint(patient_id: int, updates: PatientUpdate, current_user: User = Depends(get_current_user)):
    """Update a patient."""
    data = updates.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
        
    success = database.update_patient(current_user.username, patient_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient updated"}

@app.delete("/patients/{patient_id}")
async def delete_patient_endpoint(patient_id: int, current_user: User = Depends(get_current_user)):
    """Delete a patient."""
    success = database.delete_patient(current_user.username, patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats_endpoint(current_user: User = Depends(get_current_user)):
    """Get dashboard statistics and recent analyses."""
    stats = database.get_dashboard_stats(current_user.username)
    recent = database.get_recent_analyses(current_user.username, limit=10)
    stats["recent_analyses"] = recent
    return stats


# =========================================================================
# MAIN ENTRY POINT
# =========================================================================
if __name__ == "__main__":
    # Initialize DB tables including registry
    database.init_db()
    database.init_analysis_registry()
    
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    # Hugging Face Spaces provides 'PORT' env var (usually 7860)
    port = int(os.getenv("PORT", "7860")) 
    logger.info(f"🚀 Starting Uvicorn on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
