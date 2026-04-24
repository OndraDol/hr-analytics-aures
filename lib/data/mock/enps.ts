import seedrandom from 'seedrandom';
import type { Employee, ENPSResponse } from '@/lib/types';

export interface EnpsGeneratorOptions {
  cycle: string;
  seed: number;
  participationRate: number;
}

export function generateEnpsResponses(
  employees: Employee[],
  options: EnpsGeneratorOptions,
): ENPSResponse[] {
  const rng = seedrandom(`${options.seed}:enps:${options.cycle}`);
  const responses: ENPSResponse[] = [];

  for (const employee of employees) {
    const responded = rng() < options.participationRate;
    const baseline = 12 + (rng() * 44 - 22);
    const score = Math.max(-100, Math.min(100, Math.round(baseline)));

    if (!responded) continue;

    responses.push({
      cycle: options.cycle,
      employeeId: employee.id,
      score,
      invited: true,
      responded,
      segment: { country: employee.country, divisionId: employee.divisionId },
    });
  }

  return responses;
}
