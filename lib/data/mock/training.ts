import seedrandom from 'seedrandom';
import type { Employee, TrainingCompletion } from '@/lib/types';

interface Options {
  year: number;
  seed: number;
}

const AREAS = ['Compliance', 'Sales', 'Leadership', 'ESG', 'Safety', 'Product', 'Customer Service'];
const COURSES_BY_AREA: Record<string, string[]> = {
  Compliance: ['GDPR obnova', 'AML školení'],
  Sales: ['Negociace', 'Prodejní dovednosti'],
  Leadership: ['Coaching základy', 'Feedback framework'],
  ESG: ['ESRS úvod', 'Uhlíková stopa'],
  Safety: ['BOZP', 'První pomoc'],
  Product: ['Produktové novinky', 'Vyhledávání závad'],
  'Customer Service': ['Řízení stížností', 'Empatie v komunikaci'],
};

const isEmployedInYear = (emp: Employee, year: number): boolean => {
  const start = new Date(emp.hireDate);
  const end = emp.terminationDate ? new Date(emp.terminationDate) : new Date(`${year + 1}-01-01`);
  return start.getFullYear() <= year && end.getFullYear() >= year;
};

export function generateTrainingCompletions(emp: Employee, opts: Options): TrainingCompletion[] {
  if (!isEmployedInYear(emp, opts.year)) return [];
  const rng = seedrandom(`${opts.seed}:training:${emp.id}:${opts.year}`);
  const out: TrainingCompletion[] = [];
  const yearStart = `${opts.year}-01-01`;
  const yearEnd = `${opts.year}-12-31`;
  const windowStart = emp.hireDate > yearStart ? emp.hireDate : yearStart;
  const windowEnd = emp.terminationDate && emp.terminationDate < yearEnd ? emp.terminationDate : yearEnd;
  if (windowStart > windowEnd) return [];

  const startIdx = Math.floor(
    (new Date(windowStart).getTime() - new Date(yearStart).getTime()) / 86400000,
  );
  const endIdx = Math.floor(
    (new Date(windowEnd).getTime() - new Date(yearStart).getTime()) / 86400000,
  );
  const span = Math.max(1, endIdx - startIdx + 1);

  const count = Math.floor(rng() * 4) + 1;    // 1..4 courses/year
  for (let i = 0; i < count; i++) {
    const area = AREAS[Math.floor(rng() * AREAS.length)]!;
    const courses = COURSES_BY_AREA[area]!;
    const course = courses[Math.floor(rng() * courses.length)]!;
    const hours = Math.floor(rng() * 6) + 2;
    const cost = hours * 800 + Math.floor(rng() * 500);
    const dayIdx = startIdx + Math.floor(rng() * span);
    const dt = new Date(Date.UTC(opts.year, 0, 1 + dayIdx));
    const iso = dt.toISOString().slice(0, 10);
    if (iso < windowStart || iso > windowEnd) continue;
    out.push({
      date: iso,
      employeeId: emp.id,
      course,
      area,
      hours,
      cost,
    });
  }
  return out;
}
