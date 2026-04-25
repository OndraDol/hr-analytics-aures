import type { KpiStatus } from '@/lib/kpi/catalog';
import { cn } from '@/lib/utils';

const LABELS: Record<KpiStatus, string> = {
  green: 'V pořádku',
  amber: 'Sledovat',
  red: 'Riziko',
};

const CLASSES: Record<KpiStatus, string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function StatusBadge({ status }: { status: KpiStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', CLASSES[status])}>
      {LABELS[status]}
    </span>
  );
}
