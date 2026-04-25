import { describe, expect, it } from 'vitest';
import { buildActionBacklog } from '@/lib/actions/action-backlog';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

describe('action backlog', () => {
  it('builds prioritized non-green KPI actions', async () => {
    const backlog = await buildActionBacklog(mockDataProvider, PERIOD);

    expect(backlog.items.length).toBeGreaterThan(0);
    expect(backlog.summary.total).toBe(backlog.items.length);
    expect(backlog.items.every((item) => item.status !== 'green')).toBe(true);
    expect(backlog.items.every((item) => item.owner.length > 0)).toBe(true);
    expect(backlog.items.every((item) => item.reasonCs.length > 20)).toBe(true);
    expect(backlog.items.every((item) => item.href.startsWith('/'))).toBe(true);
  });

  it('keeps the highest-ranked items first', async () => {
    const backlog = await buildActionBacklog(mockDataProvider, PERIOD);
    const first = backlog.items[0];
    const last = backlog.items.at(-1);

    expect(first).toBeDefined();
    expect(last).toBeDefined();
    expect(first!.impactScore).toBeGreaterThanOrEqual(last!.impactScore);
  });
});
