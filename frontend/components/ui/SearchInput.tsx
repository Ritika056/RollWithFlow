"use client";

import { Search } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Search" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus-within:border-signal/30 focus-within:bg-white/10">
      <Search size={17} className="text-white/42" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/36"
      />
    </label>
  );
}
