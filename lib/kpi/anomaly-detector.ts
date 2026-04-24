import type { KPIValue, Anomaly } from './types';

interface HistoryPoint {
  period: string;
  value: number;
}

export class AnomalyDetector {
  detect(history: HistoryPoint[], current: KPIValue): Anomaly | null {
    if (history.length < 4) return null;

    const values = history.map((h) => h.value);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance);

    if (std < 0.001) return null;

    const zScore = (current.value - mean) / std;
    const absZ = Math.abs(zScore);
    if (absZ < 2.0) return null;

    const severity: Anomaly['severity'] = absZ >= 3.0 ? 'severe' : absZ >= 2.5 ? 'moderate' : 'mild';
    const direction: Anomaly['direction'] = zScore > 0 ? 'spike' : 'drop';
    const dirLabel = direction === 'spike' ? 'nárůst' : 'pokles';
    const description =
      `Anomálie detekována: ${dirLabel} o ${absZ.toFixed(1)}σ od historického průměru ` +
      `(průměr: ${mean.toFixed(1)}, hodnota: ${current.value.toFixed(1)}).`;

    return {
      kpiId: current.kpiId,
      period: current.period,
      zScore,
      direction,
      severity,
      description,
    };
  }
}
