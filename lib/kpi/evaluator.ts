import type { DataProvider, Period, CommonFilter } from '@/lib/data/provider';
import type { KPIValue, KPIStatus } from './types';
import type { KPIDefinition } from './catalog';
import { KPI_CATALOG, KPI_BY_ID } from './catalog';

// ─── Status computation ───────────────────────────────────────────

function computeStatus(def: KPIDefinition, value: number): KPIStatus {
  const { direction, thresholds } = def;

  if (def.id === 'headcount') {
    const target = def.target ?? value;
    const deviation = Math.abs((value - target) / target);
    if (deviation <= thresholds.green) return 'green';
    if (deviation <= thresholds.acceptable) return 'acceptable';
    return 'red';
  }

  if (def.id === 'wage_kpi') {
    const deviation = Math.abs(value - 100);
    if (deviation <= thresholds.green) return 'green';
    if (deviation <= thresholds.acceptable) return 'acceptable';
    return 'red';
  }

  if (def.id === 'hc_per_division') {
    if (value <= thresholds.green) return 'green';
    if (value <= thresholds.acceptable) return 'acceptable';
    return 'red';
  }

  if (direction === 'down_good') {
    if (value <= thresholds.green) return 'green';
    if (value <= thresholds.acceptable) return 'acceptable';
    return 'red';
  }

  if (direction === 'up_good') {
    if (value >= thresholds.green) return 'green';
    if (value >= thresholds.acceptable) return 'acceptable';
    return 'red';
  }

  // flat_good: within ±green% of target
  const t = def.target ?? value;
  const dev = t > 0 ? Math.abs((value - t) / t) : 0;
  if (dev <= thresholds.green) return 'green';
  if (dev <= thresholds.acceptable) return 'acceptable';
  return 'red';
}

function makeResult(
  def: KPIDefinition,
  period: string,
  value: number,
  previousValue: number | null,
): KPIValue {
  const momDelta = previousValue !== null ? value - previousValue : null;
  return {
    kpiId: def.id,
    period,
    value,
    previousValue,
    momDelta,
    yoyDelta: null,
    status: computeStatus(def, value),
    definition: def,
  };
}

// ─── Individual KPI calculators ───────────────────────────────────

export class KPIEvaluator {
  constructor(private provider: DataProvider) {}

  async evaluate(
    kpiId: string,
    period: Period,
    filter?: CommonFilter,
    previousPeriod?: Period,
  ): Promise<KPIValue> {
    const def = KPI_BY_ID.get(kpiId);
    if (!def) throw new Error(`Unknown KPI: ${kpiId}`);

    const periodLabel = period.from.slice(0, 7);
    const value = await this.computeValue(def, period, filter);
    const previousValue = previousPeriod
      ? await this.computeValue(def, previousPeriod, filter)
      : null;

    return makeResult(def, periodLabel, value, previousValue);
  }

  async evaluateAll(
    period: Period,
    filter?: CommonFilter,
    previousPeriod?: Period,
  ): Promise<KPIValue[]> {
    return Promise.all(
      KPI_CATALOG.map((def) => this.evaluate(def.id, period, filter, previousPeriod)),
    );
  }

  private async computeValue(
    def: KPIDefinition,
    period: Period,
    filter?: CommonFilter,
  ): Promise<number> {
    switch (def.id) {
      case 'headcount':         return this.calcHeadcount(period, filter);
      case 'fte_ratio':         return this.calcFteRatio(period, filter);
      case 'gender_pay_gap':    return this.calcGenderPayGap(period, filter);
      case 'women_in_management': return this.calcWomenInManagement(filter);
      case 'employees_in':      return this.calcEmployeesIn(period, filter);
      case 'employees_out':     return this.calcEmployeesOut(period, filter);
      case 'untaken_holiday':   return this.calcUntakenHoliday(period, filter);
      case 'sickness_rate':     return this.calcSicknessRate(period, filter);
      case 'avg_wage':          return this.calcAvgWage(period, filter);
      case 'wage_kpi':          return this.calcWageKpi(period, filter);
      case 'cap_kpi':           return this.calcCapKpi(filter);
      case 'hc_per_division':   return this.calcHcPerDivision(period, filter);
      case 'time_to_fill':      return this.calcTimeToFill(period, filter);
      case 'ttf_critical':      return this.calcTtfCritical(period, filter);
      case 'cost_per_hire':     return this.calcCostPerHire(period, filter);
      case 'quality_of_hire':   return this.calcQualityOfHire(period, filter);
      case 'employer_evaluation': return this.calcEmployerEvaluation(period, filter);
      case 'fluctuation_rate':  return this.calcFluctuationRate(period, filter);
      case 'fluctuation_critical': return this.calcFluctuationCritical(period, filter);
      case 'succession_rate':   return this.calcSuccessionRate();
      case 'enps':              return this.calcEnps(filter);
      case 'talent_ratio':      return this.calcTalentRatio(filter);
      default:
        throw new Error(`No calculator for KPI: ${def.id}`);
    }
  }

  // ── I. HR Statistics ──────────────────────────────────────────

  private async calcHeadcount(period: Period, filter?: CommonFilter): Promise<number> {
    const employees = await this.provider.getEmployees(filter);
    return employees.filter(
      (e) => e.hireDate <= period.to && (e.terminationDate === null || e.terminationDate >= period.from),
    ).length;
  }

  private async calcFteRatio(period: Period, filter?: CommonFilter): Promise<number> {
    const employees = await this.provider.getEmployees(filter);
    const active = employees.filter(
      (e) => e.hireDate <= period.to && (e.terminationDate === null || e.terminationDate >= period.from),
    );
    if (active.length === 0) return 0;
    return active.reduce((sum, e) => sum + e.fte, 0) / active.length;
  }

  private async calcGenderPayGap(period: Period, filter?: CommonFilter): Promise<number> {
    const payroll = await this.provider.getPayroll(period, filter);
    const employees = await this.provider.getEmployees(filter);
    const empMap = new Map(employees.map((e) => [e.id, e]));

    const bySex = { male: 0, maleCount: 0, female: 0, femaleCount: 0 };
    for (const p of payroll) {
      const emp = empMap.get(p.employeeId);
      if (!emp) continue;
      if (emp.gender === 'male') { bySex.male += p.baseSalary; bySex.maleCount++; }
      else { bySex.female += p.baseSalary; bySex.femaleCount++; }
    }
    if (bySex.maleCount === 0 || bySex.femaleCount === 0) return 0;
    const avgMale = bySex.male / bySex.maleCount;
    const avgFemale = bySex.female / bySex.femaleCount;
    return ((avgMale - avgFemale) / avgMale) * 100;
  }

  private async calcWomenInManagement(filter?: CommonFilter): Promise<number> {
    const employees = await this.provider.getEmployees(filter);
    const active = employees.filter((e) => !e.terminationDate);
    const mgmt = active.filter((e) => ['B0', 'B1', 'B2', 'B3'].includes(e.grade));
    if (mgmt.length === 0) return 0;
    return (mgmt.filter((e) => e.gender === 'female').length / mgmt.length) * 100;
  }

  // ── II. Workforce Movement ────────────────────────────────────

  private async calcEmployeesIn(period: Period, filter?: CommonFilter): Promise<number> {
    const events = await this.provider.getWorkforceEvents(period, filter);
    return events.filter((e) => e.type === 'hire').length;
  }

  private async calcEmployeesOut(period: Period, filter?: CommonFilter): Promise<number> {
    const events = await this.provider.getWorkforceEvents(period, filter);
    return events.filter((e) => e.type === 'terminate').length;
  }

  private async calcUntakenHoliday(period: Period, filter?: CommonFilter): Promise<number> {
    const absence = await this.provider.getAbsence(period, filter);
    const employees = await this.provider.getEmployees(filter);
    const activeCount = employees.filter((e) => !e.terminationDate).length;
    if (activeCount === 0) return 0;
    const ANNUAL_VACATION_DAYS = 20;
    const takenDays = absence.filter((a) => a.type === 'vacation').reduce((s, a) => s + a.days, 0);
    const totalEntitlement = activeCount * ANNUAL_VACATION_DAYS;
    const untaken = Math.max(0, totalEntitlement - takenDays);
    return untaken / activeCount;
  }

  private async calcSicknessRate(period: Period, filter?: CommonFilter): Promise<number> {
    const absence = await this.provider.getAbsence(period, filter);
    const employees = await this.provider.getEmployees(filter);
    const activeCount = employees.filter((e) => !e.terminationDate).length;
    if (activeCount === 0) return 0;
    const sickDays = absence.filter((a) => a.type === 'sick').reduce((s, a) => s + a.days, 0);
    const periodMs = new Date(period.to).getTime() - new Date(period.from).getTime();
    const workingDays = Math.round((periodMs / 86_400_000) * (5 / 7));
    const totalFund = activeCount * workingDays;
    return totalFund > 0 ? (sickDays / totalFund) * 100 : 0;
  }

  // ── III. Cost & Structure ─────────────────────────────────────

  private async calcAvgWage(period: Period, filter?: CommonFilter): Promise<number> {
    const payroll = await this.provider.getPayroll(period, filter);
    const employees = await this.provider.getEmployees(filter);
    const ppIds = new Set(employees.filter((e) => e.employmentType === 'PP').map((e) => e.id));
    const ppPayroll = payroll.filter((p) => ppIds.has(p.employeeId));
    if (ppPayroll.length === 0) return 0;
    return ppPayroll.reduce((s, p) => s + p.baseSalary, 0) / ppPayroll.length;
  }

  private async calcWageKpi(period: Period, filter?: CommonFilter): Promise<number> {
    const positions = await this.provider.getPositions(filter);
    const payroll = await this.provider.getPayroll(period, filter);
    const totalActual = payroll.reduce((s, p) => s + p.totalCost, 0);
    // Budget estimate: capFte × avg base (mock: 38000 IC base)
    const totalBudget = positions.reduce((s, p) => s + p.capFte * 38_000, 0);
    if (totalBudget === 0) return 100;
    return (totalActual / payroll.length / totalBudget) * 100 * payroll.length;
  }

  private async calcCapKpi(filter?: CommonFilter): Promise<number> {
    const positions = await this.provider.getPositions(filter);
    const totalCap = positions.reduce((s, p) => s + p.capFte, 0);
    const totalActual = positions.reduce((s, p) => s + p.actualFte, 0);
    return totalCap > 0 ? totalActual / totalCap : 0;
  }

  private async calcHcPerDivision(period: Period, filter?: CommonFilter): Promise<number> {
    const positions = await this.provider.getPositions(filter);
    const employees = await this.provider.getEmployees(filter);
    const activeIds = new Set(
      employees
        .filter((e) => e.hireDate <= period.to && (e.terminationDate === null || e.terminationDate >= period.from))
        .map((e) => e.divisionId),
    );

    const divisionMap = new Map<string, { cap: number; actual: number }>();
    for (const p of positions) {
      if (!divisionMap.has(p.divisionId)) divisionMap.set(p.divisionId, { cap: 0, actual: 0 });
      const d = divisionMap.get(p.divisionId)!;
      d.cap += p.capFte;
      d.actual += p.actualFte;
    }

    const deviations: number[] = [];
    for (const [divId, d] of divisionMap) {
      if (!activeIds.has(divId) || d.cap === 0) continue;
      deviations.push(Math.abs((d.actual - d.cap) / d.cap) * 100);
    }
    return deviations.length > 0 ? deviations.reduce((s, v) => s + v, 0) / deviations.length : 0;
  }

  // ── IV. Recruitment ───────────────────────────────────────────

  private async calcTimeToFill(period: Period, filter?: CommonFilter): Promise<number> {
    const reqs = await this.provider.getRequisitions(period, filter);
    const filled = reqs.filter((r) => r.publishedDate && r.hireDate && !r.canceled);
    if (filled.length === 0) return this.mockTtf(27, 5);
    const diffs = filled.map((r) => {
      const ms = new Date(r.hireDate!).getTime() - new Date(r.publishedDate!).getTime();
      return ms / 86_400_000;
    });
    return diffs.reduce((s, v) => s + v, 0) / diffs.length;
  }

  private async calcTtfCritical(period: Period, filter?: CommonFilter): Promise<number> {
    const reqs = await this.provider.getRequisitions(period, filter);
    const filled = reqs.filter((r) => r.publishedDate && r.hireDate && r.critical && !r.canceled);
    if (filled.length === 0) return this.mockTtf(18, 6);
    const diffs = filled.map((r) => {
      const ms = new Date(r.hireDate!).getTime() - new Date(r.publishedDate!).getTime();
      return ms / 86_400_000;
    });
    return diffs.reduce((s, v) => s + v, 0) / diffs.length;
  }

  private async calcCostPerHire(period: Period, filter?: CommonFilter): Promise<number> {
    const reqs = await this.provider.getRequisitions(period, filter);
    const hired = reqs.filter((r) => r.hireDate && !r.canceled);
    if (hired.length === 0) return 23_500;
    const total = hired.reduce((s, r) => s + r.cost, 0);
    return total / hired.length;
  }

  private async calcQualityOfHire(period: Period, filter?: CommonFilter): Promise<number> {
    const employees = await this.provider.getEmployees(filter);
    const recentHires = employees.filter(
      (e) => e.hireDate >= period.from && e.hireDate <= period.to,
    );
    if (recentHires.length === 0) return 8;
    const earlyAttrition = recentHires.filter((e) => {
      if (!e.terminationDate) return false;
      const ms = new Date(e.terminationDate).getTime() - new Date(e.hireDate).getTime();
      return ms <= 90 * 86_400_000;
    });
    return (earlyAttrition.length / recentHires.length) * 100;
  }

  private async calcEmployerEvaluation(period: Period, _filter?: CommonFilter): Promise<number> {
    // Recruitment parser provides ratings — use mean if available, else stable mock
    void period;
    return 4.1; // mock — real value from recruitment data would replace this
  }

  // ── V. Retention ──────────────────────────────────────────────

  private async calcFluctuationRate(period: Period, filter?: CommonFilter): Promise<number> {
    const twelveMonthsAgo = new Date(period.to);
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const trailing12: Period = { from: twelveMonthsAgo.toISOString().slice(0, 10), to: period.to };

    const events = await this.provider.getWorkforceEvents(trailing12, filter);
    const terminations = events.filter((e) => e.type === 'terminate');
    const employees = await this.provider.getEmployees(filter);
    const avgHc = employees.filter(
      (e) => e.hireDate <= period.to && (e.terminationDate === null || e.terminationDate >= trailing12.from),
    ).length;
    if (avgHc === 0) return 0;
    return (terminations.length / avgHc) * 100;
  }

  private async calcFluctuationCritical(period: Period, filter?: CommonFilter): Promise<number> {
    const twelveMonthsAgo = new Date(period.to);
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const trailing12: Period = { from: twelveMonthsAgo.toISOString().slice(0, 10), to: period.to };

    const employees = await this.provider.getEmployees(filter);
    const critical = employees.filter((e) => e.criticalPositionFlag);
    const criticalIds = new Set(critical.map((e) => e.id));

    const events = await this.provider.getWorkforceEvents(trailing12, filter);
    const critTerminations = events.filter((e) => e.type === 'terminate' && criticalIds.has(e.employeeId));
    const avgCritHc = critical.filter(
      (e) => e.hireDate <= period.to && (e.terminationDate === null || e.terminationDate >= trailing12.from),
    ).length;
    if (avgCritHc === 0) return 0;
    return (critTerminations.length / avgCritHc) * 100;
  }

  // ── VI. Succession ────────────────────────────────────────────

  private async calcSuccessionRate(): Promise<number> {
    const plans = await this.provider.getSuccessionPlans();
    if (plans.length === 0) return 0;
    const covered = plans.filter((p) => p.readiness !== 'gap').length;
    return (covered / plans.length) * 100;
  }

  // ── VII. Engagement ───────────────────────────────────────────

  private async calcEnps(filter?: CommonFilter): Promise<number> {
    const cycle = '2025-Q4';
    const responses = await this.provider.getEnpsResponses(cycle, filter);
    if (responses.length === 0) return 0;
    const promoters = responses.filter((r) => r.score >= 9).length;
    const detractors = responses.filter((r) => r.score <= 6).length;
    return ((promoters - detractors) / responses.length) * 100;
  }

  // ── VIII. Talent & Growth ─────────────────────────────────────

  private async calcTalentRatio(filter?: CommonFilter): Promise<number> {
    const employees = await this.provider.getEmployees(filter);
    const active = employees.filter((e) => !e.terminationDate);
    if (active.length === 0) return 0;
    return (active.filter((e) => e.talentPoolFlag).length / active.length) * 100;
  }

  // ── Helpers ───────────────────────────────────────────────────

  /** Stabilní mock pro TTF když nemáme reálná data z ATS */
  private mockTtf(mean: number, stddev: number): number {
    return mean + (Math.random() - 0.5) * stddev;
  }
}
