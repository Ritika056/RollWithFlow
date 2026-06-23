# Provider Testing Guide

Local backend URL: `http://127.0.0.1:8001`

Spotify callback URI: `http://127.0.0.1:8001/api/providers/spotify/callback`

Use Discovery to confirm provider status and run a test search. Spotify must be configured and connected before its test search works. YouTube requires an enabled YouTube Data API v3 key. Diagnostics only show status flags and the Spotify redirect URI; they never display client secrets or API keys.

If Spotify reports that the user is not registered, add the Spotify account as an allowed user in the Spotify Developer Dashboard and reconnect.
