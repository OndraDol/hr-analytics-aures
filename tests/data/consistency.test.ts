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

  it('returns divisions and departments', async () => {
    const [divs, depts] = await Promise.all([p.getDivisions(), p.getDepartments()]);
    expect(divs.length).toBeGreaterThan(0);
    expect(depts.length).toBeGreaterThan(0);
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

  it('returns workforce events within period', async () => {
    const events = await p.getWorkforceEvents({ from: '2024-01-01', to: '2024-12-31' });
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) expect(e.date >= '2024-01-01' && e.date <= '2024-12-31').toBe(true);
  });

  it('returns succession plans for critical positions', async () => {
    const plans = await p.getSuccessionPlans();
    expect(plans.length).toBeGreaterThan(0);
    for (const pl of plans) {
      expect(['ready_now', 'ready_1_2y', 'gap']).toContain(pl.readiness);
    }
  });
});
