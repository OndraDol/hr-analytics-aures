import type { DataProvider } from '@/lib/data/provider';

export type SectionId = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';

export type KpiCode =
  | 'HR_STATS'
  | 'WF_MOVEMENT'
  | 'HOLIDAY_UNTAKEN'
  | 'SICKNESS_RATE'
  | 'SHIFT_COVERAGE'
  | 'WAGE_KPI'
  | 'CAP_KPI'
  | 'HC_FTE_DIV'
  | 'AVG_WAGE'
  | 'TTF'
  | 'TTF_CRIT'
  | 'TIME_TO_PROD'
  | 'CPH'
  | 'QUALITY_HIRE'
  | 'EMPLOYER_EVAL'
  | 'FLUCT'
  | 'FLUCT_CRIT'
  | 'SUCCESSION'
  | 'ENPS'
  | 'TALENT_GROWTH';

export type KpiStatus = 'green' | 'amber' | 'red';
export type KpiDirection = 'up' | 'down' | 'target';
export type KpiFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
export type KpiTrendType = 'MoM' | 'QoQ' | 'YoY';
export type KpiUnit = 'pct' | 'days' | 'CZK' | 'count' | 'score' | 'ratio' | 'months' | 'mix';
export type KpiThresholdType =
  | 'absolute'
  | 'budgetTolerance'
  | 'targetBand'
  | 'benchmark'
  | 'dataDrivenPercentile'
  | 'seasonal';
export type KpiThresholdSource =
  | 'xls'
  | 'externalBenchmark'
  | 'historicalData'
  | 'storyDefault'
  | 'budget'
  | 'hrToConfirm';
export type KpiThresholdConfidence = 'high' | 'medium' | 'low' | 'needs-validation';
export type DataSource =
  | 'HRIS'
  | 'Payroll'
  | 'Recruitment'
  | 'Talent Pool'
  | 'Survio'
  | 'Annual appraisal'
  | 'Mock';

export interface KpiThresholds {
  green: number;
  amber: number;
  red: number;
  target?: number;
  targetToleranceGreen?: number;
  targetToleranceAmber?: number;
  type?: KpiThresholdType;
  source?: KpiThresholdSource;
  confidence?: KpiThresholdConfidence;
  benchmarkNoteCs?: string;
  validFrom?: string;
  reviewOwner?: string;
  reviewCadence?: string;
}

export interface KpiDefinition {
  code: KpiCode;
  nameCs: string;
  section: SectionId | null;
  priority: 1 | 2 | 3;
  recipient: string;
  source: DataSource;
  definitionCs: string;
  formulaCs: string;
  frequency: KpiFrequency;
  owner: string;
  riskAnalysisCs: string;
  businessImpactCs: string;
  direction: KpiDirection;
  trendType: KpiTrendType;
  unit: KpiUnit;
  thresholds: KpiThresholds;
  actionIfOffTrackCs: string;
  crossCutting?: string[];
  valueProvider?: keyof DataProvider | 'derived';
}

export const KPI_CATALOG = [
  {
    code: 'HR_STATS',
    nameCs: 'Stav zaměstnanců',
    section: 'I',
    priority: 1,
    recipient: 'B0-B3',
    source: 'HRIS',
    definitionCs: 'Kolik lidí ve firmě aktuálně je, v jaké struktuře pracují a kde se liší od plánu.',
    formulaCs: 'Aktivní zaměstnanci k poslednímu dni období.',
    frequency: 'yearly',
    owner: 'HR reporting',
    riskAnalysisCs: 'Když není jasné, kolik lidí a FTE firma opravdu má, zkreslí se nábor, náklady i fluktuace.',
    businessImpactCs: 'Ukazuje, jestli má firma dost lidí pro plánovaný provoz a kde vzniká kapacitní tlak.',
    direction: 'target',
    trendType: 'YoY',
    unit: 'count',
    thresholds: { target: 1_735, green: 1_735, amber: 1_735, red: 1_735, targetToleranceGreen: 0.15, targetToleranceAmber: 0.3 },
    actionIfOffTrackCs: 'Porovnat stav se staffplanem a vysvětlit rozdíl po divizích, hlavně tam, kde chybí nebo přibývají lidé.',
    crossCutting: ['compensation-pay-gap'],
    valueProvider: 'derived',
  },
  {
    code: 'WF_MOVEMENT',
    nameCs: 'Nástupy a odchody',
    section: 'II',
    priority: 1,
    recipient: 'B0-B3',
    source: 'HRIS',
    definitionCs: 'Čistá změna zaměstnanců v období: nástupy minus odchody.',
    formulaCs: 'Počet nástupů - počet odchodů za období.',
    frequency: 'monthly',
    owner: 'HR reporting',
    riskAnalysisCs: 'Dlouhodobě záporný pohyb zvyšuje tlak na nábor a provoz.',
    businessImpactCs: 'Ukazuje, kde firma roste nebo ztrácí kapacitu.',
    direction: 'target',
    trendType: 'MoM',
    unit: 'count',
    thresholds: { target: 0, green: 0, amber: 0, red: 0, targetToleranceGreen: 35, targetToleranceAmber: 75 },
    actionIfOffTrackCs: 'Rozpadnout nástupy a odchody podle divize a země, potvrdit hiring plán.',
    valueProvider: 'getWorkforceEvents',
  },
  {
    code: 'HOLIDAY_UNTAKEN',
    nameCs: 'Nevyčerpaná dovolená',
    section: null,
    priority: 1,
    recipient: 'B1-B3',
    source: 'Payroll',
    definitionCs: 'Odhad nevyčerpané dovolené na aktivního zaměstnance.',
    formulaCs: '(Roční nárok - čerpaná dovolená YTD) / aktivní zaměstnanci.',
    frequency: 'monthly',
    owner: 'Payroll',
    riskAnalysisCs: 'Vysoké zůstatky zhoršují plánování kapacit a tvoří budoucí náklad.',
    businessImpactCs: 'Včasné řízení dovolených snižuje provozní tlak na konci roku.',
    direction: 'down',
    trendType: 'MoM',
    unit: 'days',
    thresholds: { green: 3, amber: 5, red: 8, target: 2 },
    actionIfOffTrackCs: 'Monitorovat a vynutit plán čerpání dovolené u týmů s nejvyšším zůstatkem.',
    crossCutting: ['absence-coverage'],
    valueProvider: 'derived',
  },
  {
    code: 'SICKNESS_RATE',
    nameCs: 'Nemocnost',
    section: null,
    priority: 2,
    recipient: 'B1-B3',
    source: 'Payroll',
    definitionCs: 'Podíl sick days na dostupném pracovním fondu.',
    formulaCs: 'Dny nemoci / odhad pracovních dnů aktivních zaměstnanců.',
    frequency: 'monthly',
    owner: 'Payroll',
    riskAnalysisCs: 'Vyšší nemocnost snižuje pokrytí provozu a zvyšuje náklady.',
    businessImpactCs: 'Pomáhá odhalit týmy s dlouhodobým provozním přetížením.',
    direction: 'down',
    trendType: 'MoM',
    unit: 'pct',
    thresholds: { green: 3, amber: 5, red: 7, target: 3 },
    actionIfOffTrackCs: 'Prověřit lokality a manažery s nejvyšší nemocností, nastavit preventivní opatření.',
    crossCutting: ['absence-coverage'],
    valueProvider: 'getAbsence',
  },
  {
    code: 'SHIFT_COVERAGE',
    nameCs: 'Pokrytí směn',
    section: null,
    priority: 2,
    recipient: 'B2-B3',
    source: 'Payroll',
    definitionCs: 'Podíl pokrytých směn proti plánovaným směnám.',
    formulaCs: 'Pokryté směny / plánované směny.',
    frequency: 'monthly',
    owner: 'Payroll',
    riskAnalysisCs: 'Nízké pokrytí směn přímo ohrožuje provoz poboček.',
    businessImpactCs: 'Umožňuje včas řešit kapacitní rizika v provozu.',
    direction: 'up',
    trendType: 'MoM',
    unit: 'pct',
    thresholds: { green: 97, amber: 94, red: 90, target: 98 },
    actionIfOffTrackCs: 'Zkontrolovat plán směn, dostupnost brigádníků a dopad absencí v dané lokalitě.',
    crossCutting: ['absence-coverage'],
    valueProvider: 'derived',
  },
  {
    code: 'WAGE_KPI',
    nameCs: 'Mzdové náklady',
    section: 'III',
    priority: 2,
    recipient: 'B0-B2',
    source: 'Payroll',
    definitionCs: 'Celkové mzdové náklady včetně variabilní složky, benefitů a non-personal costs.',
    formulaCs: 'Součet totalCost za období.',
    frequency: 'yearly',
    owner: 'Payroll',
    riskAnalysisCs: 'Nekontrolovaný růst nákladů může překročit budget.',
    businessImpactCs: 'Základ pro řízení personálních nákladů a plánování budgetu.',
    direction: 'down',
    trendType: 'YoY',
    unit: 'CZK',
    thresholds: { green: 450_000_000, amber: 520_000_000, red: 600_000_000, target: 480_000_000 },
    actionIfOffTrackCs: 'Rozpadnout růst nákladů podle divize, grade a složky mzdy.',
    crossCutting: ['compensation-pay-gap'],
    valueProvider: 'getPayroll',
  },
  {
    code: 'CAP_KPI',
    nameCs: 'Plnění kapacitního plánu',
    section: 'III',
    priority: 2,
    recipient: 'B0-B2',
    source: 'Payroll',
    definitionCs: 'Skutečné FTE proti plánovanému FTE ve staffplanu.',
    formulaCs: 'Actual FTE / Cap FTE.',
    frequency: 'yearly',
    owner: 'HR reporting',
    riskAnalysisCs: 'Výrazná odchylka od plánu ukazuje podstav nebo neřízený růst.',
    businessImpactCs: 'Přímo propojuje HR kapacity s provozním plánem.',
    direction: 'target',
    trendType: 'YoY',
    unit: 'pct',
    thresholds: { target: 100, green: 100, amber: 100, red: 100, targetToleranceGreen: 5, targetToleranceAmber: 10 },
    actionIfOffTrackCs: 'Porovnat plán a actual FTE po divizích, otevřít hiring nebo freeze rozhodnutí.',
    valueProvider: 'getPositions',
  },
  {
    code: 'HC_FTE_DIV',
    nameCs: 'HC / FTE po divizích',
    section: 'III',
    priority: 1,
    recipient: 'B0-B3',
    source: 'HRIS',
    definitionCs: 'Přepočtený úvazek aktivních zaměstnanců po divizích.',
    formulaCs: 'Součet FTE aktivních zaměstnanců k poslednímu dni období.',
    frequency: 'yearly',
    owner: 'HR reporting',
    riskAnalysisCs: 'Nesoulad FTE a budgetu zkresluje kapacitní plán.',
    businessImpactCs: 'Umožňuje řídit kapacity po divizích.',
    direction: 'target',
    trendType: 'YoY',
    unit: 'count',
    thresholds: { target: 1_735, green: 1_735, amber: 1_735, red: 1_735, targetToleranceGreen: 0.15, targetToleranceAmber: 0.3 },
    actionIfOffTrackCs: 'Vysvětlit rozdíl proti staffplanu po divizích a otevřených pozicích.',
    valueProvider: 'derived',
  },
  {
    code: 'AVG_WAGE',
    nameCs: 'Průměrná mzda per FTE',
    section: 'III',
    priority: 1,
    recipient: 'B0-B2',
    source: 'Payroll',
    definitionCs: 'Průměrná základní mzda přepočtená na FTE.',
    formulaCs: 'Součet základních mezd / počet payroll řádků.',
    frequency: 'yearly',
    owner: 'Payroll',
    riskAnalysisCs: 'Nerovnoměrný růst mezd může maskovat tlak v konkrétních rolích.',
    businessImpactCs: 'Pomáhá řídit mzdovou konkurenceschopnost a budget.',
    direction: 'target',
    trendType: 'YoY',
    unit: 'CZK',
    thresholds: { target: 48_000, green: 48_000, amber: 48_000, red: 48_000, targetToleranceGreen: 0.15, targetToleranceAmber: 0.25 },
    actionIfOffTrackCs: 'Prověřit segmenty s nejrychlejším růstem a vazbu na fluktuaci.',
    crossCutting: ['compensation-pay-gap'],
    valueProvider: 'getPayroll',
  },
  {
    code: 'TTF',
    nameCs: 'Doba do obsazení',
    section: 'IV',
    priority: 2,
    recipient: 'B1-B3',
    source: 'Recruitment',
    definitionCs: 'Průměrný počet dnů od otevření požadavku do nástupu.',
    formulaCs: 'Průměr hireDate - approvedDate.',
    frequency: 'monthly',
    owner: 'Recruiting',
    riskAnalysisCs: 'Dlouhá doba obsazení prodlužuje podstav.',
    businessImpactCs: 'Měří rychlost náboru a dopad na provozní kapacity.',
    direction: 'down',
    trendType: 'MoM',
    unit: 'days',
    thresholds: { green: 38, amber: 50, red: 60, target: 35 },
    actionIfOffTrackCs: 'Najít fázi náboru s nejdelším čekáním a upravit SLA náboru.',
    crossCutting: ['recruitment-funnel'],
    valueProvider: 'getRequisitions',
  },
  {
    code: 'TTF_CRIT',
    nameCs: 'Doba do obsazení klíčových pozic',
    section: 'IV',
    priority: 2,
    recipient: 'B0-B2',
    source: 'Recruitment',
    definitionCs: 'Doba obsazení pozic označených jako klíčové.',
    formulaCs: 'Průměr hireDate - approvedDate pro critical requisitions.',
    frequency: 'monthly',
    owner: 'Recruiting',
    riskAnalysisCs: 'Neobsazené klíčové pozice mají vysoký dopad na provoz a leadership.',
    businessImpactCs: 'Ukazuje riziko v rolích s nejvyšší prioritou.',
    direction: 'down',
    trendType: 'MoM',
    unit: 'days',
    thresholds: { green: 40, amber: 55, red: 65, target: 38 },
    actionIfOffTrackCs: 'Zapojit hiring manažery a zrychlit schvalování u klíčových rolí.',
    crossCutting: ['recruitment-funnel'],
    valueProvider: 'getRequisitions',
  },
  {
    code: 'TIME_TO_PROD',
    nameCs: 'Čas do produktivity',
    section: 'IV',
    priority: 3,
    recipient: 'B2-B3',
    source: 'Recruitment',
    definitionCs: 'Průměrný čas, za který nový zaměstnanec dosáhne očekávaného výkonu.',
    formulaCs: 'Měsíce od nástupu do cílového performance ratingu.',
    frequency: 'quarterly',
    owner: 'Recruiting & Business',
    riskAnalysisCs: 'Dlouhý onboarding prodlužuje náklad na nový nábor.',
    businessImpactCs: 'Měří kvalitu onboardingu a manažerské podpory.',
    direction: 'down',
    trendType: 'QoQ',
    unit: 'months',
    thresholds: { green: 3, amber: 4, red: 6, target: 3 },
    actionIfOffTrackCs: 'Zaměřit onboarding na role a manažery s nejdelším rozběhem.',
    valueProvider: 'derived',
  },
  {
    code: 'CPH',
    nameCs: 'Náklad na jeden nábor',
    section: 'IV',
    priority: 2,
    recipient: 'B1-B2',
    source: 'Recruitment',
    definitionCs: 'Průměrný náklad na obsazenou pozici.',
    formulaCs: 'Náklady na nábor / počet nástupů z náboru.',
    frequency: 'yearly',
    owner: 'Recruiting',
    riskAnalysisCs: 'Vysoký náklad může ukazovat nevýkonné kanály nebo agenturní závislost.',
    businessImpactCs: 'Pomáhá optimalizovat zdroje kandidátů.',
    direction: 'down',
    trendType: 'YoY',
    unit: 'CZK',
    thresholds: { green: 80_000, amber: 110_000, red: 150_000, target: 70_000 },
    actionIfOffTrackCs: 'Porovnat náklady a kvalitu náboru podle zdrojů kandidátů.',
    crossCutting: ['recruitment-funnel'],
    valueProvider: 'getRequisitions',
  },
  {
    code: 'QUALITY_HIRE',
    nameCs: 'Kvalita náboru',
    section: 'IV',
    priority: 2,
    recipient: 'B1-B3',
    source: 'Recruitment',
    definitionCs: 'Podíl nových zaměstnanců s dobrým výkonem a bez časného odchodu.',
    formulaCs: 'Podíl performance ratingu 4-5 v posledním cyklu.',
    frequency: 'quarterly',
    owner: 'Recruiting',
    riskAnalysisCs: 'Nízká kvalita náboru zvyšuje časnou fluktuaci.',
    businessImpactCs: 'Propojuje nábor s retencí a výkonem.',
    direction: 'up',
    trendType: 'QoQ',
    unit: 'pct',
    thresholds: { green: 22, amber: 18, red: 12, target: 28 },
    actionIfOffTrackCs: 'Prověřit náborový proces, proškolit hiring manažery a upravit screening.',
    crossCutting: ['attrition', 'recruitment-funnel'],
    valueProvider: 'getPerformanceReviews',
  },
  {
    code: 'EMPLOYER_EVAL',
    nameCs: 'Hodnocení zaměstnavatele',
    section: 'IV',
    priority: 2,
    recipient: 'B1-B3',
    source: 'Recruitment',
    definitionCs: 'Průměrné hodnocení kandidátů a uchazečů.',
    formulaCs: 'Průměr ratingu z náborových dat.',
    frequency: 'monthly',
    owner: 'Recruiting',
    riskAnalysisCs: 'Slabé hodnocení snižuje konverzi kandidátů.',
    businessImpactCs: 'Ukazuje atraktivitu zaměstnavatele na trhu.',
    direction: 'up',
    trendType: 'MoM',
    unit: 'score',
    thresholds: { green: 4, amber: 3, red: 2, target: 4.5 },
    actionIfOffTrackCs: 'Proškolit hiring manažery v candidate experience a sjednotit náborový proces.',
    valueProvider: 'derived',
  },
  {
    code: 'FLUCT',
    nameCs: 'Fluktuace',
    section: 'V',
    priority: 1,
    recipient: 'B0-B3',
    source: 'HRIS',
    definitionCs: 'Podíl odchodů na průměrném headcountu v období.',
    formulaCs: 'Odchody / průměrný počet aktivních zaměstnanců.',
    frequency: 'half-yearly',
    owner: 'HR reporting',
    riskAnalysisCs: 'Vysoká fluktuace zvyšuje náklady, zatížení náboru a ztrátu know-how.',
    businessImpactCs: 'Jedna z hlavních metrik zdraví organizace.',
    direction: 'down',
    trendType: 'YoY',
    unit: 'pct',
    thresholds: { green: 25, amber: 30, red: 32, target: 25 },
    actionIfOffTrackCs: 'Zlepšit náborový proces a spustit retenční analýzu podle divize, tenure a manažera.',
    crossCutting: ['attrition'],
    valueProvider: 'getWorkforceEvents',
  },
  {
    code: 'FLUCT_CRIT',
    nameCs: 'Fluktuace klíčových pozic',
    section: 'V',
    priority: 1,
    recipient: 'B0-B2',
    source: 'HRIS',
    definitionCs: 'Podíl odchodů zaměstnanců na klíčových pozicích.',
    formulaCs: 'Odchody z klíčových pozic / průměrný počet zaměstnanců na klíčových pozicích.',
    frequency: 'half-yearly',
    owner: 'HR reporting',
    riskAnalysisCs: 'Odchody klíčových lidí ohrožují provozní kontinuitu a nástupnictví.',
    businessImpactCs: 'Včas ukazuje nejdražší retenční rizika.',
    direction: 'down',
    trendType: 'YoY',
    unit: 'pct',
    thresholds: { green: 18, amber: 30, red: 45, target: 12 },
    actionIfOffTrackCs: 'Spustit retenční plán pro klíčové role, provést 1:1 review a ověřit nástupce.',
    crossCutting: ['attrition'],
    valueProvider: 'getWorkforceEvents',
  },
  {
    code: 'SUCCESSION',
    nameCs: 'Pokrytí nástupnictvím',
    section: 'VI',
    priority: 2,
    recipient: 'B0-B2',
    source: 'Talent Pool',
    definitionCs: 'Podíl klíčových pozic s identifikovaným nástupcem.',
    formulaCs: 'Kritické pozice s ready_now nebo ready_1_2y nástupcem / všechny kritické pozice.',
    frequency: 'quarterly',
    owner: 'Training',
    riskAnalysisCs: 'Chybějící nástupce zvyšuje dopad odchodu klíčového člověka.',
    businessImpactCs: 'Řídí kontinuitu leadershipu a kritických rolí.',
    direction: 'up',
    trendType: 'QoQ',
    unit: 'pct',
    thresholds: { green: 80, amber: 60, red: 60, target: 80 },
    actionIfOffTrackCs: 'Doplnit nástupce pro kritické role bez pokrytí a navázat rozvojový plán.',
    valueProvider: 'getSuccessionPlans',
  },
  {
    code: 'ENPS',
    nameCs: 'eNPS',
    section: 'VII',
    priority: 2,
    recipient: 'B0-B3',
    source: 'Survio',
    definitionCs: 'Skóre loajality zaměstnanců.',
    formulaCs: 'Průměrné eNPS skóre z poslední vlny.',
    frequency: 'yearly',
    owner: 'HR reporting',
    riskAnalysisCs: 'Nízké eNPS často předchází fluktuaci a výkonovým problémům.',
    businessImpactCs: 'Měří angažovanost a zdraví kultury.',
    direction: 'up',
    trendType: 'YoY',
    unit: 'score',
    thresholds: { green: 15, amber: 10, red: 5, target: 15 },
    actionIfOffTrackCs: 'Zaměřit follow-up na segmenty s nejnižším skóre a propojit je s fluktuací.',
    crossCutting: ['attrition'],
    valueProvider: 'getEnpsResponses',
  },
  {
    code: 'TALENT_GROWTH',
    nameCs: 'Talent a růstový potenciál',
    section: 'VIII',
    priority: 3,
    recipient: 'B1-B3',
    source: 'Annual appraisal',
    definitionCs: 'Podíl zaměstnanců s vysokým nebo velmi vysokým růstovým potenciálem.',
    formulaCs: 'High + very_high growth potential / hodnocení zaměstnanci.',
    frequency: 'yearly',
    owner: 'Training',
    riskAnalysisCs: 'Nízký talent pool omezuje interní mobilitu a nástupnictví.',
    businessImpactCs: 'Ukazuje budoucí leadership a rozvojovou kapacitu.',
    direction: 'up',
    trendType: 'YoY',
    unit: 'pct',
    thresholds: { green: 28, amber: 18, red: 12, target: 30 },
    actionIfOffTrackCs: 'Zkontrolovat kalibraci hodnocení a rozvojové plány talentů.',
    valueProvider: 'getPerformanceReviews',
  },
] as const satisfies readonly KpiDefinition[];

export const KPI_BY_CODE = new Map<KpiCode, KpiDefinition>(
  KPI_CATALOG.map((definition) => [definition.code, definition]),
);

export function getKpiDefinition(code: KpiCode): KpiDefinition {
  const definition = KPI_BY_CODE.get(code);
  if (!definition) throw new Error(`Unknown KPI code: ${code}`);
  return definition;
}
