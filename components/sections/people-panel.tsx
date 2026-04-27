import type { SectionPeopleHighlight, SectionPeopleRow } from '@/lib/analytics/section-summaries';
import { cn } from '@/lib/utils';

const TONE_CLASSES: Record<NonNullable<SectionPeopleRow['tone']>, string> = {
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

export function PeoplePanel({ data }: { data: SectionPeopleHighlight }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-950">{data.title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{data.subtitle}</p>
      </div>
      <ul className="space-y-2">
        {data.rows.map((row, index) => (
          <li
            key={`${row.name}-${index}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950">{row.name}</p>
              <p className="truncate text-xs text-zinc-500">
                {row.role} · {row.division}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold',
                TONE_CLASSES[row.tone ?? 'zinc'],
              )}
            >
              {row.detail}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
