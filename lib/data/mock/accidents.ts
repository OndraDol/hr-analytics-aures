import seedrandom from 'seedrandom';
import type { WorkAccident } from '@/lib/types';

interface Options {
  divisionId: string;
  year: number;
  headcount: number;
  seed: number;
}

const TYPES = ['Slip on floor', 'Lifting injury', 'Minor cut', 'Vehicle incident', 'Chemical exposure'];

export function generateAccidents(opts: Options): WorkAccident[] {
  const rng = seedrandom(`${opts.seed}:accidents:${opts.divisionId}:${opts.year}`);
  const expected = (opts.headcount / 100) * 1.2;
  const count = Math.max(0, Math.round(expected + (rng() - 0.5) * 3));
  const out: WorkAccident[] = [];
  for (let i = 0; i < count; i++) {
    const dayOfYear = Math.floor(rng() * 360) + 1;
    const dt = new Date(Date.UTC(opts.year, 0, dayOfYear));
    const sev = rng();
    const severity: WorkAccident['severity'] = sev < 0.7 ? 'minor' : sev < 0.95 ? 'moderate' : 'serious';
    out.push({
      date: dt.toISOString().slice(0, 10),
      divisionId: opts.divisionId,
      severity,
      type: TYPES[Math.floor(rng() * TYPES.length)]!,
    });
  }
  return out;
}
