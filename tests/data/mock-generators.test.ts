import { describe, it, expect } from 'vitest';
import { generatePayrollForEmployee } from '@/lib/data/mock/payroll';
import { generateAbsenceForEmployee } from '@/lib/data/mock/absence';
import { generateEnpsResponses } from '@/lib/data/mock/enps';
import { generatePerformanceReview } from '@/lib/data/mock/performance';
import { generateTrainingCompletions } from '@/lib/data/mock/training';
import { generateSuccessionPlan } from '@/lib/data/mock/succession';
import { generateAccidents } from '@/lib/data/mock/accidents';
import type { Employee } from '@/lib/types';

const mockEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: 'E001',
  firstName: 'Test',
  lastName: 'Ten',
  gender: 'male',
  birthDate: '1985-05-05',
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
  fte: 1.0,
  managerId: null,
  criticalPositionFlag: false,
  talentPoolFlag: false,
  successorForPositionId: null,
  ...overrides,
});

describe('generatePayrollForEmployee', () => {
  it('produces one record per month in range while active', () => {
    const emp = mockEmployee({ hireDate: '2024-01-01' });
    const result = generatePayrollForEmployee(emp, { fromMonth: '2024-01', toMonth: '2024-06', seed: 42 });
    expect(result).toHaveLength(6);
  });

  it('no records before hire date', () => {
    const emp = mockEmployee({ hireDate: '2024-04-01' });
    const result = generatePayrollForEmployee(emp, { fromMonth: '2024-01', toMonth: '2024-06', seed: 42 });
    expect(result).toHaveLength(3);
    expect(result[0]!.month).toBe('2024-04-01');
  });

  it('no records after termination date', () => {
    const emp = mockEmployee({ hireDate: '2024-01-01', terminationDate: '2024-03-15' });
    const result = generatePayrollForEmployee(emp, { fromMonth: '2024-01', toMonth: '2024-06', seed: 42 });
    expect(result).toHaveLength(3);
    expect(result[result.length - 1]!.month).toBe('2024-03-01');
  });

  it('salary scales with grade (B0 > B3 > IC)', () => {
    const b0 = mockEmployee({ id: 'E01', grade: 'B0' });
    const b3 = mockEmployee({ id: 'E02', grade: 'B3' });
    const ic = mockEmployee({ id: 'E03', grade: 'IC' });
    const opts = { fromMonth: '2024-01', toMonth: '2024-01', seed: 42 };
    const b0r = generatePayrollForEmployee(b0, opts)[0]!;
    const b3r = generatePayrollForEmployee(b3, opts)[0]!;
    const icr = generatePayrollForEmployee(ic, opts)[0]!;
    expect(b0r.baseSalary).toBeGreaterThan(b3r.baseSalary);
    expect(b3r.baseSalary).toBeGreaterThan(icr.baseSalary);
  });

  it('deterministic — same seed produces same output', () => {
    const emp = mockEmployee();
    const opts = { fromMonth: '2024-01', toMonth: '2024-03', seed: 42 };
    const a = generatePayrollForEmployee(emp, opts);
    const b = generatePayrollForEmployee(emp, opts);
    expect(a).toEqual(b);
  });
});

describe('generateAbsenceForEmployee', () => {
  it('produces sick + vacation records within year', () => {
    const emp = mockEmployee({ hireDate: '2023-01-01' });
    const records = generateAbsenceForEmployee(emp, { year: 2024, seed: 42 });
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((r) => r.dateFrom.startsWith('2024-'))).toBe(true);
    expect(records.some((r) => r.type === 'sick')).toBe(true);
    expect(records.some((r) => r.type === 'vacation')).toBe(true);
  });

  it('returns no records if employee not active in year', () => {
    const emp = mockEmployee({ hireDate: '2025-01-01' });
    const records = generateAbsenceForEmployee(emp, { year: 2024, seed: 42 });
    expect(records).toHaveLength(0);
  });
});

describe('generateEnpsResponses', () => {
  it('produces at most one response per employee per cycle', () => {
    const emps = [mockEmployee({ id: 'E1' }), mockEmployee({ id: 'E2' }), mockEmployee({ id: 'E3' })];
    const result = generateEnpsResponses(emps, { cycle: '2025-Q4', seed: 42, participationRate: 0.7 });
    expect(result.length).toBeLessThanOrEqual(emps.length);
    for (const r of result) expect(r.cycle).toBe('2025-Q4');
  });
});

describe('generatePerformanceReview', () => {
  it('produces rating 1..5 and growth potential', () => {
    const emp = mockEmployee();
    const r = generatePerformanceReview(emp, { cycle: '2025', seed: 42 });
    expect([1, 2, 3, 4, 5]).toContain(r.rating);
    expect(['low', 'med', 'high', 'very_high']).toContain(r.growthPotential);
  });
});

describe('generateTrainingCompletions', () => {
  it('produces records only while employee is active in given year', () => {
    const emp = mockEmployee({ hireDate: '2024-01-01' });
    const records = generateTrainingCompletions(emp, { year: 2024, seed: 42 });
    expect(records.every((r) => r.date.startsWith('2024-'))).toBe(true);
  });
});

describe('generateSuccessionPlan', () => {
  it('assigns ready_now / ready_1_2y / gap for critical positions', () => {
    const plan = generateSuccessionPlan({
      positionId: 'P1',
      incumbentEmployeeId: 'E1',
      candidates: [{ employeeId: 'E2' }, { employeeId: 'E3' }],
      seed: 42,
    });
    expect(['ready_now', 'ready_1_2y', 'gap']).toContain(plan.readiness);
  });
});

describe('generateAccidents', () => {
  it('produces realistic low-frequency accidents per division-year', () => {
    const result = generateAccidents({ divisionId: 'OPS-Drivers', year: 2025, headcount: 300, seed: 42 });
    expect(result.length).toBeGreaterThanOrEqual(0);
    expect(result.length).toBeLessThan(50);
  });
});
