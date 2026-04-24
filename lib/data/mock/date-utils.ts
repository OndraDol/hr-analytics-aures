export const addDays = (isoDate: string, days: number): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Invalid ISO date: ${isoDate}`);

  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

export const daysBetweenInclusive = (fromIso: string, toIso: string): number => {
  const from = Date.parse(`${fromIso}T00:00:00.000Z`);
  const to = Date.parse(`${toIso}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return 0;
  return Math.floor((to - from) / 86_400_000) + 1;
};

export const activeWindowForYear = (
  hireDate: string,
  terminationDate: string | null,
  year: number,
): { from: string; to: string } | null => {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const from = hireDate > yearStart ? hireDate : yearStart;
  const to = terminationDate && terminationDate < yearEnd ? terminationDate : yearEnd;

  return from <= to ? { from, to } : null;
};

export const randomDateInWindow = (
  window: { from: string; to: string },
  rng: () => number,
): string => {
  const days = daysBetweenInclusive(window.from, window.to);
  if (days <= 1) return window.from;
  return addDays(window.from, Math.floor(rng() * days));
};
