from sqlmodel import SQLModel, Field
from typing import Optional

class CategoryBase(SQLModel):
    category_description: str | None = None
    category_status: bool = Field(default=True)

class Category(CategoryBase, table=True):
    __tablename__ = "Category_Dishes" # type: ignore
    id: int | None = Field(default=None, primary_key=True)
    category_description: str | None = None

class CategoryCreate(CategoryBase):
    category_description: str | None = None

class CategoryRead(CategoryBase):
    category_description: str | None = None

class CategoryUpdate(SQLModel):
    category_description: Optional[str] = None
    category_status: Optional[bool] = None
