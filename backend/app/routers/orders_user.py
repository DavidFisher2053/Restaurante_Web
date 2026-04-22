from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from db.database import select, get_Session, Session
from db.models.orders import Orders, OrdersRead, Order_Dishes, User_Orders
from db.models.dishes import Dishes
from routers.auth_user import current_user
from pydantic import BaseModel
from datetime import datetime
import random
import string

router = APIRouter(prefix="/orders_user",
                   tags=["orders_user"],
                   responses={status.HTTP_404_NOT_FOUND: {"message": "Orden no encontrada"}},
                   dependencies=[Depends(current_user)])

class ItemCreate(BaseModel):
    dish_id: int
    amount: int

class OrdersUserCreate(BaseModel):
    items: list[ItemCreate]
    place_delivery: str
    pay_method: int

# ----- GET Obtener Ordenes del Usuario ----- #
@router.get("/", response_model=list[OrdersRead], status_code=status.HTTP_200_OK)
async def get_orders_user(session: Session = Depends(get_Session), user=Depends(current_user)):
    statement = (
        select(Orders)
        .join(User_Orders)
        .where(User_Orders.user_id == user.id)
    )

    orders = session.exec(statement).all()
    return orders

# ----- GET Obtener Detalle Orden con Platos ----- #
@router.get("/{order_id}/details", status_code=status.HTTP_200_OK)
async def get_order_details(order_id: int, session: Session = Depends(get_Session), user=Depends(current_user)):
    # Verificar que la orden pertenezca al usuario
    statement_order = (
        select(Orders)
        .join(User_Orders)
        .where(Orders.id == order_id, User_Orders.user_id == user.id)
    )
    order = session.exec(statement_order).first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La orden no existe")

    # Consulta explícita para platos
    statement_dishes = (
        select(Order_Dishes, Dishes)
        .join(Dishes, Order_Dishes.dish_id == Dishes.id)
        .where(Order_Dishes.order_id == order_id)
    )
    results = session.exec(statement_dishes).all()

    items = []
    for od, dish in results:
        items.append({
            "dish_name": dish.dishes_name,
            "amount": od.amount,
            "price": od.total_dishes_price / od.amount if od.amount > 0 else 0,
            "total": od.total_dishes_price
        })

    return {
        "order": order,
        "items": items
    }

# ----- POST Crear Nueva Orden ----- #
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrdersUserCreate, 
    session: Session = Depends(get_Session), 
    user=Depends(current_user)
):
    try:
        # 1. Crear la Orden Principal
        total_price = 0
        order_dishes_to_add = []

        for item in order_data.items:
            dish = session.get(Dishes, item.dish_id)
            if not dish:
                raise HTTPException(status_code=404, detail=f"Plato con id {item.dish_id} no encontrado")

            # Calcular precio con descuento si aplica
            price_with_discount = dish.price * (1 - (dish.discount or 0) / 100)
            item_total = price_with_discount * item.amount
            total_price += item_total

            # Preparar la relación Order_Dishes
            order_dishes_to_add.append(Order_Dishes(
                dish_id=dish.id,
                amount=item.amount,
            total_dishes_price=item_total
            ))

        # Generar código de orden aleatorio
        order_code = 'ORD-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        new_order = Orders(
            order_code=order_code,
            total_price=total_price,
            place_delivery=order_data.place_delivery,
            creation_time=now_str,
            delivery_time="En espera",
            order_state=0, # 0: Pendiente
            pay_method=order_data.pay_method
        )
        session.add(new_order)
        session.flush() # Para obtener el ID de la nueva orden

        # 2. Asociar Platos a la Orden
        for od in order_dishes_to_add:
            od.order_id = new_order.id
            session.add(od)

        # 3. Asociar Orden al Usuario
        user_order = User_Orders(user_id=user.id, order_id=new_order.id)
        session.add(user_order)

        session.commit()
        session.refresh(new_order)
        return new_order

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))