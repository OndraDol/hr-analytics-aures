import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BriefingCover } from '@/components/briefing/briefing-cover';
import { PreviewToggle } from '@/components/briefing/preview-toggle';
import { PrintButton } from '@/components/briefing/print-button';
import { StatusBadge } from '@/components/kpi/status-badge';
import type { ExecutiveAlert } from '@/lib/analytics/executive-dashboard';
import type { ExecutiveBriefingData } from '@/lib/briefing/executive-briefing';
import { cn } from '@/lib/utils';

const changeGroups = [
  { key: 'improvements', title: 'Zlepšení', tone: 'emerald' },
  { key: 'problems', title: 'Nové problémy', tone: 'rose' },
  { key: 'watch', title: 'Ke sledování', tone: 'amber' },
] as const;

const toneClass = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rose: 'border-rose-200 bg-rose-50 text-rose-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
};

export function ExecutiveBriefingPage({ data }: { data: ExecutiveBriefingData }) {
  const { dashboard, projectProgress, statusCounts } = data;

  return (
    <main className="briefing-print-root px-5 py-6 md:px-8">
      <div className="briefing-page mx-auto max-w-6xl">
        <div className="print-hidden mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Executive briefing</p>
            <h1 className="text-2xl font-semibold tracking-normal text-zinc-950">PDF podklad pro HR Directorku</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <PreviewToggle />
            <PrintButton />
          </div>
        </div>

        <BriefingCover data={data} />

        <section className="briefing-section mt-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                AURES Holdings · HR Analytics
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-normal text-zinc-950 md:text-5xl">
                Executive briefing Q1 2026
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                Souhrn stavu organizace, prioritních rizik a navazujících rozhodnutí pro prezentační demo.
              </p>
            </div>
            <div className="grid min-w-[220px] gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-blue-700 p-2 text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{dashboard.healthLabel}</p>
                  <p className="text-xs text-zinc-500">{data.generatedLabelCs}</p>
                </div>
              </div>
              <div>
                <p className="font-mono text-5xl font-semibold text-zinc-950">{dashboard.healthScore}</p>
                <p className="text-sm text-zinc-500">HR Health Score ze 100</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <BriefingMetric label="Dokončení prototypu" value={`${projectProgress.percent} %`} detail={projectProgress.labelCs} />
            <BriefingMetric label="Zelené KPI" value={statusCounts.green.toString()} detail="metrik v toleranci" tone="emerald" />
            <BriefingMetric label="Ke sledování" value={statusCounts.amber.toString()} detail="amber watchlist" tone="amber" />
            <BriefingMetric label="Rizika" value={statusCounts.red.toString()} detail="červené priority" tone="rose" />
          </div>
        </section>

        <section className="briefing-grid mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="briefing-section rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">Top alerts</h2>
                <p className="mt-1 text-sm text-zinc-500">Seřazeno podle priority a dopadu.</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <div className="mt-4 space-y-3">
              {dashboard.topAlerts.map((alert) => (
                <BriefingAlert key={alert.code} alert={alert} />
              ))}
            </div>
          </div>

          <div className="briefing-section rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Executive summary</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{dashboard.aiSummaryCs}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {dashboard.heroKpis.map((evaluation) => (
                <div key={evaluation.code} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {evaluation.definition.nameCs}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-zinc-950">{evaluation.formattedValue}</p>
                  <StatusBadge status={evaluation.status} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="briefing-section mt-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Co se změnilo tento měsíc</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {changeGroups.map((group) => {
              const items = dashboard.changes[group.key];
              return (
                <div key={group.key} className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                  <p className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', toneClass[group.tone])}>
                    {group.title}
                  </p>
                  <div className="mt-3 space-y-3">
                    {items.length > 0 ? (
                      items.map((item) => <BriefingChange key={`${group.key}-${item.code}`} item={item} />)
                    ) : (
                      <BriefingChange
                        item={{
                          code: 'HR_STATS',
                          rank: 0,
                          title: 'Bez výrazné změny',
                          value: '',
                          status: 'green',
                          priority: 3,
                          delta: 0,
                          severityScore: 0,
                          thresholdDistanceCs: 'bez odchylky',
                          thresholdConfidenceCs: 'medium',
                          owner: 'HR reporting',
                          ageDays: 0,
                          href: '/',
                          reasonCs: 'V aktuálním období není významný nový signál.',
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="briefing-section mt-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Sekce I-VIII</h2>
              <p className="mt-1 text-sm text-zinc-500">Stav hlavních oblastí reportingu.</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="briefing-scorecards grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.sectionScorecards.map(({ section, evaluation }) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
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
                  <p className="mt-2 text-xs text-zinc-500">{evaluation.definition.nameCs}</p>
                </div>
              );
            })}
          </div>
        </section>

        <p className="mt-5 text-xs text-zinc-500">
          Demo prototyp - mock data. Produkční Power BI implementace bude řešit reálné napojení zdrojů, governance a RLS.
        </p>
      </div>
    </main>
  );
}

function BriefingMetric({
  label,
  value,
  detail,
  tone = 'blue',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'blue' | 'emerald' | 'amber' | 'rose';
}) {
  const classes = {
    blue: 'text-blue-700 bg-blue-50',
    emerald: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    rose: 'text-rose-700 bg-rose-50',
  }[tone];

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={cn('mt-2 inline-flex rounded-md px-2 py-1 font-mono text-2xl font-semibold', classes)}>
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-600">{detail}</p>
    </div>
  );
}

function BriefingAlert({ alert }: { alert: ExecutiveAlert }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-600 font-mono text-sm font-semibold text-white">
            {alert.rank}
          </div>
          <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-950">{alert.title}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-600">{alert.reasonCs}</p>
          <p className="mt-1 text-xs font-medium text-zinc-500">Owner: {alert.owner} · stáří {alert.ageDays} dnů</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <StatusBadge status={alert.status} />
          <p className="mt-2 font-mono text-sm font-semibold text-zinc-950">{alert.value}</p>
        </div>
      </div>
    </div>
  );
}

function BriefingChange({ item }: { item: ExecutiveAlert }) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-950">{item.title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{item.reasonCs}</p>
    </div>
  );
}
