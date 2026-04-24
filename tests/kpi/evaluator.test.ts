import { describe, it, expect, beforeAll } from 'vitest';
import { MockDataProvider } from '@/lib/data/mock-provider';
import { KPIEvaluator } from '@/lib/kpi/evaluator';

const PERIOD = { from: '2025-01-01', to: '2025-12-31' };
const PREV = { from: '2024-01-01', to: '2024-12-31' };
let evaluator: KPIEvaluator;

beforeAll(() => {
  evaluator = new KPIEvaluator(new MockDataProvider());
});

describe('KPIEvaluator — headcount', () => {
  it('returns positive headcount', async () => {
    const v = await evaluator.evaluate('headcount', PERIOD);
    expect(v.value).toBeGreaterThan(0);
  });

  it('assigns a valid status', async () => {
    const v = await evaluator.evaluate('headcount', PERIOD);
    expect(['green', 'acceptable', 'red', 'no_data']).toContain(v.status);
  });

  it('has definition attached', async () => {
    const v = await evaluator.evaluate('headcount', PERIOD);
    expect(v.definition.id).toBe('headcount');
  });
});

describe('KPIEvaluator — fluctuation_rate', () => {
  it('returns a percentage value', async () => {
    const v = await evaluator.evaluate('fluctuation_rate', PERIOD);
    expect(v.value).toBeGreaterThanOrEqual(0);
    expect(v.value).toBeLessThan(200);
  });
});

describe('KPIEvaluator — cap_kpi', () => {
  it('returns ratio between 0 and 1.5', async () => {
    const v = await evaluator.evaluate('cap_kpi', PERIOD);
    expect(v.value).toBeGreaterThanOrEqual(0);
    expect(v.value).toBeLessThan(1.5);
  });
});

describe('KPIEvaluator — succession_rate', () => {
  it('returns percentage 0–100', async () => {
    const v = await evaluator.evaluate('succession_rate', PERIOD);
    expect(v.value).toBeGreaterThanOrEqual(0);
    expect(v.value).toBeLessThanOrEqual(100);
  });
});

describe('KPIEvaluator — enps', () => {
  it('returns score -100 to 100', async () => {
    const v = await evaluator.evaluate('enps', PERIOD);
    expect(v.value).toBeGreaterThanOrEqual(-100);
    expect(v.value).toBeLessThanOrEqual(100);
  });
});

describe('KPIEvaluator — evaluateAll', () => {
  it('returns results for all 22 KPI', async () => {
    const all = await evaluator.evaluateAll(PERIOD);
    expect(all.length).toBe(22);
  });

  it('MoM delta is populated when previousPeriod provided', async () => {
    const all = await evaluator.evaluateAll(PERIOD, undefined, PREV);
    const withDelta = all.filter((v) => v.momDelta !== null);
    expect(withDelta.length).toBeGreaterThan(0);
  });
});
