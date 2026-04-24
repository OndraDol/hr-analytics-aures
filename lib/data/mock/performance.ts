import seedrandom from 'seedrandom';
import type { Employee, PerformanceReview } from '@/lib/types';

interface Options {
  cycle: string;
  seed: number;
}

export function generatePerformanceReview(emp: Employee, opts: Options): PerformanceReview {
  const rng = seedrandom(`${opts.seed}:perf:${emp.id}:${opts.cycle}`);
  // Bell-ish: 5% weak, 20% below, 50% meets, 20% exceeds, 5% outstanding
  const r = rng();
  const rating: PerformanceReview['rating'] =
    r < 0.05 ? 1 : r < 0.25 ? 2 : r < 0.75 ? 3 : r < 0.95 ? 4 : 5;

  const g = rng();
  const growthPotential: PerformanceReview['growthPotential'] =
    g < 0.15 ? 'low' : g < 0.55 ? 'med' : g < 0.9 ? 'high' : 'very_high';

  const talentFlag = rating >= 4 && (growthPotential === 'high' || growthPotential === 'very_high');

  return {
    cycle: opts.cycle,
    employeeId: emp.id,
    rating,
    growthPotential,
    talentFlag,
  };
}
