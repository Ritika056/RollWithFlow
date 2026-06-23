#!/usr/bin/env sh
set -eu
(cd backend && python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8001) &
(cd frontend && npm run dev) &
wait
