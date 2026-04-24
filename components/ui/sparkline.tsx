'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import type { KPIStatus } from '@/lib/kpi/types';

interface Props {
  data: Array<{ period: string; value: number }>;
  status?: KPIStatus;
  height?: number;
}

const STATUS_COLOR: Record<string, string> = {
  green: '#10b981',
  acceptable: '#f59e0b',
  red: '#f43f5e',
  no_data: '#94a3b8',
};

export function Sparkline({ data, status = 'green', height = 40 }: Props) {
  if (data.length < 2) return <div style={{ height }} />;

  const color = STATUS_COLOR[status] ?? '#94a3b8';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
        <Tooltip
          content={({ payload }) => {
            const p = payload?.[0];
            if (!p) return null;
            return (
              <div className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs shadow-sm">
                <span className="font-medium">{String(p.value)}</span>
                {p.payload && <span className="ml-1 text-zinc-400">{(p.payload as { period?: string }).period}</span>}
              </div>
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
