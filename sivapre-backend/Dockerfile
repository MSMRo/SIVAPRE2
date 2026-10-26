# ==========================================
# SIVAPRE Backend Dockerfile con UV (Astral)
# ==========================================
FROM python:3.11-slim

# Copiar binario de uv directamente desde la imagen oficial
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Variables de optimización para UV en Docker
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV DOCKER_CONTAINER=1

# Copiar definiciones de dependencias
COPY pyproject.toml requirements.txt ./

# Instalar dependencias en el sistema de manera ultrarrápida
RUN uv pip install --system --no-cache -r requirements.txt

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto estándar de FastAPI
EXPOSE 8000

# Iniciar servidor ASGI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
