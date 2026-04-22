from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from db.database import select, get_Session, Session
from db.models.orders import Orders, OrdersCreate, OrdersRead, OrdersUpdate, Order_Dishes, User_Orders
from db.models.dishes import Dishes
from routers.auth_user import current_user
from datetime import datetime

router = APIRouter(prefix="/orders_admin",
                   tags=["orders"],
                   responses={status.HTTP_404_NOT_FOUND: {"message": "Orden no encontrada"}},
                   dependencies=[Depends(current_user)])

# ----- GET Obtener Todas las Ordenes (Admin) ----- #
@router.get("/", response_model=list[OrdersRead], status_code=status.HTTP_200_OK)
async def get_orders(session: Session = Depends(get_Session), user=Depends(current_user)):
    if user.user_role == 1:
        orders = session.exec(select(Orders)).all()
    else:
        statement = (
            select(Orders)
            .join(User_Orders)
            .where(User_Orders.user_id == user.id)
        )
        orders = session.exec(statement).all()
    return orders

# ----- GET Obtener Detalles de la Orden (Admin) ----- #
@router.get("/{order_id}/details", status_code=status.HTTP_200_OK)
async def get_order_details(order_id: int, session: Session = Depends(get_Session), user=Depends(current_user)):
    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    order = session.get(Orders, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La orden no existe")
    
    # Consulta explícita para obtener los platos de esta orden
    statement = (
        select(Order_Dishes, Dishes)
        .join(Dishes, Order_Dishes.dish_id == Dishes.id)
        .where(Order_Dishes.order_id == order_id)
    )
    results = session.exec(statement).all()
    
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

# ----- PUT Actualizar Estado de la Orden (Admin) ----- #
@router.put("/{order_id}/status", status_code=status.HTTP_200_OK)
async def update_order_status(order_id: int, new_status: int, session: Session = Depends(get_Session), user=Depends(current_user)):
    if user.user_role != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para modificar estados de órdenes")
    
    order = session.get(Orders, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La orden no existe")
    
    order.order_state = new_status
    if new_status == 3:
        order.delivery_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    session.add(order)
    session.commit()
    session.refresh(order)
    return order