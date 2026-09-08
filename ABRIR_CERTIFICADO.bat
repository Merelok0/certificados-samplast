@echo off
setlocal
cd /d "%~dp0"

set PORT=8765
set URL=http://127.0.0.1:%PORT%/

echo ================================================
echo   SAMPLAST - CERTIFICADOS DE CALIDAD
echo ================================================

where python >nul 2>&1
if errorlevel 1 (
  echo.
  echo Python no encontrado. Abriendo index.html directamente...
  start "" "%~dp0index.html"
  exit /b 0
)

echo.
echo Iniciando servidor local en %URL%
start "SAMPLAST SERVER" /min cmd /c "cd /d ""%~dp0"" && python -m http.server %PORT% --bind 127.0.0.1"

rem Dar tiempo al servidor para iniciar antes de abrir el navegador
timeout /t 2 /nobreak >nul

echo Abriendo SAMPLAST en el navegador...
start "" "%URL%"

exit /b 0
