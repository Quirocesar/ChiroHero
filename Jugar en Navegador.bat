@echo off
title ChiroHero - Web Server
echo ===================================================
echo   Iniciando servidor web de ChiroHero...
echo   El juego se abrira automaticamente en el navegador.
echo ===================================================
echo.
echo Iniciando servidor en segundo plano...
start "Expo Server" cmd /c "npm run web"
timeout /t 5 /nobreak
echo Abriendo navegador web...
start http://localhost:8081
pause
