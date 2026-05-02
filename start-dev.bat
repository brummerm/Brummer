@echo off
REM Local dev: run FastAPI on :8000 and the meal planner Vite dev server on :5173.
REM Open http://localhost:8000 to use the dashboard.
REM The Vite dev server proxies /api and /images to the FastAPI server.
REM
REM First-time setup (run once, then comment out):
REM   cd server && python -m venv .venv && .venv\Scripts\pip install -r requirements.txt
REM   cd ..\apps\meal-planner && npm install
REM
REM Then make a .env file in server\ with at least AUTH_PASSWORD_HASH and JWT_SECRET.

set ROOT=%~dp0

echo Building dashboard static into server\static...
if not exist "%ROOT%server\static\dashboard" mkdir "%ROOT%server\static\dashboard"
if not exist "%ROOT%server\static\login"     mkdir "%ROOT%server\static\login"
xcopy /E /Y /I "%ROOT%dashboard\dashboard\*" "%ROOT%server\static\dashboard\" > nul
xcopy /E /Y /I "%ROOT%dashboard\login\*"     "%ROOT%server\static\login\"     > nul

echo Starting backend on :8000 ...
start "Brummer Backend" cmd /k "cd /d %ROOT%server && set DEV_RELOAD=1 && .venv\Scripts\python run.py"

timeout /t 2 /nobreak > nul

echo Starting meal planner dev server on :5173 ...
start "Meal Planner Vite" cmd /k "cd /d %ROOT%apps\meal-planner && npm run dev"

echo.
echo Dashboard:        http://localhost:8000
echo Meal Planner dev: http://localhost:5173/apps/meal-planner/
echo API docs:         http://localhost:8000/docs
echo.
echo Two terminal windows have opened. Close them to stop the servers.
pause
