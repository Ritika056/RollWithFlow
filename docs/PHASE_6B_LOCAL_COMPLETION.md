# Phase 6B Local Discovery Automation

## Built

- Local discovery monitors for `mock`, `spotify`, and `youtube` providers.
- Manual monitor runs and a local daily-run button. No scheduler or production cron is included.
- Fetch history with success, partial, skipped, and failed results.
- Duplicate prevention by provider plus source URL, with title/artist fallback.

## Local Setup

Provider credentials remain optional in `backend/.env`:

```text
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/api/providers/spotify/callback
YOUTUBE_API_KEY=
```

Run the backend and frontend locally, open Discovery, add a monitor, then select `Run monitors` or `Run Local Daily Fetch`.

Missing Spotify credentials/connection or a missing YouTube key creates a `skipped` fetch run with a clear message. Mock monitors always work for local testing.

Provider runs save only metadata, source URLs, thumbnails, popularity/view data, and discovery history. They never download, store, or play audio, and they never auto-like songs.

## Next

Add optional local scheduling and richer monitor presets only after validating real local Spotify and YouTube credentials.
