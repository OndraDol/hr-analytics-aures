import { describe, it, expect } from 'vitest';
import { MockDataProvider } from '@/lib/data/mock-provider';

describe('MockDataProvider smoke', () => {
  const p = new MockDataProvider();

  it('returns employees', async () => {
    const emps = await p.getEmployees();
    expect(emps.length).toBeGreaterThan(0);
  });

  it('returns positions', async () => {
    const pos = await p.getPositions();
    expect(pos.length).toBeGreaterThan(0);
  });

  it('returns payroll filtered by period', async () => {
    const payroll = await p.getPayroll({ from: '2025-01-01', to: '2025-03-31' });
    expect(payroll.length).toBeGreaterThan(0);
    for (const r of payroll) {
      expect(r.month >= '2025-01-01' && r.month <= '2025-03-31').toBe(true);
    }
  });

  it('returns eNPS for given cycle', async () => {
    const resp = await p.getEnpsResponses('2025-Q4');
    expect(resp.length).toBeGreaterThan(0);
    for (const r of resp) expect(r.cycle).toBe('2025-Q4');
  });
});
