# ETAPA 1: Construcción del Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ETAPA 2: Preparación del Backend
FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias del backend
COPY backend/app/requirements_deploy.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY backend/app/ ./

# Copiar el build del frontend a la carpeta dist del backend
COPY --from=frontend-builder /frontend/dist ./dist

# Crear carpeta de estáticos si no existe
RUN mkdir -p static

# Exponer puerto para Cloud Run
EXPOSE 8080

# Ejecutar con Uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
