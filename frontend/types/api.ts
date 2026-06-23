export type SourceType = "local" | "spotify" | "youtube" | "soundcloud" | "beatport" | "manual" | "other";

export type LibraryScanResult = {
  scanned_count: number;
  created_count: number;
  skipped_count: number;
  errors: string[];
};

export type AudioUploadResult = {
  uploaded_count: number;
  created_count: number;
  skipped_count: number;
  errors: string[];
  created_songs: Song[];
};

export type LocalFileMissing = {
  id: number;
  title: string;
  artist_name?: string | null;
  source_name?: string | null;
  status: string;
};

export type LocalFileHealthResult = {
  checked_count: number;
  ok_count: number;
  missing_count: number;
  error_count: number;
  missing_songs: LocalFileMissing[];
};

export type AuthUser = {
  id: number;
  email: string;
  display_name: string;
  is_admin: boolean;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type DashboardRecentSong = {
  id: number;
  title: string;
  artist?: string | null;
  genre?: string | null;
  source_type?: SourceType | null;
  created_at: string;
  is_liked: boolean;
  folder_names: string[];
};

export type DashboardSummary = {
  total_songs: number;
  local_songs: number;
  liked_songs: number;
  discovered_songs: number;
  folders: number;
  playlists: number;
  crates: number;
  mixes: number;
  discovery_items: number;
  rejected_songs: number;
  missing_bpm: number;
  missing_key: number;
  missing_genre: number;
  unfiled_songs: number;
  recently_added: DashboardRecentSong[];
};

export type Artist = { id: number; name: string };
export type Album = { id: number; title: string };
export type Genre = { id: number; name: string };
export type Source = { id: number; name: string; type: SourceType; url?: string | null };
export type Folder = {
  id: number;
  name: string;
  description?: string | null;
  is_pinned: boolean;
  song_count: number;
  songs_count: number;
  playlists_count: number;
  mixes_count: number;
  created_at: string;
  updated_at: string;
};

export type Song = {
  id: number;
  title: string;
  artist?: Artist | null;
  album?: Album | null;
  genre?: Genre | null;
  duration_seconds?: number | null;
  bpm?: number | null;
  musical_key?: string | null;
  energy_level?: number | null;
  rating?: number | null;
  notes?: string | null;
  compatibility_note?: string | null;
  is_liked: boolean;
  is_rejected: boolean;
  is_active: boolean;
  sources: Source[];
  folders: Folder[];
  created_at: string;
  updated_at: string;
};

export type SongPayload = {
  title: string;
  artist_name?: string;
  album_name?: string;
  genre_name?: string;
  duration_seconds?: number | null;
  bpm?: number | null;
  musical_key?: string;
  energy_level?: number | null;
  rating?: number | null;
  notes?: string;
  compatibility_note?: string;
  source_type?: SourceType;
  source_url?: string;
  is_liked?: boolean;
};

export type FolderPayload = {
  name: string;
  description?: string;
  is_pinned?: boolean;
};

export type CollectionItem = {
  id: number;
  name?: string;
  title?: string;
  description?: string | null;
  notes?: string | null;
  mood?: string | null;
  event_type?: string | null;
  energy_level?: number | null;
  song_count?: number;
  is_pinned?: boolean;
};

export type Playlist = CollectionItem & { name: string; description?: string | null; event_type?: string | null; mood?: string | null; song_count: number };
export type Crate = CollectionItem & { name: string; description?: string | null; energy_level?: number | null; mood?: string | null; song_count: number };
export type Mix = {
  id: number;
  title: string;
  genre?: Genre | null;
  mood?: string | null;
  event_type?: string | null;
  bpm_min?: number | null;
  bpm_max?: number | null;
  musical_key?: string | null;
  notes?: string | null;
  tracklist_text?: string | null;
  created_at: string;
  updated_at: string;
};
export type MixSong = { id: number; mix_id: number; song_id: number; position: number; cue_notes?: string | null; transition_notes?: string | null; song: Song };

export type PlaylistSong = Song & {
  position?: number | null;
  cue_note?: string | null;
  transition_note?: string | null;
  must_play: boolean;
  optional: boolean;
};

export type DiscoveryItem = {
  id: number;
  title: string;
  artist_name?: string | null;
  platform: string;
  source_url?: string | null;
  thumbnail_url?: string | null;
  discovery_type: string;
  popularity_score?: number | null;
  is_saved: boolean;
  is_rejected: boolean;
  metadata_json?: Record<string, unknown> | null;
};

export type ProviderStatus = {
  spotify: { configured: boolean; connected: boolean };
  youtube: { configured: boolean };
};

export type ProviderDiagnostics = ProviderStatus & {
  spotify_redirect_uri?: string | null;
};

export type ProviderSearchItem = {
  title: string;
  artist_name?: string | null;
  platform: string;
  source_url?: string | null;
  thumbnail_url?: string | null;
  discovery_type: string;
  popularity_score?: number | null;
  metadata_json?: Record<string, unknown> | null;
};

export type ProviderSearchResponse = {
  provider: string;
  results: ProviderSearchItem[];
  requested_count: number;
  returned_count: number;
};

export type DiscoveryMonitor = {
  id: number;
  name: string;
  provider: "mock" | "spotify" | "youtube";
  monitor_type: "genre" | "artist" | "query" | "trending" | "latest";
  query?: string | null;
  genre?: string | null;
  artist_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DiscoveryFetchRun = {
  id: number;
  provider: string;
  run_type: string;
  status: "success" | "partial" | "failed" | "skipped";
  started_at: string;
  finished_at?: string | null;
  items_found: number;
  items_saved: number;
  error_message?: string | null;
  metadata_json?: Record<string, unknown> | null;
};

export type EventItem = { id: number; name: string; event_type?: string | null; event_date?: string | null; venue?: string | null; client_name?: string | null; expected_guests?: number | null; mood?: string | null; notes?: string | null; readiness_percent: number; created_at: string; updated_at: string };
export type EventTimelineItem = { id: number; event_id: number; title: string; start_time?: string | null; end_time?: string | null; sort_order: number; notes?: string | null; playlist_id?: number | null; crate_id?: number | null };
export type EventChecklistItem = { id: number; event_id: number; title: string; category?: string | null; is_done: boolean; sort_order: number; notes?: string | null };
export type EventMusicLink = { id: number; event_id: number; playlist_id?: number | null; crate_id?: number | null; mix_id?: number | null; notes?: string | null };
export type AnalyticsSummary = { total_songs: number; playable_local_songs: number; provider_only_songs: number; liked_songs: number; rejected_songs: number; missing_bpm: number; missing_key: number; missing_genre: number; missing_artwork: number; top_genres: { name: string; count: number }[]; top_artists: { name: string; count: number }[]; source_breakdown: { name: string; count: number }[]; energy_distribution: { name: string; count: number }[]; rating_distribution: { name: string; count: number }[]; most_used_folders: { name: string; count: number }[]; most_used_crates: { name: string; count: number }[]; playlist_count: number; event_count: number };
