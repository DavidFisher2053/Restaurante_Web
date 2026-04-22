import jwt
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from core.config import settings

crypt = PasswordHash.recommended()

def hash_password(password: str) -> str:
    """Hashea una contraseña en texto plano"""
    return crypt.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    if not crypt.verify(plain_password, hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Contraseña Incorrecta")

def token_create(user_name: str):
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_DURATION)
    access_token = {"sub": user_name, "exp": expires}
    return {"access_token": jwt.encode(access_token, settings.SECRET_KEY, algorithm=settings.ALGORITHM), "token_type": "bearer"} 
