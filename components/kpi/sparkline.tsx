'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { KpiSparkPoint } from '@/lib/analytics/types';
import { cn } from '@/lib/utils';

const valueFormatter = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 });
const formatValue = (value: number) => valueFormatter.format(value);

interface SparklineProps {
  points: readonly KpiSparkPoint[];
  /** Compact mode hides the Y-axis min/max labels (used inside narrow KPI cards). */
  compact?: boolean;
  /** Optional reference value rendered as dashed horizontal line (target / threshold). */
  target?: number;
  /** Suffix appended to numeric labels (e.g. " %", " dnů"). */
  unitSuffix?: string;
  className?: string;
}

export function Sparkline({ points, compact = false, target, unitSuffix = '', className }: SparklineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  if (points.length === 0) return null;

  const values = points.map((point) => point.value);
  const includeTarget = typeof target === 'number';
  const min = Math.min(...values, includeTarget ? target! : Number.POSITIVE_INFINITY);
  const max = Math.max(...values, includeTarget ? target! : Number.NEGATIVE_INFINITY);
  const safeMin = Number.isFinite(min) ? min : Math.min(...values);
  const safeMax = Number.isFinite(max) ? max : Math.max(...values);
  const range = safeMax - safeMin || 1;

  const width = 200;
  const height = 56;
  const step = values.length > 1 ? width / (values.length - 1) : width;

  const coordinates = values.map((value, index) => ({
    x: index * step,
    y: height - ((value - safeMin) / range) * (height - 8) - 4,
    value,
    period: points[index]?.period ?? '',
  }));
  const path = coordinates
    .map(({ x, y }, idx) => `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');

  const firstPoint = coordinates[0]!;
  const lastPoint = coordinates[coordinates.length - 1]!;
  const activePoint = activeIndex == null ? null : coordinates[activeIndex];
  const targetY = includeTarget ? height - ((target! - safeMin) / range) * (height - 8) - 4 : null;
  const lastValueLabel = `${formatValue(lastPoint.value)}${unitSuffix}`;

  return (
    <div
      className={cn(
        'grid items-stretch gap-x-2',
        compact ? 'grid-cols-[1fr_auto]' : 'grid-cols-[auto_1fr_auto]',
        className,
      )}
    >
      {compact ? null : (
        <div className="flex flex-col justify-between py-0.5 text-right text-[9px] font-medium leading-none text-zinc-400">
          <span>
            {formatValue(safeMax)}
            {unitSuffix}
          </span>
          <span>
            {formatValue(safeMin)}
            {unitSuffix}
          </span>
        </div>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="block h-12 w-full"
          role="img"
          aria-label={`Trend KPI, ${points.length} období`}
          onMouseLeave={() => setActiveIndex(null)}
          onBlur={() => setActiveIndex(null)}
        >
          <line
            x1="0"
            y1={height - 2}
            x2={width}
            y2={height - 2}
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-200"
            vectorEffect="non-scaling-stroke"
          />
          {targetY != null ? (
            <line
              x1="0"
              y1={targetY}
              x2={width}
              y2={targetY}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="text-aures-orange-400"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-aures-blue-700"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill="var(--aures-orange-500)" />
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
              aria-label={`${point.period}: ${formatValue(point.value)}${unitSuffix}`}
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
                className="text-aures-blue-300"
                vectorEffect="non-scaling-stroke"
              />
              <motion.circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3.5"
                fill="var(--aures-blue-700)"
                initial={{ scale: 0.7, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18 }}
              />
            </g>
          ) : null}
        </svg>

        <div className="mt-1 flex justify-between text-[9px] font-medium text-zinc-400">
          <span>{firstPoint.period}</span>
          <span>{lastPoint.period}</span>
        </div>

        {activePoint ? (
          <div
            className="pointer-events-none absolute -top-1 z-10 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white shadow"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {activePoint.period} · {formatValue(activePoint.value)}
            {unitSuffix}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-end justify-center pl-1 text-right leading-tight">
        <span className="font-mono text-[11px] font-semibold text-zinc-900">{lastValueLabel}</span>
        <span className="text-[9px] uppercase tracking-wide text-zinc-400">teď</span>
      </div>
    </div>
  );
}
