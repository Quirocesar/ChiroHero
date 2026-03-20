@echo off
echo ========================================
echo   ChiroHero PWA Build Script
echo ========================================
echo.

REM Build the web version
echo [1/5] Building web version...
call npx expo export --platform web
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

REM Copy PWA manifest
echo [2/5] Copying PWA manifest...
copy /Y public\manifest.json dist\ >nul

REM Copy service worker
echo [3/5] Copying service worker...
copy /Y public\sw.js dist\ >nul

REM Copy PWA icons
echo [4/5] Copying PWA icons...
copy /Y assets\icon.png dist\icon-192.png >nul
copy /Y assets\icon.png dist\icon-512.png >nul

REM Add PWA meta tags to index.html
echo [5/5] Adding PWA meta tags...
node scripts\add-pwa-tags.js

echo.
echo ========================================
echo   Build complete!
echo ========================================
echo.
echo The PWA files are in the 'dist' folder.
echo You can deploy this folder to any static host.
echo.
echo To test locally, run:
echo   npx serve dist
echo.
pause
