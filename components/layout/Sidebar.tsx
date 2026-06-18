import Link from "next/link";
import {
  Home,
  Search,
  TrendingUp,
  ListMusic,
  Disc3,
  Heart,
  Users,
  Music2,
  Settings,
  Radio
} from "lucide-react";

export function Sidebar() {
  const navGroups = [
    {
      title: "Menu",
      items: [
        { icon: Home, label: "Dashboard", href: "/", active: true },
        { icon: Search, label: "Search", href: "/search" },
        { icon: TrendingUp, label: "Trending", href: "/trending" },
      ]
    },
    {
      title: "Library",
      items: [
        { icon: ListMusic, label: "Playlists", href: "/playlists" },
        { icon: Disc3, label: "DJ Crates", href: "/crates" },
        { icon: Heart, label: "Liked Songs", href: "/liked" },
        { icon: Users, label: "Artists", href: "/artists" },
        { icon: Music2, label: "Genres", href: "/genres" },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#121212] h-full flex-col hidden md:flex border-r border-neutral-900">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="bg-[#1DB954] p-2 rounded-full text-black">
            <Radio size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">RollWithFlow</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
              {group.title}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                    }`}
                  >
                    <Icon size={20} className={item.active ? "text-[#1DB954]" : ""} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto">
        <Link
          href="/settings"
          className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
        >
          <Settings size={20} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
