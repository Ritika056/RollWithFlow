type StatCardProps = {
  label: string;
  value: number;
  icon?: React.ReactNode;
  detail?: string;
  tone?: "signal" | "cue" | "amber" | "neutral";
  compact?: boolean;
};

const toneClasses = {
  signal: "border-signal/35 text-signal",
  cue: "border-cue/35 text-cue",
  amber: "border-amberline/35 text-amberline",
  neutral: "border-violet/30 text-violet",
};

export function StatCard({ label, value, icon, detail, tone = "neutral", compact = false }: StatCardProps) {
  return (
    <div className={`glass glow-card music-sheen group min-w-0 transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:shadow-glow ${compact ? "rounded-2xl p-3.5" : "rounded-3xl p-5"}`}>
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className={`grid ${compact ? "size-9 rounded-xl" : "size-11 rounded-2xl"} place-items-center border ${toneClasses[tone]} bg-white/7 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
            {icon}
          </div>
          <div className={`mt-2 h-1 w-12 rounded-full border-t ${toneClasses[tone]}`} />
        </div>
        <p className={`${compact ? "mt-3 truncate text-xs" : "mt-5 text-sm"} font-medium text-white/60`}>{label}</p>
        <p className={`${compact ? "mt-1 text-2xl" : "mt-2 text-3xl md:text-4xl"} font-semibold tracking-normal text-white`}>{value.toLocaleString()}</p>
        {detail ? <p className={`${compact ? "mt-1 text-[10px]" : "mt-2 text-xs"} truncate uppercase tracking-[0.12em] text-white/38`}>{detail}</p> : null}
      </div>
    </div>
  );
}
