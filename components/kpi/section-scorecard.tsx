import type { KPISnapshot } from '@/lib/kpi/types';
import type { KPISection } from '@/lib/kpi/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { TrendArrow } from '@/components/ui/trend-arrow';
import { Sparkline } from '@/components/ui/sparkline';
import { getKPIHistory } from '@/lib/kpi-data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTION_META: Record<KPISection, { name: string; slug: string; icon: string }> = {
  I:    { name: 'HR Statistiky',         slug: 'i-hr-statistiky',         icon: '👥' },
  II:   { name: 'Pohyb zaměstnanců',     slug: 'ii-pohyb-zamestnancu',    icon: '🔄' },
  III:  { name: 'Náklady & Kapacita',    slug: 'iii-naklady-kapacita',    icon: '💰' },
  IV:   { name: 'Nábor',                 slug: 'iv-nabor',                icon: '🎯' },
  V:    { name: 'Retence',               slug: 'v-retence',               icon: '🔒' },
  VI:   { name: 'Nástupnictví',          slug: 'vi-nastupnictvi',         icon: '🏆' },
  VII:  { name: 'Angažovanost',          slug: 'vii-angazovanost',        icon: '💡' },
  VIII: { name: 'Talent & Rozvoj',       slug: 'viii-talent-rozvoj',      icon: '🌱' },
};

const STATUS_BG: Record<string, string> = {
  green:      'border-emerald-200 hover:border-emerald-300',
  acceptable: 'border-amber-200  hover:border-amber-300',
  red:        'border-rose-300   hover:border-rose-400',
  no_data:    'border-zinc-200',
};

interface Props {
  section: KPISection;
  snapshots: KPISnapshot[];
  style?: React.CSSProperties;
}

function aggregateStatus(snaps: KPISnapshot[]) {
  if (snaps.some((s) => s.kpiValue.status === 'red'))        return 'red';
  if (snaps.some((s) => s.kpiValue.status === 'acceptable')) return 'acceptable';
  if (snaps.some((s) => s.kpiValue.status === 'green'))      return 'green';
  return 'no_data' as const;
}

export async function SectionScorecard({ section, snapshots, style }: Props) {
  const meta = SECTION_META[section];
  const status = aggregateStatus(snapshots);

  // Pick the highest-priority KPI as the hero metric
  const hero = snapshots.sort((a, b) => a.kpiValue.definition.priority - b.kpiValue.definition.priority)[0];
  const history = hero ? await getKPIHistory(hero.kpiValue.definition.id, 6) : [];

  return (
    <Link
      href={`/sekce/${meta.slug}`}
      style={style}
      className={cn(
        'surface border-2 p-4 flex flex-col gap-3 transition-all hover:shadow-md group animate-fade-up stagger',
        STATUS_BG[status],
      )}
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Sekce {section}</p>
            <p className="text-sm font-semibold text-zinc-800 leading-tight">{meta.name}</p>
          </div>
        </div>
        <ArrowRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
      </div>

      {/* Status */}
      <StatusBadge status={status} size="sm" />

      {/* Hero KPI */}
      {hero && (
        <div>
          <p className="text-[10px] text-zinc-400 mb-1">{hero.kpiValue.definition.nameCs}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tabular-nums text-zinc-900">
              {hero.kpiValue.definition.unit === 'percent'
                ? `${hero.kpiValue.value.toFixed(1)} %`
                : hero.kpiValue.definition.unit === 'days'
                  ? `${hero.kpiValue.value.toFixed(0)} dní`
                  : hero.kpiValue.definition.unit === 'czk'
                    ? `${(hero.kpiValue.value / 1000).toFixed(0)} tis. Kč`
                    : String(Math.round(hero.kpiValue.value))}
            </span>
            <TrendArrow
              delta={hero.kpiValue.momDelta}
              unit={hero.kpiValue.definition.unit}
              goodDirection={hero.kpiValue.definition.direction === 'up_good' ? 'up' : 'down'}
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Mini sparkline */}
      {history.length > 1 && (
        <Sparkline data={history} status={status} height={28} />
      )}

      {/* KPI count */}
      <p className="text-[10px] text-zinc-400">{snapshots.length} metrik</p>
    </Link>
  );
}
