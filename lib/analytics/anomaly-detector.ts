import type { KpiAnomaly, KpiEvaluation } from './types';

const mean = (values: readonly number[]): number =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;

const stdDev = (values: readonly number[], average: number): number => {
  if (values.length <= 1) return 0;
  const variance =
    values.reduce((total, value) => total + (value - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

export function detectAnomaly(evaluation: KpiEvaluation): KpiAnomaly {
  const values = evaluation.sparkline.map((point) => point.value);
  const current = values.at(-1) ?? evaluation.value;
  const baseline = values.slice(0, -1);
  const average = mean(baseline);
  const deviation = stdDev(baseline, average);
  const zScore = deviation > 0 ? (current - average) / deviation : 0;
  const direction: KpiAnomaly['direction'] = zScore > 0.25 ? 'up' : zScore < -0.25 ? 'down' : 'flat';
  const isAnomaly = Math.abs(zScore) >= 2;

  return {
    isAnomaly,
    zScore,
    direction,
    messageCs: isAnomaly
      ? `Výrazná odchylka proti vlastní historii (z-score ${zScore.toFixed(1)}).`
      : 'Bez výrazné odchylky proti vlastní historii.',
  };
}
