import type { KpiUnit } from '@/lib/kpi/catalog';

export function formatEmployeeName(employee: { firstName: string; lastName: string }): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

export function formatDivisionLabel(name: string | null | undefined): string {
  if (!name) return '';
  return name.replace(/^\d+_+\s*/, '').trim();
}

const formatter = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 });
const integerFormatter = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 });

export function formatKpiValue(value: number, unit: KpiUnit): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (unit === 'pct') return `${formatter.format(value)} %`;
  if (unit === 'CZK') return `${integerFormatter.format(value)} Kč`;
  if (unit === 'days') return `${formatter.format(value)} dne`;
  if (unit === 'months') return `${formatter.format(value)} měs.`;
  if (unit === 'score') return formatter.format(value);
  if (unit === 'count') return integerFormatter.format(value);
  if (unit === 'ratio') return formatter.format(value);
  return formatter.format(value);
}

// Absolutní změna v jednotce — pro KPI v procentech vrací procentní body (pp),
// které jsou jednoznačnější než procento procenta. Pro ostatní jednotky se
// chová jako formatKpiValue.
export function formatDelta(value: number, unit: KpiUnit): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (unit === 'pct') return `${formatter.format(value)} pp`;
  return formatKpiValue(value, unit);
}
