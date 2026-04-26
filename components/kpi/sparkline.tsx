'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { KpiSparkPoint } from '@/lib/analytics/types';

export function Sparkline({ points }: { points: readonly KpiSparkPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 220;
  const height = 56;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const path = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const coordinates = values.map((value, index) => ({
    x: index * step,
    y: height - ((value - min) / range) * (height - 8) - 4,
    value,
    period: points[index]?.period ?? '',
  }));
  const activePoint = activeIndex == null ? null : coordinates[activeIndex];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-14 w-full overflow-visible"
      role="img"
      aria-label="Dvanáctiměsíční trend KPI"
      onMouseLeave={() => setActiveIndex(null)}
      onBlur={() => setActiveIndex(null)}
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600" />
      <line x1="0" y1={height - 2} x2={width} y2={height - 2} stroke="currentColor" strokeWidth="1" className="text-zinc-200" />
      {coordinates.map((point, index) => (
        <rect
          key={`${point.period}-${index}`}
          x={Math.max(0, point.x - step / 2)}
          y="0"
          width={Math.max(10, step)}
          height={height}
          fill="transparent"
          onMouseEnter={() => setActiveIndex(index)}
          onFocus={() => setActiveIndex(index)}
          tabIndex={0}
          aria-label={`${point.period}: ${formatValue(point.value)}`}
        />
      ))}
      {activePoint ? (
        <g pointerEvents="none">
          <line
            x1={activePoint.x}
            y1="2"
            x2={activePoint.x}
            y2={height - 2}
            stroke="currentColor"
            strokeWidth="1"
            className="text-blue-200"
          />
          <motion.circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="4"
            fill="var(--aures-blue-700)"
            initial={{ scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
          />
          <text
            x={Math.min(width - 52, Math.max(0, activePoint.x - 32))}
            y="10"
            className="fill-zinc-700 text-[10px] font-medium"
          >
            {activePoint.period} · {formatValue(activePoint.value)}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

function formatValue(value: number): string {
  return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(value);
}
