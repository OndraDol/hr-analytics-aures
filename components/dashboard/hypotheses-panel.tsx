import { ChevronDown, Lightbulb } from 'lucide-react';
import type { CrossKpiHypothesis } from '@/lib/analytics/types';

export function HypothesesPanel({ hypotheses }: { hypotheses: readonly CrossKpiHypothesis[] }) {
  if (hypotheses.length === 0) return null;

  return (
    <details className="group rounded-lg border border-violet-200 bg-violet-50/70 p-5 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 marker:hidden">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-violet-600 p-2 text-white">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-900">
              Hypotézy a souvislosti ({hypotheses.length})
            </h2>
            <p className="text-sm text-violet-800/80">Pracovní teze mezi KPI — rozbalit pro detail.</p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-violet-700 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {hypotheses.map((hypothesis) => (
          <article key={hypothesis.kpis.join('-')} className="rounded-md border border-violet-200 bg-white p-3">
            <div className="flex flex-wrap gap-1.5">
              {hypothesis.kpis.map((kpi) => (
                <span
                  key={kpi}
                  className="rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-violet-800"
                >
                  {kpi}
                </span>
              ))}
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-zinc-600">
                {hypothesis.strength === 'strong' ? 'silná' : 'pravděpodobná'}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-800">{hypothesis.messageCs}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{hypothesis.confidenceCs}</p>
          </article>
        ))}
      </div>
    </details>
  );
}
