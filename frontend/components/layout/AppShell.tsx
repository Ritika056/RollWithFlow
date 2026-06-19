import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { MiniPlayer } from "@/components/player/MiniPlayer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:44px_44px] opacity-45" />
      <div className="aurora-orb pointer-events-none fixed left-72 top-20 hidden h-64 w-64 bg-violet/20 md:block" />
      <div className="aurora-orb pointer-events-none fixed bottom-20 right-24 hidden h-72 w-72 bg-signal/14 md:block [animation-delay:3s]" />
      <div className="aurora-orb pointer-events-none fixed right-1/3 top-1/2 hidden h-56 w-56 bg-cue/12 xl:block [animation-delay:6s]" />
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="flex-1 pb-28 p-5 md:p-8 md:pb-28 xl:p-10 xl:pb-28">
          {children}
        </main>
        <footer className="border-t border-white/8 bg-deck-950/45 px-6 py-3 text-xs text-white/45 backdrop-blur-xl">
          RollWithFlow private DJ operating system. Library, prep, collections, and discovery foundation are online.
        </footer>
        <MiniPlayer />
      </div>
    </div>
  );
}
