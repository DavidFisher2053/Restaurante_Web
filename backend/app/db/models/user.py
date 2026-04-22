from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class UserBase(SQLModel):
    user_name: str
    user_email: str
    user_full_name: str | None = None

class Users(UserBase, table=True):
    __tablename__ = "users" # type: ignore
    id: int | None = Field(default=None, primary_key=True)
    user_role: int = Field(default=None)
    user_password: str
    user_state: bool = Field(default=True)

class UserCreate(UserBase):
    user_password: str
    user_role: Optional[int] = 2

class UserRead(UserBase):
    id: int
    user_role: int
    user_state: bool

class UserUpdate(SQLModel):
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None
    user_password: Optional[str] = None
    user_state: Optional[bool] = None
