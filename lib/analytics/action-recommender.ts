import type { KpiActionRecommendation, KpiDriver, KpiEvaluation } from './types';

export function recommendAction(
  evaluation: KpiEvaluation,
  drivers: readonly KpiDriver[],
): KpiActionRecommendation {
  const topDriver = drivers[0];
  const segment = topDriver ? ` Nejprve řešit segment: ${topDriver.label}.` : '';

  if (evaluation.status === 'green') {
    return {
      severity: 'green',
      titleCs: 'Pokračovat ve sledování',
      bodyCs: `Metrika je v zeleném pásmu. Doporučení: držet současný režim a sledovat změnu v dalším období.${segment}`,
    };
  }

  return {
    severity: evaluation.status,
    titleCs: evaluation.status === 'red' ? 'Okamžitá akce' : 'Manažerské sledování',
    bodyCs: `${evaluation.definition.actionIfOffTrackCs}${segment}`,
  };
}
