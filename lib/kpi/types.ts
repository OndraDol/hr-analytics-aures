import type { KPIDefinition } from './catalog';

export type KPISection = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';
export type KPIStatus = 'green' | 'acceptable' | 'red' | 'no_data';
export type KPIUnit = 'percent' | 'count' | 'days' | 'czk' | 'score' | 'ratio';
export type KPIDirection = 'up_good' | 'down_good' | 'flat_good';

export interface KPIValue {
  kpiId: string;
  period: string;          // "2026-03" nebo "2025-Q4"
  value: number;
  previousValue: number | null;
  momDelta: number | null;
  yoyDelta: number | null;
  status: KPIStatus;
  definition: KPIDefinition;
}

export interface DriverSegment {
  dimension: 'division' | 'country' | 'grade' | 'tenure_band';
  label: string;
  value: number;           // hodnota KPI v tomto segmentu
  contribution: number;    // absolutní přírůstek k celkové MoM změně
  contributionPct: number;
  trend: 'up' | 'down' | 'flat';
}

export interface Anomaly {
  kpiId: string;
  period: string;
  zScore: number;
  direction: 'spike' | 'drop';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface Narrative {
  kpiId: string;
  period: string;
  text: string;
  topDrivers: DriverSegment[];
}

export interface ActionRecommendation {
  kpiId: string;
  status: KPIStatus;
  priority: 'immediate' | 'monitor' | 'scheduled';
  action: string;
  rationale: string;
}

export interface AIInsight {
  kpiId: string;
  text: string;
  generatedAt: string;
}

export interface KPISnapshot {
  kpiValue: KPIValue;
  narrative: Narrative;
  anomaly: Anomaly | null;
  action: ActionRecommendation;
  aiInsight: AIInsight | null;
}

export interface ExecutiveSummary {
  healthScore: number;
  period: string;
  alertCount: number;
  redCount: number;
  acceptableCount: number;
  greenCount: number;
  topAlerts: KPISnapshot[];
  changesThisMonth: {
    improved: KPISnapshot[];
    worsened: KPISnapshot[];
    toWatch: KPISnapshot[];
  };
  aiExecutiveSummary: string;
}
