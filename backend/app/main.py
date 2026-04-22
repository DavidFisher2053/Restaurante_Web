from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import users, products, auth_user, orders, categories, orders_user
from core.config import settings
from db.database import init_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


from fastapi.responses import FileResponse
import os

#---- Inicializacion de la app
app = FastAPI(lifespan=lifespan)

# Montar estáticos de imágenes
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

#---- Routers
app.include_router(users.router)
app.include_router(auth_user.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(orders_user.router)
app.include_router(categories.router)

if settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Servir el Frontend (React Build)
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
    
    @app.get("/", include_in_schema=False)
    async def serve_index():
        return FileResponse("dist/index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # El catch-all solo se alcanza si no coincide con routers previos
        index_path = os.path.join("dist", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return None # O podrías devolver un 404

#app.mount("/static", StaticFiles(directory="static"), name="static")
