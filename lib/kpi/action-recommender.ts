import type { KPIValue, KPIStatus, DriverSegment, ActionRecommendation } from './types';

export class ActionRecommender {
  recommend(kpiValue: KPIValue, topDriver: DriverSegment | null): ActionRecommendation {
    const { status, definition } = kpiValue;
    const baseAction = definition.actionIfOffTrack;

    const driverHint = topDriver
      ? ` Prioritní segment: ${topDriver.label}.`
      : '';

    switch (status as KPIStatus) {
      case 'red':
        return {
          kpiId: kpiValue.kpiId,
          status,
          priority: 'immediate',
          action: baseAction + driverHint,
          rationale: `Metrika překročila červený práh. Okamžitá akce je nutná.`,
        };

      case 'acceptable':
        return {
          kpiId: kpiValue.kpiId,
          status,
          priority: 'scheduled',
          action: baseAction + (topDriver ? ` Zaměřte se zejména na ${topDriver.label}.` : ''),
          rationale: `Metrika je v přijatelném pásmu, ale trend naznačuje potřebu intervence.`,
        };

      case 'green':
        return {
          kpiId: kpiValue.kpiId,
          status,
          priority: 'monitor',
          action: 'Pokračovat ve sledování. Cíl je splněn.',
          rationale: 'Metrika je v cílovém pásmu — žádná okamžitá akce není nutná.',
        };

      default:
        return {
          kpiId: kpiValue.kpiId,
          status: 'no_data',
          priority: 'monitor',
          action: 'Ověřit dostupnost dat pro toto KPI a dané období.',
          rationale: 'Data nejsou k dispozici.',
        };
    }
  }
}
