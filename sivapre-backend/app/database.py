from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import time

load_dotenv()

RAW_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost:5432/sivapre_db")
DATABASE_URL = RAW_DATABASE_URL

# Si se especificó el host "db" de Docker pero estamos corriendo directamente en Windows
if not os.getenv("DOCKER_CONTAINER") and "@db:" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("@db:", "@127.0.0.1:")

# Normalizar URL para asegurar el driver psycopg2 compatible con SQLAlchemy 2.x
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = None
connected = False

# Intentar conectar a la base de datos principal (PostgreSQL / Supabase)
for intento in range(2):
    try:
        candidate_engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        with candidate_engine.connect():
            print("[OK] Conectado a PostgreSQL exitosamente")
        engine = candidate_engine
        connected = True
        break
    except Exception:
        safe_db = DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL
        print(f"[CONEXION] Verificando PostgreSQL ({safe_db})... intento {intento + 1}/2")
        time.sleep(1)

# Fallback automático a SQLite local para que el desarrollador nunca sufra errores al probar
if not connected:
    print("[INFO] PostgreSQL no accesible en este entorno. Activando SQLite local (sivapre_local.db)...")
    SQLITE_URL = "sqlite:///./sivapre_local.db"
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    print("[OK] Base de datos local SQLite lista para pruebas sin errores")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
