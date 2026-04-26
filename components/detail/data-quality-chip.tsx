import type { DetailTableRow } from '@/lib/analytics/detail-types';
import { cn } from '@/lib/utils';

const LABEL: Record<NonNullable<DetailTableRow['dataQuality']>, string> = {
  ready: 'Připraveno',
  partial: 'Částečně',
  mock: 'Mock data',
  'needs-validation': 'K validaci',
  blocked: 'Blokováno',
};

const CLASS_NAME: Record<NonNullable<DetailTableRow['dataQuality']>, string> = {
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  partial: 'border-amber-200 bg-amber-50 text-amber-700',
  mock: 'border-orange-200 bg-orange-50 text-orange-700',
  'needs-validation': 'border-rose-200 bg-rose-50 text-rose-700',
  blocked: 'border-zinc-300 bg-zinc-100 text-zinc-700',
};

export function DataQualityChip({ value }: { value: DetailTableRow['dataQuality'] }) {
  if (!value) return null;

  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', CLASS_NAME[value])}>
      {LABEL[value]}
    </span>
  );
}
