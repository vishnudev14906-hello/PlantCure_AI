@echo off
title PlantCure AI Launcher
echo ===================================================
echo   Starting PlantCure AI - Plant Disease Detection
echo ===================================================

echo [1/2] Launching Django Backend on http://127.0.0.1:8000 ...
start "PlantCure Backend (Django)" cmd /k "cd /d "%~dp0backend" && python manage.py runserver 127.0.0.1:8000"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React Vite Frontend on http://127.0.0.1:5173 ...
start "PlantCure Frontend (React Vite)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul

echo ===================================================
echo   Servers started successfully!
echo   Frontend URL: http://127.0.0.1:5173/
echo   Backend API:  http://127.0.0.1:8000/api/
echo ===================================================

start http://127.0.0.1:5173/
