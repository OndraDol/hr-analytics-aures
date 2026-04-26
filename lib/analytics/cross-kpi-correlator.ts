import type { KpiCode } from '@/lib/kpi/catalog';
import type { CrossKpiHypothesis, KpiEvaluation } from './types';

const PAIRS: [KpiCode, KpiCode, string][] = [
  ['FLUCT', 'ENPS', 'Retence a engagement se zhoršují současně. Doporučené je spojit exit důvody s eNPS komentáři v nejhorších segmentech.'],
  ['TTF', 'CPH', 'Nábor je současně pomalý i drahý. Priorita je najít fázi funnelu a kanál, který drží čas i náklad.'],
  ['SICKNESS_RATE', 'SHIFT_COVERAGE', 'Absence a pokrytí směn ukazují společné operační riziko. Je potřeba prověřit plánování kapacit.'],
  ['FLUCT_CRIT', 'SUCCESSION', 'Odchody z kritických pozic a nástupnictví vytváří leadership continuity riziko.'],
];

export function detectHypotheses(evaluations: readonly KpiEvaluation[]): CrossKpiHypothesis[] {
  const byCode = new Map(evaluations.map((evaluation) => [evaluation.code, evaluation]));

  return PAIRS.flatMap(([firstCode, secondCode, messageCs]) => {
    const first = byCode.get(firstCode);
    const second = byCode.get(secondCode);
    if (!first || !second) return [];
    if (first.status === 'green' || second.status === 'green') return [];

    const firstTrend = first.trend.mom ?? 0;
    const secondTrend = second.trend.mom ?? 0;
    const sameDirection = Math.sign(firstTrend) === Math.sign(secondTrend);
    const bothRed = first.status === 'red' && second.status === 'red';
    const strength: CrossKpiHypothesis['strength'] = bothRed && sameDirection ? 'strong' : 'plausible';

    return [{
      kpis: [firstCode, secondCode] as [string, string],
      strength,
      messageCs,
      confidenceCs: sameDirection
        ? 'Trend obou KPI jde stejným směrem; hypotéza má vyšší prioritu pro review.'
        : 'KPI jsou mimo zelené pásmo, ale trend není shodný. Berte jako pracovní hypotézu.',
    }];
  }).slice(0, 3);
}
