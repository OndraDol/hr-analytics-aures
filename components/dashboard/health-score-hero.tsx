import { Activity, ArrowUpRight } from 'lucide-react';
import type { ExecutiveDashboardData } from '@/lib/analytics/executive-dashboard';
import { cn } from '@/lib/utils';

export function HealthScoreHero({ data }: { data: ExecutiveDashboardData }) {
  const redCount = data.allEvaluations.filter((evaluation) => evaluation.status === 'red').length;
  const amberCount = data.allEvaluations.filter((evaluation) => evaluation.status === 'amber').length;
  const greenCount = data.allEvaluations.filter((evaluation) => evaluation.status === 'green').length;
  const tone = data.healthScore < 55 ? 'urgent' : data.healthScore < 75 ? 'attention' : 'good';
  const scoreClass = {
    urgent: 'text-7xl text-rose-600',
    attention: 'text-6xl text-amber-600',
    good: 'text-5xl text-emerald-600',
  }[tone];
  const ringColor = tone === 'urgent' ? 'var(--aures-orange-500)' : 'var(--aures-blue-700)';
  const background = `conic-gradient(${ringColor} ${data.healthScore * 3.6}deg, #e4e4e7 0deg)`;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-aures-blue-700">
            Přehled lidí - Q1 2026
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold tracking-normal text-zinc-950 md:text-7xl">
            Přehled lidí v organizaci
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
            Rychle ukazuje, kde je stav dobrý, kde vzniká riziko a co má HR řešit jako první.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatusTile label="Zelené KPI" value={greenCount} color="text-emerald-600" />
            <StatusTile label="Ke sledování" value={amberCount} color="text-amber-600" />
            <StatusTile label="Rizika" value={redCount} color="text-rose-600" />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
          <div className="mx-auto grid h-52 w-52 place-items-center rounded-full p-4" style={{ background }}>
            <div className="grid h-full w-full place-items-center rounded-full bg-white">
              <div className="text-center">
                <p className={cn('font-serif font-semibold tabular-nums', scoreClass)}>{data.healthScore}</p>
                <p className="mt-1 text-sm font-medium text-zinc-500">ze 100</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-aures-blue-100 bg-aures-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-aures-blue-700 p-2 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">{data.healthLabel}</p>
                <p className="text-xs text-zinc-500">aktuální snapshot Q1 2026</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {data.heroKpis.map((evaluation) => (
                <div key={evaluation.code} className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                  <span className="text-sm text-zinc-600">{evaluation.definition.nameCs}</span>
                  <span className="flex items-center gap-1 font-mono text-sm font-semibold text-zinc-950">
                    {evaluation.formattedValue}
                    <ArrowUpRight
                      className={cn(
                        'h-3.5 w-3.5',
                        (evaluation.trend.mom ?? 0) < 0 && 'rotate-90 text-emerald-600',
                        (evaluation.trend.mom ?? 0) > 0 && 'text-rose-600',
                      )}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={cn('mt-2 font-mono text-3xl font-semibold', color)}>{value}</p>
    </div>
  );
}
