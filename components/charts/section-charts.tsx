'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={44} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }} />
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
        </LineChart>
      </ResponsiveContainer>
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
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} interval={0} angle={-18} textAnchor="end" height={70} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={44} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }} />
          <Bar dataKey={valueLabel} fill="#1d4ed8" radius={[5, 5, 0, 0]} />
          {secondaryLabel ? <Bar dataKey={secondaryLabel} fill="#f97316" radius={[5, 5, 0, 0]} /> : null}
        </BarChart>
      </ResponsiveContainer>
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
