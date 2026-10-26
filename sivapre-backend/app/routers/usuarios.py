from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Usuario
from ..schemas import UsuarioResponse
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "sivapre_super_secret_jwt_key_2025_upch_utec_minsa")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return usuario


@router.get("/me", response_model=UsuarioResponse)
def obtener_perfil(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UsuarioResponse)
def actualizar_perfil(
    datos: dict,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    campos_permitidos = ["nombre_completo", "telefono", "municipio"]
    for campo, valor in datos.items():
        if campo in campos_permitidos:
            setattr(current_user, campo, valor)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=204)
def eliminar_cuenta(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
