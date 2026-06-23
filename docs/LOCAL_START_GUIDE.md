# Local Start Guide

Frontend: `http://localhost:3000`

Backend: `http://127.0.0.1:8001`

Windows: run `start-local-windows.bat` from the repository root.

macOS/Linux: run `./start-local-mac.sh` from the repository root.

The local database is `backend/rollwithflow.db` unless `DATABASE_URL` changes it. Uploaded audio is in `backend/media/audio`; copy both the database and `backend/media` before making a full local backup. Stop the terminal windows with `Ctrl+C`. Same-Wi-Fi access requires starting services on a LAN-accessible host and updating the frontend backend URL.
