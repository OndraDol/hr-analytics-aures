import { describe, expect, it } from 'vitest';
import { analyzeRecruitmentDriverGroups } from '@/lib/analytics/driver-analyzer';
import { evaluateKpi } from '@/lib/analytics/kpi-evaluator';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

describe('analyzeRecruitmentDriverGroups', () => {
  it('returns stage, channel, and role groups for recruitment KPI', async () => {
    const evaluation = await evaluateKpi(mockDataProvider, 'TTF', { period: PERIOD });
    const groups = await analyzeRecruitmentDriverGroups(mockDataProvider, evaluation);

    expect(groups.map((group) => group.dimension)).toEqual(['stage', 'channel', 'role']);
    expect(groups.every((group) => group.top.length > 0)).toBe(true);
  });

  it('returns no groups for non-recruitment KPI', async () => {
    const evaluation = await evaluateKpi(mockDataProvider, 'FLUCT', { period: PERIOD });
    const groups = await analyzeRecruitmentDriverGroups(mockDataProvider, evaluation);

    expect(groups).toHaveLength(0);
  });
});
