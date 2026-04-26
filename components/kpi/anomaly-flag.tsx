'use client';

import { Activity } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { KpiAnomaly } from '@/lib/analytics/types';
import { cn } from '@/lib/utils';

const SEVERITY_CLASS: Record<KpiAnomaly['severity'], string> = {
  subtle: 'border-amber-200 bg-amber-50 text-amber-700',
  notable: 'border-orange-200 bg-orange-50 text-orange-700',
  sharp: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function AnomalyFlag({ anomaly }: { anomaly: KpiAnomaly }) {
  const reduceMotion = useReducedMotion();
  if (!anomaly.isAnomaly) return null;

  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        SEVERITY_CLASS[anomaly.severity],
      )}
      title={anomaly.messageCs}
      animate={anomaly.severity === 'sharp' && !reduceMotion ? { rotate: [0, -2, 2, 0] } : undefined}
      transition={{ duration: 0.5, repeat: 2 }}
    >
      <Activity className="h-3 w-3" />
      Anomálie {anomaly.zScore.toFixed(1)}
    </motion.span>
  );
}
