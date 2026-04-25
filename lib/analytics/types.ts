import type { CommonFilter, Period } from '@/lib/data/provider';
import type { KpiCode, KpiDefinition, KpiStatus } from '@/lib/kpi/catalog';

export interface KpiEvaluationContext {
  period: Period;
  filter?: CommonFilter;
}

export interface KpiSparkPoint {
  period: string;
  value: number;
}

export interface KpiTrend {
  previousValue: number | null;
  mom: number | null;
  yoy: number | null;
}

export interface KpiEvaluation {
  code: KpiCode;
  definition: KpiDefinition;
  value: number;
  formattedValue: string;
  status: KpiStatus;
  deltaVsTarget: number | null;
  trend: KpiTrend;
  sparkline: KpiSparkPoint[];
  period: Period;
  dataQuality: 'real' | 'hybrid' | 'mock';
}

export interface KpiDriver {
  id: string;
  label: string;
  value: number;
  delta: number;
  share: number;
}

export interface KpiAnomaly {
  isAnomaly: boolean;
  zScore: number;
  direction: 'up' | 'down' | 'flat';
  messageCs: string;
}

export interface KpiActionRecommendation {
  severity: KpiStatus;
  titleCs: string;
  bodyCs: string;
}
