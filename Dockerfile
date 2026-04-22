# ETAPA 1: Construcción del Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /frontend

# Aprovechar el caché de capas para las dependencias
COPY frontend/package*.json ./
RUN npm ci

# Copiar el resto del código y construir
COPY frontend/ ./
RUN npm run build

# ETAPA 2: Preparación del Backend
FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias del backend
COPY backend/app/requirements_deploy.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend (excluyendo lo ignorado en .dockerignore)
COPY backend/app/ ./

# Copiar el build del frontend a la carpeta dist del backend
COPY --from=frontend-builder /frontend/dist ./dist

# El directorio 'static' ya se copia con 'backend/app/', pero aseguramos permisos
RUN chmod -R 755 static

# Exponer puerto para Cloud Run (8080 por defecto)
EXPOSE 8080

# Ejecutar con Uvicorn usando la variable de entorno PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
