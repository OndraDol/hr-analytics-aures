import type { DataProvider, Period } from '@/lib/data/provider';
import type { Employee } from '@/lib/types';
import { shiftPeriodMonths } from './date';
import type { KpiDriver, KpiEvaluation } from './types';

const employeeMap = async (provider: DataProvider): Promise<Map<string, Employee>> => {
  const employees = await provider.getEmployees();
  return new Map(employees.map((employee) => [employee.id, employee]));
};

const divisionLabels = async (provider: DataProvider): Promise<Map<string, string>> => {
  const divisions = await provider.getDivisions();
  return new Map(divisions.map((division) => [division.id, division.name]));
};

const add = (map: Map<string, number>, key: string, value: number): void => {
  map.set(key, (map.get(key) ?? 0) + value);
};

const buildDrivers = (
  current: Map<string, number>,
  previous: Map<string, number>,
  labels: Map<string, string>,
): KpiDriver[] => {
  const totalAbs = Array.from(current.values()).reduce((total, value) => total + Math.abs(value), 0);
  return Array.from(current.entries())
    .map(([id, value]) => {
      const delta = value - (previous.get(id) ?? 0);
      return {
        id,
        label: labels.get(id) ?? id,
        value,
        delta,
        share: totalAbs > 0 ? Math.abs(value) / totalAbs : 0,
      };
    })
    .sort((a, b) => Math.abs(b.delta || b.value) - Math.abs(a.delta || a.value))
    .slice(0, 5);
};

const workforceByDivision = async (
  provider: DataProvider,
  period: Period,
  code: KpiEvaluation['code'],
): Promise<Map<string, number>> => {
  const employees = await employeeMap(provider);
  const out = new Map<string, number>();
  const events = await provider.getWorkforceEvents(period);

  for (const event of events) {
    const employee = employees.get(event.employeeId);
    if (!employee) continue;
    if (code === 'WF_MOVEMENT') {
      add(out, employee.divisionId, event.type === 'hire' ? 1 : event.type === 'terminate' ? -1 : 0);
      continue;
    }
    if (event.type === 'terminate') add(out, employee.divisionId, 1);
  }

  return out;
};

const payrollByDivision = async (provider: DataProvider, period: Period): Promise<Map<string, number>> => {
  const employees = await employeeMap(provider);
  const out = new Map<string, number>();
  for (const row of await provider.getPayroll(period)) {
    const employee = employees.get(row.employeeId);
    if (employee) add(out, employee.divisionId, row.totalCost);
  }
  return out;
};

const absenceByDivision = async (provider: DataProvider, period: Period): Promise<Map<string, number>> => {
  const employees = await employeeMap(provider);
  const out = new Map<string, number>();
  for (const row of await provider.getAbsence(period)) {
    const employee = employees.get(row.employeeId);
    if (employee) add(out, employee.divisionId, row.days);
  }
  return out;
};

const headcountByDivision = async (
  provider: DataProvider,
  period: Period,
): Promise<Map<string, number>> => {
  const out = new Map<string, number>();
  for (const employee of await provider.getEmployees()) {
    if (employee.hireDate <= period.to && (!employee.terminationDate || employee.terminationDate >= period.to)) {
      add(out, employee.divisionId, 1);
    }
  }
  return out;
};

const enpsByDivision = async (provider: DataProvider): Promise<Map<string, number>> => {
  const responses = await provider.getEnpsResponses('2025-Q4');
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const response of responses) {
    add(sums, response.segment.divisionId, response.score);
    add(counts, response.segment.divisionId, 1);
  }
  const out = new Map<string, number>();
  for (const [divisionId, value] of sums) {
    out.set(divisionId, value / (counts.get(divisionId) ?? 1));
  }
  return out;
};

async function metricByDivision(
  provider: DataProvider,
  period: Period,
  evaluation: KpiEvaluation,
): Promise<Map<string, number>> {
  if (evaluation.code === 'WF_MOVEMENT' || evaluation.code === 'FLUCT' || evaluation.code === 'FLUCT_CRIT') {
    return workforceByDivision(provider, period, evaluation.code);
  }
  if (evaluation.code === 'WAGE_KPI' || evaluation.code === 'AVG_WAGE') return payrollByDivision(provider, period);
  if (evaluation.code === 'SICKNESS_RATE' || evaluation.code === 'HOLIDAY_UNTAKEN') {
    return absenceByDivision(provider, period);
  }
  if (evaluation.code === 'ENPS') return enpsByDivision(provider);
  return headcountByDivision(provider, period);
}

export async function analyzeDrivers(
  provider: DataProvider,
  evaluation: KpiEvaluation,
): Promise<KpiDriver[]> {
  const labels = await divisionLabels(provider);
  const current = await metricByDivision(provider, evaluation.period, evaluation);
  const previous = await metricByDivision(provider, shiftPeriodMonths(evaluation.period, -1), evaluation);
  return buildDrivers(current, previous, labels);
}
