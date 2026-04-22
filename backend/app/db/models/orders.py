from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class OrdersBase(SQLModel):
    order_code: str
    total_price: float
    place_delivery: str
    creation_time: str
    delivery_time: str
    order_state: int
    pay_method: int

class Orders(OrdersBase, table=True):
    __tablename__ = "orders" # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)

class OrdersCreate(OrdersBase):
    total_price: float
    place_delivery: str
    creation_time: str
    delivery_time: str
    order_state: int

class OrdersRead(OrdersBase):
    id: int
    order_code: str
    total_price: float
    place_delivery: str
    creation_time: str
    delivery_time: str
    order_state: int

class OrdersUpdate(SQLModel):
    order_code: Optional[str] = None
    total_price: Optional[float] = None
    place_delivery: Optional[str] = None
    creation_time: Optional[str] = None
    delivery_time: Optional[str] = None
    order_state: Optional[int] = None

class Order_Dishes(SQLModel, table=True):
    __tablename__ = "order_dishes" # type: ignore
    id: int | None = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id")
    dish_id: int = Field(foreign_key="Dishes.id")
    amount: int
    total_dishes_price: float

class User_Orders(SQLModel, table=True):
    __tablename__ = "users_orders" # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    order_id: int = Field(foreign_key="orders.id")
    
user_links: List[User_Orders] = Relationship()