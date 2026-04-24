import type { DataProvider, Period, CommonFilter } from '@/lib/data/provider';
import type {
  KPIValue,
  KPISnapshot,
  DriverSegment,
  ExecutiveSummary,
} from './types';
import type { AIInsightProvider } from './ai-insight-provider';
import { KPI_CATALOG } from './catalog';
import { KPIEvaluator } from './evaluator';
import { DriverAnalyzer } from './driver-analyzer';
import { AnomalyDetector } from './anomaly-detector';
import { NarrativeGenerator } from './narrative-generator';
import { ActionRecommender } from './action-recommender';

const PRIORITY_WEIGHT: Record<1 | 2 | 3, number> = { 1: 3, 2: 2, 3: 1 };

function healthScoreWeight(kpiValue: KPIValue): number {
  const { priority } = kpiValue.definition;
  const statusScore = kpiValue.status === 'green' ? 1.0 : kpiValue.status === 'acceptable' ? 0.5 : 0.0;
  return statusScore * PRIORITY_WEIGHT[priority];
}

export class KPIService {
  private evaluator: KPIEvaluator;
  private driverAnalyzer = new DriverAnalyzer();
  private anomalyDetector = new AnomalyDetector();
  private narrativeGenerator = new NarrativeGenerator();
  private actionRecommender = new ActionRecommender();

  constructor(
    private provider: DataProvider,
    private aiInsights: AIInsightProvider,
  ) {
    this.evaluator = new KPIEvaluator(provider);
  }

  async getSnapshot(
    period: Period,
    filter?: CommonFilter,
    previousPeriod?: Period,
  ): Promise<KPISnapshot[]> {
    const values = await this.evaluator.evaluateAll(period, filter, previousPeriod);
    return Promise.all(values.map((v) => this.buildSnapshot(v, period, filter)));
  }

  async getHistory(kpiId: string, months: number, filter?: CommonFilter): Promise<KPIValue[]> {
    const results: KPIValue[] = [];
    const now = new Date('2026-03-31');
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const period: Period = { from: `${year}-${month}-01`, to: `${year}-${month}-28` };
      try {
        const v = await this.evaluator.evaluate(kpiId, period, filter);
        results.push(v);
      } catch { /* skip */ }
    }
    return results;
  }

  async getAlerts(period: Period, filter?: CommonFilter): Promise<KPISnapshot[]> {
    const snapshots = await this.getSnapshot(period, filter);
    return snapshots
      .filter((s) => s.kpiValue.status === 'red' || s.kpiValue.status === 'acceptable')
      .sort((a, b) => {
        const statusOrder = { red: 0, acceptable: 1, green: 2, no_data: 3 };
        const statusDiff = statusOrder[a.kpiValue.status] - statusOrder[b.kpiValue.status];
        if (statusDiff !== 0) return statusDiff;
        return b.kpiValue.definition.priority - a.kpiValue.definition.priority;
      });
  }

  async getExecutiveSummary(period: Period, filter?: CommonFilter): Promise<ExecutiveSummary> {
    const prevPeriod = this.previousMonthPeriod(period);
    const snapshots = await this.getSnapshot(period, filter, prevPeriod);

    const redCount = snapshots.filter((s) => s.kpiValue.status === 'red').length;
    const acceptableCount = snapshots.filter((s) => s.kpiValue.status === 'acceptable').length;
    const greenCount = snapshots.filter((s) => s.kpiValue.status === 'green').length;
    const alertCount = redCount + acceptableCount;

    const totalWeight = KPI_CATALOG.reduce((s, k) => s + PRIORITY_WEIGHT[k.priority], 0);
    const earnedWeight = snapshots.reduce((s, snap) => s + healthScoreWeight(snap.kpiValue), 0);
    const healthScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    const topAlerts = snapshots
      .filter((s) => s.kpiValue.status === 'red')
      .sort((a, b) => b.kpiValue.definition.priority - a.kpiValue.definition.priority)
      .slice(0, 5);

    const improved = snapshots.filter(
      (s) => s.kpiValue.momDelta !== null &&
        ((s.kpiValue.definition.direction === 'down_good' && s.kpiValue.momDelta < -0.5) ||
         (s.kpiValue.definition.direction === 'up_good' && s.kpiValue.momDelta > 0.5)),
    ).slice(0, 3);

    const worsened = snapshots.filter(
      (s) => s.kpiValue.momDelta !== null &&
        ((s.kpiValue.definition.direction === 'down_good' && s.kpiValue.momDelta > 0.5) ||
         (s.kpiValue.definition.direction === 'up_good' && s.kpiValue.momDelta < -0.5)),
    ).slice(0, 3);

    const toWatch = snapshots.filter((s) => s.kpiValue.status === 'acceptable').slice(0, 3);

    const aiExecutiveSummary = this.buildExecutiveSummaryText(healthScore, redCount, acceptableCount);

    return {
      healthScore,
      period: period.from.slice(0, 7),
      alertCount,
      redCount,
      acceptableCount,
      greenCount,
      topAlerts,
      changesThisMonth: { improved, worsened, toWatch },
      aiExecutiveSummary,
    };
  }

  private async buildSnapshot(
    kpiValue: KPIValue,
    _period: Period,
    _filter?: CommonFilter,
  ): Promise<KPISnapshot> {
    // Driver analysis — simplified: use empty drivers (full analysis needs employee subsets per period)
    const drivers: DriverSegment[] = [];

    // Anomaly detection — no history available in single-call context
    const anomaly = null;

    const narrative = this.narrativeGenerator.generate(kpiValue, drivers, anomaly);
    const action = this.actionRecommender.recommend(kpiValue, drivers[0] ?? null);
    const aiInsight = await this.aiInsights.getInsight(kpiValue.kpiId, kpiValue.status);

    return { kpiValue, narrative, anomaly, action, aiInsight };
  }

  private previousMonthPeriod(period: Period): Period {
    const d = new Date(period.from);
    d.setMonth(d.getMonth() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return { from: `${year}-${month}-01`, to: `${year}-${month}-28` };
  }

  private buildExecutiveSummaryText(health: number, red: number, acceptable: number): string {
    if (health >= 80 && red === 0) {
      return `HR systém je v dobré kondici — Health Score ${health}/100. Všechna prioritní KPI jsou v zeleném nebo přijatelném pásmu. Doporučuji zaměřit pozornost na long-term trendy v retenci a talent managementu.`;
    }
    if (red > 0) {
      return `Health Score ${health}/100 — ${red} metrik${red === 1 ? 'a překračuje' : 'y překračují'} červený práh a vyžaduj${red === 1 ? 'í' : 'í'} okamžitou pozornost. Dalších ${acceptable} KPI je v přijatelném pásmu a je třeba je sledovat. Prioritizujte akce dle sekce Upozornění.`;
    }
    return `Health Score ${health}/100. Žádné kritické metriky — ${acceptable} KPI je v přijatelném pásmu a vyžaduje průběžné sledování.`;
  }
}
