import {
  type KpiDefinition,
  type KpiStatus,
  type KpiThresholdConfidence,
  type KpiThresholdSource,
  type KpiThresholdType,
  type KpiUnit,
} from '@/lib/kpi/catalog';

export interface ThresholdMetadata {
  type: KpiThresholdType;
  source: KpiThresholdSource;
  confidence: KpiThresholdConfidence;
  benchmarkNoteCs: string;
  validFrom: string;
  reviewOwner: string;
  reviewCadence: string;
}

export interface ThresholdDistance {
  status: KpiStatus;
  referenceValue: number;
  referenceLabelCs: string;
  distance: number;
  formattedDistance: string;
  messageCs: string;
}

export interface ThresholdBand {
  labelCs: string;
  status: KpiStatus;
  startPct: number;
  widthPct: number;
}

export interface ThresholdScale {
  bands: ThresholdBand[];
  currentPct: number;
  targetPct: number | null;
  minLabel: string;
  maxLabel: string;
  currentLabel: string;
  targetLabel: string | null;
}

const SOURCE_LABELS: Record<KpiThresholdSource, string> = {
  xls: 'XLS zadání',
  externalBenchmark: 'externí benchmark',
  historicalData: 'historická data',
  storyDefault: 'demo storytelling default',
  budget: 'budget / staffplan',
  hrToConfirm: 'čeká na HR potvrzení',
};

const CONFIDENCE_LABELS: Record<KpiThresholdConfidence, string> = {
  high: 'vysoká jistota',
  medium: 'střední jistota',
  low: 'nízká jistota',
  'needs-validation': 'čeká na validaci',
};

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

function formatValue(value: number, unit: KpiUnit): string {
  const decimal = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 });
  const integer = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 });
  if (unit === 'pct') return `${decimal.format(value)} %`;
  if (unit === 'CZK') return `${integer.format(value)} Kč`;
  if (unit === 'days') return `${decimal.format(value)} dne`;
  if (unit === 'months') return `${decimal.format(value)} měs.`;
  if (unit === 'count') return integer.format(value);
  return decimal.format(value);
}

function percent(value: number, min: number, max: number): number {
  if (max <= min) return 50;
  return clamp(((value - min) / (max - min)) * 100);
}

function segment(start: number, end: number, min: number, max: number, status: KpiStatus, labelCs: string): ThresholdBand {
  const startPct = percent(start, min, max);
  const endPct = percent(end, min, max);
  return {
    labelCs,
    status,
    startPct,
    widthPct: Math.max(2, endPct - startPct),
  };
}

export function getThresholdMetadata(definition: KpiDefinition): ThresholdMetadata {
  const source = definition.thresholds.source ?? inferSource(definition);
  return {
    type: definition.thresholds.type ?? inferType(definition),
    source,
    confidence: definition.thresholds.confidence ?? inferConfidence(source),
    benchmarkNoteCs: definition.thresholds.benchmarkNoteCs ?? defaultBenchmarkNote(definition, source),
    validFrom: definition.thresholds.validFrom ?? '2026-Q1 demo',
    reviewOwner: definition.thresholds.reviewOwner ?? definition.owner,
    reviewCadence: definition.thresholds.reviewCadence ?? cadenceFor(definition.frequency),
  };
}

export function getThresholdRationale(definition: KpiDefinition): string {
  const metadata = getThresholdMetadata(definition);
  return `${SOURCE_LABELS[metadata.source]}, ${CONFIDENCE_LABELS[metadata.confidence]}. ${metadata.benchmarkNoteCs} Revize: ${metadata.reviewOwner}, ${metadata.reviewCadence}.`;
}

export function evaluateThresholdDistance(definition: KpiDefinition, value: number): ThresholdDistance {
  const status = statusFor(definition, value);
  const { thresholds, direction } = definition;
  const referenceValue =
    status === 'green'
      ? thresholds.green
      : status === 'amber'
        ? thresholds.amber
        : thresholds.red;
  const referenceLabelCs =
    status === 'green' ? 'zelený práh' : status === 'amber' ? 'akceptovatelný práh' : 'červený práh';
  const rawDistance =
    direction === 'up'
      ? value - referenceValue
      : direction === 'down'
        ? value - referenceValue
        : value - (thresholds.target ?? thresholds.green);
  const formattedDistance = formatValue(Math.abs(rawDistance), definition.unit);
  const sign = rawDistance >= 0 ? 'nad' : 'pod';
  const messageCs =
    direction === 'target'
      ? `${formattedDistance} od cíle`
      : `${formattedDistance} ${sign} hranicí: ${referenceLabelCs}`;

  return {
    status,
    referenceValue,
    referenceLabelCs,
    distance: rawDistance,
    formattedDistance,
    messageCs,
  };
}

export function getThresholdScale(definition: KpiDefinition, value: number): ThresholdScale {
  const { thresholds, direction, unit } = definition;
  const target = thresholds.target ?? thresholds.green;
  const values = [value, thresholds.green, thresholds.amber, thresholds.red, target].filter(Number.isFinite);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.18, Math.abs(rawMax || 1) * 0.05, 1);
  const min = Math.max(0, rawMin - padding);
  const max = rawMax + padding;

  if (direction === 'target') {
    const greenTolerance = thresholds.targetToleranceGreen ?? 0.05;
    const amberTolerance = thresholds.targetToleranceAmber ?? 0.1;
    const greenDelta = Math.abs(target) > 1 ? Math.abs(target) * greenTolerance : greenTolerance;
    const amberDelta = Math.abs(target) > 1 ? Math.abs(target) * amberTolerance : amberTolerance;
    const targetMin = Math.min(min, target - amberDelta, value);
    const targetMax = Math.max(max, target + amberDelta, value);
    return {
      bands: [
        segment(targetMin, target - amberDelta, targetMin, targetMax, 'red', 'mimo toleranci'),
        segment(target - amberDelta, target - greenDelta, targetMin, targetMax, 'amber', 'sledovat'),
        segment(target - greenDelta, target + greenDelta, targetMin, targetMax, 'green', 'cílové pásmo'),
        segment(target + greenDelta, target + amberDelta, targetMin, targetMax, 'amber', 'sledovat'),
        segment(target + amberDelta, targetMax, targetMin, targetMax, 'red', 'mimo toleranci'),
      ],
      currentPct: percent(value, targetMin, targetMax),
      targetPct: percent(target, targetMin, targetMax),
      minLabel: formatValue(targetMin, unit),
      maxLabel: formatValue(targetMax, unit),
      currentLabel: formatValue(value, unit),
      targetLabel: formatValue(target, unit),
    };
  }

  const bands =
    direction === 'down'
      ? [
          segment(min, thresholds.green, min, max, 'green', 'dobré'),
          segment(thresholds.green, thresholds.red, min, max, 'amber', 'sledovat'),
          segment(thresholds.red, max, min, max, 'red', 'riziko'),
        ]
      : [
          segment(min, thresholds.red, min, max, 'red', 'riziko'),
          segment(thresholds.red, thresholds.green, min, max, 'amber', 'sledovat'),
          segment(thresholds.green, max, min, max, 'green', 'dobré'),
        ];

  return {
    bands,
    currentPct: percent(value, min, max),
    targetPct: Number.isFinite(target) ? percent(target, min, max) : null,
    minLabel: formatValue(min, unit),
    maxLabel: formatValue(max, unit),
    currentLabel: formatValue(value, unit),
    targetLabel: Number.isFinite(target) ? formatValue(target, unit) : null,
  };
}

export function calculateSeverityScore(
  definition: KpiDefinition,
  value: number,
  status: KpiStatus,
  trendDelta: number | null,
  dataQuality: 'real' | 'hybrid' | 'mock',
): number {
  const statusBase: Record<KpiStatus, number> = { green: 0, amber: 42, red: 75 };
  const priorityBoost = (4 - definition.priority) * 6;
  const qualityPenalty = dataQuality === 'mock' ? -8 : dataQuality === 'hybrid' ? -3 : 0;
  const trendBoost = trendDelta == null ? 0 : Math.min(Math.abs(trendDelta), 12);
  const distance = evaluateThresholdDistance(definition, value);
  const distanceBoost = Math.min(Math.abs(distance.distance), 18);
  return Math.round(clamp(statusBase[status] + priorityBoost + qualityPenalty + trendBoost + distanceBoost));
}

export function statusFor(definition: KpiDefinition, value: number): KpiStatus {
  const { thresholds, direction } = definition;

  if (direction === 'up') {
    if (value >= thresholds.green) return 'green';
    if (value >= thresholds.amber) return 'amber';
    return 'red';
  }

  if (direction === 'down') {
    if (value <= thresholds.green) return 'green';
    if (value <= thresholds.amber) return 'amber';
    return 'red';
  }

  const target = thresholds.target ?? thresholds.green;
  const greenTolerance = thresholds.targetToleranceGreen ?? 0.05;
  const amberTolerance = thresholds.targetToleranceAmber ?? 0.1;
  const delta = Math.abs(value - target);
  const relativeDelta = Math.abs(target) > 1 ? delta / Math.abs(target) : delta;

  if (relativeDelta <= greenTolerance) return 'green';
  if (relativeDelta <= amberTolerance) return 'amber';
  return 'red';
}

function inferType(definition: KpiDefinition): KpiThresholdType {
  if (definition.direction === 'target') return 'targetBand';
  if (definition.thresholds.targetToleranceGreen != null) return 'budgetTolerance';
  if (definition.code === 'HOLIDAY_UNTAKEN') return 'seasonal';
  if (definition.source === 'Payroll' || definition.source === 'Recruitment') return 'benchmark';
  return 'absolute';
}

function inferSource(definition: KpiDefinition): KpiThresholdSource {
  if (definition.thresholds.targetToleranceGreen != null) return 'budget';
  if (definition.code === 'SICKNESS_RATE' || definition.code === 'SHIFT_COVERAGE' || definition.code === 'TALENT_GROWTH') {
    return 'storyDefault';
  }
  if (definition.source === 'Recruitment' || definition.source === 'Survio') return 'externalBenchmark';
  return 'xls';
}

function inferConfidence(source: KpiThresholdSource): KpiThresholdConfidence {
  if (source === 'xls' || source === 'budget') return 'medium';
  if (source === 'externalBenchmark' || source === 'historicalData') return 'medium';
  if (source === 'hrToConfirm') return 'needs-validation';
  return 'low';
}

function defaultBenchmarkNote(definition: KpiDefinition, source: KpiThresholdSource): string {
  if (source === 'budget') return 'Práh je vyjádřen jako tolerance od plánu nebo budgetu.';
  if (source === 'storyDefault') return 'Práh drží konzistentní demo příběh a čeká na potvrzení vlastníkem metriky.';
  if (source === 'externalBenchmark') return 'Práh kombinuje XLS hodnoty a obvyklou HR benchmark logiku pro danou oblast.';
  return 'Práh vychází z workbooku HR_reporting_ver2.xlsx a je připravený k business validaci.';
}

function cadenceFor(frequency: KpiDefinition['frequency']): string {
  if (frequency === 'monthly') return 'měsíčně';
  if (frequency === 'quarterly') return 'kvartálně';
  if (frequency === 'half-yearly') return 'pololetně';
  return 'ročně';
}
