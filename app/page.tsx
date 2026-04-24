import { Suspense } from 'react';
import { getExecutiveSummary, getAllSnapshots } from '@/lib/kpi-data';
import { HealthScoreRing } from '@/components/kpi/health-score-ring';
import { SectionScorecard } from '@/components/kpi/section-scorecard';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/layout/header';
import { KPICardSkeleton } from '@/components/ui/skeleton';
import type { KPISection } from '@/lib/kpi/types';
import type { Country } from '@/lib/types';
import { Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';

const SECTIONS: KPISection[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const params = await searchParams;
  const country = (params.country as Country | 'ALL') ?? 'ALL';

  const [summary, snapshots] = await Promise.all([
    getExecutiveSummary(country),
    getAllSnapshots(country),
  ]);

  const bySection = SECTIONS.reduce(
    (acc, s) => {
      acc[s] = snapshots.filter((snap) => snap.kpiValue.definition.section === s);
      return acc;
    },
    {} as Record<KPISection, typeof snapshots>,
  );

  return (
    <div className="space-y-8 animate-fade-up max-w-[1400px]">
      <PageHeader
        title="HR Dashboard"
        subtitle={`Přehled klíčových metrik · ${summary.period}`}
      />

      {/* Hero row: Health Score + Top Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Ring */}
        <div className="surface p-6 flex flex-col items-center justify-center gap-4">
          <HealthScoreRing score={summary.healthScore} size={140} />
          <div className="text-center space-y-1">
            <p className="text-[11px] text-zinc-500">
              <span className="text-rose-500 font-medium">{summary.redCount} kritické</span>
              {' · '}
              <span className="text-amber-500 font-medium">{summary.acceptableCount} k sledování</span>
              {' · '}
              <span className="text-emerald-600 font-medium">{summary.greenCount} v pořádku</span>
            </p>
            <p className="text-[10px] text-zinc-400">{snapshots.length} metrik celkem</p>
          </div>
        </div>

        {/* Top Alerts */}
        <div className="surface p-5 flex flex-col gap-3 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
            Upozornění ({summary.alertCount})
          </p>
          {summary.topAlerts.length === 0 ? (
            <p className="text-sm text-zinc-500 flex-1 flex items-center">
              Žádná upozornění — všechny metriky v pořádku.
            </p>
          ) : (
            <div className="space-y-2 overflow-hidden">
              {summary.topAlerts.slice(0, 5).map((snap) => (
                <div
                  key={snap.kpiValue.kpiId}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 bg-zinc-50 border border-zinc-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-800 truncate">
                      {snap.kpiValue.definition.nameCs}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {snap.narrative.text.slice(0, 100)}
                      {snap.narrative.text.length > 100 ? '…' : ''}
                    </p>
                  </div>
                  <StatusBadge status={snap.kpiValue.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Changes this month */}
      {(summary.changesThisMonth.worsened.length > 0 ||
        summary.changesThisMonth.improved.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.changesThisMonth.worsened.length > 0 && (
            <div className="surface p-5 space-y-3">
              <div className="flex items-center gap-1.5">
                <TrendingDown size={14} className="text-rose-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                  Zhoršilo se ({summary.changesThisMonth.worsened.length})
                </p>
              </div>
              {summary.changesThisMonth.worsened.slice(0, 5).map((snap) => (
                <div
                  key={snap.kpiValue.kpiId}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-zinc-700 truncate">
                    {snap.kpiValue.definition.nameCs}
                  </span>
                  <StatusBadge status={snap.kpiValue.status} size="sm" />
                </div>
              ))}
            </div>
          )}
          {summary.changesThisMonth.improved.length > 0 && (
            <div className="surface p-5 space-y-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-600" />
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Zlepšilo se ({summary.changesThisMonth.improved.length})
                </p>
              </div>
              {summary.changesThisMonth.improved.slice(0, 5).map((snap) => (
                <div
                  key={snap.kpiValue.kpiId}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-zinc-700 truncate">
                    {snap.kpiValue.definition.nameCs}
                  </span>
                  <StatusBadge status={snap.kpiValue.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Executive Summary */}
      {summary.aiExecutiveSummary && (
        <div className="surface p-5 border-l-4 border-l-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-blue-500 shrink-0" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
              AI Executive Summary
            </p>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed">{summary.aiExecutiveSummary}</p>
        </div>
      )}

      {/* Section grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
          Přehled sekcí
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTIONS.map((section, i) => (
            <Suspense key={section} fallback={<KPICardSkeleton />}>
              <SectionScorecard
                section={section}
                snapshots={bySection[section] ?? []}
                style={{ '--delay': `${i * 50}ms` } as React.CSSProperties}
              />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
}
