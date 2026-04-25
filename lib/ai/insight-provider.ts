import insights from '@/content/ai-insights/kpi-insights.json';
import type { KpiEvaluation } from '@/lib/analytics/types';
import type { KpiCode, KpiStatus } from '@/lib/kpi/catalog';

export type AIInsightTone = 'risk' | 'watch' | 'positive' | 'hypothesis';

export interface AIInsight {
  code: KpiCode | '*';
  scenario: KpiStatus | 'anomaly';
  tone: AIInsightTone;
  textCs: string;
}

export interface AIInsightProvider {
  get(code: KpiCode, evaluation: KpiEvaluation): Promise<AIInsight>;
}

const allInsights = insights as AIInsight[];

export class MockAIInsightProvider implements AIInsightProvider {
  async get(code: KpiCode, evaluation: KpiEvaluation): Promise<AIInsight> {
    const scenario: AIInsight['scenario'] =
      evaluation.sparkline.length > 2 &&
      Math.abs((evaluation.trend.mom ?? 0) / Math.max(Math.abs(evaluation.value), 1)) > 0.25
        ? 'anomaly'
        : evaluation.status;

    return (
      allInsights.find((insight) => insight.code === code && insight.scenario === scenario) ??
      allInsights.find((insight) => insight.code === code && insight.scenario === evaluation.status) ??
      allInsights.find((insight) => insight.code === '*' && insight.scenario === scenario) ??
      allInsights.find((insight) => insight.code === '*' && insight.scenario === evaluation.status) ??
      allInsights[allInsights.length - 1]!
    );
  }
}

export const mockAIInsightProvider = new MockAIInsightProvider();
