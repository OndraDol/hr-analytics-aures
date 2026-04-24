export type SectionId = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';

export type DataSource =
  | 'HRIS'
  | 'Payroll'
  | 'ATS'
  | 'TalentPool'
  | 'Survio'
  | 'AnnualAppraisal'
  | 'Edunio';

export type TrendType = 'MoM' | 'YoY' | 'QoQ' | 'HoH';
export type Frequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
export type Direction = 'up' | 'down' | 'flat';
export type Unit = 'pct' | 'days' | 'months' | 'CZK' | 'count' | 'score' | 'ratio' | 'mix';
export type Status = 'green' | 'amber' | 'red' | 'unknown';
export type Priority = 1 | 2 | 3;

export interface KPIDefinition {
  /** Stable machine code, e.g. "FLUCT_CRIT". */
  code: string;
  nameCs: string;
  section: SectionId | null;
  priority: Priority;
  recipient: string;
  source: DataSource;
  definitionCs: string;
  formulaCs: string;
  frequency: Frequency;
  owner: string;
  riskAnalysisCs: string;
  businessImpactCs: string;
  /** Target as number if numeric, otherwise textual descriptor. */
  target: string | number;
  /** Numeric thresholds for automatic status evaluation; if null, status stays 'unknown'. */
  greenThreshold: number | null;
  acceptableThreshold: number | null;
  redThreshold: number | null;
  /** Textual descriptors (for rendering in card footer). */
  greenLabel: string;
  acceptableLabel: string;
  redLabel: string;
  direction: Direction;
  trendType: TrendType;
  actionIfOffTrackCs: string;
  unit: Unit;
  /** KPI is in the cross-cutting drill-down view named here. */
  crossCutting: string[];
}

export interface KPIDriver {
  /** Label shown in UI, e.g. "Divize Sales CZ". */
  label: string;
  /** Stable segment id. */
  segmentId: string;
  /** How much this segment contributed to the delta (same unit as the KPI). */
  contribution: number;
  /** Human-readable detail, e.g. "+3 odchody (Key Account)". */
  detail?: string;
}

export interface KPITrend {
  mom?: number;
  yoy?: number;
  qoq?: number;
  hoh?: number;
}

export interface KPIEvaluation {
  code: string;
  /** Current period value. */
  value: number;
  /** Human-formatted value. */
  formattedValue: string;
  /** 12-period history (most recent last). */
  sparkline: number[];
  trend: KPITrend;
  status: Status;
  /** Signed difference vs. numeric target (when numeric), else null. */
  deltaVsTarget: number | null;
  /** ISO label of the reported period, e.g. "2026-03" for monthly. */
  periodLabel: string;
}

export interface KPIAnomalyFlag {
  active: boolean;
  zScore: number;
  direction: 'spike' | 'drop' | null;
}

export interface KPIEnriched extends KPIEvaluation {
  anomaly: KPIAnomalyFlag;
  drivers: KPIDriver[];
  narrativeCs: string;
  actionCs: string;
  aiInsightCs: string | null;
}
