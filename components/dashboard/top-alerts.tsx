import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { ExecutiveAlert } from '@/lib/analytics/executive-dashboard';
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
        {alerts.map((alert) => (
          <Link
            key={alert.code}
            href={alert.href}
            className="block rounded-md border border-zinc-200 bg-zinc-50 p-3 hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-950">{alert.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600">{alert.reasonCs}</p>
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
        ))}
      </div>
    </section>
  );
}
