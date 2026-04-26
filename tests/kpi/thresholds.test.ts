import { describe, expect, it } from 'vitest';
import { getKpiDefinition } from '@/lib/kpi/catalog';
import { calculateSeverityScore } from '@/lib/kpi/thresholds';

describe('calculateSeverityScore', () => {
  it('returns score with explainable additive breakdown', () => {
    const definition = getKpiDefinition('FLUCT_CRIT');
    const result = calculateSeverityScore(definition, 12, 'red', 2.5, 'hybrid');
    const total =
      result.breakdown.statusBase +
      result.breakdown.priorityBoost +
      result.breakdown.qualityPenalty +
      result.breakdown.trendBoost +
      result.breakdown.distanceBoost;

    expect(result.score).toBe(Math.round(Math.min(100, Math.max(0, total))));
    expect(result.breakdown.statusBase).toBe(75);
    expect(result.breakdown.priorityBoost).toBeGreaterThan(0);
    expect(result.breakdown.qualityPenalty).toBeLessThan(0);
  });

  it('caps the final score into the 0-100 range', () => {
    const definition = getKpiDefinition('TTF');
    const result = calculateSeverityScore(definition, 90, 'red', 40, 'real');

    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
