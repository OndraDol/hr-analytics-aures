import { describe, it, expect } from 'vitest';
import { FixtureDataProvider } from './fixture-provider';
import { detectAnomaly } from '@/lib/analytics/anomaly-detector';
import { buildKpiCardModel } from '@/lib/analytics/kpi-engine';
import { evaluateKpi } from '@/lib/analytics/kpi-evaluator';
import { MockAIInsightProvider } from '@/lib/ai/insight-provider';

const provider = new FixtureDataProvider();
const period = { from: '2025-01-01', to: '2025-01-31' };

describe('evaluateKpi', () => {
  it('evaluates attrition from workforce events and active headcount', async () => {
    const evaluation = await evaluateKpi(provider, 'FLUCT', { period });

    expect(evaluation.value).toBeGreaterThan(30);
    expect(evaluation.status).toBe('red');
    expect(evaluation.sparkline).toHaveLength(12);
  });

  it('evaluates recruitment TTF from requisition dates', async () => {
    const evaluation = await evaluateKpi(provider, 'TTF', { period });

    expect(evaluation.value).toBe(30);
    expect(evaluation.status).toBe('amber');
  });

  it('evaluates eNPS from survey responses', async () => {
    const evaluation = await evaluateKpi(provider, 'ENPS', { period });

    expect(evaluation.value).toBe(8.5);
    expect(evaluation.status).toBe('amber');
  });
});

describe('detectAnomaly', () => {
  it('flags strong deviation from sparkline history', async () => {
    const evaluation = await evaluateKpi(provider, 'FLUCT', { period });
    evaluation.sparkline = [
      { period: '2024-02', value: 2 },
      { period: '2024-03', value: 2 },
      { period: '2024-04', value: 3 },
      { period: '2024-05', value: 2 },
      { period: '2024-06', value: 40 },
    ];

    const anomaly = detectAnomaly(evaluation);
    expect(anomaly.isAnomaly).toBe(true);
    expect(anomaly.direction).toBe('up');
  });
});

describe('buildKpiCardModel', () => {
  it('builds a full card-ready analytical model', async () => {
    const model = await buildKpiCardModel(provider, 'FLUCT', { period }, new MockAIInsightProvider());

    expect(model.evaluation.status).toBe('red');
    expect(model.drivers.length).toBeGreaterThan(0);
    expect(model.narrativeCs).toContain('Fluktuace');
    expect(model.action.severity).toBe('red');
    expect(model.aiInsight?.textCs.length).toBeGreaterThan(0);
  });
});
