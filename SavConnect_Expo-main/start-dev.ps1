# SavConnect Dev Launcher
# Run this script from the c:\PDD directory with:
#   PowerShell -ExecutionPolicy Bypass -File start-dev.ps1

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   SavConnect Dev Environment" -ForegroundColor Cyan  
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Start FastAPI backend in a new window ──────────────────────────────────
Write-Host "[1/2] Starting FastAPI backend on port 8000..." -ForegroundColor Yellow

$backendPath = Join-Path $PSScriptRoot "backend"
$venvActivate = Join-Path $backendPath "venv\Scripts\Activate.ps1"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "cd '$backendPath'; & '$venvActivate'; Write-Host 'Backend starting...' -ForegroundColor Green; uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
) -WindowStyle Normal

# Give uvicorn 3 seconds to start up
Start-Sleep -Seconds 3

# ── 2. Start Expo in this window ──────────────────────────────────────────────
Write-Host "[2/2] Starting Expo (Metro Bundler)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Scan the QR code with Expo Go to open on your phone." -ForegroundColor Green
Write-Host "Press 'w' to open in your web browser (no firewall needed)." -ForegroundColor Green
Write-Host ""

Set-Location (Join-Path $PSScriptRoot "frontend")
npx expo start
