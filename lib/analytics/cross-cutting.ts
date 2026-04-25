import {
  BriefcaseBusiness,
  CircleDollarSign,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';
import type { DataProvider, Period } from '@/lib/data/provider';
import type {
  AbsenceRecord,
  Employee,
  ENPSResponse,
  Grade,
  PayrollMonth,
} from '@/lib/types';
import type { DetailDashboardData, DetailMetric } from './detail-types';

export type AnalyticsTopicSlug =
  | 'attrition'
  | 'recruitment-funnel'
  | 'compensation-pay-gap'
  | 'absence-coverage';

export interface AnalyticsTopicDefinition {
  slug: AnalyticsTopicSlug;
  href: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  accent: string;
  icon: typeof HeartPulse;
}

export const ANALYTICS_TOPICS: readonly AnalyticsTopicDefinition[] = [
  {
    slug: 'attrition',
    href: '/analytika/attrition',
    title: 'Attrition deep dive',
    shortTitle: 'Attrition',
    eyebrow: 'Cross-cutting M6',
    description: 'Retenční analýza přes tenure cohorty, kritické role, divize, eNPS a mzdový kontext.',
    accent: '#e11d48',
    icon: HeartPulse,
  },
  {
    slug: 'recruitment-funnel',
    href: '/analytika/recruitment-funnel',
    title: 'Recruitment funnel breakdown',
    shortTitle: 'Funnel',
    eyebrow: 'Cross-cutting M6',
    description: 'Průchod kandidátů náborovým trychtýřem, bottlenecky, kanály, náklady a critical requisitions.',
    accent: '#0ea5e9',
    icon: BriefcaseBusiness,
  },
  {
    slug: 'compensation-pay-gap',
    href: '/analytika/compensation-pay-gap',
    title: 'Compensation & pay gap',
    shortTitle: 'Pay gap',
    eyebrow: 'Cross-cutting M6',
    description: 'Mzdová distribuce po gradech, raw vs. adjusted gender pay gap, tenure kohorty a outliery.',
    accent: '#f97316',
    icon: CircleDollarSign,
  },
  {
    slug: 'absence-coverage',
    href: '/analytika/absence-coverage',
    title: 'Absence & coverage',
    shortTitle: 'Absence',
    eyebrow: 'Cross-cutting M6',
    description: 'Nemocnost, dovolené, dlouhodobé absence a provozní coverage signál podle divizí.',
    accent: '#7c3aed',
    icon: Stethoscope,
  },
] as const;

export const ANALYTICS_TOPIC_BY_SLUG = new Map<AnalyticsTopicSlug, AnalyticsTopicDefinition>(
  ANALYTICS_TOPICS.map((topic) => [topic.slug, topic]),
);

export function getAnalyticsTopicBySlug(slug: string): AnalyticsTopicDefinition | null {
  return ANALYTICS_TOPIC_BY_SLUG.get(slug as AnalyticsTopicSlug) ?? null;
}

const GRADE_ORDER: Grade[] = ['B0', 'B1', 'B2', 'B3', 'IC'];

const sum = <T>(rows: readonly T[], pick: (row: T) => number): number =>
  rows.reduce((total, row) => total + pick(row), 0);

const mean = <T>(rows: readonly T[], pick: (row: T) => number): number =>
  rows.length === 0 ? 0 : sum(rows, pick) / rows.length;

const formatNumber = (value: number, maximumFractionDigits = 0): string =>
  new Intl.NumberFormat('cs-CZ', { maximumFractionDigits }).format(value);

const formatPct = (value: number, maximumFractionDigits = 1): string =>
  `${formatNumber(value, maximumFractionDigits)} %`;

const formatCzk = (value: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);

const add = (map: Map<string, number>, key: string, value: number): void => {
  map.set(key, (map.get(key) ?? 0) + value);
};

const activeOn = (employee: Employee, isoDate: string): boolean =>
  employee.hireDate <= isoDate && (!employee.terminationDate || employee.terminationDate >= isoDate);

const diffDays = (fromIso: string, toIso: string): number => {
  const from = Date.parse(`${fromIso}T00:00:00.000Z`);
  const to = Date.parse(`${toIso}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return 0;
  return Math.round((to - from) / 86_400_000);
};

const diffMonths = (fromIso: string, toIso: string): number => Math.max(0, diffDays(fromIso, toIso) / 30.4);

const daysInPeriod = (period: Period): number => diffDays(period.from, period.to) + 1;

const employeeMap = (employees: readonly Employee[]): Map<string, Employee> =>
  new Map(employees.map((employee) => [employee.id, employee]));

const topRows = <T extends { value: number }>(rows: T[], count = 8): T[] =>
  rows.sort((a, b) => b.value - a.value).slice(0, count);

const divisionLabels = async (provider: DataProvider): Promise<Map<string, string>> => {
  const divisions = await provider.getDivisions();
  return new Map(divisions.map((division) => [division.id, division.name]));
};

const payrollByEmployeeAverage = (payroll: readonly PayrollMonth[]): Map<string, number> => {
  const grouped = new Map<string, PayrollMonth[]>();
  for (const row of payroll) {
    const rows = grouped.get(row.employeeId) ?? [];
    rows.push(row);
    grouped.set(row.employeeId, rows);
  }
  return new Map(Array.from(grouped.entries()).map(([employeeId, rows]) => [
    employeeId,
    mean(rows, (row) => row.baseSalary),
  ]));
};

const median = (values: readonly number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const right = sorted[middle] ?? 0;
  if (sorted.length % 2 === 1) return right;
  return ((sorted[middle - 1] ?? right) + right) / 2;
};

const gapPct = (maleAverage: number, femaleAverage: number): number =>
  maleAverage > 0 ? ((maleAverage - femaleAverage) / maleAverage) * 100 : 0;

const toneForStatus = (value: number, amber: number, red: number): DetailMetric['tone'] => {
  if (value >= red) return 'rose';
  if (value >= amber) return 'orange';
  return 'emerald';
};

export async function buildCrossCuttingDashboard(
  provider: DataProvider,
  topic: AnalyticsTopicDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  if (topic.slug === 'attrition') return buildAttrition(provider, topic, period);
  if (topic.slug === 'recruitment-funnel') return buildRecruitmentFunnel(provider, topic, period);
  if (topic.slug === 'compensation-pay-gap') return buildCompensationPayGap(provider, topic, period);
  return buildAbsenceCoverage(provider, topic, period);
}

async function buildAttrition(
  provider: DataProvider,
  topic: AnalyticsTopicDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const [employees, events, payroll, enps, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getWorkforceEvents(period),
    provider.getPayroll(period),
    provider.getEnpsResponses('2025-Q4'),
    divisionLabels(provider),
  ]);
  const employeesById = employeeMap(employees);
  const activeStart = employees.filter((employee) => activeOn(employee, period.from));
  const activeEnd = employees.filter((employee) => activeOn(employee, period.to));
  const averageHeadcount = (activeStart.length + activeEnd.length) / 2 || activeEnd.length;
  const leaverEvents = events.filter((event) => event.type === 'terminate');
  const leavers = leaverEvents
    .map((event) => employeesById.get(event.employeeId))
    .filter((employee): employee is Employee => Boolean(employee));
  const criticalLeavers = leavers.filter((employee) => employee.criticalPositionFlag);
  const shortTenureLeavers = leavers.filter((employee) => diffMonths(employee.hireDate, employee.terminationDate ?? period.to) <= 12);
  const payrollAverage = payrollByEmployeeAverage(payroll);

  const activeBySegment = new Map<string, { divisionId: string; grade: Grade; active: number; leavers: number; critical: number }>();
  for (const employee of activeEnd) {
    const key = `${employee.divisionId}|${employee.grade}`;
    const row = activeBySegment.get(key) ?? { divisionId: employee.divisionId, grade: employee.grade, active: 0, leavers: 0, critical: 0 };
    row.active += 1;
    activeBySegment.set(key, row);
  }
  for (const employee of leavers) {
    const key = `${employee.divisionId}|${employee.grade}`;
    const row = activeBySegment.get(key) ?? { divisionId: employee.divisionId, grade: employee.grade, active: 0, leavers: 0, critical: 0 };
    row.leavers += 1;
    if (employee.criticalPositionFlag) row.critical += 1;
    activeBySegment.set(key, row);
  }

  const enpsByDivision = new Map<string, ENPSResponse[]>();
  for (const response of enps.filter((row) => row.responded)) {
    const rows = enpsByDivision.get(response.segment.divisionId) ?? [];
    rows.push(response);
    enpsByDivision.set(response.segment.divisionId, rows);
  }

  const activeByDivision = new Map<string, number>();
  const leaversByDivision = new Map<string, number>();
  const wagesByDivision = new Map<string, number[]>();
  for (const employee of activeEnd) {
    add(activeByDivision, employee.divisionId, 1);
    const wage = payrollAverage.get(employee.id);
    if (wage) {
      const rows = wagesByDivision.get(employee.divisionId) ?? [];
      rows.push(wage);
      wagesByDivision.set(employee.divisionId, rows);
    }
  }
  for (const employee of leavers) add(leaversByDivision, employee.divisionId, 1);

  const attritionRate = averageHeadcount > 0 ? (leavers.length / averageHeadcount) * 100 : 0;
  const topSegment = topRows(
    Array.from(activeBySegment.values()).map((row) => {
      const rate = row.active > 0 ? (row.leavers / row.active) * 100 : row.leavers * 100;
      const enpsScore = mean(enpsByDivision.get(row.divisionId) ?? [], (response) => response.score);
      const risk = rate + row.critical * 6 + Math.max(0, -enpsScore) * 0.12;
      return {
        label: `${labels.get(row.divisionId) ?? row.divisionId} · ${row.grade}`,
        value: Math.round(risk * 10) / 10,
        secondary: row.leavers,
        detail: `${formatPct(rate)} attrition, ${formatNumber(row.critical)} critical leavers`,
      };
    }),
  );

  const tenureBuckets = [
    { label: '0-3 měsíce', from: 0, to: 3 },
    { label: '4-6 měsíců', from: 3, to: 6 },
    { label: '7-12 měsíců', from: 6, to: 12 },
    { label: '12+ měsíců', from: 12, to: 999 },
  ].map((bucket) => {
    const bucketLeavers = leavers.filter((employee) => {
      const months = diffMonths(employee.hireDate, employee.terminationDate ?? period.to);
      return months > bucket.from && months <= bucket.to;
    });
    return {
      label: bucket.label,
      value: bucketLeavers.length,
      detail: `${formatPct((bucketLeavers.length / Math.max(leavers.length, 1)) * 100)} odchodů`,
    };
  });

  const correlationRows = Array.from(activeByDivision.entries())
    .map(([divisionId, active]) => {
      const leaverCount = leaversByDivision.get(divisionId) ?? 0;
      const rate = active > 0 ? (leaverCount / active) * 100 : 0;
      const enpsScore = mean(enpsByDivision.get(divisionId) ?? [], (response) => response.score);
      const avgWage = mean(wagesByDivision.get(divisionId) ?? [], (value) => value);
      return {
        label: labels.get(divisionId) ?? divisionId,
        value: formatPct(rate),
        secondary: formatNumber(enpsScore, 1),
        detail: `${formatCzk(avgWage)} avg wage, ${formatNumber(leaverCount)} odchodů`,
        raw: rate + Math.max(0, -enpsScore) * 0.2,
      };
    })
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 8);

  return {
    ...topic,
    period,
    metrics: [
      { label: 'Fluktuace Q1', value: formatPct(attritionRate), detail: `${formatNumber(leavers.length)} odchodů`, tone: toneForStatus(attritionRate, 22, 30) },
      { label: 'Critical leavers', value: formatNumber(criticalLeavers.length), detail: `${formatPct((criticalLeavers.length / Math.max(leavers.length, 1)) * 100)} odchodů`, tone: criticalLeavers.length > 0 ? 'orange' : 'emerald' },
      { label: 'Short-tenure leavers', value: formatNumber(shortTenureLeavers.length), detail: 'do 12 měsíců od nástupu', tone: shortTenureLeavers.length > leavers.length * 0.25 ? 'rose' : 'blue' },
      { label: 'Rizikové segmenty', value: formatNumber(topSegment.length), detail: 'kombinace divize × grade', tone: 'violet' },
    ],
    primaryBreakdown: {
      title: 'High-risk segmenty',
      subtitle: 'Rizikové skóre kombinuje attrition, critical odchody a nízké eNPS',
      valueLabel: 'risk score',
      secondaryLabel: 'odchody',
      rows: topSegment,
    },
    secondaryBreakdown: {
      title: 'Tenure cohort odchodů',
      subtitle: 'Kdy lidé odcházejí vůči datu nástupu',
      valueLabel: 'odchody',
      rows: tenureBuckets,
    },
    table: {
      title: 'Correlation explorer',
      subtitle: 'Divize s kombinací fluktuace, eNPS a mzdového kontextu',
      rows: correlationRows.map((row) => ({
        label: row.label,
        value: row.value,
        secondary: row.secondary,
        detail: row.detail,
      })),
    },
    insightCs: 'Největší retenční riziko vzniká tam, kde se potkává krátký tenure, kritická role a slabší eNPS. Samotná fluktuace nestačí; prioritu mají segmenty, kde odchod rychle vytvoří provozní nebo nástupnický gap.',
    actions: [
      'U top segmentů spustit 1:1 review s HRBP a manažerem do 14 dnů.',
      'Oddělit early attrition od odchodů seniorních rolí, protože mají jiné příčiny i akce.',
      'Propojit segmenty s nízkým eNPS s nástupnictvím a otevřenými requisitions.',
    ],
    relatedLinks: [
      { label: 'Retention sekce', href: '/sekce/retention' },
      { label: 'Hired & fired report', href: '/operativa/hired-fired' },
      { label: 'eNPS latest', href: '/operativa/enps-latest' },
    ],
  };
}

async function buildRecruitmentFunnel(
  provider: DataProvider,
  topic: AnalyticsTopicDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const [requisitions, funnel] = await Promise.all([
    provider.getRequisitions(period),
    provider.getFunnelCounts(period),
  ]);
  const stageOrder: RecruitmentRequisitionStage[] = [
    'longlist',
    'presented',
    '1st_interview',
    '2nd_interview',
    'offer_sent',
    'hired',
  ];
  const stageLabels: Record<RecruitmentRequisitionStage, string> = {
    longlist: 'Longlist',
    presented: 'Presented',
    '1st_interview': '1st interview',
    '2nd_interview': '2nd interview',
    offer_sent: 'Offer sent',
    hired: 'Hired',
  };
  const stageCounts = new Map<RecruitmentRequisitionStage, number>();
  for (const row of funnel) add(stageCounts, row.stage, row.count);

  const stageRows = stageOrder.map((stage, index) => {
    const value = stageCounts.get(stage) ?? 0;
    const previous = index === 0 ? value : stageCounts.get(stageOrder[index - 1] ?? stage) ?? value;
    const conversion = previous > 0 ? (value / previous) * 100 : 0;
    return {
      label: stageLabels[stage],
      value,
      secondary: Math.round(conversion * 10) / 10,
      detail: index === 0 ? 'vstup do funnelu' : `${formatPct(conversion)} z předchozí fáze`,
    };
  });
  const bottleneck = stageRows
    .slice(1)
    .map((row, index) => ({
      label: `${stageRows[index]?.label ?? 'Start'} -> ${row.label}`,
      value: Math.max(0, 100 - (row.secondary ?? 0)),
      detail: `${formatPct(100 - (row.secondary ?? 0))} drop-off`,
    }))
    .sort((a, b) => b.value - a.value)[0];

  const filled = requisitions.filter((row) => row.hireDate);
  const channelMap = new Map<string, { requisitions: number; hired: number; critical: number; cost: number }>();
  for (const row of requisitions) {
    const item = channelMap.get(row.channel) ?? { requisitions: 0, hired: 0, critical: 0, cost: 0 };
    item.requisitions += 1;
    if (row.hireDate) item.hired += 1;
    if (row.critical) item.critical += 1;
    item.cost += row.cost;
    channelMap.set(row.channel, item);
  }

  const stageDurations = [
    { label: 'Approval -> publish', from: 'approvedDate', to: 'publishedDate' },
    { label: 'Publish -> interview', from: 'publishedDate', to: 'firstInterviewDate' },
    { label: 'Interview -> offer', from: 'firstInterviewDate', to: 'offerDate' },
    { label: 'Offer -> accepted', from: 'offerDate', to: 'acceptedDate' },
    { label: 'Accepted -> hire', from: 'acceptedDate', to: 'hireDate' },
  ] as const;

  const durationRows = stageDurations.map((stage) => {
    const durations = requisitions
      .map((row) => {
        const from = row[stage.from];
        const to = row[stage.to];
        return from && to ? diffDays(from, to) : null;
      })
      .filter((value): value is number => value != null);
    return {
      label: stage.label,
      value: mean(durations, (value) => value),
      detail: `${formatNumber(durations.length)} requisitions s oběma daty`,
    };
  });

  const channelRows = Array.from(channelMap.entries())
    .map(([label, row]) => ({
      label,
      value: row.requisitions,
      secondary: row.hired,
      detail: `${formatPct((row.hired / Math.max(row.requisitions, 1)) * 100)} conversion, ${formatCzk(Math.round(row.cost / Math.max(row.hired, 1)))} / hire`,
      rawCost: row.cost / Math.max(row.hired, 1),
    }))
    .sort((a, b) => b.rawCost - a.rawCost)
    .slice(0, 8);

  const averageCph = mean(filled, (row) => row.cost);
  const conversion = requisitions.length > 0 ? (filled.length / requisitions.length) * 100 : 0;

  return {
    ...topic,
    period,
    metrics: [
      { label: 'Requisitions', value: formatNumber(requisitions.length), detail: 'aktivní v období', tone: 'blue' },
      { label: 'Obsazeno', value: formatNumber(filled.length), detail: `${formatPct(conversion)} conversion`, tone: conversion >= 55 ? 'emerald' : 'orange' },
      { label: 'Bottleneck', value: bottleneck ? formatPct(bottleneck.value) : 'n/a', detail: bottleneck?.label ?? 'bez drop-off signálu', tone: bottleneck && bottleneck.value > 45 ? 'rose' : 'zinc' },
      { label: 'Cost per hire', value: formatCzk(averageCph), detail: 'obsazené role', tone: averageCph > 60_000 ? 'orange' : 'emerald' },
    ],
    primaryBreakdown: {
      title: 'Full funnel',
      subtitle: 'Objem kandidátů a konverze mezi fázemi',
      valueLabel: 'kandidáti',
      secondaryLabel: 'konverze %',
      rows: stageRows,
    },
    secondaryBreakdown: {
      title: 'Time per funnel stage',
      subtitle: 'Průměrná délka fáze podle dostupných timestampů',
      valueLabel: 'dny',
      rows: durationRows,
    },
    table: {
      title: 'Kanály a nákladovost',
      subtitle: 'Kanály seřazené podle nákladu na obsazenou roli',
      rows: channelRows.map((row) => ({
        label: row.label,
        value: formatNumber(row.value),
        secondary: formatNumber(row.secondary ?? 0),
        detail: row.detail,
      })),
    },
    insightCs: 'Největší náborový dopad má kombinace dlouhé interview fáze, drahého kanálu a critical requisitions. Funnel detail ukazuje, kde se ztrácí kandidáti ještě před nabídkou, ne až na celkové time-to-fill metrice.',
    actions: [
      'Nastavit SLA pro fázi s nejvyšším drop-off a sledovat ji týdně.',
      'U kanálů s vysokým CPH vyhodnotit kvalitu hire a early attrition.',
      'Critical requisitions řídit odděleně od standardních rolí.',
    ],
    relatedLinks: [
      { label: 'Recruitment sekce', href: '/sekce/recruitment' },
      { label: 'Nástupy / odchody', href: '/operativa/hired-fired' },
      { label: 'Attrition deep dive', href: '/analytika/attrition' },
    ],
  };
}

type RecruitmentRequisitionStage = 'longlist' | 'presented' | '1st_interview' | '2nd_interview' | 'offer_sent' | 'hired';

async function buildCompensationPayGap(
  provider: DataProvider,
  topic: AnalyticsTopicDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const [employees, payroll, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getPayroll(period),
    divisionLabels(provider),
  ]);
  const active = employees.filter((employee) => activeOn(employee, period.to));
  const avgSalaryByEmployee = payrollByEmployeeAverage(payroll);
  const activeWithSalary = active.filter((employee) => (avgSalaryByEmployee.get(employee.id) ?? 0) > 0);
  const maleAverage = mean(activeWithSalary.filter((employee) => employee.gender === 'male'), (employee) => avgSalaryByEmployee.get(employee.id) ?? 0);
  const femaleAverage = mean(activeWithSalary.filter((employee) => employee.gender === 'female'), (employee) => avgSalaryByEmployee.get(employee.id) ?? 0);
  const rawGap = gapPct(maleAverage, femaleAverage);

  const gradeRows = GRADE_ORDER.map((grade) => {
    const inGrade = activeWithSalary.filter((employee) => employee.grade === grade);
    const male = mean(inGrade.filter((employee) => employee.gender === 'male'), (employee) => avgSalaryByEmployee.get(employee.id) ?? 0);
    const female = mean(inGrade.filter((employee) => employee.gender === 'female'), (employee) => avgSalaryByEmployee.get(employee.id) ?? 0);
    const gap = gapPct(male, female);
    return {
      label: grade,
      value: Math.round(gap * 10) / 10,
      secondary: inGrade.length,
      detail: `${formatCzk(male)} muži / ${formatCzk(female)} ženy`,
      hasBothGroups: male > 0 && female > 0,
    };
  });
  const adjustedGap = mean(gradeRows.filter((row) => row.hasBothGroups), (row) => row.value);
  const b2Gap = gradeRows.find((row) => row.label === 'B2')?.value ?? 0;

  const salaryByGrade = new Map<Grade, number[]>();
  for (const employee of activeWithSalary) {
    const rows = salaryByGrade.get(employee.grade) ?? [];
    rows.push(avgSalaryByEmployee.get(employee.id) ?? 0);
    salaryByGrade.set(employee.grade, rows);
  }
  const outliers = activeWithSalary
    .map((employee) => {
      const salary = avgSalaryByEmployee.get(employee.id) ?? 0;
      const gradeMedian = median(salaryByGrade.get(employee.grade) ?? []);
      const ratio = gradeMedian > 0 ? salary / gradeMedian : 1;
      return { employee, salary, gradeMedian, ratio, distance: Math.abs(ratio - 1) };
    })
    .filter((row) => row.distance >= 0.18)
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 8);

  const tenureBuckets = [
    { label: '0-1 rok', from: 0, to: 1 },
    { label: '1-3 roky', from: 1, to: 3 },
    { label: '3-5 let', from: 3, to: 5 },
    { label: '5+ let', from: 5, to: 99 },
  ].map((bucket) => {
    const rows = activeWithSalary.filter((employee) => {
      const tenure = diffMonths(employee.hireDate, period.to) / 12;
      return tenure > bucket.from && tenure <= bucket.to;
    });
    return {
      label: bucket.label,
      value: mean(rows, (employee) => avgSalaryByEmployee.get(employee.id) ?? 0),
      secondary: rows.length,
      detail: `${formatNumber(rows.length)} lidí v kohortě`,
    };
  });

  const byDivision = new Map<string, Employee[]>();
  for (const employee of activeWithSalary) {
    const rows = byDivision.get(employee.divisionId) ?? [];
    rows.push(employee);
    byDivision.set(employee.divisionId, rows);
  }

  return {
    ...topic,
    period,
    metrics: [
      { label: 'Raw pay gap', value: formatPct(rawGap), detail: `${formatCzk(maleAverage)} vs ${formatCzk(femaleAverage)}`, tone: Math.abs(rawGap) > 8 ? 'orange' : 'emerald' },
      { label: 'Adjusted gap', value: formatPct(adjustedGap), detail: 'průměr grade-level gapů', tone: Math.abs(adjustedGap) > 5 ? 'orange' : 'emerald' },
      { label: 'B2 gap', value: formatPct(b2Gap), detail: 'leadership / expert segment', tone: Math.abs(b2Gap) > 7 ? 'rose' : 'blue' },
      { label: 'Outliers', value: formatNumber(outliers.length), detail: 'nad 18 % od mediánu grade', tone: outliers.length > 0 ? 'violet' : 'zinc' },
    ],
    primaryBreakdown: {
      title: 'Gender pay gap podle grade',
      subtitle: 'Raw rozdíl v průměrné základní mzdě uvnitř grade',
      valueLabel: 'gap %',
      secondaryLabel: 'HC',
      rows: gradeRows.map((row) => ({
        label: row.label,
        value: row.value,
        secondary: row.secondary,
        detail: row.detail,
      })),
    },
    secondaryBreakdown: {
      title: 'Wage progression podle tenure',
      subtitle: 'Průměrná základní mzda podle délky zaměstnání',
      valueLabel: 'Kč',
      secondaryLabel: 'HC',
      rows: tenureBuckets,
    },
    table: {
      title: 'Mzdové outliery',
      subtitle: 'Zaměstnanci nejdál od mediánu svého grade',
      rows: outliers.map((row) => ({
        label: `${row.employee.firstName} ${row.employee.lastName}`,
        value: formatCzk(row.salary),
        secondary: `${row.employee.grade} · ${labels.get(row.employee.divisionId) ?? row.employee.divisionId}`,
        detail: `${formatPct((row.ratio - 1) * 100)} proti grade mediánu ${formatCzk(row.gradeMedian)}`,
      })),
    },
    insightCs: 'Raw pay gap je potřeba číst spolu s grade strukturou. Adjusted pohled ukazuje, kolik rozdílu zůstává po srovnání podobných úrovní; outliery jsou vhodnější akční seznam než samotný průměr.',
    actions: [
      'Validovat grade-level gapy s C&B a HRBP před interpretací směrem k managementu.',
      'U outlierů odlišit legitimní tržní prémii od nekonzistence v odměňování.',
      'Porovnat segmenty s nízkou mzdou proti attrition riziku.',
    ],
    relatedLinks: [
      { label: 'HR statistiky', href: '/sekce/hr-statistics' },
      { label: 'Náklady a struktura', href: '/sekce/cost-structure' },
      { label: 'ESG people data', href: '/operativa/esg' },
    ],
  };
}

async function buildAbsenceCoverage(
  provider: DataProvider,
  topic: AnalyticsTopicDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const yearStart: Period = { from: `${period.to.slice(0, 4)}-01-01`, to: period.to };
  const [employees, absence, ytdAbsence, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getAbsence(period),
    provider.getAbsence(yearStart),
    divisionLabels(provider),
  ]);
  const employeesById = employeeMap(employees);
  const active = employees.filter((employee) => activeOn(employee, period.to));
  const activeByDivision = new Map<string, number>();
  for (const employee of active) add(activeByDivision, employee.divisionId, 1);

  const sickRows = absence.filter((row) => row.type === 'sick');
  const sickDays = sum(sickRows, (row) => row.days);
  const workingDays = daysInPeriod(period) * (5 / 7) * Math.max(active.length, 1);
  const sicknessRate = (sickDays / workingDays) * 100;
  const longTermCases = sickRows.filter((row) => row.days >= 15);
  const vacationYtdByEmployee = new Map<string, number>();
  for (const row of ytdAbsence.filter((item) => item.type === 'vacation')) {
    add(vacationYtdByEmployee, row.employeeId, row.days);
  }
  const accruedDays = 25 * (Number(period.to.slice(5, 7)) / 12);
  const vacationBalances = active.map((employee) => ({
    employee,
    balance: Math.max(0, accruedDays - (vacationYtdByEmployee.get(employee.id) ?? 0)),
  }));
  const totalVacationBalance = sum(vacationBalances, (row) => row.balance);

  const sickByDivision = new Map<string, number>();
  for (const row of sickRows) {
    const employee = employeesById.get(row.employeeId);
    if (employee) add(sickByDivision, employee.divisionId, row.days);
  }
  const vacationByDivision = new Map<string, number>();
  for (const row of vacationBalances) add(vacationByDivision, row.employee.divisionId, row.balance);

  const sicknessRows = Array.from(activeByDivision.entries()).map(([divisionId, headcount]) => {
    const days = sickByDivision.get(divisionId) ?? 0;
    const divisionWorkingDays = daysInPeriod(period) * (5 / 7) * Math.max(headcount, 1);
    const rate = (days / divisionWorkingDays) * 100;
    return {
      label: labels.get(divisionId) ?? divisionId,
      value: Math.round(rate * 10) / 10,
      secondary: days,
      detail: `${formatNumber(headcount)} aktivních, ${formatNumber(days)} sick days`,
    };
  });

  const vacationRows = Array.from(vacationByDivision.entries()).map(([divisionId, days]) => ({
    label: labels.get(divisionId) ?? divisionId,
    value: Math.round(days * 10) / 10,
    secondary: activeByDivision.get(divisionId) ?? 0,
    detail: `${formatNumber(days / Math.max(activeByDivision.get(divisionId) ?? 1, 1), 1)} dne / zaměstnanec`,
  }));

  const coverage = Math.max(88, 98 - sicknessRate * 0.35);
  const longTermRows = longTermCases.length > 0 ? longTermCases : sickRows.sort((a, b) => b.days - a.days).slice(0, 8);

  return {
    ...topic,
    period,
    metrics: [
      { label: 'Nemocnost', value: formatPct(sicknessRate), detail: `${formatNumber(sickDays)} sick days`, tone: sicknessRate > 5 ? 'orange' : 'emerald' },
      { label: 'Coverage signal', value: formatPct(coverage), detail: 'mock planned vs. covered', tone: coverage < 94 ? 'rose' : 'blue' },
      { label: 'Dovolená balance', value: formatNumber(totalVacationBalance, 0), detail: `${formatNumber(totalVacationBalance / Math.max(active.length, 1), 1)} dne / zaměstnanec`, tone: 'violet' },
      { label: 'Long-term cases', value: formatNumber(longTermCases.length), detail: 'absence >= 15 dnů', tone: longTermCases.length > 0 ? 'orange' : 'zinc' },
    ],
    primaryBreakdown: {
      title: 'Nemocnost podle divize',
      subtitle: 'Sick days přepočtené na pracovní fond aktivních zaměstnanců',
      valueLabel: 'sickness %',
      secondaryLabel: 'sick days',
      rows: topRows(sicknessRows),
    },
    secondaryBreakdown: {
      title: 'Nevyčerpaná dovolená',
      subtitle: 'Odhad zůstatku ke konci období podle čerpání YTD',
      valueLabel: 'dny',
      secondaryLabel: 'HC',
      rows: topRows(vacationRows),
    },
    table: {
      title: 'Dlouhodobé absence a coverage riziko',
      subtitle: 'Nejdelší absence v období jako vstup pro manažerský follow-up',
      rows: longTermRows.map((row: AbsenceRecord) => {
        const employee = employeesById.get(row.employeeId);
        return {
          label: employee ? `${employee.firstName} ${employee.lastName}` : row.employeeId,
          value: `${formatNumber(row.days)} dnů`,
          secondary: employee ? labels.get(employee.divisionId) ?? employee.divisionId : row.type,
          detail: `${row.type} · ${row.dateFrom} až ${row.dateTo}`,
        };
      }),
    },
    insightCs: 'Absence pohled má řídit provozní kapacitu, ne jen evidenci docházky. Největší prioritu mají divize, kde se současně hromadí nemocnost, vysoké dovolenkové zůstatky a coverage pod cílem.',
    actions: [
      'U divizí s vyšší nemocností ověřit manažerský span, směny a sezonní zatížení.',
      'Před koncem roku řídit dovolenkové zůstatky přes konkrétní plán čerpání.',
      'Dlouhodobé absence propojit s náhradním pokrytím rolí a náborem.',
    ],
    relatedLinks: [
      { label: 'Engagement sekce', href: '/sekce/engagement' },
      { label: 'Vacation balances', href: '/operativa/vacation-balances' },
      { label: 'Org chart', href: '/operativa/org-chart' },
    ],
  };
}
