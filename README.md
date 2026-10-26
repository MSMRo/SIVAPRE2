# 🦟 SIVAPRE — Sistema Integrado de Vigilancia y Predicción en Salud

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![uv](https://img.shields.io/badge/uv-Astral%20Fast%20Packaging-DE5FE9.svg?style=flat&logo=python&logoColor=white)](https://docs.astral.sh/uv/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2054-000020.svg?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E.svg?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com)

**SIVAPRE** es un ecosistema tecnológico diseñado para transformar la vigilancia tradicional del dengue en el Perú de un modelo reactivo a una estrategia de **prevención inteligente, proactiva y predictiva**. 

Integra de manera sinérgica tres fuentes fundamentales de información:
1. **Inteligencia Comunitaria:** Reporte rápido georreferenciado de criaderos de zancudos mediante una App Móvil ciudadana (*Offline-First*).
2. **Vigilancia Clínica:** Datos de casos sospechosos y probables del sistema **NOTI** (Centro Nacional de Epidemiología, Prevención y Control de Enfermedades — CDC Perú).
3. **Diagnóstico Laboratorial:** Casos confirmados por RT-PCR/ELISA y caracterización de serotipos virales (**DENV-1** a **DENV-4**) del sistema **NETLAB** (Instituto Nacional de Salud — INS).

Toda la información converge en un **Dashboard de Gestión Unificado** con mapas de calor geoespaciales, KPIs en tiempo real y gráficos epidemiológicos para la toma de decisiones rápidas de las autoridades sanitarias.

---

## 📐 Arquitectura del Sistema

### 1. Arquitectura General del Ecosistema (Modelo de 3 Capas)

```mermaid
graph TD
    subgraph "1. Capa de Recolección (Ciudadanía)"
        A["📱 SIVAPRE App (React Native / Expo)"]
        A1["Evidencia Fotográfica (<60s)"]
        A2["Geolocalización GPS Automática"]
        A3["Checklist (Lugar, Objeto, Larvas)"]
        A4["Almacenamiento Local Offline (AsyncStorage)"]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end

    subgraph "2. Capa Central de Procesamiento e Integración"
        B["⚡ Núcleo Backend (FastAPI REST API)"]
        B1["JWT Auth & Control de Roles"]
        B2["Geocodificación a UBIGEO (Nominatim)"]
        B3["Filtros Optimizados y Consultas SQL"]
        B --> B1
        B --> B2
        B --> B3

        subgraph "Bases de Datos & Almacenamiento"
            DB_LOCAL[("🐘 PostgreSQL Local (PC / Docker)")]
            DB_CLOUD[("⚡ Supabase PostgreSQL (Producción)")]
            STORAGE_LOCAL["📁 Carpeta /uploads"]
            STORAGE_CLOUD["☁️ Supabase Storage ('reportes-fotos')"]
        end

        B -->|Entorno Pruebas| DB_LOCAL
        B -->|Entorno Pruebas| STORAGE_LOCAL
        B -->|Entorno Producción| DB_CLOUD
        B -->|Entorno Producción| STORAGE_CLOUD
    end

    subgraph "Fuentes Externas de Salud Pública"
        NOTI["🏥 CDC Perú — NOTI (Casos Sospechosos / Probables)"]
        NETLAB["🧪 INS Perú — NETLAB (Casos Confirmados & Serotipos DENV)"]
        NOTI -.->|Exportación / API| B
        NETLAB -.->|Exportación / API| B
    end

    subgraph "3. Capa de Decisión Sanitaria (Autoridades / Epidemiólogos)"
        C["💻 SIVAPRE Dashboard (React + Leaflet GIS + Recharts)"]
        C1["🗺️ Mapa Multicapa (Heatmap SIVAPRE + Puntos NOTI + Pines NETLAB)"]
        C2["📊 KPIs en Tiempo Real (Larvas, Sospechosos, Confirmados)"]
        C3["📈 Tendencia Semanal de Casos"]
        C4["🚨 Feed de Acción Inmediata y Asignación de Brigadas"]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
    end

    A4 -->|Sincronización cuando hay Internet| B
    A -->|Peticiones Online HTTPS| B
    B -->|Datos Geoespaciales Consolidados| C
```

---

### 2. Flujo de Interoperabilidad y Correlación Epidemiológica

```mermaid
sequenceDiagram
    autonumber
    actor Vecino as Ciudadano / Vigilante
    participant App as SIVAPRE Mobile App
    participant Central as FastAPI Central Hub
    participant DB as PostgreSQL / Supabase
    participant NOTI_NETLAB as CDC (NOTI) & INS (NETLAB)
    participant Dashboard as Dashboard Sanitario

    Vecino->>App: Registra criadero con foto + GPS
    alt Sin Conexión a Internet
        App->>App: Encola reporte en almacenamiento local (AsyncStorage)
        Note over App: Espera restauración de red
        App->>Central: Sincroniza en background al detectar señal
    else Con Conexión
        App->>Central: POST /reportes (Datos + Foto)
    end

    Central->>Central: Convierte Coordenadas a UBIGEO (Departamento/Provincia/Distrito)
    Central->>DB: Guarda reporte con estado 'Enviado'

    NOTI_NETLAB->>Central: Sincronización de casos clínicos y serotipos (NOTI/NETLAB)
    Central->>DB: Registra casos clasificados por UBIGEO

    Dashboard->>Central: GET /reportes/todos (Filtros: Fecha, UBIGEO, Larvas)
    Central->>Dashboard: Retorna GeoJSON y estadísticas unificadas

    Note over Dashboard: Superpone criaderos activos sobre casos NOTI y serotipos NETLAB
    Dashboard->>Dashboard: Detecta "Puntos Calientes" (Hotspots de alto riesgo)
    Dashboard->>Central: PATCH /reportes/:id/estado ('En Revisión' -> Brigada Asignada)
```

---

### 3. Flujo Offline-First en la App Móvil (React Native)

```mermaid
stateDiagram-v2
    [*] --> FormularioReporte: Ciudadano abre pantalla "Nuevo Reporte"
    FormularioReporte --> CapturaDatos: Toma foto, captura GPS, llena checklist
    CapturaDatos --> ValidarConexion: Presiona "Enviar Reporte"

    state ValidarConexion <<choice>>
    ValidarConexion --> OnlineEnvio: Hay conexión a Internet
    ValidarConexion --> OfflineCola: Sin señal / Red inestable

    state OnlineEnvio {
        SubirFotoAPI: POST /reportes/upload-foto (Supabase Storage / uploads)
        CrearReporteAPI: POST /reportes/ (Guardar en Base de Datos)
        SubirFotoAPI --> CrearReporteAPI
    }

    state OfflineCola {
        GuardarAsyncStorage: Guarda reporte con ID temporal y ruta local de la foto
        AlertaUsuario: Notifica "Guardado en el dispositivo"
        GuardarAsyncStorage --> AlertaUsuario
    }

    OnlineEnvio --> FinExito: Reporte publicado en tiempo real
    OfflineCola --> MonitoreoRed: La app monitorea el estado de red

    MonitoreoRed --> SincronizacionBatch: Conexión restablecida o botón "Sincronizar"
    SincronizacionBatch --> OnlineEnvio: Sube fotos pendientes y envía lote de reportes
    FinExito --> [*]
```

---

## 🗂️ Estructura del Repositorio

```text
SIVAPRE/
├── .github/
│   └── workflows/
│       └── deploy-dashboard.yml        # CI/CD para compilar y desplegar Dashboard a GitHub Pages
├── docker-compose.yml                  # Orquestador (PostgreSQL 15 + FastAPI Backend)
├── postgres-init/
│   └── 01-init.sql                     # Script de inicialización SQL
│
├── sivapre-backend/                    # Núcleo de datos y servicios REST (FastAPI)
│   ├── Dockerfile                      # Imagen Docker Python 3.11-slim
│   ├── requirements.txt                # Dependencias (FastAPI, SQLAlchemy, psycopg2, JWT...)
│   ├── seed_demo.py                    # Script de población de datos demo (Zona piloto Iquitos)
│   ├── .env.example                    # Plantilla de variables de entorno (Local vs Supabase)
│   └── app/
│       ├── database.py                 # Conexión SQLAlchemy con reintentos automáticos
│       ├── main.py                     # Instancia FastAPI, CORS y rutas
│       ├── models.py                   # Modelos ORM (Usuario, Reporte, CasoNoti, CasoNetlab)
│       ├── schemas.py                  # Esquemas Pydantic v2
│       └── routers/
│           ├── auth.py                 # Registro, Login y emisión de JWT
│           ├── reportes.py             # CRUD criaderos, filtros UBIGEO y subida a Supabase
│           └── usuarios.py             # Perfil y roles de usuario
│
├── sivapre-dashboard/                  # Aplicación Web para Autoridades Sanitarias (React)
│   ├── package.json                    # Scripts (start, build, deploy a gh-pages)
│   ├── public/                         # Assets estáticos y HTML base
│   └── src/
│       ├── App.tsx                     # Orquestación del dashboard, autenticación y vistas
│       ├── components/
│       │   ├── FeedReportes.tsx        # Feed en tiempo real con asignación de brigadas
│       │   ├── Filtros.tsx             # Filtros dinámicos por UBIGEO, rango de fechas y capas
│       │   ├── GraficoTendencia.tsx    # Gráfico de área epidemiológico (SIVAPRE, NOTI, NETLAB)
│       │   ├── KPICards.tsx            # Tarjetas de resumen (Reportes, Larvas, NOTI, NETLAB)
│       │   ├── LoginPanel.tsx          # Autenticación de autoridades sanitarias
│       │   └── MapaReportes.tsx        # Mapa interactivo Leaflet (Heatmap + capas de salud)
│       └── services/
│           └── api.ts                  # Cliente Axios desacoplado por REACT_APP_API_URL
│
└── sivapre-frontend/                   # Aplicación Móvil Ciudadana (React Native / Expo)
    ├── app.json                        # Configuración Expo Router y permisos de cámara/GPS
    ├── package.json                    # Dependencias móviles
    ├── app/                            # Expo Router (Estructura de navegación por pantallas)
    │   ├── _layout.tsx                 # Root layout con proveedores de contexto
    │   ├── index.tsx                   # Redirección de autenticación
    │   ├── (auth)/                     # Flujo de bienvenida, login y registro
    │   ├── (tabs)/                     # Pestañas principales
    │   │   ├── inicio.tsx              # Resumen del ciudadano, alertas y KPIs locales
    │   │   ├── reporte.tsx             # Formulario de reporte rápido (<60s) con soporte offline
    │   │   ├── mis-reportes.tsx        # Historial, estados y banner de sincronización offline
    │   │   └── informacion.tsx         # Centro educativo (zancudo, síntomas, mitos/verdades)
    │   └── reporte-detalle/[id].tsx    # Detalle de reporte e intervenciones
    ├── hooks/
    │   └── useReportes.ts              # Hook con gestión offline-first y reintentos
    └── services/
        ├── api.ts                      # Conexión HTTP al Backend
        └── offlineSync.ts              # Motor de persistencia y cola local (AsyncStorage)
```

---

## 🚀 Guía de Inicialización Rápida

### Requisitos Previos

* **Docker & Docker Compose** (recomendado para entorno backend + BD local).
* **Node.js** (v18 o superior) y **npm**.
* **Python** 3.10 o superior (si se desea ejecutar el backend sin Docker).
* **Expo Go** en tu smartphone (Android / iOS) para probar la app móvil.

---

### Opción 1: Despliegue Rápido con Docker Compose (Backend + Base de Datos)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/MSMRo/SIVAPRE.git
   cd SIVAPRE
   ```

2. **Configurar el archivo de entorno del Backend:**
   Copia el archivo de plantilla `.env.example`:
   ```bash
   cp sivapre-backend/.env.example sivapre-backend/.env
   ```

3. **Iniciar los contenedores:**
   ```bash
   docker-compose up --build
   ```
   * PostgreSQL iniciará en `localhost:5432`.
   * El Backend de FastAPI iniciará en `http://localhost:8000`.
   * Documentación interactiva Swagger: `http://localhost:8000/docs`.

4. **Poblar datos de prueba de la Zona Piloto (Iquitos):**
   En otra terminal, ejecuta el script de seed:
   ```bash
   docker exec -it sivapre_backend python seed_demo.py
   ```
   *(Crea automáticamente al administrador `admin` con clave `admin123`, al ciudadano `juanperez` y casos reales en Punchana, Belén e Iquitos Cercado)*.

---

### Opción 2: Ejecución Manual Componente por Componente

#### 1. Backend (FastAPI con `uv` - Ultrarrápido) ⚡

Gracias a **uv**, levantar el backend toma segundos sin necesidad de gestionar entornos virtuales manualmente:

```bash
cd sivapre-backend

# Opción A (Recomendada con uv):
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Para poblar los datos demo con uv:
uv run python seed_demo.py

# Opción B (Tradicional con venv/pip si no tienes uv):
python -m venv venv
# Activar venv (Windows: .\venv\Scripts\activate | Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt
python seed_demo.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Dashboard Web (React)
```bash
cd sivapre-dashboard
npm install
npm start
```
* La aplicación se abrirá en `http://localhost:3000`.
* Inicia sesión con:
  * **Usuario:** `admin`
  * **Contraseña:** `admin123`

#### 3. App Móvil Ciudadana (React Native / Expo)
```bash
cd sivapre-frontend
npm install
npx expo start
```
* Escanea el código QR desde la app **Expo Go** en tu celular.
* Para conectar la app móvil con tu backend local en la misma red Wi-Fi, crea un archivo `.env` en `sivapre-frontend/`:
  ```env
  EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:8000
  ```
  *(Reemplaza `TU_IP_LOCAL` por la IP local de tu PC, ej. `192.168.1.50`)*.

---

## 🗄️ Estrategia de Base de Datos y Almacenamiento

### 1. Desarrollo y Pruebas Locales (Tu PC)
* **Base de Datos:** PostgreSQL 15 ejecutándose localmente (vía Docker en el puerto 5432 o servicio PostgreSQL nativo).
* **Almacenamiento de Fotos:** Se guardan en la carpeta local `sivapre-backend/uploads/` y se exponen públicamente mediante FastAPI Static Files en `http://localhost:8000/uploads/...`.
* **Configuración en `.env`:**
  ```env
  DATABASE_URL=postgresql://postgres:admin@localhost:5432/sivapre_db
  ```

---

### 2. Producción con Supabase (Datos + Storage de Fotos)

[Supabase](https://supabase.com) proporciona PostgreSQL administrado y almacenamiento de archivos mediante buckets con CDN global.

#### Paso A: Configurar la Base de Datos en Supabase
1. Ingresa a [supabase.com](https://supabase.com) y crea un nuevo proyecto (ej. `sivapre-produccion`).
2. Ve a **Project Settings** -> **Database**.
3. En la sección **Connection string**, selecciona el modo **URI**.
4. Copia la URL de conexión y reemplaza tu contraseña:
   ```text
   postgresql://postgres:[TU_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
5. En el backend de producción (o en tu archivo `.env`), asigna esta URL a `DATABASE_URL`.
   * Al iniciar el backend, SQLAlchemy creará automáticamente todas las tablas (`usuarios`, `reportes`, `casos_noti`, `casos_netlab`).

#### Paso B: Configurar el Bucket de Almacenamiento de Fotos
1. En el panel de Supabase, entra a la sección **Storage**.
2. Haz clic en **New Bucket**:
   * **Name:** `reportes-fotos`
   * Marca la casilla: **Public bucket** (para que las fotos puedan ser leídas por el Dashboard y la App).
3. Configura las Políticas de Seguridad (Storage Policies):
   * Ve a **Configuration** -> **Policies** en el bucket `reportes-fotos`.
   * Agrega una política para permitir inserción de imágenes:
     * Nombre: *Permitir subida de reportes*
     * Operación permitida: `INSERT`
     * Target roles: `anon`, `authenticated`
     * With check expression: `true`

#### Paso C: Configurar Variables de Producción en el Backend
Agrega las siguientes variables en el entorno de producción (o en `sivapre-backend/.env`):
```env
DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_KEY=[TU_SUPABASE_SERVICE_ROLE_KEY_O_ANON_KEY]
SUPABASE_BUCKET=reportes-fotos
```
> **Nota de Arquitectura:** El endpoint `/reportes/upload-foto` detectará automáticamente la presencia de `SUPABASE_URL` y subirá las imágenes directamente al bucket de Supabase, retornando la URL pública en el CDN de Supabase (`https://[PROJECT_REF].supabase.co/storage/v1/object/public/reportes-fotos/...`). Si estas variables no están presentes, funciona en modo local en la carpeta `uploads/`.

---

## 📱 Funcionamiento Offline-First en la App Móvil

Las brigadas y los ciudadanos en zonas endémicas (como la selva o periferias urbanas) frecuentemente no cuentan con cobertura 4G/5G constante. SIVAPRE soluciona esto mediante una arquitectura **Offline-First**:

1. **Captura sin Conexión:**
   * El ciudadano toma la fotografía y el GPS del dispositivo obtiene las coordenadas satelitales directamente del hardware GPS (sin requerir internet).
   * Al presionar **"Enviar Reporte"**, la app detecta si hay conectividad.
   * Si no hay internet, el reporte y la referencia a la foto local se guardan de inmediato en la cola interna de `@react-native-async-storage/async-storage`.
   * El usuario recibe una notificación clara: *"💾 Guardado en el dispositivo (sin conexión). Se sincronizará automáticamente cuando recuperes internet"*.

2. **Gestión de la Cola y Sincronización:**
   * En la pestaña **"Mis Reportes"**, si existen reportes pendientes de sincronización, se despliega un **banner naranja** indicando la cantidad de reportes encolados.
   * Dispone de un botón interactivo **"Sincronizar ahora"**.
   * Al recuperar la señal de datos o conectarse a una red Wi-Fi, la función `sincronizarReportesConServidor()` sube las fotos pendientes al servidor/Supabase, envía la información estructurada y elimina los registros locales una vez confirmada la persistencia.

---

## 🌐 Publicación en GitHub y Despliegue en GitHub Pages

### 1. Subir el Proyecto a GitHub
Si aún no has subido los cambios a tu repositorio:
```bash
git add .
git commit -m "feat: arquitectura completa SIVAPRE, soporte offline-first, supabase y diagramas mermaid"
git branch -M main
git push -u origin main
```

---

### 2. Despliegue del Dashboard en GitHub Pages

El proyecto incluye un flujo de automatización con **GitHub Actions** en [`.github/workflows/deploy-dashboard.yml`](.github/workflows/deploy-dashboard.yml).

#### Despliegue Automático (Recomendado):
1. Cada vez que hagas un `git push origin main` modificando el dashboard, GitHub Actions compilará automáticamente el proyecto y creará la rama `gh-pages`.
2. En tu repositorio en GitHub, ve a **Settings** -> **Pages**.
3. En la sección **Build and deployment**:
   * **Source:** `Deploy from a branch`
   * **Branch:** Selecciona `gh-pages` / `/ (root)`
   * Guarda los cambios.
4. Tu Dashboard estará visible en:
   ```text
   https://MSMRo.github.io/SIVAPRE/
   ```

#### Despliegue Manual desde tu PC:
Si prefieres compilar y publicar directamente desde tu computadora:
```bash
cd sivapre-dashboard
npm install
npm run deploy
```

---

## 👥 Cuentas de Acceso Pre-configuradas (Demo)

| Rol | Usuario | Contraseña | Propósito |
| :--- | :--- | :--- | :--- |
| **Autoridad Sanitaria / Gestor** | `admin` | `admin123` | Acceso al Dashboard, visualización de mapas de calor, KPIs y asignación de brigadas |
| **Ciudadano / Vigilante** | `juanperez` | `123456` | Acceso a la App Móvil, envío de reportes de criaderos y seguimiento |

---

## 🏆 Equipo del Proyecto SIVAPRE

* **Leidy Jara** — Universidad Peruana Cayetano Heredia (UPCH)
* **Josselyn Ataurima** — Universidad Peruana Cayetano Heredia (UPCH)
* **Omar Roca** — Universidad de Ingeniería y Tecnología (UTEC)
* **Fiorella Pacheco** — Universidad Científica del Sur

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Para más detalles, consulta el archivo `LICENSE`.
