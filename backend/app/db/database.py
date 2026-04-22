from pathlib import Path
from sqlmodel import Session, create_engine, select, SQLModel

# 1. Localizar la base de datos en la misma carpeta que este archivo
DB_PATH = Path(__file__).resolve().parent / "restaurant.db"
url_connection = f"sqlite:///{DB_PATH}"

# 2. Configurar el motor (engine)
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

# 3. Función para crear datos iniciales
def create_initial_data(session: Session) -> None:
    from db.models.user import Users
    from db.models.category import Category
    from core.security import hash_password

    # 1. Crear usuario Admin si no hay ninguno
    if not session.exec(select(Users)).first():
        admin_user = Users(
            user_name="admin",
            user_email="admin@restaurante.com",
            user_full_name="Administrador del Sistema",
            user_role=1, # 1 para Admin
            user_password=hash_password("admin123"), # Cambia esto después
            user_state=True
        )
        session.add(admin_user)
        print("Usuario administrador inicial creado.")

    # 2. Crear categorías si no hay ninguna
    if not session.exec(select(Category)).first():
        categories = ["Entrantes", "Platos Principales", "Postres", "Bebidas", "Vinos"]
        for cat_name in categories:
            session.add(Category(category_description=cat_name, category_status=True))
        print("Categorías iniciales creadas.")
    
    session.commit()

# 4. Función modificada (crea tablas y datos)
def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        create_initial_data(session)
    print("Base de datos inicializada con éxito.")

# 4. Dependencia para los endpoints
def get_Session():
    with Session(engine) as session:
        yield session