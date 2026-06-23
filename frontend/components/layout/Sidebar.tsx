"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Bot,
  CalendarDays,
  Compass,
  BarChart3,
  Folder,
  Heart,
  LayoutDashboard,
  Library,
  ListMusic,
  Music2,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: Library },
  { href: "/crates", label: "DJ Crates", icon: Boxes },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/folders", label: "Folders", icon: Folder },
  { href: "/liked-songs", label: "Liked Tracks", icon: Heart },
  { href: "/mixes", label: "Mixes", icon: Music2 },
  { href: "/discovery", label: "Discovery", icon: Compass },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-copilot", label: "AI Copilot", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group/sidebar relative flex h-screen w-[4.75rem] shrink-0 overflow-hidden border-r border-white/8 bg-deck-950/54 p-2 transition-[width] duration-300 hover:w-72 focus-within:w-72">
      <div className="flex w-full flex-col rounded-[1.5rem] border border-white/9 bg-[linear-gradient(180deg,rgba(19,18,43,0.78),rgba(7,7,17,0.58))] px-2 py-3 shadow-[0_26px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)]">
      <Link href="/dashboard" title="RollWithFlow" className="mb-7 flex items-center gap-3 overflow-hidden rounded-2xl p-2 transition hover:bg-white/5">
        <div className="relative grid size-12 place-items-center overflow-hidden rounded-2xl border border-violet/35 bg-[radial-gradient(circle_at_30%_20%,rgba(88,240,209,0.42),rgba(155,124,255,0.26)_48%,rgba(255,255,255,0.06))] text-signal shadow-[0_0_42px_rgba(155,124,255,0.26)]">
          <span className="absolute bottom-2 h-1 w-7 rounded-full equalizer-bars opacity-80" />
          <Music2 size={20} aria-hidden="true" />
        </div>
        <div className="whitespace-nowrap opacity-0 transition duration-200 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">
          <p className="text-base font-bold tracking-normal text-white">RollWith<span className="text-signal">Flow</span></p>
          <p className="text-xs tracking-[0.12em] text-white/48">RWF AI MUSIC OS</p>
        </div>
      </Link>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={clsx(
                "group flex h-11 items-center justify-center gap-3 rounded-2xl px-3 text-sm font-medium transition duration-200 group-hover/sidebar:justify-start group-focus-within/sidebar:justify-start",
                active
                  ? "neon-ring bg-[linear-gradient(135deg,rgba(88,240,209,0.96),rgba(155,124,255,0.9))] text-deck-950 shadow-[0_14px_44px_rgba(88,240,209,0.2)]"
                  : "text-white/66 hover:translate-x-1 hover:bg-white/9 hover:text-white",
              )}
            >
              <Icon size={18} aria-hidden="true" className={clsx(!active && "transition group-hover:text-signal")} />
              <span className="whitespace-nowrap opacity-0 transition duration-200 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/6 p-4 text-xs leading-5 text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group-hover/sidebar:block group-focus-within/sidebar:block">
        <p className="font-semibold text-white">Workspace online</p>
        <p>Library, prep, discovery</p>
        <p className="mt-1 text-signal/80">Phase 4 foundation</p>
      </div>
      </div>
    </aside>
  );
}
