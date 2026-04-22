from pathlib import Path

from sqlmodel import Session, create_engine, select, SQLModel

DB_DIR = Path(__file__).resolve().parent / "db"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "restaurant.db"
url_connection = f"sqlite:///{DB_PATH}"

engine = create_engine(
    url_connection,
    connect_args={
        "check_same_thread": False,
        "timeout": 30,
    },
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)


def init_db() -> None:
    from db.models.user import Users
    from db.models.category import Category
    from db.models.dishes import Dishes
    from db.models.orders import Orders, Order_Dishes, User_Orders

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        if session.exec(select(Users)).first() is None:
            from core.security import hash_password

            session.add(
                Users(
                    user_name="admin",
                    user_password=hash_password("admin"),
                    user_email="admin@local.test",
                    user_full_name="Administrador",
                    user_role=1,
                    user_state=True,
                )
            )
            session.commit()

        if session.exec(select(Category)).first() is None:
            for desc in ("Entrada", "Plato Principal", "Postre"):
                session.add(Category(category_description=desc))
            session.commit()


def get_Session():
    with Session(engine) as session:
        yield session