import type { CommonFilter, DataProvider, Period } from '@/lib/data/provider';
import type { Employee, RecruitmentRequisition } from '@/lib/types';
import { daysInPeriod, monthPeriodsEnding, periodLabel, shiftPeriodMonths } from './date';
import { formatKpiValue } from './format';
import type { KpiEvaluation, KpiEvaluationContext, KpiSparkPoint } from './types';
import {
  getKpiDefinition,
  type KpiCode,
  type KpiDefinition,
  type KpiStatus,
} from '@/lib/kpi/catalog';
import {
  calculateSeverityScore,
  evaluateThresholdDistance,
  getThresholdMetadata,
  getThresholdRationale,
  statusFor,
} from '@/lib/kpi/thresholds';

const FALLBACK_VALUES: Record<KpiCode, number> = {
  HR_STATS: 1_735,
  WF_MOVEMENT: 0,
  HOLIDAY_UNTAKEN: 11.5,
  SICKNESS_RATE: 3.2,
  SHIFT_COVERAGE: 96.4,
  WAGE_KPI: 480_000_000,
  CAP_KPI: 93,
  HC_FTE_DIV: 1_735,
  AVG_WAGE: 48_000,
  TTF: 31,
  TTF_CRIT: 43,
  TIME_TO_PROD: 3.4,
  CPH: 52_000,
  QUALITY_HIRE: 68,
  EMPLOYER_EVAL: 4.1,
  FLUCT: 26,
  FLUCT_CRIT: 8,
  SUCCESSION: 76,
  ENPS: 12,
  TALENT_GROWTH: 24,
};

const isActiveOn = (employee: Employee, isoDate: string): boolean =>
  employee.hireDate <= isoDate && (!employee.terminationDate || employee.terminationDate >= isoDate);

const activeEmployeesAt = async (
  provider: DataProvider,
  isoDate: string,
  filter?: CommonFilter,
): Promise<Employee[]> => {
  const employees = await provider.getEmployees(filter);
  return employees.filter((employee) => isActiveOn(employee, isoDate));
};

const activeAverageHeadcount = async (
  provider: DataProvider,
  period: Period,
  filter?: CommonFilter,
): Promise<number> => {
  const start = await activeEmployeesAt(provider, period.from, filter);
  const end = await activeEmployeesAt(provider, period.to, filter);
  return (start.length + end.length) / 2 || end.length || start.length;
};

const sum = <T>(rows: readonly T[], pickValue: (row: T) => number): number =>
  rows.reduce((total, row) => total + pickValue(row), 0);

const mean = <T>(rows: readonly T[], pickValue: (row: T) => number): number => {
  if (rows.length === 0) return 0;
  return sum(rows, pickValue) / rows.length;
};

const diffDays = (fromIso: string, toIso: string): number => {
  const from = Date.parse(`${fromIso}T00:00:00.000Z`);
  const to = Date.parse(`${toIso}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return 0;
  return Math.round((to - from) / 86_400_000);
};

const cycleForPeriod = (period: Period): string => {
  const year = Number(period.to.slice(0, 4));
  if (year >= 2025) return '2025';
  if (year <= 2024) return '2024';
  return String(year);
};

const enpsCycleForPeriod = (period: Period): string => {
  const year = Number(period.to.slice(0, 4));
  return year >= 2025 ? '2025-Q4' : `${year}-Q4`;
};

const stableFallback = (code: KpiCode, period: Period): number => {
  const base = FALLBACK_VALUES[code];
  const month = Number(period.to.slice(5, 7));
  if (!Number.isFinite(month)) return base;
  const wave = Math.sin(month / 2) * 0.04;
  return Math.round(base * (1 + wave) * 10) / 10;
};

const averageTimeToFill = (requisitions: readonly RecruitmentRequisition[]): number => {
  const filled = requisitions.filter((row) => row.approvedDate && row.hireDate);
  if (filled.length === 0) return 0;
  return mean(filled, (row) => diffDays(row.approvedDate, row.hireDate ?? row.approvedDate));
};

const averageCostPerHire = (requisitions: readonly RecruitmentRequisition[]): number => {
  const filled = requisitions.filter((row) => row.hireDate && row.cost > 0);
  if (filled.length === 0) return 0;
  return mean(filled, (row) => row.cost);
};

export function evaluateStatus(definition: KpiDefinition, value: number): KpiStatus {
  return statusFor(definition, value);
}

export function deltaVsTarget(definition: KpiDefinition, value: number): number | null {
  const target = definition.thresholds.target;
  return target == null ? null : value - target;
}

async function calculateKpiValue(
  provider: DataProvider,
  code: KpiCode,
  period: Period,
  filter?: CommonFilter,
): Promise<{ value: number; dataQuality: KpiEvaluation['dataQuality'] }> {
  if (code === 'HR_STATS') {
    return { value: (await activeEmployeesAt(provider, period.to, filter)).length, dataQuality: 'hybrid' };
  }

  if (code === 'HC_FTE_DIV') {
    const employees = await activeEmployeesAt(provider, period.to, filter);
    return { value: sum(employees, (employee) => employee.fte), dataQuality: 'hybrid' };
  }

  if (code === 'WF_MOVEMENT') {
    const events = await provider.getWorkforceEvents(period, filter);
    const hires = events.filter((event) => event.type === 'hire').length;
    const terms = events.filter((event) => event.type === 'terminate').length;
    return { value: hires - terms, dataQuality: 'real' };
  }

  if (code === 'FLUCT' || code === 'FLUCT_CRIT') {
    const events = await provider.getWorkforceEvents(period, filter);
    const employees = await provider.getEmployees(filter);
    const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
    const terms = events.filter((event) => {
      if (event.type !== 'terminate') return false;
      if (code === 'FLUCT') return true;
      return employeeById.get(event.employeeId)?.criticalPositionFlag === true;
    }).length;
    let denominator: number;
    if (code === 'FLUCT') {
      denominator = await activeAverageHeadcount(provider, period, filter);
    } else {
      const startCritical = (await activeEmployeesAt(provider, period.from, filter)).filter(
        (employee) => employee.criticalPositionFlag,
      );
      const endCritical = (await activeEmployeesAt(provider, period.to, filter)).filter(
        (employee) => employee.criticalPositionFlag,
      );
      const pool = new Set<string>([
        ...startCritical.map((employee) => employee.id),
        ...endCritical.map((employee) => employee.id),
      ]);
      denominator = pool.size || endCritical.length;
    }
    return { value: denominator > 0 ? (terms / denominator) * 100 : 0, dataQuality: 'hybrid' };
  }

  if (code === 'HOLIDAY_UNTAKEN') {
    const activeEmployees = await activeEmployeesAt(provider, period.to, filter);
    if (activeEmployees.length === 0) return { value: 0, dataQuality: 'hybrid' };
    const yearStart: Period = { from: `${period.to.slice(0, 4)}-01-01`, to: period.to };
    const vacationDays = sum(
      (await provider.getAbsence(yearStart, filter)).filter((row) => row.type === 'vacation'),
      (row) => row.days,
    );
    const accruedDays = activeEmployees.length * 25 * (Number(period.to.slice(5, 7)) / 12);
    return {
      value: Math.max(0, (accruedDays - vacationDays) / activeEmployees.length),
      dataQuality: 'mock',
    };
  }

  if (code === 'SICKNESS_RATE') {
    const activeHeadcount = await activeAverageHeadcount(provider, period, filter);
    const sickDays = sum(
      (await provider.getAbsence(period, filter)).filter((row) => row.type === 'sick'),
      (row) => row.days,
    );
    const workingDays = daysInPeriod(period) * (5 / 7) * activeHeadcount;
    return { value: workingDays > 0 ? (sickDays / workingDays) * 100 : 0, dataQuality: 'mock' };
  }

  if (code === 'SHIFT_COVERAGE') {
    const sickness = await calculateKpiValue(provider, 'SICKNESS_RATE', period, filter);
    return { value: Math.max(88, 98 - sickness.value * 0.35), dataQuality: 'mock' };
  }

  if (code === 'WAGE_KPI') {
    const payroll = await provider.getPayroll(period, filter);
    return { value: sum(payroll, (row) => row.totalCost), dataQuality: 'mock' };
  }

  if (code === 'AVG_WAGE') {
    const payroll = await provider.getPayroll(period, filter);
    const rowsWithSalary = payroll.filter((row) => row.baseSalary > 0);
    return { value: mean(rowsWithSalary, (row) => row.baseSalary), dataQuality: 'mock' };
  }

  if (code === 'CAP_KPI') {
    const positions = await provider.getPositions(filter);
    const cap = sum(positions, (position) => position.capFte);
    const actual = sum(positions, (position) => position.actualFte);
    return { value: cap > 0 ? (actual / cap) * 100 : 0, dataQuality: 'hybrid' };
  }

  if (code === 'TTF' || code === 'TTF_CRIT' || code === 'CPH') {
    const requisitions = await provider.getRequisitions(period, filter);
    const scoped = code === 'TTF_CRIT' ? requisitions.filter((row) => row.critical) : requisitions;
    if (scoped.length === 0) return { value: stableFallback(code, period), dataQuality: 'mock' };
    const value = code === 'CPH' ? averageCostPerHire(scoped) : averageTimeToFill(scoped);
    return { value: value || stableFallback(code, period), dataQuality: 'hybrid' };
  }

  if (code === 'QUALITY_HIRE') {
    const reviews = await provider.getPerformanceReviews(cycleForPeriod(period), filter);
    if (reviews.length === 0) return { value: stableFallback(code, period), dataQuality: 'mock' };
    return {
      value: (reviews.filter((review) => review.rating >= 4).length / reviews.length) * 100,
      dataQuality: 'mock',
    };
  }

  if (code === 'TIME_TO_PROD' || code === 'EMPLOYER_EVAL') {
    return { value: stableFallback(code, period), dataQuality: 'mock' };
  }

  if (code === 'SUCCESSION') {
    const plans = await provider.getSuccessionPlans();
    if (plans.length === 0) return { value: stableFallback(code, period), dataQuality: 'mock' };
    return {
      value: (plans.filter((plan) => plan.readiness !== 'gap').length / plans.length) * 100,
      dataQuality: 'mock',
    };
  }

  if (code === 'ENPS') {
    const responses = await provider.getEnpsResponses(enpsCycleForPeriod(period), filter);
    if (responses.length === 0) return { value: stableFallback(code, period), dataQuality: 'mock' };
    return { value: mean(responses, (response) => response.score), dataQuality: 'mock' };
  }

  if (code === 'TALENT_GROWTH') {
    const reviews = await provider.getPerformanceReviews(cycleForPeriod(period), filter);
    if (reviews.length === 0) return { value: stableFallback(code, period), dataQuality: 'mock' };
    const highPotential = reviews.filter(
      (review) => review.growthPotential === 'high' || review.growthPotential === 'very_high',
    ).length;
    return { value: (highPotential / reviews.length) * 100, dataQuality: 'mock' };
  }

  return { value: stableFallback(code, period), dataQuality: 'mock' };
}

export async function evaluateKpi(
  provider: DataProvider,
  code: KpiCode,
  context: KpiEvaluationContext,
): Promise<KpiEvaluation> {
  const definition = getKpiDefinition(code);
  const current = await calculateKpiValue(provider, code, context.period, context.filter);
  const previous = await calculateKpiValue(
    provider,
    code,
    shiftPeriodMonths(context.period, -1),
    context.filter,
  );
  const previousYear = await calculateKpiValue(
    provider,
    code,
    shiftPeriodMonths(context.period, -12),
    context.filter,
  );
  const sparkline: KpiSparkPoint[] = [];

  for (const monthPeriod of monthPeriodsEnding(context.period.to, 12)) {
    const point = await calculateKpiValue(provider, code, monthPeriod, context.filter);
    sparkline.push({ period: periodLabel(monthPeriod), value: point.value });
  }
  const status = evaluateStatus(definition, current.value);
  const thresholdDistance = evaluateThresholdDistance(definition, current.value);
  const thresholdMetadata = getThresholdMetadata(definition);
  const severity = calculateSeverityScore(
    definition,
    current.value,
    status,
    current.value - previous.value,
    current.dataQuality,
  );

  return {
    code,
    definition,
    value: current.value,
    formattedValue: formatKpiValue(current.value, definition.unit),
    status,
    deltaVsTarget: deltaVsTarget(definition, current.value),
    thresholdDistance,
    thresholdMetadata,
    thresholdRationaleCs: getThresholdRationale(definition),
    severityScore: severity.score,
    severityBreakdown: severity.breakdown,
    trend: {
      previousValue: previous.value,
      mom: current.value - previous.value,
      yoy: current.value - previousYear.value,
    },
    sparkline,
    period: context.period,
    dataQuality: current.dataQuality,
  };
}
