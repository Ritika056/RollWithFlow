# Phase 7A Local Playback

## Works Locally

- Active, non-rejected songs with a scanned local source can play from the Library, Liked Songs, folders, playlists, and crates.
- The bottom mini-player supports play/pause, progress, seek, volume, and previous/next within the current visible local-song list.
- The backend streams only the file associated with the requested song through `GET /api/audio/local/{song_id}`.
- The frontend uses a same-origin authenticated proxy route so browser audio requests never expose the backend token or raw local file path.

## Formats

`mp3`, `wav`, `flac`, `m4a`, `aiff`, and `aif` are accepted when the browser supports the codec. Browser support for FLAC/AIFF can vary.

## Limitations

- Playback is local only and uses scanned file paths accessible to the backend machine.
- There is no Spotify/YouTube playback, downloading, or audio storage.
- Queue state is in the browser only; it is not saved and has no shuffle/repeat controls yet.
- File streaming uses Starlette `FileResponse`, including HTTP Range handling for browser seeking.

## Phase 7B Next

Add persistent queue controls, playback error feedback, and optional waveform/metadata extraction without introducing external audio downloads.
