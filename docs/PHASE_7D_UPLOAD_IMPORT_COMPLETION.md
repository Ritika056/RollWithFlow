# Phase 7D: Browser Audio Upload and Folder Import

## What Works

- Library users can select one or many supported audio files from the browser.
- The Import Folder option uses the browser folder picker and imports supported files selected from that folder.
- Files are copied into the app-managed local store at `backend/media/audio` by default.
- Each import is hashed while it is written, so an already imported file is skipped instead of being duplicated.
- Mutagen extracts title, artist, album, genre, duration, and file extension when tags are available. The filename supplies a title fallback.
- Imported songs are normal local songs and work through the existing local player and queue.

## Safety

- Only MP3, WAV, FLAC, M4A, AIFF, and AIF files are accepted.
- Files are stored under generated safe names; browser-supplied paths are not stored or exposed.
- The local import limit is 500 MB per file.
- `backend/media/audio/` is ignored by Git.

## Limitations

- Browser support for FLAC and AIFF playback depends on the installed browser.
- Folder selection relies on the browser-supported directory picker attribute.
- There is no online audio download or Spotify/YouTube playback.

## Next Step

Phase 7E can add optional artwork extraction and a local import history while preserving the same local-only media model.
