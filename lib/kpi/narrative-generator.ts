import type { KPIValue, KPIStatus, DriverSegment, Anomaly, Narrative } from './types';

type Template = (ctx: TemplateContext) => string;

interface TemplateContext {
  value: number;
  unit: string;
  status: KPIStatus;
  momDelta: number | null;
  topDriver: DriverSegment | null;
  anomaly: Anomaly | null;
  thresholds: { green: number; acceptable: number; red: number };
  direction: string;
}

const fmt = (v: number, unit: string, decimals = 1): string => {
  if (unit === 'percent') return `${v.toFixed(decimals)} %`;
  if (unit === 'days') return `${v.toFixed(decimals)} dní`;
  if (unit === 'czk') return `${Math.round(v).toLocaleString('cs-CZ')} Kč`;
  if (unit === 'score') return v.toFixed(decimals);
  if (unit === 'ratio') return `${(v * 100).toFixed(1)} %`;
  if (unit === 'count') return `${Math.round(v)}`;
  return String(v);
};

const fmtDelta = (v: number | null, unit: string): string => {
  if (v === null) return '';
  const prefix = v >= 0 ? '+' : '';
  return `${prefix}${fmt(v, unit)}`;
};

const TEMPLATES: Record<KPIStatus, Record<string, Template>> = {
  red: {
    down_good: ({ value, unit, momDelta, topDriver, thresholds }) =>
      `Hodnota ${fmt(value, unit)} překročila červený práh ${fmt(thresholds.red, unit)}.` +
      (momDelta !== null ? ` MoM změna: ${fmtDelta(momDelta, unit)}.` : '') +
      (topDriver ? ` Hlavní přispěvatel: ${topDriver.label} (${fmtDelta(topDriver.contribution, unit)}).` : ''),
    up_good: ({ value, unit, momDelta, topDriver, thresholds }) =>
      `Hodnota ${fmt(value, unit)} klesla pod červený práh ${fmt(thresholds.red, unit)}.` +
      (momDelta !== null ? ` MoM změna: ${fmtDelta(momDelta, unit)}.` : '') +
      (topDriver ? ` Segment s největší odchylkou: ${topDriver.label}.` : ''),
    flat_good: ({ value, unit, momDelta, thresholds }) =>
      `Hodnota ${fmt(value, unit)} se odchyluje o více než ${fmt(thresholds.red * 100, 'percent')} od plánu.` +
      (momDelta !== null ? ` MoM: ${fmtDelta(momDelta, unit)}.` : ''),
  },
  acceptable: {
    down_good: ({ value, unit, momDelta, thresholds }) =>
      `Hodnota ${fmt(value, unit)} je v přijatelném pásmu (cíl ≤ ${fmt(thresholds.green, unit)}).` +
      (momDelta !== null ? ` MoM trend: ${fmtDelta(momDelta, unit)} — sledujte.` : ''),
    up_good: ({ value, unit, momDelta, thresholds }) =>
      `Hodnota ${fmt(value, unit)} je v přijatelném pásmu (cíl ≥ ${fmt(thresholds.green, unit)}).` +
      (momDelta !== null ? ` MoM trend: ${fmtDelta(momDelta, unit)}.` : ''),
    flat_good: ({ value, unit, thresholds }) =>
      `Hodnota ${fmt(value, unit)} mírně mimo plán (tolerovaná odchylka ${fmt(thresholds.green * 100, 'percent')}).`,
  },
  green: {
    down_good: ({ value, unit, momDelta }) =>
      `Hodnota ${fmt(value, unit)} splňuje cíl.` +
      (momDelta !== null ? ` MoM: ${fmtDelta(momDelta, unit)}.` : ''),
    up_good: ({ value, unit, momDelta }) =>
      `Hodnota ${fmt(value, unit)} splňuje cíl.` +
      (momDelta !== null ? ` MoM: ${fmtDelta(momDelta, unit)}.` : ''),
    flat_good: ({ value, unit }) => `Hodnota ${fmt(value, unit)} v cílové hodnotě.`,
  },
  no_data: {
    down_good: () => 'Data pro toto období nejsou k dispozici.',
    up_good: () => 'Data pro toto období nejsou k dispozici.',
    flat_good: () => 'Data pro toto období nejsou k dispozici.',
  },
};

export class NarrativeGenerator {
  generate(kpiValue: KPIValue, topDrivers: DriverSegment[], anomaly: Anomaly | null): Narrative {
    const { status, definition } = kpiValue;
    const direction = definition.direction;
    const template =
      TEMPLATES[status]?.[direction] ??
      TEMPLATES[status]?.['down_good'] ??
      (() => `Hodnota ${kpiValue.value}.`);

    const ctx: TemplateContext = {
      value: kpiValue.value,
      unit: definition.unit,
      status,
      momDelta: kpiValue.momDelta,
      topDriver: topDrivers[0] ?? null,
      anomaly,
      thresholds: definition.thresholds,
      direction,
    };

    let text = template(ctx);

    if (anomaly && anomaly.severity !== 'mild') {
      text += ` ⚡ ${anomaly.description}`;
    }

    return { kpiId: kpiValue.kpiId, period: kpiValue.period, text, topDrivers };
  }
}
