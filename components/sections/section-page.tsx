import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '@/components/kpi/kpi-card';
import { SectionBreakdownChart, SectionTrendChart, type SectionTrendSeries } from '@/components/charts/section-charts';
import { StatusBadge } from '@/components/kpi/status-badge';
import type { SectionDashboardData } from '@/lib/analytics/section-summaries';

const trendColor = '#1d4ed8';

export function GenericSectionPage({ data }: { data: SectionDashboardData }) {
  const Icon = data.section.icon;
  const primaryKpi = data.kpis[0];
  const supportingKpis = data.kpis.slice(1, 4);
  const relatedLinks = [...data.section.relatedAnalytics, ...data.section.relatedOperational];

  const trendSeries: SectionTrendSeries[] = primaryKpi
    ? [
        {
          key: 'value',
          label: primaryKpi.evaluation.definition.nameCs,
          color: trendColor,
          points: primaryKpi.evaluation.sparkline,
        },
      ]
    : [];

  return (
    <main className="px-5 py-6 md:px-8">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="rounded-md p-2 text-white" style={{ backgroundColor: data.section.accent }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">{data.section.eyebrow}</p>
                <p className="text-sm text-zinc-500">HR Overview · Q1 2026</p>
              </div>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-zinc-950 md:text-5xl">
              {data.section.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-700">{data.executiveSignalCs}</p>
          </div>
          {primaryKpi ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{primaryKpi.evaluation.definition.nameCs}</p>
              <p className="mt-2 font-mono text-3xl font-semibold text-zinc-950">{primaryKpi.evaluation.formattedValue}</p>
              <div className="mt-2 flex justify-end">
                <StatusBadge status={primaryKpi.evaluation.status} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {trendSeries.length > 0 ? (
        <section className="mt-6">
          <Panel
            title="Trend hlavního KPI"
            subtitle={`Vývoj posledních ${primaryKpi!.evaluation.sparkline.length} období s tooltipem a hodnotami os.`}
          >
            <SectionTrendChart series={trendSeries} />
          </Panel>
        </section>
      ) : null}

      {primaryKpi || supportingKpis.length > 0 ? (
        <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {primaryKpi ? (
            <div className="md:col-span-2 xl:col-span-1">
              <KpiCard model={primaryKpi} featured variant="simple" />
            </div>
          ) : null}
          {supportingKpis.map((model) => (
            <KpiCard key={model.evaluation.code} model={model} variant="simple" />
          ))}
        </section>
      ) : null}

      <section className="mt-6">
        <Panel title={data.primaryBreakdown.title} subtitle={data.primaryBreakdown.subtitle}>
          <SectionBreakdownChart
            rows={data.primaryBreakdown.rows}
            valueLabel={data.primaryBreakdown.valueLabel}
            secondaryLabel={data.primaryBreakdown.secondaryLabel}
          />
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Co udělat" subtitle="Nejbližší praktický krok pro HR">
          <div className="space-y-3">
            {data.actions.slice(0, 3).map((action) => (
              <div key={action} className="flex gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-zinc-700">{action}</p>
              </div>
            ))}
          </div>
        </Panel>
        {relatedLinks.length > 0 ? (
          <Panel title="Souvislosti" subtitle="Hlubší pohledy v Analytice a Operativě">
            <div className="flex flex-wrap gap-2">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  {link.label}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </Panel>
        ) : null}
      </section>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
