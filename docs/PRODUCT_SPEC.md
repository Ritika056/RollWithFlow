# Product Specification: RollWithFlow

## 1. Vision
**RollWithFlow** is a premium, single-user private DJ music management platform. It serves as the ultimate command center for a modern DJ, bridging the gap between mainstream music discovery (Spotify, YouTube Music) and professional performance preparation. By combining metadata tracking (BPM, Key), custom organization (Crates, Folders), and AI-driven recommendations into one seamless dark-themed dashboard, RollWithFlow eliminates the friction of managing sprawling track libraries across multiple apps.

## 2. User Stories
*As a single DJ user...*
- **Discovery**: I want to see trending and latest songs, as well as AI recommendations, so I can easily find fresh music for my sets.
- **Integration**: I want to link my Spotify and YouTube Music accounts so I can search, import, and listen to tracks directly within my dashboard.
- **Organization**: I want to organize my tracks into custom DJ Crates, Playlists, and hierarchical Folders so I can structure my music for different gigs and moods.
- **Metadata Management**: I want to view and edit BPM and Key information for every track so I can plan flawless harmonic transitions.
- **Curation**: I want to group my library by Artists, Genres, and Liked Songs, rate tracks, and attach custom text notes to them to remember specific cue points or vibe tags.
- **Playback**: I want a built-in music player so I can preview tracks, test transitions, and listen to my crates without leaving the platform.

## 3. Features
**Music Discovery & Intelligence**
- Universal Search (Local library + Spotify + YouTube Music)
- Trending & Latest Songs charts
- AI-Powered Recommendations based on crate contents and listening habits

**Third-Party Integrations**
- Spotify API Integration (Import playlists, liked songs, playback via Web Playback SDK)
- YouTube Music API Integration (Search, metadata, audio playback)

**Library Management & Organization**
- DJ Crates (Drag-and-drop gig-specific collections)
- Standard Playlists & Liked Songs
- Nested Folder Organization (e.g., `2026/Clubs/Summer`)
- Auto-generated Artist and Genre collections

**DJ Preparation & Metadata**
- BPM (Beats Per Minute) Tracking & Sorting
- Musical Key Tracking (Camelot Wheel / Standard Key)
- 5-Star Song Ratings
- Custom Song Notes (e.g., "Drop at 1:15", "Great for peak time")

**Playback & UI**
- Persistent Global Music Player with waveform/scrubbing
- Dark-theme, high-contrast, premium interface tailored for low-light DJ environments

## 4. Functional Requirements
- **Authentication**: Single-tenant admin login system; only the owner can access the platform.
- **OAuth Sync**: System must securely authenticate and store tokens for Spotify and Google/YouTube APIs.
- **CRUD Operations**: The user must be able to Create, Read, Update, and Delete items for Crates, Playlists, Folders, Notes, and Ratings.
- **Cross-Platform Search**: The search bar must query the internal database, Spotify, and YouTube Music simultaneously and unify the results.
- **Player Controls**: The integrated player must support play, pause, next, previous, scrub, volume control, and continuous queue playback across different track sources.
- **Metadata Editing**: The UI must provide inline editing for a track's BPM, Key, Rating, and Notes.
- **AI Recommendation Engine**: The system must analyze track metadata (BPM, Key, Genre) of a selected Crate to ping an LLM/recommendation API and return a list of suggested tracks.

## 5. Non-Functional Requirements
- **Performance**: Search results across integrated platforms should resolve and render in under 500ms.
- **Scalability**: The database and UI must comfortably handle a personal library of 50,000+ saved tracks without noticeable lag during scroll or search.
- **Security**: Third-party API keys and OAuth tokens must be encrypted at rest. The application must not expose any data to public internet traffic (requires strict auth guards).
- **Usability**: The UI must be strictly dark mode to reduce eye strain in dark studio/club environments, with high-contrast accent colors (e.g., neon green/Spotify green).
- **Responsiveness**: While primarily desktop-focused for management, the core UI must be responsive and usable on an iPad/tablet format for on-the-go library sorting.
- **Reliability**: The app should cache library metadata locally to ensure the user can browse their library even if Spotify/YouTube APIs experience downtime.
