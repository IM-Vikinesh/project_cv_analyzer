@echo off
echo ========================================
echo   JobNex AI - Setup Script
echo ========================================
echo.

echo [1/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing Node.js dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo Failed to install Node.js dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Configuring environment variables...
echo Copy backend\.env.example to backend\.env and configure your credentials
copy /-Y backend\.env.example backend\.env 2>nul
echo Copy frontend\.env.example to frontend\.env and configure your credentials
copy /-Y frontend\.env.example frontend\.env 2>nul

echo.
echo [4/4] Installation complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Configure backend/.env with your credentials:
echo    - Firebase credentials
echo    - OpenAI / Google API keys
echo.
echo 2. Start the backend:
echo    cd backend
echo    python app.py
echo.
echo 3. Start the frontend (in a new terminal):
echo    cd frontend
echo    npm start
echo.
echo ========================================
echo.
pause
