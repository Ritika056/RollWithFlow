# RollWithFlow Current Status

## Completed

- FastAPI, SQLite, core DJ models, health check, seed data, and dashboard summary.
- Song library workflows: create/edit, search/filter, liked songs, reject/restore, metadata cleanup, folder assignment, and active-song views.
- Folder, playlist, crate, and mix CRUD with playlist/crate song assignment and mix tracklist metadata.
- Discovery foundation: manual/mock discovery, save to library, reject/restore, and mock daily fetch. No external music provider is connected.
- Premium Next.js UI: dashboard, library, collection galaxies, discovery galaxy, Events placeholder, and AI Copilot placeholder.
- Phase 5A: environment examples, configurable CORS, deployment plan, macOS instructions, and a Settings local-library scan control.
- Local scans recursively register `mp3`, `wav`, `flac`, `m4a`, and `aiff` filenames as local songs and skip duplicate source paths.
- Fixed visual playback shell with placeholder controls, progress, and source badge. It does not play audio.
- Phase 5B: private email/password login, manual admin bootstrap, protected main APIs, frontend route protection, and PostgreSQL-ready `DATABASE_URL` support.

## Current Routes

- `/dashboard`, `/library`, `/liked-songs`, `/folders`, `/folders/[id]`
- `/playlists`, `/playlists/[id]`, `/crates`, `/crates/[id]`
- `/mixes`, `/mixes/[id]`, `/discovery`, `/events`, `/ai-copilot`, `/settings`

## Still To Build

- Spotify and YouTube OAuth, provider clients, and real scheduled discovery.
- Embedded metadata extraction during local scans.
- Local audio serving, real playback, queueing, waveform analysis, and player controls.
- Persisted events with playlist/crate links, countdowns, and checklists.
- AI Copilot behavior, analytics, recommendations, tags, and music intelligence.
- Production migrations and authentication hardening (password reset, token revocation), object storage, backup/export, LAN access, automated tests, accessibility, and mobile polish.
- Production deployment execution: provision PostgreSQL, set private secrets, deploy to Vercel plus Render/Railway, and verify login end to end.

## Run Notes

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && python -m uvicorn app.main:app --reload`
- Frontend environment: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
