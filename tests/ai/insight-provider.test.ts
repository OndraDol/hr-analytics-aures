import { describe, it, expect } from 'vitest';
import { MockAIInsightProvider } from '@/lib/ai/insight-provider';
import { evaluateKpi } from '@/lib/analytics/kpi-evaluator';
import { FixtureDataProvider } from '@/tests/analytics/fixture-provider';

describe('MockAIInsightProvider', () => {
  it('returns a specific insight when code and scenario match', async () => {
    const provider = new FixtureDataProvider();
    const evaluation = await evaluateKpi(provider, 'FLUCT_CRIT', {
      period: { from: '2025-01-01', to: '2025-01-31' },
    });

    const insight = await new MockAIInsightProvider().get('FLUCT_CRIT', evaluation);
    expect(insight.code).toBe('FLUCT_CRIT');
    expect(insight.textCs).toContain('klíčových');
  });
});
