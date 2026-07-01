@echo off
setlocal
cd /d "%~dp0"
set PORT=8765
set URL=http://127.0.0.1:%PORT%/

where python >nul 2>&1
if errorlevel 1 (
  echo Python no encontrado. Abriendo HTML directo...
  start "" "%~dp0index.html"
  pause
  exit /b 1
)

echo Iniciando servidor SAMPLAST en %URL%
start "" chrome.exe %URL% 2>nul || start "" msedge.exe %URL% 2>nul || start "" %URL%
python -m http.server %PORT%