import seedrandom from 'seedrandom';
import type { Employee, AbsenceRecord } from '@/lib/types';

interface Options {
  year: number;
  seed: number;
}

const addDays = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + days));
  return dt.toISOString().slice(0, 10);
};

const isEmployedInYear = (emp: Employee, year: number): boolean => {
  const start = new Date(emp.hireDate);
  const end = emp.terminationDate ? new Date(emp.terminationDate) : new Date(`${year + 1}-01-01`);
  return start.getFullYear() <= year && end.getFullYear() >= year;
};

export function generateAbsenceForEmployee(emp: Employee, opts: Options): AbsenceRecord[] {
  if (!isEmployedInYear(emp, opts.year)) return [];
  const rng = seedrandom(`${opts.seed}:absence:${emp.id}:${opts.year}`);
  const out: AbsenceRecord[] = [];

  // Effective employment window within the year (inclusive)
  const yearStart = `${opts.year}-01-01`;
  const yearEnd = `${opts.year}-12-31`;
  const windowStart = emp.hireDate > yearStart ? emp.hireDate : yearStart;
  const windowEnd = emp.terminationDate && emp.terminationDate < yearEnd ? emp.terminationDate : yearEnd;
  if (windowStart > windowEnd) return [];

  const pickFromDate = (maxSpanDays: number): string => {
    // Uniformly pick day-of-year within the effective window
    const startIdx = Math.floor(
      (new Date(windowStart).getTime() - new Date(yearStart).getTime()) / 86400000,
    );
    const endIdx = Math.floor(
      (new Date(windowEnd).getTime() - new Date(yearStart).getTime()) / 86400000,
    );
    const span = Math.max(0, endIdx - startIdx - maxSpanDays);
    const offset = span === 0 ? 0 : Math.floor(rng() * span);
    return addDays(yearStart, startIdx + offset);
  };

  // Sick: 1-3 events per year, each 1-7 days
  const sickEvents = Math.floor(rng() * 3) + 1;
  for (let i = 0; i < sickEvents; i++) {
    const duration = Math.floor(rng() * 7) + 1;
    const fromDate = pickFromDate(duration);
    if (fromDate < windowStart) continue;
    const dateTo = addDays(fromDate, duration - 1);
    if (dateTo > windowEnd) continue;
    out.push({
      employeeId: emp.id,
      dateFrom: fromDate,
      dateTo,
      type: 'sick',
      days: duration,
    });
  }

  // Vacation: 2-4 chunks totaling 15-25 days
  const vacationChunks = Math.floor(rng() * 3) + 2;
  let remaining = Math.floor(rng() * 10) + 15;
  for (let i = 0; i < vacationChunks && remaining > 0; i++) {
    const chunk = Math.min(remaining, Math.floor(rng() * 7) + 3);
    const fromDate = pickFromDate(chunk);
    if (fromDate < windowStart) continue;
    const dateTo = addDays(fromDate, chunk - 1);
    if (dateTo > windowEnd) continue;
    out.push({
      employeeId: emp.id,
      dateFrom: fromDate,
      dateTo,
      type: 'vacation',
      days: chunk,
    });
    remaining -= chunk;
  }

  return out;
}
