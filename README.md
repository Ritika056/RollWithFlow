# RollWithFlow

RollWithFlow is a private DJ operating system: a personal command center for music library management, discovery, liked/rejected songs, folders, DJ crates, playlists, mixes, and long-term music intelligence.

Phase 5A adds live-readiness configuration, local-library scan foundations, and a visual playback shell. Spotify/YouTube connections, real playback, and production deployment remain future work.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, Uvicorn, SQLAlchemy, Pydantic
- Database: SQLite for local development through SQLAlchemy ORM

## Backend

Windows:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed.seed_data
python -m app.seed.create_admin
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

macOS/Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed.seed_data
python -m app.seed.create_admin
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/api/health
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Frontend:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Backend:

```text
APP_NAME=RollWithFlow
APP_ENV=local
DATABASE_URL=sqlite:///./rollwithflow.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECRET_KEY=replace-with-a-long-random-production-secret
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=choose-a-strong-private-password
ADMIN_DISPLAY_NAME=RollWithFlow Admin
```

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local` when configuring a new environment.

## Local Library Scan

In Settings, provide a folder path the backend machine can access. The scan finds `mp3`, `wav`, `flac`, `m4a`, and `aiff` files recursively, creates local song records from filenames, and skips duplicate source paths. Browser file access is not used.

## Playback Shell

The bottom player is a visual shell only. Real audio playback, queueing, and local audio serving are intentionally deferred.

## Private Access

There is no public signup. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_DISPLAY_NAME` in `backend/.env`, then run `python -m app.seed.create_admin`. Open `/login` and sign in with that private account. All main API routes require a valid login token; only the health check and login endpoint remain public.

For production, use a long random `SECRET_KEY`, set the deployed frontend URL in `CORS_ORIGINS`, and never commit `.env` files. `DATABASE_URL` supports SQLite locally and PostgreSQL in production, for example `postgresql+psycopg://user:password@host:5432/rollwithflow`.

## Phase 2 Status

Completed: frontend shell, backend API, SQLite setup, core models, dashboard counts, full song management APIs, liked songs API, folder CRUD, song-to-folder assignment, repeat-safe Phase 2 seed data, and upgraded modern UI.
