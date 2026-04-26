'use client';

import type { ReactNode } from 'react';

interface TooltipPayload {
  name?: string;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
}

export function KpiTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-aures-blue-100 bg-white/95 p-3 text-sm shadow-xl backdrop-blur">
      {label ? <p className="mb-2 font-semibold text-aures-graphite-950">{label}</p> : null}
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={`${item.dataKey ?? item.name}`} className="flex items-center justify-between gap-5">
            <span className="inline-flex items-center gap-2 text-zinc-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name ?? item.dataKey}
            </span>
            <span className="font-mono font-semibold text-zinc-950">
              {typeof item.value === 'number' ? formatTooltipValue(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KpiLegend({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
      {children ?? (
        <>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-aures-blue-700" />
            primární KPI
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-aures-orange-500" />
            sekundární signál
          </span>
        </>
      )}
    </div>
  );
}

export function GradientDefs({ idPrefix = 'chart' }: { idPrefix?: string }) {
  return (
    <defs>
      <linearGradient id={`${idPrefix}-blue-area`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="var(--aures-blue-700)" stopOpacity={0.18} />
        <stop offset="100%" stopColor="var(--aures-blue-700)" stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id={`${idPrefix}-blue-bar`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="var(--aures-blue-700)" stopOpacity={0.95} />
        <stop offset="100%" stopColor="var(--aures-blue-600)" stopOpacity={0.72} />
      </linearGradient>
      <linearGradient id={`${idPrefix}-orange-bar`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="var(--aures-orange-500)" stopOpacity={0.95} />
        <stop offset="100%" stopColor="var(--aures-orange-400)" stopOpacity={0.72} />
      </linearGradient>
    </defs>
  );
}

function formatTooltipValue(value: number): string {
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(value);
}
