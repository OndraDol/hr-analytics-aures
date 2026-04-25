import { describe, it, expect } from 'vitest';
import { KPI_CATALOG, getKpiDefinition } from '@/lib/kpi/catalog';
import { evaluateStatus } from '@/lib/analytics/kpi-evaluator';

describe('KPI_CATALOG', () => {
  it('contains all 20 target KPI definitions with unique codes', () => {
    const codes = KPI_CATALOG.map((definition) => definition.code);
    expect(KPI_CATALOG).toHaveLength(20);
    expect(new Set(codes).size).toBe(20);
  });

  it('contains Czech metadata and off-track actions for every KPI', () => {
    for (const definition of KPI_CATALOG) {
      expect(definition.nameCs.length).toBeGreaterThan(0);
      expect(definition.definitionCs.length).toBeGreaterThan(0);
      expect(definition.formulaCs.length).toBeGreaterThan(0);
      expect(definition.actionIfOffTrackCs.length).toBeGreaterThan(0);
    }
  });

  it('evaluates up/down/target thresholds deterministically', () => {
    expect(evaluateStatus(getKpiDefinition('FLUCT'), 18)).toBe('green');
    expect(evaluateStatus(getKpiDefinition('FLUCT'), 30)).toBe('red');
    expect(evaluateStatus(getKpiDefinition('SUCCESSION'), 88)).toBe('green');
    expect(evaluateStatus(getKpiDefinition('CAP_KPI'), 96)).toBe('green');
  });
});
