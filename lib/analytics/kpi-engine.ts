import type { DataProvider } from '@/lib/data/provider';
import type { AIInsightProvider, AIInsight } from '@/lib/ai/insight-provider';
import type { KpiCode } from '@/lib/kpi/catalog';
import { detectAnomaly } from './anomaly-detector';
import { recommendAction } from './action-recommender';
import { analyzeDrivers, analyzeRecruitmentDriverGroups } from './driver-analyzer';
import { evaluateKpi } from './kpi-evaluator';
import { generateNarrative } from './narrative-generator';
import type {
  KpiActionRecommendation,
  KpiAnomaly,
  KpiDriver,
  KpiDriverGroup,
  KpiEvaluation,
  KpiEvaluationContext,
} from './types';

export interface KpiCardModel {
  evaluation: KpiEvaluation;
  drivers: KpiDriver[];
  driverGroups: KpiDriverGroup[];
  anomaly: KpiAnomaly;
  severityBreakdown: KpiEvaluation['severityBreakdown'];
  narrativeCs: string;
  action: KpiActionRecommendation;
  aiInsight: AIInsight | null;
}

export async function buildKpiCardModel(
  provider: DataProvider,
  code: KpiCode,
  context: KpiEvaluationContext,
  aiProvider?: AIInsightProvider,
): Promise<KpiCardModel> {
  const evaluation = await evaluateKpi(provider, code, context);
  const drivers = await analyzeDrivers(provider, evaluation);
  const driverGroups = await analyzeRecruitmentDriverGroups(provider, evaluation);
  const anomaly = detectAnomaly(evaluation);
  const narrativeCs = generateNarrative(evaluation, drivers, anomaly);
  const action = recommendAction(evaluation, drivers);
  const aiInsight = aiProvider ? await aiProvider.get(code, evaluation) : null;

  return {
    evaluation,
    drivers,
    driverGroups,
    anomaly,
    severityBreakdown: evaluation.severityBreakdown,
    narrativeCs,
    action,
    aiInsight,
  };
}
