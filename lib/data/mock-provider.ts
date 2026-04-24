import type { DataProvider, Period, CommonFilter } from '@/lib/data/provider';
import type {
  Employee,
  Position,
  Division,
  Department,
  HeadcountSnapshot,
  WorkforceEvent,
  PayrollMonth,
  AbsenceRecord,
  ShiftDay,
  RecruitmentRequisition,
  FunnelCount,
  PerformanceReview,
  ENPSResponse,
  TrainingCompletion,
  WorkAccident,
  SuccessionPlan,
} from '@/lib/types';

import { EMPLOYEES } from '@/lib/data/generated/employees';
import { POSITIONS } from '@/lib/data/generated/positions';
import { DIVISIONS } from '@/lib/data/generated/divisions';
import { DEPARTMENTS } from '@/lib/data/generated/departments';
import { PAYROLL } from '@/lib/data/generated/payroll';
import { ABSENCE } from '@/lib/data/generated/absence';
import { TRAINING } from '@/lib/data/generated/training';
import { PERFORMANCE } from '@/lib/data/generated/performance';
import { ENPS } from '@/lib/data/generated/enps';
import { ACCIDENTS } from '@/lib/data/generated/accidents';
import { SUCCESSION } from '@/lib/data/generated/succession';
import { WORKFORCE_EVENTS } from '@/lib/data/generated/workforce-events';

const inPeriod = (date: string, period: Period): boolean =>
  date >= period.from && date <= period.to;

const matchesFilter = <T extends { country?: string; divisionId?: string }>(
  row: T,
  filter: CommonFilter | undefined,
): boolean => {
  if (!filter) return true;
  if (filter.country) {
    const list: string[] = Array.isArray(filter.country) ? [...filter.country] : [filter.country];
    if (row.country && !list.includes(row.country)) return false;
  }
  if (filter.divisionIds?.length && row.divisionId && !filter.divisionIds.includes(row.divisionId)) return false;
  return true;
};

export class MockDataProvider implements DataProvider {
  async getEmployees(filter?: CommonFilter): Promise<Employee[]> {
    return EMPLOYEES.filter((e) => matchesFilter(e, filter)) as Employee[];
  }
  async getPositions(filter?: CommonFilter): Promise<Position[]> {
    return POSITIONS.filter((p) => matchesFilter(p, filter)) as Position[];
  }
  async getDivisions(): Promise<Division[]> {
    return DIVISIONS as unknown as Division[];
  }
  async getDepartments(): Promise<Department[]> {
    return DEPARTMENTS as unknown as Department[];
  }
  async getHeadcountSnapshots(_period: Period, _filter?: CommonFilter): Promise<HeadcountSnapshot[]> {
    return [];
  }
  async getWorkforceEvents(period: Period, _filter?: CommonFilter): Promise<WorkforceEvent[]> {
    return WORKFORCE_EVENTS.filter((e) => inPeriod(e.date, period)) as WorkforceEvent[];
  }
  async getPayroll(period: Period, _filter?: CommonFilter): Promise<PayrollMonth[]> {
    return PAYROLL.filter((p) => inPeriod(p.month, period)) as PayrollMonth[];
  }
  async getAbsence(period: Period, _filter?: CommonFilter): Promise<AbsenceRecord[]> {
    return ABSENCE.filter((a) => a.dateFrom >= period.from && a.dateFrom <= period.to) as AbsenceRecord[];
  }
  async getShifts(_period: Period, _filter?: CommonFilter): Promise<ShiftDay[]> {
    return [];
  }
  async getRequisitions(_period: Period, _filter?: CommonFilter): Promise<RecruitmentRequisition[]> {
    return [];
  }
  async getFunnelCounts(_period: Period, _filter?: CommonFilter): Promise<FunnelCount[]> {
    return [];
  }
  async getPerformanceReviews(cycle: string, _filter?: CommonFilter): Promise<PerformanceReview[]> {
    return PERFORMANCE.filter((p) => p.cycle === cycle) as PerformanceReview[];
  }
  async getEnpsResponses(cycle: string, _filter?: CommonFilter): Promise<ENPSResponse[]> {
    return ENPS.filter((r) => r.cycle === cycle) as ENPSResponse[];
  }
  async getTraining(period: Period, _filter?: CommonFilter): Promise<TrainingCompletion[]> {
    return TRAINING.filter((t) => inPeriod(t.date, period)) as TrainingCompletion[];
  }
  async getAccidents(period: Period, _filter?: CommonFilter): Promise<WorkAccident[]> {
    return ACCIDENTS.filter((a) => inPeriod(a.date, period)) as WorkAccident[];
  }
  async getSuccessionPlans(): Promise<SuccessionPlan[]> {
    return SUCCESSION as unknown as SuccessionPlan[];
  }
}

export const mockDataProvider = new MockDataProvider();
