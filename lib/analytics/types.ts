import type { CommonFilter, Period } from '@/lib/data/provider';
import type { KpiCode, KpiDefinition, KpiStatus } from '@/lib/kpi/catalog';
import type { SeverityBreakdown, ThresholdDistance, ThresholdMetadata } from '@/lib/kpi/thresholds';

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
  thresholdDistance: ThresholdDistance;
  thresholdMetadata: ThresholdMetadata;
  thresholdRationaleCs: string;
  severityScore: number;
  severityBreakdown: SeverityBreakdown;
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

export type KpiDriverDimension = 'division' | 'stage' | 'channel' | 'role' | 'grade' | 'tenure-cohort';

export interface KpiDriverGroup {
  dimension: KpiDriverDimension;
  labelCs: string;
  top: KpiDriver[];
}

export interface KpiAnomaly {
  isAnomaly: boolean;
  zScore: number;
  direction: 'up' | 'down' | 'flat';
  severity: 'subtle' | 'notable' | 'sharp';
  messageCs: string;
}

export interface CrossKpiHypothesis {
  kpis: [string, string];
  strength: 'strong' | 'plausible';
  messageCs: string;
  confidenceCs: string;
}

export interface KpiActionRecommendation {
  severity: KpiStatus;
  titleCs: string;
  bodyCs: string;
}
