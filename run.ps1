Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Starting PlantCure AI - Plant Disease Detection" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $RootPath) {
    $RootPath = (Get-Location).Path
}

Write-Host "[1/2] Launching Django Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$RootPath\backend`" && python manage.py runserver 127.0.0.1:8000"

Start-Sleep -Seconds 3

Write-Host "[2/2] Launching React Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$RootPath\frontend`" && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

Start-Sleep -Seconds 2

Write-Host "Both servers are running! Opening browser..." -ForegroundColor Cyan
Start-Process "http://127.0.0.1:5173/"
