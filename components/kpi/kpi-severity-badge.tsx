import type { SeverityBreakdown } from '@/lib/kpi/thresholds';

const BREAKDOWN_LABEL: Record<keyof SeverityBreakdown, string> = {
  statusBase: 'Status',
  priorityBoost: 'Priorita',
  qualityPenalty: 'Kvalita dat',
  trendBoost: 'Trend',
  distanceBoost: 'Vzdálenost od prahu',
};

export function KpiSeverityBadge({
  score,
  breakdown,
}: {
  score: number;
  breakdown: SeverityBreakdown;
}) {
  return (
    <div className="relative inline-flex items-center gap-1">
      <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700">
        Severita {score}/100
      </span>
      <details className="group relative">
        <summary className="grid h-5 w-5 cursor-pointer list-none place-items-center rounded-full border border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-600 group-open:bg-zinc-900 group-open:text-white">
          ?
        </summary>
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rozpad severity</p>
          <div className="mt-2 space-y-1.5">
            {(Object.entries(breakdown) as [keyof SeverityBreakdown, number][]).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-600">{BREAKDOWN_LABEL[key]}</span>
                <span className="font-mono font-semibold text-zinc-950">
                  {value > 0 ? '+' : ''}
                  {Math.round(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
