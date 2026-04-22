from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile, Form
from sqlalchemy.exc import IntegrityError
from db.database import select, get_Session, Session 
from db.models.dishes import Dishes, DishesCreate, DishesRead, DishesUpdate
from db.models.user import Users
from routers.auth_user import current_user
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/products",
                   tags=["products"], 
                   responses={status.HTTP_404_NOT_FOUND: {"message": "Producto no encontrado"}},
                   dependencies=[Depends(current_user)])

UPLOAD_DIR = Path("static/dishes")

# ------ GET Obtener Platos ------ #
@router.get("/", response_model=list[DishesRead], status_code=status.HTTP_200_OK)
async def get_dishes(session: Session = Depends(get_Session)):
    dishes = session.exec(select(Dishes)).all()
    return dishes

# ------ GET Obtener Plato ------ #
@router.get("/{product_id}", response_model=DishesRead, status_code=status.HTTP_200_OK)
async def get_dish(product_id:int, session: Session = Depends(get_Session)):

    dish = session.get(Dishes, product_id)

    if not dish:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El plato no existe")

    return dish

# ------ POST Crear Plato ------ #
@router.post("/", response_model=DishesRead, status_code=status.HTTP_201_CREATED)
async def create_dish(
    dishes_name: str = Form(...),
    dishes_description: str = Form(None),
    price: float = Form(...),
    discount: float = Form(None),
    category_id: int = Form(...),
    image: UploadFile = File(None),
    session: Session = Depends(get_Session),
    user: Users = Depends(current_user)
):
    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para crear platos")
    
    try:
        image_path = None
        if image:
            # Asegurar que el directorio existe
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            
            # Generar un nombre de archivo único o usar el original
            file_extension = os.path.splitext(image.filename)[1]
            file_name = f"{dishes_name.replace(' ', '_').lower()}{file_extension}"
            file_path = UPLOAD_DIR / file_name
            
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            image_path = f"static/dishes/{file_name}"

        new_dish = Dishes(
            dishes_name=dishes_name,
            dishes_description=dishes_description,
            price=price,
            discount=discount,
            category_id=category_id,
            image=image_path
        )

        session.add(new_dish)
        session.commit()
        session.refresh(new_dish)
        return new_dish

    except IntegrityError as e:
        session.rollback()
        error_str = str(e)
        if "dishes_name" in error_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre del plato ya está registrado"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error al crear el plato"
            )

# ------ PUT Actualizar Plato ------ #
@router.put("/{product_id}", response_model=DishesRead, status_code=status.HTTP_200_OK)
async def update_dish(product_id: int, dish_update: DishesUpdate, session: Session = Depends(get_Session), user: Users = Depends(current_user)):
    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para modificar platos")
    try:
        dish = session.get(Dishes, product_id)
        if not dish:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El plato no existe")

        for key, value in dish_update.model_dump(exclude_unset=True).items():
            setattr(dish, key, value)
        
        session.add(dish)
        session.commit()
        session.refresh(dish)
        return dish
    
    except IntegrityError as e:
        session.rollback()
        error_str = str(e)
        if "dishes_name" in error_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre del plato ya está registrado"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error al actualizar el plato"
            )

# ------ DELETE Eliminar Plato ------ #
@router.delete("/{product_id}")
async def delete_dish(product_id: int, session: Session = Depends(get_Session), user: Users = Depends(current_user)):
    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para eliminar platos")

    dish = session.get(Dishes, product_id)

    if not dish:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El plato no existe")
    
    session.delete(dish)
    session.commit()
    return {"message": "El plato ha sido eliminado"}