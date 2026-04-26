import { AlertTriangle, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { KpiCardModel } from '@/lib/analytics/kpi-engine';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';
import { StatusBadge } from './status-badge';
import { ThresholdBar } from './threshold-bar';
import { KpiSeverityBadge } from './kpi-severity-badge';
import { AnomalyFlag } from './anomaly-flag';
import { DriverChipRow } from './driver-chip-row';

const STATUS_ICON = {
  green: CheckCircle2,
  amber: AlertTriangle,
  red: AlertTriangle,
};

function trendIsGood(model: KpiCardModel, trend: number): boolean {
  if (model.evaluation.definition.direction === 'down') return trend < 0;
  if (model.evaluation.definition.direction === 'up') return trend > 0;
  return Math.abs(model.evaluation.deltaVsTarget ?? 0) < Math.abs((model.evaluation.deltaVsTarget ?? 0) - trend);
}

export function KpiCardHeadlineZone({ model }: { model: KpiCardModel }) {
  const Icon = STATUS_ICON[model.evaluation.status];
  const trend = model.evaluation.trend.mom ?? 0;
  const goodTrend = trendIsGood(model, trend);

  return (
    <div data-zone="headline">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                'h-4 w-4',
                model.evaluation.status === 'red'
                  ? 'text-rose-500'
                  : model.evaluation.status === 'amber'
                    ? 'text-amber-500'
                    : 'text-emerald-500',
              )}
            />
            <h2 className="text-sm font-semibold text-zinc-950">{model.evaluation.definition.nameCs}</h2>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <KpiSeverityBadge
              score={model.evaluation.severityScore}
              breakdown={model.severityBreakdown}
            />
            <AnomalyFlag anomaly={model.anomaly} />
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              {model.evaluation.definition.frequency}
            </span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              {model.evaluation.dataQuality}
            </span>
          </div>
        </div>
        <StatusBadge status={model.evaluation.status} />
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-4xl font-semibold tracking-normal text-zinc-950">
            {model.evaluation.formattedValue}
          </p>
          <p
            className={cn(
              'mt-1 flex items-center gap-1 text-sm',
              Math.abs(trend) < 0.01 ? 'text-zinc-500' : goodTrend ? 'text-emerald-600' : 'text-rose-600',
            )}
          >
            <ArrowUpRight className={cn('h-4 w-4', trend < 0 && 'rotate-90')} />
            {Math.abs(trend).toFixed(1)} proti minulému období
          </p>
        </div>
        <div className="w-36 shrink-0">
          <Sparkline points={model.evaluation.sparkline} />
        </div>
      </div>
    </div>
  );
}

export function KpiCardInsightZone({ model }: { model: KpiCardModel }) {
  return (
    <div data-zone="insight" className="mt-5 border-t border-zinc-100 pt-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Insight</p>
      <p className="mt-2 text-sm leading-6 text-zinc-700">{model.narrativeCs}</p>
      {model.driverGroups.length > 0 ? (
        <DriverChipRow groups={model.driverGroups} />
      ) : model.drivers.length > 0 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {model.drivers.slice(0, 3).map((driver) => (
            <span
              key={driver.id}
              className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800"
            >
              {driver.label} · {driver.delta >= 0 ? '+' : ''}
              {driver.delta.toFixed(1)}
            </span>
          ))}
        </div>
      ) : null}
      <ThresholdBar evaluation={model.evaluation} />
    </div>
  );
}

export function KpiCardDecisionZone({ model }: { model: KpiCardModel }) {
  return (
    <div data-zone="decision" className="mt-5 grid gap-3 border-t border-zinc-100 pt-5">
      <div className="rounded-md border border-zinc-200 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/60 to-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Doporučená akce</p>
          <p className="text-xs font-medium text-zinc-500">{model.evaluation.definition.owner}</p>
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-800">{model.action.bodyCs}</p>
      </div>
      {model.aiInsight ? (
        <div className="rounded-md border border-violet-200 bg-violet-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI insight
          </p>
          <p className="mt-1 font-serif text-sm italic leading-6 text-violet-950">{model.aiInsight.textCs}</p>
        </div>
      ) : null}
    </div>
  );
}
