'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { KpiEvaluation } from '@/lib/analytics/types';
import { getThresholdScale } from '@/lib/kpi/thresholds';
import { cn } from '@/lib/utils';

const BAND_CLASS = {
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-rose-400',
};

const CONFIDENCE_LABEL = {
  high: 'vysoká jistota',
  medium: 'střední jistota',
  low: 'nízká jistota',
  'needs-validation': 'čeká na validaci',
};

const SOURCE_LABEL = {
  xls: 'XLS',
  externalBenchmark: 'benchmark',
  historicalData: 'historie',
  storyDefault: 'demo default',
  budget: 'budget',
  hrToConfirm: 'HR potvrzení',
};

export function ThresholdBar({ evaluation }: { evaluation: KpiEvaluation }) {
  const reduceMotion = useReducedMotion();
  const scale = getThresholdScale(evaluation.definition, evaluation.value);
  const needsValidation =
    evaluation.thresholdMetadata.confidence === 'low' ||
    evaluation.thresholdMetadata.confidence === 'needs-validation';

  return (
    <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 p-3" title={evaluation.thresholdRationaleCs}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Threshold</p>
        <div className="flex flex-wrap gap-1.5">
          {needsValidation ? (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-800">
              Čeká na validaci
            </span>
          ) : null}
          <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            {CONFIDENCE_LABEL[evaluation.thresholdMetadata.confidence]}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="relative h-3 overflow-hidden rounded-full bg-zinc-200">
          {needsValidation ? (
            <span className="absolute inset-0 z-10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.0)_0,rgba(255,255,255,0.0)_5px,rgba(255,255,255,0.55)_5px,rgba(255,255,255,0.55)_9px)]" />
          ) : null}
          {scale.bands.map((band) => (
            <span
              key={`${band.labelCs}-${band.status}-${band.startPct}`}
              className={cn('absolute top-0 h-full', BAND_CLASS[band.status])}
              style={{ left: `${band.startPct}%`, width: `${band.widthPct}%` }}
              aria-label={band.labelCs}
            />
          ))}
          {scale.targetPct != null ? (
            <span
              className="absolute top-[-2px] h-5 w-0.5 rounded-full bg-zinc-950"
              style={{ left: `${scale.targetPct}%` }}
              aria-label="target"
            />
          ) : null}
          <motion.span
            className="absolute top-[-4px] z-20 h-7 w-1 rounded-full bg-blue-700 shadow-sm"
            style={{ left: `${scale.currentPct}%` }}
            aria-label="aktuální hodnota"
            animate={
              evaluation.status === 'red' && !reduceMotion
                ? { scale: [1, 1.35, 1], opacity: [1, 0.62, 1] }
                : undefined
            }
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[11px] text-zinc-500">
          <span>{scale.minLabel}</span>
          <span>aktuálně {scale.currentLabel}</span>
          <span>{scale.maxLabel}</span>
        </div>
      </div>

      <p className="mt-2 text-xs font-medium text-zinc-600">
        Zdroj prahu: {SOURCE_LABEL[evaluation.thresholdMetadata.source]} · revize {evaluation.thresholdMetadata.reviewOwner}
      </p>
      <p className="mt-2 text-xs leading-5 text-zinc-600">{evaluation.thresholdDistance.messageCs}</p>
    </div>
  );
}
