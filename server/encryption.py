from cryptography.fernet import Fernet
import os
import sys
import logging
from typing import Optional

# -------------------------------------------------------------------------
# ENCRYPTION CONFIGURATION - PRODUCTION READY
# -------------------------------------------------------------------------

# Environment detection
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# Encryption Key - Load from environment variable
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    if IS_PRODUCTION:
        logging.critical("🔴 FATAL ERROR: ENCRYPTION_KEY must be set in production environment")
        logging.critical("Generate one with: python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'")
        sys.exit(1)  # Fail-fast in production
    else:
        # Development fallback with ephemeral key
        ENCRYPTION_KEY = Fernet.generate_key().decode()
        logging.warning("⚠️  WARNING: Using ephemeral encryption key (development only)")

# Initialize cipher
cipher_suite = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def encrypt_data(data: str) -> str:
    """
    Encrypts a string and returns the encrypted token as a string.
    """
    if not data: return ""
    encrypted_bytes = cipher_suite.encrypt(data.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')

def decrypt_data(token: str) -> Optional[str]:
    """
    Decrypts a token and returns the original string.
    """
    if not token: return None
    try:
        decrypted_bytes = cipher_suite.decrypt(token.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        print(f"Decryption failed: {e}")
        return None

def rotate_key():
    """
    Example function to rotate keys (advanced).
    """
    global key, cipher_suite
    key = Fernet.generate_key()
    cipher_suite = Fernet(key)
    with open(ENCRYPTION_KEY_PATH, "wb") as key_file:
        key_file.write(key)
    print(f"New key generated and saved to {ENCRYPTION_KEY_PATH}")

if __name__ == "__main__":
    # Test
    original = "Jean Dupont - Patient Zero"
    encrypted = encrypt_data(original)
    decrypted = decrypt_data(encrypted)
    
    print(f"Original: {original}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
    assert original == decrypted
