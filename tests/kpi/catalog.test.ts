import { describe, it, expect } from 'vitest';
import { KPI_CATALOG, getKpiDefinition, type KpiDefinition } from '@/lib/kpi/catalog';
import { evaluateStatus } from '@/lib/analytics/kpi-evaluator';
import {
  evaluateThresholdDistance,
  getThresholdMetadata,
  getThresholdRationale,
  getThresholdScale,
} from '@/lib/kpi/thresholds';

describe('KPI_CATALOG', () => {
  it('contains all 20 target KPI definitions with unique codes', () => {
    const codes = KPI_CATALOG.map((definition) => definition.code);
    expect(KPI_CATALOG).toHaveLength(20);
    expect(new Set(codes).size).toBe(20);
  });

  it('contains Czech metadata and off-track actions for every KPI', () => {
    for (const definition of KPI_CATALOG as readonly KpiDefinition[]) {
      expect(definition.nameCs.length).toBeGreaterThan(0);
      expect(definition.definitionCs.length).toBeGreaterThan(0);
      expect(definition.formulaCs.length).toBeGreaterThan(0);
      expect(definition.actionIfOffTrackCs.length).toBeGreaterThan(0);
    }
  });

  it('uses a human-readable label for headcount context', () => {
    expect(getKpiDefinition('HR_STATS').nameCs).toBe('Stav zaměstnanců');
    expect(getKpiDefinition('HR_STATS').definitionCs).toContain('Kolik lidí');
  });

  it('evaluates up/down/target thresholds deterministically', () => {
    expect(evaluateStatus(getKpiDefinition('FLUCT'), 18)).toBe('green');
    expect(evaluateStatus(getKpiDefinition('FLUCT'), 30)).toBe('amber');
    expect(evaluateStatus(getKpiDefinition('FLUCT'), 31)).toBe('red');
    expect(evaluateStatus(getKpiDefinition('SUCCESSION'), 80)).toBe('green');
    expect(evaluateStatus(getKpiDefinition('CAP_KPI'), 96)).toBe('green');
    expect(getKpiDefinition('TTF').thresholds).toMatchObject({ green: 27, amber: 30, red: 32 });
    expect(getKpiDefinition('TTF_CRIT').thresholds).toMatchObject({ green: 30, amber: 33, red: 40 });
    expect(getKpiDefinition('CPH').thresholds).toMatchObject({ green: 16000, amber: 17000, red: 18000 });
    expect(getKpiDefinition('QUALITY_HIRE').thresholds).toMatchObject({ green: 32, amber: 30, red: 25 });
    expect(getKpiDefinition('ENPS').thresholds).toMatchObject({ green: 15, amber: 10, red: 5 });
  });

  it('builds threshold rationale and visualization bands for every KPI', () => {
    for (const definition of KPI_CATALOG as readonly KpiDefinition[]) {
      const metadata = getThresholdMetadata(definition);
      const rationale = getThresholdRationale(definition);
      const scale = getThresholdScale(definition, definition.thresholds.target ?? definition.thresholds.green);

      expect(metadata.reviewOwner.length).toBeGreaterThan(0);
      expect(rationale.length).toBeGreaterThan(30);
      expect(scale.bands.length).toBeGreaterThanOrEqual(3);
      expect(scale.currentPct).toBeGreaterThanOrEqual(0);
      expect(scale.currentPct).toBeLessThanOrEqual(100);
    }
  });

  it('describes distance to the relevant threshold', () => {
    const fluct = evaluateThresholdDistance(getKpiDefinition('FLUCT'), 34);
    const succession = evaluateThresholdDistance(getKpiDefinition('SUCCESSION'), 55);

    expect(fluct.messageCs).toContain('červený práh');
    expect(succession.messageCs).toContain('červený práh');
  });
});
