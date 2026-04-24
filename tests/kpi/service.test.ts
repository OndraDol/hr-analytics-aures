import { describe, it, expect, beforeAll } from 'vitest';
import { MockDataProvider } from '@/lib/data/mock-provider';
import { mockAIInsightProvider } from '@/lib/kpi/ai-insight-provider';
import { KPIService } from '@/lib/kpi/kpi-service';

const PERIOD = { from: '2025-01-01', to: '2025-12-31' };
let service: KPIService;

beforeAll(() => {
  service = new KPIService(new MockDataProvider(), mockAIInsightProvider);
});

describe('KPIService — getSnapshot', () => {
  it('returns snapshot for all KPI', async () => {
    const snapshots = await service.getSnapshot(PERIOD);
    expect(snapshots.length).toBe(22);
  });

  it('each snapshot has narrative text', async () => {
    const snapshots = await service.getSnapshot(PERIOD);
    for (const s of snapshots) {
      expect(s.narrative.text.length).toBeGreaterThan(5);
    }
  });

  it('each snapshot has action recommendation', async () => {
    const snapshots = await service.getSnapshot(PERIOD);
    for (const s of snapshots) {
      expect(s.action.action.length).toBeGreaterThan(0);
      expect(['immediate', 'monitor', 'scheduled']).toContain(s.action.priority);
    }
  });

  it('AI insight is provided for known KPI', async () => {
    const snapshots = await service.getSnapshot(PERIOD);
    const hasInsight = snapshots.some((s) => s.aiInsight !== null);
    expect(hasInsight).toBe(true);
  });
});

describe('KPIService — getAlerts', () => {
  it('returns only red and acceptable KPI', async () => {
    const alerts = await service.getAlerts(PERIOD);
    for (const a of alerts) {
      expect(['red', 'acceptable']).toContain(a.kpiValue.status);
    }
  });
});

describe('KPIService — getExecutiveSummary', () => {
  it('returns health score 0–100', async () => {
    const summary = await service.getExecutiveSummary(PERIOD);
    expect(summary.healthScore).toBeGreaterThanOrEqual(0);
    expect(summary.healthScore).toBeLessThanOrEqual(100);
  });

  it('counts add up to total KPI count', async () => {
    const summary = await service.getExecutiveSummary(PERIOD);
    const total = summary.redCount + summary.acceptableCount + summary.greenCount;
    expect(total).toBe(22);
  });

  it('has non-empty AI executive summary text', async () => {
    const summary = await service.getExecutiveSummary(PERIOD);
    expect(summary.aiExecutiveSummary.length).toBeGreaterThan(10);
  });
});

describe('KPIService — getHistory', () => {
  it('returns up to N monthly data points', async () => {
    const history = await service.getHistory('fluctuation_rate', 6);
    expect(history.length).toBeGreaterThan(0);
    expect(history.length).toBeLessThanOrEqual(6);
  });
});
