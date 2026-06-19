from pydantic import BaseModel


class RecentlyAddedSong(BaseModel):
    id: int
    title: str
    artist: str | None = None
    genre: str | None = None
    source_type: str | None = None
    created_at: str
    is_liked: bool
    folder_names: list[str] = []


class DashboardSummary(BaseModel):
    total_songs: int
    local_songs: int
    liked_songs: int
    discovered_songs: int
    folders: int
    playlists: int
    crates: int
    mixes: int
    discovery_items: int
    rejected_songs: int
    missing_bpm: int
    missing_key: int
    missing_genre: int
    unfiled_songs: int
    recently_added: list[RecentlyAddedSong] = []
