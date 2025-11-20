@echo off
setlocal enabledelayedexpansion
echo Starting Food Detection Upload System...
echo.

echo Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo Error installing Node.js dependencies
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error installing Python dependencies
    pause
    exit /b 1
)

@REM echo.
@REM echo Checking Ollama installation...
@REM set OLLAMA_FOUND=0
@REM ollama --version >nul 2>&1
@REM if not errorlevel 1 (
@REM     set OLLAMA_FOUND=1
@REM     echo Ollama found in PATH.
@REM ) else (
@REM     echo Ollama not found in PATH. Checking common installation locations...
    
@REM     REM Check common Windows installation locations
@REM     if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
@REM         set "OLLAMA_PATH=%LOCALAPPDATA%\Programs\Ollama"
@REM         echo Found Ollama at: %OLLAMA_PATH%
@REM         set "PATH=%OLLAMA_PATH%;%PATH%"
@REM         set OLLAMA_FOUND=1
@REM     ) else if exist "%ProgramFiles%\Ollama\ollama.exe" (
@REM         set "OLLAMA_PATH=%ProgramFiles%\Ollama"
@REM         echo Found Ollama at: %OLLAMA_PATH%
@REM         set "PATH=%OLLAMA_PATH%;%PATH%"
@REM         set OLLAMA_FOUND=1
@REM     ) else (
@REM         REM Check Program Files (x86) with proper escaping
@REM         if exist "C:\Program Files (x86)\Ollama\ollama.exe" (
@REM             set "OLLAMA_PATH=C:\Program Files (x86)\Ollama"
@REM             echo Found Ollama at: %OLLAMA_PATH%
@REM             set "PATH=%OLLAMA_PATH%;%PATH%"
@REM             set OLLAMA_FOUND=1
@REM         ) else if exist "C:\Program Files\Ollama\ollama.exe" (
@REM             set "OLLAMA_PATH=C:\Program Files\Ollama"
@REM             echo Found Ollama at: %OLLAMA_PATH%
@REM             set "PATH=%OLLAMA_PATH%;%PATH%"
@REM             set OLLAMA_FOUND=1
@REM         ) else (
@REM             echo Warning: Ollama not found in common locations.
@REM             echo Please ensure Ollama is installed or add it to your PATH.
@REM             echo You can download it from https://ollama.ai
@REM             echo.
@REM             echo Continuing without Ollama (recipe generation will not work)...
@REM             set OLLAMA_FOUND=0
@REM         )
@REM     )
@REM )

@REM if !OLLAMA_FOUND!==1 (
@REM     echo Ollama found. Checking for qwen3:4b model...
@REM     ollama list | findstr /C:"qwen3:4b" >nul 2>&1
@REM     if errorlevel 1 (
@REM         echo Model qwen3:4b not found. Pulling model...
@REM         ollama pull qwen3:4b
@REM         if errorlevel 1 (
@REM             echo Error pulling qwen3:4b model. Recipe generation may not work.
@REM         ) else (
@REM             echo Model qwen3:4b pulled successfully.
@REM         )
@REM     ) else (
@REM         echo Model qwen3:4b is already available.
@REM     )
    
@REM     echo.
@REM     echo Checking if Ollama server is already running...
@REM     netstat -an | findstr /C:"127.0.0.1:11434" /C:"0.0.0.0:11434" >nul 2>&1
@REM     if not errorlevel 1 (
@REM         echo Ollama server is already running on port 11434.
@REM         echo Skipping Ollama server start.
@REM     ) else (
@REM         echo Starting Ollama server...
@REM         start "Ollama Server" cmd /k "ollama serve"
@REM         echo Waiting for Ollama server to start...
@REM         timeout /t 3 /nobreak > nul
@REM         echo Ollama server started. The qwen3:4b model will be loaded on first use.
@REM     )
@REM )

echo.
echo Starting YOLO API server (Python)...
start "YOLO API Server" cmd /k "py yolo_api_server.py"

echo Waiting for YOLO API server to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Node.js web server...
start "Web Server" cmd /k "set node_env=production && npm start"

echo.
echo All servers are starting...
echo Ollama Server: http://localhost:11434 (if running)
echo YOLO API Server: http://localhost:5000
echo Web Interface: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul

