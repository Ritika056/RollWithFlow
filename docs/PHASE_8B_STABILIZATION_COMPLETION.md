# Phase 8B - Stabilization

Phase 8B adds linked-song support for mixes, a non-destructive backup restore preview, and safer provider testing support. Existing local playback, import, events, analytics, discovery, and authentication workflows remain unchanged.

## Added

- Mix song links with position, cue notes, and transition notes.
- Mix detail song management and Mix Play All from linked local songs.
- `POST /api/import/dry-run-restore`, which reports a restore plan but never changes the database.
- `GET /api/providers/diagnostics`, exposing only configuration/connection state and the redirect URI.
- Discovery test actions for configured YouTube and connected Spotify.

## Deliberate Limits

Real restore remains disabled. Provider secrets are never returned. Spotify and YouTube audio is not downloaded or played.
