@echo off
title ChiroHero - Iniciando...
echo.
echo ========================================
echo   CHIROHERO - CLINIC SIMULATOR
echo   Cargando juego...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Instalando dependencias (si es necesario)...
if not exist "node_modules" (
    echo     Instalando...
    call npm install >nul 2>&1
)

echo [2/3] Compilando juego...
call npx expo export --platform web >nul 2>&1
if errorlevel 1 (
    echo     ERROR: Fallo en la compilacion
    pause
    exit /b 1
)

echo     Compilacion exitosa!

echo [3/3] Copiando archivos PWA...
copy /Y public\manifest.json dist\ >nul 2>&1
copy /Y public\sw.js dist\ >nul 2>&1
copy /Y assets\icon.png dist\icon-192.png >nul 2>&1
copy /Y assets\icon.png dist\icon-512.png >nul 2>&1

echo.
echo ========================================
echo   JUEGO LISTO!
echo   Abriendo en el navegador...
echo ========================================
echo.

start http://localhost:8081
timeout /t 3 /nobreak >nul
start "Expo Server" cmd /c "npm run web"

echo El juego se abrira automaticamente.
echo Si no se abre, visita: http://localhost:8081
echo.
pause
