@echo off
:: ============================================================================
:: FinRight-AI Project Runner
:: ============================================================================
:: This script starts both the Backend (Django) and Frontend (React) servers
:: in separate terminal windows for easier management.
:: ============================================================================

echo Starting FinRight-AI Project...
echo.

:: ----------------------------------------------------------------------------
:: 1. Start Backend Server
:: ----------------------------------------------------------------------------
echo [1/2] Launching Backend Server...
:: Opens a new window with title "FinRight Backend"
:: 1. Changes directory to 'backend'
:: 2. Activates the Python virtual environment (.venv)
:: 3. Runs the Django development server
start "FinRight Backend" cmd /k "cd backend && call venv\Scripts\activate && python manage.py runserver"

:: ----------------------------------------------------------------------------
:: 2. Start Frontend Server
:: ----------------------------------------------------------------------------
echo [2/2] Launching Frontend Server...
:: Opens a new window with title "FinRight Frontend"
:: 1. Changes directory to 'frontend'
:: 2. Runs npm start to launch the React development server
start "FinRight Frontend" cmd /k "cd frontend && npm start"

echo.
echo ============================================================================
echo  Success! Both servers are starting up.
echo  - Backend will be at: http://127.0.0.1:8000
echo  - Frontend will be at: http://localhost:3000
echo.
echo  You can close this window now, or keep it open.
echo ============================================================================
pause
