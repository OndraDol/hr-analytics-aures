import type { DataProvider, Period } from '@/lib/data/provider';
import { evaluateKpi } from '@/lib/analytics/kpi-evaluator';
import { detectHypotheses } from '@/lib/analytics/cross-kpi-correlator';
import { analyzeDrivers } from '@/lib/analytics/driver-analyzer';
import {
  comparisonSentence,
  driverSentence,
  formatPeriodHuman,
  statusHuman,
} from '@/lib/analytics/human-readable';
import type { CrossKpiHypothesis, KpiEvaluation } from '@/lib/analytics/types';
import { KPI_CATALOG, type KpiCode, type KpiStatus } from '@/lib/kpi/catalog';
import { SECTION_CATALOG, type SectionDefinition } from '@/lib/sections/catalog';

export interface ExecutiveAlert {
  code: KpiCode;
  rank: number;
  title: string;
  value: string;
  status: KpiStatus;
  priority: 1 | 2 | 3;
  delta: number;
  severityScore: number;
  thresholdDistanceCs: string;
  thresholdConfidenceCs: string;
  owner: string;
  ageDays: number;
  href: string;
  reasonCs: string;
  driverCs: string;
  comparisonCs: string;
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
  hypotheses: CrossKpiHypothesis[];
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

const alertFromEvaluation = async (
  provider: DataProvider,
  evaluation: KpiEvaluation,
): Promise<ExecutiveAlert> => {
  const drivers = await analyzeDrivers(provider, evaluation);
  const comparisonCs = comparisonSentence(evaluation);
  const driverCs = driverSentence(evaluation.definition, drivers);
  const reasonCs =
    evaluation.status === 'red'
      ? `${evaluation.definition.nameCs} je ${statusHuman(evaluation.status)} a potřebuje rozhodnutí vlastníka. ${comparisonCs} ${driverCs}`
      : `${evaluation.definition.nameCs} je ${statusHuman(evaluation.status)}. ${comparisonCs} ${driverCs}`;

  return {
    code: evaluation.code,
    rank: 0,
    title: evaluation.definition.nameCs,
    value: evaluation.formattedValue,
    status: evaluation.status,
    priority: evaluation.definition.priority,
    delta: evaluation.trend.mom ?? 0,
    severityScore: evaluation.severityScore,
    thresholdDistanceCs: evaluation.thresholdDistance.messageCs,
    thresholdConfidenceCs: evaluation.thresholdMetadata.confidence,
    owner: evaluation.definition.owner,
    ageDays: ageDaysFor(evaluation),
    href: sectionHrefForKpi(evaluation.code),
    reasonCs,
    driverCs,
    comparisonCs,
  };
};

const rankAlert = (alert: ExecutiveAlert): number =>
  alert.severityScore + (4 - alert.priority) * 6 + Math.min(Math.abs(alert.delta), 12);

const ageDaysFor = (evaluation: KpiEvaluation): number => {
  const trend = Math.abs(evaluation.trend.mom ?? 0);
  if (evaluation.status === 'red') return Math.max(4, Math.round(18 - Math.min(trend, 12)));
  if (evaluation.status === 'amber') return Math.max(7, Math.round(28 - Math.min(trend, 10)));
  return 0;
};

const withRanks = (alerts: ExecutiveAlert[]): ExecutiveAlert[] =>
  alerts.map((alert, index) => ({ ...alert, rank: index + 1 }));

const healthLabel = (score: number): string => {
  if (score >= 75) return 'Dobrý stav';
  if (score >= 55) return 'Vyžaduje pozornost';
  return 'Kritické';
};

const aiSummary = (score: number, alerts: ExecutiveAlert[], period: Period): string => {
  const lead = healthLabel(score).toLowerCase();
  const top = alerts[0];
  if (!top) {
    return 'Organizace je v aktuálním měsíci bez výrazného varování. HR může držet běžný měsíční rytmus kontroly a sledovat, jestli se nemění stav lidí v klíčových divizích.';
  }
  return `Celkový HR health score ukazuje ${lead}. Největší téma za ${formatPeriodHuman(period)} je ${top.title}: ${top.comparisonCs} ${top.driverCs} Doporučení pro HR: otevřít detail, potvrdit vlastníka a převést signál do jedné konkrétní akce.`;
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
  const alerts = (
    await Promise.all(
      allEvaluations
        .filter((evaluation) => evaluation.status !== 'green')
        .map((evaluation) => alertFromEvaluation(provider, evaluation)),
    )
  ).sort((a, b) => rankAlert(b) - rankAlert(a));
  const improvements = allEvaluations
    .filter((evaluation) => isImproving(evaluation))
    .slice(0, 3);
  const improvementAlerts = await Promise.all(
    improvements.map((evaluation) => alertFromEvaluation(provider, evaluation)),
  );
  const problems = alerts.filter((alert) => alert.status === 'red').slice(0, 3);
  const watch = alerts.filter((alert) => alert.status === 'amber').slice(0, 3);
  const heroCodes: KpiCode[] = ['HR_STATS', 'FLUCT', 'ENPS'];

  return {
    period,
    healthScore,
    healthLabel: healthLabel(healthScore),
    heroKpis: heroCodes.map((code) => allEvaluations.find((evaluation) => evaluation.code === code)!),
    topAlerts: withRanks(alerts.slice(0, 5)),
    changes: { improvements: improvementAlerts, problems, watch },
    hypotheses: detectHypotheses(allEvaluations),
    sectionScorecards: SECTION_CATALOG.map((section) => ({
      section,
      evaluation: allEvaluations.find((evaluation) => evaluation.code === section.primaryKpi)!,
    })),
    aiSummaryCs: aiSummary(healthScore, alerts, period),
    allEvaluations,
  };
}
