import seedrandom from 'seedrandom';
import type { SuccessionPlan, PositionId, EmployeeId } from '@/lib/types';

interface Options {
  positionId: PositionId;
  incumbentEmployeeId: EmployeeId | null;
  candidates: Array<{ employeeId: EmployeeId }>;
  seed: number;
}

export function generateSuccessionPlan(opts: Options): SuccessionPlan {
  const rng = seedrandom(`${opts.seed}:succession:${opts.positionId}`);
  const r = rng();
  const readiness: SuccessionPlan['readiness'] =
    r < 0.45 ? 'ready_now' : r < 0.8 ? 'ready_1_2y' : 'gap';

  const successor =
    readiness === 'gap' || opts.candidates.length === 0
      ? null
      : opts.candidates[Math.floor(rng() * opts.candidates.length)]!.employeeId;

  return {
    criticalPositionId: opts.positionId,
    incumbentEmployeeId: opts.incumbentEmployeeId,
    successorEmployeeId: successor,
    readiness,
  };
}
