# Usar una imagen de Python ligera
FROM python:3.11-slim

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY requirements_deploy.txt .
RUN pip install --no-cache-dir -r requirements_deploy.txt

# Copiar el código del backend
COPY . .

# Exponer el puerto que usa Cloud Run (8080 por defecto)
EXPOSE 8080

# Comando para ejecutar la aplicación
# Usamos el host 0.0.0.0 y el puerto de la variable de entorno PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
