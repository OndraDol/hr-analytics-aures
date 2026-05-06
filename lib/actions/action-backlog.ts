import { analyzeDrivers } from '@/lib/analytics/driver-analyzer';
import { evaluateKpi } from '@/lib/analytics/kpi-evaluator';
import { recommendAction } from '@/lib/analytics/action-recommender';
import type { DataProvider, Period } from '@/lib/data/provider';
import { KPI_CATALOG, type KpiCode, type KpiStatus } from '@/lib/kpi/catalog';
import { SECTION_CATALOG } from '@/lib/sections/catalog';
import { ownerLabel } from '@/lib/team/owners-map';

export type ActionBacklogEffort = 'low' | 'medium' | 'high';
export type ActionBacklogDue = 'this-week' | 'two-weeks' | 'monthly-review' | 'next-cycle';

export interface ActionBacklogItem {
  id: string;
  kpiCode: KpiCode;
  titleCs: string;
  recommendationCs: string;
  reasonCs: string;
  owner: string;
  status: KpiStatus;
  priority: 1 | 2 | 3;
  value: string;
  sectionTitle: string;
  href: string;
  driverCs: string;
  due: ActionBacklogDue;
  dueLabelCs: string;
  effort: ActionBacklogEffort;
  impactScore: number;
}

export interface ActionBacklogSummary {
  total: number;
  red: number;
  amber: number;
  priorityOne: number;
  thisWeek: number;
}

export interface ActionBacklogData {
  period: Period;
  items: ActionBacklogItem[];
  summary: ActionBacklogSummary;
}

const PRIORITY_WEIGHT: Record<1 | 2 | 3, number> = { 1: 30, 2: 18, 3: 8 };

const FALLBACK_LINKS: Partial<Record<KpiCode, string>> = {
  HOLIDAY_UNTAKEN: '/operativa/vacation-balances',
  SICKNESS_RATE: '/analytika/absence-coverage',
  SHIFT_COVERAGE: '/analytika/absence-coverage',
  TTF_CRIT: '/analytika/recruitment-funnel',
  TIME_TO_PROD: '/sekce/recruitment',
  CPH: '/analytika/recruitment-funnel',
  QUALITY_HIRE: '/sekce/recruitment',
  EMPLOYER_EVAL: '/sekce/recruitment',
};

function hrefForKpi(code: KpiCode): string {
  const section = SECTION_CATALOG.find(
    (item) => item.primaryKpi === code || item.secondaryKpis.includes(code),
  );

  return section?.href ?? FALLBACK_LINKS[code] ?? '/';
}

function sectionTitleForKpi(code: KpiCode): string {
  const section = SECTION_CATALOG.find(
    (item) => item.primaryKpi === code || item.secondaryKpis.includes(code),
  );

  return section?.title ?? 'Operativa';
}

function dueFor(status: KpiStatus, priority: 1 | 2 | 3): Pick<ActionBacklogItem, 'due' | 'dueLabelCs'> {
  if (status === 'red' && priority === 1) {
    return { due: 'this-week', dueLabelCs: 'Tento týden' };
  }

  if (status === 'red') {
    return { due: 'two-weeks', dueLabelCs: 'Do 14 dnů' };
  }

  if (priority === 1) {
    return { due: 'monthly-review', dueLabelCs: 'Měsíční review' };
  }

  return { due: 'next-cycle', dueLabelCs: 'Další cyklus' };
}

function effortFor(priority: 1 | 2 | 3, driverCount: number): ActionBacklogEffort {
  if (priority === 1 && driverCount > 1) return 'high';
  if (priority === 1 || driverCount > 0) return 'medium';
  return 'low';
}

function rank(item: ActionBacklogItem): number {
  return item.impactScore + (item.due === 'this-week' ? 12 : 0) + (item.due === 'two-weeks' ? 6 : 0);
}

export async function buildActionBacklog(
  provider: DataProvider,
  period: Period,
): Promise<ActionBacklogData> {
  const candidates = await Promise.all(
    KPI_CATALOG.map(async (definition) => {
      const evaluation = await evaluateKpi(provider, definition.code, { period });
      const drivers = await analyzeDrivers(provider, evaluation);
      const action = recommendAction(evaluation, drivers);
      const topDriver = drivers[0];
      const due = dueFor(evaluation.status, definition.priority);
      const impactScore = Math.min(
        100,
        evaluation.severityScore +
          PRIORITY_WEIGHT[definition.priority] +
          Math.min(Math.round(Math.abs(evaluation.trend.mom ?? 0)), 25),
      );

      return {
        id: `action-${definition.code.toLowerCase().replaceAll('_', '-')}`,
        kpiCode: definition.code,
        titleCs: action.titleCs,
        recommendationCs: action.bodyCs,
        reasonCs: `${evaluation.thresholdDistance.messageCs}. ${evaluation.thresholdRationaleCs}`,
        owner: ownerLabel(definition.owner),
        status: evaluation.status,
        priority: definition.priority,
        value: evaluation.formattedValue,
        sectionTitle: sectionTitleForKpi(definition.code),
        href: hrefForKpi(definition.code),
        driverCs: topDriver
          ? `${topDriver.label}: změna ${topDriver.delta.toFixed(1)}, podíl ${Math.round(topDriver.share)} %`
          : 'Bez dominantního driveru v aktuálním období',
        due: due.due,
        dueLabelCs: due.dueLabelCs,
        effort: effortFor(definition.priority, drivers.length),
        impactScore,
      } satisfies ActionBacklogItem;
    }),
  );
  const items = candidates
    .filter((item) => item.status !== 'green')
    .sort((a, b) => rank(b) - rank(a));

  return {
    period,
    items,
    summary: {
      total: items.length,
      red: items.filter((item) => item.status === 'red').length,
      amber: items.filter((item) => item.status === 'amber').length,
      priorityOne: items.filter((item) => item.priority === 1).length,
      thisWeek: items.filter((item) => item.due === 'this-week').length,
    },
  };
}
