import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_BASE_URL, type ApiResult } from "@/lib/api";
import type { AnalyticsSummary, Crate, DashboardSummary, DiscoveryFetchRun, DiscoveryItem, DiscoveryMonitor, EventItem, Folder, Mix, MixSong, Playlist, PlaylistSong, ProviderStatus, Song } from "@/types/api";

async function serverGet<T>(path: string): Promise<ApiResult<T>> {
  const token = (await cookies()).get("rwf_token")?.value;
  if (!token) redirect("/login?reauth=1");
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) redirect("/login?reauth=1");
    if (!response.ok) return { data: null, error: `Backend returned ${response.status}` };
    return { data: await response.json() as T, error: null };
  } catch {
    return { data: null, error: "Backend is not reachable. Start FastAPI on port 8001 and try again." };
  }
}

export const getDashboardSummary = () => serverGet<DashboardSummary>("/api/dashboard/summary");
export const getSongs = (query = "") => serverGet<Song[]>(`/api/songs${query}`);
export const getLikedSongs = () => serverGet<Song[]>("/api/liked-songs");
export const getFolders = () => serverGet<Folder[]>("/api/folders");
export const getFolder = (id: number) => serverGet<Folder>(`/api/folders/${id}`);
export const getFolderSongs = (id: number) => serverGet<Song[]>(`/api/folders/${id}/songs`);
export const getPlaylists = () => serverGet<Playlist[]>("/api/playlists");
export const getPlaylist = (id: number) => serverGet<Playlist>(`/api/playlists/${id}`);
export const getPlaylistSongs = (id: number) => serverGet<PlaylistSong[]>(`/api/playlists/${id}/songs`);
export const getCrates = () => serverGet<Crate[]>("/api/crates");
export const getCrate = (id: number) => serverGet<Crate>(`/api/crates/${id}`);
export const getCrateSongs = (id: number) => serverGet<Song[]>(`/api/crates/${id}/songs`);
export const getMixes = () => serverGet<Mix[]>("/api/mixes");
export const getMix = (id: number) => serverGet<Mix>(`/api/mixes/${id}`);
export const getMixSongs = (id: number) => serverGet<MixSong[]>(`/api/mixes/${id}/songs`);
export const getDiscovery = () => serverGet<DiscoveryItem[]>("/api/discovery");
export const getProviderStatus = () => serverGet<ProviderStatus>("/api/providers/status");
export const getDiscoveryMonitors = () => serverGet<DiscoveryMonitor[]>("/api/discovery/monitors");
export const getDiscoveryFetchRuns = () => serverGet<DiscoveryFetchRun[]>("/api/discovery/fetch-runs");
export const getEvents = () => serverGet<EventItem[]>("/api/events");
export const getEvent = (id: number) => serverGet<EventItem>(`/api/events/${id}`);
export const getAnalytics = () => serverGet<AnalyticsSummary>("/api/analytics/summary");
