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

  const sickEvents = Math.floor(rng() * 3) + 1;
  for (let i = 0; i < sickEvents; i++) {
    const dayOfYear = Math.floor(rng() * 360) + 1;
    const duration = Math.floor(rng() * 7) + 1;
    const fromDate = addDays(`${opts.year}-01-01`, dayOfYear);
    out.push({ employeeId: emp.id, dateFrom: fromDate, dateTo: addDays(fromDate, duration - 1), type: 'sick', days: duration });
  }

  const vacationChunks = Math.floor(rng() * 3) + 2;
  let remaining = Math.floor(rng() * 10) + 15;
  for (let i = 0; i < vacationChunks && remaining > 0; i++) {
    const chunk = Math.min(remaining, Math.floor(rng() * 7) + 3);
    const dayOfYear = Math.floor(rng() * 330) + 1;
    const fromDate = addDays(`${opts.year}-01-01`, dayOfYear);
    out.push({ employeeId: emp.id, dateFrom: fromDate, dateTo: addDays(fromDate, chunk - 1), type: 'vacation', days: chunk });
    remaining -= chunk;
  }

  const termDate = emp.terminationDate ?? null;
  return out.filter(
    (r) => r.dateFrom >= emp.hireDate && (!termDate || r.dateFrom <= termDate),
  );
}
