import type { AIInsightProvider } from '@/lib/ai/insight-provider';
import { buildKpiCardModel, type KpiCardModel } from '@/lib/analytics/kpi-engine';
import type { DataProvider, Period } from '@/lib/data/provider';
import type { SectionDefinition } from '@/lib/sections/catalog';
import type {
  Employee,
  ENPSResponse,
  PayrollMonth,
  Position,
} from '@/lib/types';

export interface SectionMetric {
  label: string;
  value: string;
  detail: string;
  tone: 'blue' | 'orange' | 'emerald' | 'rose' | 'violet' | 'zinc';
}

export interface SectionBreakdownRow {
  label: string;
  value: number;
  secondary?: number;
  detail: string;
}

export interface SectionBreakdown {
  title: string;
  subtitle: string;
  valueLabel: string;
  secondaryLabel?: string;
  rows: SectionBreakdownRow[];
}

export interface SectionTableRow {
  label: string;
  value: string;
  secondary: string;
  detail: string;
}

export interface SectionTable {
  title: string;
  subtitle: string;
  rows: SectionTableRow[];
}

export interface SectionDashboardData {
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
  metrics: SectionMetric[];
  primaryBreakdown: SectionBreakdown;
  secondaryBreakdown: SectionBreakdown;
  table: SectionTable;
  executiveSignalCs: string;
  actions: string[];
}

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

const formatCzkShort = (value: number): string => `${formatNumber(value / 1_000_000, 1)} mil. Kč`;

const add = (map: Map<string, number>, key: string, value: number): void => {
  map.set(key, (map.get(key) ?? 0) + value);
};

const activeOn = (employee: Employee, isoDate: string): boolean =>
  employee.hireDate <= isoDate && (!employee.terminationDate || employee.terminationDate >= isoDate);

const ageAt = (birthDate: string, isoDate: string): number => {
  const year = Number(isoDate.slice(0, 4));
  const birthYear = Number(birthDate.slice(0, 4));
  return Number.isFinite(year) && Number.isFinite(birthYear) ? year - birthYear : 0;
};

const topRows = (
  rows: SectionBreakdownRow[],
  count = 8,
): SectionBreakdownRow[] => rows.sort((a, b) => b.value - a.value).slice(0, count);

const divisionLabels = async (provider: DataProvider): Promise<Map<string, string>> => {
  const divisions = await provider.getDivisions();
  return new Map(divisions.map((division) => [division.id, division.name]));
};

const divisionCountries = async (provider: DataProvider): Promise<Map<string, string>> => {
  const divisions = await provider.getDivisions();
  return new Map(divisions.map((division) => [division.id, division.country]));
};

const employeeMap = (employees: readonly Employee[]): Map<string, Employee> =>
  new Map(employees.map((employee) => [employee.id, employee]));

const payrollByEmployee = (payroll: readonly PayrollMonth[]): Map<string, PayrollMonth[]> => {
  const out = new Map<string, PayrollMonth[]>();
  for (const row of payroll) {
    const rows = out.get(row.employeeId) ?? [];
    rows.push(row);
    out.set(row.employeeId, rows);
  }
  return out;
};

async function baseKpis(
  provider: DataProvider,
  section: SectionDefinition,
  period: Period,
  aiProvider?: AIInsightProvider,
): Promise<KpiCardModel[]> {
  const codes = Array.from(new Set([section.primaryKpi, ...section.secondaryKpis]));
  return Promise.all(
    codes.map((code) => buildKpiCardModel(provider, code, { period }, aiProvider)),
  );
}

export async function buildSectionDashboard(
  provider: DataProvider,
  section: SectionDefinition,
  period: Period,
  aiProvider?: AIInsightProvider,
): Promise<SectionDashboardData> {
  const kpis = await baseKpis(provider, section, period, aiProvider);
  const payload = { provider, section, period, kpis };

  if (section.slug === 'hr-statistics') return buildHrStatistics(payload);
  if (section.slug === 'workforce-movement') return buildWorkforceMovement(payload);
  if (section.slug === 'cost-structure') return buildCostStructure(payload);
  if (section.slug === 'recruitment') return buildRecruitment(payload);
  if (section.slug === 'succession') return buildSuccession(payload);
  if (section.slug === 'engagement') return buildEngagement(payload);
  if (section.slug === 'talent-growth') return buildTalentGrowth(payload);
  throw new Error(`Section summary not implemented for ${section.slug}`);
}

async function buildHrStatistics({
  provider,
  section,
  period,
  kpis,
}: {
  provider: DataProvider;
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
}): Promise<SectionDashboardData> {
  const [employees, payroll, countries] = await Promise.all([
    provider.getEmployees(),
    provider.getPayroll(period),
    divisionCountries(provider),
  ]);
  const active = employees.filter((employee) => activeOn(employee, period.to));
  const payrollMap = payrollByEmployee(payroll);
  const fte = sum(active, (employee) => employee.fte);
  const femalePct = active.length > 0 ? (active.filter((employee) => employee.gender === 'female').length / active.length) * 100 : 0;
  const managers = active.filter((employee) => employee.grade === 'B0' || employee.grade === 'B1' || employee.grade === 'B2');
  const womenManagementPct =
    managers.length > 0 ? (managers.filter((employee) => employee.gender === 'female').length / managers.length) * 100 : 0;
  const averageAge = mean(active, (employee) => ageAt(employee.birthDate, period.to));
  const avgSalary = (employee: Employee): number => mean(payrollMap.get(employee.id) ?? [], (row) => row.baseSalary);
  const maleSalary = mean(active.filter((employee) => employee.gender === 'male'), avgSalary);
  const femaleSalary = mean(active.filter((employee) => employee.gender === 'female'), avgSalary);
  const payGap = maleSalary > 0 ? ((maleSalary - femaleSalary) / maleSalary) * 100 : 0;

  const countryCounts = new Map<string, number>();
  for (const employee of active) add(countryCounts, countries.get(employee.divisionId) ?? employee.country, 1);

  const ageBuckets = [
    { label: '<30', from: 0, to: 29 },
    { label: '30-39', from: 30, to: 39 },
    { label: '40-49', from: 40, to: 49 },
    { label: '50+', from: 50, to: 99 },
  ].map((bucket) => ({
    label: bucket.label,
    value: active.filter((employee) => {
      const age = ageAt(employee.birthDate, period.to);
      return age >= bucket.from && age <= bucket.to;
    }).length,
    detail: 'počet aktivních zaměstnanců',
  }));

  return {
    section,
    period,
    kpis,
    metrics: [
      { label: 'Aktivní HC', value: formatNumber(active.length), detail: `${formatNumber(fte, 1)} FTE`, tone: 'blue' },
      { label: 'Ženy celkem', value: formatPct(femalePct), detail: `${formatPct(womenManagementPct)} v managementu`, tone: 'emerald' },
      { label: 'Průměrný věk', value: formatNumber(averageAge, 1), detail: 'aktivní populace', tone: 'zinc' },
      { label: 'Raw gender pay gap', value: formatPct(payGap), detail: `${formatCzk(maleSalary)} vs ${formatCzk(femaleSalary)}`, tone: payGap > 8 ? 'orange' : 'blue' },
    ],
    primaryBreakdown: {
      title: 'Populace podle země',
      subtitle: 'Aktivní zaměstnanci podle země odvozené z divizní struktury',
      valueLabel: 'HC',
      rows: Array.from(countryCounts.entries()).map(([label, value]) => ({
        label,
        value,
        detail: `${formatPct((value / Math.max(active.length, 1)) * 100)} populace`,
      })),
    },
    secondaryBreakdown: {
      title: 'Věková struktura',
      subtitle: 'Hrubá demografie pro ESG a workforce plánování',
      valueLabel: 'HC',
      rows: ageBuckets,
    },
    table: {
      title: 'DEI signály',
      subtitle: 'Rychlé kontroly, které mají ve finálním BI vést do detailního C&B pohledu',
      rows: [
        { label: 'Management mix', value: formatPct(womenManagementPct), secondary: `${formatNumber(managers.length)} osob`, detail: 'B0-B2 podle grade heuristiky' },
        { label: 'Průměrná mzda mužů', value: formatCzk(maleSalary), secondary: 'base salary', detail: 'mock payroll nad reálnou kostrou zaměstnanců' },
        { label: 'Průměrná mzda žen', value: formatCzk(femaleSalary), secondary: 'base salary', detail: 'slouží jako signál pro detailní pay-gap analýzu' },
      ],
    },
    executiveSignalCs: 'Populační základ je stabilní, ale HR statistiky už ukazují témata pro řízení DEI: zastoupení žen v managementu a raw pay gap mají vlastní detailní rozpad.',
    actions: [
      'Srovnat HC/FTE proti staffplanu po divizích.',
      'Otevřít gender pay gap detail pro role s největší mzdovou odchylkou.',
      'Doplnit ESG definice pro země, kontrakty a management level.',
    ],
  };
}

async function buildWorkforceMovement({
  provider,
  section,
  period,
  kpis,
}: {
  provider: DataProvider;
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
}): Promise<SectionDashboardData> {
  const [employees, events, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getWorkforceEvents(period),
    divisionLabels(provider),
  ]);
  const employeesById = employeeMap(employees);
  const hires = events.filter((event) => event.type === 'hire');
  const leavers = events.filter((event) => event.type === 'terminate');
  const net = hires.length - leavers.length;
  const byDivision = new Map<string, { hires: number; leavers: number }>();
  for (const event of events) {
    const employee = employeesById.get(event.employeeId);
    if (!employee || (event.type !== 'hire' && event.type !== 'terminate')) continue;
    const row = byDivision.get(employee.divisionId) ?? { hires: 0, leavers: 0 };
    if (event.type === 'hire') row.hires += 1;
    if (event.type === 'terminate') row.leavers += 1;
    byDivision.set(employee.divisionId, row);
  }

  const rows = Array.from(byDivision.entries()).map(([divisionId, row]) => ({
    label: labels.get(divisionId) ?? divisionId,
    value: row.hires,
    secondary: row.leavers,
    detail: `net ${formatNumber(row.hires - row.leavers)}`,
  }));

  return {
    section,
    period,
    kpis,
    metrics: [
      { label: 'Nástupy', value: formatNumber(hires.length), detail: 'v období', tone: 'emerald' },
      { label: 'Odchody', value: formatNumber(leavers.length), detail: 'v období', tone: 'rose' },
      { label: 'Čistá změna', value: formatNumber(net), detail: net >= 0 ? 'růst kapacity' : 'pokles kapacity', tone: net >= 0 ? 'blue' : 'orange' },
      { label: 'Aktivní populace', value: formatNumber(employees.filter((employee) => activeOn(employee, period.to)).length), detail: 'ke konci období', tone: 'zinc' },
    ],
    primaryBreakdown: {
      title: 'Nástupy vs. odchody podle divize',
      subtitle: 'Top divize s největším objemem pohybu',
      valueLabel: 'nástupy',
      secondaryLabel: 'odchody',
      rows: topRows(rows, 8),
    },
    secondaryBreakdown: {
      title: 'Největší čisté změny',
      subtitle: 'Divize seřazené podle absolutního rozdílu nástupů a odchodů',
      valueLabel: 'abs. net',
      rows: Array.from(byDivision.entries())
        .map(([divisionId, row]) => {
          const netChange = row.hires - row.leavers;
          return {
            label: labels.get(divisionId) ?? divisionId,
            value: Math.abs(netChange),
            detail: `net ${formatNumber(netChange)} (${formatNumber(row.hires)} / ${formatNumber(row.leavers)})`,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    },
    table: {
      title: 'Divizní pohyb',
      subtitle: 'Připravené pro drill-down na konkrétní role a manažery',
      rows: rows.slice(0, 6).map((row) => ({
        label: row.label,
        value: formatNumber(row.value),
        secondary: formatNumber(row.secondary ?? 0),
        detail: row.detail,
      })),
    },
    executiveSignalCs: 'Pohyb zaměstnanců ukazuje, kde se kapacita reálně mění. Největší pozornost má patřit divizím s vysokým objemem nástupů i odchodů současně.',
    actions: [
      'U divizí s negativním net změnou potvrdit hiring plán a otevřené pozice.',
      'Oddělit plánovaný růst od neplánovaných odchodů.',
      'Napojit movement drill-down na attrition a recruitment funnel.',
    ],
  };
}

async function buildCostStructure({
  provider,
  section,
  period,
  kpis,
}: {
  provider: DataProvider;
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
}): Promise<SectionDashboardData> {
  const [employees, payroll, positions, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getPayroll(period),
    provider.getPositions(),
    divisionLabels(provider),
  ]);
  const employeesById = employeeMap(employees);
  const totalCost = sum(payroll, (row) => row.totalCost);
  const base = sum(payroll, (row) => row.baseSalary);
  const variable = sum(payroll, (row) => row.variable);
  const benefits = sum(payroll, (row) => row.benefits);
  const nonPersonal = sum(payroll, (row) => row.nonPersonal);
  const capFte = sum(positions, (position) => position.capFte);
  const actualFte = sum(positions, (position) => position.actualFte);
  const avgWage = mean(payroll, (row) => row.baseSalary);
  const byDivision = new Map<string, number>();
  for (const row of payroll) {
    const employee = employeesById.get(row.employeeId);
    if (employee) add(byDivision, employee.divisionId, row.totalCost);
  }
  const positionByDivision = new Map<string, Position[]>();
  for (const position of positions) {
    const rows = positionByDivision.get(position.divisionId) ?? [];
    rows.push(position);
    positionByDivision.set(position.divisionId, rows);
  }

  return {
    section,
    period,
    kpis,
    metrics: [
      { label: 'Mzdové náklady', value: formatCzkShort(totalCost), detail: 'Q1 total cost', tone: 'orange' },
      { label: 'Průměrná mzda', value: formatCzk(avgWage), detail: 'base salary / měsíc', tone: 'blue' },
      { label: 'Actual FTE', value: formatNumber(actualFte, 1), detail: `${formatPct((actualFte / Math.max(capFte, 1)) * 100)} proti cap`, tone: 'emerald' },
      { label: 'Vacancy gap', value: formatNumber(Math.max(capFte - actualFte, 0), 1), detail: 'FTE proti plánu', tone: capFte > actualFte ? 'orange' : 'zinc' },
    ],
    primaryBreakdown: {
      title: 'Struktura mzdových nákladů',
      subtitle: 'Základní mzda, variabilní složka, benefity a non-personal costs',
      valueLabel: 'Kč',
      rows: [
        { label: 'Základní mzda', value: base, detail: formatCzkShort(base) },
        { label: 'Variabilní složka', value: variable, detail: formatCzkShort(variable) },
        { label: 'Benefity', value: benefits, detail: formatCzkShort(benefits) },
        { label: 'Non-personal', value: nonPersonal, detail: formatCzkShort(nonPersonal) },
      ],
    },
    secondaryBreakdown: {
      title: 'Náklady podle divize',
      subtitle: 'Top divize podle Q1 total cost',
      valueLabel: 'Kč',
      rows: topRows(
        Array.from(byDivision.entries()).map(([divisionId, value]) => ({
          label: labels.get(divisionId) ?? divisionId,
          value,
          detail: formatCzkShort(value),
        })),
      ),
    },
    table: {
      title: 'Kapacitní plán',
      subtitle: 'Actual FTE proti cap FTE ze staffplanu',
      rows: Array.from(positionByDivision.entries())
        .map(([divisionId, rows]) => {
          const cap = sum(rows, (row) => row.capFte);
          const actual = sum(rows, (row) => row.actualFte);
          return {
            label: labels.get(divisionId) ?? divisionId,
            value: formatNumber(actual, 1),
            secondary: formatNumber(cap, 1),
            detail: `${formatPct((actual / Math.max(cap, 1)) * 100)} plnění`,
            rawGap: Math.abs(cap - actual),
          };
        })
        .sort((a, b) => b.rawGap - a.rawGap)
        .slice(0, 6)
        .map((row) => ({
          label: row.label,
          value: row.value,
          secondary: row.secondary,
          detail: row.detail,
        })),
    },
    executiveSignalCs: 'Nákladová sekce propojuje payroll a staffplan: nejde jen o sumu mezd, ale o vysvětlení, zda růst nákladu odpovídá skutečné kapacitě.',
    actions: [
      'Rozpadnout růst total cost podle divize, grade a mzdové složky.',
      'U největších vacancy gapů sladit hiring plán s budgetem.',
      'Porovnat průměrnou mzdu se segmenty s vysokou fluktuací.',
    ],
  };
}

async function buildRecruitment({
  provider,
  section,
  period,
  kpis,
}: {
  provider: DataProvider;
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
}): Promise<SectionDashboardData> {
  const [requisitions, funnel] = await Promise.all([
    provider.getRequisitions(period),
    provider.getFunnelCounts(period),
  ]);
  const filled = requisitions.filter((row) => row.hireDate);
  const critical = requisitions.filter((row) => row.critical);
  const avgCost = mean(filled, (row) => row.cost);
  const stageLabels: Record<string, string> = {
    longlist: 'Longlist',
    presented: 'Prezentováno',
    '1st_interview': '1. pohovor',
    '2nd_interview': '2. pohovor',
    offer_sent: 'Nabídka',
    hired: 'Nástup',
  };
  const stageOrder = ['longlist', 'presented', '1st_interview', '2nd_interview', 'offer_sent', 'hired'];
  const stageCounts = new Map<string, number>();
  for (const row of funnel) add(stageCounts, row.stage, row.count);
  const channelCounts = new Map<string, { open: number; hired: number; cost: number }>();
  for (const row of requisitions) {
    const item = channelCounts.get(row.channel) ?? { open: 0, hired: 0, cost: 0 };
    item.open += 1;
    if (row.hireDate) item.hired += 1;
    item.cost += row.cost;
    channelCounts.set(row.channel, item);
  }

  return {
    section,
    period,
    kpis,
    metrics: [
      { label: 'Otevřené requisitions', value: formatNumber(requisitions.length), detail: 'touch Q1 2026', tone: 'blue' },
      { label: 'Obsazeno', value: formatNumber(filled.length), detail: `${formatPct((filled.length / Math.max(requisitions.length, 1)) * 100)} conversion`, tone: 'emerald' },
      { label: 'Klíčové role', value: formatNumber(critical.length), detail: 'critical requisitions', tone: 'orange' },
      { label: 'Náklad / hire', value: formatCzk(avgCost), detail: 'obsazené role', tone: 'violet' },
    ],
    primaryBreakdown: {
      title: 'Recruitment funnel',
      subtitle: 'Kumulovaný průchod kandidátů napříč aktivními requisitions',
      valueLabel: 'kandidáti',
      rows: stageOrder.map((stage) => ({
        label: stageLabels[stage] ?? stage,
        value: stageCounts.get(stage) ?? 0,
        detail: stage === 'hired' ? 'finální nástupy' : 'objem ve fázi',
      })),
    },
    secondaryBreakdown: {
      title: 'Zdroje kandidátů',
      subtitle: 'Kanály podle počtu requisitions a obsazených rolí',
      valueLabel: 'requisitions',
      secondaryLabel: 'hired',
      rows: topRows(
        Array.from(channelCounts.entries()).map(([label, row]) => ({
          label,
          value: row.open,
          secondary: row.hired,
          detail: `${formatCzk(Math.round(row.cost / Math.max(row.open, 1)))} / req.`,
        })),
      ),
    },
    table: {
      title: 'Recruitment risk list',
      subtitle: 'Role s vysokým dopadem na rychlost a náklady náboru',
      rows: requisitions
        .slice()
        .sort((a, b) => Number(b.critical) - Number(a.critical) || b.cost - a.cost)
        .slice(0, 6)
        .map((row) => ({
          label: row.id,
          value: row.critical ? 'critical' : 'standard',
          secondary: formatCzk(row.cost),
          detail: `${row.channel} · approved ${row.approvedDate}`,
        })),
    },
    executiveSignalCs: 'Recruitment sekce propojuje rychlost, funnel a náklady. Největší riziko je kombinace critical role, drahého kanálu a nízké konverze do nástupu.',
    actions: [
      'U critical requisitions zkrátit schvalování a interview SLA.',
      'Porovnat kanály podle ceny, konverze a kvality náboru.',
      'Doplnit time-to-productivity follow-up po 90 dnech.',
    ],
  };
}

async function buildSuccession({
  provider,
  section,
  period,
  kpis,
}: {
  provider: DataProvider;
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
}): Promise<SectionDashboardData> {
  const [plans, positions, labels] = await Promise.all([
    provider.getSuccessionPlans(),
    provider.getPositions(),
    divisionLabels(provider),
  ]);
  const positionById = new Map(positions.map((position) => [position.id, position]));
  const readyNow = plans.filter((plan) => plan.readiness === 'ready_now').length;
  const readyLater = plans.filter((plan) => plan.readiness === 'ready_1_2y').length;
  const gaps = plans.filter((plan) => plan.readiness === 'gap').length;
  const byDivision = new Map<string, { covered: number; gap: number }>();
  for (const plan of plans) {
    const position = positionById.get(plan.criticalPositionId);
    if (!position) continue;
    const row = byDivision.get(position.divisionId) ?? { covered: 0, gap: 0 };
    if (plan.readiness === 'gap') row.gap += 1;
    else row.covered += 1;
    byDivision.set(position.divisionId, row);
  }

  return {
    section,
    period,
    kpis,
    metrics: [
      { label: 'Kritické role', value: formatNumber(plans.length), detail: 'v succession mapě', tone: 'violet' },
      { label: 'Ready now', value: formatNumber(readyNow), detail: formatPct((readyNow / Math.max(plans.length, 1)) * 100), tone: 'emerald' },
      { label: 'Ready 1-2 roky', value: formatNumber(readyLater), detail: 'rozvojový pipeline', tone: 'blue' },
      { label: 'Gaps', value: formatNumber(gaps), detail: 'bez nástupce', tone: gaps > 0 ? 'rose' : 'zinc' },
    ],
    primaryBreakdown: {
      title: 'Readiness portfolio',
      subtitle: 'Pokrytí klíčových rolí podle připravenosti nástupce',
      valueLabel: 'role',
      rows: [
        { label: 'Ready now', value: readyNow, detail: 'okamžité pokrytí' },
        { label: 'Ready 1-2 roky', value: readyLater, detail: 'rozvojový plán' },
        { label: 'Gap', value: gaps, detail: 'bez nástupce' },
      ],
    },
    secondaryBreakdown: {
      title: 'Gaps podle divize',
      subtitle: 'Kde je největší riziko kontinuity',
      valueLabel: 'gaps',
      secondaryLabel: 'covered',
      rows: topRows(
        Array.from(byDivision.entries()).map(([divisionId, row]) => ({
          label: labels.get(divisionId) ?? divisionId,
          value: row.gap,
          secondary: row.covered,
          detail: `${formatPct((row.covered / Math.max(row.covered + row.gap, 1)) * 100)} pokrytí`,
        })),
      ),
    },
    table: {
      title: 'Role bez pokrytí',
      subtitle: 'Vzorek pro detailní následnický plán',
      rows: plans
        .filter((plan) => plan.readiness === 'gap')
        .slice(0, 6)
        .map((plan) => {
          const position = positionById.get(plan.criticalPositionId);
          return {
            label: position?.title ?? plan.criticalPositionId,
            value: 'gap',
            secondary: position ? labels.get(position.divisionId) ?? position.divisionId : 'bez divize',
            detail: 'vyžaduje vlastníka rozvojové akce',
          };
        }),
    },
    executiveSignalCs: 'Succession dashboard ukazuje, které kritické role by v případě odchodu způsobily provozní riziko. Gaps mají být řízené jako akční backlog, ne jako statický seznam.',
    actions: [
      'Každé gap roli přiřadit HRBP a cílové datum nástupnického plánu.',
      'Ready 1-2 roky propojit s konkrétními rozvojovými aktivitami.',
      'Spojit succession gaps s retenčním rizikem klíčových pozic.',
    ],
  };
}

async function buildEngagement({
  provider,
  section,
  period,
  kpis,
}: {
  provider: DataProvider;
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
}): Promise<SectionDashboardData> {
  const [responses, events, employees, labels] = await Promise.all([
    provider.getEnpsResponses('2025-Q4'),
    provider.getWorkforceEvents(period),
    provider.getEmployees(),
    divisionLabels(provider),
  ]);
  const responded = responses.filter((row) => row.responded);
  const invited = responses.filter((row) => row.invited);
  const promoters = responded.filter((row) => row.score >= 50).length;
  const passives = responded.filter((row) => row.score >= 0 && row.score < 50).length;
  const detractors = responded.filter((row) => row.score < 0).length;
  const participation = invited.length > 0 ? (responded.length / invited.length) * 100 : 0;
  const averageScore = mean(responded, (row) => row.score);
  const byDivision = new Map<string, ENPSResponse[]>();
  for (const response of responded) {
    const rows = byDivision.get(response.segment.divisionId) ?? [];
    rows.push(response);
    byDivision.set(response.segment.divisionId, rows);
  }
  const employeesById = employeeMap(employees);
  const leaversByDivision = new Map<string, number>();
  for (const event of events.filter((row) => row.type === 'terminate')) {
    const employee = employeesById.get(event.employeeId);
    if (employee) add(leaversByDivision, employee.divisionId, 1);
  }

  return {
    section,
    period,
    kpis,
    metrics: [
      { label: 'eNPS', value: formatNumber(averageScore, 1), detail: 'poslední vlna', tone: averageScore >= 20 ? 'emerald' : 'orange' },
      { label: 'Participace', value: formatPct(participation), detail: `${formatNumber(responded.length)} odpovědí`, tone: 'blue' },
      { label: 'Promoters', value: formatNumber(promoters), detail: formatPct((promoters / Math.max(responded.length, 1)) * 100), tone: 'emerald' },
      { label: 'Detractors', value: formatNumber(detractors), detail: formatPct((detractors / Math.max(responded.length, 1)) * 100), tone: detractors > promoters ? 'rose' : 'zinc' },
    ],
    primaryBreakdown: {
      title: 'eNPS segmenty',
      subtitle: 'Rozpad odpovědí podle nálady zaměstnanců',
      valueLabel: 'odpovědi',
      rows: [
        { label: 'Promoters', value: promoters, detail: 'score >= 50' },
        { label: 'Passives', value: passives, detail: 'score 0-49' },
        { label: 'Detractors', value: detractors, detail: 'score < 0' },
      ],
    },
    secondaryBreakdown: {
      title: 'eNPS podle divize',
      subtitle: 'Nejnižší segmenty k follow-up akci',
      valueLabel: 'eNPS',
      rows: Array.from(byDivision.entries())
        .map(([divisionId, rows]) => ({
          label: labels.get(divisionId) ?? divisionId,
          value: Math.round(mean(rows, (row) => row.score) * 10) / 10,
          detail: `${formatNumber(rows.length)} odpovědí`,
        }))
        .sort((a, b) => a.value - b.value)
        .slice(0, 8),
    },
    table: {
      title: 'Engagement vs. attrition signál',
      subtitle: 'Segmenty, kde nízké eNPS potkává odchody v období',
      rows: Array.from(byDivision.entries())
        .map(([divisionId, rows]) => ({
          label: labels.get(divisionId) ?? divisionId,
          value: formatNumber(mean(rows, (row) => row.score), 1),
          secondary: formatNumber(leaversByDivision.get(divisionId) ?? 0),
          detail: 'eNPS score / odchody Q1',
          raw: mean(rows, (row) => row.score) - (leaversByDivision.get(divisionId) ?? 0),
        }))
        .sort((a, b) => a.raw - b.raw)
        .slice(0, 6)
        .map((row) => ({
          label: row.label,
          value: row.value,
          secondary: row.secondary,
          detail: row.detail,
        })),
    },
    executiveSignalCs: 'Engagement dashboard ukazuje nejen průměrné eNPS, ale segmenty pro follow-up. Největší prioritu mají týmy s nízkým score a současným retenčním tlakem.',
    actions: [
      'Pro nejnižší eNPS segmenty připravit manažerský follow-up do 30 dnů.',
      'Porovnat detractors s fluktuací a nemocností.',
      'Oddělit nízké score od nízké participace, protože vyžadují odlišnou akci.',
    ],
  };
}

async function buildTalentGrowth({
  provider,
  section,
  period,
  kpis,
}: {
  provider: DataProvider;
  section: SectionDefinition;
  period: Period;
  kpis: KpiCardModel[];
}): Promise<SectionDashboardData> {
  const [reviews, training, employees, labels] = await Promise.all([
    provider.getPerformanceReviews('2025'),
    provider.getTraining(period),
    provider.getEmployees(),
    divisionLabels(provider),
  ]);
  const employeesById = employeeMap(employees);
  const highPotential = reviews.filter((row) => row.growthPotential === 'high' || row.growthPotential === 'very_high').length;
  const topPerformance = reviews.filter((row) => row.rating >= 4).length;
  const talentPool = reviews.filter((row) => row.talentFlag).length;
  const trainingHours = sum(training, (row) => row.hours);
  const trainingCost = sum(training, (row) => row.cost);
  const potentialCounts = new Map<string, number>();
  for (const review of reviews) add(potentialCounts, review.growthPotential, 1);
  const ratingCounts = new Map<string, number>();
  for (const review of reviews) add(ratingCounts, String(review.rating), 1);
  const byDivision = new Map<string, { reviewed: number; high: number; talent: number }>();
  for (const review of reviews) {
    const employee = employeesById.get(review.employeeId);
    if (!employee) continue;
    const row = byDivision.get(employee.divisionId) ?? { reviewed: 0, high: 0, talent: 0 };
    row.reviewed += 1;
    if (review.growthPotential === 'high' || review.growthPotential === 'very_high') row.high += 1;
    if (review.talentFlag) row.talent += 1;
    byDivision.set(employee.divisionId, row);
  }

  return {
    section,
    period,
    kpis,
    metrics: [
      { label: 'High potential', value: formatPct((highPotential / Math.max(reviews.length, 1)) * 100), detail: `${formatNumber(highPotential)} lidí`, tone: 'violet' },
      { label: 'Top výkon', value: formatPct((topPerformance / Math.max(reviews.length, 1)) * 100), detail: 'rating 4-5', tone: 'emerald' },
      { label: 'Talent pool', value: formatNumber(talentPool), detail: 'flag v appraisal', tone: 'blue' },
      { label: 'Školení Q1', value: formatNumber(trainingHours, 0), detail: `${formatCzkShort(trainingCost)} investice`, tone: 'orange' },
    ],
    primaryBreakdown: {
      title: 'Růstový potenciál',
      subtitle: 'Distribuce potenciálu z ročního hodnocení',
      valueLabel: 'lidé',
      rows: [
        { label: 'Very high', value: potentialCounts.get('very_high') ?? 0, detail: 'akcelerační pool' },
        { label: 'High', value: potentialCounts.get('high') ?? 0, detail: 'talent pipeline' },
        { label: 'Medium', value: potentialCounts.get('med') ?? 0, detail: 'stabilní růst' },
        { label: 'Low', value: potentialCounts.get('low') ?? 0, detail: 'bez růstového signálu' },
      ],
    },
    secondaryBreakdown: {
      title: 'Výkonové hodnocení',
      subtitle: 'Rozdělení ratingu 1-5',
      valueLabel: 'lidé',
      rows: ['5', '4', '3', '2', '1'].map((rating) => ({
        label: `Rating ${rating}`,
        value: ratingCounts.get(rating) ?? 0,
        detail: rating === '5' || rating === '4' ? 'top výkon' : 'standard / rozvoj',
      })),
    },
    table: {
      title: 'Talent pool podle divize',
      subtitle: 'Kde je nejsilnější interní růstová kapacita',
      rows: Array.from(byDivision.entries())
        .map(([divisionId, row]) => ({
          label: labels.get(divisionId) ?? divisionId,
          value: formatPct((row.high / Math.max(row.reviewed, 1)) * 100),
          secondary: formatNumber(row.talent),
          detail: `${formatNumber(row.reviewed)} hodnocení`,
          raw: row.high,
        }))
        .sort((a, b) => b.raw - a.raw)
        .slice(0, 6)
        .map((row) => ({
          label: row.label,
          value: row.value,
          secondary: row.secondary,
          detail: row.detail,
        })),
    },
    executiveSignalCs: 'Talent & Growth ukazuje, zda má firma dostatečný interní pipeline pro další růst. Silný talent pool má být propojený se succession gaps a interní mobilitou.',
    actions: [
      'Kalibrovat high-potential segmenty mezi divizemi.',
      'Napojit talent pool na otevřené critical role a succession gaps.',
      'Vyhodnotit návratnost školení podle výkonového ratingu.',
    ],
  };
}
