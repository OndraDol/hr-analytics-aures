import { ABSENCE } from '@/lib/data/generated/absence';
import { ACCIDENTS } from '@/lib/data/generated/accidents';
import { DEPARTMENTS } from '@/lib/data/generated/departments';
import { DIVISIONS } from '@/lib/data/generated/divisions';
import { EMPLOYEES } from '@/lib/data/generated/employees';
import { ENPS } from '@/lib/data/generated/enps';
import { FUNNEL_COUNTS } from '@/lib/data/generated/funnel-counts';
import { PAYROLL } from '@/lib/data/generated/payroll';
import { PERFORMANCE } from '@/lib/data/generated/performance';
import { POSITIONS } from '@/lib/data/generated/positions';
import { REQUISITIONS } from '@/lib/data/generated/requisitions';
import { SUCCESSION } from '@/lib/data/generated/succession';
import { TRAINING } from '@/lib/data/generated/training';
import { WORKFORCE_EVENTS } from '@/lib/data/generated/workforce-events';
import type { CommonFilter, DataProvider, Period } from '@/lib/data/provider';
import type {
  AbsenceRecord,
  Department,
  Division,
  Employee,
  ENPSResponse,
  FunnelCount,
  HeadcountSnapshot,
  PayrollMonth,
  PerformanceReview,
  Position,
  RecruitmentRequisition,
  ShiftDay,
  SuccessionPlan,
  TrainingCompletion,
  WorkforceEvent,
  WorkAccident,
} from '@/lib/types';

const employees = [...EMPLOYEES] satisfies Employee[];
const positions = [...POSITIONS] satisfies Position[];
const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
const divisionById = new Map(DIVISIONS.map((division) => [division.id, division]));

const inPeriod = (date: string, period: Period): boolean => date >= period.from && date <= period.to;

const matchesFilter = (employee: Employee | undefined, filter: CommonFilter | undefined): boolean => {
  if (!filter || !employee) return !filter;

  if (filter.country) {
    const countries = Array.isArray(filter.country) ? filter.country : [filter.country];
    if (!countries.includes(employee.country)) return false;
  }

  if (filter.divisionIds?.length && !filter.divisionIds.includes(employee.divisionId)) {
    return false;
  }

  return true;
};

const employeeMatches = (employee: Employee, filter: CommonFilter | undefined): boolean =>
  matchesFilter(employee, filter);

const factEmployeeMatches = (
  employeeId: string,
  filter: CommonFilter | undefined,
): boolean => matchesFilter(employeeById.get(employeeId), filter);

const requisitionMatches = (
  requisition: RecruitmentRequisition,
  filter: CommonFilter | undefined,
): boolean => {
  if (!filter) return true;
  if (filter.divisionIds?.length && !filter.divisionIds.includes(requisition.divisionId)) return false;
  if (filter.country) {
    const countries = Array.isArray(filter.country) ? filter.country : [filter.country];
    const division = divisionById.get(requisition.divisionId);
    if (!division || !countries.includes(division.country)) return false;
  }
  return true;
};

export class MockDataProvider implements DataProvider {
  async getEmployees(filter?: CommonFilter): Promise<Employee[]> {
    return employees.filter((employee) => employeeMatches(employee, filter));
  }

  async getPositions(filter?: CommonFilter): Promise<Position[]> {
    if (!filter?.divisionIds?.length) return positions;
    return positions.filter((position) => filter.divisionIds?.includes(position.divisionId));
  }

  async getDivisions(): Promise<Division[]> {
    return [...DIVISIONS];
  }

  async getDepartments(): Promise<Department[]> {
    return [...DEPARTMENTS];
  }

  async getHeadcountSnapshots(): Promise<HeadcountSnapshot[]> {
    return [];
  }

  async getWorkforceEvents(period: Period, filter?: CommonFilter): Promise<WorkforceEvent[]> {
    return WORKFORCE_EVENTS.filter(
      (event) => inPeriod(event.date, period) && factEmployeeMatches(event.employeeId, filter),
    );
  }

  async getPayroll(period: Period, filter?: CommonFilter): Promise<PayrollMonth[]> {
    return PAYROLL.filter(
      (row) => inPeriod(row.month, period) && factEmployeeMatches(row.employeeId, filter),
    );
  }

  async getAbsence(period: Period, filter?: CommonFilter): Promise<AbsenceRecord[]> {
    return ABSENCE.filter(
      (row) => inPeriod(row.dateFrom, period) && factEmployeeMatches(row.employeeId, filter),
    );
  }

  async getShifts(): Promise<ShiftDay[]> {
    return [];
  }

  async getRequisitions(period: Period, filter?: CommonFilter): Promise<RecruitmentRequisition[]> {
    return REQUISITIONS.filter((row) => {
      const touchesPeriod =
        inPeriod(row.approvedDate, period) ||
        (row.hireDate ? inPeriod(row.hireDate, period) : false) ||
        (row.offerDate ? inPeriod(row.offerDate, period) : false);
      return touchesPeriod && requisitionMatches(row, filter);
    });
  }

  async getFunnelCounts(period: Period): Promise<FunnelCount[]> {
    return FUNNEL_COUNTS.filter((row) => inPeriod(row.dateRecorded, period));
  }

  async getPerformanceReviews(cycle: string, filter?: CommonFilter): Promise<PerformanceReview[]> {
    return PERFORMANCE.filter(
      (row) => row.cycle === cycle && factEmployeeMatches(row.employeeId, filter),
    );
  }

  async getEnpsResponses(cycle: string, filter?: CommonFilter): Promise<ENPSResponse[]> {
    return ENPS.filter((row) => row.cycle === cycle && factEmployeeMatches(row.employeeId, filter));
  }

  async getTraining(period: Period, filter?: CommonFilter): Promise<TrainingCompletion[]> {
    return TRAINING.filter(
      (row) => inPeriod(row.date, period) && factEmployeeMatches(row.employeeId, filter),
    );
  }

  async getAccidents(period: Period, filter?: CommonFilter): Promise<WorkAccident[]> {
    return ACCIDENTS.filter((row) => {
      if (!inPeriod(row.date, period)) return false;
      if (!filter?.divisionIds?.length) return true;
      return filter.divisionIds.includes(row.divisionId);
    });
  }

  async getSuccessionPlans(): Promise<SuccessionPlan[]> {
    return [...SUCCESSION];
  }
}

export const mockDataProvider = new MockDataProvider();
