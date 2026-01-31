import os
import uuid
import logging
from pathlib import Path
from typing import Tuple, Optional

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Detect environment (Hugging Face Spaces vs Local)
# HF Spaces with persistent storage usually mount at /data
IS_HF_SPACE = os.path.exists('/data')
if IS_HF_SPACE:
    BASE_STORAGE_DIR = Path('/data/storage')
    logger.info(f"Using PERSISTENT storage at {BASE_STORAGE_DIR}")
else:
    BASE_STORAGE_DIR = Path(os.path.dirname(os.path.abspath(__file__))) / "storage"
    logger.info(f"Using LOCAL storage at {BASE_STORAGE_DIR}")

def get_user_storage_path(username: str) -> Path:
    """Get secure storage path for user, creating it if needed."""
    # Sanitize username to prevent directory traversal
    safe_username = "".join([c for c in username if c.isalnum() or c in ('-', '_')])
    user_path = BASE_STORAGE_DIR / safe_username
    user_path.mkdir(parents=True, exist_ok=True)
    return user_path

def save_image(username: str, file_bytes: bytes, filename_hint: str = "image.png") -> str:
    """
    Save image to disk and return a unique image_id.
    Returns: image_id (e.g. IMG_ABC123)
    """
    # Generate ID
    unique_suffix = uuid.uuid4().hex[:12].upper()
    image_id = f"IMG_{unique_suffix}"
    
    # Determine extension
    ext = os.path.splitext(filename_hint)[1].lower()
    if not ext:
        ext = ".png" # Default
        
    filename = f"{image_id}{ext}"
    user_path = get_user_storage_path(username)
    file_path = user_path / filename
    
    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"Saved image {image_id} for user {username} at {file_path}")
        return image_id
    except Exception as e:
        logger.error(f"Failed to save image: {e}")
        raise IOError(f"Storage Error: {e}")

def load_image(username: str, image_id: str) -> Tuple[bytes, str]:
    """
    Load image bytes from disk.
    Returns: (file_bytes, file_path_str)
    """
    # Security: Ensure ID format is valid
    if not image_id.startswith("IMG_") or ".." in image_id or "/" in image_id:
        raise ValueError("Invalid image_id format")
        
    user_path = get_user_storage_path(username)
    
    # We don't know the extension, so look for the file
    # Or strict requirement: user must know? 
    # Better: Search for matching file
    for file in user_path.glob(f"{image_id}.*"):
        try:
            with open(file, "rb") as f:
                return f.read(), str(file)
        except Exception as e:
            logger.error(f"Error reading file {file}: {e}")
            raise IOError("Read error")
            
    raise FileNotFoundError(f"Image {image_id} not found for user {username}")

def get_image_absolute_path(username: str, image_id: str) -> Optional[str]:
    """Return absolute path if exists, else None."""
    user_path = get_user_storage_path(username)
    for file in user_path.glob(f"{image_id}.*"):
        return str(file)
    return None
