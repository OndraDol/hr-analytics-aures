import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Clock3, ListChecks, UserRound, type LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/layout/empty-state';
import { StatusBadge } from '@/components/kpi/status-badge';
import type { ActionBacklogData, ActionBacklogEffort, ActionBacklogItem } from '@/lib/actions/action-backlog';
import { cn } from '@/lib/utils';

const effortLabel: Record<ActionBacklogEffort, string> = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
};

const effortClass: Record<ActionBacklogEffort, string> = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  high: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function ActionBacklogPage({ data }: { data: ActionBacklogData }) {
  return (
    <main className="px-5 py-6 md:px-8">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-700 p-2 text-white">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Akční backlog
                </p>
                <p className="text-sm text-zinc-500">Q1 2026 · doporučení z KPI vrstvy</p>
              </div>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-zinc-950 md:text-5xl">
              Prioritizované HR akce
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
              Jedno místo pro úkoly, které vycházejí ze statusu KPI, priority metriky, vlastníka a nejsilnějšího driveru.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-zinc-950">Souhrn k řešení</p>
            <div className="grid grid-cols-2 gap-3">
              <SummaryNumber label="Celkem" value={data.summary.total} />
              <SummaryNumber label="Tento týden" value={data.summary.thisWeek} tone="blue" />
              <SummaryNumber label="Rizika" value={data.summary.red} tone="rose" />
              <SummaryNumber label="P1" value={data.summary.priorityOne} tone="amber" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="space-y-4">
          {data.items.length > 0 ? (
            data.items.map((item, index) => <ActionItemCard key={item.id} item={item} rank={index + 1} />)
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Bez otevřených akcí"
              description="Všechny KPI jsou v zeleném pásmu pro aktuální období."
            />
          )}
        </div>

        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Jak backlog číst</h2>
          <div className="mt-4 space-y-3">
            <GuideItem
              title="Priorita"
              body="Řazení kombinuje KPI status, prioritu v návrhu a velikost změny proti minulému období."
            />
            <GuideItem
              title="Termín"
              body="Červené P1 akce jdou do tohoto týdne, ostatní červené do 14 dnů a amber položky do review cyklu."
            />
            <GuideItem
              title="Vlastník"
              body="Vlastník je převzatý z KPI katalogu a slouží jako výchozí odpovědná role pro Power BI zadání."
            />
          </div>
        </aside>
      </section>
    </main>
  );
}

function ActionItemCard({ item, rank }: { item: ActionBacklogItem; rank: number }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-zinc-100 font-mono text-sm font-semibold text-zinc-700">
            {rank}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                P{item.priority}
              </span>
              <span className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', effortClass[item.effort])}>
                Effort: {effortLabel[item.effort]}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-zinc-950">{item.titleCs}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">{item.recommendationCs}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{item.reasonCs}</p>
          </div>
        </div>
        <Link
          href={item.href}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-blue-700 hover:border-blue-200 hover:bg-blue-50"
        >
          Otevřít kontext
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <Fact label="KPI / sekce" value={`${item.sectionTitle} · ${item.value}`} />
        <Fact label="Owner" value={item.owner} icon={UserRound} />
        <Fact label="Termín" value={item.dueLabelCs} icon={Clock3} />
        <Fact label="Severity" value={`${item.impactScore}/100`} />
        <Fact label="Driver" value={item.driverCs} />
      </div>
    </article>
  );
}

function SummaryNumber({
  label,
  value,
  tone = 'zinc',
}: {
  label: string;
  value: number;
  tone?: 'zinc' | 'blue' | 'rose' | 'amber';
}) {
  const toneClass = {
    zinc: 'text-zinc-950',
    blue: 'text-blue-700',
    rose: 'text-rose-700',
    amber: 'text-amber-700',
  }[tone];

  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={cn('mt-1 font-mono text-3xl font-semibold', toneClass)}>{value}</p>
    </div>
  );
}

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </p>
      <p className="mt-2 text-sm leading-5 text-zinc-800">{value}</p>
    </div>
  );
}

function GuideItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{body}</p>
    </div>
  );
}
