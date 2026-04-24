import seedrandom from 'seedrandom';
import type { Employee, TrainingCompletion } from '@/lib/types';
import { activeWindowForYear, randomDateInWindow } from './date-utils';

export interface TrainingGeneratorOptions {
  year: number;
  seed: number;
}

const AREAS = ['Compliance', 'Sales', 'Leadership', 'ESG', 'Safety', 'Product', 'Customer Service'];

const COURSES_BY_AREA: Record<string, string[]> = {
  Compliance: ['GDPR obnova', 'AML skoleni'],
  Sales: ['Negociace', 'Prodejni dovednosti'],
  Leadership: ['Coaching zaklady', 'Feedback framework'],
  ESG: ['ESRS uvod', 'Uhlikova stopa'],
  Safety: ['BOZP', 'Prvni pomoc'],
  Product: ['Produktove novinky', 'Vyhledavani zavad'],
  'Customer Service': ['Rizeni stiznosti', 'Empatie v komunikaci'],
};

const choose = <T>(items: readonly T[], rng: () => number): T => {
  const item = items[Math.floor(rng() * items.length)];
  if (item == null) throw new Error('Training generator: empty item list');
  return item;
};

export function generateTrainingCompletions(
  employee: Employee,
  options: TrainingGeneratorOptions,
): TrainingCompletion[] {
  const activeWindow = activeWindowForYear(employee.hireDate, employee.terminationDate, options.year);
  if (!activeWindow) return [];

  const rng = seedrandom(`${options.seed}:training:${employee.id}:${options.year}`);
  const count = Math.floor(rng() * 4) + 1;
  const completions: TrainingCompletion[] = [];

  for (let i = 0; i < count; i += 1) {
    const area = choose(AREAS, rng);
    const course = choose(COURSES_BY_AREA[area] ?? ['General training'], rng);
    const hours = Math.floor(rng() * 6) + 2;

    completions.push({
      date: randomDateInWindow(activeWindow, rng),
      employeeId: employee.id,
      course,
      area,
      hours,
      cost: hours * 800 + Math.floor(rng() * 500),
    });
  }

  return completions;
}
