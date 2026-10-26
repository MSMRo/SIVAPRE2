# schemas.py

from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime
from uuid import UUID

# ─── Usuario ───────────────────────────────────────


class UsuarioCreate(BaseModel):
    nombre_completo: str
    dni: str
    telefono: Optional[str] = None
    municipio: Optional[str] = None
    username: str
    password: str


class UsuarioResponse(BaseModel):
    id: Union[str, UUID]
    nombre_completo: str
    dni: str
    telefono: Optional[str] = None
    municipio: Optional[str] = None
    username: str
    fecha_registro: Optional[datetime] = None
    activo: bool

    class Config:
        from_attributes = True


# ─── Auth ──────────────────────────────────────────


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# ─── Reporte ───────────────────────────────────────


class ReporteCreate(BaseModel):
    latitud: float
    longitud: float
    foto_url: Optional[str] = None
    tipo_lugar: str
    tipo_objeto: str
    observa_larvas: str
    conocimiento_dengue_cercano: str
    comentarios: Optional[str] = None


class ReporteResponse(BaseModel):
    id: Union[str, UUID]
    usuario_id: Union[str, UUID]
    latitud: float
    longitud: float
    foto_url: Optional[str] = None
    tipo_lugar: str
    tipo_objeto: str
    observa_larvas: str
    conocimiento_dengue_cercano: str
    comentarios: Optional[str] = None
    estado: str
    fecha_reporte: datetime
    departamento: Optional[str] = None
    provincia: Optional[str] = None
    distrito: Optional[str] = None
    ubigeo: Optional[str] = None

    class Config:
        from_attributes = True


class ReporteUpdateEstado(BaseModel):
    estado: str


# ─── Vigilancia Epidemiológica (NOTI / NETLAB) ──────


class CasoNotiResponse(BaseModel):
    id: str
    departamento: Optional[str] = None
    provincia: Optional[str] = None
    distrito: Optional[str] = None
    ubigeo_lugar_infeccion: Optional[str] = None
    enfermedad: str
    ano_epidemiologico: Optional[int] = None
    semana_epidemiologica: Optional[int] = None
    diagnostico_cie10: Optional[str] = None
    tipo_diagnostico: Optional[str] = None
    diresa_notifica: Optional[str] = None
    edad: Optional[int] = None
    tipo_edad: Optional[str] = None
    sexo: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    fecha_notificacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class CasoNetlabResponse(BaseModel):
    id: str
    fecha_corte: Optional[datetime] = None
    eess_origen_departamento: Optional[str] = None
    eess_origen_provincia: Optional[str] = None
    eess_origen_distrito: Optional[str] = None
    departamento_paciente_reniec: Optional[str] = None
    provincia_paciente_reniec: Optional[str] = None
    distrito_paciente_reniec: Optional[str] = None
    ubigeo_paciente_actual: Optional[str] = None
    edad_paciente: Optional[int] = None
    sexo_paciente: Optional[str] = None
    nombre_examen: Optional[str] = None
    dx_molecular_dengue: Optional[str] = None
    serotipo_dengue: Optional[str] = None
    elisa_ns1: Optional[str] = None
    fecha_validado: Optional[datetime] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None

    class Config:
        from_attributes = True
