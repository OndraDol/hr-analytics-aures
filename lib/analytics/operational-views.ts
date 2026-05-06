import {
  ClipboardList,
  GitBranch,
  Leaf,
  ShieldCheck,
  SmilePlus,
  type LucideIcon,
} from 'lucide-react';
import type { DataProvider, Period } from '@/lib/data/provider';
import type { Employee, ENPSResponse } from '@/lib/types';
import type { DetailDashboardData, DetailTableRow } from './detail-types';
import { formatDivisionLabel } from './format';

export type OperationalViewSlug =
  | 'hired-fired'
  | 'org-chart'
  | 'vacation-balances'
  | 'enps-latest'
  | 'esg';

export interface OperationalViewDefinition {
  slug: OperationalViewSlug;
  href: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  accent: string;
  icon: LucideIcon;
}

export const OPERATIONAL_VIEWS: readonly OperationalViewDefinition[] = [
  {
    slug: 'hired-fired',
    href: '/operativa/hired-fired',
    title: 'Nástupy a odchody',
    shortTitle: 'Nástupy/odchody',
    eyebrow: 'Operativa M7',
    description: 'Měsíční přehled nástupů, odchodů, net změny a důvodů ukončení.',
    accent: '#2563eb',
    icon: ClipboardList,
  },
  {
    slug: 'org-chart',
    href: '/operativa/org-chart',
    title: 'Organizační struktura',
    shortTitle: 'Organizace',
    eyebrow: 'Operativa M7',
    description: 'Organizační strom po divizích, odděleních, manažerech a manažerském rozpětí.',
    accent: '#7c3aed',
    icon: GitBranch,
  },
  {
    slug: 'vacation-balances',
    href: '/operativa/vacation-balances',
    title: 'Zůstatky dovolené',
    shortTitle: 'Dovolená',
    eyebrow: 'Operativa M7',
    description: 'Zůstatky dovolené podle lidí a divizí s prioritou na vysoké nevyčerpané nároky.',
    accent: '#10b981',
    icon: Leaf,
  },
  {
    slug: 'enps-latest',
    href: '/operativa/enps-latest',
    title: 'Poslední eNPS měření',
    shortTitle: 'eNPS měření',
    eyebrow: 'Operativa M7',
    description: 'Poslední eNPS vlna, účast, mix odpovědí a segmenty pro navazující rozhovor.',
    accent: '#0ea5e9',
    icon: SmilePlus,
  },
  {
    slug: 'esg',
    href: '/operativa/esg',
    title: 'Lidé pro ESG reporting',
    shortTitle: 'ESG',
    eyebrow: 'Operativa M7',
    description: 'People datapointy pro ESG/KPMG reporting: demografie, DEI, školení a bezpečnost práce.',
    accent: '#f97316',
    icon: ShieldCheck,
  },
] as const;

export const OPERATIONAL_VIEW_BY_SLUG = new Map<OperationalViewSlug, OperationalViewDefinition>(
  OPERATIONAL_VIEWS.map((view) => [view.slug, view]),
);

export function getOperationalViewBySlug(slug: string): OperationalViewDefinition | null {
  return OPERATIONAL_VIEW_BY_SLUG.get(slug as OperationalViewSlug) ?? null;
}

const sum = <T>(rows: readonly T[], pick: (row: T) => number): number =>
  rows.reduce((total, row) => total + pick(row), 0);

const mean = <T>(rows: readonly T[], pick: (row: T) => number): number =>
  rows.length === 0 ? 0 : sum(rows, pick) / rows.length;

const formatNumber = (value: number, maximumFractionDigits = 0): string =>
  new Intl.NumberFormat('cs-CZ', { maximumFractionDigits }).format(value);

const formatPct = (value: number, maximumFractionDigits = 1): string =>
  `${formatNumber(value, maximumFractionDigits)} %`;

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

const employeeMap = (employees: readonly Employee[]): Map<string, Employee> =>
  new Map(employees.map((employee) => [employee.id, employee]));

const divisionLabels = async (provider: DataProvider): Promise<Map<string, string>> => {
  const divisions = await provider.getDivisions();
  return new Map(divisions.map((division) => [division.id, formatDivisionLabel(division.name)]));
};

const divisionCountries = async (provider: DataProvider): Promise<Map<string, string>> => {
  const divisions = await provider.getDivisions();
  return new Map(divisions.map((division) => [division.id, division.country]));
};

const topRows = <T extends { value: number }>(rows: T[], count = 8): T[] =>
  rows.sort((a, b) => b.value - a.value).slice(0, count);

export async function buildOperationalDashboard(
  provider: DataProvider,
  view: OperationalViewDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  if (view.slug === 'hired-fired') return buildHiredFired(provider, view, period);
  if (view.slug === 'org-chart') return buildOrgChart(provider, view, period);
  if (view.slug === 'vacation-balances') return buildVacationBalances(provider, view, period);
  if (view.slug === 'enps-latest') return buildEnpsLatest(provider, view, period);
  return buildEsg(provider, view, period);
}

async function buildHiredFired(
  provider: DataProvider,
  view: OperationalViewDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const [employees, events, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getWorkforceEvents(period),
    divisionLabels(provider),
  ]);
  const employeesById = employeeMap(employees);
  const hires = events.filter((event) => event.type === 'hire');
  const leavers = events.filter((event) => event.type === 'terminate');
  const byDivision = new Map<string, { hires: number; leavers: number }>();
  const reasonCounts = new Map<string, number>();

  for (const event of events) {
    const employee = employeesById.get(event.employeeId);
    if (!employee || (event.type !== 'hire' && event.type !== 'terminate')) continue;
    const row = byDivision.get(employee.divisionId) ?? { hires: 0, leavers: 0 };
    if (event.type === 'hire') row.hires += 1;
    if (event.type === 'terminate') {
      row.leavers += 1;
      add(reasonCounts, event.reason ?? 'other', 1);
    }
    byDivision.set(employee.divisionId, row);
  }

  const movementRows = Array.from(byDivision.entries()).map(([divisionId, row]) => ({
    label: labels.get(divisionId) ?? divisionId,
    value: row.hires,
    secondary: row.leavers,
    detail: `net ${formatNumber(row.hires - row.leavers)}`,
  }));

  const tableRows = events
    .filter((event) => event.type === 'hire' || event.type === 'terminate')
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)
    .map((event) => {
      const employee = employeesById.get(event.employeeId);
      return {
        label: employee ? `${employee.firstName} ${employee.lastName}` : event.employeeId,
        value: event.type === 'hire' ? 'nástup' : 'odchod',
        secondary: employee ? labels.get(employee.divisionId) ?? employee.divisionId : 'bez divize',
        detail: `${event.date}${event.reason ? ` · ${event.reason}` : ''}`,
      };
    });

  return {
    ...view,
    period,
    metrics: [
      { label: 'Nástupy', value: formatNumber(hires.length), detail: 'v období', tone: 'emerald' },
      { label: 'Odchody', value: formatNumber(leavers.length), detail: 'v období', tone: 'rose' },
      { label: 'Net změna', value: formatNumber(hires.length - leavers.length), detail: 'nástupy minus odchody', tone: hires.length >= leavers.length ? 'blue' : 'orange' },
      { label: 'Critical leavers', value: formatNumber(leavers.filter((event) => employeesById.get(event.employeeId)?.criticalPositionFlag).length), detail: 'klíčové pozice', tone: 'violet' },
    ],
    primaryBreakdown: {
      title: 'Nástupy vs. odchody',
      subtitle: 'Objem pohybu podle divize',
      valueLabel: 'nástupy',
      secondaryLabel: 'odchody',
      rows: topRows(movementRows),
    },
    secondaryBreakdown: {
      title: 'Důvody odchodů',
      subtitle: 'Hrubý rozpad termination reasons z HRIS',
      valueLabel: 'odchody',
      rows: topRows(Array.from(reasonCounts.entries()).map(([label, value]) => ({
        label,
        value,
        detail: `${formatPct((value / Math.max(leavers.length, 1)) * 100)} odchodů`,
      }))),
    },
    table: {
      title: 'Poslední pohyby',
      subtitle: 'Operativní řádkový výstup pro týdenní nebo měsíční posílání',
      rows: tableRows,
    },
    insightCs: 'Hired & fired pohled je provozní kotva pro management: rychle odpoví, kdo nastoupil, kdo odešel a kde vzniká čistá změna kapacity.',
    actions: [
      'U negativní net změny potvrdit, zda jde o plánovaný pokles nebo retenční problém.',
      'Critical odchody předat do succession a attrition deep dive.',
      'Pro týdenní export přidat country/division filtr a export do CSV.',
    ],
    relatedLinks: [
      { label: 'Nástupy a odchody', href: '/sekce/workforce-movement' },
      { label: 'Attrition deep dive', href: '/analytika/attrition' },
      { label: 'Recruitment funnel', href: '/analytika/recruitment-funnel' },
    ],
  };
}

async function buildOrgChart(
  provider: DataProvider,
  view: OperationalViewDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const [employees, departments, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getDepartments(),
    divisionLabels(provider),
  ]);
  const active = employees.filter((employee) => activeOn(employee, period.to));
  const employeesById = employeeMap(employees);
  const directReports = new Map<string, number>();
  const divisionHeadcount = new Map<string, number>();
  for (const employee of active) {
    add(divisionHeadcount, employee.divisionId, 1);
    if (employee.managerId) add(directReports, employee.managerId, 1);
  }
  const managers = active.filter((employee) => (directReports.get(employee.id) ?? 0) > 0);
  const avgSpan = mean(managers, (manager) => directReports.get(manager.id) ?? 0);
  const spanRows = managers
    .map((manager) => ({
      label: `${manager.firstName} ${manager.lastName}`,
      value: directReports.get(manager.id) ?? 0,
      secondary: manager.grade === 'IC' ? 0 : 1,
      detail: `${labels.get(manager.divisionId) ?? manager.divisionId} · ${manager.grade}`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const departmentRows = departments
    .slice(0, 12)
    .map((department) => {
      const head = department.headEmployeeId ? employeesById.get(department.headEmployeeId) : null;
      const headcount = active.filter((employee) => employee.departmentId === department.id).length;
      return {
        label: department.name,
        value: formatNumber(headcount),
        secondary: labels.get(department.divisionId) ?? department.divisionId,
        detail: head ? `vedoucí ${head.firstName} ${head.lastName}` : 'vedoucí není v datech',
      };
    });

  return {
    ...view,
    period,
    metrics: [
      { label: 'Aktivní HC', value: formatNumber(active.length), detail: 'ke konci období', tone: 'blue' },
      { label: 'Manažeři', value: formatNumber(managers.length), detail: `${formatNumber(avgSpan, 1)} direct reports avg`, tone: 'violet' },
      { label: 'Oddělení', value: formatNumber(departments.length), detail: 'department dimension', tone: 'zinc' },
      { label: 'Wide spans', value: formatNumber(spanRows.filter((row) => row.value >= 9).length), detail: '>= 9 direct reports', tone: spanRows.some((row) => row.value >= 9) ? 'orange' : 'emerald' },
    ],
    primaryBreakdown: {
      title: 'Headcount podle divize',
      subtitle: 'Org chart top-level rozpad',
      valueLabel: 'HC',
      rows: topRows(Array.from(divisionHeadcount.entries()).map(([divisionId, value]) => ({
        label: labels.get(divisionId) ?? divisionId,
        value,
        detail: `${formatPct((value / Math.max(active.length, 1)) * 100)} populace`,
      }))),
    },
    secondaryBreakdown: {
      title: 'Manažerské rozpětí',
      subtitle: 'Největší direct-report spany v aktuální struktuře',
      valueLabel: 'direct reports',
      secondaryLabel: 'manager level',
      rows: spanRows,
    },
    table: {
      title: 'Oddělení',
      subtitle: 'Vzorek org jednotek pro stromový detail',
      rows: departmentRows,
    },
    insightCs: 'Org chart pohled ukazuje, kde je organizace řízená přes široké manažerské spany a kde chybí explicitní vedoucí oddělení. To je důležité pro interpretaci engagementu, absence i fluktuace.',
    actions: [
      'Doplnit vlastníky oddělení tam, kde chybí headEmployeeId.',
      'Prověřit manažery s extrémním spanem a porovnat jejich týmy s eNPS.',
      'V další iteraci přidat expandable strom do úrovně manager -> team.',
    ],
    relatedLinks: [
      { label: 'Succession', href: '/sekce/succession' },
      { label: 'eNPS latest', href: '/operativa/enps-latest' },
      { label: 'Absence & coverage', href: '/analytika/absence-coverage' },
    ],
  };
}

async function buildVacationBalances(
  provider: DataProvider,
  view: OperationalViewDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const yearStart: Period = { from: `${period.to.slice(0, 4)}-01-01`, to: period.to };
  const [employees, absence, labels] = await Promise.all([
    provider.getEmployees(),
    provider.getAbsence(yearStart),
    divisionLabels(provider),
  ]);
  const active = employees.filter((employee) => activeOn(employee, period.to));
  const vacationByEmployee = new Map<string, number>();
  for (const row of absence.filter((item) => item.type === 'vacation')) {
    add(vacationByEmployee, row.employeeId, row.days);
  }
  const accruedDays = 25 * (Number(period.to.slice(5, 7)) / 12);
  const balances = active.map((employee) => ({
    employee,
    balance: Math.max(0, accruedDays - (vacationByEmployee.get(employee.id) ?? 0)),
  }));
  const byDivision = new Map<string, number>();
  for (const row of balances) add(byDivision, row.employee.divisionId, row.balance);
  const bucketRows = [
    { label: '0-3 dny', from: 0, to: 3 },
    { label: '3-6 dnů', from: 3, to: 6 },
    { label: '6-10 dnů', from: 6, to: 10 },
    { label: '10+ dnů', from: 10, to: 999 },
  ].map((bucket) => {
    const count = balances.filter((row) => row.balance > bucket.from && row.balance <= bucket.to).length;
    return {
      label: bucket.label,
      value: count,
      detail: `${formatPct((count / Math.max(balances.length, 1)) * 100)} aktivních`,
    };
  });
  const highBalances = balances.sort((a, b) => b.balance - a.balance).slice(0, 12);
  const totalBalance = sum(balances, (row) => row.balance);

  return {
    ...view,
    period,
    metrics: [
      { label: 'Zůstatek celkem', value: formatNumber(totalBalance, 0), detail: 'odhad dnů', tone: 'violet' },
      { label: 'Průměr / osoba', value: formatNumber(totalBalance / Math.max(active.length, 1), 1), detail: 'dne dovolené', tone: 'blue' },
      { label: '10+ dnů', value: formatNumber(bucketRows.find((row) => row.label === '10+ dnů')?.value ?? 0), detail: 'prioritní follow-up', tone: 'orange' },
      { label: 'Čerpáno YTD', value: formatNumber(sum(absence.filter((row) => row.type === 'vacation'), (row) => row.days), 0), detail: 'dny z absence feedu', tone: 'emerald' },
    ],
    primaryBreakdown: {
      title: 'Zůstatky podle divize',
      subtitle: 'Odhad nevyčerpaných dnů z dovolené YTD',
      valueLabel: 'dny',
      rows: topRows(Array.from(byDivision.entries()).map(([divisionId, value]) => ({
        label: labels.get(divisionId) ?? divisionId,
        value: Math.round(value * 10) / 10,
        detail: `${formatNumber(value / Math.max(active.filter((employee) => employee.divisionId === divisionId).length, 1), 1)} dne / osoba`,
      }))),
    },
    secondaryBreakdown: {
      title: 'Distribuce zůstatků',
      subtitle: 'Kolik lidí spadá do jednotlivých dovolenkových pásem',
      valueLabel: 'lidé',
      rows: bucketRows,
    },
    table: {
      title: 'Nejvyšší zůstatky',
      subtitle: 'Operativní seznam pro manažerské plánování čerpání',
      rows: highBalances.map((row) => ({
        label: `${row.employee.firstName} ${row.employee.lastName}`,
        value: `${formatNumber(row.balance, 1)} dne`,
        secondary: labels.get(row.employee.divisionId) ?? row.employee.divisionId,
        detail: `${row.employee.grade} · čerpáno ${formatNumber(vacationByEmployee.get(row.employee.id) ?? 0, 1)} dne YTD`,
      })),
    },
    insightCs: 'Vacation balances má být operativní report pro řízení čerpání, ne jen roční závěrka. Nejvyšší zůstatky mají být řešené průběžně, protože na konci roku zhorší coverage i náklad.',
    actions: [
      'Poslat manažerům seznam lidí s nejvyšším zůstatkem a termínem plánu čerpání.',
      'V divizích s vysokým součtem porovnat dovolené s absence coverage.',
      'Přidat export do payroll procesu před měsíční uzávěrkou.',
    ],
    relatedLinks: [
      { label: 'Absence & coverage', href: '/analytika/absence-coverage' },
      { label: 'Náklady a struktura', href: '/sekce/cost-structure' },
      { label: 'Org chart', href: '/operativa/org-chart' },
    ],
  };
}

async function buildEnpsLatest(
  provider: DataProvider,
  view: OperationalViewDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const [responses, labels] = await Promise.all([
    provider.getEnpsResponses('2025-Q4'),
    divisionLabels(provider),
  ]);
  const invited = responses.filter((response) => response.invited);
  const responded = responses.filter((response) => response.responded);
  const promoters = responded.filter((response) => response.score >= 50).length;
  const passives = responded.filter((response) => response.score >= 0 && response.score < 50).length;
  const detractors = responded.filter((response) => response.score < 0).length;
  const score = mean(responded, (response) => response.score);
  const byDivision = new Map<string, ENPSResponse[]>();
  for (const response of responded) {
    const rows = byDivision.get(response.segment.divisionId) ?? [];
    rows.push(response);
    byDivision.set(response.segment.divisionId, rows);
  }
  const segmentRows = Array.from(byDivision.entries())
    .map(([divisionId, rows]) => ({
      label: labels.get(divisionId) ?? divisionId,
      value: Math.round(mean(rows, (row) => row.score) * 10) / 10,
      secondary: rows.length,
      detail: `${formatNumber(rows.filter((row) => row.score < 0).length)} detractors`,
    }))
    .sort((a, b) => a.value - b.value);

  return {
    ...view,
    period,
    metrics: [
      { label: 'eNPS score', value: formatNumber(score, 1), detail: '2025-Q4 vlna', tone: score >= 20 ? 'emerald' : 'orange' },
      { label: 'Participace', value: formatPct((responded.length / Math.max(invited.length, 1)) * 100), detail: `${formatNumber(responded.length)} odpovědí`, tone: 'blue' },
      { label: 'Promoters', value: formatNumber(promoters), detail: formatPct((promoters / Math.max(responded.length, 1)) * 100), tone: 'emerald' },
      { label: 'Detractors', value: formatNumber(detractors), detail: formatPct((detractors / Math.max(responded.length, 1)) * 100), tone: detractors > promoters ? 'rose' : 'zinc' },
    ],
    primaryBreakdown: {
      title: 'Mix odpovědí',
      subtitle: 'Promoters, passives a detractors',
      valueLabel: 'odpovědi',
      rows: [
        { label: 'Promoters', value: promoters, detail: 'score >= 50' },
        { label: 'Passives', value: passives, detail: 'score 0-49' },
        { label: 'Detractors', value: detractors, detail: 'score < 0' },
      ],
    },
    secondaryBreakdown: {
      title: 'Nejslabší segmenty',
      subtitle: 'Divize seřazené podle eNPS score od nejnižšího',
      valueLabel: 'eNPS',
      secondaryLabel: 'odpovědi',
      rows: segmentRows.slice(0, 8),
    },
    table: {
      title: 'Follow-up backlog',
      subtitle: 'Segmenty, kde má HRBP otevřít manažerskou diskuzi',
      rows: segmentRows.slice(0, 10).map((row) => ({
        label: row.label,
        value: formatNumber(row.value, 1),
        secondary: formatNumber(row.secondary ?? 0),
        detail: row.detail,
      })),
    },
    insightCs: 'eNPS latest převádí poslední vlnu do akčního seznamu. Slabé segmenty je potřeba řešit odděleně podle score a participace; nízké score s nízkou participací vyžaduje jiný follow-up než hlasitý detractor segment.',
    actions: [
      'Do 30 dnů otevřít follow-up v nejslabších divizích.',
      'Porovnat detractor segmenty s attrition a nemocností.',
      'Připravit další vlnu s jasnou segmentací pro manažery.',
    ],
    relatedLinks: [
      { label: 'Engagement', href: '/sekce/engagement' },
      { label: 'Attrition correlation', href: '/analytika/attrition' },
      { label: 'Org chart', href: '/operativa/org-chart' },
    ],
  };
}

async function buildEsg(
  provider: DataProvider,
  view: OperationalViewDefinition,
  period: Period,
): Promise<DetailDashboardData> {
  const reviewCycle = Number(period.to.slice(0, 4)) >= 2025 ? '2025' : period.to.slice(0, 4);
  const [employees, events, accidents, training, reviews, labels, countries] = await Promise.all([
    provider.getEmployees(),
    provider.getWorkforceEvents({ from: `${period.to.slice(0, 4)}-01-01`, to: period.to }),
    provider.getAccidents(period),
    provider.getTraining(period),
    provider.getPerformanceReviews(reviewCycle),
    divisionLabels(provider),
    divisionCountries(provider),
  ]);
  const active = employees.filter((employee) => activeOn(employee, period.to));
  const women = active.filter((employee) => employee.gender === 'female');
  const managers = active.filter((employee) => employee.grade === 'B0' || employee.grade === 'B1' || employee.grade === 'B2');
  const womenManagers = managers.filter((employee) => employee.gender === 'female');
  const avgAge = mean(active, (employee) => ageAt(employee.birthDate, period.to));
  const avgManagerAge = mean(managers, (employee) => ageAt(employee.birthDate, period.to));
  const leavers = events.filter((event) => event.type === 'terminate');
  const contractTypes = new Set(active.map((employee) => employee.employmentType));
  const nationalities = new Set(active.map((employee) => employee.nationality));
  const externalWorkers = active.filter((employee) => employee.employmentType === 'ICO' || employee.employmentType === 'DPP' || employee.employmentType === 'DPČ');
  const countryCounts = new Map<string, number>();
  for (const employee of active) add(countryCounts, countries.get(employee.divisionId) ?? employee.country, 1);
  const accidentsByDivision = new Map<string, number>();
  for (const accident of accidents) add(accidentsByDivision, accident.divisionId, 1);
  const trainingHours = sum(training, (row) => row.hours);
  const trainingAreas = new Set(training.map((row) => row.area));
  const reviewCoverage = (reviews.length / Math.max(active.length, 1)) * 100;

  const datapoints: DetailTableRow[] = [
    { label: 'Počet zaměstnanců podle země', value: formatNumber(active.length), secondary: 'ready', dataQuality: 'ready', detail: 'country breakdown v grafu' },
    { label: 'Zaměstnanci podle typu pracovního úvazku', value: formatNumber(contractTypes.size), secondary: 'ready', dataQuality: 'ready', detail: 'PP/DPP/DPČ/STATUTAR/ICO/UCEN' },
    { label: 'Struktura zaměstnanců podle pohlaví', value: formatPct((women.length / Math.max(active.length, 1)) * 100), secondary: 'ready', dataQuality: 'ready', detail: 'male/female podle HRIS skeletonu' },
    { label: 'Struktura managementu podle pohlaví', value: formatPct((womenManagers.length / Math.max(managers.length, 1)) * 100), secondary: 'needs validation', dataQuality: 'needs-validation', detail: 'B0-B2 heuristika grade levelu' },
    { label: 'Roční fluktuace zaměstnanců podle země', value: formatNumber(leavers.length), secondary: 'ready', dataQuality: 'ready', detail: 'YTD leavers, country segmentace přes HRIS' },
    { label: 'Hodnocení náborového procesu', value: '4,1', secondary: 'mock', dataQuality: 'mock', detail: 'Employer Evaluation KPI, recruiter rating není v raw exportu plně auditní' },
    { label: 'Roční fluktuace podle typu pracovní pozice', value: formatNumber(leavers.length), secondary: 'partial', dataQuality: 'partial', detail: 'job type je odvozený z role family/grade heuristiky' },
    { label: '% zaměstnanců s hodnocením výkonu', value: formatPct(reviewCoverage), secondary: 'mock', dataQuality: 'mock', detail: 'annual appraisal fakta z mock vrstvy' },
    { label: 'Školení podle oblasti zaměření', value: formatNumber(trainingAreas.size), secondary: 'mock', dataQuality: 'mock', detail: 'generated L&D areas' },
    { label: 'Počet hodin školení a účastníků', value: formatNumber(trainingHours), secondary: 'mock', dataQuality: 'mock', detail: `${formatNumber(new Set(training.map((row) => row.employeeId)).size)} účastníků` },
    { label: 'Počet hodin školení na zaměstnance', value: formatNumber(trainingHours / Math.max(active.length, 1), 1), secondary: 'mock', dataQuality: 'mock', detail: 'training hours / active HC' },
    { label: 'Státní příslušnost podle země', value: formatNumber(nationalities.size), secondary: 'ready', dataQuality: 'ready', detail: 'nationality atribut v employee skeletonu' },
    { label: 'Věková struktura zaměstnanců', value: formatNumber(avgAge, 1), secondary: 'ready', dataQuality: 'ready', detail: 'průměrný věk, detailní histogram v přehledu lidí' },
    { label: 'Věková struktura managementu', value: formatNumber(avgManagerAge, 1), secondary: 'needs validation', dataQuality: 'needs-validation', detail: 'management = B0-B2 heuristika' },
    { label: 'Management podle pohlaví', value: formatPct((womenManagers.length / Math.max(managers.length, 1)) * 100), secondary: 'needs validation', dataQuality: 'needs-validation', detail: 'duplicitní ESG požadavek ze sheetu' },
    { label: 'Pracovní úrazy', value: formatNumber(accidents.length), secondary: 'mock', dataQuality: 'mock', detail: 'generated BOZP fakta podle divize' },
    { label: 'ESRS S1-6 Pohlaví', value: formatPct((women.length / Math.max(active.length, 1)) * 100), secondary: 'ready', dataQuality: 'ready', detail: 'gender datapoint' },
    { label: 'ESRS S1-6 Fluktuace', value: formatNumber(leavers.length), secondary: 'ready', dataQuality: 'ready', detail: 'turnover datapoint z workforce events' },
    { label: 'ESRS S1-7 Nezaměstnanci', value: formatNumber(externalWorkers.length), secondary: 'partial', dataQuality: 'partial', detail: 'DPP/DPČ/ICO proxy, vyžaduje HR potvrzení' },
    { label: 'ESRS S1-11 Sociální ochrana', value: 'scope', secondary: 'blocked', dataQuality: 'blocked', detail: 'není ve zdrojových datech pro prezentační prototyp' },
    { label: 'ESRS S1-13 Vzdělávání', value: formatNumber(trainingHours), secondary: 'mock', dataQuality: 'mock', detail: 'training datapoint z L&D generátoru' },
  ];

  return {
    ...view,
    period,
    metrics: [
      { label: 'Ženy celkem', value: formatPct((women.length / Math.max(active.length, 1)) * 100), detail: `${formatNumber(women.length)} z ${formatNumber(active.length)}`, tone: 'emerald' },
      { label: 'Ženy management', value: formatPct((womenManagers.length / Math.max(managers.length, 1)) * 100), detail: 'B0-B2 heuristika', tone: 'blue' },
      { label: 'Průměrný věk', value: formatNumber(avgAge, 1), detail: 'aktivní populace', tone: 'zinc' },
      { label: 'Accidents', value: formatNumber(accidents.length), detail: 'Q1 safety facts', tone: accidents.length > 0 ? 'orange' : 'emerald' },
    ],
    primaryBreakdown: {
      title: 'Populace podle země',
      subtitle: 'ESG headcount rozpad podle země divize',
      valueLabel: 'HC',
      rows: Array.from(countryCounts.entries()).map(([label, value]) => ({
        label,
        value,
        detail: `${formatPct((value / Math.max(active.length, 1)) * 100)} populace`,
      })),
    },
    secondaryBreakdown: {
      title: 'Work accidents podle divize',
      subtitle: 'Bezpečnost práce jako people ESG datapoint',
      valueLabel: 'úrazy',
      rows: topRows(Array.from(accidentsByDivision.entries()).map(([divisionId, value]) => ({
        label: labels.get(divisionId) ?? divisionId,
        value,
        detail: 'Q1 incidenty v mock BOZP datech',
      }))),
    },
    table: {
      title: 'ESG datapoint readiness',
      subtitle: 'Které people indikátory jsou připravené pro reporting a které chtějí validaci',
      rows: datapoints,
    },
    insightCs: 'ESG pohled odděluje tvrdé datapointy od položek, které stojí na heuristice nebo mock generátoru. To snižuje riziko, že demo bude působit jako finální auditní reporting.',
    actions: [
      'S HR potvrdit definici management levelu pro women-in-management KPI.',
      'Napojit training a accidents na finální systémy nebo označit jako mock-only.',
      'Připravit export datapointů pro ESG/KPMG kontrolu.',
    ],
    relatedLinks: [
      { label: 'Stav zaměstnanců', href: '/sekce/hr-statistics' },
      { label: 'Compensation & pay gap', href: '/analytika/compensation-pay-gap' },
      { label: 'Vacation balances', href: '/operativa/vacation-balances' },
    ],
  };
}
