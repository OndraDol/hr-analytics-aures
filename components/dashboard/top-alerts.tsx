import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { ExecutiveAlert } from '@/lib/analytics/executive-dashboard';
import { EmptyState } from '@/components/layout/empty-state';
import { StatusBadge } from '@/components/kpi/status-badge';

export function TopAlerts({ alerts }: { alerts: readonly ExecutiveAlert[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Top alerts</h2>
          <p className="mt-1 text-sm text-zinc-500">Nejvyšší rizika podle priority, statusu a změny.</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-rose-500" />
      </div>
      <div className="mt-5 space-y-3">
        {alerts.length > 0 ? alerts.map((alert) => (
          <Link
            key={alert.code}
            href={alert.href}
            className={`block rounded-md border bg-zinc-50 p-3 hover:border-blue-200 hover:bg-blue-50/40 ${
              alert.rank === 1
                ? 'border-2 border-rose-300 shadow-lg shadow-rose-200/40'
                : 'border-zinc-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-rose-600 font-mono text-xl font-semibold text-white shadow-md">
                  {alert.rank}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-950">{alert.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{alert.reasonCs}</p>
                  <p className="mt-2 font-mono text-xs text-zinc-500">
                    Severity {alert.severityScore}/100 · {alert.thresholdDistanceCs}
                  </p>
                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Owner: {alert.owner} · stáří {alert.ageDays} dnů
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <StatusBadge status={alert.status} />
                <p className="mt-2 font-mono text-sm font-semibold text-zinc-950">{alert.value}</p>
              </div>
            </div>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700">
              Otevřít sekci <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </Link>
        )) : (
          <EmptyState
            icon={AlertTriangle}
            title="Žádné aktivní alerty"
            description="Aktuální snapshot nemá červené ani amber priority."
          />
        )}
      </div>
    </section>
  );
}
