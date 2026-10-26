"""
Script de inicialización de datos demo para SIVAPRE
Permite inicializar usuarios de prueba, reportes ciudadanos en la zona piloto (Iquitos: Punchana, Belén, Cercado)
y registros de interoperabilidad NOTI (CDC) y NETLAB (INS).
"""
import os
import sys
from datetime import datetime, timedelta

# Asegurar path de app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Usuario, Reporte, CasoNoti, CasoNetlab, EstadoReporte
from app.routers.auth import hash_password

def seed():
    print("[INFO] Inicializando base de datos y tablas SIVAPRE...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Crear usuario Administrador / Gestor Sanitario
        admin = db.query(Usuario).filter(Usuario.username == "admin").first()
        if not admin:
            admin = Usuario(
                nombre_completo="Autoridad Sanitaria DIRESA Loreto",
                dni="00000001",
                telefono="987654321",
                municipio="Iquitos",
                username="admin",
                hashed_password=hash_password("admin123"),
                activo=True
            )
            db.add(admin)
            print("  [ADD] Usuario 'admin' (password: admin123) creado.")
        else:
            print("  [INFO] Usuario 'admin' ya existe.")

        # 2. Crear usuario Ciudadano
        ciudadano = db.query(Usuario).filter(Usuario.username == "juanperez").first()
        if not ciudadano:
            ciudadano = Usuario(
                nombre_completo="Juan Pérez Salazar",
                dni="45892147",
                telefono="965432109",
                municipio="Punchana",
                username="juanperez",
                hashed_password=hash_password("123456"),
                activo=True
            )
            db.add(ciudadano)
            print("  [ADD] Usuario 'juanperez' (password: 123456) creado.")

        db.commit()
        db.refresh(admin)
        db.refresh(ciudadano)

        # 3. Reportes Ciudadanos en Zona Piloto (Iquitos, Punchana, Belén)
        reportes_existentes = db.query(Reporte).count()
        if reportes_existentes == 0:
            ahora = datetime.utcnow()
            reportes_demo = [
                Reporte(
                    usuario_id=ciudadano.id,
                    latitud=-3.7319,
                    longitud=-73.2425,
                    tipo_lugar="Vía Pública",
                    tipo_objeto="Llantas",
                    observa_larvas="Sí, claramente",
                    conocimiento_dengue_cercano="Sí",
                    comentarios="Pila de neumáticos con agua estancada tras lluvias intensas.",
                    estado=EstadoReporte.enviado,
                    departamento="Loreto",
                    provincia="Maynas",
                    distrito="Punchana",
                    ubigeo="160108",
                    fecha_reporte=ahora - timedelta(hours=3),
                ),
                Reporte(
                    usuario_id=ciudadano.id,
                    latitud=-3.7667,
                    longitud=-73.2500,
                    tipo_lugar="Vivienda",
                    tipo_objeto="Baldes",
                    observa_larvas="Sí, claramente",
                    conocimiento_dengue_cercano="No lo sé",
                    comentarios="Baldes sin tapa en patio exterior con larvas móviles.",
                    estado=EstadoReporte.en_revision,
                    departamento="Loreto",
                    provincia="Maynas",
                    distrito="Belén",
                    ubigeo="160112",
                    fecha_reporte=ahora - timedelta(days=1),
                ),
                Reporte(
                    usuario_id=ciudadano.id,
                    latitud=-3.7491,
                    longitud=-73.2538,
                    tipo_lugar="Terreno Abandonado",
                    tipo_objeto="Canales",
                    observa_larvas="No estoy seguro",
                    conocimiento_dengue_cercano="Sí",
                    comentarios="Canal de desagüe obstruido cerca a plaza 28 de Julio.",
                    estado=EstadoReporte.verificado,
                    departamento="Loreto",
                    provincia="Maynas",
                    distrito="Iquitos",
                    ubigeo="160101",
                    fecha_reporte=ahora - timedelta(days=2),
                ),
                Reporte(
                    usuario_id=ciudadano.id,
                    latitud=-3.7250,
                    longitud=-73.2480,
                    tipo_lugar="Mercado",
                    tipo_objeto="Plantas",
                    observa_larvas="Sí, claramente",
                    conocimiento_dengue_cercano="Sí",
                    comentarios="Floreros con agua en puesto de plantas del mercado de Punchana.",
                    estado=EstadoReporte.resuelto,
                    departamento="Loreto",
                    provincia="Maynas",
                    distrito="Punchana",
                    ubigeo="160108",
                    fecha_reporte=ahora - timedelta(days=4),
                ),
            ]
            for r in reportes_demo:
                db.add(r)
            print(f"  [ADD] {len(reportes_demo)} reportes ciudadanos demo insertados.")

        # 4. Casos NOTI (CDC Perú)
        casos_noti_existentes = db.query(CasoNoti).count()
        if casos_noti_existentes == 0:
            noti_demo = [
                CasoNoti(
                    id="NOTI-2025-001",
                    departamento="Loreto",
                    provincia="Maynas",
                    distrito="Punchana",
                    ubigeo_lugar_infeccion="160108",
                    ano_epidemiologico=2025,
                    semana_epidemiologica=41,
                    diagnostico_cie10="A90",
                    tipo_diagnostico="S",  # Sospechoso
                    diresa_notifica="DIRESA Loreto",
                    edad=28,
                    tipo_edad="Años",
                    sexo="F",
                    latitud=-3.7340,
                    longitud=-73.2450,
                ),
                CasoNoti(
                    id="NOTI-2025-002",
                    departamento="Loreto",
                    provincia="Maynas",
                    distrito="Belén",
                    ubigeo_lugar_infeccion="160112",
                    ano_epidemiologico=2025,
                    semana_epidemiologica=41,
                    diagnostico_cie10="A90",
                    tipo_diagnostico="P",  # Probable
                    diresa_notifica="DIRESA Loreto",
                    edad=34,
                    tipo_edad="Años",
                    sexo="M",
                    latitud=-3.7650,
                    longitud=-73.2520,
                ),
                CasoNoti(
                    id="NOTI-2025-003",
                    departamento="Loreto",
                    provincia="Maynas",
                    distrito="Iquitos",
                    ubigeo_lugar_infeccion="160101",
                    ano_epidemiologico=2025,
                    semana_epidemiologica=42,
                    diagnostico_cie10="A90",
                    tipo_diagnostico="P",  # Probable
                    diresa_notifica="DIRESA Loreto",
                    edad=19,
                    tipo_edad="Años",
                    sexo="F",
                    latitud=-3.7480,
                    longitud=-73.2510,
                ),
            ]
            for n in noti_demo:
                db.add(n)
            print(f"  [ADD] {len(noti_demo)} casos NOTI (CDC) insertados.")

        # 5. Casos NETLAB (INS Perú)
        casos_netlab_existentes = db.query(CasoNetlab).count()
        if casos_netlab_existentes == 0:
            netlab_demo = [
                CasoNetlab(
                    id="NETLAB-2025-L01",
                    fecha_corte=datetime.utcnow() - timedelta(days=2),
                    eess_origen_departamento="Loreto",
                    eess_origen_provincia="Maynas",
                    eess_origen_distrito="Punchana",
                    departamento_paciente_reniec="Loreto",
                    provincia_paciente_reniec="Maynas",
                    distrito_paciente_reniec="Punchana",
                    ubigeo_paciente_actual="160108",
                    edad_paciente=28,
                    sexo_paciente="F",
                    nombre_examen="Dengue RT-PCR",
                    dx_molecular_dengue="Positivo",
                    serotipo_dengue="DENV-2",
                    elisa_ns1="Reactivo",
                    fecha_validado=datetime.utcnow() - timedelta(days=1),
                    latitud=-3.7325,
                    longitud=-73.2435,
                ),
                CasoNetlab(
                    id="NETLAB-2025-L02",
                    fecha_corte=datetime.utcnow() - timedelta(days=3),
                    eess_origen_departamento="Loreto",
                    eess_origen_provincia="Maynas",
                    eess_origen_distrito="Iquitos",
                    departamento_paciente_reniec="Loreto",
                    provincia_paciente_reniec="Maynas",
                    distrito_paciente_reniec="Iquitos",
                    ubigeo_paciente_actual="160101",
                    edad_paciente=45,
                    sexo_paciente="M",
                    nombre_examen="Dengue RT-PCR",
                    dx_molecular_dengue="Positivo",
                    serotipo_dengue="DENV-1",
                    elisa_ns1="Reactivo",
                    fecha_validado=datetime.utcnow() - timedelta(days=2),
                    latitud=-3.7510,
                    longitud=-73.2560,
                ),
            ]
            for l in netlab_demo:
                db.add(l)
            print(f"  [ADD] {len(netlab_demo)} casos NETLAB (INS) insertados.")

        db.commit()
        print("[OK] Inicialización de datos completada exitosamente.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error durante el seed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
