import { Search, Bell, ChevronLeft, ChevronRight } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-10 bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex gap-2">
          <button className="p-1.5 rounded-full bg-black/60 text-neutral-400 hover:text-white transition">
            <ChevronLeft size={22} />
          </button>
          <button className="p-1.5 rounded-full bg-black/60 text-neutral-400 hover:text-white transition">
            <ChevronRight size={22} />
          </button>
        </div>
        
        <div className="relative max-w-md w-full ml-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="What do you want to listen to?"
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] text-white text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all border border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-neutral-400 hover:text-white transition rounded-full hover:bg-neutral-800">
          <Bell size={20} />
        </button>
        <button className="flex items-center gap-2 p-1 pr-2 rounded-full bg-black/60 hover:bg-neutral-800 transition border border-neutral-800 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=32&h=32&q=80"
            alt="User profile"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-white hidden md:block">Alex M.</span>
        </button>
      </div>
    </header>
  );
}
