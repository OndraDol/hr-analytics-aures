'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Area,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GradientDefs, KpiLegend, KpiTooltip } from '@/components/charts/chart-primitives';
import type { KpiSparkPoint } from '@/lib/analytics/types';
import type { SectionBreakdownRow } from '@/lib/analytics/section-summaries';

export interface SectionTrendSeries {
  key: string;
  label: string;
  color: string;
  points: readonly KpiSparkPoint[];
}

export function SectionTrendChart({ series }: { series: readonly SectionTrendSeries[] }) {
  const mounted = useMounted();
  const data = useMemo(() => {
    const periods = Array.from(new Set(series.flatMap((item) => item.points.map((point) => point.period))));
    return periods.map((period) => {
      const row: Record<string, string | number> = { period };
      for (const item of series) {
        const value = item.points.find((point) => point.period === period)?.value;
        row[item.key] = value == null ? 0 : Number(value.toFixed(1));
      }
      return row;
    });
  }, [series]);

  if (!mounted) return <ChartSkeleton />;

  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <GradientDefs idPrefix="section-trend" />
          <CartesianGrid stroke="var(--aures-graphite-200)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--aures-graphite-500)' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--aures-graphite-500)' }} width={44} />
          <Tooltip content={<KpiTooltip />} />
          {series[0] ? <Area type="monotone" dataKey={series[0].key} fill="url(#section-trend-blue-area)" stroke="none" /> : null}
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2.4}
              dot={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <KpiLegend />
    </div>
  );
}

export function SectionBreakdownChart({
  rows,
  valueLabel,
  secondaryLabel,
}: {
  rows: readonly SectionBreakdownRow[];
  valueLabel: string;
  secondaryLabel?: string;
}) {
  const mounted = useMounted();
  const data = rows.slice(0, 8).map((row) => ({
    name: row.label.length > 18 ? `${row.label.slice(0, 18)}...` : row.label,
    [valueLabel]: Number(row.value.toFixed(1)),
    ...(secondaryLabel && row.secondary != null ? { [secondaryLabel]: Number(row.secondary.toFixed(1)) } : {}),
  }));

  if (!mounted) return <ChartSkeleton />;

  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <GradientDefs idPrefix="section-breakdown" />
          <CartesianGrid stroke="var(--aures-graphite-200)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--aures-graphite-500)' }} interval={0} angle={-18} textAnchor="end" height={70} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--aures-graphite-500)' }} width={44} />
          <Tooltip content={<KpiTooltip />} />
          <Bar dataKey={valueLabel} fill="url(#section-breakdown-blue-bar)" radius={[5, 5, 0, 0]} />
          {secondaryLabel ? <Bar dataKey={secondaryLabel} fill="url(#section-breakdown-orange-bar)" radius={[5, 5, 0, 0]} /> : null}
        </BarChart>
      </ResponsiveContainer>
      <KpiLegend />
    </div>
  );
}

function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function ChartSkeleton() {
  return (
    <div className="flex h-72 items-end gap-2 rounded-md bg-zinc-50 p-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="flex-1 rounded-t bg-zinc-200"
          style={{ height: `${32 + ((index * 19) % 58)}%` }}
        />
      ))}
    </div>
  );
}
