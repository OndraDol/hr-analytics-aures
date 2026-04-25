'use client';

import { useEffect, useState } from 'react';
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
import type { RetentionSegment } from '@/lib/analytics/retention-summary';

export function RetentionTrendChart({
  fluct,
  critical,
}: {
  fluct: readonly KpiSparkPoint[];
  critical: readonly KpiSparkPoint[];
}) {
  const mounted = useMounted();
  const criticalByPeriod = new Map(critical.map((point) => [point.period, point.value]));
  const data = fluct.map((point) => ({
    period: point.period,
    fluktuace: Number(point.value.toFixed(1)),
    kriticke: Number((criticalByPeriod.get(point.period) ?? 0).toFixed(1)),
  }));

  if (!mounted) return <ChartSkeleton />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={36} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }} />
          <Line type="monotone" dataKey="fluktuace" stroke="#1d4ed8" strokeWidth={2.4} dot={false} />
          <Line type="monotone" dataKey="kriticke" stroke="#f97316" strokeWidth={2.4} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RetentionSegmentChart({ segments }: { segments: readonly RetentionSegment[] }) {
  const mounted = useMounted();
  const data = segments.slice(0, 8).map((segment) => ({
    name: segment.divisionName.length > 18 ? `${segment.divisionName.slice(0, 18)}…` : segment.divisionName,
    odchody: segment.leavers,
    kriticke: segment.criticalLeavers,
  }));

  if (!mounted) return <ChartSkeleton />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} interval={0} angle={-18} textAnchor="end" height={70} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} width={36} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }} />
          <Bar dataKey="odchody" fill="#1d4ed8" radius={[5, 5, 0, 0]} />
          <Bar dataKey="kriticke" fill="#f97316" radius={[5, 5, 0, 0]} />
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
          style={{ height: `${35 + ((index * 17) % 55)}%` }}
        />
      ))}
    </div>
  );
}
