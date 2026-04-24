import type { DriverSegment } from '@/lib/kpi/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  drivers: DriverSegment[];
  unit?: string;
}

function fmtContrib(v: number, unit?: string): string {
  const s = v >= 0 ? '+' : '';
  if (unit === 'percent') return `${s}${v.toFixed(1)} pp`;
  if (unit === 'count') return `${s}${Math.round(v)}`;
  return `${s}${v.toFixed(1)}`;
}

export function DriverPanel({ drivers, unit }: Props) {
  if (drivers.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Hlavní přispěvatelé</p>
      {drivers.slice(0, 4).map((d, i) => {
        const Icon = d.trend === 'up' ? TrendingUp : d.trend === 'down' ? TrendingDown : Minus;
        const color = d.contribution > 0 ? 'text-rose-500' : d.contribution < 0 ? 'text-emerald-500' : 'text-zinc-400';
        return (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-zinc-400 tabular-nums w-3">{i + 1}.</span>
              <span className="truncate text-xs text-zinc-700">{d.label}</span>
            </div>
            <div className={cn('flex items-center gap-1 text-xs font-medium shrink-0', color)}>
              <Icon size={11} strokeWidth={2.5} />
              {fmtContrib(d.contribution, unit)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
