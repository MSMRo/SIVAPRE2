@echo off
chcp 65001 >nul
title SIVAPRE - Sistema Integrado de Vigilancia y Predicción en Salud

echo =====================================================================
echo    🦟 SIVAPRE - Sistema Integrado de Vigilancia y Predicción
echo =====================================================================
echo.

:: 1. Semilla de datos y base de datos con UV
echo [1/3] Verificando Base de Datos y cargando datos demo con uv...
cd sivapre-backend
set UV_SYSTEM_CERTS=true
call uv run python seed_demo.py
cd ..
echo.

:: 2. Iniciar Backend FastAPI
echo [2/3] Levantando Servidor Backend (FastAPI en http://localhost:8000)...
start "SIVAPRE Backend (FastAPI)" cmd /k "title SIVAPRE Backend (Puerto 8000) && cd sivapre-backend && set UV_SYSTEM_CERTS=true && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo.

:: 3. Iniciar Dashboard Web
echo [3/3] Levantando Dashboard Web (React en http://localhost:3000)...
start "SIVAPRE Dashboard (React)" cmd /k "title SIVAPRE Dashboard Web (Puerto 3000) && cd sivapre-dashboard && npm start"
echo.

echo =====================================================================
echo   ✅ ¡SERVICIOS INICIADOS CORRECTAMENTE!
echo =====================================================================
echo.
echo   • Backend API:        http://localhost:8000
echo   • Swagger Docs:       http://localhost:8000/docs
echo   • Dashboard Web:      http://localhost:3000
echo.
echo   Credenciales de Acceso:
echo     - Gestor Sanitario: admin     / admin123
echo     - Ciudadano Demo:   juanperez / 123456
echo.
echo   Abriendo el Dashboard en tu navegador en 5 segundos...
timeout /t 5 /nobreak >nul
start http://localhost:3000
