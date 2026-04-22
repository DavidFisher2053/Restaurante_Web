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

# 3. Función simplificada (ya no crea nada, solo asegura conexión)
def init_db() -> None:
    # SQLModel crea las tablas si no existen
    SQLModel.metadata.create_all(engine)
    print("Base de datos y tablas creadas (o ya existentes).")

# 4. Dependencia para los endpoints
def get_Session():
    with Session(engine) as session:
        yield session