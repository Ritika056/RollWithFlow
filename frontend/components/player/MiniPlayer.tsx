"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";

export function MiniPlayer() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 lg:left-[19rem] lg:right-5">
      <div className="glass music-sheen flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:px-4">
        <div className="hidden size-10 shrink-0 rounded-xl bg-[radial-gradient(circle_at_70%_20%,rgba(240,106,166,0.82),transparent_25%),linear-gradient(135deg,#17123a,#082839)] sm:block" />
        <div className="min-w-0 w-40 shrink-0 md:w-56"><p className="truncate text-sm font-semibold text-white">No track selected</p><p className="truncate text-xs text-white/48">Playback shell</p></div>
        <div className="hidden min-w-0 flex-1 md:block"><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[18%] rounded-full bg-[linear-gradient(90deg,#58f0d1,#9b7cff,#f06aa6)]" /></div></div>
        <div className="ml-auto flex items-center gap-1"><button className="grid size-8 place-items-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white" aria-label="Previous track"><SkipBack size={16} /></button><button onClick={() => setPlaying((value) => !value)} className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#58f0d1,#9b7cff)] text-deck-950 shadow-[0_0_20px_rgba(88,240,209,0.16)]" aria-label={playing ? "Pause visual playback" : "Play visual playback"}>{playing ? <Pause size={17} /> : <Play size={17} />}</button><button className="grid size-8 place-items-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white" aria-label="Next track"><SkipForward size={16} /></button></div>
        <Badge tone="neutral">local</Badge>
      </div>
    </div>
  );
}
