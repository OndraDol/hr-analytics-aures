import seedrandom from 'seedrandom';
import type { DivisionId, WorkAccident } from '@/lib/types';

export interface AccidentGeneratorOptions {
  divisionId: DivisionId;
  year: number;
  headcount: number;
  seed: number;
}

const ACCIDENT_TYPES = [
  'Slip on floor',
  'Lifting injury',
  'Minor cut',
  'Vehicle incident',
  'Chemical exposure',
];

export function generateAccidents(options: AccidentGeneratorOptions): WorkAccident[] {
  const rng = seedrandom(`${options.seed}:accidents:${options.divisionId}:${options.year}`);
  const expected = (options.headcount / 100) * 1.2;
  const count = Math.max(0, Math.round(expected + (rng() - 0.5) * 3));
  const accidents: WorkAccident[] = [];

  for (let i = 0; i < count; i += 1) {
    const dayOfYear = Math.floor(rng() * 360) + 1;
    const date = new Date(Date.UTC(options.year, 0, dayOfYear)).toISOString().slice(0, 10);
    const severityRoll = rng();
    const severity: WorkAccident['severity'] =
      severityRoll < 0.7 ? 'minor' : severityRoll < 0.95 ? 'moderate' : 'serious';
    const type = ACCIDENT_TYPES[Math.floor(rng() * ACCIDENT_TYPES.length)];

    accidents.push({
      date,
      divisionId: options.divisionId,
      severity,
      type: type ?? 'Other',
    });
  }

  return accidents;
}
