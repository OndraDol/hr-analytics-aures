import seedrandom from 'seedrandom';
import type { Employee, Grade, PayrollMonth } from '@/lib/types';

export interface PayrollGeneratorOptions {
  fromMonth: string; // YYYY-MM
  toMonth: string; // YYYY-MM
  seed: number;
}

const BASE_SALARY_BY_GRADE: Record<Grade, number> = {
  B0: 250_000,
  B1: 160_000,
  B2: 95_000,
  B3: 55_000,
  IC: 38_000,
};

const VARIABLE_PCT_BY_GRADE: Record<Grade, number> = {
  B0: 0.4,
  B1: 0.25,
  B2: 0.15,
  B3: 0.1,
  IC: 0.07,
};

const monthRange = (fromMonth: string, toMonth: string): string[] => {
  const [fromYear, fromMonthNumber] = fromMonth.split('-').map(Number);
  const [toYear, toMonthNumber] = toMonth.split('-').map(Number);

  if (!fromYear || !fromMonthNumber || !toYear || !toMonthNumber) return [];

  const months: string[] = [];
  let year = fromYear;
  let month = fromMonthNumber;

  while (year < toYear || (year === toYear && month <= toMonthNumber)) {
    months.push(`${year}-${String(month).padStart(2, '0')}-01`);
    month += 1;
    if (month > 12) {
      year += 1;
      month = 1;
    }
  }

  return months;
};

export function generatePayrollForEmployee(
  employee: Employee,
  options: PayrollGeneratorOptions,
): PayrollMonth[] {
  const rng = seedrandom(`${options.seed}:payroll:${employee.id}`);
  const hireMonth = employee.hireDate.slice(0, 7);
  const terminationMonth = employee.terminationDate?.slice(0, 7) ?? null;
  const personalFactor = 0.85 + rng() * 0.4;
  const baseMean = BASE_SALARY_BY_GRADE[employee.grade] * personalFactor * employee.fte;
  const variablePct = VARIABLE_PCT_BY_GRADE[employee.grade];

  const rows: PayrollMonth[] = [];

  for (const monthIso of monthRange(options.fromMonth, options.toMonth)) {
    const monthKey = monthIso.slice(0, 7);
    if (monthKey < hireMonth) continue;
    if (terminationMonth && monthKey > terminationMonth) continue;

    const monthFactor = 0.97 + rng() * 0.06;
    const baseSalary = Math.round(baseMean * monthFactor);
    const variable = Math.round(baseSalary * variablePct * (0.5 + rng()));
    const benefits = Math.round(baseSalary * 0.08);
    const nonPersonal = Math.round(baseSalary * 0.12);

    rows.push({
      month: monthIso,
      employeeId: employee.id,
      baseSalary,
      variable,
      benefits,
      nonPersonal,
      totalCost: baseSalary + variable + benefits + nonPersonal,
    });
  }

  return rows;
}
