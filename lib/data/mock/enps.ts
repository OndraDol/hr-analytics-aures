import seedrandom from 'seedrandom';
import type { Employee, ENPSResponse } from '@/lib/types';

interface Options {
  cycle: string;           // "2025-Q4"
  seed: number;
  participationRate: number;
}

export function generateEnpsResponses(employees: Employee[], opts: Options): ENPSResponse[] {
  const rng = seedrandom(`${opts.seed}:enps:${opts.cycle}`);
  const responses: ENPSResponse[] = [];
  for (const emp of employees) {
    const invited = true;
    const responded = rng() < opts.participationRate;
    const base = 10 + (rng() * 40 - 20);
    const score = Math.max(-100, Math.min(100, Math.round(base)));
    responses.push({
      cycle: opts.cycle,
      employeeId: emp.id,
      score,
      invited,
      responded,
      segment: { country: emp.country, divisionId: emp.divisionId },
    });
  }
  return responses.filter((r) => r.responded);
}
