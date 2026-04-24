// ===== Identifiers =====
export type EmployeeId = string;          // OSČPV, např. "23_4002.05"
export type PositionId = string;          // poz_kod, např. "010000000003920.001"
export type DivisionId = string;          // hier. kód, např. "0101"
export type DepartmentId = string;        // kod_hier_sk
export type OrgUnitId = string;           // Kód a název struktury (z Nastupy)

// ===== Dimenze =====
export type Grade = 'B0' | 'B1' | 'B2' | 'B3' | 'IC';
export type EmploymentType = 'PP' | 'DPP' | 'DPČ' | 'STATUTAR' | 'ICO' | 'UCEN';
export type Country = 'CZ' | 'SK' | 'PL' | 'HU' | 'DE';
export type Gender = 'male' | 'female';

export type TerminationReason =
  | 'resignation'
  | 'mutual_agreement'
  | 'dismissal'
  | 'probation_end'
  | 'retirement'
  | 'other';

export interface Employee {
  id: EmployeeId;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;       // ISO YYYY-MM-DD
  nationality: Country;
  country: Country;
  hireDate: string;
  terminationDate: string | null;
  terminationReason: TerminationReason | null;
  positionId: PositionId;
  divisionId: DivisionId;
  departmentId: DepartmentId;
  orgUnitId: OrgUnitId;
  grade: Grade;
  employmentType: EmploymentType;
  fte: number;
  managerId: EmployeeId | null;
  criticalPositionFlag: boolean;
  talentPoolFlag: boolean;
  successorForPositionId: PositionId | null;
}

export interface Position {
  id: PositionId;
  title: string;
  divisionId: DivisionId;
  departmentId: DepartmentId;
  criticalFlag: boolean;
  grade: Grade;
  roleFamily: string;
  capFte: number;
  actualFte: number;
}

export interface Division {
  id: DivisionId;
  name: string;
  country: Country;
  parentId: DivisionId | null;
  costCenter: string | null;
}

export interface Department {
  id: DepartmentId;
  name: string;
  divisionId: DivisionId;
  headEmployeeId: EmployeeId | null;
}

// ===== Fakta =====
export interface HeadcountSnapshot {
  month: string;           // ISO YYYY-MM-01
  employeeId: EmployeeId;
  active: boolean;
  onLongTermLeave: boolean;
  fte: number;
  grade: Grade;
  divisionId: DivisionId;
  countryCode: Country;
}

export interface WorkforceEvent {
  date: string;
  employeeId: EmployeeId;
  type: 'hire' | 'terminate' | 'internal_move' | 'promote';
  fromPositionId?: PositionId;
  toPositionId?: PositionId;
  reason?: TerminationReason;
  voluntary?: boolean;
}

export interface PayrollMonth {
  month: string;           // ISO YYYY-MM-01
  employeeId: EmployeeId;
  baseSalary: number;
  variable: number;
  benefits: number;
  nonPersonal: number;
  totalCost: number;
}

export interface AbsenceRecord {
  employeeId: EmployeeId;
  dateFrom: string;
  dateTo: string;
  type: 'sick' | 'vacation' | 'parental' | 'other';
  days: number;
}

export interface ShiftDay {
  date: string;
  divisionId: DivisionId;
  plannedShifts: number;
  coveredShifts: number;
}

export interface RecruitmentRequisition {
  id: string;
  positionId: PositionId;
  divisionId: DivisionId;
  approvedDate: string;
  publishedDate: string | null;
  firstInterviewDate: string | null;
  offerDate: string | null;
  acceptedDate: string | null;
  hireDate: string | null;
  cost: number;
  channel: string;
  critical: boolean;
  canceled: boolean;
}

export interface FunnelCount {
  requisitionId: string;
  stage: 'longlist' | 'presented' | '1st_interview' | '2nd_interview' | 'offer_sent' | 'hired';
  count: number;
  dateRecorded: string;
}

export interface PerformanceReview {
  cycle: string;
  employeeId: EmployeeId;
  rating: 1 | 2 | 3 | 4 | 5;
  growthPotential: 'low' | 'med' | 'high' | 'very_high';
  talentFlag: boolean;
}

export interface ENPSResponse {
  cycle: string;
  employeeId: EmployeeId;
  score: number;           // -100..100
  invited: boolean;
  responded: boolean;
  segment: { country: Country; divisionId: DivisionId };
}

export interface TrainingCompletion {
  date: string;
  employeeId: EmployeeId;
  course: string;
  area: string;
  hours: number;
  cost: number;
}

export interface WorkAccident {
  date: string;
  divisionId: DivisionId;
  severity: 'minor' | 'moderate' | 'serious';
  type: string;
}

export interface SuccessionPlan {
  criticalPositionId: PositionId;
  incumbentEmployeeId: EmployeeId | null;
  successorEmployeeId: EmployeeId | null;
  readiness: 'ready_now' | 'ready_1_2y' | 'gap';
}
