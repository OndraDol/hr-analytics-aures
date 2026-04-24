import type { KPIStatus } from '@/lib/kpi/types';
import { cn } from '@/lib/utils';

interface Props {
  status: KPIStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const CONFIG: Record<KPIStatus, { label: string; classes: string; dot: string }> = {
  green:      { label: 'Splněno',    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500' },
  acceptable: { label: 'Přijatelné', classes: 'bg-amber-50  text-amber-700  border-amber-200',    dot: 'bg-amber-500'  },
  red:        { label: 'Kritické',   classes: 'bg-rose-50   text-rose-700   border-rose-200',      dot: 'bg-rose-500'   },
  no_data:    { label: 'Bez dat',    classes: 'bg-zinc-50   text-zinc-500   border-zinc-200',      dot: 'bg-zinc-400'   },
};

export function StatusBadge({ status, size = 'md', showDot = true, className }: Props) {
  const { label, classes, dot } = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        classes,
        className,
      )}
    >
      {showDot && <span className={cn('rounded-full', dot, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} />}
      {label}
    </span>
  );
}
