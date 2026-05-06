import Link from 'next/link';
import { AlertTriangle, ArrowRight, ArrowUpRight, MinusCircle, TrendingDown, TrendingUp } from 'lucide-react';
import type { ExecutiveAlert, ExecutiveChangeGroup } from '@/lib/analytics/executive-dashboard';
import type { KpiEvaluation } from '@/lib/analytics/types';
import { EmptyState } from '@/components/layout/empty-state';
import { StatusBadge } from '@/components/kpi/status-badge';
import { Sparkline } from '@/components/kpi/sparkline';
import { cn } from '@/lib/utils';

type DeltaTone = 'improvement' | 'problem' | 'watch' | null;

interface TopAlertsProps {
  alerts: readonly ExecutiveAlert[];
  evaluations?: readonly KpiEvaluation[];
  changes?: ExecutiveChangeGroup;
}

const deltaConfig: Record<Exclude<DeltaTone, null>, { label: string; classes: string; Icon: typeof TrendingUp }> = {
  improvement: {
    label: 'Zlepšení vs. minulý měsíc',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Icon: TrendingUp,
  },
  problem: {
    label: 'Nový problém',
    classes: 'border-rose-200 bg-rose-50 text-rose-700',
    Icon: TrendingDown,
  },
  watch: {
    label: 'Ke sledování',
    classes: 'border-amber-200 bg-amber-50 text-amber-700',
    Icon: MinusCircle,
  },
};

export function TopAlerts({ alerts, evaluations, changes }: TopAlertsProps) {
  const evalByCode = new Map((evaluations ?? []).map((evaluation) => [evaluation.code, evaluation]));
  const deltaByCode = buildDeltaMap(changes);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Co řešit teď</h2>
          <p className="mt-1 text-sm text-zinc-500">Nejvážnější signály, jejich trend a další krok.</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-rose-500" />
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Žádné aktivní alerty"
          description="Aktuální snapshot nemá červené ani amber priority."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alerts.slice(0, 3).map((alert) => {
            const evaluation = evalByCode.get(alert.code);
            const delta = deltaByCode.get(alert.code) ?? null;
            const trend = evaluation?.trend.mom ?? alert.delta;
            return (
              <article
                key={alert.code}
                className={cn(
                  'flex flex-col rounded-lg border bg-white p-4 shadow-sm transition hover:border-aures-blue-200 hover:shadow-md',
                  alert.rank === 1
                    ? 'border-2 border-rose-300 shadow-rose-100/60'
                    : 'border-zinc-200',
                )}
              >
                <header className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-base font-semibold text-white shadow',
                        alert.status === 'red' ? 'bg-rose-600' : 'bg-amber-500',
                      )}
                    >
                      {alert.rank}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-950">{alert.title}</p>
                      <p className="text-xs text-zinc-500">vlastník: {alert.owner}</p>
                    </div>
                  </div>
                  <StatusBadge status={alert.status} />
                </header>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="font-mono text-3xl font-semibold tracking-tight text-zinc-950">{alert.value}</p>
                  <p
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      Math.abs(trend) < 0.01
                        ? 'text-zinc-500'
                        : isImprovingDirection(evaluation, trend)
                          ? 'text-emerald-600'
                          : 'text-rose-600',
                    )}
                  >
                    <ArrowUpRight className={cn('h-3.5 w-3.5', trend < 0 && 'rotate-90')} />
                    {Math.abs(trend) < 0.01
                      ? 'beze změny'
                      : `${trend > 0 ? '+' : ''}${formatNumber(trend)}${unitOf(evaluation)} m/m`}
                  </p>
                </div>

                {evaluation ? (
                  <div className="mt-4">
                    <Sparkline
                      points={evaluation.sparkline}
                      target={evaluation.definition.thresholds.target ?? undefined}
                      unitSuffix={unitOf(evaluation)}
                    />
                  </div>
                ) : null}

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">{alert.reasonCs}</p>

                {alert.peoplePreview.length > 0 ? (
                  <div className="mt-3 rounded-md border border-zinc-100 bg-zinc-50/70 p-2.5 text-xs leading-5 text-zinc-700">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      Konkrétně
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {alert.peoplePreview.map((person, idx) => (
                        <li key={`${person.name}-${idx}`}>
                          <span className="font-medium text-zinc-900">{person.name}</span>
                          <span className="text-zinc-500"> — {person.role}, {person.division}</span>
                        </li>
                      ))}
                    </ul>
                    {alert.peopleTotalCount > alert.peoplePreview.length ? (
                      <p className="mt-1 text-[11px] text-zinc-500">
                        +{alert.peopleTotalCount - alert.peoplePreview.length} dalších v detailu
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <footer className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                  {delta ? <DeltaChip tone={delta} /> : <span className="text-[11px] text-zinc-400">stav drží trend</span>}
                  <Link
                    href={alert.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-aures-blue-700 hover:text-aures-blue-900"
                  >
                    Zobrazit detail <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function buildDeltaMap(changes?: ExecutiveChangeGroup): Map<string, Exclude<DeltaTone, null>> {
  const map = new Map<string, Exclude<DeltaTone, null>>();
  if (!changes) return map;
  for (const item of changes.improvements) map.set(item.code, 'improvement');
  for (const item of changes.problems) map.set(item.code, 'problem');
  for (const item of changes.watch) map.set(item.code, 'watch');
  return map;
}

function isImprovingDirection(evaluation: KpiEvaluation | undefined, trend: number): boolean {
  if (!evaluation) return trend > 0;
  if (Math.abs(trend) < 0.01) return false;
  if (evaluation.definition.direction === 'down') return trend < 0;
  if (evaluation.definition.direction === 'up') return trend > 0;
  return false;
}

function unitOf(evaluation: KpiEvaluation | undefined): string {
  if (!evaluation) return '';
  switch (evaluation.definition.unit) {
    case 'pct':
      return ' %';
    case 'days':
      return ' dnů';
    case 'CZK':
      return ' Kč';
    case 'months':
      return ' měs.';
    default:
      return '';
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(Math.abs(value));
}

function DeltaChip({ tone }: { tone: Exclude<DeltaTone, null> }) {
  const config = deltaConfig[tone];
  const { Icon } = config;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        config.classes,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
