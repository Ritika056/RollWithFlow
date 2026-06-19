# RollWithFlow — Technical Build Plan

## 1. Project Name

```text
RollWithFlow
```

## 2. Project Type

RollWithFlow is a private full-stack DJ music workspace.

It should be built as a modern web application with:

```text
Frontend application
Backend API
Database
Local file scanner
Music platform integrations
Scheduled daily fetch system
Player system
Metadata and music intelligence layer
```

The app should be private by default but accessible on the same Wi-Fi network.

---

## 3. Recommended Fresh-Start Stack

For a new project, use this stack:

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
```

Frontend responsibilities:

```text
Dashboard UI
Sidebar navigation
Library tables
Folder cards
DJ crate cards
Playlist builder
Mix upload pages
Discovery interface
Liked Songs page
Music intelligence editing
Player UI
Search and filters
Action modals
Settings pages
```

## Backend

Recommended backend:

```text
FastAPI
Python
Uvicorn
SQLAlchemy
```

Backend responsibilities:

```text
Song CRUD
Folder CRUD
Crate CRUD
Playlist CRUD
Mix CRUD
Local folder scanning
Audio file serving
Metadata extraction
Spotify integration
YouTube integration
Daily scheduled fetch
Dashboard counts
Discovery history
Music intelligence management
Authentication/session handling if needed
```

## Database

Recommended starting database:

```text
PostgreSQL for long-term project
SQLite acceptable for early prototype
```

For a serious fresh build, PostgreSQL is better because the app will store many relationships:

```text
Songs
Sources
Artists
Genres
Folders
Crates
Playlists
Mixes
Discovery snapshots
Daily fetch jobs
Ratings
Notes
Tags
Playback history
```

## ORM

Recommended:

```text
SQLAlchemy if using FastAPI backend
```

Alternative if using full Next.js backend:

```text
Prisma + PostgreSQL
```

But do not mix both architectures randomly. Choose one main backend style.

Recommended final choice:

```text
Next.js frontend + FastAPI backend + PostgreSQL + SQLAlchemy
```

---

# 4. Core Architecture

RollWithFlow should be separated into these layers:

```text
Frontend UI
Backend API
Database models
Service layer
Integration layer
Scheduler layer
File scanner layer
Player/audio layer
```

## Basic flow:

```text
User action in browser
↓
Next.js React UI
↓
FastAPI endpoint
↓
Service layer
↓
Database / external platform / local files
↓
Response returned to frontend
↓
UI updates immediately
```

---

# 5. Main Backend Modules

Recommended backend structure:

```text
backend/
  app/
    main.py
    config.py
    database.py
    models/
      song.py
      artist.py
      genre.py
      source.py
      folder.py
      crate.py
      playlist.py
      mix.py
      discovery.py
      job.py
      note.py
      tag.py
      playback.py
    schemas/
      song.py
      folder.py
      crate.py
      playlist.py
      mix.py
      discovery.py
      dashboard.py
    routers/
      health.py
      dashboard.py
      songs.py
      library.py
      liked.py
      folders.py
      crates.py
      playlists.py
      mixes.py
      discovery.py
      player.py
      settings.py
    services/
      song_service.py
      scanner_service.py
      metadata_service.py
      folder_service.py
      crate_service.py
      playlist_service.py
      mix_service.py
      discovery_service.py
      spotify_service.py
      youtube_service.py
      scheduler_service.py
      dashboard_service.py
      player_service.py
    integrations/
      spotify.py
      youtube.py
    jobs/
      daily_fetch.py
    storage/
      local_files.py
```

---

# 6. Main Frontend Structure

Recommended frontend structure:

```text
frontend/
  app/
    dashboard/
    library/
    liked-songs/
    folders/
    crates/
    playlists/
    mixes/
    discovery/
    artists/
    genres/
    settings/
  components/
    layout/
      Sidebar.tsx
      Header.tsx
      PageShell.tsx
    dashboard/
      StatCard.tsx
      RecentlyAdded.tsx
      DailyFetchStatus.tsx
    songs/
      SongTable.tsx
      SongRow.tsx
      SongActions.tsx
      SongSourceBadge.tsx
    folders/
      FolderCard.tsx
    crates/
      CrateCard.tsx
    playlists/
      PlaylistBuilder.tsx
      PlaylistSongRow.tsx
    mixes/
      MixUploadForm.tsx
      MixCard.tsx
    discovery/
      ManualSearch.tsx
      TrendingTab.tsx
      LatestTab.tsx
      DiscoveryHistory.tsx
    player/
      BottomPlayer.tsx
      QueuePanel.tsx
    modals/
      AddToFolderModal.tsx
      AddToCrateModal.tsx
      AddToPlaylistModal.tsx
      CreatePlaylistInlineModal.tsx
      EditSongModal.tsx
  lib/
    api.ts
    types.ts
    constants.ts
```

---

# 7. Core Data Models

## Song

A song is the central entity.

Fields:

```text
id
canonical_title
canonical_artist
album
duration_seconds
genre_id
bpm
musical_key
energy_level
rating
liked
rejected
source_primary
source_url
thumbnail_url
local_file_path
file_type
bitrate
created_at
updated_at
```

Important rules:

```text
A song can have multiple sources.
A song can belong to multiple folders.
A song can belong to multiple crates.
A song can belong to multiple playlists.
A rejected song should not appear in active lists by default.
A liked song should appear in Liked Songs.
```

---

## Song Source

Stores where the song came from.

Fields:

```text
id
song_id
platform
platform_track_id
source_url
preview_url
embed_url
thumbnail_url
artist_name
album_or_channel
popularity
views_count
created_at
```

Platforms:

```text
local
spotify
youtube
manual
soundcloud_future
beatport_future
```

---

## Artist

Fields:

```text
id
name
platform_ids
image_url
genres
created_at
updated_at
```

Artist pages should later show:

```text
Songs
Latest releases
Discovery history
Trending appearances
```

---

## Genre

Fields:

```text
id
name
parent_genre_id
created_at
```

Genre pages should support browsing and discovery by genre.

---

## Folder

Fields:

```text
id
name
description
color
pinned
created_at
updated_at
```

Relationship tables:

```text
folder_songs
folder_playlists
folder_mixes
```

---

## DJ Crate

Fields:

```text
id
name
description
mood
energy_min
energy_max
genre_focus
tags
created_at
updated_at
```

Relationship:

```text
crate_songs
```

A song can belong to multiple crates.

---

## Playlist

Fields:

```text
id
name
description
event_type
mood
target_energy
created_at
updated_at
```

Playlist song fields:

```text
playlist_id
song_id
position
cue_note
transition_note
must_play
optional
energy_note
key_note
created_at
```

---

## Mix

Fields:

```text
id
title
genre_id
mood
event_type
bpm_min
bpm_max
musical_key
duration_seconds
file_path
notes
tracklist
rating
created_at
updated_at
```

---

## Discovery Snapshot

Stores fetched or searched songs from external platforms.

Fields:

```text
id
song_id
platform
discovery_type
query
source_url
thumbnail_url
popularity
views_count
fetch_date
snapshot_date
created_at
```

Discovery types:

```text
manual_search
trending_today
trending_week
latest
artist_release
genre_release
daily_fetch
recommendation
```

---

## Daily Fetch Job

Fields:

```text
id
job_date
started_at
finished_at
status
source
items_found
items_saved
error_message
created_at
```

Statuses:

```text
pending
running
success
failed
partial
```

---

## Music Intelligence

This can be stored directly on songs plus separate notes/tags tables.

Fields:

```text
song_id
bpm
musical_key
energy_level
rating
mood
dj_notes
cue_notes
transition_notes
crowd_reaction
compatible_track_notes
event_suitability
updated_at
```

---

# 8. Important API Endpoints

## Health

```text
GET /api/health
```

Returns backend status.

---

## Dashboard

```text
GET /api/dashboard
```

Returns:

```text
total_songs
local_songs
imported_songs
liked_songs
rejected_songs
folders_count
crates_count
playlists_count
mixes_count
trending_today_count
latest_today_count
missing_bpm_count
missing_key_count
missing_genre_count
recently_added
fetch_status
```

---

## Songs

```text
GET /api/songs
GET /api/songs/{id}
POST /api/songs
PATCH /api/songs/{id}
DELETE /api/songs/{id}
POST /api/songs/{id}/like
POST /api/songs/{id}/unlike
POST /api/songs/{id}/reject
POST /api/songs/{id}/restore
```

---

## Library

```text
GET /api/library/local
POST /api/library/scan
GET /api/library/scan-jobs
GET /api/library/missing-metadata
```

---

## Folders

```text
GET /api/folders
POST /api/folders
GET /api/folders/{id}
PATCH /api/folders/{id}
DELETE /api/folders/{id}
POST /api/folders/{id}/songs/{song_id}
DELETE /api/folders/{id}/songs/{song_id}
```

---

## DJ Crates

```text
GET /api/crates
POST /api/crates
GET /api/crates/{id}
PATCH /api/crates/{id}
DELETE /api/crates/{id}
POST /api/crates/{id}/songs/{song_id}
DELETE /api/crates/{id}/songs/{song_id}
```

---

## Playlists

```text
GET /api/playlists
POST /api/playlists
GET /api/playlists/{id}
PATCH /api/playlists/{id}
DELETE /api/playlists/{id}
POST /api/playlists/{id}/songs
PATCH /api/playlists/{id}/songs/{song_id}
DELETE /api/playlists/{id}/songs/{song_id}
POST /api/playlists/inline-create-and-add
```

---

## Mixes

```text
GET /api/mixes
POST /api/mixes/upload
GET /api/mixes/{id}
PATCH /api/mixes/{id}
DELETE /api/mixes/{id}
GET /api/mixes/{id}/stream
```

---

## Discovery

```text
GET /api/discovery/search
GET /api/discovery/trending
GET /api/discovery/latest
GET /api/discovery/history
POST /api/discovery/save
POST /api/discovery/reject
POST /api/discovery/fetch-now
GET /api/discovery/jobs
```

---

## Player

```text
GET /api/player/stream/{song_id}
GET /api/player/preview/{song_id}
POST /api/player/history
GET /api/player/history
```

---

# 9. External Integrations

## Spotify

Spotify integration should support:

```text
OAuth connection
Token refresh
Manual search
Track metadata
Artist metadata
New releases where available
Recommendations where available
Preview URL where available
Open Spotify source link
```

Store:

```text
Spotify track ID
Title
Artist
Album
Thumbnail
Preview URL
Spotify URL
Popularity
Release date
```

---

## YouTube

YouTube integration should support:

```text
Search
Trending music if available
Channel/artist monitoring where possible
Video metadata
Thumbnail
Views
Published date
Open YouTube source link
Embed/player support where possible
```

Store:

```text
YouTube video ID
Title
Channel/artist
Thumbnail
URL
Views
Published date
```

---

# 10. Daily Scheduler

The app should run a daily fetch at 6 AM.

Recommended options:

```text
APScheduler inside FastAPI for local app
Cron/system scheduler for production
Background worker later if needed
```

Daily fetch flow:

```text
Start job at 6 AM
Fetch Spotify trending/latest/recommendations
Fetch YouTube trending/latest/search targets
Normalize metadata
Check duplicates
Save new songs or discovery snapshots
Update job status
Show results in Dashboard and Discovery History
```

Important rules:

```text
Daily fetch should not erase old history.
Duplicate songs should not create messy duplicates.
A rejected song should not keep appearing in active discovery.
Fetch failures should be logged.
```

---

# 11. Duplicate Handling

Songs can come from different sources but represent the same track.

Deduplication should use:

```text
Normalized title
Normalized artist
Duration if available
Platform IDs
Source URLs
```

Example:

```text
Song: Losing It
Artist: FISHER
Source 1: Spotify
Source 2: YouTube
```

This should be one song record with multiple sources, not two unrelated songs.

---

# 12. Search and Filters

Search should support:

```text
Title
Artist
Album
Genre
Source
Folder
Crate
Playlist
BPM range
Key
Energy range
Rating
Liked status
Rejected status
Date added
Discovery date
Trending/latest status
```

Example searches:

```text
Deep House 122 BPM released this month
Punjabi high energy wedding safe
Afro House latest from YouTube
Songs in 8A key energy above 7
Rejected Spotify songs from last week
```

---

# 13. Frontend UX Rules

## Global rules:

```text
Every table should show numeric index.
Every song should show source badge.
Every page should have search/filter where useful.
Dashboard cards should be clickable.
Actions should update UI immediately.
Rejected songs should disappear from active views.
Counts should update after actions.
Add-to-folder, add-to-crate, and add-to-playlist should be available from song actions.
Playlist can be created inline while adding a song.
```

## Recommended UI style:

```text
Dark DJ-style interface
Sidebar navigation
Dashboard cards
Tables for songs
Cards for folders and crates
Bottom mini player
Clean modals
Fast search
Minimal clutter
```

---

# 14. Player Rules

Player should support these source types:

```text
local_file
uploaded_mix
spotify
youtube
manual_reference
```

## Local files and mixes:

```text
Stream directly from backend.
```

## Spotify and YouTube:

```text
Use preview, embed, connected playback, or open source link depending on what is legally and technically available.
Do not illegally download or bypass platform restrictions.
```

## Player queue should support:

```text
Play now
Add to queue
Next/previous
Shuffle
Repeat
Recently played
Playback history
```

---

# 15. LAN Access

The app should be configurable for same-Wi-Fi access.

Frontend should run on:

```text
0.0.0.0:3000
```

Backend should run on:

```text
0.0.0.0:8000
```

Example access:

```text
http://192.168.1.8:3000
```

CORS should allow the frontend LAN URL to call the backend LAN URL.

---

# 16. Environment Variables

Example `.env` values:

```text
APP_NAME=RollWithFlow
ENVIRONMENT=local
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/rollwithflow
LOCAL_MUSIC_ROOT=F:/Music
MIX_UPLOAD_ROOT=F:/RollWithFlow/Mixes
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:8000/api/auth/spotify/callback
YOUTUBE_API_KEY=
DAILY_FETCH_TIME=06:00
TIMEZONE=Asia/Kolkata
```

---

# 17. Suggested Fresh Build Phases

## Phase 0 — Project Bootstrap

```text
Create repo
Create frontend app
Create backend app
Set up database
Set up environment config
Add health endpoint
Add basic layout
```

## Phase 1 — Core Database and Songs

```text
Create song, artist, genre, source models
Create song CRUD APIs
Create song table UI
Add search/filter basics
```

## Phase 2 — Local Library

```text
Add local folder scanner
Extract metadata
Save local songs
Serve local audio files
Play local songs in bottom player
```

## Phase 3 — Dashboard

```text
Add dashboard counts
Add clickable cards
Add recently added songs
Add missing metadata counts
```

## Phase 4 — Liked Songs, Folders, and Crates

```text
Add liked/unliked system
Add folders
Add DJ crates
Add add-to-folder modal
Add add-to-crate modal
```

## Phase 5 — Playlists

```text
Create playlist builder
Add reorder support
Add cue notes
Add transition notes
Add must-play/optional flags
Add inline create playlist and add song
```

## Phase 6 — Mixes

```text
Add mix upload
Add mix metadata
Add mix playback
Add folder linking
Add tracklist notes
```

## Phase 7 — Discovery

```text
Add Spotify connection
Add Spotify search
Add YouTube search
Save discovery results
Add trending/latest/history tabs
Add reject from discovery
```

## Phase 8 — Daily Fetch

```text
Add scheduler
Run daily 6 AM fetch
Store discovery snapshots
Show job status
Show daily results on Dashboard
```

## Phase 9 — Music Intelligence

```text
Add BPM, key, energy, rating, notes
Add advanced filters
Add compatible track notes
Add event suitability
```

## Phase 10 — LAN and Polish

```text
Enable same-Wi-Fi access
Polish UI
Fix counts
Add loading states
Add error handling
Add backup/export options
```

---

# 18. Minimum Viable Product

The first useful version should include:

```text
Dashboard
Local Library scanner
Song table
Bottom player for local songs
Liked Songs
Folders
DJ Crates
Playlists
Mix upload
Basic Discovery manual search
Save discovery result
Reject song
Dashboard counts
```

Daily fetch, Spotify OAuth, YouTube integration, and music intelligence can be added after the core system is stable.

---

# 19. Non-Negotiable Product Rules

```text
Liked Songs only shows intentionally liked songs.
Discovery is not the same as Liked Songs.
Reject is not delete.
Rejected songs should disappear from active lists.
Dashboard counts must reflect active data correctly.
A song can belong to multiple folders/crates/playlists where appropriate.
Discovery history should not be lost.
Daily fetch should store snapshots.
Local files should play directly.
Online songs should use legal platform playback/preview/embed/source links.
The app should be private by default.
Same-Wi-Fi access should be supported.
```

---

# 20. Final Technical Summary

RollWithFlow should be built as:

```text
A private full-stack DJ operating system.
```

Recommended architecture:

```text
Next.js + React + TypeScript + Tailwind frontend
FastAPI + Python backend
PostgreSQL database
SQLAlchemy ORM
Spotify and YouTube integrations
Daily scheduler
Local file scanner
Bottom player
Music intelligence layer
```

The main purpose is to create one searchable, organized, intelligent workspace for DJ music discovery, preparation, playback, and long-term memory.
