import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

const variants = {
  primary: "bg-[linear-gradient(135deg,#58f0d1,#9b7cff)] text-deck-950 shadow-[0_16px_42px_rgba(88,240,209,0.16)] hover:brightness-110",
  secondary: "border border-white/12 bg-white/9 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20 hover:bg-white/14",
  danger: "border border-cue/28 bg-cue/10 text-cue hover:border-cue/45 hover:bg-cue/16",
  ghost: "text-white/68 hover:bg-white/9 hover:text-white",
};

export function ActionButton({
  children,
  className,
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: keyof typeof variants }) {
  return (
    <button
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
