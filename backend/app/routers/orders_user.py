from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from db.database import select, get_Session, Session
from db.models.orders import Orders, OrdersCreate, OrdersRead, OrdersUpdate, Order_Dishes, User_Orders
from db.models.dishes import Dishes
from routers.auth_user import current_user


router = APIRouter(prefix="/orders_user",
                   tags=["orders_user"],
                   responses={status.HTTP_404_NOT_FOUND: {"message": "Orden no encontrada"}},
                   dependencies=[Depends(current_user)])

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