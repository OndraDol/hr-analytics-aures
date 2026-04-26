import type { ActionBacklogDue } from '@/lib/actions/action-backlog';
import { cn } from '@/lib/utils';

const DUE_POSITION: Record<ActionBacklogDue, string> = {
  'this-week': 'top-[8%] bg-rose-600 ring-rose-100',
  'two-weeks': 'top-[32%] bg-amber-500 ring-amber-100',
  'monthly-review': 'top-[64%] bg-blue-600 ring-blue-100',
  'next-cycle': 'top-[88%] bg-zinc-500 ring-zinc-100',
};

export function TimelineRail({ due, label }: { due: ActionBacklogDue; label: string }) {
  return (
    <div className="relative hidden w-6 shrink-0 md:block" role="img" aria-label={`Termín: ${label}`}>
      <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-rose-500 via-amber-400 via-blue-500 to-zinc-400" />
      <span
        className={cn(
          'absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-4',
          DUE_POSITION[due],
        )}
      />
    </div>
  );
}

export function TimelineLegend() {
  const items: { label: string; className: string }[] = [
    { label: 'tento týden', className: 'bg-rose-600' },
    { label: '14 dnů', className: 'bg-amber-500' },
    { label: 'měsíční review', className: 'bg-blue-600' },
    { label: 'další cyklus', className: 'bg-zinc-500' },
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-full', item.className)} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
