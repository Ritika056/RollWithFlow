# RollWithFlow — Project Overview

## 1. What is RollWithFlow?

RollWithFlow is a **personal DJ operating system**.

Most music apps are designed for listeners. RollWithFlow is designed for DJs.

A listener asks:

```text
What do I want to hear?
```

A DJ asks:

```text
What do I want to play?
What should I prepare?
What should I keep for later?
What works for this event, mood, energy, BPM, or genre?
```

RollWithFlow is not just a music player, playlist app, Spotify clone, or local library scanner. It is a private DJ command center where a DJ can discover, organize, play, prepare, archive, and remember music from multiple sources.

The core idea is:

```text
RollWithFlow = DJ Library + Discovery Engine + Playlist Builder + DJ Crates + Mix Archive + Music Intelligence Layer + Daily Trending Tracker
```

It becomes one place for the full DJ workflow.

---

## 2. The Problem It Solves

DJs usually have music scattered across many places:

```text
Spotify playlists
YouTube Music
Downloads folder
USB drives
Local hard drive
Rekordbox crates
Notes app
WhatsApp messages
Browser bookmarks
Old folders
Mix recordings
Random references
```

This creates problems:

```text
Songs are difficult to find.
Good discoveries are forgotten.
Playlists become messy.
Local files and online songs stay separate.
Trending songs are not tracked daily.
Liked songs, saved songs, and rejected songs get mixed together.
DJ notes are not stored properly.
Set preparation takes too much time.
```

RollWithFlow solves this by becoming the DJ's **music memory system**.

It remembers:

```text
What the song is
Where it came from
Whether it is local, Spotify, YouTube, or another source
Whether it is liked
Whether it is rejected
Which folder or crate it belongs to
Which playlist it belongs to
Which event or mood it fits
Its BPM, key, genre, energy, rating, and notes
When it was discovered
Whether it was trending or latest on a specific day
```

Over time, RollWithFlow becomes more valuable than any single playlist because it stores the DJ's personal music intelligence.

---

## 3. Main Goal

The goal of RollWithFlow is to help a DJ manage the complete music workflow:

```text
Discover new music
Save useful songs
Like important songs
Reject unwanted songs
Organize songs into folders and crates
Build DJ playlists and sets
Add cue notes and transition notes
Upload and archive DJ mixes
Track trending/latest songs every day
Search by genre, BPM, key, mood, source, and event type
Play or preview songs inside the app
Access the app from devices on the same Wi-Fi
```

In short:

```text
RollWithFlow is the control center for a DJ's music collection and discovery process.
```

---

## 4. Core Product Sections

RollWithFlow should have these main sections:

```text
Dashboard
Library
Liked Songs
Folders
DJ Crates
Playlists
Mixes
Discovery
Artists
Genres
Music Intelligence
Settings
```

Each section has a specific purpose.

---

# 5. Dashboard

The Dashboard is the main overview page.

It should show the health and status of the DJ's music system.

## Dashboard should show counts for:

```text
Total songs
Local songs
Imported/discovered songs
Liked songs
Rejected songs
Folders
DJ crates
Playlists
Mixes
Trending today
Latest today
Songs missing genre
Songs missing BPM
Songs missing key
Recently added songs
Daily fetch status
```

## Dashboard cards should be clickable:

```text
Total Songs → opens all active songs
Local Songs → opens Library
Liked Songs → opens Liked Songs
Folders → opens Folders
DJ Crates → opens DJ Crates
Playlists → opens Playlists
Mixes → opens Mixes
Trending Today → opens Discovery Trending
Latest Today → opens Discovery Latest
Missing BPM → opens songs missing BPM
Missing Key → opens songs missing key
```

## Recently Added should show:

```text
Number
Song title
Artist
Source badge
Added date
Folder/crate badge or Unfiled
Actions
```

The Dashboard should be useful, not decorative. It should tell the DJ what needs attention and what changed recently.

---

# 6. Music Library

The Library is the main song database.

It stores both local and imported song records, but local files should have a dedicated Library view.

## Local file support:

```text
MP3
WAV
FLAC
M4A
AIFF
```

## Library stores:

```text
Title
Artist
Album
Genre
Duration
File path
File type
Bitrate
Source
Source URL
Thumbnail/artwork
BPM
Key
Energy level
Rating
Tags
Notes
Liked status
Rejected status
Created date
Updated date
```

## Purpose:

The Library helps the DJ know:

```text
Which songs are already available locally
Which songs came from Spotify or YouTube
Which songs are only references
Which songs are DJ-ready
Which songs need metadata cleanup
```

Local songs and uploaded mixes should play directly in the app. Online songs should play or preview through supported platform methods such as preview, embed, or connected playback where available.

---

# 7. Liked Songs

Liked Songs is a dedicated collection of songs the DJ intentionally likes.

Liked Songs is not the same as Discovery.

A discovered song should not automatically become liked.

A song should appear in Liked Songs only when the user clicks:

```text
Add to Liked Songs
```

## Liked Songs can include songs from:

```text
Local Library
Spotify
YouTube
Manual entry
Future platforms
```

## Liked Songs should show:

```text
Total liked count
Numeric index
Title
Artist
Album
Genre
Source badge
BPM
Key
Energy
Rating
Liked status
DJ-ready status
Actions
```

Removing a song from Liked Songs should not delete the song from the app. It should only remove the liked status.

A pinned **Liked Songs** folder or collection should also exist so the DJ can access liked music quickly.

---

# 8. Folders

Folders are for practical music organization.

Folders can represent event types, genres, moods, personal categories, or storage groups.

Example folders:

```text
Wedding Sets
Club Sets
Punjabi
Bollywood
EDM
Retro
My Mixes
Production References
Latest Trending
Local Favorites
Imported Ideas
```

## Folder cards should show:

```text
Folder name
Song count
Playlist count
Mix count
Last updated date
```

## Folder behavior:

```text
A song can be added to a folder.
A playlist can be linked to a folder.
A mix can be linked to a folder.
When a song is added, it should immediately appear inside that folder.
```

Folders should be simple and visual. The page should use cards rather than a complicated folder tree.

---

# 9. DJ Crates

DJ Crates are DJ-focused collections.

Crates are different from normal folders and playlists.

A playlist is usually a planned sequence. A crate is a flexible pool of songs for a certain DJ use case.

Example crates:

```text
High Energy
Vocals
Sunset
Festival Bangers
Opening Tracks
Peak Time
Closing Tracks
Warmup
Afro House
Tech House
Punjabi Bangers
Wedding Safe
Afterparty
```

## Crate behavior:

```text
A song can belong to multiple crates.
Crates help fast filtering during set preparation.
Crates do not need strict song order.
Crates can be used as source pools for playlists.
```

## Crate metadata:

```text
Name
Description
Mood
Energy range
Genre focus
Song count
Tags
Created date
Updated date
```

DJ Crates make the app feel more DJ-focused than a normal playlist app.

---

# 10. Playlists

Playlists are for DJ set preparation.

They are not only simple song lists. They should support real DJ planning.

Example playlists:

```text
Wedding Entry
Club Night
Punjabi Night
EDM Set
Warmup
Peak Time
Closing
Birthday
Corporate Event
House Party
```

## Playlist builder should support:

```text
Create playlist
Add songs
Create playlist inline while adding a song
Reorder songs
Play playlist
Add cue notes
Add transition notes
Mark must-play songs
Mark optional songs
Set energy flow
Set BPM flow
Set key compatibility notes
```

## Playlist song row should include:

```text
Order number
Song title
Artist
BPM
Key
Energy
Source
Cue note
Transition note
Must-play/optional flag
Actions
```

A playlist should help the DJ prepare a set, not just store songs.

---

# 11. Mixes

Mixes are for uploaded DJ mixes and recorded sets.

The Mixes section helps the DJ archive personal work.

## A mix can store:

```text
Title
Genre
Mood
Event type
BPM range
Key
Date created
Duration
Audio file path
Notes
Tracklist
Folder
Tags
Rating
```

## Mix actions:

```text
Upload mix
Play mix
Edit metadata
Add to folder
Add tags
Add tracklist
Delete/archive mix
```

This section is important because it keeps the DJ's own work organized beside the discovery and song library.

---

# 12. Discovery Engine

Discovery is the online music research section.

It helps the DJ find and track new music from online platforms.

Initial sources:

```text
Spotify
YouTube
```

Future sources:

```text
SoundCloud
Beatport
Apple Music
Bandcamp
Other music platforms
```

## Discovery tabs:

```text
Manual Search
Trending
Latest
Artists
Genres
History
Settings
```

## Discovery is used for:

```text
Searching Spotify and YouTube
Finding trending songs
Finding latest songs
Tracking artist releases
Tracking genre releases
Saving discovery history
Reviewing what was trending later
Adding songs to liked songs, folders, crates, or playlists
Rejecting songs that are not useful
```

Discovery should store metadata and source links. It should not depend on illegal downloading or unauthorized file extraction.

---

# 13. Daily 6 AM Fetch

One major feature is automatic daily discovery.

Every day at 6 AM, RollWithFlow should fetch new music from connected sources.

## Daily fetch should collect:

```text
Trending songs
Latest songs
Genre-based songs
Artist releases
Platform-specific recommendations
```

## Daily fetch should store:

```text
Song title
Artist
Platform
Source URL
Thumbnail
Album/channel
Popularity/views if available
Fetch date
Discovery type
Trending/latest status
Genre if available
```

## Daily fetch helps answer:

```text
What songs were trending yesterday?
What latest songs came from Spotify?
What latest songs came from YouTube?
Which songs are good for future sets?
Which songs are good production references?
Which artists released something new?
```

Discovery history should never be lost. Old snapshots should remain searchable.

---

# 14. Music Intelligence Layer

The Music Intelligence Layer stores DJ-specific knowledge about songs.

This is one of the most important long-term features.

## It should store:

```text
BPM
Key
Genre
Mood
Energy level
Rating
Tags
DJ notes
Cue notes
Transition notes
Compatible tracks
Event suitability
Crowd reaction notes
Personal comments
```

Example:

```text
Song: Losing It
Artist: FISHER
BPM: 125
Key: 8A
Energy: 9/10
Genre: Tech House
Note: Works well at peak time after a vocal build-up track.
```

Over time, this creates a private DJ knowledge base.

The app should help the DJ search things like:

```text
Deep House, 122 BPM, released this month
Punjabi, high energy, wedding safe
Afro House, 120-124 BPM, latest
Songs in 8A key with energy above 7
Tracks that work for closing set
```

---

# 15. Global Song Actions

Every song should have consistent actions wherever it appears.

These actions should work across:

```text
Dashboard
Library
Liked Songs
Folders
DJ Crates
Playlists
Mixes
Discovery
Trending
Latest
History
Artist pages
Genre pages
```

## Common song actions:

```text
Play / Preview
Add to Liked Songs
Remove from Liked Songs
Add to Folder
Add to DJ Crate
Add to Playlist
Create Playlist inline and add
Reject
Open Source
View/Edit
Add note
Edit BPM/key/genre
```

## Important behavior:

```text
If a song is added to a folder, it appears in that folder.
If a song is added to a crate, it appears in that crate.
If a song is added to a playlist, it appears in that playlist.
If a song is rejected, it disappears from active lists and discovery recommendations.
```

---

# 16. Reject System

Reject is not the same as delete.

Reject means:

```text
I do not want to see or use this song in active DJ workflow.
```

## Rejected songs should:

```text
Disappear from active Dashboard lists
Disappear from normal Discovery lists
Not count as active songs
Remain stored for history/audit if needed
Be recoverable from a rejected/archive view
```

This helps keep the workspace clean without permanently losing history.

---

# 17. Player System

RollWithFlow should have a bottom mini player.

The player should support:

```text
Local songs
Uploaded mixes
Spotify songs/previews/connected playback where available
YouTube songs/embed/player where available
Future platform previews where available
```

## Player should include:

```text
Title
Artist
Artwork/thumbnail
Source badge
Play/pause
Next/previous
Queue
Shuffle
Repeat
Progress
Volume
Open source link
Recently played
Playback history
```

The player does not need to replace every external platform, but it should support the DJ's discovery and preparation workflow inside one workspace.

---

# 18. LAN Usage

RollWithFlow should be usable on the same Wi-Fi network.

Example:

```text
Frontend: http://192.168.1.8:3000
Backend:  http://192.168.1.8:8000
```

This allows access from:

```text
Another laptop
Mobile phone
Tablet
DJ setup device
```

LAN access is useful because the app is private but still accessible across the DJ's own devices.

---

# 19. Typical Workflow

A normal DJ workflow in RollWithFlow:

```text
1. Scan local DJ music folders.
2. Local songs appear in Library.
3. Connect Spotify and YouTube.
4. Search songs in Discovery.
5. Save useful discoveries.
6. Daily 6 AM fetch stores trending/latest music.
7. Like important songs.
8. Add songs to folders and DJ crates.
9. Build playlists for events.
10. Add cue notes and transition notes.
11. Upload and archive personal mixes.
12. Reject songs that are not useful.
13. Search by BPM, key, genre, energy, mood, source, and event type.
14. Prepare better DJ sets faster.
```

---

# 20. Long-Term Vision

After months or years of use, RollWithFlow should contain:

```text
Thousands of tracked songs
Discovery history across platforms
Daily trending snapshots
DJ notes
Ratings
Energy levels
Crates
Folders
Playlists
Mix archives
Artist release history
Genre-based discovery history
```

At that point, RollWithFlow becomes the DJ's personal music brain.

It helps the DJ answer:

```text
What should I play tonight?
What worked before?
What did I discover last month?
Which songs fit this BPM and key?
Which songs are high-energy but wedding safe?
Which tracks are trending now?
Which songs should go into my next set?
```

Final product statement:

```text
RollWithFlow is a private DJ operating system for discovering, organizing, preparing, playing, and remembering music.
```
