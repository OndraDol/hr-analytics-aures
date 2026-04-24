import type { Period, CommonFilter } from '@/lib/data/provider';
import type { Country } from '@/lib/types';
import { MockDataProvider } from '@/lib/data/mock-provider';
import { KPIService } from '@/lib/kpi/kpi-service';
import { mockAIInsightProvider } from '@/lib/kpi/ai-insight-provider';
import type { KPISnapshot, ExecutiveSummary } from '@/lib/kpi/types';

const provider = new MockDataProvider();
const service = new KPIService(provider, mockAIInsightProvider);

export const DEFAULT_PERIOD: Period = { from: '2025-01-01', to: '2025-12-31' };
export const DEFAULT_PREV: Period   = { from: '2024-01-01', to: '2024-12-31' };

function buildFilter(country?: Country | 'ALL', divisionIds?: string[]): CommonFilter | undefined {
  const f: CommonFilter = {};
  if (country && country !== 'ALL') f.country = country;
  if (divisionIds?.length) f.divisionIds = divisionIds;
  return Object.keys(f).length ? f : undefined;
}

export async function getExecutiveSummary(
  country?: Country | 'ALL',
  divisionIds?: string[],
): Promise<ExecutiveSummary> {
  return service.getExecutiveSummary(DEFAULT_PERIOD, buildFilter(country, divisionIds));
}

export async function getAllSnapshots(
  country?: Country | 'ALL',
  divisionIds?: string[],
): Promise<KPISnapshot[]> {
  return service.getSnapshot(DEFAULT_PERIOD, buildFilter(country, divisionIds), DEFAULT_PREV);
}

export async function getAlerts(
  country?: Country | 'ALL',
  divisionIds?: string[],
): Promise<KPISnapshot[]> {
  return service.getAlerts(DEFAULT_PERIOD, buildFilter(country, divisionIds));
}

export async function getSectionSnapshots(
  section: string,
  country?: Country | 'ALL',
): Promise<KPISnapshot[]> {
  const all = await service.getSnapshot(DEFAULT_PERIOD, buildFilter(country), DEFAULT_PREV);
  return all.filter((s) => s.kpiValue.definition.section === section);
}

export async function getKPIHistory(kpiId: string, months = 12): Promise<Array<{ period: string; value: number }>> {
  const history = await service.getHistory(kpiId, months);
  return history.map((h) => ({ period: h.period, value: h.value }));
}
