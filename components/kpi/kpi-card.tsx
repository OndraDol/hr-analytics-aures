import type { KPISnapshot } from '@/lib/kpi/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { TrendArrow } from '@/components/ui/trend-arrow';
import { Sparkline } from '@/components/ui/sparkline';
import { DriverPanel } from './driver-panel';
import { getKPIHistory } from '@/lib/kpi-data';
import { Zap, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  snapshot: KPISnapshot;
  className?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}

function fmtValue(value: number, unit: string): string {
  if (unit === 'percent') return `${value.toFixed(1)} %`;
  if (unit === 'ratio')   return `${(value * 100).toFixed(1)} %`;
  if (unit === 'days')    return `${value.toFixed(1)} dní`;
  if (unit === 'czk')     return `${Math.round(value).toLocaleString('cs-CZ')} Kč`;
  if (unit === 'score')   return value.toFixed(1);
  if (unit === 'count')   return Math.round(value).toLocaleString('cs-CZ');
  return String(value);
}

const STATUS_LEFT_BORDER: Record<string, string> = {
  green:      'border-l-emerald-400',
  acceptable: 'border-l-amber-400',
  red:        'border-l-rose-500',
  no_data:    'border-l-zinc-300',
};

export async function KPICard({ snapshot, className, compact = false, style }: Props) {
  const { kpiValue, narrative, anomaly, action, aiInsight } = snapshot;
  const { value, momDelta, definition, status } = kpiValue;
  const history = await getKPIHistory(definition.id, 12);

  const goodDir = definition.direction === 'up_good' ? 'up' : 'down';

  return (
    <article
      className={cn(
        'surface border-l-4 p-5 flex flex-col gap-4 transition-shadow hover:shadow-md',
        STATUS_LEFT_BORDER[status],
        className,
      )}
      style={style}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Sekce {definition.section} · {definition.owner}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-zinc-900 leading-tight">
            {definition.nameCs}
          </h3>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Main metric */}
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold tabular-nums leading-none text-zinc-900">
          {fmtValue(value, definition.unit)}
        </span>
        <div className="mb-0.5">
          <TrendArrow delta={momDelta} unit={definition.unit} goodDirection={goodDir} size="sm" />
        </div>
      </div>

      {/* Sparkline */}
      {history.length > 1 && (
        <Sparkline data={history} status={status} height={40} />
      )}

      {/* Thresholds hint */}
      {definition.target !== null && (
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span>Cíl: <strong className="text-zinc-700">{fmtValue(definition.target, definition.unit)}</strong></span>
          <span>·</span>
          <span>Zelená {definition.direction === 'down_good' ? '≤' : '≥'} {fmtValue(definition.thresholds.green, definition.unit)}</span>
        </div>
      )}

      {/* Narrative */}
      {!compact && (
        <p className="text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
          {narrative.text}
        </p>
      )}

      {/* Anomaly */}
      {anomaly && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
          <Zap size={13} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">{anomaly.description}</p>
        </div>
      )}

      {/* Drivers */}
      {!compact && narrative.topDrivers.length > 0 && (
        <DriverPanel drivers={narrative.topDrivers} unit={definition.unit} />
      )}

      {/* AI Insight */}
      {!compact && aiInsight && (
        <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
          <Lightbulb size={13} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mb-1">AI Insight</p>
            <p className="text-xs text-blue-800 leading-relaxed">{aiInsight.text}</p>
          </div>
        </div>
      )}

      {/* Action */}
      {!compact && action.priority !== 'monitor' && (
        <div className={cn(
          'flex items-start gap-2 rounded-md px-3 py-2',
          action.priority === 'immediate'
            ? 'bg-rose-50 border border-rose-200'
            : 'bg-zinc-50 border border-zinc-200',
        )}>
          <AlertTriangle
            size={13}
            className={cn('mt-0.5 shrink-0', action.priority === 'immediate' ? 'text-rose-500' : 'text-zinc-400')}
          />
          <div>
            <p className={cn(
              'text-[10px] font-semibold uppercase tracking-wider mb-1',
              action.priority === 'immediate' ? 'text-rose-500' : 'text-zinc-400',
            )}>
              {action.priority === 'immediate' ? 'Okamžitá akce' : 'Doporučení'}
            </p>
            <p className="text-xs text-zinc-700 leading-relaxed">{action.action}</p>
          </div>
        </div>
      )}
    </article>
  );
}
