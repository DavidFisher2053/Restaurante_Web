import jwt
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from core.config import settings
from core.security import token_create, verify_password
from db.models.user import Users
from db.database import select, get_Session, Session
from jwt.exceptions import InvalidTokenError


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={status.HTTP_404_NOT_FOUND: {"message": "No Encontrado"}}
)

oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def auth_user(token: str = Depends(oauth2), session: Session = Depends(get_Session)):
    exception = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Credenciales de autenticacion inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        user_name = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        ).get("sub")
        if user_name is None:
            raise exception
    except InvalidTokenError:
        raise exception

    user = session.exec(select(Users).where(Users.user_name == user_name)).first()
    if user is None:
        raise exception
    return user

async def current_user(user: Users = Depends(auth_user)):
    
    if not user.user_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario Inactivo"
        )

    return user

@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_Session)):    
    user_log = session.exec(select(Users).where(Users.user_name == form.username)).first()
    if not user_log:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario Incorrecto")
    
    if not user_log.user_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario Inactivo")

    verify_password(form.password, user_log.user_password)

    return token_create(user_log.user_name)

@router.get("/users/me")
async def me(user: Users = Depends(current_user)):
    return user
