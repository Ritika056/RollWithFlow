import clsx from "clsx";

const tones = {
  signal: "border-signal/25 bg-signal/10 text-signal shadow-[0_0_22px_rgba(88,240,209,0.08)]",
  cue: "border-cue/25 bg-cue/10 text-cue shadow-[0_0_22px_rgba(240,106,166,0.08)]",
  amber: "border-amberline/25 bg-amberline/10 text-amberline",
  neutral: "border-white/10 bg-white/7 text-white/72",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur", tones[tone])}>
      {children}
    </span>
  );
}
