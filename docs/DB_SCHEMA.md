# Database Schema: RollWithFlow

**Database:** PostgreSQL

This document outlines the database schema for the RollWithFlow DJ platform. All tables utilize `UUID` for primary keys to ensure global uniqueness and seamless merging if needed in the future.

---

## 1. Core Entities

### `users`
Stores single-user / multi-user admin accounts and their settings.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email |
| `password_hash` | VARCHAR(255) | NOT NULL | Encrypted password |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### `artists`
Stores musical artist details.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique artist ID |
| `name` | VARCHAR(255) | NOT NULL | Artist's name |
| `image_url` | TEXT | | Profile image URL |

### `albums`
Stores album or EP details.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique album ID |
| `title` | VARCHAR(255) | NOT NULL | Album title |
| `artist_id` | UUID | FK -> `artists(id)` | Main artist of the album |
| `release_date` | DATE | | Album release date |
| `cover_url` | TEXT | | Album art URL |

### `genres`
Stores genre categories.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique genre ID |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Genre name (e.g., 'Tech House') |

### `songs`
The central tracks table containing standard audio metadata.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique track ID |
| `title` | VARCHAR(255) | NOT NULL | Song title |
| `artist_id` | UUID | FK -> `artists(id)` | Primary artist reference |
| `album_id` | UUID | FK -> `albums(id)` | Album reference (Nullable) |
| `genre_id` | UUID | FK -> `genres(id)` | Primary genre reference |
| `duration_ms` | INTEGER | NOT NULL | Track duration in milliseconds |
| `bpm` | NUMERIC(5,2) | | Beats per minute (e.g., 126.00) |
| `key` | VARCHAR(10) | | Musical key (e.g., '8A', 'Am') |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Added to DB timestamp |

---

## 2. Integration Entities

### `song_sources`
Tracks where the audio actually originates (Spotify, YouTube, Local). 
*A single song could have multiple sources (e.g., an exact match on Spotify and YT).*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique source ID |
| `song_id` | UUID | FK -> `songs(id)` | Reference to internal track |
| `source_type`| VARCHAR(50) | NOT NULL | 'spotify', 'youtube', 'local' |
| `source_id` | VARCHAR(255) | NOT NULL | ID from external provider |
| `stream_url` | TEXT | | Direct stream URL or file path |

---

## 3. Organization Entities

### `playlists`
Standard playlists.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique playlist ID |
| `user_id` | UUID | FK -> `users(id)` | Owner of the playlist |
| `name` | VARCHAR(255) | NOT NULL | Playlist name |
| `cover_url` | TEXT | | Custom artwork |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### `playlist_songs`
Junction table for Playlist <-> Song relationship.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `playlist_id`| UUID | FK -> `playlists(id)`| Reference to playlist |
| `song_id` | UUID | FK -> `songs(id)` | Reference to track |
| `order_index`| INTEGER | NOT NULL | Ordering position |
| `added_at` | TIMESTAMPTZ | DEFAULT NOW() | When added to playlist |
*(Composite Primary Key: `playlist_id`, `song_id`)*

### `crates`
DJ-specific collections (Crates).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique crate ID |
| `user_id` | UUID | FK -> `users(id)` | Owner of the crate |
| `name` | VARCHAR(255) | NOT NULL | Crate name (e.g., 'Peak Time')|
| `color_code` | VARCHAR(7) | DEFAULT '#FFFFFF'| UI accent color (Hex) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### `crate_songs`
Junction table for Crate <-> Song relationship.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `crate_id` | UUID | FK -> `crates(id)` | Reference to crate |
| `song_id` | UUID | FK -> `songs(id)` | Reference to track |
| `order_index`| INTEGER | NOT NULL | Ordering position |
| `added_at` | TIMESTAMPTZ | DEFAULT NOW() | When added to crate |
*(Composite Primary Key: `crate_id`, `song_id`)*

### `folders`
Hierarchical folders to group crates/playlists.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique folder ID |
| `user_id` | UUID | FK -> `users(id)` | Owner of the folder |
| `parent_id` | UUID | FK -> `folders(id)` | Self-referencing (Nullable) |
| `name` | VARCHAR(255) | NOT NULL | Folder name (e.g., '2026') |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### `folder_songs`
Direct associations of songs inside a folder (optional, if users want songs directly in folders instead of crates).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `folder_id` | UUID | FK -> `folders(id)` | Reference to folder |
| `song_id` | UUID | FK -> `songs(id)` | Reference to track |
| `added_at` | TIMESTAMPTZ | DEFAULT NOW() | When added to folder |
*(Composite Primary Key: `folder_id`, `song_id`)*

### `liked_songs`
Quick-access favorites.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | FK -> `users(id)` | User who liked the song |
| `song_id` | UUID | FK -> `songs(id)` | Track liked |
| `liked_at` | TIMESTAMPTZ | DEFAULT NOW() | When liked |
*(Composite Primary Key: `user_id`, `song_id`)*

---

## 4. Metadata Entities

### `song_tags`
Custom vibe/energy tags for songs.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique tag ID |
| `song_id` | UUID | FK -> `songs(id)` | Associated track |
| `tag_name` | VARCHAR(50) | NOT NULL | Text tag (e.g., 'Banger') |

### `song_notes`
Private textual notes on tracks.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique note ID |
| `song_id` | UUID | FK -> `songs(id)` | Associated track |
| `user_id` | UUID | FK -> `users(id)` | Note author |
| `content` | TEXT | NOT NULL | The text note |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### `song_ratings`
1-5 star ratings for songs.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | FK -> `users(id)` | User rating the song |
| `song_id` | UUID | FK -> `songs(id)` | Associated track |
| `rating` | INTEGER | CHECK (rating >= 1 AND rating <= 5) | Star rating 1 to 5 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
*(Composite Primary Key: `user_id`, `song_id`)*

---

## 5. Entity Relationship Summary

*   `users` (1) : (M) `playlists`, `crates`, `folders`, `liked_songs`, `song_notes`, `song_ratings`
*   `artists` (1) : (M) `albums`, `songs`
*   `albums` (1) : (M) `songs`
*   `genres` (1) : (M) `songs`
*   `songs` (1) : (M) `song_sources`, `song_tags`, `song_notes`
*   **Many-to-Many via Junction Tables:**
    *   `playlists` (M) : (M) `songs` (via `playlist_songs`)
    *   `crates` (M) : (M) `songs` (via `crate_songs`)
    *   `folders` (M) : (M) `songs` (via `folder_songs`)
    *   `users` (M) : (M) `songs` (via `liked_songs`, `song_ratings`)
