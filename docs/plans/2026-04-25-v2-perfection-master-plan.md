# HR Analytics — v2 Perfection Pass (M12–M17) — Master Plan

> Master blueprint pro pokračování projektu HR Analytics AURES po dokončení v1 (M0–M11). Řeší přechod z „demo-ready" na „investment-ready" stav z pohledu HR Directorky Marie Voršílkové.
>
> **Tento dokument je master overview.** M12–M17 jsou implementované ve v2 release; dokument zůstává jako auditní blueprint rozsahu a akceptačních kritérií.

Vytvořeno: 2026-04-25
Stav: dokončeno ve v2 release, navazuje M18 UX polish QA.

---

## Context

### Proč v2

V1 (M0–M11) je **100 % hotová** (`lib/project/progress.ts`: 11/11 milníků, 100/100 procentních bodů). Má kompletní funkční prototyp:

- Executive Dashboard (Health Score Hero, Top Alerts, What Changed, Section Scorecards I–VIII)
- Sekční dashboardy I–VIII, Retention detail, 4 cross-cutting analytiky, 5 operativních pohledů
- Mock AI Copilot, Action Backlog, PDF briefing přes browser print flow
- Traceability matrix proti `HR_reporting_ver2.xlsx`
- 18 testů / 72 cases, build 24 statických stránek, lint+typecheck zelené

### Co v1 nezvládá z pohledu HR Directorky

Při auditu z perspektivy **Marie Voršílkové** (HR Directorka, ráno v 7:30 mezi meetingy, 30 sekund na rozhodnutí, export PDF pro board) byly identifikovány tři kategorie mezer:

**A. Mezery proti zadání z `HR_reporting_ver2.xlsx`:**
1. Recruitment KPI bez driver detailu — TTF=43 d (red), karta neřekne, *která* pozice/manager/stage drhne. Detail je v `/analytika/recruitment-funnel`, ale hlavní KPI card to nenavádí.
2. Akce bez vlastníka a deadline — Action Backlog má `dueLabelCs`, ale chybí timeline indikátory (dnes / týden / 14 dnů) a explicitní owner mapovaný do task workflow.
3. ESG bez audit trail — `/operativa/esg` ukazuje 21 datapointů, ale chybí sloupec **Data Quality** (real / mock / pending). HR Directorka si myslí, že vše je reálné.

**B. UX gaps (top 10, seřazeno dopadem):**
1. Health Score je vizuálně neutrální (`health-score-hero.tsx:34`, vždy `text-zinc-950`).
2. Top Alerts bez prioritizace (`top-alerts.tsx:18-40`, žádné „1/5 NEJURGENTNĚJŠÍ").
3. What Changed má fake empty states (`what-changed.tsx:34`, šum).
4. Threshold confidence/source skryté (`threshold-bar.tsx:34-41`).
5. KPI Card má 7–8 elementů bez hierarchie (`kpi-card.tsx:24-74`, chybí zóny HEADLINE/INSIGHT/DECISION).
6. Severity 72/100 bez vysvětlení (`kpi-card.tsx:38`).
7. Action Backlog timeline neviditelná (`action-backlog-page.tsx:76-83`).
8. Briefing PDF bez print preview.
9. Section Scorecards status badge příliš malý (~20px).
10. Copilot není risk-aware (`lib/ai/copilot-provider.ts:45-52`).

**C. Vizuální design gaps (top 8, wow-faktor):**
1. Sidebar bez AURES brand identity (`bg-white` neutrální).
2. KPI Card bez featured state.
3. Sparkline statická (žádný hover tooltip).
4. Threshold bar bez animace.
5. Charty bez custom tooltipu/legendy/gradient fillu.
6. Hero typografie slabá (`text-5xl` bez serif, `font-mono` bez `tabular-nums`).
7. Print bez headers/footers/branding.
8. Orange akcent jen v grafech.

### Co je naopak silné — chránit

1. **5-vrstvý thinking layer KPI karty** (kde→cíl→status→proč→co) — koncept ano, jen lepší styling.
2. **Layout 3 sekcí Executive** (hero / alerts / changes) — držet, jen vizuální váhy.
3. **Action Backlog s P1/P2/P3 + status + effort + dueLabel** — drží se workflow, doplnit timeline.
4. **Copilot mock dotazy** — 8 kvalitních, drží kontext, jen risk-aware.
5. **Briefing print flow** — jeden route, browser print = elegantní, jen perfekcionistická úroveň.

---

## Vize v2: „Decision-Ready Executive Cockpit"

Marie Voršílková otevře dashboard ráno v 7:30 mezi meetingy:

- **Za 10 sekund** vidí, jestli je něco špatně (Health Score je vizuálně urgentní, ne pasivní).
- **Za 30 sekund** vidí top 3 problémy + co s nimi má udělat (rank, owner, deadline).
- **Za 3 minuty** ví, co se změnilo a kam zaměřit pozornost. Drill-down jen kde rozhoduje.
- **Export PDF pro board** vypadá jako McKinsey deck — page numbers, header lines, AURES corporate frame.

---

## Architektura projektu (referenční)

- **Stack:** Next.js 15.5 App Router, React 19.1, TypeScript 5 strict, Tailwind 4 (`@theme inline` v `app/globals.css`), Recharts 3.8, Framer Motion 12.38, Zustand 5, Vitest 4.
- **Data flow:** `DataProvider` (`lib/data/provider.ts`) → `MockDataProvider` (`lib/data/mock-provider.ts`) → generated mock v `lib/data/generated/*.ts` (gitignored, generuje `pnpm gen:data`).
- **KPI engine:** `lib/analytics/kpi-engine.ts:buildKpiCardModel()` jediný entrypoint, skládá z evaluator + driver-analyzer + anomaly-detector + narrative-generator + action-recommender + insight-provider.
- **Executive dashboard:** `lib/analytics/executive-dashboard.ts:buildExecutiveDashboard()` — health score, alerts, changes, scorecards.
- **Section catalog:** `lib/sections/catalog.ts` (`SECTION_CATALOG`) jediná pravda pro metadata sekcí.
- **Threshold metodika:** `lib/kpi/thresholds.ts` (source/confidence/methodology + `calculateSeverityScore`).
- **Project progress model:** `lib/project/progress.ts` deterministicky počítá % hotovo (v1 = 100/100).
- **Skripty:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test path/...`, `pnpm build`, `pnpm gen:data`, `pnpm check:data`.

---

## M12 — Decision Support Layer

> KPI hierarchy zóny, alerts ranking 1–5, action backlog timeline, threshold confidence overlay.

**Vize:** Marie za 10 s vidí, jestli je něco špatně, za 30 s top 3 problémy s ownerem a deadlinem.

### Scope

1. **KPI Card 3-zone refactor.** Přepsat `components/kpi/kpi-card.tsx` na deklarativní strukturu se třemi sub-komponentami: `KpiCardHeadlineZone` (status icon + value + delta + sparkline), `KpiCardInsightZone` (narrative + drivers chip row + threshold bar), `KpiCardDecisionZone` (recommended action + AI insight + owner + deadline). Vytvořit `components/kpi/kpi-card-zones.tsx`. Odstranit „severity 72/100 · monthly · hybrid" jednořádkový shluk.

2. **Severity tooltip s vysvětlením.** Přidat `KpiSeverityBadge` (`components/kpi/kpi-severity-badge.tsx`) s textem „Severita 72/100" + kliknutelný `?` info popover (CSS `details/summary`, žádná dependency) zobrazující rozpad: status base + priority boost + data quality penalty + trend boost + distance boost. Refaktorovat `lib/kpi/thresholds.ts:calculateSeverityScore` aby vracela `{ score, breakdown: { statusBase, priorityBoost, qualityPenalty, trendBoost, distanceBoost } }`.

3. **Top Alerts ranking 1–5.** V `components/dashboard/top-alerts.tsx` přidat před každý alert mono-numerický rank chip (`grid h-10 w-10 place-items-center rounded-lg bg-rose-600 text-white font-mono text-xl shadow-md`). Top alert dostane `border-rose-300 border-2 + shadow-rose-200/40 shadow-lg`. V `lib/analytics/executive-dashboard.ts` přidat `rank: 1|2|3|4|5` do `ExecutiveAlert`.

4. **What Changed bez fake empty state.** Odstranit fallback `'HR_STATS'` v `components/dashboard/what-changed.tsx:34`. Místo toho při `items.length === 0` neutrální placeholder (1 řádek). Mirror v `components/briefing/executive-briefing-page.tsx:118-134`.

5. **Action Backlog timeline indikátor.** V `components/actions/action-backlog-page.tsx:91-131` přidat vlevo `TimelineRail` (vertikální gradient + dot na pozici dle `due`): `this-week` 0–15 % rose, `two-weeks` 15–50 % amber, `monthly-review` 50–80 % blue, `next-cycle` 80–100 % zinc. Vytvořit `components/actions/timeline-rail.tsx`. Pod kartu horizontální `TimelineLegend`.

6. **Threshold confidence overlay.** V `components/kpi/threshold-bar.tsx:45-66` při `confidence === 'low' || 'needs-validation'` přidat diagonální stripe overlay + chip „ČEKÁ NA VALIDACI". Source badge přesunout pod bar jako primární info.

7. **ExecutiveAlert obohacen o owner & ageDays.** V `lib/analytics/executive-dashboard.ts` přidat `owner: string` (z `definition.owner`) a `ageDays: number` (heuristika). V `top-alerts.tsx` zobrazit „Owner · Stáří".

### Soubory

- **Upravit:** `components/kpi/kpi-card.tsx`, `components/kpi/threshold-bar.tsx`, `components/dashboard/top-alerts.tsx`, `components/dashboard/what-changed.tsx`, `components/actions/action-backlog-page.tsx`, `components/briefing/executive-briefing-page.tsx`, `lib/analytics/executive-dashboard.ts`, `lib/analytics/types.ts`, `lib/kpi/thresholds.ts`.
- **Vytvořit:** `components/kpi/kpi-card-zones.tsx`, `components/kpi/kpi-severity-badge.tsx`, `components/actions/timeline-rail.tsx`.

### Reuse

- `lib/analytics/kpi-engine.ts:buildKpiCardModel` — `KpiCardModel` rozšířit o `severityBreakdown`.
- `lib/analytics/executive-dashboard.ts:rankAlert` + `alertFromEvaluation` — rozšířit o `owner`, `ageDays`, `rank`.
- `lib/actions/action-backlog.ts:dueFor` — bez změny, reuse pro `TimelineRail`.

### Akceptační kritéria

- Snapshot test `tests/dashboard/kpi-card-zones.test.ts`: 3 zone elementy ve 3 statusech (green/amber/red).
- `tests/dashboard/executive-dashboard.test.ts`: `expect(dashboard.topAlerts.every(a => a.rank >= 1 && a.rank <= 5)).toBe(true)`, `expect(dashboard.topAlerts[0].owner).toBeTruthy()`.
- `tests/kpi/thresholds.test.ts`: severity breakdown součet === finální score (3 cases).
- Vizuálně: skóre 35 (FLUCT_CRIT red) zobrazí Top Alerts rank-1 chip s `bg-rose-600 text-white shadow-rose-200/40`.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zelené.

### Závislosti

Žádné. M12 startuje hned po v1.

---

## M13 — AURES Visual Identity

> Sidebar branding, typografie upgrade, brand palette, KPI featured state.

**Vize:** Aplikace přestane vypadat jako „generic shadcn template" a získá AURES vizuální podpis. Health Score Hero vážnost odpovídající urgentnosti (red = velký, červený, vážný).

### Scope

1. **AURES Brand tokens.** V `app/globals.css` rozšířit `:root` o brand tokeny: `--aures-blue-50` až `--aures-blue-900` (9 odstínů kolem `#1d4ed8`), `--aures-orange-50` až `--aures-orange-900` (kolem `#f97316`), `--aures-graphite-50` až `--aures-graphite-900`. Přidat do `@theme inline` pro Tailwind 4 třídy (`bg-aures-blue-700`). Definovat `--brand-primary`, `--brand-accent`, `--brand-graphite` semantic mapping.

2. **Sidebar gradient + AURES monogram.** V `components/layout/app-shell.tsx:59` aside `bg-white` → `bg-gradient-to-b from-aures-blue-950 via-aures-blue-900 to-aures-graphite-950`. Invertovat colors: `text-zinc-100`, `text-aures-blue-200` eyebrow, active stav `bg-aures-orange-500/15 text-aures-orange-300`. Brand monogram: inline SVG „A" 32×32 v aures-orange + wordmark. `border-r border-aures-blue-800`. Footer progress: `bg-aures-blue-900/40 + bar bg-aures-orange-500`.

3. **Health Score Hero dramatic typography.** V `components/dashboard/health-score-hero.tsx:18,34` H1 na `font-serif text-5xl md:text-7xl tracking-tight`. Skóre `text-7xl tabular-nums font-serif` při red, `text-6xl` amber, `text-5xl` green — přes prop `tone: 'urgent' | 'attention' | 'good'` derivovaný z `data.healthScore`. Číslo dynamicky: <55 = `text-rose-600`, 55–74 = `text-amber-600`, ≥75 = `text-emerald-600`. Conic-gradient ring přebarvit na `--aures-orange-500` při red, jinak `--aures-blue-700`.

4. **KPI featured state.** V `kpi-card-zones.tsx` (z M12) prop `featured`: `border-2 border-aures-blue-300 bg-gradient-to-br from-white via-white to-aures-blue-50/30 shadow-lg shadow-aures-blue-100/40 ring-1 ring-aures-blue-200/40 ring-offset-2`. Stuha v rohu: `<span className="absolute -top-2 left-5 rounded-full bg-aures-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Hlavní fokus</span>`. Trigger: nejvyšší rank Top Alert KPI v `app/page.tsx`.

5. **Sticky header redesign.** Header `bg-white/95` s `border-b-2 border-aures-blue-100`. Export PDF tlačítko `bg-aures-orange-500 text-white hover:bg-aures-orange-600` (orange = brand action). Indikátor „X % hotovo" do levého slotu vedle eyebrow s ikonou progress kruhu.

6. **Section Scorecard status badge prominence.** V `components/dashboard/section-scorecards.tsx:35` `StatusBadge` zvětšit přes prop `size: 'sm'|'md'|'lg'`. Default na scorecards = `lg`: `px-3 py-1.5 text-sm`. Colored top-stripe na celé kartě (4px, `section.accent`).

7. **Recommended action box orange accent.** V `KpiCardDecisionZone` „Doporučená akce" box `border-l-4 border-l-aures-orange-500 bg-gradient-to-r from-aures-orange-50/40 to-transparent`. Title `text-aures-orange-700`. Vytvoří identitu „orange = action".

8. **Layout typografie.** V `app/layout.tsx` body `font-sans antialiased text-aures-graphite-950`. V Tailwind 4 zaregistrovat `--font-display: var(--font-instrument-serif)` aby `<h1 className="font-display">` chytalo serif s `tabular-nums`.

### Soubory

- **Upravit:** `app/globals.css`, `app/layout.tsx`, `components/layout/app-shell.tsx`, `components/dashboard/health-score-hero.tsx`, `components/dashboard/section-scorecards.tsx`, `components/kpi/status-badge.tsx`, `components/kpi/kpi-card.tsx`, `components/kpi/kpi-card-zones.tsx`.
- **Vytvořit:** `components/layout/aures-monogram.tsx` (inline SVG), `lib/branding/tokens.ts` (typed map pro programatický přístup do Recharts).

### Reuse

- `SECTION_CATALOG[].accent` — visual prominence, žádná data změna.
- `lib/utils.ts:cn` — bez změny.

### Akceptační kritéria

- `pnpm build` 24 stránek bez selhání.
- `tests/dashboard/health-score-hero.test.tsx` (nový): score 35 obsahuje `text-rose-600` + `text-7xl`, score 85 `text-emerald-600` + `text-5xl`.
- Grep verify: `app-shell.tsx` aside nemá `bg-white`, má `bg-gradient-to-b from-aures-blue-950`.
- StatusBadge v scorecards `px-3 py-1.5`.

### Závislosti

M12 (KpiCardZones existují → featured prop musí mít kam zaregistrovat ribbon).

---

## M14 — Charts & Motion

> Custom Recharts tooltips, gradient fills, sparkline hover, threshold pulse, page enter animations.

**Vize:** Charty přestanou vypadat jako default Recharts. Jemné motions vytvoří dojem „real-time monitoring".

### Scope

1. **Recharts custom tooltip + legend.** Vytvořit `components/charts/chart-primitives.tsx` se 3 exporty: `KpiTooltip` (rounded-lg, AURES tokens, KPI value formatter z `lib/analytics/format.ts`), `KpiLegend` (s vysvětlením proč modrá vs oranžová) a `gradientDef(id, color)` helper. Refaktor `retention-charts.tsx:42-44` a `section-charts.tsx:48,91`.

2. **Gradient area fills.** V `SectionTrendChart` a `RetentionTrendChart` přidat `<Area>` pod `<Line>` s `fill="url(#aures-blue-grad)"`, `fillOpacity={0.16}`, gradient 0% blue → 100% transparent. Bar chart secondary `fill="url(#aures-orange-grad)"` (linear top→bottom 100%→60%).

3. **Sparkline hover s tooltip.** V `components/kpi/sparkline.tsx` `'use client'`. Přidat invisible `<rect>` overlay na každý bod + svislá čára + dot + label `MMM YYYY · 12,3 %`. Prop `unit?: KpiUnit`. Dot animace `motion.circle` (300ms ease).

4. **Threshold current pulse.** V `threshold-bar.tsx:62-64` dot zabalit do `motion.span` s `animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.8, repeat: Infinity }}` jen když `evaluation.status === 'red'`. Green/amber statický.

5. **Page enter stagger.** Vytvořit `components/layout/motion-stack.tsx` (`'use client'`) — wrapper, který automaticky staggerne children s `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}`. Použít na home, sekce, analytika, operativa. Respektovat `prefers-reduced-motion` přes `useReducedMotion()`.

6. **Number counter animace.** `components/dashboard/animated-number.tsx` (`'use client'`, Framer Motion `useMotionValue` + `animate`). Health Score `<AnimatedNumber from={0} to={data.healthScore} duration={1.2} />`. Featured KPI value stejně.

7. **Recharts colors přes CSS tokens.** Refactor `#1d4ed8`, `#f97316`, `#71717a`, `#e4e4e7` v `retention-charts.tsx`, `section-charts.tsx` na `var(--aures-blue-700)`. Umožní v M17 dark mode bez chart edits.

### Soubory

- **Upravit:** `components/charts/retention-charts.tsx`, `components/charts/section-charts.tsx`, `components/kpi/sparkline.tsx`, `components/kpi/threshold-bar.tsx`, `components/dashboard/health-score-hero.tsx`, `app/page.tsx`, `app/sekce/[slug]/page.tsx`, `app/analytika/[topic]/page.tsx`, `app/operativa/[view]/page.tsx`.
- **Vytvořit:** `components/charts/chart-primitives.tsx`, `components/layout/motion-stack.tsx`, `components/dashboard/animated-number.tsx`.

### Reuse

- `lib/analytics/format.ts:formatKpiValue` (extrahovat z `lib/kpi/thresholds.ts:formatValue` pokud nutno).
- Framer Motion 12.38 už v `package.json:23`.

### Akceptační kritéria

- `tests/charts/chart-primitives.test.tsx` (nový): tooltip pro `unit: 'pct'` obsahuje `12,3 %`.
- Vizuální QA `/sekce/retention`: gradient pod line chart.
- `prefers-reduced-motion: reduce` = animace vypnuté (mock `useReducedMotion` v testu).
- Sparkline hover = label `Březen 2026 · 26,1 %`.

### Závislosti

M13 (AURES tokens).

---

## M15 — Drill-Down Intelligence

> Recruitment driver per stage/HM/channel, cross-KPI hypotheses, anomaly visibility, severity tooltip.

**Vize:** Při TTF=43 d red KPI karta přímo na Executive řekne „Sales CZ × Junior Sales × HM Nováková × kanál LinkedIn drhne v 1st interview". Bez nutnosti přejít na drill-down. Cross-KPI hypotézy (FLUCT a ENPS souběžně klesají v Sales CZ) v `WhatChanged`.

### Scope

1. **Driver analyzer multi-dimension.** V `lib/analytics/driver-analyzer.ts` přidat `KpiDriverDimension = 'division'|'stage'|'hiring-manager'|'channel'|'grade'|'tenure-cohort'`. Implementovat `analyzeRecruitmentDrivers(provider, evaluation): KpiDriverGroup[]` (jen pro `TTF`, `TTF_CRIT`, `CPH`, `QUALITY_HIRE`) přes `provider.getRequisitions(period)` s rozkladem po `position.role`, `requisition.hiringManagerId`, `requisition.channel`, `requisition.stage`. Top 3 per dimension. Vrátit `{ dimension, top: KpiDriver[] }[]`. Aktuální `KpiDriver[]` zůstává jako `top.flatMap` (compat).

2. **KpiCardModel rozšířen.** V `lib/analytics/kpi-engine.ts:KpiCardModel` přidat `driverGroups: KpiDriverGroup[]` a `crossKpiHypotheses: CrossKpiHypothesis[]`. `buildKpiCardModel` zavolá `analyzeRecruitmentDrivers` jen pokud relevantní KPI.

3. **Cross-KPI hypothesis detector.** Nový `lib/analytics/cross-kpi-correlator.ts` s `detectHypotheses(allEvaluations, period): CrossKpiHypothesis[]`. Heuristické dvojice: FLUCT × ENPS, TTF × CPH, SICKNESS_RATE × SHIFT_COVERAGE, FLUCT_CRIT × SUCCESSION. Pokud obě v red/amber a `Math.sign(trend.mom)` souhlasí → `{ kpis: [code1, code2], strength: 'strong'|'plausible', messageCs, confidenceCs }`. Šablonové, deterministické. Top 3. V `executive-dashboard.ts` doplnit `hypotheses` do `ExecutiveDashboardData`.

4. **Drivers Chip Row v KPI Insight zone.** V `KpiCardInsightZone` (z M12) horizontální scrollable chip rail per `driverGroups`. Mini-tab title (`STAGE`, `MANAGER`, `KANÁL`) + 3 chips s deltou (`Junior Sales · +12 d`, `LinkedIn · -28 %`). On click → `Link` na `/analytika/...?focus=`.

5. **What Changed dostane Hypotézy.** Přidat 4. sekci pod 3 columns: `<HypothesesPanel hypotheses={dashboard.hypotheses} />` (nový `components/dashboard/hypotheses-panel.tsx`). 2-column rail s ikonou lightbulb (lucide-react), title, message, kliknutelné pills s KPI codes.

6. **Anomaly visibility upgrade.** V `lib/analytics/anomaly-detector.ts:detectAnomaly` rozšířit threshold (z-score ≥ 1.5, ne 2) a vracet `severity: 'subtle'|'notable'|'sharp'`. V `KpiCardHeadlineZone` pokud `anomaly.isAnomaly` zobrazit `<AnomalyFlag severity={...}>` (chip s ikonou Activity, žlutý/červený rámeček, tooltip `Výrazná odchylka proti vlastní historii (z-score -2,3)`). Featured anomaly = `motion.div animate={{ rotate: [0, -3, 3, 0] }}`.

7. **Recruitment funnel "stuck stage" surfacing.** V `lib/analytics/cross-cutting.ts:buildRecruitmentFunnel` (line 332+) přidat `stuckStage: { stage, dropOff, ageDays }`. Property do `DetailDashboardData` (`detail-types.ts`). V `detail-dashboard-page.tsx` prominentní „Stuck stage" banner.

### Soubory

- **Upravit:** `lib/analytics/driver-analyzer.ts`, `lib/analytics/anomaly-detector.ts`, `lib/analytics/kpi-engine.ts`, `lib/analytics/executive-dashboard.ts`, `lib/analytics/cross-cutting.ts`, `lib/analytics/detail-types.ts`, `lib/analytics/types.ts`, `components/kpi/kpi-card-zones.tsx`, `components/dashboard/what-changed.tsx`, `components/detail/detail-dashboard-page.tsx`.
- **Vytvořit:** `lib/analytics/cross-kpi-correlator.ts`, `components/dashboard/hypotheses-panel.tsx`, `components/kpi/anomaly-flag.tsx`, `components/kpi/driver-chip-row.tsx`.

### Reuse

- `lib/data/provider.ts:getRequisitions/getFunnelCounts` — provider má vše.
- `KpiDriver` interface v `lib/analytics/types.ts:38-44` — backward compat.
- `lib/analytics/cross-cutting.ts:stageDurations` — reuse pro driver „stage".

### Akceptační kritéria

- `tests/analytics/cross-kpi-correlator.test.ts` (nový): FLUCT=red + ENPS=red descending → 1 hypothesis s `strength: 'strong'`.
- `tests/analytics/driver-analyzer.test.ts` (nový): `analyzeRecruitmentDrivers` pro TTF s 5+ requisitions vrátí 3 dimensions.
- `tests/dashboard/executive-dashboard.test.ts` rozšířit: `expect(dashboard.hypotheses.length).toBeGreaterThanOrEqual(0)`.
- `pnpm typecheck` zelený s rozšířeným `KpiCardModel`.

### Závislosti

M12 (zone struktura), M14 (motion utilities pro AnomalyFlag).

---

## M16 — Executive PDF Mastery + Operational Polish + ESG Audit Trail

> McKinsey-grade PDF, print preview mode, ESG Data Quality column, action backlog velocity.

**Vize:** Briefing PDF vypadá jako McKinsey deck. ESG dostane audit trail. Action Backlog drobné polish.

### Scope

1. **Print @page header/footer/branding.** V `app/globals.css:45-84` `@media print` rozšířit:
   ```css
   @page {
     size: A4;
     margin: 20mm 15mm;
     @top-left { content: "AURES Holdings · HR Analytics"; font-family: Georgia, serif; font-size: 9pt; color: #475569; }
     @top-right { content: "Q1 2026"; font-size: 9pt; color: #475569; }
     @bottom-left { content: "Demo prototyp · " counter(page) " / " counter(pages); font-size: 9pt; }
     @bottom-right { content: "2026-04-25"; font-size: 9pt; }
   }
   @page :first { @top-left, @top-right, @bottom-left, @bottom-right { content: ""; } }
   ```
   První `.briefing-cover` s `page-break-after: always` a vlastní serif typografií.

2. **Briefing cover page + section page-breaks.** V `components/briefing/executive-briefing-page.tsx:34-70` první sekci přebudovat na `<BriefingCover />` (AURES monogram 60mm, „Executive briefing Q1 2026", autor, datum, executive summary 2 odstavce). Každá další sekce `<section className="briefing-section">` s `break-before: auto; page-break-inside: avoid`.

3. **Print Preview mode.** Nad `<PrintButton />` druhý button „Náhled tisku". Toggle `previewMode: boolean` přidá class `briefing-preview`. V `globals.css`: `.briefing-preview .briefing-page { width: 210mm; min-height: 297mm; margin: 24px auto; box-shadow: 0 12px 36px rgba(0,0,0,0.3); }`. Vizuální simulace A4. Print samotný používá `@page` rules. Vytvořit `components/briefing/preview-toggle.tsx`.

4. **PDF page chunks.** V `lib/briefing/executive-briefing.ts` rozdělit `ExecutiveBriefingData` do logických chunks (`pages: BriefingPage[]`). Každá briefing-section dostane `data-page="2"`. Implementace v `components/briefing/page-footer.tsx`.

5. **ESG Data Quality column.** V `lib/analytics/operational-views.ts:buildEsg` (line 496+) `datapoints` přejmenovat `secondary` → typovaný `dataQuality: 'ready'|'partial'|'mock'|'needs-validation'|'blocked'`. V `detail-dashboard-page.tsx` table dedikovaná column „Data Quality":
   - `ready` → emerald chip „Připraveno"
   - `partial` → amber chip „Částečně"
   - `mock` → orange chip „Mock data"
   - `needs-validation` → rose chip „K validaci"
   - `blocked` → graphite chip „Blokováno"
   Generic table renderer rozšířit o `extraColumn?: { label, render }` slot. Vytvořit `components/detail/data-quality-chip.tsx`.

6. **Action Backlog velocity sparkline.** V `components/actions/action-backlog-page.tsx` summary card (line 44-52) získá týdenní velocity přes `lib/actions/action-backlog.ts:weeklyVelocity` (mock heuristika, 4 týdny). Vizuálně `bg-aures-blue-50 border-aures-blue-200 p-3`.

7. **Briefing Top Alerts dostanou rank chips.** V `executive-briefing-page.tsx:82` `BriefingAlert` rosette (stejnou jako M12). Briefing print = stejný executive deck pocit.

### Soubory

- **Upravit:** `app/globals.css`, `components/briefing/executive-briefing-page.tsx`, `lib/briefing/executive-briefing.ts`, `lib/analytics/operational-views.ts`, `lib/analytics/detail-types.ts`, `components/detail/detail-dashboard-page.tsx`, `components/actions/action-backlog-page.tsx`, `lib/actions/action-backlog.ts`.
- **Vytvořit:** `components/briefing/briefing-cover.tsx`, `components/briefing/preview-toggle.tsx`, `components/briefing/page-footer.tsx`, `components/detail/data-quality-chip.tsx`.

### Reuse

- `lib/analytics/format.ts` — datový formátování.
- `components/dashboard/animated-number.tsx` (M14) — pro briefing health score (statický v print přes `prefers-reduced-motion: reduce`).
- ESG `datapoints` array kategorie — jen typový rename.

### Akceptační kritéria

- `tests/briefing/executive-briefing.test.ts`: `expect(briefing.pages.length).toBeGreaterThan(0)` a `expect(briefing.coverData.titleCs).toBe('Executive briefing Q1 2026')`.
- `tests/operational/operational-views.test.ts`: ESG datapoints všech 21 mají typovaný `dataQuality`.
- Manuální print: `chrome://print-preview` ukáže page numbers, AURES wordmark v hlavičce.
- Preview toggle visibly mění body bg na šedý a karty na „papírové".

### Závislosti

M13 (AURES tokens), M12 (rank chips reuse).

---

## M17 — Stabilizace v2

> Smoke + a11y + dark mode review, walkthrough, PROJEKT_ZAZNAM, progress model.

**Vize:** v2 verifikovaná, demo-ready, dokumentovaná. Progress model uznává M12–M17.

### Scope

1. **Project progress model v2.** V `lib/project/progress.ts:21-33` rozšířit `PROJECT_MILESTONES`:
   - V1 milestones zůstávají `completed: true` s celkem 100 percent points.
   - M12–M17 přidat se 6 novými percent points (např. 18/18/18/18/18/10) ale `completed: false` defaultně.
   - Funkci `getProjectProgress` rozšířit o `version: 'v1'|'v2'`. Default `'v2'` s flag `getV1Progress()` pro starý smoke test.
   - **Smoke test upravit** na `expect(briefing.projectProgress.v1Percent).toBe(100)` + `expect(briefing.projectProgress.v2Percent).toBeGreaterThanOrEqual(0)`.
   - Sidebar v `app-shell.tsx:90-101` zobrazí dva progress bars: „v1 prototyp" (100 %) a „v2 perfection" (M12–M17).

2. **A11y + reduced motion review.** Projít všechny nově vytvořené komponenty:
   - `KpiCardZones`: `<article aria-labelledby>`, severity badge `aria-describedby`.
   - `TimelineRail`: `role="img" aria-label="Termín: tento týden"`.
   - `AnimatedNumber`: `aria-live="polite"`.
   - `MotionStack`: `useReducedMotion()` → no-op.
   - `ThresholdBar` pulse: jen v non-reduced motion.
   - Color contrast: AURES sidebar dark gradient + `text-zinc-300` na `bg-aures-blue-900` ≥ 4.5:1.
   - Vytvořit `tests/a11y/component-a11y.test.tsx` s `@testing-library/jest-axe` (přidat `pnpm add -D jest-axe @types/jest-axe`).

3. **Dark mode review.** V `app/globals.css:16-24` `@media (prefers-color-scheme: dark)` rozšířit M13 brand tokens dark variantu (`--brand-primary: var(--aures-blue-400)` v dark, světlejší). Defensivní krok. Dokumentovat v `docs/design/dark-mode-policy.md` jako „v3 follow-up".

4. **Demo walkthrough update.** `docs/demo-walkthrough-hr-director.md` rozšířit o „v2 enhancements" sekci: 10 bodů co je nového vs v1 (rank chips, owner, timeline rail, hypothesis panel, severity tooltip, gradient charts, page numbers v PDF, ESG data quality, ...).

5. **PROJEKT_ZAZNAM v2 sekce.** Přidat za řádek 21 novou top-level sekci `## Aktuální stav v2 Perfection Pass`. M12–M17 deliverables, status. Aktualizovat datum a procento. Plus odkaz na 6 detailních plánů `docs/plans/2026-04-DD-vXX-...md`.

6. **Smoke + e2e routes.** Rozšířit `tests/smoke.test.ts`: assertion že všechny stránky z `app/` (24 statických) build a nemají hydration warning. Vytvořit `tests/smoke/route-imports.test.ts` (glob `app/**/page.tsx`, kontrola default export).

7. **CHANGELOG / Release Notes.** Vytvořit `docs/releases/v2-perfection-pass.md` s rekapitulací per milestone, breaking changes (žádné očekávané), upgrade-path noty pro budoucího Power BI dodavatele.

### Soubory

- **Upravit:** `lib/project/progress.ts`, `tests/smoke.test.ts`, `tests/project/progress.test.ts`, `app/globals.css`, `docs/demo-walkthrough-hr-director.md`, `PROJEKT_ZAZNAM.md`, `components/layout/app-shell.tsx` (dva progress bars).
- **Vytvořit:** `tests/a11y/component-a11y.test.tsx`, `tests/smoke/route-imports.test.ts`, `docs/design/dark-mode-policy.md`, `docs/releases/v2-perfection-pass.md`.

### Reuse

- `lib/project/progress.ts:getProjectProgress` — rozšířit, ne nahrazovat.
- Existující testy jako šablona.

### Akceptační kritéria

- `pnpm test` zelený, count cases ≥ v1 count + 12 nových.
- `tests/project/progress.test.ts`: `expect(progress.v1Percent).toBe(100)`, `expect(progress.milestones.length).toBe(17)`.
- Lighthouse a11y skóre ≥ 95 na `/`.
- `pnpm build` bez warningů.
- PROJEKT_ZAZNAM má v2 sekci, datum aktualizováno.

### Závislosti

M12–M16 hotové.

---

## Sekvenční diagram závislostí

```
M12 (decision support) ──┬──► M13 (visual identity)
                         │
                         ├──► M15 (drill-down) ── reuses zones
                         │
M13 ────────────────────┴──► M14 (charts/motion) ─► M16 (PDF mastery)
                                                   │
M12 + M13 + M14 + M15 + M16 ──────────────────────► M17 (stabilizace)
```

M12 a M13 mohou jít paralelně po krátkém spike (M12 první týden, M13 souběžně po dni odsazení). M14 závisí na M13 tokenech. M15 staví na M12 zónách. M16 reuse rank chips z M12 a tokeny z M13. M17 zavírá vše.

---

## Ověření end-to-end (po každém milníku)

```bash
pnpm gen:data            # mock data refresh
pnpm check:data          # konzistence
pnpm lint
pnpm typecheck
pnpm test                # všechny suite
pnpm build               # 24+ statických stránek
pnpm dev                 # manuální HTTP smoke
```

Manuální HTTP smoke routes:
- `/`
- `/akce`
- `/briefing`
- `/sekce/retention`
- `/sekce/hr-statistics`
- `/analytika/attrition`
- `/analytika/recruitment-funnel`
- `/operativa/hired-fired`
- `/operativa/esg`

---

## Critical files (priority list)

1. `components/kpi/kpi-card.tsx` — refaktor na zones (M12), featured (M13), drivers chip (M15), severity tooltip (M12).
2. `components/dashboard/health-score-hero.tsx` — typografie + dynamic color (M13), animated number (M14).
3. `components/layout/app-shell.tsx` — sidebar branding (M13), dual progress bar (M17).
4. `app/globals.css` — AURES tokens (M13), print @page (M16), dark mode review (M17).
5. `lib/analytics/executive-dashboard.ts` — alert rank/owner/age (M12), hypotheses (M15).
6. `lib/analytics/kpi-engine.ts` — KpiCardModel rozšíření (M12, M15).
7. `lib/analytics/driver-analyzer.ts` — multi-dimension (M15).
8. `lib/kpi/thresholds.ts` — severity breakdown (M12).
9. `lib/project/progress.ts` — v1+v2 progress (M17).
10. `components/briefing/executive-briefing-page.tsx` — cover + preview + page chunks (M16).

---

## Návazné kroky (po schválení tohoto master plánu)

1. **M12 detailní plán** — `docs/plans/2026-04-DD-v12-decision-support-layer.md` rozepíše bite-sized TDD tasky (failing test → minimal impl → run → commit) s explicitními file paths a code bloky. Konvence z M0–M11.
2. **M13–M17 detailní plány** vznikají postupně při zahájení každého milníku.
3. **Review body** — po M12, M14 a M16 si vyžádat HR Director feedback (review po dvou milnících).
4. **PROJEKT_ZAZNAM aktualizace** — průběžně doplňovat sekci „Aktuální stav v2 Perfection Pass" po každém dokončeném milníku.

### Implementační režim

Reálnou implementaci v2 provádí **Codex** (OpenAI Codex/CLI). Master plán i detailní plány jsou psané jako self-contained blueprint — bez odkazu na nástroje konkrétního agenta. Každý task má:
- explicitní file path,
- code block (failing test → implementace),
- shell příkaz s očekávaným výstupem,
- commit message draft.

Claude Code (případně další agent) zůstává primárně pro plánování a review.

---

## Co tento plán neřeší (out of scope)

- **Live LLM Copilot** — pro v2 zůstává mock. Live Claude API je v3 follow-up po získání API klíče.
- **Real data integration** — current hybrid (real kostra + mock fakta) zůstává. Plná real data je přechod na produkční Power BI/DWH (separátní fáze).
- **Internationalization** — CZ-only zůstává. EN/SK lokalizace nepřichází v úvahu pro v2.
- **Authentication / RLS** — demo bez auth. Produkce řeší dodavatel BI.
- **Mobile-first redesign** — responzivní layout zůstává, ale mobile-first refactor je out-of-scope.

Tento plán cíleně zaměřen na **decision support quality + design polish** pro HR Directorku — nikoliv na rozšíření datového modelu.
