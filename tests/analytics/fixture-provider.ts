import type { DataProvider, Period } from '@/lib/data/provider';
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

const inPeriod = (date: string, period: Period): boolean => date >= period.from && date <= period.to;

const employees: Employee[] = [
  {
    id: 'E1',
    firstName: 'Jan',
    lastName: 'Novak',
    gender: 'male',
    birthDate: '1985-01-01',
    nationality: 'CZ',
    country: 'CZ',
    hireDate: '2024-01-01',
    terminationDate: null,
    terminationReason: null,
    positionId: 'P1',
    divisionId: 'D1',
    departmentId: 'DP1',
    orgUnitId: 'O1',
    grade: 'IC',
    employmentType: 'PP',
    fte: 1,
    managerId: null,
    criticalPositionFlag: false,
    talentPoolFlag: false,
    successorForPositionId: null,
  },
  {
    id: 'E2',
    firstName: 'Petr',
    lastName: 'Svoboda',
    gender: 'male',
    birthDate: '1988-01-01',
    nationality: 'CZ',
    country: 'CZ',
    hireDate: '2024-02-01',
    terminationDate: '2025-01-15',
    terminationReason: 'resignation',
    positionId: 'P2',
    divisionId: 'D1',
    departmentId: 'DP1',
    orgUnitId: 'O1',
    grade: 'B3',
    employmentType: 'PP',
    fte: 1,
    managerId: null,
    criticalPositionFlag: true,
    talentPoolFlag: false,
    successorForPositionId: null,
  },
  {
    id: 'E3',
    firstName: 'Jana',
    lastName: 'Dvorakova',
    gender: 'female',
    birthDate: '1990-01-01',
    nationality: 'CZ',
    country: 'CZ',
    hireDate: '2024-03-01',
    terminationDate: null,
    terminationReason: null,
    positionId: 'P3',
    divisionId: 'D2',
    departmentId: 'DP2',
    orgUnitId: 'O2',
    grade: 'B2',
    employmentType: 'PP',
    fte: 1,
    managerId: null,
    criticalPositionFlag: true,
    talentPoolFlag: true,
    successorForPositionId: null,
  },
];

export class FixtureDataProvider implements DataProvider {
  async getEmployees(): Promise<Employee[]> {
    return employees;
  }

  async getPositions(): Promise<Position[]> {
    return [
      {
        id: 'P1',
        title: 'Sales Specialist',
        divisionId: 'D1',
        departmentId: 'DP1',
        criticalFlag: false,
        grade: 'IC',
        roleFamily: 'Sales',
        capFte: 2,
        actualFte: 1,
      },
      {
        id: 'P2',
        title: 'Store Manager',
        divisionId: 'D1',
        departmentId: 'DP1',
        criticalFlag: true,
        grade: 'B3',
        roleFamily: 'Sales',
        capFte: 1,
        actualFte: 1,
      },
      {
        id: 'P3',
        title: 'Regional Manager',
        divisionId: 'D2',
        departmentId: 'DP2',
        criticalFlag: true,
        grade: 'B2',
        roleFamily: 'F&I',
        capFte: 1,
        actualFte: 1,
      },
    ];
  }

  async getDivisions(): Promise<Division[]> {
    return [
      { id: 'D1', name: 'Sales CZ', country: 'CZ', parentId: null, costCenter: null },
      { id: 'D2', name: 'OPS CZ', country: 'CZ', parentId: null, costCenter: null },
    ];
  }

  async getDepartments(): Promise<Department[]> {
    return [
      { id: 'DP1', name: 'Sales Praha', divisionId: 'D1', headEmployeeId: null },
      { id: 'DP2', name: 'OPS Praha', divisionId: 'D2', headEmployeeId: null },
    ];
  }

  async getHeadcountSnapshots(): Promise<HeadcountSnapshot[]> {
    return [];
  }

  async getWorkforceEvents(period: Period): Promise<WorkforceEvent[]> {
    const rows: WorkforceEvent[] = [
      { date: '2025-01-15', employeeId: 'E2', type: 'terminate', reason: 'resignation', voluntary: true },
      { date: '2024-12-01', employeeId: 'E3', type: 'hire' },
    ];
    return rows.filter((row) => inPeriod(row.date, period));
  }

  async getPayroll(period: Period): Promise<PayrollMonth[]> {
    const rows: PayrollMonth[] = [
      { month: '2025-01-01', employeeId: 'E1', baseSalary: 40_000, variable: 2_000, benefits: 3_000, nonPersonal: 4_000, totalCost: 49_000 },
      { month: '2025-01-01', employeeId: 'E2', baseSalary: 65_000, variable: 6_000, benefits: 5_000, nonPersonal: 8_000, totalCost: 84_000 },
      { month: '2025-01-01', employeeId: 'E3', baseSalary: 95_000, variable: 9_000, benefits: 7_000, nonPersonal: 10_000, totalCost: 121_000 },
    ];
    return rows.filter((row) => inPeriod(row.month, period));
  }

  async getAbsence(period: Period): Promise<AbsenceRecord[]> {
    const rows: AbsenceRecord[] = [
      { employeeId: 'E1', dateFrom: '2025-01-10', dateTo: '2025-01-12', type: 'sick', days: 3 },
      { employeeId: 'E3', dateFrom: '2025-01-20', dateTo: '2025-01-24', type: 'vacation', days: 5 },
    ];
    return rows.filter((row) => inPeriod(row.dateFrom, period));
  }

  async getShifts(): Promise<ShiftDay[]> {
    return [];
  }

  async getRequisitions(period: Period): Promise<RecruitmentRequisition[]> {
    const rows: RecruitmentRequisition[] = [
      {
        id: 'R1',
        positionId: 'P2',
        divisionId: 'D1',
        approvedDate: '2025-01-01',
        publishedDate: '2025-01-02',
        firstInterviewDate: '2025-01-12',
        offerDate: '2025-01-25',
        acceptedDate: '2025-01-28',
        hireDate: '2025-01-31',
        cost: 50_000,
        channel: 'AAA Career',
        critical: true,
        canceled: false,
      },
    ];
    return rows.filter((row) => inPeriod(row.approvedDate, period));
  }

  async getFunnelCounts(): Promise<FunnelCount[]> {
    return [];
  }

  async getPerformanceReviews(): Promise<PerformanceReview[]> {
    return [
      { cycle: '2025', employeeId: 'E1', rating: 3, growthPotential: 'med', talentFlag: false },
      { cycle: '2025', employeeId: 'E3', rating: 5, growthPotential: 'high', talentFlag: true },
    ];
  }

  async getEnpsResponses(): Promise<ENPSResponse[]> {
    return [
      { cycle: '2025-Q4', employeeId: 'E1', score: 22, invited: true, responded: true, segment: { country: 'CZ', divisionId: 'D1' } },
      { cycle: '2025-Q4', employeeId: 'E3', score: -5, invited: true, responded: true, segment: { country: 'CZ', divisionId: 'D2' } },
    ];
  }

  async getTraining(): Promise<TrainingCompletion[]> {
    return [];
  }

  async getAccidents(): Promise<WorkAccident[]> {
    return [];
  }

  async getSuccessionPlans(): Promise<SuccessionPlan[]> {
    return [
      { criticalPositionId: 'P2', incumbentEmployeeId: 'E2', successorEmployeeId: null, readiness: 'gap' },
      { criticalPositionId: 'P3', incumbentEmployeeId: 'E3', successorEmployeeId: 'E1', readiness: 'ready_now' },
    ];
  }
}
