import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  delta: number | null;
  unit?: string;
  goodDirection?: 'up' | 'down';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function fmtDelta(v: number, unit?: string): string {
  const prefix = v >= 0 ? '+' : '';
  if (unit === 'percent' || unit === 'ratio') return `${prefix}${v.toFixed(1)} pp`;
  if (unit === 'czk') return `${prefix}${Math.round(v).toLocaleString('cs-CZ')} Kč`;
  if (unit === 'days') return `${prefix}${v.toFixed(1)} dní`;
  return `${prefix}${v.toFixed(1)}`;
}

export function TrendArrow({ delta, unit, goodDirection = 'down', size = 'md', className }: Props) {
  if (delta === null) return null;

  const isPositive = delta > 0.05;
  const isNegative = delta < -0.05;
  const isGood = (goodDirection === 'up' && isPositive) || (goodDirection === 'down' && isNegative);
  const isBad  = (goodDirection === 'up' && isNegative) || (goodDirection === 'down' && isPositive);

  const color = isGood ? 'text-emerald-600' : isBad ? 'text-rose-600' : 'text-zinc-500';
  const Icon  = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  return (
    <span className={cn('inline-flex items-center gap-1', color, size === 'sm' ? 'text-xs' : 'text-sm', className)}>
      <Icon size={iconSize} strokeWidth={2} />
      {fmtDelta(delta, unit)}
    </span>
  );
}
