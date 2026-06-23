@echo off
start "RollWithFlow Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001"
start "RollWithFlow Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
