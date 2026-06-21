# Phase 7B Playback Reliability

## Playback

- Local player reports loading and clear file/format failures without crashing the UI.
- Broken tracks remain visible; when another queue item exists, playback advances to it.
- The browser-local queue supports remove, clear, play from queue, repeat off/all/one, shuffle, previous, and next.
- Queue, recent local tracks (up to 20), volume, repeat, and shuffle settings persist in browser local storage.

## Local Scan Metadata

Newly scanned local files use `mutagen` to read duration plus title, artist, album, and genre when tags are available. Filename fallback remains in place. Existing songs and user-edited metadata are never overwritten. Artwork, BPM/key detection, waveforms, moving, and renaming are intentionally excluded.

## Limits

- Playback remains local-file only. Spotify/YouTube playback and all audio downloads are excluded.
- Browser codec support varies, particularly for FLAC and AIFF.
- Queue/history are browser-local only; no backend playback history is created.

## Next

Phase 7C should add playback error detail, optional local waveform previews, and explicit rescan/repair tools for files moved outside RollWithFlow.
