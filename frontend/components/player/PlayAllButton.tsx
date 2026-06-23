"use client";

import { Play } from "lucide-react";

import { usePlayer } from "@/components/player/PlayerProvider";
import { ActionButton } from "@/components/ui/ActionButton";
import type { Song } from "@/types/api";

export function PlayAllButton({ songs, onResult }: { songs: Song[]; onResult?: (message: string) => void }) {
  const { isLocalPlayable, playSong } = usePlayer();
  function playAll() {
    const playable = songs.filter(isLocalPlayable);
    if (!playable.length) return onResult?.("No playable local tracks in this view.");
    playSong(playable[0], playable);
    onResult?.(`${playable.length} playable track${playable.length === 1 ? "" : "s"} queued`);
  }
  return <ActionButton variant="primary" onClick={playAll}><Play size={16} /> Play All</ActionButton>;
}
