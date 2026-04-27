import type { ExecutiveChangeGroup, ExecutiveAlert } from '@/lib/analytics/executive-dashboard';
import type { CrossKpiHypothesis } from '@/lib/analytics/types';
import { HypothesesPanel } from './hypotheses-panel';

export function WhatChanged({
  changes,
  hypotheses = [],
}: {
  changes: ExecutiveChangeGroup;
  hypotheses?: readonly CrossKpiHypothesis[];
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <ChangeColumn title="Zlepšení" tone="green" items={changes.improvements} />
      <ChangeColumn title="Nové problémy" tone="red" items={changes.problems} />
      <ChangeColumn title="Ke sledování" tone="amber" items={changes.watch} />
      <HypothesesPanel hypotheses={hypotheses} />
    </section>
  );
}

function ChangeColumn({
  title,
  tone,
  items,
}: {
  title: string;
  tone: 'green' | 'red' | 'amber';
  items: readonly ExecutiveAlert[];
}) {
  const toneClass = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-rose-200 bg-rose-50 text-rose-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  }[tone];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
        {title}
      </p>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? items.slice(0, 2).map((item) => (
          <div key={`${title}-${item.code}`} className="rounded-md bg-zinc-50 p-3">
            <p className="text-sm font-medium text-zinc-950">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{item.reasonCs}</p>
          </div>
        )) : (
          <div className="rounded-md bg-zinc-50 p-3">
            <p className="text-sm font-medium text-zinc-950">Bez výrazné změny</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">V aktuálním období není významný signál pro tuto kategorii.</p>
          </div>
        )}
      </div>
    </div>
  );
}
