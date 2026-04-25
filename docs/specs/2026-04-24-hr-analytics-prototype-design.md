# HR Analytics Prototype — Design Specification

> **Status:** Implementováno pro prezentační prototyp v1; M11 perfection pass proti XLS zadání doplnil traceability matrix
> **Datum:** 2026-04-24
> **Vlastník:** Ondřej Dolejš (producer), HR Director (business sponsor)
> **Účel:** Interaktivní webový prototyp komplexního HR reportingu postavený nad mock daty. Slouží jako (a) vizuální podklad pro HR Directorku a (b) zadání pro externího dodavatele, který následně implementuje produkční řešení v Power BI.
> **Zdrojový vstup:** `HR_reporting_ver2.xlsx` v kořeni repozitáře, záložky `NÁVRH_do_BI`, `Návrh_rozpad`, `NÁVRH`, `CZ`, `ESG reporty_actual`, `HR Reporty_actual`, `Vojta_all`. Explicitní dohledatelnost je v `docs/traceability/hr-reporting-v2-traceability.md`.

---

## 1. Cíl a ne-cíl

### 1.1 Cíl
Postavit **webový dashboard „HR Analytics"** v češtině, který:
1. Pokryje všech 20 KPI z `NÁVRH_do_BI` napříč 8 sekcemi (I–VIII).
2. Místo pasivního zobrazování dat nabídne **aktivní analytickou vrstvu** — každá metrika sama sebe hodnotí (status vs. prahy), vysvětluje (driver analysis, trend), kontextualizuje (narrativy) a doporučuje (akce).
3. Integruje **mock „AI insights"** (ručně psané v JSON, UI designovaný jako od živé AI).
4. Je postavený tak, aby do něj šlo v budoucnu zapojit část reálných dat z EGJE / ATS **bez změny UI vrstvy** (Data Provider pattern).
5. Vypadá jako **drahý produktový SaaS** (směr Vercel Analytics, Linear, Posthog), ne jako korporátní dashboard.

### 1.2 Explicitně ne-cíl (YAGNI)
- Produkční ETL / datový warehouse.
- Autentizace, autorizace, row-level security.
- Internationalization framework (jazyk je natvrdo CZ).
- Živé volání LLM API (zatím jen mock).
- Multi-tenant, multi-company.
- Mobilní nativní aplikace (responsive stačí).
- Server-side export do PDF / Excelu. Browser print flow pro PDF briefing je ve v1 implementovaný přes route `/briefing`.

---

## 2. Uživatelská cesta (user journey)

### 2.1 Primární persona
**Kateřina — HR Director.** Střední věk, management focus, není datový analytik. Chce na první pohled vědět „jsme v pořádku?", při red flagu chce vědět „proč" a „co s tím", a při zvědavosti chce drillovat do detailu.

### 2.2 Sekundární persona
**Dodavatel BI.** Technický. Projde celý prototyp jako referenci, co má postavit. Potřebuje jasný přehled všech KPI, definic, vzorců a prahových hodnot.

### 2.3 Happy path HR Directorky
1. Klikne na URL.
2. Landing = **Executive Dashboard**. V horní části vidí HR Health Score (např. „73/100") s verbálním hodnocením („Celkově dobrý stav, 2 metriky vyžadují pozornost.").
3. Pod tím **Top 5 Alerts** — nejakutnější red flagy s jednořádkovým „co se děje".
4. Pod tím **Co se změnilo tento měsíc** — delta vs. minulé období (nové red flagy, zlepšení).
5. Dolů **8 scorecardů sekcí** (I–VIII) — každá sekce má svůj status + mini sparkline + jeden key number.
6. Klikne na sekci (např. V. Retention) → otevře se detailní pohled s KPI cardy pro danou sekci.
7. Na KPI cardu vidí hodnotu, trend, status, rule-based narrativ, AI insight, driver analysis, doporučenou akci.
8. Klikne „Otevřít detailní analýzu" → cross-cutting drill-down (např. Attrition deep dive).
9. V sidebaru může otevřít **AI Copilota**, kliknout na předpřipravenou otázku („Proč roste fluktuace v Sales?") → zobrazí se odpověď.

### 2.4 Wow momenty (záměrné)
- **Animace při načtení** KPI karet (stagger, jemné fade-up). Vytváří dojem premium produktu.
- **Health Score hero** s gradient ringem, velkou číslicí.
- **AI Copilot sidebar** — chat-like UI s předkonfigurovanými otázkami, typewriter efekt při „AI odpovědi".
- **Anomaly tags** — pokud metrika má silný MoM výkyv, card dostane ⚡ badge.
- **Correlation hinty** — „Pokles eNPS koreluje s růstem fluktuace v Sales CZ."

---

## 3. Architektura obrazovek

### 3.1 Mapa obrazovek

```
/                         Executive Dashboard (landing)
/sekce/[id]               Per-section view (I–VIII)
    /i-hr-statistics
    /ii-workforce-movement
    /iii-cost-structure
    /iv-recruitment
    /v-retention
    /vi-succession
    /vii-engagement
    /viii-talent-growth

/analytika/[topic]        Cross-cutting drill-downs
    /attrition
    /recruitment-funnel
    /compensation-pay-gap
    /absence-coverage

/operativa/[view]         Operational views (z NÁVRH sheet)
    /hired-fired
    /org-chart
    /vacation-balances
    /enps-latest
    /esg
```

### 3.2 Globální UI prvky
- **Header:** logo fiktivní firmy („AutoCorp" nebo dle preference), breadcrumbs, avatar, filter chip (aktuální období + země).
- **Sidebar (collapsible):** navigace — Executive / sekce I–VIII / Analytika / Operativa / Copilot.
- **Global Filter Bar:** období (default „poslední 3 měsíce"), země (CZ/SK/PL/All), divize (multi-select).
- **AI Copilot FAB** (floating action button) v pravém dolním rohu — otevře sidebar chat.
- **Footer** jednoduše: „Demo prototyp — mock data".

### 3.3 Executive Dashboard (landing)

**Struktura shora dolů:**

1. **Hero sekce:**
   - Nadpis „HR Analytics — Q1 2026"
   - HR Health Score (velká číslice 0–100, gradient ring, popisek „Dobrý stav / Vyžaduje pozornost / Kritické").
   - 3 hero KPI vedle ringu: HC celkem, Fluktuace YTD, eNPS aktuální.
   - Poslední aktualizace dat (mock: „před 2 hodinami").

2. **Top Alerts (5 karet):**
   - Každá: ikona 🔴 / ⚠️, název KPI, hodnota, delta, jednověta „proč".
   - Seřazeno podle priority (P1 red → P2 red → P1 amber → …).

3. **Co se změnilo tento měsíc:**
   - 3 sloupce: ⬆️ Zlepšení | ⚠️ Nové problémy | 👀 Ke sledování.
   - V každém 2–3 bullet pointy s MoM deltou.

4. **Scorecards sekcí I–VIII:**
   - 8 karet v 2×4 gridu (desktop) / 1×8 (mobile).
   - Každá karta: název sekce, 1 hlavní KPI (hodnota + trend), mini sparkline (12M), status badge, „Otevřít →".

5. **AI Executive Summary (blok):**
   - 1 odstavec „AI-generovaného" shrnutí stavu firmy z HR pohledu. Ručně psaný, několik variant podle mock data snapshotu.

### 3.4 Per-section views (I–VIII)

**Společná struktura:**
- Header sekce: název, ikona, popis (2 věty), breadcrumbs.
- Section Summary: 1 hlavní KPI jako hero + 2–3 secondary KPI.
- Grid KPI cardů (detail v kap. 4).
- „Související analytické pohledy" — odkazy na cross-cutting drill-downy.
- „Související operativní reporty" — odkazy na operational views.

---

#### I. HR Statistics

**KPI zahrnuty:** HR statistics (HC, FTE, demographics, gender pay gap, DEI).

**Obsah:**
- **Hero:** Headcount vs. FTE (side-by-side číslice + YoY delta).
- **Demografie:**
  - Gender split (donut chart) — celkově, podle divize, podle management levelu.
  - Age distribution (histogram s průměrem a mediánem).
  - Nationality mix (stacked bar per country).
- **DEI:**
  - % žen v managementu (per grade B0–B3).
  - % žen v leadershipu (B0–B1).
  - Věková struktura managementu.
- **Gender pay gap:**
  - Mean gap + median gap, per country, per grade.
  - Rozklad: raw vs. adjusted (simulovaný adjustment).
- **Tenure distribution** (histogram délky zaměstnání).

#### II. Workforce Movement

**KPI zahrnuty:** Employees in/out per division, country.

**Obsah:**
- **Hero:** Net change MoM (stacked bar: nástupy / odchody / net).
- **Inflow/outflow trend** (12M line chart).
- **Per country waterfall** (CZ, SK, PL).
- **Per division breakdown** (tabulka s nástupy/odchody/net per divize).
- **Internal moves** (počet IM, směr nejčastějších přesunů — sankey).
- **New hires by channel** (mini overview, odkaz na Recruitment sekci).

#### III. Cost & Structure

**KPI zahrnuty:** Wage KPI, CAP KPI, HC/FTE per division, Avg. wage.

**Obsah:**
- **Hero:** Celkové mzdové náklady YTD + YoY delta + vs. budget.
- **Wage cost structure** (stacked bar: fix / variable / benefits / non-personal).
- **HC/FTE per division** (horizontal bar vs. budget).
- **Avg. wage per FTE** (trend 24M + per division tabulka).
- **Cost per Employee** (tile — total cost / HC).
- **Budget plnění** (gauge: YTD actual vs. YTD plan).

#### IV. Recruitment

**KPI zahrnuty:** Time to fill, TTF critical, Time to Productivity, Cost per Hire, Quality of hiring, Employer Evaluation.

**Obsah:**
- **Hero:** TTF (aktuální dny vs. cíl 27) + distribuce (histogram).
- **TTF critical** (porovnání vs. TTF běžných rolí).
- **Funnel** (CV → screening → interview → offer → hire) — conversion rates.
- **Cost per Hire** trend + per channel breakdown.
- **Quality of hire** (early attrition rate — lidé odcházející ve zkušební době).
- **Employer Evaluation** (AAA rating 1–5, trend + recent reviews summary).
- **Time to Productivity** (měsíce do dosažení target performance, per role family).

#### V. Retention

**KPI zahrnuty:** Fluctuation rate, Fluctuation rate — critical positions.

**Obsah:**
- **Hero:** Fluktuace rolling 12M (trend) + aktuální rate + status.
- **Critical positions fluktuace** (samostatný trend + seznam kritických rolí, u kterých někdo odešel).
- **Reasons breakdown** (dobrovolné vs. nedobrovolné, detail důvodů).
- **By segment:** divize, grade, tenure cohort, manager.
- **Tenure of leavers** (histogram — odešli v 1. roce? 2.-3.? 5+?).
- **Early attrition** (odchody v zkušební době) — přelinkováno na Recruitment.

#### VI. Succession

**KPI zahrnuty:** Succession rate.

**Obsah:**
- **Hero:** Succession rate (% kritických rolí s nástupcem) + gap chart.
- **Critical positions map** — tabulka s: pozice / divize / incumbent / ready-now successor / ready-in-1-2Y / žádný.
- **Coverage gap:** kde nemáme nástupce (řazeno podle rizika).
- **Development progress** — kolik nástupců postupuje v plánu rozvoje.
- **Risk exposure** — vážené riziko = (no successor) × (attrition risk).

#### VII. Engagement

**KPI zahrnuty:** eNPS.

**Obsah:**
- **Hero:** eNPS aktuální (Promoters − Detractors) + verbální rating („Above benchmark").
- **Rozložení** — % Promoters / Passives / Detractors (stacked).
- **Trend 24M** (line chart).
- **Participation rate** — kolik lidí odpovědělo / pozváno.
- **By segment:** divize, grade, country, tenure.
- **Correlation hint:** eNPS vs. fluktuace per divize (scatter).

#### VIII. Talent & Growth

**KPI zahrnuty:** Talent & Growth potential.

**Obsah:**
- **Hero:** % lidí s growth potential rating High/Very High.
- **Performance distribution** (bell curve z ročních hodnocení).
- **Growth potential matrix** — 9-box (performance × potential).
- **Talent pool size** — počet identifikovaných talentů + trend.
- **Internal mobility rate** — % pozic obsazených interně.
- **Promotion rate** — % povýšených YTD.
- **Training investment** — hodiny školení / FTE, náklady, ESG relevance.

---

### 3.5 Cross-cutting drill-downs

#### /analytika/attrition — Attrition Deep Dive

- Cohort analysis: novonastoupení za posledních 12M → jakou mají fluktuaci po 3/6/12 měsících.
- High-risk segments: kombinace tenure × grade × divize × manager tenure.
- Důvody podle segmentu.
- Correlation explorer: fluktuace vs. avg. wage, eNPS, manager span.
- AI insight: „Největší retenční riziko je v..."

#### /analytika/recruitment-funnel — Recruitment Funnel Breakdown

- Full funnel per channel (job boards, referrals, agencies, direct).
- Bottleneck identification (kde největší drop-off).
- Cost per hire per channel.
- Time per funnel stage.
- Quality per channel (early attrition).
- Benchmark vs. cíle.

#### /analytika/compensation-pay-gap — Compensation & Pay Gap

- Wage distribution per grade (box plot).
- Gender pay gap — raw vs. adjusted, per grade, per country.
- Wage progression per tenure cohort.
- Outlier detection (high/low outliers vs. grade median).
- AI insight: „V grade B2 je 7 % gap, který po adjustaci klesá na 2 %. Zbytek lze vysvětlit..."

#### /analytika/absence-coverage — Absence & Shift Coverage

- Sickness rate trend + per divize.
- Untaken Holiday — zůstatky vs. cíl 0 ke konci roku (per employee heatmap).
- Long-term absence cases.
- Shift coverage rate — planned vs. covered, per divize.
- Cost of absence (mzdové náhrady).

---

### 3.6 Operational views (z NÁVRH sheet)

Méně analytické, víc „vytáhni mi data" — ale stále designově konzistentní.

- **/operativa/hired-fired** — tabulka nástupů / odchodů za období (default týdenní + měsíční view), filter per země / divize.
- **/operativa/org-chart** — interaktivní org chart (expandable nodes) do úrovně manažerů, ukázka „takto by to mohlo vypadat".
- **/operativa/vacation-balances** — zůstatky dovolených per zaměstnanec / divize.
- **/operativa/enps-latest** — detaily poslední eNPS vlny (participation, rozpad).
- **/operativa/esg** — ESG datové body z `ESG reporty_actual` — KPMG povinné reporty, přehled co je v pořádku, kde je risk.

---

## 4. Anatomie KPI cardu

Standardní komponenta `<KPICard kpi={kpi} data={data} />`. Všechny KPI cardy v reportu vypadají stejně — konzistence vytváří důvěru.

### 4.1 Layout

```
┌───────────────────────────────────────────────────────────────┐
│ [🔴] Fluktuace — kritické pozice          [ Priorita P1 ] [⚡] │
│ ────────────────────────────────────────────────────────────  │
│                                                               │
│  12,4 %         ▲ +2,1 pp MoM    ▲ +4,8 pp YoY                │
│                                                               │
│  Cíl 0 %   │ 🟢 <5 %   │ 🟡 <10 %   │ 🔴 ≥10 %                │
│  ────────────────────▓▓▓▓▓▓                                   │
│                                                               │
│  📈 ══════╱╲════╱═══╱╲══════════ 12M trend ═══════            │
│                                                               │
│  📊 DRIVERS (hlavní přispěvatelé MoM)                         │
│     ▸ Sales CZ:  +3 odchody (Key Account)                     │
│     ▸ OPS SK:    +2 odchody (Team Leader)                     │
│     ▸ OPS PL:    +1 odchod                                    │
│                                                               │
│  📝 INTERPRETACE                                              │
│     Fluktuace kritických pozic překročila červený práh.       │
│     Dva odchody Team Leaderů v OPS SK představují nejvyšší    │
│     operativní riziko, protože nejsou aktuálně identifikováni │
│     nástupci (viz Succession).                                │
│                                                               │
│  ✨ AI INSIGHT                                                │
│     Korelace s poklesem eNPS v divizi OPS (−8 bodů) napovídá, │
│     že jde o důsledek napětí po jarní reorganizaci. Doporuče- │
│     ním je stabilizační program s tím manažerem.              │
│                                                               │
│  💡 DOPORUČENÁ AKCE                                           │
│     Retence klíčových lidí. 1:1 review s nadřízenými          │
│     rizikových segmentů, stabilizační bonusy.                 │
│                                                               │
│  [ Otevřít detailní analýzu ▸ ]                               │
└───────────────────────────────────────────────────────────────┘
```

### 4.2 Vrstvy

| # | Vrstva | Typ | Vizuál |
|---|---|---|---|
| 1 | Status indikátor | rule-based | 🟢/🟡/🔴 podle prahů |
| 2 | Hodnota + trend (MoM/YoY) | výpočet z dat | velké písmo, šipky |
| 3 | Prahy (target / green / acc / red) | katalog + threshold metodika | threshold bar, target marker, vzdálenost od hranice |
| 4 | Sparkline 12M | výpočet z historie | mini line chart |
| 5 | Drivers (top 3 segmenty) | driver analysis | bullet list |
| 6 | Rule-based narrativ | šablona | 2–3 věty, deterministický |
| 7 | AI insight | mock JSON | 2–4 věty, jiný vizuál (✨ badge, kurzíva) |
| 8 | Doporučená akce | z KPI katalogu + kontext | ikonka 💡 + text |
| 9 | Anomaly badge | anomaly detector | ⚡ ikonka, pokud |z-score| > 2 |

### 4.4 Threshold metodika po M11

Každý KPI threshold má kromě hodnoty i zdroj, jistotu, typ metodiky, vlastníka revize a vysvětlení. UI proto neukazuje jen barvu, ale také `severity score`, vzdálenost od relevantního prahu a informaci, jestli je práh z XLS, benchmarkové logiky, budgetu, historie nebo demo defaultu čekajícího na HR potvrzení.

### 4.3 Varianty cardu
- **CompactKPICard** — pro section scorecardy na Executive Dashboardu (jen layers 1–4).
- **KPICard** — standardní (všechny vrstvy).
- **KPIHero** — zvětšená hero varianta pro top section (layers 1–4 + 8, větší vizuál, bez driverů).

---

## 5. KPI katalog

Všech 20 KPI z `NÁVRH_do_BI` v jednotné struktuře. Uložené v `lib/kpi/catalog.ts`.

### 5.1 Schema KPI definice

```typescript
interface KPIDefinition {
  code: string;                 // "FLUCT_CRIT"
  nameCs: string;               // "Fluktuace — kritické pozice"
  section: SectionId | null;    // "V" | null (pro stand-alone KPI)
  priority: 1 | 2 | 3;
  recipient: string;            // "B0-B1"
  source: DataSource;           // "HRIS" | "Payroll" | ...
  definitionCs: string;         // česká definice
  formulaCs: string;            // česky vzorec
  frequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
  owner: string;                // "HR reporting"
  riskAnalysisCs: string;
  businessImpactCs: string;
  target: string | number;      // "↓" | 27 | "acc. to budget"
  greenThreshold: string | number;
  acceptableThreshold: string | number;
  redThreshold: string | number;
  direction: 'up' | 'down' | 'flat';
  trendType: 'MoM' | 'YoY' | 'QoQ';
  actionIfOffTrackCs: string;
  unit: 'pct' | 'days' | 'CZK' | 'count' | 'score' | 'ratio';
  formatFn?: (value: number) => string;
}
```

### 5.2 Výpis 20 KPI (zkrácená forma; plný obsah bude v kódu)

| # | Code | Name CS | Priorita | Sekce | Cross-cutting | Frekvence | Jednotka | Směr |
|---|---|---|---|---|---|---|---|---|
| 1 | `HR_STATS` | HR statistiky (HC, FTE, demografie, GPG, DEI) | 1 | I | `compensation-pay-gap` | yearly | mix | flat |
| 2 | `WF_MOVEMENT` | Nástupy a odchody | 1 | II | — | monthly | count | flat |
| 3 | `HOLIDAY_UNTAKEN` | Nevyčerpaná dovolená | 1 | — | `absence-coverage` | monthly | days | down |
| 4 | `SICKNESS_RATE` | Nemocnost | 2 | — | `absence-coverage` | monthly | pct | down |
| 5 | `SHIFT_COVERAGE` | Pokrytí směn | 2 | — | `absence-coverage` | monthly | pct | down |
| 6 | `WAGE_KPI` | Mzdové KPI | 2 | III | `compensation-pay-gap` | yearly | CZK | down |
| 7 | `CAP_KPI` | CAP KPI | 2 | III | — | yearly | CZK | down |
| 8 | `HC_FTE_DIV` | HC / FTE per divize | 1 | III | — | yearly | count | down |
| 9 | `AVG_WAGE` | Průměrná mzda per FTE | 1 | III | `compensation-pay-gap` | yearly | CZK | flat |
| 10 | `TTF` | Time to Fill | 2 | IV | `recruitment-funnel` | monthly | days | down |
| 11 | `TTF_CRIT` | TTF kritické pozice | 2 | IV | `recruitment-funnel` | monthly | days | down |
| 12 | `TIME_TO_PROD` | Čas do produktivity | 3 | IV | — | quarterly | months | down |
| 13 | `CPH` | Cost per Hire | 2 | IV | `recruitment-funnel` | yearly | CZK | down |
| 14 | `QUALITY_HIRE` | Quality of Hire | 2 | IV | `attrition` + `recruitment-funnel` | quarterly | pct | up |
| 15 | `EMPLOYER_EVAL` | Employer Evaluation | 2 | IV | — | monthly | score | up |
| 16 | `FLUCT` | Fluktuace | 1 | V | `attrition` | half-yearly | pct | down |
| 17 | `FLUCT_CRIT` | Fluktuace kritické pozice | 1 | V | `attrition` | half-yearly | pct | down |
| 18 | `SUCCESSION` | Succession rate | 2 | VI | — | quarterly | pct | up |
| 19 | `ENPS` | eNPS | 2 | VII | `attrition` (correlation) | yearly | score | up |
| 20 | `TALENT_GROWTH` | Talent & Growth potential | 3 | VIII | — | yearly | pct | up |

**Legenda:**
- `Sekce` — formální příslušnost k sekci I–VIII dle `NÁVRH_do_BI`. Pomlčka znamená stand-alone KPI bez formální sekce, zobrazuje se v cross-cutting drill-downu a případně v operativě.
- `Cross-cutting` — analytické drill-downy, ve kterých se KPI vyskytuje.

Prahové hodnoty (target / green / acc / red) přesně podle `NÁVRH_do_BI`. Kde `to be informed` — nastavíme rozumné defaulty a označíme komentářem `TODO upřesnit s HR Directorkou`.

---

## 6. Data model — reálná data + mock dokombinace

### 6.1 Firma = AURES Holdings (reálné parametry)

Po obdržení reálných exportů od uživatele (`Nastupy_vystupy.xlsx`, `Staffplan.xlsx`, `recruitment_report.xlsx`) **opouštíme fiktivní firmu**. Prototyp je stavěn pro reálný AURES Holdings:

- **Název:** AURES Holdings a.s. (holdingová společnost; AAA AUTO, AAA+, Mototechna, Mototechna Drive, Auto Diskont, Driverama).
- **Velikost:** ~1 735 aktuálních FTE (plán 1 864 FTE) — vacancy rate ~9 %.
- **Země:** CZ (dominantní) + SK + PL + HU + DE (přes Driverama GmbH).
- **Entity v recruitmentu:** Aures Holdings, Autocentrum AAA Auto a.s., AAA Auto Sp. z o.o. (PL), AAA Auto HU, Mototechna, Driverama, Driverama GmbH, a další.
- **Divizní / regionální struktura (z reálných dat):**
  - **OPS** (Operations / Bazaar) — Helpers, Drivers — rozdělené do Regionů (Praha, 1, 2, 3, 4 CZ).
  - **SELLING** (prodejci) — po regionech.
  - **BUY** (výkupčí) — po regionech.
  - **F&I** (Finance & Insurance) — po regionech.
  - **Call Centre** (Praha, Ostrava).
  - **Customer Experience**, **Marketing & Communication**, podpůrné funkce (HR, IT, Finance).
  - Celkem **206 Departmentů** v **2 182 pozicích**.
- **Druh pracovního poměru:** PP (~60 %), DPP (~38 %), DPČ (~2 %), malé zastoupení Statutár a IČO.
- **Historie v datech:** **2016–2026 (10 let)** workforce eventů, **2018–2026** recruitment dat.
- **Grade struktura:** v reálných datech nefiguruje explicitně. V `NÁVRH_do_BI` figurují B0–B3. V prototypu **doplníme grade jako odvozený atribut** z názvu pozice / úrovně v hierarchii (heuristika).

### 6.2 Co máme z reálných dat (k 2026-04-24)

| Entita | Reálná data | Rozsah |
|---|---|---|
| **Employee master (částečný)** | `Nastupy_vystupy.xlsx` — OSČPV, jméno, druh PV, datum nástupu/odchodu, důvod, org. struktura | ~9 000 aktuálních + historických, 10 let |
| **Positions & Staff plan** | `Staffplan.xlsx` — 2 182 pozic, Cap (plán), Actual FTE, Department, Pobočka | Aktuální stav |
| **Workforce events** | `Nastupy_vystupy.xlsx` — hire / terminate | 17 932 událostí (9 152 nástupů + 8 780 odchodů), 10 let |
| **Recruitment funnel** | `recruitment_report.xlsx` — 7 869 hiring processes, 2018+, sources, ratings, gender | 10 klientů/divizí, 15+ kanálů |
| **Interviews** | `recruitment_report.xlsx` — 5 000+ interview záznamů s typy, datumy, recruiterem, divizí | 2014+ |
| **Gender split** | Z recruitmentu: 75 % male, 25 % female | Odráží automotive reality |

### 6.3 Co doplníme mock-data generátorem

Tyto fakta **nejsou v reálných datech** a musíme je generovat (konzistentně s reálnou kostrou):

| Entita | Mock | Důvod |
|---|---|---|
| **Payroll** | Generovaná základní mzda + variabilní + benefity per employee × month | Není v exportech |
| **Absence** (sick / vacation / parental) | Realistická distribuce (~3 % sick, 5 % vacation balance při Q4) | — |
| **Shift coverage** | Pouze pro pobočkové divize (OPS, SELLING, Call Centre) | — |
| **Performance reviews** | Ratings 1–5 + growth potential low/med/high/very_high | — |
| **eNPS responses** | Kvartální cyklus, +12 avg, participation ~70 % | — |
| **Training completions** | Hours / FTE / rok, zaměřeno na ESG ESRS | — |
| **Work accidents** | Low frequency, per divize | — |
| **Succession plans** | Per kritická pozice (marker `criticalFlag`) + nástupce nebo gap | — |
| **Critical position flag** | Odvozené od grade + role family + počtu pozic daného typu | Heuristika |
| **Grade B0–B3** | Odvozené od org hierarchy level + pozice keywords | Heuristika |

### 6.4 Generátor

**Klíčové principy:**
1. **Deterministický seed** — stejná čísla při každém buildu (pro stabilní screenshoty / review).
2. **Reálná kostra = ground truth** — Staffplan a Nastupy_vystupy jsou autoritativní. Mock fakta jsou jim podřízená.
3. **Konzistence napříč mock fakty** — kdo je v PayrollMonth, musí být v HeadcountSnapshot (odvozeném z reality). Žádné sirotky.
4. **Zabudované příběhy** — do mock fakt zaseté „story" využitelné reálnou strukturou:
   - **F&I Region Praha** (449 událostí za 10 let, vysoký traffic) → zvýšená fluktuace v posledním roce.
   - **OPS Bazaar Drivers Region 1** → 2 odchody klíčových Team Leadů → succession gap.
   - **eNPS pokles v Call Centre Ostrava** → korelace s fluktuací.
   - **Pay gap v F&I** (vysoká koncentrace mužů) → 8 % raw, klesá po adjustaci.
   - **Untaken Holiday v Marketingu** — vysoký zůstatek ke konci roku.
5. **Anonymizace** — reálná jména skrýváme za konzistentní pseudonymy (hash OSČPV → stable fake name), ORG jednotky zůstávají reálné.

### 6.5 Úložiště

Generator běží **při build time** (`npm run gen:mock`) a produkuje statické TS moduly v `lib/data/mock/`. Žádná runtime generace — stabilita a rychlost. Zdrojové Excely se čtou parserem (např. `xlsx` nebo `exceljs`) jednorázově.

### 6.2 Entity (dimenze a fakta)

```typescript
// Dimenze
Employee {
  id, firstName, lastName, gender, birthDate, nationality,
  hireDate, terminationDate?, terminationReason?,
  country, divisionId, departmentId, positionId, managerId?,
  grade: 'B0'|'B1'|'B2'|'B3'|'IC',
  employmentType: 'HPP'|'DPP'|'DPC'|'ICO',
  fte: 0.5..1.0,
  criticalPositionFlag,
  talentPoolFlag,
  successorForPositionId?,
}

Position { id, title, divisionId, criticalFlag, grade, roleFamily }

Division { id, name, country, parentId?, costCenter }

Department { id, name, divisionId, headId? }

// Fakta
HeadcountSnapshot { month, employeeId, active, onLeave, ... }
WorkforceEvent { date, employeeId, type: 'hire'|'terminate'|'move'|'promote', ... }
PayrollMonth { month, employeeId, baseSalary, variable, benefits, nonPersonal }
AbsenceRecord { employeeId, dateFrom, dateTo, type: 'sick'|'vacation'|'parental'|... }
ShiftDay { date, divisionId, planned, covered }
RecruitmentRequisition { id, positionId, approvedDate, publishedDate,
  firstInterviewDate?, offerDate?, acceptedDate?, hireDate?, cost, channel, critical }
FunnelEvent { requisitionId, stage, count, date }
PerformanceReview { cycle, employeeId, rating: 1..5, growthPotential: 'low'|'med'|'high'|'very_high' }
ENPSResponse { cycle, employeeId, score: -100..100, invited, responded }
TrainingCompletion { date, employeeId, course, hours, cost }
WorkAccident { date, divisionId, severity, type }
```

### 6.3 Generátor mock dat

**Klíčové principy:**
1. **Deterministický seed** — stejná čísla při každém buildu (pro stabilní screenshoty / review).
2. **Konzistence napříč fakty** — kdo je v PayrollMonth, musí být v HeadcountSnapshot, musí existovat v Employee. Žádné „sirotčí" záznamy.
3. **Věrohodná distribuce:**
   - Gender pay gap ~7 % mean / ~4 % median (realistické pro CEE automotive).
   - Fluktuace kolem 25 % YoY s měsíční variabilitou.
   - TTF průměr 30 dní s fat tail.
   - eNPS kolem +12.
   - Nemocnost ~3 %.
4. **Zabudované příběhy** — do mock dat záměrně zaseté „story":
   - **Divize Sales CZ** — roste fluktuace Q1 2026 → driver pro retention sekci.
   - **Divize OPS SK** — odešli 2 Team Leaders bez nástupce → driver pro succession.
   - **eNPS v OPS** — pokles o 8 bodů → korelace s fluktuací.
   - **TTF critical** — překračuje 40 dní → red flag v Recruitment.
   - **Jedna kritická pozice** s incumbent plánujícím odchod — „hidden risk".
   - **Pay gap v grade B2** — 7 % raw, 2 % adjusted → AI insight se na to chytí.
5. **Real data injection ready** — generátor přijímá `realEmployeesSeed?: Employee[]`, pokud uživatel dodá export z EGJE, použije ho jako kostru a dogeneruje fakta.

### 6.4 Úložiště

Generator běží **při build time** (`npm run gen:mock`) a produkuje statické JSON soubory v `public/mock/` (nebo lépe: TS moduly v `lib/data/mock/` kvůli type safety). Žádná runtime generace — stabilita a rychlost.

---

## 7. Analytická vrstva

### 7.1 Rule-based engine

Kompletně deterministická. Pět modulů:

1. **`KPIEvaluator`** — dostane KPI def + data snapshot, vrátí:
   ```typescript
   {
     value: number,
     trend: { mom?: number, yoy?: number, qoq?: number },
     sparkline: number[],      // posledních 12 období
     status: 'green'|'amber'|'red',
     deltaVsTarget: number,
     formattedValue: string,
   }
   ```
2. **`DriverAnalyzer`** — dostane KPI + segmentační dimenzi (divize / země / grade / tenure), vrátí top 3–5 přispěvatelů ke změně MoM / YoY.
3. **`AnomalyDetector`** — rolling z-score nad 12M historií; flag `⚡` pokud |z| > 2.
4. **`NarrativeGenerator`** — šablony v CZ. Vyplní placeholdery z `KPIEvaluator` + `DriverAnalyzer`. Příklad šablony:
   > „{kpiName} {statusPhrase} {direction} na {value} {unit}, {trendPhrase} vůči minulému období. {driverSentence}."
5. **`ActionRecommender`** — mapuje `(status, driverPattern) → actionTemplate` z KPI katalogu, kontextualizuje.

### 7.2 AI insights (mock)

JSON v `content/ai-insights/*.json`. Struktura:

```json
{
  "FLUCT_CRIT": [
    {
      "scenario": "red_with_ops_driver",
      "insight": "Korelace s poklesem eNPS v OPS (−8 bodů) napovídá, že jde o důsledek napětí po jarní reorganizaci.",
      "tone": "hypothesis"
    },
    {
      "scenario": "amber_stable",
      "insight": "Metrika je stabilní v akceptovatelném pásmu, ale vyžaduje sledování — dvě kritické pozice mají aktuálně <6 měsíců tenure successora.",
      "tone": "watch"
    }
  ]
}
```

**Výběr insightu:** jednoduchý rule-based mapper (scenario = funkce(status, top driver pattern)). Pokud nenajde match, zobrazí se fallback „Žádný specifický insight pro aktuální stav.".

**Architektura LLM-ready:**
```typescript
interface AIInsightProvider {
  get(kpiCode: string, context: KPIEvaluation): Promise<Insight>;
}
class MockAIInsightProvider implements AIInsightProvider { /* z JSON */ }
class ClaudeAIInsightProvider implements AIInsightProvider { /* budoucí */ }
```

### 7.3 AI Copilot (mock)

Sidebar chat UI. Obsahuje:
- **Předkonfigurované dotazy** (clickable chips): „Proč roste fluktuace?", „Kde máme nejrychleji rostoucí mzdy?", „Co navrhuje AI pro zlepšení eNPS?", „Top 3 retenční rizika", „Které divize plní budget?", atd. (8–12 položek).
- **Typewriter efekt** při zobrazení odpovědi.
- **Odpověď** = strukturovaný markdown (nadpis, 2–3 odstavce, případně mini tabulka nebo bullet list).
- **Cat / Disclaimer:** „Demo. Odpovědi jsou pre-generated ukázky." (decentně, malým písmem).

Implementačně: `content/copilot-queries.json` s query → answer dvojicemi.

**Architektura:** `CopilotProvider` interface — mock vs. live Claude.

---

## 8. Data Provider pattern (future-proof)

Cíl: swap mock → real bez změny UI.

### 8.1 Interface

```typescript
interface DataProvider {
  // Dimenze
  getEmployees(filter?: EmployeeFilter): Promise<Employee[]>;
  getPositions(filter?: PositionFilter): Promise<Position[]>;
  getDivisions(): Promise<Division[]>;

  // Fakta
  getHeadcountSnapshots(period: Period, filter?: Filter): Promise<HeadcountSnapshot[]>;
  getWorkforceEvents(period: Period, filter?: Filter): Promise<WorkforceEvent[]>;
  getPayroll(period: Period, filter?: Filter): Promise<PayrollMonth[]>;
  getAbsence(period: Period, filter?: Filter): Promise<AbsenceRecord[]>;
  getRequisitions(period: Period, filter?: Filter): Promise<RecruitmentRequisition[]>;
  getFunnelEvents(period: Period): Promise<FunnelEvent[]>;
  getPerformanceReviews(cycle: string): Promise<PerformanceReview[]>;
  getEnpsResponses(cycle: string): Promise<ENPSResponse[]>;
  // …
}
```

### 8.2 Implementace

- `MockDataProvider` — pro teď, čte z generovaných JSON / TS modulů.
- `HybridDataProvider` — budoucnost, přijímá `realSources: Partial<Record<Entity, 'real'|'mock'>>` a kombinuje. Např. `{ employees: 'real', payroll: 'mock', recruitment: 'real' }`.
- `EGJEDataProvider`, `ATSDataProvider` — v budoucnu dotáhneme.

### 8.3 Kde se volá

**Pouze v Next.js Server Components** (async `page.tsx`). Client komponenty dostávají data jako props. UI o existenci mock / real neví.

---

## 9. Vizuální systém

### 9.1 Paleta

**Vychází z „Modern SaaS Analytics" směru s nádechem AURES corporate — čisté, profesionální, modro-bílá základna s decentním teplým akcentem (oranžová navazuje na AAA AUTO brand heritage).**

| Role | Color | HEX |
|---|---|---|
| Background | Zinc 50 / Zinc 950 (dark) | `#fafafa` / `#0a0a0a` |
| Surface | White / Zinc 900 | `#ffffff` / `#18181b` |
| Text primary | Zinc 950 / Zinc 50 | — |
| Text secondary | Zinc 500 | `#71717a` |
| Border | Zinc 200 / Zinc 800 | — |
| **Primary (AURES corporate)** | Deep Blue 700 | `#1d4ed8` |
| **Accent (AAA AUTO heritage)** | Orange 500 (sparingly, pro CTA / hero highlights) | `#f97316` |
| Success / Green | Emerald 500 | `#10b981` |
| Warning / Amber | Amber 500 | `#f59e0b` |
| Danger / Red | Rose 500 | `#f43f5e` |
| AI accent | Violet gradient 500→Fuchsia 500 | — |

**Light mode default, dark mode jako switcher** (dle preference uživatele).

### 9.2 Typografie

- **Geist Sans** pro text, UI, labels.
- **Geist Mono** pro číslice v KPI cardech (monospace pro vyrovnanou šířku).
- **Instrument Serif** (italic) pro hero nadpisy a AI insights (odlišení tónu).
- Velikosti: 3xl / 5xl pro heroes, lg / xl pro KPI hodnoty, sm pro metadata.

### 9.3 Komponenty (shadcn/ui)

Card, Button, Badge, Tabs, Separator, Tooltip, Popover, Dialog, Sheet (pro Copilot sidebar), Select, Command (pro search), Skeleton (loading), Table (+ TanStack).

### 9.4 Charty (Recharts)

Tenké linie (1,5–2 px), mělké gradient fills, zaoblené rohy bar chartů, tooltip na hover s rich content. **Žádné výchozí Recharts vzhledy** — všechno stylováno.

### 9.5 Animace (Framer Motion)

- Stagger pro grid karet (50 ms delay mezi kartami).
- Fade-up pro scroll-into-view.
- Typewriter pro AI Copilot odpověď.
- Subtle hover scale (1.01) pro klikací karty.

### 9.6 Inspirace (referenční odkazy pro designera)

- vercel.com/analytics
- dub.co/dashboard
- linear.app/insights
- posthog.com/dashboard
- cal.com/insights

---

## 10. Struktura kódu

```
/
├── app/
│   ├── layout.tsx                     # Root layout + providers
│   ├── page.tsx                       # Executive Dashboard
│   ├── sekce/
│   │   ├── layout.tsx                 # Section shell
│   │   └── [slug]/page.tsx            # Per-section view
│   ├── analytika/
│   │   └── [slug]/page.tsx            # Cross-cutting drill-down
│   └── operativa/
│       └── [slug]/page.tsx            # Operational views
├── components/
│   ├── ui/                            # shadcn primitives
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── GlobalFilters.tsx
│   ├── kpi/
│   │   ├── KPICard.tsx                # standard
│   │   ├── CompactKPICard.tsx         # section scorecards
│   │   ├── KPIHero.tsx                # section hero
│   │   ├── StatusBadge.tsx
│   │   ├── TrendArrow.tsx
│   │   ├── Sparkline.tsx
│   │   ├── DriverList.tsx
│   │   ├── Narrative.tsx
│   │   ├── AIInsightBlock.tsx
│   │   └── ActionSuggestion.tsx
│   ├── charts/
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── StackedBar.tsx
│   │   ├── Donut.tsx
│   │   ├── Histogram.tsx
│   │   ├── Waterfall.tsx
│   │   └── NineBox.tsx
│   ├── copilot/
│   │   ├── CopilotFAB.tsx
│   │   ├── CopilotSidebar.tsx
│   │   └── QueryChips.tsx
│   └── dashboard/
│       ├── HealthScoreHero.tsx
│       ├── TopAlerts.tsx
│       ├── WhatChanged.tsx
│       └── SectionScorecards.tsx
├── lib/
│   ├── data/
│   │   ├── provider.ts                # DataProvider interface
│   │   ├── mock-provider.ts
│   │   └── mock/
│   │       ├── employees.ts
│   │       ├── payroll.ts
│   │       └── ...                    # generované TS moduly
│   ├── kpi/
│   │   ├── catalog.ts                 # všech 20 KPI definic
│   │   └── calculations.ts
│   ├── analytics/
│   │   ├── kpi-evaluator.ts
│   │   ├── driver-analyzer.ts
│   │   ├── anomaly-detector.ts
│   │   ├── narrative-generator.ts
│   │   └── action-recommender.ts
│   ├── ai/
│   │   ├── insight-provider.ts
│   │   └── copilot-provider.ts
│   ├── types.ts
│   └── utils.ts
├── content/
│   ├── ai-insights/*.json             # per KPI
│   └── copilot-queries.json
├── scripts/
│   └── gen-mock.ts                    # mock data generator
├── public/
│   └── fonts/                         # lokální fonty
├── docs/
│   ├── specs/                         # tento dokument
│   └── ...
├── PROJEKT_ZAZNAM.md                  # živý log
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 11. Tech stack (detail)

| Oblast | Volba | Verze |
|---|---|---|
| Framework | Next.js | 15 (App Router, Turbopack) |
| Jazyk | TypeScript | 5.6+ |
| Styling | Tailwind CSS | v4 |
| UI primitives | shadcn/ui + Radix | latest |
| Grafy | Recharts | 2.x |
| Animace | Framer Motion | 11.x |
| Ikony | Lucide React | latest |
| State | Zustand | 5.x |
| Tabulky | TanStack Table | 8.x |
| Fonty | Geist Sans, Geist Mono, Instrument Serif | via next/font |
| Hosting | Vercel | — |
| Package manager | pnpm | — |

---

## 12. Milníky (high-level, bude rozpracováno v plánu implementace)

1. **Milník 0 — Foundation**: repo init, Next.js scaffolding, Tailwind + shadcn setup, fonty, základní layout, routing kostra.
2. **Milník 1 — Data**: mock data model, generátor, 36M historie, konzistence, Data Provider interface.
3. **Milník 2 — KPI core**: katalog všech 20 KPI, rule-based engine (evaluator, drivers, anomaly, narrative, action).
4. **Milník 3 — Reference sekce V. Retention**: kompletně end-to-end — landing sekce, KPI cardy, drill-down Attrition, polished visuals. **Shakedown cruise celé architektury.**
5. **Milník 4 — Executive Dashboard**: Health Score, Top Alerts, What Changed, Section Scorecards, AI Executive Summary.
6. **Milník 5 — Zbývajících 7 sekcí** (I, II, III, IV, VI, VII, VIII) — opakování patternu z V.
7. **Milník 6 — Cross-cutting drill-downy**: Recruitment funnel, Compensation/pay gap, Absence/coverage.
8. **Milník 7 — Operativa**: Hired/Fired, Org Chart, Vacation, eNPS latest, ESG.
9. **Milník 8 — AI Copilot**: sidebar, pre-canned queries, typewriter.
10. **Milník 9 — Polish & demo setup**: animace, loading states, landing copy, Vercel preview URL, showcase script „jak projít demo s HR Directorkou".
11. **Milník 10 — Action Backlog**: prioritizovaná fronta akcí z KPI statusů, driverů a vlastníků.
12. **Milník 11 — XLS perfection pass**: traceability proti XLS zadání, vizuální QA, textový polish, navigační kontrola a odstranění zbylých rozporů.

**Každý milník = zvláštní merge / preview deploy, review s uživatelem, pak další.**

---

## 13. Budoucí rozšíření (vně scope prvního vydání)

- PowerPoint / Excel exporty pro board meeting a další offline práci.
- Live Claude API pro Copilot + on-the-fly AI insights.
- Integrace části reálných dat z EGJE / ATS (přes nový DataProvider).
- Dark mode polish.
- Komentáře / anotace („HR Directorka označí KPI vlajkou, týdně se zobrazí review").
- Mobile app shell (Progressive Web App).
- Snapshotting + historical diffs („porovnat březen vs. prosinec").

---

## 14. Rizika a mitigace

| Riziko | Dopad | Mitigace |
|---|---|---|
| Mock data nepřesvědčí HR Directorku o věrohodnosti. | Vysoký. | Zaseté realistické „story" (kap. 6.3), reálná data jako kostra hned jak budou k dispozici, diverzita segmentů. |
| Prototyp bude vypadat moc jako „AI demo" místo HR nástroj. | Střední. | AI jen jako přidaná vrstva vedle rule-based. UI dominantně data + statistika, AI je kontextuální spice. |
| Příliš mnoho sekcí → povrchní dojem. | Střední. | Reference sekce V. Retention dotažena „mega kvalitně" jako vzor, ostatní sekce replikují pattern. |
| Terminologie v CZ není jednotná. | Nízký. | Glossary v `lib/types.ts`. |
| Ztráta kontextu při pauze projektu. | Nízký. | `PROJEKT_ZAZNAM.md` jako živý log, `docs/specs/` pro rozhodnutí. |

---

## 15. Otevřené otázky — vyřešeno (2026-04-24)

1. **Jméno firmy** → **AURES Holdings a.s.** Reálné. Bez fikce.
2. **Barvy** → primary Deep Blue 700 (`#1d4ed8`, corporate), accent Orange 500 (`#f97316`, AAA AUTO heritage), light mode default.
3. **Light / dark** → light default + dark switcher.
4. **Deadline milníku 3** → na mě, bez tlaku, kvalita > rychlost.
5. **Přístup k preview** → během vývoje jen uživatel. HR Directorka až po schválených milnících.
6. **Review body** → po milnících **3, 5, 9**.
7. **Terminologie** → **jednoduchá česká** — „doba do obsazení" místo „time to fill", „odchody" místo „fluktuace" tam, kde je to čitelnější.

## 16. Glossary CZ (draft, bude rozšiřován)

| EN / technical | CZ preferovaně | Poznámka |
|---|---|---|
| Headcount (HC) | počet zaměstnanců | |
| FTE | přepočtený úvazek (FTE) | zkratku necháváme, je zavedená |
| Attrition / turnover | odchody / fluktuace | preferuj „odchody" v pop-up copy, „fluktuace" v titulech KPI |
| Voluntary / involuntary | dobrovolné / nedobrovolné odchody | |
| Time to Fill | doba do obsazení | |
| Time to Hire | doba náboru | |
| Cost per Hire | náklad na jeden nábor | |
| Quality of Hire | kvalita náboru | |
| Succession rate | pokrytí nástupnictvím | |
| eNPS | eNPS (skóre loajality) | zkratka + vysvětlivka |
| Tenure | délka zaměstnání | |
| Gender pay gap | rozdíl v odměňování podle pohlaví | |
| Growth potential | růstový potenciál | |
| Talent pool | talentová rezerva | |
| Drivers | hlavní příčiny / přispěvatelé | v cardu „hlavní příčiny změny" |
| Critical positions | klíčové pozice | |
