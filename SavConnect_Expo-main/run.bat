@echo off
echo ===================================================
echo             SavConnect Dev Launcher
echo ===================================================
echo.

:: 1. Start FastAPI backend in a new command prompt window
echo [1/2] Starting FastAPI backend on port 8000...
start "SavConnect Backend" cmd /k "cd backend && call .\venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Give the backend 3 seconds to spin up
timeout /t 3 /nobreak > nul

:: 2. Start Expo Metro Bundler in the current window
echo [2/2] Starting Expo (Metro Bundler) for Web...
echo.
echo Press 'w' in the Metro Bundler console if the browser does not open automatically.
echo.

cd frontend
call npx expo start --web --port 8081
