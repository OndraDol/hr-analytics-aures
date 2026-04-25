import type { DataProvider, Period } from '@/lib/data/provider';
import { evaluateKpi } from '@/lib/analytics/kpi-evaluator';
import type { KpiEvaluation } from '@/lib/analytics/types';
import { KPI_CATALOG, type KpiCode, type KpiStatus } from '@/lib/kpi/catalog';
import { SECTION_CATALOG, type SectionDefinition } from '@/lib/sections/catalog';

export interface ExecutiveAlert {
  code: KpiCode;
  title: string;
  value: string;
  status: KpiStatus;
  priority: 1 | 2 | 3;
  delta: number;
  severityScore: number;
  thresholdDistanceCs: string;
  thresholdConfidenceCs: string;
  href: string;
  reasonCs: string;
}

export interface ExecutiveChangeGroup {
  improvements: ExecutiveAlert[];
  problems: ExecutiveAlert[];
  watch: ExecutiveAlert[];
}

export interface SectionScorecard {
  section: SectionDefinition;
  evaluation: KpiEvaluation;
}

export interface ExecutiveDashboardData {
  period: Period;
  healthScore: number;
  healthLabel: string;
  heroKpis: KpiEvaluation[];
  topAlerts: ExecutiveAlert[];
  changes: ExecutiveChangeGroup;
  sectionScorecards: SectionScorecard[];
  aiSummaryCs: string;
  allEvaluations: KpiEvaluation[];
}

const PRIORITY_WEIGHT: Record<1 | 2 | 3, number> = { 1: 3, 2: 2, 3: 1 };

const sectionHrefForKpi = (code: KpiCode): string => {
  const section = SECTION_CATALOG.find(
    (item) => item.primaryKpi === code || item.secondaryKpis.includes(code),
  );
  return section?.href ?? '/';
};

const isImproving = (evaluation: KpiEvaluation): boolean => {
  const delta = evaluation.trend.mom ?? 0;
  if (Math.abs(delta) < 0.01) return false;
  if (evaluation.definition.direction === 'down') return delta < 0;
  if (evaluation.definition.direction === 'up') return delta > 0;
  return Math.abs(evaluation.deltaVsTarget ?? 0) < Math.abs((evaluation.deltaVsTarget ?? 0) - delta);
};

const alertFromEvaluation = (evaluation: KpiEvaluation): ExecutiveAlert => ({
  code: evaluation.code,
  title: evaluation.definition.nameCs,
  value: evaluation.formattedValue,
  status: evaluation.status,
  priority: evaluation.definition.priority,
  delta: evaluation.trend.mom ?? 0,
  severityScore: evaluation.severityScore,
  thresholdDistanceCs: evaluation.thresholdDistance.messageCs,
  thresholdConfidenceCs: evaluation.thresholdMetadata.confidence,
  href: sectionHrefForKpi(evaluation.code),
  reasonCs:
    evaluation.status === 'red'
      ? `${evaluation.definition.nameCs} je mimo toleranci (${evaluation.thresholdDistance.messageCs}) a vyžaduje vlastníka akce.`
      : `${evaluation.definition.nameCs} se posunula proti minulému období o ${Math.abs(
          evaluation.trend.mom ?? 0,
        ).toFixed(1)}. ${evaluation.thresholdDistance.messageCs}.`,
});

const rankAlert = (alert: ExecutiveAlert): number =>
  alert.severityScore + (4 - alert.priority) * 6 + Math.min(Math.abs(alert.delta), 12);

const healthLabel = (score: number): string => {
  if (score >= 75) return 'Dobrý stav';
  if (score >= 55) return 'Vyžaduje pozornost';
  return 'Kritické';
};

const aiSummary = (score: number, alerts: ExecutiveAlert[]): string => {
  const lead = healthLabel(score).toLowerCase();
  const top = alerts[0];
  if (!top) {
    return 'HR metriky jsou stabilní a bez výrazného varování. Dashboard doporučuje držet současný rytmus měsíční kontroly a sledovat změny v klíčových segmentech.';
  }
  return `Celkový HR health score ukazuje ${lead}. Největší pozornost teď vyžaduje ${top.title}, kde dashboard doporučuje rozpad podle divizí a rychlé potvrzení vlastníka akce.`;
};

export async function buildExecutiveDashboard(
  provider: DataProvider,
  period: Period,
): Promise<ExecutiveDashboardData> {
  const allEvaluations = await Promise.all(
    KPI_CATALOG.map((definition) => evaluateKpi(provider, definition.code, { period })),
  );
  const totalWeight = allEvaluations.reduce(
    (total, evaluation) => total + PRIORITY_WEIGHT[evaluation.definition.priority],
    0,
  );
  const weightedRisk = allEvaluations.reduce(
    (total, evaluation) =>
      total + evaluation.severityScore * PRIORITY_WEIGHT[evaluation.definition.priority],
    0,
  );
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - weightedRisk / totalWeight)));
  const alerts = allEvaluations
    .filter((evaluation) => evaluation.status !== 'green')
    .map(alertFromEvaluation)
    .sort((a, b) => rankAlert(b) - rankAlert(a));
  const improvements = allEvaluations
    .filter((evaluation) => isImproving(evaluation))
    .map(alertFromEvaluation)
    .slice(0, 3);
  const problems = alerts.filter((alert) => alert.status === 'red').slice(0, 3);
  const watch = alerts.filter((alert) => alert.status === 'amber').slice(0, 3);
  const heroCodes: KpiCode[] = ['HR_STATS', 'FLUCT', 'ENPS'];

  return {
    period,
    healthScore,
    healthLabel: healthLabel(healthScore),
    heroKpis: heroCodes.map((code) => allEvaluations.find((evaluation) => evaluation.code === code)!),
    topAlerts: alerts.slice(0, 5),
    changes: { improvements, problems, watch },
    sectionScorecards: SECTION_CATALOG.map((section) => ({
      section,
      evaluation: allEvaluations.find((evaluation) => evaluation.code === section.primaryKpi)!,
    })),
    aiSummaryCs: aiSummary(healthScore, alerts),
    allEvaluations,
  };
}
