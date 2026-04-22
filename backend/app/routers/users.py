from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from db.database import select, get_Session, Session 
from db.models.user import Users, UserCreate, UserRead, UserUpdate
from core.security import hash_password
from routers.auth_user import current_user


router = APIRouter(prefix="/users", 
                   tags=["users"], 
                   responses={status.HTTP_404_NOT_FOUND: {"message": "Usuario no encontrado"}},
                   dependencies=[Depends(current_user)])

@router.get("/", response_model=list[UserRead], status_code=status.HTTP_200_OK)
async def users(session: Session = Depends(get_Session), user: Users = Depends(current_user)):
    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para ver esta lista")

    users = session.exec(select(Users)).all()
    return users

# ------ GET Obtener Usuario ------ #
@router.get("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def user(user_id:int, session: Session = Depends(get_Session), user: Users = Depends(current_user)):

    db_user = session.get(Users, user_id)

    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no existe")

    return db_user


# ------ POST Crear Usuario ------ #
@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, session: Session = Depends(get_Session), user: Users = Depends(current_user)):
    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo los administradores pueden crear usuarios")

    try:
        # Hashear la contraseña antes de guardarla
        hashed_password = hash_password(user_data.user_password)

        new_user = Users(
            user_name=user_data.user_name,
            user_password=hashed_password,
            user_email=user_data.user_email,
            user_full_name=user_data.user_full_name,
            user_role=user_data.user_role if user_data.user_role else 2
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user

    except IntegrityError as e:
        session.rollback()
        if user_data.user_email in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        elif user_data.user_name in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya existe"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error al crear el usuario"
            )

# ------ PUT Actualizar Usuario ------ #
@router.put("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
async def update_user(user_id: int, user_update: UserUpdate, session: Session = Depends(get_Session), user: Users = Depends(current_user)):

    if user.user_role != 1 and user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para actualizar este perfil")

    try:
        db_user = session.get(Users, user_id)
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no existe")

        user_update.user_password = hash_password(user_update.user_password) if user_update.user_password else None

        for key, value in user_update.model_dump(exclude_unset=True).items():
            setattr(db_user, key, value)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    except IntegrityError as e:
        session.rollback()
        if user_update.user_email in str(e): # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        elif user_update.user_name in str(e): # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya existe"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error al crear el usuario"
            )



# ------ DELETE Eliminar Usuario ------ #
@router.delete("/{user_id}")
async def delete_user(user_id: int, session: Session = Depends(get_Session), user: Users = Depends(current_user)):

    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo los administradores pueden eliminar usuarios")

    db_user = session.get(Users, user_id)

    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no existe")

    session.delete(db_user)
    session.commit()
    return {"message": "El usuario ha sido eliminado"}