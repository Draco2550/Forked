@echo off
echo Starting Food Detection Upload System...
echo.

echo Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing Node.js dependencies
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing Python dependencies
    pause
    exit /b 1
)

echo.
echo Starting YOLO API server (Python)...
start "YOLO API Server" cmd /k "py yolo_api_server.py"

echo Waiting for YOLO API server to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Node.js web server...
start "Web Server" cmd /k "set node_env=production && npm start"

echo.
echo Both servers are starting...
echo YOLO API Server: http://localhost:5000
echo Web Interface: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul

