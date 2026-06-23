# Mix Song Links

Mixes can now link library songs through `mix_songs`. A link stores the mix position plus optional cue and transition notes. Add songs from a mix detail page, adjust their position, remove a link, or use Play All to queue only linked local/playable songs. Provider-only songs remain visible but are skipped by playback.

API routes:

- `GET /api/mixes/{id}/songs`
- `POST /api/mixes/{id}/songs`
- `PATCH /api/mixes/{id}/songs/{mix_song_id}`
- `DELETE /api/mixes/{id}/songs/{mix_song_id}`
