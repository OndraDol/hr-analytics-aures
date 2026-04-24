import type {
  DataProvider,
  Period,
  CommonFilter,
} from '@/lib/data/provider';
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

const inPeriod = (date: string, period: Period): boolean => date >= period.from && date <= period.to;

const matchesFilter = (
  row: { country?: string; divisionId?: string },
  filter: CommonFilter | undefined,
): boolean => {
  if (!filter) return true;
  if (filter.country) {
    const list = Array.isArray(filter.country) ? filter.country : [filter.country];
    if (row.country && !list.includes(row.country as never)) return false;
  }
  if (filter.divisionIds?.length && row.divisionId && !filter.divisionIds.includes(row.divisionId)) {
    return false;
  }
  return true;
};

export class MockDataProvider implements DataProvider {
  async getEmployees(filter?: CommonFilter): Promise<Employee[]> {
    return (EMPLOYEES as unknown as Employee[]).filter((e) => matchesFilter(e, filter));
  }
  async getPositions(filter?: CommonFilter): Promise<Position[]> {
    return (POSITIONS as unknown as Position[]).filter((p) => matchesFilter(p, filter));
  }
  async getDivisions(): Promise<Division[]> {
    return DIVISIONS as unknown as Division[];
  }
  async getDepartments(): Promise<Department[]> {
    return DEPARTMENTS as unknown as Department[];
  }
  async getHeadcountSnapshots(_period: Period, _filter?: CommonFilter): Promise<HeadcountSnapshot[]> {
    // Odvození z EMPLOYEES + period — generujeme at-the-fly v analytické vrstvě (M2)
    return [];
  }
  async getWorkforceEvents(period: Period, _filter?: CommonFilter): Promise<WorkforceEvent[]> {
    return (WORKFORCE_EVENTS as unknown as WorkforceEvent[]).filter((e) => inPeriod(e.date, period));
  }
  async getPayroll(period: Period, _filter?: CommonFilter): Promise<PayrollMonth[]> {
    return (PAYROLL as unknown as PayrollMonth[]).filter((p) => inPeriod(p.month, period));
  }
  async getAbsence(period: Period, _filter?: CommonFilter): Promise<AbsenceRecord[]> {
    return (ABSENCE as unknown as AbsenceRecord[]).filter(
      (a) => a.dateFrom >= period.from && a.dateFrom <= period.to,
    );
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
    return (PERFORMANCE as unknown as PerformanceReview[]).filter((p) => p.cycle === cycle);
  }
  async getEnpsResponses(cycle: string, _filter?: CommonFilter): Promise<ENPSResponse[]> {
    return (ENPS as unknown as ENPSResponse[]).filter((r) => r.cycle === cycle);
  }
  async getTraining(period: Period, _filter?: CommonFilter): Promise<TrainingCompletion[]> {
    return (TRAINING as unknown as TrainingCompletion[]).filter((t) => inPeriod(t.date, period));
  }
  async getAccidents(period: Period, _filter?: CommonFilter): Promise<WorkAccident[]> {
    return (ACCIDENTS as unknown as WorkAccident[]).filter((a) => inPeriod(a.date, period));
  }
  async getSuccessionPlans(): Promise<SuccessionPlan[]> {
    return SUCCESSION as unknown as SuccessionPlan[];
  }
}

export const mockDataProvider = new MockDataProvider();
