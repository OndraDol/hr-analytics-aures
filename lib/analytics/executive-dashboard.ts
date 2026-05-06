import type { DataProvider, Period } from '@/lib/data/provider';
import { evaluateKpi } from '@/lib/analytics/kpi-evaluator';
import { detectHypotheses } from '@/lib/analytics/cross-kpi-correlator';
import { analyzeDrivers } from '@/lib/analytics/driver-analyzer';
import { formatDivisionLabel, formatEmployeeName } from '@/lib/analytics/format';
import {
  comparisonSentence,
  driverSentence,
  formatPeriodHuman,
  statusHuman,
} from '@/lib/analytics/human-readable';
import type { CrossKpiHypothesis, KpiEvaluation } from '@/lib/analytics/types';
import { KPI_CATALOG, type KpiCode, type KpiStatus } from '@/lib/kpi/catalog';
import { SECTION_CATALOG, type SectionDefinition } from '@/lib/sections/catalog';
import { ownerLabel } from '@/lib/team/owners-map';

export interface PeoplePreview {
  name: string;
  role: string;
  division: string;
  context: string;
}

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
  peoplePreview: PeoplePreview[];
  peopleTotalCount: number;
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
  const { preview, total } = await peoplePreviewFor(provider, evaluation);

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
    owner: ownerLabel(evaluation.definition.owner),
    ageDays: ageDaysFor(evaluation),
    href: sectionHrefForKpi(evaluation.code),
    reasonCs,
    driverCs,
    comparisonCs,
    peoplePreview: preview,
    peopleTotalCount: total,
  };
};

async function peoplePreviewFor(
  provider: DataProvider,
  evaluation: KpiEvaluation,
): Promise<{ preview: PeoplePreview[]; total: number }> {
  const code = evaluation.code;
  const wantsLeavers = code === 'FLUCT' || code === 'FLUCT_CRIT' || code === 'WF_MOVEMENT';
  const wantsSuccession = code === 'SUCCESSION';
  if (!wantsLeavers && !wantsSuccession) return { preview: [], total: 0 };

  const [employees, divisions, positions] = await Promise.all([
    provider.getEmployees(),
    provider.getDivisions(),
    provider.getPositions(),
  ]);
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const divisionLabelById = new Map(
    divisions.map((division) => [division.id, formatDivisionLabel(division.name)]),
  );
  const positionById = new Map(positions.map((position) => [position.id, position]));

  if (wantsLeavers) {
    const events = await provider.getWorkforceEvents(evaluation.period);
    const leaverEvents = events.filter((event) => event.type === 'terminate');
    const leavers = leaverEvents
      .map((event) => employeeById.get(event.employeeId))
      .filter((employee): employee is NonNullable<typeof employee> => Boolean(employee));
    const filtered =
      code === 'FLUCT_CRIT'
        ? leavers.filter((employee) => employee.criticalPositionFlag)
        : leavers;
    const sorted = [...filtered].sort((a, b) => {
      const aDate = a.terminationDate ?? '';
      const bDate = b.terminationDate ?? '';
      return bDate.localeCompare(aDate);
    });
    const previews = sorted.slice(0, 2).map((employee) => ({
      name: formatEmployeeName(employee),
      role: positionById.get(employee.positionId)?.title ?? employee.positionId,
      division: divisionLabelById.get(employee.divisionId) ?? employee.divisionId,
      context: employee.terminationDate ? `odešel ${employee.terminationDate}` : 'odchod v tomto období',
    }));
    return { preview: previews, total: sorted.length };
  }

  // succession — top kritické pozice bez nástupce, s jménem incumbenta
  const plans = await provider.getSuccessionPlans();
  const planByPosition = new Map(plans.map((plan) => [plan.criticalPositionId, plan]));
  const gaps = positions.filter((position) => {
    if (!position.criticalFlag) return false;
    const plan = planByPosition.get(position.id);
    return !plan || plan.readiness === 'gap' || !plan.successorEmployeeId;
  });
  const previews = gaps.slice(0, 2).map((position) => {
    const plan = planByPosition.get(position.id);
    const incumbent = plan?.incumbentEmployeeId ? employeeById.get(plan.incumbentEmployeeId) : null;
    return {
      name: incumbent ? formatEmployeeName(incumbent) : 'bez incumbenta',
      role: position.title,
      division: divisionLabelById.get(position.divisionId) ?? position.divisionId,
      context: 'kritická role bez nástupce',
    };
  });
  return { preview: previews, total: gaps.length };
}

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
