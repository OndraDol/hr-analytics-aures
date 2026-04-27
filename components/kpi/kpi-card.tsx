import type { KpiCardModel } from '@/lib/analytics/kpi-engine';
import { cn } from '@/lib/utils';
import { KpiCardDecisionZone, KpiCardHeadlineZone, KpiCardInsightZone } from './kpi-card-zones';

export function KpiCard({
  model,
  featured = false,
  variant = 'simple',
}: {
  model: KpiCardModel;
  featured?: boolean;
  variant?: 'full' | 'simple';
}) {
  return (
    <article
      className={cn(
        'relative rounded-lg border border-zinc-200 bg-white p-5 shadow-sm',
        featured &&
          'border-aures-blue-300 bg-gradient-to-b from-white to-aures-blue-50/40 shadow-lg shadow-aures-blue-100/40',
      )}
    >
      {featured ? (
        <span className="absolute -top-2 left-5 rounded-full bg-aures-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Hlavní fokus
        </span>
      ) : null}
      <KpiCardHeadlineZone model={model} />
      <KpiCardInsightZone model={model} variant={variant} />
      <KpiCardDecisionZone model={model} variant={variant} />
    </article>
  );
}
