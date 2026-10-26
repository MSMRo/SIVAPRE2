from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import time

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost:5432/sivapre_db")

# Normalizar URL para asegurar el driver psycopg2 compatible con SQLAlchemy 2.x
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = None
max_intentos = 10 if os.getenv("DOCKER_CONTAINER") else 3

# Retry hasta que PostgreSQL esté listo
for intento in range(max_intentos):
    try:
        candidate_engine = create_engine(DATABASE_URL)
        with candidate_engine.connect():
            print("[OK] Conectado a PostgreSQL exitosamente")
        engine = candidate_engine
        break
    except Exception as e:
        safe_db = DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL
        print(f"[ESPERANDO] Base de datos ({safe_db})... intento {intento + 1}/{max_intentos}")
        time.sleep(1)

if engine is None:
    # Asignamos el engine para permitir arranque o reporte de errores claros en llamadas posteriores
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
