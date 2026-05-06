import type { Period } from '@/lib/data/provider';
import type { KpiDefinition } from '@/lib/kpi/catalog';
import { formatDelta, formatKpiValue } from './format';
import type { KpiDriver, KpiEvaluation } from './types';

const DRIVER_NOISE_FLOOR = 0.05;

const MONTHS_CS = [
  'leden',
  'únor',
  'březen',
  'duben',
  'květen',
  'červen',
  'červenec',
  'srpen',
  'září',
  'říjen',
  'listopad',
  'prosinec',
];

export function formatPeriodHuman(period: Period): string {
  const year = Number(period.to.slice(0, 4));
  const month = Number(period.to.slice(5, 7));
  const label = MONTHS_CS[month - 1];
  if (!label || !year) return period.to.slice(0, 7);
  return `${label} ${year}`;
}

export function statusHuman(status: KpiEvaluation['status']): string {
  if (status === 'red') return 'mimo domluvenou toleranci';
  if (status === 'amber') return 'ke sledování';
  return 'v pořádku';
}

export function trendDirectionCs(evaluation: KpiEvaluation, delta: number): string {
  if (Math.abs(delta) < 0.01) return 'beze změny';
  const isGood =
    evaluation.definition.direction === 'down'
      ? delta < 0
      : evaluation.definition.direction === 'up'
        ? delta > 0
        : Math.abs(evaluation.deltaVsTarget ?? 0) <
          Math.abs((evaluation.deltaVsTarget ?? 0) - delta);
  const verb = delta > 0 ? 'vyšší' : 'nižší';
  return `${verb}${isGood ? ' a tím lepší' : ''}`;
}

export function comparisonSentence(evaluation: KpiEvaluation): string {
  const delta = evaluation.trend.mom ?? 0;
  const previous = evaluation.trend.previousValue;
  const currentLabel = formatPeriodHuman(evaluation.period);
  const periodPhrase = previous == null ? 'proti předchozímu období' : 'proti předchozímu měsíci';
  if (Math.abs(delta) < 0.01) {
    return `Za ${currentLabel} je hodnota prakticky stejná ${periodPhrase}.`;
  }
  const formattedDelta = formatDelta(Math.abs(delta), evaluation.definition.unit);
  return `Za ${currentLabel} je hodnota ${trendDirectionCs(evaluation, delta)} o ${formattedDelta} ${periodPhrase}.`;
}

export function yearComparisonSentence(evaluation: KpiEvaluation): string | null {
  const delta = evaluation.trend.yoy;
  if (delta == null || Math.abs(delta) < 0.01) return null;
  const formattedDelta = formatDelta(Math.abs(delta), evaluation.definition.unit);
  const direction = delta > 0 ? 'vyšší' : 'nižší';
  return `Meziročně je ${direction} o ${formattedDelta}.`;
}

export function driverSentence(
  definition: KpiDefinition,
  drivers: readonly KpiDriver[],
): string {
  const meaningful = drivers.filter((driver) => Math.abs(driver.delta) >= DRIVER_NOISE_FLOOR);
  const topDriver = meaningful[0];
  if (!topDriver) {
    return `Změna se rozkládá rovnoměrně mezi segmenty — žádná divize není dominantní. Detail je v ${definition.owner}.`;
  }
  const formattedDelta = formatDelta(Math.abs(topDriver.delta), definition.unit);
  const direction = topDriver.delta > 0 ? 'přidalo' : 'ubralo';
  return `Nejvíc to vysvětluje ${topDriver.label}: ${direction} ${formattedDelta} proti předchozímu měsíci.`;
}

export function businessImpactSentence(evaluation: KpiEvaluation): string {
  if (evaluation.status === 'red') {
    return `Dopad pro HR: ${evaluation.definition.businessImpactCs}`;
  }
  if (evaluation.status === 'amber') {
    return `Dopad pro HR: zatím nejde o krizi, ale ${evaluation.definition.riskAnalysisCs.toLowerCase()}`;
  }
  return `Dopad pro HR: stav podporuje stabilní řízení, dál sledujte hlavní segmenty a nečekané změny.`;
}

export function nextStepSentence(evaluation: KpiEvaluation): string {
  return `Další krok: ${evaluation.definition.actionIfOffTrackCs}`;
}
