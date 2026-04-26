'use client';

import { useEffect, useState } from 'react';
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
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <GradientDefs idPrefix="retention" />
          <CartesianGrid stroke="var(--aures-graphite-200)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--aures-graphite-500)' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--aures-graphite-500)' }} width={36} />
          <Tooltip content={<KpiTooltip />} />
          <Area type="monotone" dataKey="fluktuace" fill="url(#retention-blue-area)" stroke="none" />
          <Line type="monotone" dataKey="fluktuace" stroke="var(--aures-blue-700)" strokeWidth={2.4} dot={false} />
          <Line type="monotone" dataKey="kriticke" stroke="var(--aures-orange-500)" strokeWidth={2.4} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <KpiLegend />
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
          <GradientDefs idPrefix="retention-segment" />
          <CartesianGrid stroke="var(--aures-graphite-200)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--aures-graphite-500)' }} interval={0} angle={-18} textAnchor="end" height={70} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--aures-graphite-500)' }} width={36} />
          <Tooltip content={<KpiTooltip />} />
          <Bar dataKey="odchody" fill="url(#retention-segment-blue-bar)" radius={[5, 5, 0, 0]} />
          <Bar dataKey="kriticke" fill="url(#retention-segment-orange-bar)" radius={[5, 5, 0, 0]} />
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
          style={{ height: `${35 + ((index * 17) % 55)}%` }}
        />
      ))}
    </div>
  );
}
