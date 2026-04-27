import type { KpiAnomaly, KpiDriver, KpiEvaluation } from './types';
import {
  businessImpactSentence,
  comparisonSentence,
  driverSentence,
  nextStepSentence,
  statusHuman,
  yearComparisonSentence,
} from './human-readable';

export function generateNarrative(
  evaluation: KpiEvaluation,
  drivers: readonly KpiDriver[],
  anomaly: KpiAnomaly,
): string {
  const yearSentence = yearComparisonSentence(evaluation);
  const anomalySentence = anomaly.isAnomaly ? ` ${anomaly.messageCs}` : '';

  return [
    `${evaluation.definition.nameCs}: aktuálně ${evaluation.formattedValue} (${statusHuman(evaluation.status)}).`,
    comparisonSentence(evaluation),
    yearSentence,
    driverSentence(evaluation.definition, drivers),
    businessImpactSentence(evaluation),
    nextStepSentence(evaluation),
  ]
    .filter(Boolean)
    .join(' ')
    .concat(anomalySentence);
}
