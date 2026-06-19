import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-signal">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
