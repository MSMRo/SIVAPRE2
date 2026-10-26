from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Reporte, Usuario, CasoNoti, CasoNetlab
from ..schemas import (
    ReporteCreate,
    ReporteResponse,
    ReporteUpdateEstado,
    CasoNotiResponse,
    CasoNetlabResponse,
)
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
import os
import shutil
from dotenv import load_dotenv
import requests

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "sivapre_super_secret_jwt_key_2025_upch_utec_minsa")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "reportes-fotos")

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


@router.post("/upload-foto")
async def upload_foto(
    file: UploadFile = File(...), current_user: Usuario = Depends(get_current_user)
):
    extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{current_user.id}_{os.urandom(8).hex()}.{extension}"
    file_bytes = await file.read()

    # Si Supabase Storage está configurado (producción)
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            upload_endpoint = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/{SUPABASE_BUCKET}/{filename}"
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": file.content_type or "image/jpeg",
            }
            res = requests.post(upload_endpoint, data=file_bytes, headers=headers, timeout=10)
            if res.status_code in [200, 201]:
                public_url = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{SUPABASE_BUCKET}/{filename}"
                return {"foto_url": public_url}
        except Exception as e:
            print(f"⚠️ Error al subir a Supabase Storage: {e}. Fallback a almacenamiento local.")

    # Fallback local (pruebas en PC / Docker)
    os.makedirs("uploads", exist_ok=True)
    filepath = f"uploads/{filename}"
    with open(filepath, "wb") as buffer:
        buffer.write(file_bytes)
    return {"foto_url": f"/uploads/{filename}"}


@router.post("/", response_model=ReporteResponse, status_code=201)
def crear_reporte(
    reporte: ReporteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Geocodificación inversa con Nominatim
    departamento = None
    provincia = None
    distrito = None
    ubigeo = None
    try:
        geo = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": reporte.latitud, "lon": reporte.longitud, "format": "json"},
            headers={"User-Agent": "SIVAPRE/1.0"},
            timeout=5,
        ).json()
        address = geo.get("address", {})
        departamento = address.get("state", None)
        provincia = address.get("county", address.get("city", None))
        distrito = address.get("suburb", address.get("town", address.get("village", None)))
    except Exception:
        pass

    nuevo_reporte = Reporte(
        usuario_id=current_user.id,
        latitud=reporte.latitud,
        longitud=reporte.longitud,
        foto_url=reporte.foto_url,
        tipo_lugar=reporte.tipo_lugar,
        tipo_objeto=reporte.tipo_objeto,
        observa_larvas=reporte.observa_larvas,
        conocimiento_dengue_cercano=reporte.conocimiento_dengue_cercano,
        comentarios=reporte.comentarios,
        departamento=departamento,
        provincia=provincia,
        distrito=distrito,
        ubigeo=ubigeo,
    )
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)
    return nuevo_reporte


@router.get("/mis-reportes", response_model=List[ReporteResponse])
def mis_reportes(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    return (
        db.query(Reporte)
        .filter(Reporte.usuario_id == current_user.id)
        .order_by(Reporte.fecha_reporte.desc())
        .all()
    )


@router.get("/todos", response_model=List[ReporteResponse])
def todos_los_reportes(
    departamento: Optional[str] = Query(None, description="Filtrar por Departamento"),
    provincia: Optional[str] = Query(None, description="Filtrar por Provincia"),
    distrito: Optional[str] = Query(None, description="Filtrar por Distrito"),
    ubigeo: Optional[str] = Query(None, description="Filtrar por código UBIGEO"),
    fecha_inicio: Optional[datetime] = Query(None, description="Fecha inicial ISO"),
    fecha_fin: Optional[datetime] = Query(None, description="Fecha final ISO"),
    observa_larvas: Optional[str] = Query(None, description="Filtro de presencia de larvas"),
    estado: Optional[str] = Query(None, description="Filtro de estado del reporte"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Consulta optimizada con soporte para filtros epidemiológicos por UBIGEO y fechas"""
    query = db.query(Reporte)

    if departamento:
        query = query.filter(Reporte.departamento.ilike(f"%{departamento}%"))
    if provincia:
        query = query.filter(Reporte.provincia.ilike(f"%{provincia}%"))
    if distrito:
        query = query.filter(Reporte.distrito.ilike(f"%{distrito}%"))
    if ubigeo:
        query = query.filter(Reporte.ubigeo.startswith(ubigeo))
    if fecha_inicio:
        query = query.filter(Reporte.fecha_reporte >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Reporte.fecha_reporte <= fecha_fin)
    if observa_larvas:
        query = query.filter(Reporte.observa_larvas == observa_larvas)
    if estado:
        query = query.filter(Reporte.estado == estado)

    return query.order_by(Reporte.fecha_reporte.desc()).all()


@router.get("/epidemiologia/noti", response_model=List[CasoNotiResponse])
def obtener_casos_noti(
    departamento: Optional[str] = None,
    ubigeo: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna los casos sospechosos y probables del sistema NOTI (CDC Perú)"""
    query = db.query(CasoNoti)
    if departamento:
        query = query.filter(CasoNoti.departamento.ilike(f"%{departamento}%"))
    if ubigeo:
        query = query.filter(CasoNoti.ubigeo_lugar_infeccion.startswith(ubigeo))
    return query.all()


@router.get("/epidemiologia/netlab", response_model=List[CasoNetlabResponse])
def obtener_casos_netlab(
    departamento: Optional[str] = None,
    ubigeo: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna los casos confirmados y serotipos de laboratorio del sistema NETLAB (INS)"""
    query = db.query(CasoNetlab)
    if departamento:
        query = query.filter(CasoNetlab.departamento_paciente_reniec.ilike(f"%{departamento}%"))
    if ubigeo:
        query = query.filter(CasoNetlab.ubigeo_paciente_actual.startswith(ubigeo))
    return query.all()


@router.get("/{reporte_id}", response_model=ReporteResponse)
def obtener_reporte(
    reporte_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = db.query(Reporte).filter(Reporte.id == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return reporte


@router.patch("/{reporte_id}/estado", response_model=ReporteResponse)
def actualizar_estado(
    reporte_id: str,
    estado_update: ReporteUpdateEstado,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = db.query(Reporte).filter(Reporte.id == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    reporte.estado = estado_update.estado
    db.commit()
    db.refresh(reporte)
    return reporte


@router.delete("/{reporte_id}", status_code=204)
def eliminar_reporte(
    reporte_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = (
        db.query(Reporte)
        .filter(Reporte.id == reporte_id, Reporte.usuario_id == current_user.id)
        .first()
    )
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    db.delete(reporte)
    db.commit()
