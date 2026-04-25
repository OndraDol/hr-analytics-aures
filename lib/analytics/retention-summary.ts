import type { DataProvider, Period } from '@/lib/data/provider';
import type { KpiDriver, KpiEvaluation } from './types';

export interface RetentionSegment {
  divisionId: string;
  divisionName: string;
  activeHeadcount: number;
  leavers: number;
  criticalLeavers: number;
  attritionRate: number;
  riskScore: number;
}

export interface RetentionSummary {
  period: Period;
  segments: RetentionSegment[];
  totalLeavers: number;
  totalCriticalLeavers: number;
  activeHeadcount: number;
}

export async function buildRetentionSummary(
  provider: DataProvider,
  period: Period,
): Promise<RetentionSummary> {
  const [employees, events, divisions] = await Promise.all([
    provider.getEmployees(),
    provider.getWorkforceEvents(period),
    provider.getDivisions(),
  ]);
  const divisionNameById = new Map(divisions.map((division) => [division.id, division.name]));
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const byDivision = new Map<string, RetentionSegment>();

  const getSegment = (divisionId: string): RetentionSegment => {
    const existing = byDivision.get(divisionId);
    if (existing) return existing;
    const segment: RetentionSegment = {
      divisionId,
      divisionName: divisionNameById.get(divisionId) ?? divisionId,
      activeHeadcount: 0,
      leavers: 0,
      criticalLeavers: 0,
      attritionRate: 0,
      riskScore: 0,
    };
    byDivision.set(divisionId, segment);
    return segment;
  };

  for (const employee of employees) {
    if (employee.hireDate <= period.to && (!employee.terminationDate || employee.terminationDate >= period.to)) {
      getSegment(employee.divisionId).activeHeadcount += 1;
    }
  }

  for (const event of events) {
    if (event.type !== 'terminate') continue;
    const employee = employeeById.get(event.employeeId);
    if (!employee) continue;
    const segment = getSegment(employee.divisionId);
    segment.leavers += 1;
    if (employee.criticalPositionFlag) segment.criticalLeavers += 1;
  }

  const segments = Array.from(byDivision.values()).map((segment) => {
    const attritionRate =
      segment.activeHeadcount > 0 ? (segment.leavers / segment.activeHeadcount) * 100 : 0;
    const riskScore = attritionRate + segment.criticalLeavers * 8;
    return { ...segment, attritionRate, riskScore };
  });

  segments.sort((a, b) => b.riskScore - a.riskScore);

  return {
    period,
    segments,
    totalLeavers: segments.reduce((total, segment) => total + segment.leavers, 0),
    totalCriticalLeavers: segments.reduce((total, segment) => total + segment.criticalLeavers, 0),
    activeHeadcount: segments.reduce((total, segment) => total + segment.activeHeadcount, 0),
  };
}

export function driversToRiskSegments(
  drivers: readonly KpiDriver[],
  evaluation: KpiEvaluation,
): Array<{ label: string; message: string; severity: 'high' | 'medium' | 'low' }> {
  return drivers.slice(0, 3).map((driver, index) => {
    const severity = index === 0 && evaluation.status === 'red' ? 'high' : index < 2 ? 'medium' : 'low';
    return {
      label: driver.label,
      severity,
      message: `Delta ${driver.delta.toFixed(1)} proti minulému období, podíl ${(driver.share * 100).toFixed(0)} % na aktuálním driver poolu.`,
    };
  });
}
