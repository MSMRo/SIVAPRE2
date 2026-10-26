from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from .routers import auth, reportes, usuarios
import os

app = FastAPI(
    title="SIVAPRE API",
    description="API para el Sistema Integrado de Vigilancia y Predicción en Salud",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[AVISO] No se pudo inicializar tablas en la BD: {e}")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
app.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])

@app.get("/")
def root():
    return {"mensaje": "Bienvenido a la API de SIVAPRE", "version": "1.0.0"}
