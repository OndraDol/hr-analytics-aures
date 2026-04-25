import { AlertTriangle, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { KpiCardModel } from '@/lib/analytics/kpi-engine';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';
import { StatusBadge } from './status-badge';

const STATUS_ICON = {
  green: CheckCircle2,
  amber: AlertTriangle,
  red: AlertTriangle,
};

export function KpiCard({ model, featured = false }: { model: KpiCardModel; featured?: boolean }) {
  const Icon = STATUS_ICON[model.evaluation.status];
  const trend = model.evaluation.trend.mom ?? 0;

  return (
    <article
      className={cn(
        'rounded-lg border border-zinc-200 bg-white p-5 shadow-sm',
        featured && 'border-blue-200 bg-gradient-to-b from-white to-blue-50/40',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', model.evaluation.status === 'red' ? 'text-rose-500' : model.evaluation.status === 'amber' ? 'text-amber-500' : 'text-emerald-500')} />
            <h2 className="text-sm font-semibold text-zinc-950">{model.evaluation.definition.nameCs}</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{model.evaluation.definition.frequency} · {model.evaluation.dataQuality}</p>
        </div>
        <StatusBadge status={model.evaluation.status} />
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-4xl font-semibold tracking-normal text-zinc-950">{model.evaluation.formattedValue}</p>
          <p className={cn('mt-1 flex items-center gap-1 text-sm', trend > 0 ? 'text-rose-600' : trend < 0 ? 'text-emerald-600' : 'text-zinc-500')}>
            <ArrowUpRight className={cn('h-4 w-4', trend < 0 && 'rotate-90')} />
            {Math.abs(trend).toFixed(1)} proti minulému období
          </p>
        </div>
        <div className="w-36 shrink-0">
          <Sparkline points={model.evaluation.sparkline} />
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-zinc-700">{model.narrativeCs}</p>

      <div className="mt-5 grid gap-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Doporučená akce</p>
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
    </article>
  );
}
