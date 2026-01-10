"""
Encryption utilities for sensitive data like SSH passwords.
Uses Django's cryptography.fernet for symmetric encryption.
"""
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import os
import logging

logger = logging.getLogger(__name__)


def get_encryption_key():
    """Get or generate encryption key from settings or environment"""
    key = getattr(settings, 'ENCRYPTION_KEY', None)
    
    if not key:
        # Try to get from environment
        key = os.environ.get('ENCRYPTION_KEY')
    
    if not key:
        # Generate a new key (should only happen in development)
        logger.warning("ENCRYPTION_KEY not set, generating new key. Store this key securely!")
        key = Fernet.generate_key().decode()
        logger.warning(f"Generated key (store in settings): {key}")
    
    # If key is a string, convert to bytes
    if isinstance(key, str):
        # Check if it's base64 encoded
        try:
            base64.b64decode(key)
            key = key.encode()
        except Exception:
            # Not base64, try direct encoding
            key = key.encode()
    
    # Ensure key is 32 bytes (base64 encoded)
    if len(base64.urlsafe_b64decode(key)) != 32:
        raise ValueError("ENCRYPTION_KEY must be a valid Fernet key (32 bytes base64 encoded)")
    
    return key


def encrypt_password(password: str) -> str:
    """Encrypt a password using Fernet symmetric encryption"""
    if not password:
        return ""
    
    try:
        key = get_encryption_key()
        f = Fernet(key)
        encrypted = f.encrypt(password.encode())
        return encrypted.decode()
    except Exception as e:
        logger.error(f"Failed to encrypt password: {e}")
        raise ValueError(f"Encryption failed: {e}")


def decrypt_password(encrypted_password: str) -> str:
    """Decrypt a password using Fernet symmetric encryption"""
    if not encrypted_password:
        return ""
    
    try:
        key = get_encryption_key()
        f = Fernet(key)
        decrypted = f.decrypt(encrypted_password.encode())
        return decrypted.decode()
    except Exception as e:
        logger.error(f"Failed to decrypt password: {e}")
        raise ValueError(f"Decryption failed: {e}")
