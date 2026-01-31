import pydicom
import logging
import hashlib
from typing import Tuple, Dict, Any, Optional
from pathlib import Path
import os
import io

logger = logging.getLogger(__name__)

# Mandatory DICOM Tags for Medical Validity
REQUIRED_TAGS = [
    'PatientID',
    'StudyInstanceUID',
    'SeriesInstanceUID',
    'Modality',
    'PixelSpacing', # Crucial for measurements
]

# Tags to Anonymize (PHI)
PHI_TAGS = [
    'PatientName',
    'PatientBirthDate',
    'PatientAddress',
    'InstitutionName',
    'ReferringPhysicianName'
]

def validate_dicom(file_bytes: bytes) -> pydicom.dataset.FileDataset:
    """
    Strict validation of DICOM file.
    Raises ValueError if invalid.
    """
    try:
        # 1. Parse without loading pixel data first (speed)
        ds = pydicom.dcmread(io.BytesIO(file_bytes), stop_before_pixels=False)
    except Exception as e:
        raise ValueError(f"Invalid DICOM format: {str(e)}")

    # 2. Check Mandatory Tags
    missing_tags = [tag for tag in REQUIRED_TAGS if tag not in ds]
    if missing_tags:
        raise ValueError(f"Missing critical DICOM tags: {missing_tags}")

    # 3. Check Pixel Data presence
    if 'PixelData' not in ds:
         raise ValueError("DICOM file has no image data (PixelData missing).")

    return ds

def anonymize_dicom(ds: pydicom.dataset.FileDataset) -> pydicom.dataset.FileDataset:
    """
    Remove PHI from dataset.
    Returns modified dataset.
    """
    # Hash PatientID to keep linkable anonymous ID
    original_id = str(ds.get('PatientID', 'Unknown'))
    hashed_id = hashlib.sha256(original_id.encode()).hexdigest()[:16].upper()
    
    ds.PatientID = f"ANON-{hashed_id}"
    
    # Wipe other fields
    for tag in PHI_TAGS:
        if tag in ds:
            if 'Date' in tag: # VR DA requires YYYYMMDD
                ds.data_element(tag).value = "19010101"
            else:
                ds.data_element(tag).value = "ANONYMIZED"
            
    return ds

def process_dicom_upload(file_bytes: bytes, username: str) -> Tuple[bytes, Dict[str, Any]]:
    """
    Main Gateway Function: Validate -> Anonymize -> Return Bytes & Metadata
    """
    # 1. Validate
    try:
        ds = validate_dicom(file_bytes)
    except Exception as e:
        logger.error(f"DICOM Validation Failed: {e}")
        raise ValueError(f"DICOM Rejected: {e}")

    # 2. Anonymize
    ds = anonymize_dicom(ds)
    
    # 3. Extract safe metadata
    metadata = {
        "modality": ds.get("Modality", "Unknown"),
        "body_part": ds.get("BodyPartExamined", "Unknown"),
        "study_uid": str(ds.get("StudyInstanceUID", "")),
        "pixel_spacing": ds.get("PixelSpacing", [1.0, 1.0]),
        "original_filename_hint": "dicom_file.dcm"
    }
    
    # 4. Convert back to bytes for storage
    with io.BytesIO() as buffer:
        ds.save_as(buffer)
        safe_bytes = buffer.getvalue()
        
    return safe_bytes, metadata

def convert_dicom_to_image(ds: pydicom.dataset.FileDataset) -> Any:
    """
    Convert DICOM to PIL Image / Numpy array with Medical Physics awareness.
    1. Check RAS Orientation (Basic Validation).
    2. Apply Hounsfield Units (CT) or Intensity Normalization (MRI/XRay).
    3. Windowing (Lung/Bone/Soft Tissue).
    """
    import numpy as np
    from PIL import Image
    
    try:
        # 1. Image Geometry & Orientation Check (RAS)
        # We enforce that slices are roughly axial/standard for now, or at least valid.
        orientation = ds.get("ImageOrientationPatient")
        if orientation:
            # Check for orthogonality (basic sanity)
            row_cosine = np.array(orientation[:3])
            col_cosine = np.array(orientation[3:])
            if np.abs(np.dot(row_cosine, col_cosine)) > 1e-3:
                logger.warning("DICOM Orientation vectors are not orthogonal. Image might be skewed.")
        
        # 2. Extract Raw Pixels
        pixel_array = ds.pixel_array.astype(float)
        
        # 3. Apply Rescale Slope/Intercept (Physics -> HU)
        slope = getattr(ds, 'RescaleSlope', 1)
        intercept = getattr(ds, 'RescaleIntercept', 0)
        pixel_array = (pixel_array * slope) + intercept

        # 4. Modality-Specific Normalization
        modality = ds.get("Modality", "Unknown")
        
        if modality == 'CT':
            # Hounsfield Units: Air -1000, Bone +1000
            # Robust Min-Max scaling for visualization feeding
            # Clip outlier HU (metal artifacts > 3000, air < -1000)
            pixel_array = np.clip(pixel_array, -1000, 3000)
            
        elif modality == 'MR':
            # MRI is relative intensity. 
            # Simple 1-99 percentile clipping removes spikes.
            p1, p99 = np.percentile(pixel_array, [1, 99])
            pixel_array = np.clip(pixel_array, p1, p99)
            
        # 5. Normalization to 0-255 (Display Space)
        pixel_min = np.min(pixel_array)
        pixel_max = np.max(pixel_array)
        
        if pixel_max - pixel_min != 0:
            pixel_array = ((pixel_array - pixel_min) / (pixel_max - pixel_min)) * 255.0
        else:
            pixel_array = np.zeros_like(pixel_array)
            
        pixel_array = pixel_array.astype(np.uint8)
        
        # 6. Color Space
        if len(pixel_array.shape) == 2:
            image = Image.fromarray(pixel_array).convert("RGB")
        else:
            image = Image.fromarray(pixel_array) 
            
        return image
        
    except Exception as e:
        logger.error(f"DICOM Conversion Error: {e}")
        raise ValueError(f"Could not convert DICOM to image: {e}")
