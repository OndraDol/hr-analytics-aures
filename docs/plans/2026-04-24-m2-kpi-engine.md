# Implementační plán — Milník 2 (KPI Engine & Analytická vrstva)

> **Stav k 2026-04-24:** M0 + M1 hotovy (commity `04335e3` → `a54d95b`). M2 zatím neimplementováno.
> **Branch:** `claude/m2-kpi-implementation-ffVhZ`

**Cíl M2:** Postavit kompletní KPI analytickou vrstvu — katalog, výpočetní engine, driver analýzu, anomaly detection, template narativy, action recommender a mock AI insights. Výstupem jsou TS moduly v `lib/kpi/`, na které naváže frontend v M3+.

---

## Progress tracker

| Task | Stav | Commit |
|---|---|---|
| 1. KPI katalog (`lib/kpi/catalog.ts`) | ⏭️ **další na řadě** | — |
| 2. KPI typy (`lib/kpi/types.ts`) | ⏳ pending | — |
| 3. KPIEvaluator (`lib/kpi/evaluator.ts`) | ⏳ pending | — |
| 4. DriverAnalyzer (`lib/kpi/driver-analyzer.ts`) | ⏳ pending | — |
| 5. AnomalyDetector (`lib/kpi/anomaly-detector.ts`) | ⏳ pending | — |
| 6. NarrativeGenerator (`lib/kpi/narrative-generator.ts`) | ⏳ pending | — |
| 7. ActionRecommender (`lib/kpi/action-recommender.ts`) | ⏳ pending | — |
| 8. AIInsightProvider (`lib/kpi/ai-insight-provider.ts`) | ⏳ pending | — |
| 9. Mock AI insights JSON (`lib/kpi/ai-insights.json`) | ⏳ pending | — |
| 10. KPIService — fasáda nad celou vrstvou | ⏳ pending | — |
| 11. Testy KPI engine | ⏳ pending | — |
| 12. Integrace s MockDataProvider | ⏳ pending | — |
| Final verification + push | ⏳ pending | — |

---

## Architektura M2

```
lib/kpi/
├── types.ts              # KPIDefinition, KPIResult, DriverSegment, Anomaly, Narrative, Action, AIInsight
├── catalog.ts            # 20 KPI definic — prahy, cíle, vzorce, sekce, priorita
├── evaluator.ts          # KPIEvaluator — výpočet hodnot KPI z DataProvider dat
├── driver-analyzer.ts    # DriverAnalyzer — segmentace, top přispěvatelé ke změně
├── anomaly-detector.ts   # AnomalyDetector — z-score, rolling stats, flagging výkyvů
├── narrative-generator.ts # NarrativeGenerator — šablony → text ("Fluktuace vzrostla o 2,1 pp...")
├── action-recommender.ts # ActionRecommender — "Action if Off Track" z NÁVRH_do_BI
├── ai-insight-provider.ts # AIInsightProvider interface — mock z JSON nebo live Claude API
├── ai-insights.json      # Pre-written "AI" komentáře per KPI (2–4 věty, analytický tón)
└── kpi-service.ts        # KPIService — fasáda: getKPISnapshot(period, filter) → KPISnapshot[]
```

---

## Task 1: KPI katalog

**File:** `lib/kpi/catalog.ts`

Katalog všech 20 KPI z `NÁVRH_do_BI`. Každé KPI má:

```typescript
export interface KPIDefinition {
  id: string;                 // např. 'fluctuation_rate'
  nameCs: string;             // česky: "Fluktuace celková"
  section: KPISection;        // 'I' | 'II' | ... | 'VIII'
  priority: 1 | 2 | 3;
  owner: string;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  formula: string;            // textový popis výpočtu
  direction: 'up_good' | 'down_good' | 'flat_good';
  target: number | null;
  thresholds: {
    green: number;            // ≤ tato hodnota = zelená (pro down_good)
    acceptable: number;
    red: number;
  };
  unit: 'percent' | 'count' | 'days' | 'czk' | 'score' | 'ratio';
  actionIfOffTrack: string;   // doporučená akce z NÁVRH_do_BI
  tags: string[];             // ['P1', 'core', 'retention', ...]
}
```

### 20 KPI definic (z NÁVRH_do_BI):

| ID | Sekce | Název CZ | Priorita | Jednotka | Cíl (green) |
|---|---|---|---|---|---|
| `headcount` | I | Celkový počet zaměstnanců (HC) | 1 | count | dle plánu |
| `fte_ratio` | I | FTE / HC poměr | 1 | ratio | ≥ 0.85 |
| `gender_pay_gap` | I | Gender pay gap | 1 | percent | < 5 % |
| `women_in_management` | I | Podíl žen v managementu | 2 | percent | ≥ 30 % |
| `employees_in` | II | Nástupy (měsíční) | 1 | count | dle plánu |
| `employees_out` | II | Odchody (měsíční) | 1 | count | ≤ cíl |
| `untaken_holiday` | II | Nevybraná dovolená (průměr) | 1 | days | ≤ 5 dní |
| `sickness_rate` | II | Nemocnost | 2 | percent | < 3 % |
| `avg_wage` | III | Průměrná mzda | 1 | czk | dle plánu |
| `wage_kpi` | III | Wage KPI (mzdové náklady vs plán) | 2 | percent | 95–105 % |
| `cap_kpi` | III | CAP KPI (kapacita vs plán) | 2 | ratio | ≥ 0.90 |
| `hc_per_division` | III | HC/FTE per divize vs budget | 1 | percent | 95–105 % |
| `time_to_fill` | IV | Doba do obsazení pozice (TTF) | 2 | days | ≤ 27 dní |
| `ttf_critical` | IV | TTF — kritické pozice | 2 | days | ≤ 14 dní |
| `cost_per_hire` | IV | Náklady na nábor (CpH) | 2 | czk | ≤ 25 000 Kč |
| `quality_of_hire` | IV | Kvalita náboru (early attrition) | 2 | percent | < 8 % |
| `employer_evaluation` | IV | Hodnocení zaměstnavatele | 2 | score | ≥ 4.0 |
| `fluctuation_rate` | V | Fluktuace celková | 1 | percent | < 15 % |
| `fluctuation_critical` | V | Fluktuace — kritické pozice | 1 | percent | < 10 % |
| `succession_rate` | VI | Míra nástupnictví | 2 | percent | ≥ 80 % |
| `enps` | VII | eNPS | 2 | score | ≥ 20 |
| `talent_ratio` | VIII | Talent & Growth (% high potential) | 3 | percent | ≥ 15 % |

---

## Task 2: KPI typy

**File:** `lib/kpi/types.ts`

```typescript
import type { KPIDefinition } from './catalog';

export type KPIStatus = 'green' | 'acceptable' | 'red' | 'no_data';

export interface KPIValue {
  kpiId: string;
  period: string;          // "2026-03" nebo "2025-Q4" nebo "2025"
  value: number;
  previousValue: number | null;
  momDelta: number | null;  // Month-over-month delta (pp nebo abs)
  yoyDelta: number | null;
  status: KPIStatus;
  definition: KPIDefinition;
}

export interface DriverSegment {
  dimension: 'division' | 'country' | 'grade' | 'tenure_band';
  label: string;             // např. "Sales CZ"
  contribution: number;      // absolutní přírůstek k hodnotě KPI
  contributionPct: number;   // % z celkového pohybu
  trend: 'up' | 'down' | 'flat';
}

export interface Anomaly {
  kpiId: string;
  period: string;
  zScore: number;
  direction: 'spike' | 'drop';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface Narrative {
  kpiId: string;
  period: string;
  text: string;             // deterministicky generovaný text
  topDrivers: DriverSegment[];
}

export interface ActionRecommendation {
  kpiId: string;
  status: KPIStatus;
  priority: 'immediate' | 'monitor' | 'scheduled';
  action: string;           // co udělat
  rationale: string;        // proč (kontextualizovaná situací)
}

export interface AIInsight {
  kpiId: string;
  text: string;             // pre-written "AI" komentář (2–4 věty)
  generatedAt: string;      // ISO datum snapshotu mock dat
}

export interface KPISnapshot {
  kpiValue: KPIValue;
  narrative: Narrative;
  anomaly: Anomaly | null;
  action: ActionRecommendation;
  aiInsight: AIInsight | null;
}
```

---

## Task 3: KPIEvaluator

**File:** `lib/kpi/evaluator.ts`

Výpočet hodnot KPI z DataProvider dat. Každé KPI má svůj výpočet:

```typescript
export class KPIEvaluator {
  constructor(private provider: DataProvider) {}

  async evaluate(kpiId: string, period: Period, filter?: CommonFilter): Promise<KPIValue>
  async evaluateAll(period: Period, filter?: CommonFilter): Promise<KPIValue[]>
}
```

### Výpočetní vzorce (implementační referenční přehled)

| KPI | Výpočet |
|---|---|
| `headcount` | `EMPLOYEES.filter(active_in_period).length` |
| `fte_ratio` | `sum(fte) / headcount` |
| `gender_pay_gap` | `(avg_male_salary - avg_female_salary) / avg_male_salary * 100` |
| `women_in_management` | `count(female, grade IN B0-B3) / count(all, grade IN B0-B3) * 100` |
| `employees_in` | `WORKFORCE_EVENTS.filter(type=hire, in_period).length` |
| `employees_out` | `WORKFORCE_EVENTS.filter(type=terminate, in_period).length` |
| `untaken_holiday` | `sum(vacation_days_remaining) / headcount` — mock z AbsenceRecord |
| `sickness_rate` | `sum(sick_days) / (headcount * working_days) * 100` |
| `avg_wage` | `sum(baseSalary) / headcount` z PayrollMonth |
| `wage_kpi` | `actual_wage_cost / budgeted_wage_cost * 100` (budget = Cap FTE × avg) |
| `cap_kpi` | `actual_fte / cap_fte` z Positions |
| `hc_per_division` | per divize: `actual_hc / cap_hc * 100` |
| `time_to_fill` | z recruitment dat: `mean(publishedDate → hireDate)` |
| `ttf_critical` | `mean(publishedDate → hireDate)` kde `critical=true` |
| `cost_per_hire` | `sum(cost) / count(hires)` z RecruitmentRequisition |
| `quality_of_hire` | `count(terminated_in_probation) / count(hired) * 100` |
| `employer_evaluation` | `mean(rating)` z RecruitmentRow |
| `fluctuation_rate` | `count(terminations in 12M) / avg_hc * 100` |
| `fluctuation_critical` | jako výše, jen kritické pozice |
| `succession_rate` | `count(critPos with successor) / count(critPos) * 100` |
| `enps` | `(promoters - detractors) / respondents * 100` |
| `talent_ratio` | `count(talentFlag=true) / headcount * 100` |

---

## Task 4: DriverAnalyzer

**File:** `lib/kpi/driver-analyzer.ts`

Segmentuje metriku podle dimenzí a identifikuje top přispěvatele ke změně (MoM).

```typescript
export class DriverAnalyzer {
  analyzeDrivers(
    kpiId: string,
    currentPeriod: KPIValue,
    previousPeriod: KPIValue,
    rawData: EmployeeSubset[],
  ): DriverSegment[]
}
```

Algoritmus:
1. Rozděl populaci do segmentů (divize, country, grade, tenure band).
2. Pro každý segment spočti KPI hodnotu v current a previous period.
3. Spočti absolutní příspěvek segmentu k celkové MoM změně.
4. Seřaď sestupně dle absolutního příspěvku, vrať top 5.

---

## Task 5: AnomalyDetector

**File:** `lib/kpi/anomaly-detector.ts`

Rolling z-score nad historií metriky.

```typescript
export class AnomalyDetector {
  detect(history: Array<{ period: string; value: number }>, current: KPIValue): Anomaly | null
}
```

Algoritmus:
1. Spočti mean a std z posledních 6–12 hodnot.
2. Z-score = `(current - mean) / std`.
3. |z| > 2.0 → `mild`, |z| > 2.5 → `moderate`, |z| > 3.0 → `severe`.
4. Vrať `null` pokud není dostatečná historie (< 4 hodnoty).

---

## Task 6: NarrativeGenerator

**File:** `lib/kpi/narrative-generator.ts`

Šablonový systém pro deterministický text. Příklady šablon:

```
// Fluktuace červená, trend nahoru
"Fluktuace dosáhla {{value}} % a překročila červený práh {{red_thr}} %.
MoM nárůst {{mom_delta}} pp. Hlavní přispěvatel: {{top_driver_label}}
s {{top_driver_contribution}} odchody."

// Fluktuace zelená
"Fluktuace {{value}} % je v pásmu cíle (< {{green_thr}} %).
MoM změna {{mom_delta}} pp — stabilní trend."
```

Generátor vybere šablonu podle (status × direction × has_anomaly) a doplní data.

---

## Task 7: ActionRecommender

**File:** `lib/kpi/action-recommender.ts`

Napojení na `actionIfOffTrack` z katalogu + kontextualizace situací.

```typescript
export class ActionRecommender {
  recommend(kpiValue: KPIValue, topDriver: DriverSegment | null): ActionRecommendation
}
```

Logika:
- `green` → priority `monitor`, action = "Pokračovat v sledování, cíl splněn."
- `acceptable` → priority `scheduled`, action = `definition.actionIfOffTrack` + kontextový hint.
- `red` → priority `immediate`, action = `definition.actionIfOffTrack` + "Klíčový segment: {{topDriver}}".

---

## Task 8–9: AIInsightProvider + mock JSON

**Files:** `lib/kpi/ai-insight-provider.ts`, `lib/kpi/ai-insights.json`

```typescript
export interface AIInsightProvider {
  getInsight(kpiId: string, status: KPIStatus): Promise<AIInsight | null>;
}

// MockAIInsightProvider čte z ai-insights.json
// LiveAIInsightProvider (budoucí) volá Claude API
```

`ai-insights.json` obsahuje 2–3 varianty komentáře per KPI per status:

```json
{
  "fluctuation_rate": {
    "red": [
      "Úroveň fluktuace naznačuje systémový problém s retencí, nikoliv náhodný výkyv. Historicky podobné hodnoty předcházely nárůstu vakancí o 15–20 %. Doporučuji prioritní exit interview analýzu a okamžitý 1:1 program pro rizikové segmenty.",
      "Výrazný nárůst fluktuace v kombinaci s poklesem eNPS může signalizovat zhoršení manažerské kultury nebo nedostatek kariérních příležitostí. Krátkodobé řešení: retence balíčky pro klíčové lidi, dlouhodobé: strukturální přehled odměňování."
    ],
    "acceptable": [
      "Fluktuace je v přijatelném pásmu, ale trend je varovný. Sledujte zejména složení odchodů — pokud odcházejí mainly zkušení zaměstnanci (tenure > 2 roky), celkové číslo podhodnocuje skutečný dopad."
    ],
    "green": [
      "Stabilní fluktuace odráží dobrou retenci. Příležitost: identifikujte, které divize nebo manažeři mají nejnižší fluktuaci, a sdílejte jejich best practices napříč organizací."
    ]
  }
}
```

---

## Task 10: KPIService

**File:** `lib/kpi/kpi-service.ts`

Fasáda, která orchestruje celou vrstvu.

```typescript
export class KPIService {
  constructor(
    private provider: DataProvider,
    private aiInsights: AIInsightProvider,
  ) {}

  async getSnapshot(period: Period, filter?: CommonFilter): Promise<KPISnapshot[]>
  async getHistory(kpiId: string, months: number): Promise<KPIValue[]>
  async getAlerts(period: Period): Promise<KPISnapshot[]>  // jen red + acceptable
  async getExecutiveSummary(period: Period): Promise<ExecutiveSummary>
}

export interface ExecutiveSummary {
  healthScore: number;         // 0–100 vážené P1 KPI
  alertCount: number;
  redCount: number;
  acceptableCount: number;
  greenCount: number;
  topAlerts: KPISnapshot[];
  changesThisMonth: {
    improved: KPISnapshot[];
    worsened: KPISnapshot[];
    toWatch: KPISnapshot[];
  };
  aiExecutiveSummary: string;  // pre-written souhrnný text
}
```

---

## Task 11: Testy KPI engine

**File:** `tests/kpi/evaluator.test.ts`, `tests/kpi/analyzer.test.ts`, `tests/kpi/service.test.ts`

```typescript
// Příklady testů
describe('KPIEvaluator', () => {
  it('computes headcount correctly', ...)
  it('computes fluctuation_rate correctly', ...)
  it('assigns correct status based on thresholds', ...)
})

describe('DriverAnalyzer', () => {
  it('returns top drivers sorted by contribution', ...)
  it('handles empty dataset gracefully', ...)
})

describe('NarrativeGenerator', () => {
  it('generates non-empty narrative for red status', ...)
  it('interpolates values into template', ...)
})
```

---

## Task 12: Integrace s MockDataProvider

Po dokončení Tasks 1–11:

```bash
pnpm gen:data          # aktualizuj data (pokud se změnil mock)
pnpm test              # všechny testy musí projít
pnpm typecheck         # 0 errors
pnpm build             # úspěšný build
```

**Ověření integrace:**
```typescript
const service = new KPIService(mockDataProvider, mockAIInsightProvider);
const snapshot = await service.getSnapshot({ from: '2026-01-01', to: '2026-03-31' });
console.log(snapshot.map(s => `${s.kpiValue.kpiId}: ${s.kpiValue.status} (${s.kpiValue.value})`));
```

---

## Mapa souborů M2

| Soubor | Stav |
|---|---|
| `lib/kpi/types.ts` | ⏳ vytvořit |
| `lib/kpi/catalog.ts` | ⏳ vytvořit |
| `lib/kpi/evaluator.ts` | ⏳ vytvořit |
| `lib/kpi/driver-analyzer.ts` | ⏳ vytvořit |
| `lib/kpi/anomaly-detector.ts` | ⏳ vytvořit |
| `lib/kpi/narrative-generator.ts` | ⏳ vytvořit |
| `lib/kpi/action-recommender.ts` | ⏳ vytvořit |
| `lib/kpi/ai-insight-provider.ts` | ⏳ vytvořit |
| `lib/kpi/ai-insights.json` | ⏳ vytvořit |
| `lib/kpi/kpi-service.ts` | ⏳ vytvořit |
| `tests/kpi/evaluator.test.ts` | ⏳ vytvořit |
| `tests/kpi/analyzer.test.ts` | ⏳ vytvořit |
| `tests/kpi/service.test.ts` | ⏳ vytvořit |

---

## Jak navázat (z jiné session)

```bash
git clone https://github.com/ondradol/hr-analytics-aures
git checkout claude/m2-kpi-implementation-ffVhZ
pnpm install
pnpm gen:data          # generuje lib/data/generated/*.ts (nutné, nejsou v gitu)
pnpm test              # ověř 40 testů zelených
```

Pak otevři tento soubor, najdi první `⏭️` v progress trackeru a pokračuj dle definice tasku.

**Navazující plány po M2:**
- M3: Frontend UI komponenty (KPI card, sparkline, status badge, driver panel)
- M4: Executive Dashboard (`/` route) s Health Score hero + Top Alerts + section scorecards
- M5: Per-section views I–VIII
- M6: Cross-cutting drill-downs (Attrition, Recruitment funnel, Compensation, Absence)
- M7: AI Copilot sidebar
- M8: Operational views (Hired/Fired, Org Chart, Vacation balances)
- M9: Polish, dark mode, animace, Vercel deploy
