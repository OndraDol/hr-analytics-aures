import type { KpiAnomaly, KpiDriver, KpiEvaluation } from './types';

const statusPhrase = {
  green: 'je v zeleném pásmu',
  amber: 'vyžaduje sledování',
  red: 'je mimo toleranci',
} as const;

const trendPhrase = (value: number | null): string => {
  if (value == null || Math.abs(value) < 0.001) return 'beze změny proti minulému období';
  const direction = value > 0 ? 'vzrostla' : 'klesla';
  return `${direction} o ${Math.abs(value).toFixed(1)} proti minulému období`;
};

export function generateNarrative(
  evaluation: KpiEvaluation,
  drivers: readonly KpiDriver[],
  anomaly: KpiAnomaly,
): string {
  const lead = `${evaluation.definition.nameCs} ${statusPhrase[evaluation.status]}: aktuálně ${evaluation.formattedValue}, ${trendPhrase(
    evaluation.trend.mom,
  )}.`;
  const topDriver = drivers[0];
  const driverSentence = topDriver
    ? `Hlavní příčina změny je ${topDriver.label} (hodnota ${topDriver.value.toFixed(1)}, delta ${topDriver.delta.toFixed(1)}).`
    : 'Pro aktuální filtr není dostupný jednoznačný driver.';
  const anomalySentence = anomaly.isAnomaly ? ` ${anomaly.messageCs}` : '';

  return `${lead} ${driverSentence}${anomalySentence}`;
}
