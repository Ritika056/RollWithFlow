# Phase 7C: Playback Repair and File Health

## Completed

- Added a local-file health check for active, non-rejected songs. It reports missing, inaccessible, and unsupported local files without changing song records.
- Added safe local path repair for an individual song. The replacement must exist, be a supported audio type, and cannot already belong to another song.
- Added metadata rescan for a local song. It fills only empty title, artist, album, genre, and duration fields by default. The API accepts `overwrite=true` when a deliberate metadata refresh is needed.
- Improved player errors for missing files, unavailable backend access, expired sessions, and browser format support. Full local paths are never exposed to the browser.
- Added Settings controls for file health checks and repairs, plus a Library metadata-rescan action for local songs.
- Added a CSS-only mini waveform to the player. It is decorative and does not inspect audio data.

## Endpoints

- `POST /api/library/check-files`
- `POST /api/songs/{song_id}/repair-local-path`
- `POST /api/songs/{song_id}/rescan-metadata`

## Limitations

- No audio is downloaded, moved, renamed, or analyzed for BPM, key, or a real waveform.
- Browser support varies by file format, especially FLAC and AIFF.
- Real waveform generation and deeper audio analysis remain future work.

## Next Step

Phase 7D can add optional queue persistence in the backend, waveform analysis as an opt-in local job, and richer metadata cleanup without changing the local-first playback model.
