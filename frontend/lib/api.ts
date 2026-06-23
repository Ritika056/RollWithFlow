import type {
  DashboardSummary,
  AuthUser,
  AudioUploadResult,
  DiscoveryItem,
  Folder,
  FolderPayload,
  LibraryScanResult,
  LocalFileHealthResult,
  Crate,
  Mix,
  Playlist,
  PlaylistSong,
  Song,
  SongPayload,
  LoginResponse,
  ProviderSearchResponse,
  ProviderStatus,
  ProviderDiagnostics,
  DiscoveryFetchRun,
  DiscoveryMonitor,
  EventItem, EventTimelineItem, EventChecklistItem, EventMusicLink, AnalyticsSummary,
  MixSong,
} from "@/types/api";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const token = getBrowserToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      credentials: "include",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      const text = await response.text();
      if (response.status === 401 && path !== "/api/auth/login" && typeof window !== "undefined") {
        document.cookie = "rwf_token=; Path=/; Max-Age=0; SameSite=Lax";
        window.location.assign("/login?reauth=1");
      }
      return { data: null, error: text || `Backend returned ${response.status}` };
    }
    return { data: (await response.json()) as T, error: null };
  } catch {
    return { data: null, error: "Backend is not reachable. Start FastAPI on port 8001 and try again." };
  }
}

function getBrowserToken(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((item) => item.startsWith("rwf_token="));
  return entry ? decodeURIComponent(entry.slice("rwf_token=".length)) : null;
}

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
export const apiPatch = <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = <T>(path: string) => request<T>(path, { method: "DELETE" });

export const getDashboardSummary = () => apiGet<DashboardSummary>("/api/dashboard/summary");
export const login = (email: string, password: string) => apiPost<LoginResponse>("/api/auth/login", { email, password });
export const getCurrentUser = () => apiGet<AuthUser>("/api/auth/me");
export const logout = () => apiPost<{ status: string }>("/api/auth/logout");
export const scanLibraryFolder = (folderPath: string) => apiPost<LibraryScanResult>("/api/library/scan-folder", { folder_path: folderPath });
export async function uploadAudioFiles(files: File[]): Promise<ApiResult<AudioUploadResult>> {
  try {
    const token = getBrowserToken();
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    const response = await fetch(`${API_BASE_URL}/api/library/upload-audio`, {
      method: "POST", credentials: "include", body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) return { data: null, error: (await response.text()) || `Backend returned ${response.status}` };
    return { data: await response.json() as AudioUploadResult, error: null };
  } catch {
    return { data: null, error: "Audio import could not reach the local backend." };
  }
}
export const checkLocalFiles = () => apiPost<LocalFileHealthResult>("/api/library/check-files");
export const repairLocalPath = (id: number, newFilePath: string) => apiPost<Song>(`/api/songs/${id}/repair-local-path`, { new_file_path: newFilePath });
export const rescanSongMetadata = (id: number, overwrite = false) => apiPost<Song>(`/api/songs/${id}/rescan-metadata`, { overwrite });
export const getSongs = (query = "") => apiGet<Song[]>(`/api/songs${query}`);
export const getLikedSongs = () => apiGet<Song[]>("/api/liked-songs");
export const getFolders = () => apiGet<Folder[]>("/api/folders");
export const getFolder = (id: number) => apiGet<Folder>(`/api/folders/${id}`);
export const getFolderSongs = (id: number) => apiGet<Song[]>(`/api/folders/${id}/songs`);
export const createSong = (payload: SongPayload) => apiPost<Song>("/api/songs", payload);
export const updateSong = (id: number, payload: SongPayload) => apiPatch<Song>(`/api/songs/${id}`, payload);
export const likeSong = (id: number) => apiPost<Song>(`/api/songs/${id}/like`);
export const unlikeSong = (id: number) => apiPost<Song>(`/api/songs/${id}/unlike`);
export const rejectSong = (id: number) => apiPost<{ status: string }>(`/api/songs/${id}/reject`);
export const createFolder = (payload: FolderPayload) => apiPost<Folder>("/api/folders", payload);
export const updateFolder = (id: number, payload: FolderPayload) => apiPatch<Folder>(`/api/folders/${id}`, payload);
export const deleteFolder = (id: number) => apiDelete<{ status: string }>(`/api/folders/${id}`);
export const addSongToFolder = (folderId: number, songId: number) => apiPost<Folder>(`/api/folders/${folderId}/songs/${songId}`);
export const removeSongFromFolder = (folderId: number, songId: number) => apiDelete<Folder>(`/api/folders/${folderId}/songs/${songId}`);
export const getPlaylists = () => apiGet<Playlist[]>("/api/playlists");
export const getPlaylist = (id: number) => apiGet<Playlist>(`/api/playlists/${id}`);
export const getPlaylistSongs = (id: number) => apiGet<PlaylistSong[]>(`/api/playlists/${id}/songs`);
export const createPlaylist = (payload: Partial<Playlist>) => apiPost<Playlist>("/api/playlists", payload);
export const updatePlaylist = (id: number, payload: Partial<Playlist>) => apiPatch<Playlist>(`/api/playlists/${id}`, payload);
export const deletePlaylist = (id: number) => apiDelete<{ status: string }>(`/api/playlists/${id}`);
export const addSongToPlaylist = (playlistId: number, songId: number) => apiPost<Playlist>(`/api/playlists/${playlistId}/songs/${songId}`);
export const updatePlaylistSong = (playlistId: number, songId: number, payload: Partial<PlaylistSong>) => apiPatch<PlaylistSong>(`/api/playlists/${playlistId}/songs/${songId}`, payload);
export const removeSongFromPlaylist = (playlistId: number, songId: number) => apiDelete<Playlist>(`/api/playlists/${playlistId}/songs/${songId}`);
export const getCrates = () => apiGet<Crate[]>("/api/crates");
export const getCrate = (id: number) => apiGet<Crate>(`/api/crates/${id}`);
export const getCrateSongs = (id: number) => apiGet<Song[]>(`/api/crates/${id}/songs`);
export const createCrate = (payload: Partial<Crate>) => apiPost<Crate>("/api/crates", payload);
export const updateCrate = (id: number, payload: Partial<Crate>) => apiPatch<Crate>(`/api/crates/${id}`, payload);
export const deleteCrate = (id: number) => apiDelete<{ status: string }>(`/api/crates/${id}`);
export const addSongToCrate = (crateId: number, songId: number) => apiPost<Crate>(`/api/crates/${crateId}/songs/${songId}`);
export const removeSongFromCrate = (crateId: number, songId: number) => apiDelete<Crate>(`/api/crates/${crateId}/songs/${songId}`);
export const getMixes = () => apiGet<Mix[]>("/api/mixes");
export const getMix = (id: number) => apiGet<Mix>(`/api/mixes/${id}`);
export const createMix = (payload: Partial<Mix> & { genre_name?: string }) => apiPost<Mix>("/api/mixes", payload);
export const updateMix = (id: number, payload: Partial<Mix> & { genre_name?: string }) => apiPatch<Mix>(`/api/mixes/${id}`, payload);
export const deleteMix = (id: number) => apiDelete<{ status: string }>(`/api/mixes/${id}`);
export const getMixSongs = (id: number) => apiGet<MixSong[]>(`/api/mixes/${id}/songs`);
export const addMixSong = (mixId: number, payload: { song_id: number; position?: number; cue_notes?: string; transition_notes?: string }) => apiPost<MixSong>(`/api/mixes/${mixId}/songs`, payload);
export const updateMixSong = (mixId: number, linkId: number, payload: Partial<MixSong>) => apiPatch<MixSong>(`/api/mixes/${mixId}/songs/${linkId}`, payload);
export const deleteMixSong = (mixId: number, linkId: number) => apiDelete<{ status: string }>(`/api/mixes/${mixId}/songs/${linkId}`);
export const getDiscovery = () => apiGet<DiscoveryItem[]>("/api/discovery");
export const createDiscovery = (payload: Partial<DiscoveryItem>) => apiPost<DiscoveryItem>("/api/discovery", payload);
export const saveDiscoveryToLibrary = (id: number) => apiPost<Song>(`/api/discovery/${id}/save-to-library`);
export const rejectDiscovery = (id: number) => apiPost<{ status: string }>(`/api/discovery/${id}/reject`);
export const restoreDiscovery = (id: number) => apiPost<DiscoveryItem>(`/api/discovery/${id}/restore`);
export const mockDailyFetch = () => apiPost<DiscoveryItem[]>("/api/discovery/mock-daily-fetch");
export const getProviderStatus = () => apiGet<ProviderStatus>("/api/providers/status");
export const getProviderDiagnostics = () => apiGet<ProviderDiagnostics>("/api/providers/diagnostics");
export const getSpotifyConnectUrl = () => apiGet<{ authorization_url: string }>("/api/providers/spotify/connect");
export const disconnectSpotify = () => apiPost<{ status: string }>("/api/providers/spotify/disconnect");
export const searchSpotify = (query: string, limit = 50) => apiPost<ProviderSearchResponse>("/api/providers/spotify/search", { query, limit });
export const searchYouTube = (query: string, limit = 50) => apiPost<ProviderSearchResponse>("/api/providers/youtube/search", { query, limit });
export const createDiscoveryMonitor = (payload: Partial<DiscoveryMonitor>) => apiPost<DiscoveryMonitor>("/api/discovery/monitors", payload);
export const updateDiscoveryMonitor = (id: number, payload: Partial<DiscoveryMonitor>) => apiPatch<DiscoveryMonitor>(`/api/discovery/monitors/${id}`, payload);
export const deleteDiscoveryMonitor = (id: number) => apiDelete<{ status: string }>(`/api/discovery/monitors/${id}`);
export const runDiscoveryFetch = (provider?: string) => apiPost<DiscoveryFetchRun[]>("/api/discovery/run-fetch", provider ? { provider } : {});
export const runLocalDailyFetch = () => apiPost<DiscoveryFetchRun[]>("/api/discovery/run-local-daily-fetch");
export const getEvents = () => apiGet<EventItem[]>("/api/events");
export const getEvent = (id: number) => apiGet<EventItem>(`/api/events/${id}`);
export const createEvent = (payload: Partial<EventItem>) => apiPost<EventItem>("/api/events", payload);
export const updateEvent = (id: number, payload: Partial<EventItem>) => apiPatch<EventItem>(`/api/events/${id}`, payload);
export const deleteEvent = (id: number) => apiDelete<{ status: string }>(`/api/events/${id}`);
export const getEventTimeline = (id: number) => apiGet<EventTimelineItem[]>(`/api/events/${id}/timeline`);
export const createEventTimeline = (id: number, payload: Partial<EventTimelineItem>) => apiPost<EventTimelineItem>(`/api/events/${id}/timeline`, payload);
export const updateEventTimeline = (id: number, itemId: number, payload: Partial<EventTimelineItem>) => apiPatch<EventTimelineItem>(`/api/events/${id}/timeline/${itemId}`, payload);
export const deleteEventTimeline = (id: number, itemId: number) => apiDelete<{ status: string }>(`/api/events/${id}/timeline/${itemId}`);
export const getEventChecklist = (id: number) => apiGet<EventChecklistItem[]>(`/api/events/${id}/checklist`);
export const createEventChecklist = (id: number, payload: Partial<EventChecklistItem>) => apiPost<EventChecklistItem>(`/api/events/${id}/checklist`, payload);
export const updateEventChecklist = (id: number, itemId: number, payload: Partial<EventChecklistItem>) => apiPatch<EventChecklistItem>(`/api/events/${id}/checklist/${itemId}`, payload);
export const deleteEventChecklist = (id: number, itemId: number) => apiDelete<{ status: string }>(`/api/events/${id}/checklist/${itemId}`);
export const getEventMusicLinks = (id: number) => apiGet<EventMusicLink[]>(`/api/events/${id}/music-links`);
export const createEventMusicLink = (id: number, payload: Partial<EventMusicLink>) => apiPost<EventMusicLink>(`/api/events/${id}/music-links`, payload);
export const deleteEventMusicLink = (id: number, linkId: number) => apiDelete<{ status: string }>(`/api/events/${id}/music-links/${linkId}`);
export const getAnalytics = () => apiGet<AnalyticsSummary>("/api/analytics/summary");
export const analyzeAudioBasic = (id: number) => apiPost<Song>(`/api/songs/${id}/analyze-audio-basic`);
