import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SectionScorecard } from '@/lib/analytics/executive-dashboard';
import { Sparkline } from '@/components/kpi/sparkline';
import { StatusBadge } from '@/components/kpi/status-badge';

export function SectionScorecards({ scorecards }: { scorecards: readonly SectionScorecard[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Oblasti lidí</h2>
          <p className="mt-1 text-sm text-zinc-500">Rychlý stav hlavních HR témat.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scorecards.map(({ section, evaluation }) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.id}
              href={section.href}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-md p-2 text-white" style={{ backgroundColor: section.accent }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-950">{section.shortTitle}</p>
                    <p className="text-xs text-zinc-500">{section.eyebrow}</p>
                  </div>
                </div>
                <StatusBadge status={evaluation.status} />
              </div>
              <p className="mt-4 font-mono text-2xl font-semibold text-zinc-950">{evaluation.formattedValue}</p>
              <div className="mt-3 h-12">
                <Sparkline points={evaluation.sparkline} />
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                Otevřít <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
