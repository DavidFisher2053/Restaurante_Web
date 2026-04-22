from fastapi import APIRouter, Depends, status

from db.database import get_Session, Session, select
from db.models.category import Category
from routers.auth_user import current_user

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    dependencies=[Depends(current_user)],
)


@router.get("/", status_code=status.HTTP_200_OK)
async def list_categories(session: Session = Depends(get_Session)):
    cats = session.exec(select(Category)).all()
    return [
        {
            "id": c.id,
            "category_description": c.category_description,
            "category_status": c.category_status,
        }
        for c in cats
        if c.id is not None
    ]
