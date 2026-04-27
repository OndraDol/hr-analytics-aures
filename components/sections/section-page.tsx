import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '@/components/kpi/kpi-card';
import { SectionBreakdownChart } from '@/components/charts/section-charts';
import type { SectionDashboardData, SectionMetric } from '@/lib/analytics/section-summaries';
import { cn } from '@/lib/utils';

const TONE_CLASS: Record<SectionMetric['tone'], string> = {
  blue: 'text-blue-700 bg-blue-50',
  orange: 'text-orange-700 bg-orange-50',
  emerald: 'text-emerald-700 bg-emerald-50',
  rose: 'text-rose-700 bg-rose-50',
  violet: 'text-violet-700 bg-violet-50',
  zinc: 'text-zinc-700 bg-zinc-100',
};

export function GenericSectionPage({ data }: { data: SectionDashboardData }) {
  const Icon = data.section.icon;
  const primaryKpi = data.kpis[0];
  const supportingKpis = data.kpis.slice(1, 4);
  const keyMetrics = data.metrics.slice(0, 3);
  const relatedLinks = [...data.section.relatedAnalytics, ...data.section.relatedOperational];

  return (
    <main className="px-5 py-6 md:px-8">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="rounded-md p-2 text-white" style={{ backgroundColor: data.section.accent }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">{data.section.eyebrow}</p>
                <p className="text-sm text-zinc-500">Přehled pro řízení lidí</p>
              </div>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-zinc-950 md:text-5xl">
              {data.section.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">{data.section.description}</p>
          </div>
          <div className="max-w-md rounded-lg border border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-950">Co je důležité</p>
            <p className="mt-2 text-sm leading-6 text-violet-900">{data.executiveSignalCs}</p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {keyMetrics.map((metric) => (
            <div key={metric.label} className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{metric.label}</p>
              <p className={cn('mt-2 inline-flex rounded-md px-2 py-1 font-mono text-2xl font-semibold tracking-normal', TONE_CLASS[metric.tone])}>
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-zinc-600">{metric.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {primaryKpi ? <KpiCard model={primaryKpi} featured variant="simple" /> : null}
        <Panel title={data.primaryBreakdown.title} subtitle={data.primaryBreakdown.subtitle}>
          <SectionBreakdownChart
            rows={data.primaryBreakdown.rows}
            valueLabel={data.primaryBreakdown.valueLabel}
            secondaryLabel={data.primaryBreakdown.secondaryLabel}
          />
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Podpůrné metriky" subtitle="Jen čísla, která pomáhají vysvětlit hlavní metriku">
          <div className="space-y-3">
            {supportingKpis.map((model) => (
              <div key={model.evaluation.code} className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950">{model.evaluation.definition.nameCs}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {Math.abs(model.evaluation.trend.mom ?? 0) < 0.01
                      ? 'beze změny proti předchozímu měsíci'
                      : `${(model.evaluation.trend.mom ?? 0) > 0 ? 'vyšší' : 'nižší'} než předchozí měsíc`}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xl font-semibold text-zinc-950">{model.evaluation.formattedValue}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Co udělat" subtitle="Nejbližší praktický krok pro HR">
          <div className="space-y-3">
            {data.actions.slice(0, 2).map((action) => (
              <div key={action} className="flex gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-zinc-700">{action}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {relatedLinks.length > 0 ? (
        <section className="mt-6">
          <Panel title="Detailní pohledy" subtitle="Použít až ve chvíli, kdy je potřeba dohledat konkrétní tým, roli nebo záznam">
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 hover:border-blue-200 hover:bg-blue-50"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-blue-700" />
                </Link>
              ))}
            </div>
          </Panel>
        </section>
      ) : null}
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
