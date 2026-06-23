# RollWithFlow on macOS

From the project folder:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001
```

In a second Terminal:

```bash
cd frontend
npm install
npm run local:fast
```

Open `http://localhost:3000`. The local database is configured by `backend/.env`; uploaded audio is stored in `backend/media/audio`. Stopping either server does not delete songs or uploads. Back up the database by copying the configured SQLite `.db` file while the backend is stopped. For normal imports use Library > Upload Audio or Import Folder. Same-Wi-Fi access needs separate LAN binding and is not enabled by default.
