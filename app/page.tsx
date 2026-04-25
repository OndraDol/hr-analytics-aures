import Link from 'next/link';
import type { ComponentType } from 'react';
import { ArrowRight, BarChart3, Database, Gauge } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-8 text-zinc-950 md:px-10">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">AURES Holdings</p>
            <p className="mt-1 text-lg font-semibold">HR Analytics</p>
          </div>
          <Link href="/sekce/retention" className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800">
            Otevřít Retention
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Milník 3 preview</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-normal text-zinc-950 md:text-7xl">
              Chytré HR BI nad reálnou kostrou AURES dat
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              První dotažený svislý řez ukazuje sekci Retention: KPI engine, driver analysis, doporučené akce a mock AI insight vrstvu připravenou pro finální dashboard.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-950">Stav prototypu</p>
            <div className="mt-5 grid gap-3">
              <StatusRow icon={Database} label="M1 Data layer" value="hotovo" />
              <StatusRow icon={Gauge} label="M2 KPI core" value="hotovo" />
              <StatusRow icon={BarChart3} label="M3 Retention" value="preview" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <Icon className="h-4 w-4 text-blue-700" />
        {label}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{value}</span>
    </div>
  );
}
