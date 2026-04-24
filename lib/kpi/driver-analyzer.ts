import type { DriverSegment } from './types';
import type { Employee } from '@/lib/types';

type Dimension = DriverSegment['dimension'];

const TENURE_BANDS = [
  { label: '< 1 rok', min: 0, max: 12 },
  { label: '1–3 roky', min: 12, max: 36 },
  { label: '3–5 let', min: 36, max: 60 },
  { label: '5+ let', min: 60, max: Infinity },
];

function getTenureBand(hireDate: string, refDate: string): string {
  const months =
    (new Date(refDate).getTime() - new Date(hireDate).getTime()) / (30.44 * 86_400_000);
  return TENURE_BANDS.find((b) => months >= b.min && months < b.max)?.label ?? '5+ let';
}

function segmentKey(emp: Employee, dim: Dimension, refDate: string): string {
  switch (dim) {
    case 'division': return emp.divisionId;
    case 'country':  return emp.country;
    case 'grade':    return emp.grade;
    case 'tenure_band': return getTenureBand(emp.hireDate, refDate);
  }
}

function segmentLabel(emp: Employee, dim: Dimension, refDate: string): string {
  return segmentKey(emp, dim, refDate);
}

export interface SegmentMetric {
  dimension: Dimension;
  key: string;
  label: string;
  currentValue: number;
  previousValue: number;
  contribution: number;    // absolutní přírůstek k celkové MoM změně
  contributionPct: number;
}

export class DriverAnalyzer {
  /**
   * Analyzuje top přispěvatele ke změně metriky mezi currentEmployees a previousEmployees.
   * `metricFn` spočítá hodnotu metriky pro danou skupinu zaměstnanců.
   */
  analyze(
    currentEmployees: Employee[],
    previousEmployees: Employee[],
    metricFn: (employees: Employee[]) => number,
    refDate: string,
    topN = 5,
  ): DriverSegment[] {
    const dimensions: Dimension[] = ['division', 'country', 'grade', 'tenure_band'];
    const allSegments: SegmentMetric[] = [];

    const currentTotal = metricFn(currentEmployees);
    const previousTotal = metricFn(previousEmployees);
    const totalDelta = currentTotal - previousTotal;

    for (const dim of dimensions) {
      const currentKeys = new Set(currentEmployees.map((e) => segmentKey(e, dim, refDate)));
      const previousKeys = new Set(previousEmployees.map((e) => segmentKey(e, dim, refDate)));
      const allKeys = new Set([...currentKeys, ...previousKeys]);

      for (const key of allKeys) {
        const curGroup = currentEmployees.filter((e) => segmentKey(e, dim, refDate) === key);
        const prevGroup = previousEmployees.filter((e) => segmentKey(e, dim, refDate) === key);
        if (curGroup.length === 0 && prevGroup.length === 0) continue;

        const curVal = curGroup.length > 0 ? metricFn(curGroup) : 0;
        const prevVal = prevGroup.length > 0 ? metricFn(prevGroup) : 0;
        const contribution = curVal - prevVal;
        const contributionPct = Math.abs(totalDelta) > 0.001 ? (contribution / totalDelta) * 100 : 0;

        const sampleEmp = (curGroup[0] ?? prevGroup[0])!;
        allSegments.push({
          dimension: dim,
          key,
          label: segmentLabel(sampleEmp, dim, refDate),
          currentValue: curVal,
          previousValue: prevVal,
          contribution,
          contributionPct,
        });
      }
    }

    // Sort by absolute contribution, take topN
    return allSegments
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, topN)
      .map((s) => ({
        dimension: s.dimension,
        label: s.label,
        value: s.currentValue,
        contribution: s.contribution,
        contributionPct: s.contributionPct,
        trend: s.contribution > 0.01 ? 'up' : s.contribution < -0.01 ? 'down' : 'flat',
      }));
  }
}
