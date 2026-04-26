import { describe, expect, it } from 'vitest';
import { detectHypotheses } from '@/lib/analytics/cross-kpi-correlator';
import type { KpiEvaluation } from '@/lib/analytics/types';
import { getKpiDefinition } from '@/lib/kpi/catalog';

function evaluation(code: 'FLUCT' | 'ENPS', status: 'green' | 'amber' | 'red', mom: number): KpiEvaluation {
  return {
    code,
    definition: getKpiDefinition(code),
    status,
    trend: { previousValue: 0, mom, yoy: null },
  } as KpiEvaluation;
}

describe('detectHypotheses', () => {
  it('creates a strong hypothesis for paired red KPI moving in the same direction', () => {
    const hypotheses = detectHypotheses([
      evaluation('FLUCT', 'red', 3),
      evaluation('ENPS', 'red', 2),
    ]);

    expect(hypotheses).toHaveLength(1);
    expect(hypotheses[0]!.kpis).toEqual(['FLUCT', 'ENPS']);
    expect(hypotheses[0]!.strength).toBe('strong');
  });

  it('does not create a hypothesis when one KPI is green', () => {
    const hypotheses = detectHypotheses([
      evaluation('FLUCT', 'red', 3),
      evaluation('ENPS', 'green', 2),
    ]);

    expect(hypotheses).toHaveLength(0);
  });
});
