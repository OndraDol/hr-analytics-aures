import type { KPIStatus, AIInsight } from './types';
import insightsData from './ai-insights.json';

type InsightsMap = Record<string, Record<string, string[]>>;

export interface AIInsightProvider {
  getInsight(kpiId: string, status: KPIStatus): Promise<AIInsight | null>;
}

// Deterministický výběr z pole variant (index = hash(kpiId + status + date))
function pickVariant(variants: string[], kpiId: string, status: string): string {
  let hash = 0;
  const key = `${kpiId}:${status}:2026-03`;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) >>> 0;
  }
  return variants[hash % variants.length]!;
}

export class MockAIInsightProvider implements AIInsightProvider {
  private readonly insights: InsightsMap = insightsData as InsightsMap;

  async getInsight(kpiId: string, status: KPIStatus): Promise<AIInsight | null> {
    if (status === 'no_data') return null;
    const kpiInsights = this.insights[kpiId];
    if (!kpiInsights) return null;
    const variants = kpiInsights[status] ?? kpiInsights['green'];
    if (!variants || variants.length === 0) return null;

    return {
      kpiId,
      text: pickVariant(variants, kpiId, status),
      generatedAt: '2026-03-31',
    };
  }
}

// Singleton pro aplikaci
export const mockAIInsightProvider = new MockAIInsightProvider();
