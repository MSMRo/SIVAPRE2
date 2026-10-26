@echo off
chcp 65001 >nul
title SIVAPRE App Móvil (Expo)

echo =====================================================================
echo    📱 SIVAPRE - App Móvil Ciudadana (React Native / Expo)
echo =====================================================================
echo.
cd sivapre-frontend
call npx expo start
pause
