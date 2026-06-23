"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { Song } from "@/types/api";

type RepeatMode = "off" | "one" | "all";
type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";
type PlayerContextValue = {
  currentTrack: Song | null; queue: Song[]; recentlyPlayed: Song[]; playing: boolean; status: PlayerStatus; errorMessage: string | null;
  currentTime: number; duration: number; volume: number; repeatMode: RepeatMode; shuffle: boolean;
  playSong: (song: Song, queue?: Song[]) => void; togglePlay: () => void; next: () => void; previous: () => void; seek: (seconds: number) => void;
  setVolume: (volume: number) => void; removeFromQueue: (songId: number) => void; clearQueue: () => void; playFromQueue: (song: Song) => void;
  cycleRepeat: () => void; toggleShuffle: () => void; isLocalPlayable: (song: Song) => boolean;
};

const QUEUE_KEY = "rwf-local-queue";
const RECENT_KEY = "rwf-local-recent";
const PLAYER_KEY = "rwf-local-player-settings";
const PlayerContext = createContext<PlayerContextValue | null>(null);

function readablePlaybackError(status: number, detail?: string) {
  const message = detail?.toLowerCase() ?? "";
  if (status === 401 || status === 403) return "Your playback session expired. Sign in again to continue.";
  if (message.includes("missing") || message.includes("cannot be accessed")) return "This local file is missing or the backend cannot access it.";
  if (message.includes("unsupported")) return "This file format is not supported by this browser.";
  if (message.includes("no local")) return "This song has no local file linked for playback.";
  return "Local audio could not be played. Check the file and try again.";
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const [playbackAttempt, setPlaybackAttempt] = useState(0);

  const isLocalPlayable = useCallback((song: Song) => song.sources.some((source) => source.type === "local" && Boolean(source.url)), []);

  useEffect(() => {
    try {
      const savedQueue = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as Song[];
      const savedRecent = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as Song[];
      const savedSettings = JSON.parse(localStorage.getItem(PLAYER_KEY) ?? "{}") as { volume?: number; repeatMode?: RepeatMode; shuffle?: boolean };
      setQueue(savedQueue.filter(isLocalPlayable)); setRecentlyPlayed(savedRecent.filter(isLocalPlayable));
      if (typeof savedSettings.volume === "number") setVolumeState(savedSettings.volume);
      if (savedSettings.repeatMode) setRepeatMode(savedSettings.repeatMode);
      if (typeof savedSettings.shuffle === "boolean") setShuffle(savedSettings.shuffle);
    } catch { /* Ignore unavailable or malformed browser storage. */ }
  }, [isLocalPlayable]);

  useEffect(() => { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyPlayed)); }, [recentlyPlayed]);
  useEffect(() => { localStorage.setItem(PLAYER_KEY, JSON.stringify({ volume, repeatMode, shuffle })); }, [repeatMode, shuffle, volume]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const markRecent = useCallback((song: Song) => setRecentlyPlayed((current) => [song, ...current.filter((item) => item.id !== song.id)].slice(0, 20)), []);
  const selectTrack = useCallback((song: Song) => { setCurrentTrack(song); setPlaybackAttempt((value) => value + 1); setCurrentTime(0); setDuration(0); setErrorMessage(null); setStatus("loading"); setPlaying(true); markRecent(song); }, [markRecent]);

  const move = useCallback((direction: 1 | -1, fromEnded = false) => {
    if (!currentTrack || !queue.length) return false;
    if (fromEnded && repeatMode === "one") { if (audioRef.current) audioRef.current.currentTime = 0; audioRef.current?.play().catch(() => setPlaying(false)); return true; }
    const currentIndex = queue.findIndex((song) => song.id === currentTrack.id);
    let nextIndex = currentIndex + direction;
    if (direction === 1 && shuffle && queue.length > 1) {
      const choices = queue.map((_, index) => index).filter((index) => index !== currentIndex);
      nextIndex = choices[Math.floor(Math.random() * choices.length)];
    }
    if (nextIndex < 0 || nextIndex >= queue.length) {
      if (repeatMode !== "all") return false;
      nextIndex = direction === 1 ? 0 : queue.length - 1;
    }
    selectTrack(queue[nextIndex]);
    return true;
  }, [currentTrack, queue, repeatMode, selectTrack, shuffle]);

  const playSong = useCallback((song: Song, visibleQueue: Song[] = [song]) => {
    if (!isLocalPlayable(song)) { setErrorMessage("This song has no playable local audio file."); setStatus("error"); return; }
    const localQueue = visibleQueue.filter(isLocalPlayable);
    setQueue(localQueue.length ? localQueue : [song]); selectTrack(song);
  }, [isLocalPlayable, selectTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (playing) { audio.pause(); return; }
    setStatus("loading"); setPlaying(true); audio.play().catch(() => { setPlaying(false); setStatus("error"); setErrorMessage("Local audio could not start. Check that the file still exists and your browser supports its format."); });
  }, [currentTrack, playing]);

  const handleAudioError = useCallback(() => {
    setPlaying(false); setStatus("error");
    const track = currentTrack;
    if (track) {
      void fetch(`/api/audio/local/${track.id}`, { credentials: "same-origin" })
        .then(async (response) => {
          if (response.ok) return setErrorMessage("This file format is not supported by this browser.");
          const body = await response.json().catch(() => null) as { detail?: string } | null;
          setErrorMessage(readablePlaybackError(response.status, body?.detail));
        })
        .catch(() => setErrorMessage("The audio service is unavailable. Check that the local backend is running."));
    } else {
      setErrorMessage("Local audio could not be played.");
    }
    window.setTimeout(() => move(1), 250);
  }, [currentTrack, move]);

  const value = useMemo<PlayerContextValue>(() => ({
    currentTrack, queue, recentlyPlayed, playing, status, errorMessage, currentTime, duration, volume, repeatMode, shuffle,
    playSong, togglePlay, next: () => move(1), previous: () => move(-1), seek: (seconds) => { if (audioRef.current) audioRef.current.currentTime = seconds; },
    setVolume: setVolumeState, removeFromQueue: (songId) => setQueue((current) => current.filter((song) => song.id !== songId)), clearQueue: () => setQueue([]),
    playFromQueue: (song) => selectTrack(song), cycleRepeat: () => setRepeatMode((mode) => mode === "off" ? "all" : mode === "all" ? "one" : "off"), toggleShuffle: () => setShuffle((value) => !value), isLocalPlayable,
  }), [currentTime, currentTrack, duration, errorMessage, isLocalPlayable, move, playSong, playing, queue, recentlyPlayed, repeatMode, selectTrack, shuffle, status, togglePlay, volume]);

  return <PlayerContext.Provider value={value}>{children}<audio ref={audioRef} src={currentTrack ? `/api/audio/local/${currentTrack.id}?attempt=${playbackAttempt}` : undefined} preload="metadata" onLoadStart={() => setStatus("loading")} onCanPlay={() => setStatus(playing ? "playing" : "paused")} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)} onPlay={() => { setPlaying(true); setStatus("playing"); }} onPause={() => { setPlaying(false); setStatus("paused"); }} onEnded={() => { if (!move(1, true)) { setPlaying(false); setStatus("paused"); } }} onError={handleAudioError} /></PlayerContext.Provider>;
}

export function usePlayer() { const context = useContext(PlayerContext); if (!context) throw new Error("usePlayer must be used inside PlayerProvider"); return context; }
