from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..database import get_db
from ..models import Usuario
from ..schemas import UsuarioCreate, UsuarioResponse, LoginRequest, Token
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "sivapre_super_secret_jwt_key_2025_upch_utec_minsa")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/registro", response_model=UsuarioResponse, status_code=201)
def registro(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    # Verificar si el username ya existe
    if db.query(Usuario).filter(Usuario.username == usuario.username).first():
        raise HTTPException(
            status_code=400, detail="El nombre de usuario ya está en uso"
        )

    # Verificar si el DNI ya existe
    if db.query(Usuario).filter(Usuario.dni == usuario.dni).first():
        raise HTTPException(status_code=400, detail="El DNI ya está registrado")

    nuevo_usuario = Usuario(
        nombre_completo=usuario.nombre_completo,
        dni=usuario.dni,
        telefono=usuario.telefono,
        municipio=usuario.municipio,
        username=usuario.username,
        hashed_password=hash_password(usuario.password),
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == request.username).first()
    if not usuario or not verify_password(request.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )
    access_token = create_access_token(data={"sub": usuario.username})
    return {"access_token": access_token, "token_type": "bearer"}
