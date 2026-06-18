import { Play, Heart, MoreHorizontal } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-10 pb-24">
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Good evening</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentQuickPicks.map((item) => (
            <div
              key={item.id}
              className="group flex items-center bg-white/5 hover:bg-white/20 transition-all rounded-md overflow-hidden cursor-pointer"
            >
              <img src={item.image} alt={item.title} className="w-16 h-16 object-cover shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
              <div className="flex-1 px-4 font-semibold text-sm truncate">{item.title}</div>
              <button className="w-12 h-12 flex items-center justify-center bg-[#1DB954] rounded-full text-black opacity-0 group-hover:opacity-100 transition-all mr-4 shadow-lg translate-y-1 group-hover:translate-y-0">
                <Play fill="black" size={20} className="ml-1" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Songs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">Trending Songs</h2>
          <span className="text-sm font-bold text-neutral-400 hover:text-white cursor-pointer uppercase tracking-wider">Show all</span>
        </div>
        <div className="w-full bg-[#121212] rounded-xl p-4">
          <div className="grid grid-cols-[16px_minmax(200px,1fr)_1fr_minmax(100px,1fr)_50px] gap-4 px-4 py-2 text-sm text-neutral-400 border-b border-white/10 mb-2">
            <div>#</div>
            <div>Title</div>
            <div className="hidden md:block">Album</div>
            <div className="hidden lg:block">Date added</div>
            <div className="text-right">Time</div>
          </div>
          {trendingSongs.map((song, idx) => (
            <div key={song.id} className="group grid grid-cols-[16px_minmax(200px,1fr)_1fr_minmax(100px,1fr)_50px] gap-4 px-4 py-3 items-center rounded-md hover:bg-white/10 transition-colors cursor-pointer text-sm">
              <div className="text-neutral-400 group-hover:hidden">{idx + 1}</div>
              <div className="hidden group-hover:block text-white">
                <Play fill="white" size={14} />
              </div>
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={song.image} alt={song.title} className="w-10 h-10 rounded shadow-md object-cover" />
                <div className="truncate">
                  <div className="text-white font-medium truncate">{song.title}</div>
                  <div className="text-neutral-400 truncate hover:underline">{song.artist}</div>
                </div>
              </div>
              <div className="text-neutral-400 hidden md:block truncate hover:underline">{song.album}</div>
              <div className="text-neutral-400 hidden lg:block">{song.dateAdded}</div>
              <div className="text-neutral-400 flex items-center justify-end gap-3">
                <Heart size={16} className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity" />
                <span>{song.duration}</span>
                <MoreHorizontal size={16} className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Releases & Discoveries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {newReleases.map((item) => (
              <Card key={item.id} {...item} />
            ))}
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer">Recent Discoveries</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentDiscoveries.map((item) => (
              <Card key={item.id} {...item} />
            ))}
          </div>
        </section>
      </div>

      {/* Favorite Artists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">Favorite Artists</h2>
          <span className="text-sm font-bold text-neutral-400 hover:text-white cursor-pointer uppercase tracking-wider">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favoriteArtists.map((artist) => (
            <div key={artist.id} className="bg-[#181818] hover:bg-[#282828] transition-colors p-4 rounded-xl cursor-pointer group">
              <div className="relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-full overflow-hidden">
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                <button className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center bg-[#1DB954] rounded-full text-black opacity-0 group-hover:opacity-100 transition-all shadow-xl translate-y-2 group-hover:translate-y-0 z-10">
                  <Play fill="black" size={24} className="ml-1" />
                </button>
              </div>
              <h3 className="font-bold text-white truncate">{artist.name}</h3>
              <p className="text-sm text-neutral-400 mt-1 capitalize">Artist</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ image, title, subtitle }: { image: string, title: string, subtitle: string }) {
  return (
    <div className="bg-[#181818] hover:bg-[#282828] transition-colors p-4 rounded-xl cursor-pointer group">
      <div className="relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <button className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center bg-[#1DB954] rounded-full text-black opacity-0 group-hover:opacity-100 transition-all shadow-xl translate-y-2 group-hover:translate-y-0 z-10">
          <Play fill="black" size={24} className="ml-1" />
        </button>
      </div>
      <h3 className="font-bold text-white truncate">{title}</h3>
      <p className="text-sm text-neutral-400 mt-1 truncate">{subtitle}</p>
    </div>
  );
}

const recentQuickPicks = [
  { id: 1, title: "Midnight Vibes", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80" },
  { id: 2, title: "Lofi Beats", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=150&q=80" },
  { id: 3, title: "Daily Mix 1", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=150&q=80" },
  { id: 4, title: "Release Radar", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80" },
  { id: 5, title: "Top 50 - Global", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?auto=format&fit=crop&w=150&q=80" },
  { id: 6, title: "Electronic Essentials", image: "https://images.unsplash.com/photo-1571266028243-cb40fce75736?auto=format&fit=crop&w=150&q=80" },
];

const trendingSongs = [
  { id: 1, title: "Starboy", artist: "The Weeknd, Daft Punk", album: "Starboy", dateAdded: "2 days ago", duration: "3:50", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=100&q=80" },
  { id: 2, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", dateAdded: "3 days ago", duration: "3:20", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?auto=format&fit=crop&w=100&q=80" },
  { id: 3, title: "One Dance", artist: "Drake, Wizkid, Kyla", album: "Views", dateAdded: "1 week ago", duration: "2:54", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=100&q=80" },
  { id: 4, title: "As It Was", artist: "Harry Styles", album: "Harry's House", dateAdded: "2 weeks ago", duration: "2:47", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=100&q=80" },
  { id: 5, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", dateAdded: "1 month ago", duration: "3:23", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=100&q=80" },
];

const newReleases = [
  { id: 1, title: "Endless Summer", subtitle: "Album • The Midnight", image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300&q=80" },
  { id: 2, title: "Neon Nights", subtitle: "Single • Synthwave", image: "https://images.unsplash.com/photo-1563603357963-439f52473623?auto=format&fit=crop&w=300&q=80" },
  { id: 3, title: "Deep House 2026", subtitle: "Playlist • RollWithFlow", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80" },
];

const recentDiscoveries = [
  { id: 1, title: "Underground Beats", subtitle: "Playlist • 50k likes", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?auto=format&fit=crop&w=300&q=80" },
  { id: 2, title: "Indie Pop", subtitle: "Playlist • 120k likes", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80" },
  { id: 3, title: "Jazz Grooves", subtitle: "Playlist • 80k likes", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=300&q=80" },
];

const favoriteArtists = [
  { id: 1, name: "The Weeknd", image: "https://images.unsplash.com/photo-1542241647-9cbbada2b309?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Daft Punk", image: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Arctic Monkeys", image: "https://images.unsplash.com/photo-1516280440502-65f5323a31c5?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Tame Impala", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Drake", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "Dua Lipa", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80" },
];
