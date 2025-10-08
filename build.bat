@echo off
echo ===============================================
echo SS Mudyf - Force Clean and Build
echo ===============================================
echo.

echo [Step 1] Closing any running instances...
taskkill /F /IM "SS Mudyf Production Tracker.exe" 2>nul
taskkill /F /IM electron.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✓ Processes closed
echo.

echo [Step 2] Cleaning build folders...
if exist "dist" (
    echo Removing dist folder...
    rmdir /s /q "dist" 2>nul
    if exist "dist" (
        echo Retrying with force delete...
        rd /s /q "dist" 2>nul
        timeout /t 1 /nobreak >nul
    )
)
echo ✓ dist folder removed
echo.

echo [Step 3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b %errorlevel%
)
echo ✓ Dependencies installed
echo.

echo [Step 4] Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build React app
    pause
    exit /b %errorlevel%
)
echo ✓ React app built
echo.

echo [Step 5] Packaging Electron app...
call npm run electron:build
if %errorlevel% neq 0 (
    echo ERROR: Failed to package Electron app
    pause
    exit /b %errorlevel%
)
echo ✓ Electron app packaged
echo.

echo [Step 6] Build complete!
echo.
echo ===============================================
echo Your installer is ready in the 'dist' folder!
echo ===============================================
echo.
echo Look for:
echo - SS Mudyf Production Tracker Setup 1.0.0.exe
echo.

pause