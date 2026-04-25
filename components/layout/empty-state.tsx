import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
      <Icon className="mx-auto h-5 w-5 text-zinc-400" />
      <p className="mt-2 text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
