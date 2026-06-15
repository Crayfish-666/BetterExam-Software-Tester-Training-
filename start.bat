@echo off
title BetterExam Server
echo =========================================
echo    Starting BetterExam Environment
echo =========================================
echo.
echo [1/2] Starting Node.js API Backend on Port 3001...
start "BetterExam Backend" cmd /k "cd backend && node server.js"

echo [2/2] Starting React Frontend on Port 5173...
start "BetterExam Frontend" cmd /k "cd frontend && npm run dev -- --open"

echo.
echo BetterExam is starting!
echo The browser will open automatically.
echo If not, please manually visit: http://localhost:5173
echo.
pause
