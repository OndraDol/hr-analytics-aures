import seedrandom from 'seedrandom';
import type { AbsenceRecord, Employee } from '@/lib/types';
import { activeWindowForYear, addDays, daysBetweenInclusive, randomDateInWindow } from './date-utils';

export interface AbsenceGeneratorOptions {
  year: number;
  seed: number;
}

export function generateAbsenceForEmployee(
  employee: Employee,
  options: AbsenceGeneratorOptions,
): AbsenceRecord[] {
  const activeWindow = activeWindowForYear(employee.hireDate, employee.terminationDate, options.year);
  if (!activeWindow) return [];

  const activeDays = daysBetweenInclusive(activeWindow.from, activeWindow.to);
  if (activeDays <= 0) return [];

  const rng = seedrandom(`${options.seed}:absence:${employee.id}:${options.year}`);
  const records: AbsenceRecord[] = [];

  const sickEvents = Math.max(1, Math.round((activeDays / 365) * (1 + Math.floor(rng() * 3))));
  for (let i = 0; i < sickEvents; i += 1) {
    const dateFrom = randomDateInWindow(activeWindow, rng);
    const duration = Math.max(1, Math.min(Math.floor(rng() * 7) + 1, daysBetweenInclusive(dateFrom, activeWindow.to)));
    records.push({
      employeeId: employee.id,
      dateFrom,
      dateTo: addDays(dateFrom, duration - 1),
      type: 'sick',
      days: duration,
    });
  }

  const vacationChunks = Math.max(1, Math.round((activeDays / 365) * (2 + Math.floor(rng() * 3))));
  let remainingVacationDays = Math.max(1, Math.round((activeDays / 365) * (15 + Math.floor(rng() * 10))));

  for (let i = 0; i < vacationChunks && remainingVacationDays > 0; i += 1) {
    const dateFrom = randomDateInWindow(activeWindow, rng);
    const maxDuration = daysBetweenInclusive(dateFrom, activeWindow.to);
    const duration = Math.max(
      1,
      Math.min(remainingVacationDays, Math.floor(rng() * 7) + 3, maxDuration),
    );
    records.push({
      employeeId: employee.id,
      dateFrom,
      dateTo: addDays(dateFrom, duration - 1),
      type: 'vacation',
      days: duration,
    });
    remainingVacationDays -= duration;
  }

  return records;
}
