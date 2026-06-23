from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ArtistRead(ORMBase):
    id: int
    name: str


class AlbumRead(ORMBase):
    id: int
    title: str


class GenreRead(ORMBase):
    id: int
    name: str


class SourceRead(ORMBase):
    id: int
    name: str
    type: str
    external_id: str | None = None
    url: str | None = None
    metadata_json: dict[str, Any] | None = None


class SongRead(ORMBase):
    id: int
    title: str
    artist: ArtistRead | None = None
    album: AlbumRead | None = None
    genre: GenreRead | None = None
    duration_seconds: int | None = None
    bpm: float | None = None
    musical_key: str | None = None
    energy_level: int | None = None
    rating: int | None = None
    notes: str | None = None
    compatibility_note: str | None = None
    detected_bpm: float | None = None
    detected_key: str | None = None
    waveform_status: str | None = None
    analysis_status: str | None = None
    analysis_error: str | None = None
    is_liked: bool
    is_rejected: bool
    is_active: bool
    sources: list[SourceRead] = []
    folders: list["FolderRead"] = []
    created_at: datetime
    updated_at: datetime


class FolderRead(ORMBase):
    id: int
    name: str
    description: str | None = None
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    song_count: int = 0
    songs_count: int = 0
    playlists_count: int = 0
    mixes_count: int = 0


class SongWrite(BaseModel):
    title: str
    artist_name: str | None = None
    album_name: str | None = None
    genre_name: str | None = None
    duration_seconds: int | None = None
    bpm: float | None = None
    musical_key: str | None = None
    energy_level: int | None = None
    rating: int | None = None
    notes: str | None = None
    compatibility_note: str | None = None
    source_type: str | None = "manual"
    source_url: str | None = None
    is_liked: bool = False


class SongUpdate(BaseModel):
    title: str | None = None
    artist_name: str | None = None
    album_name: str | None = None
    genre_name: str | None = None
    duration_seconds: int | None = None
    bpm: float | None = None
    musical_key: str | None = None
    energy_level: int | None = None
    rating: int | None = None
    notes: str | None = None
    compatibility_note: str | None = None
    source_type: str | None = None
    source_url: str | None = None
    is_liked: bool | None = None


class LibraryScanRequest(BaseModel):
    folder_path: str


class LibraryScanResult(BaseModel):
    scanned_count: int
    created_count: int
    skipped_count: int
    errors: list[str] = []


class AudioUploadResult(BaseModel):
    uploaded_count: int
    created_count: int
    skipped_count: int
    errors: list[str] = []
    created_songs: list[SongRead] = []


class LocalFileMissingRead(BaseModel):
    id: int
    title: str
    artist_name: str | None = None
    source_name: str | None = None
    status: str


class LocalFileHealthResult(BaseModel):
    checked_count: int
    ok_count: int
    missing_count: int
    error_count: int
    missing_songs: list[LocalFileMissingRead] = []


class RepairLocalPathRequest(BaseModel):
    new_file_path: str


class RescanMetadataRequest(BaseModel):
    overwrite: bool = False


class EventWrite(BaseModel):
    name: str
    event_type: str | None = None
    event_date: datetime | None = None
    venue: str | None = None
    client_name: str | None = None
    expected_guests: int | None = None
    mood: str | None = None
    notes: str | None = None


class EventTimelineWrite(BaseModel):
    title: str
    start_time: str | None = None
    end_time: str | None = None
    sort_order: int = 0
    notes: str | None = None
    playlist_id: int | None = None
    crate_id: int | None = None


class EventChecklistWrite(BaseModel):
    title: str
    category: str | None = None
    is_done: bool = False
    sort_order: int = 0
    notes: str | None = None


class EventMusicLinkWrite(BaseModel):
    playlist_id: int | None = None
    crate_id: int | None = None
    mix_id: int | None = None
    notes: str | None = None


class EventTimelineRead(ORMBase):
    id: int
    event_id: int
    title: str
    start_time: str | None = None
    end_time: str | None = None
    sort_order: int
    notes: str | None = None
    playlist_id: int | None = None
    crate_id: int | None = None


class EventChecklistRead(ORMBase):
    id: int
    event_id: int
    title: str
    category: str | None = None
    is_done: bool
    sort_order: int
    notes: str | None = None


class EventMusicLinkRead(ORMBase):
    id: int
    event_id: int
    playlist_id: int | None = None
    crate_id: int | None = None
    mix_id: int | None = None
    notes: str | None = None


class EventRead(ORMBase):
    id: int
    name: str
    event_type: str | None = None
    event_date: datetime | None = None
    venue: str | None = None
    client_name: str | None = None
    expected_guests: int | None = None
    mood: str | None = None
    notes: str | None = None
    readiness_percent: int
    created_at: datetime
    updated_at: datetime


class AnalyticsSummary(BaseModel):
    total_songs: int
    playable_local_songs: int
    provider_only_songs: int
    liked_songs: int
    rejected_songs: int
    missing_bpm: int
    missing_key: int
    missing_genre: int
    missing_artwork: int
    top_genres: list[dict[str, Any]]
    top_artists: list[dict[str, Any]]
    source_breakdown: list[dict[str, Any]]
    energy_distribution: list[dict[str, Any]]
    rating_distribution: list[dict[str, Any]]
    most_used_folders: list[dict[str, Any]]
    most_used_crates: list[dict[str, Any]]
    playlist_count: int
    event_count: int


class BackupValidationReport(BaseModel):
    valid: bool
    errors: list[str] = []
    counts: dict[str, int] = {}
    would_create: dict[str, int] = {}
    would_update: dict[str, int] = {}
    would_skip: dict[str, int] = {}
    notes: list[str] = []


class FolderWrite(BaseModel):
    name: str
    description: str | None = None
    is_pinned: bool = False


class PlaylistRead(ORMBase):
    id: int
    name: str
    description: str | None = None
    event_type: str | None = None
    mood: str | None = None
    created_at: datetime
    updated_at: datetime
    song_count: int = 0


class PlaylistWrite(BaseModel):
    name: str
    description: str | None = None
    event_type: str | None = None
    mood: str | None = None


class PlaylistSongUpdate(BaseModel):
    position: int | None = None
    cue_note: str | None = None
    transition_note: str | None = None
    must_play: bool = False
    optional: bool = False


class PlaylistSongRead(SongRead):
    position: int | None = None
    cue_note: str | None = None
    transition_note: str | None = None
    must_play: bool = False
    optional: bool = False


class CrateRead(ORMBase):
    id: int
    name: str
    description: str | None = None
    energy_level: int | None = None
    mood: str | None = None
    created_at: datetime
    updated_at: datetime
    song_count: int = 0


class CrateWrite(BaseModel):
    name: str
    description: str | None = None
    energy_level: int | None = None
    mood: str | None = None


class MixRead(ORMBase):
    id: int
    title: str
    genre: GenreRead | None = None
    mood: str | None = None
    event_type: str | None = None
    bpm_min: int | None = None
    bpm_max: int | None = None
    musical_key: str | None = None
    notes: str | None = None
    tracklist_text: str | None = None
    created_at: datetime
    updated_at: datetime


class MixWrite(BaseModel):
    title: str
    genre_name: str | None = None
    mood: str | None = None
    event_type: str | None = None
    bpm_min: int | None = None
    bpm_max: int | None = None
    musical_key: str | None = None
    notes: str | None = None
    tracklist_text: str | None = None


class MixSongWrite(BaseModel):
    song_id: int
    position: int | None = None
    cue_notes: str | None = None
    transition_notes: str | None = None


class MixSongUpdate(BaseModel):
    position: int | None = None
    cue_notes: str | None = None
    transition_notes: str | None = None


class MixSongRead(ORMBase):
    id: int
    mix_id: int
    song_id: int
    position: int
    cue_notes: str | None = None
    transition_notes: str | None = None
    song: SongRead


class DiscoveryItemRead(ORMBase):
    id: int
    title: str
    artist_name: str | None = None
    platform: str
    source_url: str | None = None
    thumbnail_url: str | None = None
    discovery_type: str
    popularity_score: float | None = None
    fetched_at: datetime
    is_saved: bool
    is_rejected: bool
    metadata_json: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime


class DiscoveryItemWrite(BaseModel):
    title: str
    artist_name: str | None = None
    platform: str = "manual"
    source_url: str | None = None
    thumbnail_url: str | None = None
    discovery_type: str = "manual_search"
    popularity_score: float | None = None
    metadata_json: dict[str, Any] | None = None


class SpotifyProviderStatus(BaseModel):
    configured: bool
    connected: bool


class YouTubeProviderStatus(BaseModel):
    configured: bool


class ProviderStatusRead(BaseModel):
    spotify: SpotifyProviderStatus
    youtube: YouTubeProviderStatus


class ProviderDiagnosticsRead(BaseModel):
    spotify: SpotifyProviderStatus
    youtube: YouTubeProviderStatus
    spotify_redirect_uri: str | None = None


class ProviderSearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=200)
    limit: int = Field(default=50, ge=1, le=100)


class ProviderSearchItem(BaseModel):
    title: str
    artist_name: str | None = None
    platform: str
    source_url: str | None = None
    thumbnail_url: str | None = None
    discovery_type: str = "manual_search"
    popularity_score: float | None = None
    metadata_json: dict[str, Any] | None = None


class ProviderSearchResponse(BaseModel):
    provider: str
    results: list[ProviderSearchItem]
    requested_count: int = 50
    returned_count: int = 0


class SpotifyConnectResponse(BaseModel):
    authorization_url: str


class SpotifyPlaybackCredentials(BaseModel):
    client_id: str
    access_token: str


class DiscoveryMonitorWrite(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    provider: str = "mock"
    monitor_type: str = "query"
    query: str | None = None
    genre: str | None = None
    artist_name: str | None = None
    is_active: bool = True


class DiscoveryMonitorUpdate(BaseModel):
    name: str | None = None
    provider: str | None = None
    monitor_type: str | None = None
    query: str | None = None
    genre: str | None = None
    artist_name: str | None = None
    is_active: bool | None = None


class DiscoveryMonitorRead(ORMBase):
    id: int
    name: str
    provider: str
    monitor_type: str
    query: str | None = None
    genre: str | None = None
    artist_name: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class DiscoveryFetchRunRead(ORMBase):
    id: int
    provider: str
    run_type: str
    status: str
    started_at: datetime
    finished_at: datetime | None = None
    items_found: int
    items_saved: int
    error_message: str | None = None
    metadata_json: dict[str, Any] | None = None


class DiscoveryRunFetchRequest(BaseModel):
    provider: str | None = None
