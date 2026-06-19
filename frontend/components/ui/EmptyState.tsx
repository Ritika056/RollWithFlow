type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/6 p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/62">{description}</p>
    </div>
  );
}
