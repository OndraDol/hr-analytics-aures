import Link from 'next/link';
import { ArrowRight, ShieldAlert, UsersRound } from 'lucide-react';
import type { KpiCardModel } from '@/lib/analytics/kpi-engine';
import type { RetentionSummary } from '@/lib/analytics/retention-summary';
import { driversToRiskSegments } from '@/lib/analytics/retention-summary';
import { KpiCard } from '@/components/kpi/kpi-card';
import { RetentionSegmentChart, RetentionTrendChart } from '@/components/charts/retention-charts';

export function RetentionPage({
  fluctuation,
  criticalFluctuation,
  enps,
  succession,
  summary,
}: {
  fluctuation: KpiCardModel;
  criticalFluctuation: KpiCardModel;
  enps: KpiCardModel;
  succession: KpiCardModel;
  summary: RetentionSummary;
}) {
  const riskSegments = driversToRiskSegments(fluctuation.drivers, fluctuation.evaluation);

  return (
    <main className="px-5 py-6 md:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Udržení lidí</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal text-zinc-950 md:text-5xl">
                Kde lidé odcházejí a co s tím udělat
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                Přehled ukazuje hlavní odchody, ohrožené skupiny a další praktický krok pro HR a manažery.
              </p>
            </div>
            <Link
              href="#drivers"
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
            >
              Otevřít drivers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MetricTile label="Aktivní HC" value={summary.activeHeadcount.toLocaleString('cs-CZ')} />
            <MetricTile label="Odchody v období" value={summary.totalLeavers.toLocaleString('cs-CZ')} />
            <MetricTile label="Klíčové odchody" value={summary.totalCriticalLeavers.toLocaleString('cs-CZ')} accent />
          </div>
        </div>
        <div id="ai" className="rounded-lg border border-violet-200 bg-violet-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-violet-600 p-2 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-950">Co je důležité</p>
              <p className="text-xs text-violet-700">mock AI + rule-based kotva</p>
            </div>
          </div>
          <p className="mt-5 font-serif text-xl italic leading-8 text-violet-950">
            {criticalFluctuation.aiInsight?.textCs ?? fluctuation.aiInsight?.textCs}
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <KpiCard model={fluctuation} featured />
        <KpiCard model={criticalFluctuation} featured />
        <KpiCard model={enps} />
        <KpiCard model={succession} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Trend fluktuace</h2>
              <p className="mt-1 text-sm text-zinc-500">12M sparkline z KPI engine, celkově vs. klíčové pozice</p>
            </div>
            <div className="hidden items-center gap-4 text-xs text-zinc-500 md:flex">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-700" /> Celkem</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Klíčové</span>
            </div>
          </div>
          <RetentionTrendChart fluct={fluctuation.evaluation.sparkline} critical={criticalFluctuation.evaluation.sparkline} />
        </div>
        <div id="drivers" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Hlavní příčiny změny</h2>
            <p className="mt-1 text-sm text-zinc-500">Segmenty seřazené podle aktuálního retenčního rizika</p>
          </div>
          <div className="mt-5 space-y-3">
            {riskSegments.map((segment) => (
              <div key={segment.label} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-950">{segment.label}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-zinc-600">{segment.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Odchody podle divize</h2>
            <p className="mt-1 text-sm text-zinc-500">Top segmenty za aktuální období</p>
          </div>
          <UsersRound className="h-5 w-5 text-blue-700" />
        </div>
        <RetentionSegmentChart segments={summary.segments} />
      </section>
    </main>
  );
}

function MetricTile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={accent ? 'mt-2 font-mono text-3xl font-semibold text-orange-600' : 'mt-2 font-mono text-3xl font-semibold text-zinc-950'}>
        {value}
      </p>
    </div>
  );
}
