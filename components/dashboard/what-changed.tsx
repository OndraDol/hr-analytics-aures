import type { ExecutiveChangeGroup, ExecutiveAlert } from '@/lib/analytics/executive-dashboard';

export function WhatChanged({ changes }: { changes: ExecutiveChangeGroup }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <ChangeColumn title="Zlepšení" tone="green" items={changes.improvements} />
      <ChangeColumn title="Nové problémy" tone="red" items={changes.problems} />
      <ChangeColumn title="Ke sledování" tone="amber" items={changes.watch} />
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
        {(items.length ? items : [{ code: 'HR_STATS', title: 'Bez výrazné změny', value: '', reasonCs: 'V aktuálním období není významný signál.', status: 'green', priority: 3, delta: 0, severityScore: 0, thresholdDistanceCs: 'bez odchylky', thresholdConfidenceCs: 'medium', href: '/' } satisfies ExecutiveAlert]).map((item) => (
          <div key={`${title}-${item.code}`} className="rounded-md bg-zinc-50 p-3">
            <p className="text-sm font-medium text-zinc-950">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{item.reasonCs}</p>
            {items.length ? (
              <p className="mt-2 font-mono text-xs text-zinc-500">Severity {item.severityScore}/100 · {item.thresholdDistanceCs}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
