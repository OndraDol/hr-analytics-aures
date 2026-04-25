import type { Period } from '@/lib/data/provider';

const MS_PER_DAY = 86_400_000;

export function daysInPeriod(period: Period): number {
  const from = Date.parse(`${period.from}T00:00:00.000Z`);
  const to = Date.parse(`${period.to}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return 0;
  return Math.floor((to - from) / MS_PER_DAY) + 1;
}

export function shiftIsoDateMonths(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Invalid ISO date: ${isoDate}`);
  const shifted = new Date(Date.UTC(year, month - 1 + months, day));
  return shifted.toISOString().slice(0, 10);
}

export function shiftPeriodMonths(period: Period, months: number): Period {
  return {
    from: shiftIsoDateMonths(period.from, months),
    to: shiftIsoDateMonths(period.to, months),
  };
}

export function monthPeriodsEnding(endIsoDate: string, count: number): Period[] {
  const [year, month] = endIsoDate.split('-').map(Number);
  if (!year || !month) throw new Error(`Invalid ISO date: ${endIsoDate}`);

  const periods: Period[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const first = new Date(Date.UTC(year, month - 1 - offset, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
    periods.push({
      from: first.toISOString().slice(0, 10),
      to: last.toISOString().slice(0, 10),
    });
  }
  return periods;
}

export function periodLabel(period: Period): string {
  return period.from.slice(0, 7);
}
