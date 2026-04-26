import { describe, expect, it } from 'vitest';
import { buildExecutiveBriefing } from '@/lib/briefing/executive-briefing';
import { mockDataProvider } from '@/lib/data/mock-provider';
import { SECTION_CATALOG } from '@/lib/sections/catalog';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

describe('executive briefing', () => {
  it('builds a printable executive briefing view model', async () => {
    const briefing = await buildExecutiveBriefing(mockDataProvider, PERIOD);
    const statusTotal =
      briefing.statusCounts.green + briefing.statusCounts.amber + briefing.statusCounts.red;

    expect(briefing.projectProgress.percent).toBe(100);
    expect(briefing.dashboard.healthScore).toBeGreaterThanOrEqual(0);
    expect(briefing.dashboard.topAlerts.length).toBeGreaterThan(0);
    expect(briefing.dashboard.sectionScorecards).toHaveLength(SECTION_CATALOG.length);
    expect(statusTotal).toBe(briefing.dashboard.allEvaluations.length);
    expect(briefing.generatedLabelCs).toContain('Q1 2026');
    expect(briefing.coverData.titleCs).toBe('Executive briefing Q1 2026');
    expect(briefing.pages.length).toBeGreaterThan(0);
  });
});
