import { AuresMonogram } from '@/components/layout/aures-monogram';
import type { ExecutiveBriefingData } from '@/lib/briefing/executive-briefing';

export function BriefingCover({ data }: { data: ExecutiveBriefingData }) {
  return (
    <section className="briefing-cover briefing-section rounded-lg border border-aures-blue-100 bg-white p-8 shadow-sm">
      <div className="flex min-h-[520px] flex-col justify-between">
        <div>
          <AuresMonogram className="h-16 w-16" />
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-aures-blue-700">
            AURES Holdings · HR Overview
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-6xl font-semibold leading-tight text-aures-graphite-950">
            {data.coverData.titleCs}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">{data.coverData.subtitleCs}</p>
        </div>
        <div className="grid gap-4 border-t border-zinc-200 pt-6 md:grid-cols-3">
          <CoverFact label="Stav lidí" value={`${data.dashboard.healthScore}/100`} />
          <CoverFact label="K řešení" value={data.dashboard.topAlerts.length.toString()} />
          <CoverFact label="Období" value={data.coverData.generatedLabelCs} />
        </div>
      </div>
    </section>
  );
}

function CoverFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
