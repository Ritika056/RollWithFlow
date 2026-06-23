"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, LogOut, Search, UserRound } from "lucide-react";

import { getCurrentUser, logout } from "@/lib/api";
import type { AuthUser } from "@/types/api";

export function TopHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getCurrentUser().then((result) => setUser(result.data));
  }, []);

  async function signOut() {
    await logout();
    document.cookie = "rwf_token=; Path=/; Max-Age=0; SameSite=Lax";
    router.replace("/login");
    router.refresh();
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/library?search=${encodeURIComponent(value)}` : "/library");
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-5 border-b border-white/8 bg-deck-950/64 px-6 backdrop-blur-2xl">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-signal">RWF / COMMAND</p>
        <h1 className="text-xl font-semibold text-white">RollWithFlow Command Center</h1>
      </div>
      <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 justify-center xl:flex">
        <div className="flex h-11 w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 text-sm text-white/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <Search size={17} className="text-signal/80" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your library..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45" aria-label="Search library" />
          <span className="ml-auto inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/8 px-2 py-1 text-[11px] text-white/48">
            <Command size={12} /> K
          </span>
        </div>
      </form>
      <div className="hidden items-center gap-3 text-xs text-white/62 md:flex">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-2">
          <UserRound size={14} aria-hidden="true" />
          {user?.display_name ?? "Private user"}
        </span>
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-2 transition hover:border-cue/35 hover:bg-cue/10 hover:text-cue" aria-label="Log out">
          <LogOut size={14} aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
