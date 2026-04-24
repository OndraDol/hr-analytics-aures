import seedrandom from 'seedrandom';
import type { EmployeeId, PositionId, SuccessionPlan } from '@/lib/types';

export interface SuccessionGeneratorOptions {
  positionId: PositionId;
  incumbentEmployeeId: EmployeeId | null;
  candidates: Array<{ employeeId: EmployeeId }>;
  seed: number;
}

export function generateSuccessionPlan(options: SuccessionGeneratorOptions): SuccessionPlan {
  const rng = seedrandom(`${options.seed}:succession:${options.positionId}`);
  const roll = rng();
  const readiness: SuccessionPlan['readiness'] =
    roll < 0.45 ? 'ready_now' : roll < 0.8 ? 'ready_1_2y' : 'gap';
  const candidate =
    readiness === 'gap'
      ? null
      : options.candidates[Math.floor(rng() * options.candidates.length)] ?? null;

  return {
    criticalPositionId: options.positionId,
    incumbentEmployeeId: options.incumbentEmployeeId,
    successorEmployeeId: candidate?.employeeId ?? null,
    readiness,
  };
}
