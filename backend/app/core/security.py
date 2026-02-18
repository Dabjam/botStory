from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash (compatible with create_admin_simple and passlib-style hashes)."""
    if not plain_password or not hashed_password:
        return False
    # Bcrypt limit 72 bytes
    raw = plain_password.encode("utf-8")
    if len(raw) > 72:
        raw = raw[:72]
    try:
        if hashed_password.startswith("$2"):
            return bcrypt.checkpw(raw, hashed_password.encode("utf-8"))
        return False
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash (same format as create_admin_simple.py)."""
    raw = password.encode("utf-8")
    if len(raw) > 72:
        raw = raw[:72]
    return bcrypt.hashpw(raw, bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
