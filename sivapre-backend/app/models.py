# models.py

from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, Enum, Integer
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum


class EstadoReporte(str, enum.Enum):
    enviado = "Enviado"
    en_revision = "En Revisión"
    verificado = "Verificado"
    resuelto = "Resuelto"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre_completo = Column(String(100), nullable=False)
    dni = Column(String(8), unique=True, nullable=False)
    telefono = Column(String(15), nullable=True)
    municipio = Column(String(100), nullable=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    activo = Column(Boolean, default=True)


class Reporte(Base):
    __tablename__ = "reportes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(String, nullable=False)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    foto_url = Column(String, nullable=True)
    tipo_lugar = Column(String(50), nullable=False)
    tipo_objeto = Column(String(50), nullable=False)
    observa_larvas = Column(String(30), nullable=False)
    conocimiento_dengue_cercano = Column(String(20), nullable=False)
    comentarios = Column(Text, nullable=True)
    estado = Column(Enum(EstadoReporte), default=EstadoReporte.enviado)
    departamento = Column(String(100), nullable=True)
    provincia = Column(String(100), nullable=True)
    distrito = Column(String(100), nullable=True)
    ubigeo = Column(String(10), nullable=True)
    fecha_reporte = Column(DateTime(timezone=True), server_default=func.now())


class CasoNoti(Base):
    """Vigilancia clínica epidemiológica (CDC Perú - NOTI)"""
    __tablename__ = "casos_noti"

    id = Column(String, primary_key=True, default=lambda: f"NOTI-{uuid.uuid4().hex[:8]}")
    departamento = Column(String(100), nullable=True)
    provincia = Column(String(100), nullable=True)
    distrito = Column(String(100), nullable=True)
    ubigeo_lugar_infeccion = Column(String(10), nullable=True)
    enfermedad = Column(String(50), default="Dengue")
    ano_epidemiologico = Column(Integer, nullable=True)
    semana_epidemiologica = Column(Integer, nullable=True)
    diagnostico_cie10 = Column(String(20), nullable=True)
    tipo_diagnostico = Column(String(20), nullable=True)  # 'C'=Confirmado, 'P'=Probable, 'S'=Sospechoso
    diresa_notifica = Column(String(100), nullable=True)
    edad = Column(Integer, nullable=True)
    tipo_edad = Column(String(20), nullable=True)
    sexo = Column(String(10), nullable=True)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    fecha_notificacion = Column(DateTime(timezone=True), server_default=func.now())


class CasoNetlab(Base):
    """Diagnóstico laboratorial y serotipificación (INS Perú - NETLAB)"""
    __tablename__ = "casos_netlab"

    id = Column(String, primary_key=True, default=lambda: f"LAB-{uuid.uuid4().hex[:8]}")
    fecha_corte = Column(DateTime(timezone=True), nullable=True)
    eess_origen_departamento = Column(String(100), nullable=True)
    eess_origen_provincia = Column(String(100), nullable=True)
    eess_origen_distrito = Column(String(100), nullable=True)
    departamento_paciente_reniec = Column(String(100), nullable=True)
    provincia_paciente_reniec = Column(String(100), nullable=True)
    distrito_paciente_reniec = Column(String(100), nullable=True)
    ubigeo_paciente_actual = Column(String(10), nullable=True)
    edad_paciente = Column(Integer, nullable=True)
    sexo_paciente = Column(String(10), nullable=True)
    nombre_examen = Column(String(100), nullable=True)  # RT-PCR, ELISA NS1
    dx_molecular_dengue = Column(String(50), nullable=True)  # Positivo, Negativo
    serotipo_dengue = Column(String(20), nullable=True)  # DENV-1, DENV-2, DENV-3, DENV-4
    elisa_ns1 = Column(String(50), nullable=True)  # Reactivo, No Reactivo
    fecha_validado = Column(DateTime(timezone=True), nullable=True)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
