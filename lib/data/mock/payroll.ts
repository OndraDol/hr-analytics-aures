import seedrandom from 'seedrandom';
import type { Employee, Grade, PayrollMonth } from '@/lib/types';

interface Options {
  fromMonth: string;        // "YYYY-MM"
  toMonth: string;
  seed: number;
}

// Base CZK monthly salary by grade (mean, approximate CEE automotive retail)
const BASE_BY_GRADE: Record<Grade, number> = {
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

const monthsRange = (fromMonth: string, toMonth: string): string[] => {
  const [fy, fm] = fromMonth.split('-').map(Number);
  const [ty, tm] = toMonth.split('-').map(Number);
  if (!fy || !fm || !ty || !tm) return [];
  const result: string[] = [];
  let y = fy;
  let m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    result.push(`${y}-${String(m).padStart(2, '0')}-01`);
    m += 1;
    if (m > 12) { y += 1; m = 1; }
  }
  return result;
};

export function generatePayrollForEmployee(emp: Employee, opts: Options): PayrollMonth[] {
  const rng = seedrandom(`${opts.seed}:payroll:${emp.id}`);
  const out: PayrollMonth[] = [];

  const hireMonth = emp.hireDate.slice(0, 7);
  const termMonth = emp.terminationDate ? emp.terminationDate.slice(0, 7) : null;

  // Individual variance: -15% .. +25% of base
  const personalFactor = 0.85 + rng() * 0.4;
  const baseMean = BASE_BY_GRADE[emp.grade] * personalFactor * emp.fte;
  const variablePct = VARIABLE_PCT_BY_GRADE[emp.grade];

  for (const monthIso of monthsRange(opts.fromMonth, opts.toMonth)) {
    const mKey = monthIso.slice(0, 7);
    if (mKey < hireMonth) continue;
    if (termMonth && mKey > termMonth) continue;

    const monthVariability = 0.97 + rng() * 0.06;  // +/- 3%
    const baseSalary = Math.round(baseMean * monthVariability);
    const variable = Math.round(baseSalary * variablePct * (0.5 + rng()));
    const benefits = Math.round(baseSalary * 0.08);
    const nonPersonal = Math.round(baseSalary * 0.12);
    const totalCost = baseSalary + variable + benefits + nonPersonal;

    out.push({
      month: monthIso,
      employeeId: emp.id,
      baseSalary,
      variable,
      benefits,
      nonPersonal,
      totalCost,
    });
  }

  return out;
}
