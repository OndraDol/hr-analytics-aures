import seedrandom from 'seedrandom';
import type { Employee, PerformanceReview } from '@/lib/types';

export interface PerformanceGeneratorOptions {
  cycle: string;
  seed: number;
}

export function generatePerformanceReview(
  employee: Employee,
  options: PerformanceGeneratorOptions,
): PerformanceReview {
  const rng = seedrandom(`${options.seed}:performance:${employee.id}:${options.cycle}`);

  const ratingRoll = rng();
  const rating: PerformanceReview['rating'] =
    ratingRoll < 0.05 ? 1 : ratingRoll < 0.25 ? 2 : ratingRoll < 0.75 ? 3 : ratingRoll < 0.95 ? 4 : 5;

  const potentialRoll = rng();
  const growthPotential: PerformanceReview['growthPotential'] =
    potentialRoll < 0.15
      ? 'low'
      : potentialRoll < 0.55
        ? 'med'
        : potentialRoll < 0.9
          ? 'high'
          : 'very_high';

  return {
    cycle: options.cycle,
    employeeId: employee.id,
    rating,
    growthPotential,
    talentFlag: rating >= 4 && (growthPotential === 'high' || growthPotential === 'very_high'),
  };
}
