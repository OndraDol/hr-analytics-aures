import { describe, it, expect } from 'vitest';
import { MockDataProvider } from '@/lib/data/mock-provider';

describe('MockDataProvider smoke', () => {
  const provider = new MockDataProvider();

  it('returns employees', async () => {
    const employees = await provider.getEmployees();
    expect(employees.length).toBeGreaterThan(0);
  });

  it('returns positions', async () => {
    const positions = await provider.getPositions();
    expect(positions.length).toBeGreaterThan(0);
  });

  it('returns payroll filtered by period', async () => {
    const payroll = await provider.getPayroll({ from: '2025-01-01', to: '2025-03-31' });

    expect(payroll.length).toBeGreaterThan(0);
    expect(
      payroll.every((row) => row.month >= '2025-01-01' && row.month <= '2025-03-31'),
    ).toBe(true);
  });

  it('returns eNPS for a cycle', async () => {
    const responses = await provider.getEnpsResponses('2025-Q4');

    expect(responses.length).toBeGreaterThan(0);
    expect(responses.every((response) => response.cycle === '2025-Q4')).toBe(true);
  });
});
