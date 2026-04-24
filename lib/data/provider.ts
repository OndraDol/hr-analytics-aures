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
  Country,
  DivisionId,
} from '@/lib/types';

export interface Period {
  /** ISO YYYY-MM-DD (inclusive) */
  from: string;
  /** ISO YYYY-MM-DD (inclusive) */
  to: string;
}

export interface CommonFilter {
  country?: Country | Country[];
  divisionIds?: DivisionId[];
}

export interface DataProvider {
  // Dimensions
  getEmployees(filter?: CommonFilter): Promise<Employee[]>;
  getPositions(filter?: CommonFilter): Promise<Position[]>;
  getDivisions(): Promise<Division[]>;
  getDepartments(): Promise<Department[]>;

  // Facts
  getHeadcountSnapshots(period: Period, filter?: CommonFilter): Promise<HeadcountSnapshot[]>;
  getWorkforceEvents(period: Period, filter?: CommonFilter): Promise<WorkforceEvent[]>;
  getPayroll(period: Period, filter?: CommonFilter): Promise<PayrollMonth[]>;
  getAbsence(period: Period, filter?: CommonFilter): Promise<AbsenceRecord[]>;
  getShifts(period: Period, filter?: CommonFilter): Promise<ShiftDay[]>;
  getRequisitions(period: Period, filter?: CommonFilter): Promise<RecruitmentRequisition[]>;
  getFunnelCounts(period: Period, filter?: CommonFilter): Promise<FunnelCount[]>;
  getPerformanceReviews(cycle: string, filter?: CommonFilter): Promise<PerformanceReview[]>;
  getEnpsResponses(cycle: string, filter?: CommonFilter): Promise<ENPSResponse[]>;
  getTraining(period: Period, filter?: CommonFilter): Promise<TrainingCompletion[]>;
  getAccidents(period: Period, filter?: CommonFilter): Promise<WorkAccident[]>;
  getSuccessionPlans(): Promise<SuccessionPlan[]>;
}
