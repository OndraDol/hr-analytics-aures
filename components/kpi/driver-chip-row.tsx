import type { KpiDriverGroup } from '@/lib/analytics/types';

export function DriverChipRow({ groups }: { groups: readonly KpiDriverGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {groups.slice(0, 3).map((group) => (
        <div key={group.dimension} className="flex gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-600">
            {group.labelCs}
          </span>
          {group.top.map((driver) => (
            <span
              key={driver.id}
              className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800"
            >
              {driver.label} · {driver.delta >= 0 ? '+' : ''}
              {driver.delta.toFixed(1)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
