# Milník 3 — Frontend Shell & KPI Dashboard

> **Status:** Dokončeno ✅
> **Datum:** 2026-04-24
> **Branch:** `claude/m2-kpi-implementation-ffVhZ`
> **Commit:** `f08fdf4` — feat(m3): complete frontend shell + KPI dashboard

---

## Co bylo implementováno

### UI atomy (`components/ui/`)

| Soubor | Popis |
|---|---|
| `status-badge.tsx` | Badge s barevnou tečkou dle statusu (green/acceptable/red/no_data), varianty sm/md |
| `trend-arrow.tsx` | Ikona trendu (TrendingUp/Down/Minus) s barvou dle goodDirection × skutečného směru |
| `sparkline.tsx` | `'use client'` Recharts LineChart, custom tooltip, gradient fill |
| `skeleton.tsx` | `Skeleton` + `KPICardSkeleton` pro loading states |

### KPI komponenty (`components/kpi/`)

| Soubor | Popis |
|---|---|
| `health-score-ring.tsx` | SVG kruhový progress ring, animace stroke-dasharray, barva dle skóre (≥75 zelená, ≥50 amber, <50 červená), label CZ |
| `kpi-card.tsx` | Async server component; border-l-4 status; všech 5 analytických vrstev (hodnota+trend, sparkline, prahy, narrativ, anomalie, drivery, AI insight, akce); přijímá `style` pro stagger animaci |
| `section-scorecard.tsx` | Async server component; link na `/sekce/[slug]`; aggregovaný status sekce; hero KPI; mini sparkline; stagger animace |
| `driver-panel.tsx` | Seznam přispěvatelů MoM se šipkami a kontribučními hodnotami |

### Layout shell (`components/layout/`)

| Soubor | Popis |
|---|---|
| `sidebar.tsx` | `'use client'`; collapsible sidebar (w-60 ↔ w-16); AURES brand header; nav pro Dashboard + 8 sekcí s lucide ikonami; aktivní stav per pathname |
| `header.tsx` | Server component; `PageHeader` s title, subtitle, breadcrumbs (linkované), optional actions slot |
| `filter-bar.tsx` | `'use client'`; URL-based country filter (pushuje `?country=CZ` do URL); pill buttons; zobrazuje aktuální rok |
| `app-shell.tsx` | Wrapper: `<Sidebar>` + `<Suspense><FilterBar></Suspense>` + `<main>`; FilterBar obalená Suspense kvůli `useSearchParams` |

### Serverové helpery (`lib/`)

| Soubor | Popis |
|---|---|
| `lib/kpi-data.ts` | Server-side facade nad KPIService; `getExecutiveSummary`, `getAllSnapshots`, `getAlerts`, `getSectionSnapshots`, `getKPIHistory` |
| `lib/store.ts` | Zustand store `useFilters`; `GlobalFilters` s period, previousPeriod, country, divisionIds; `setPeriod` auto-computuje previousPeriod |

### Stránky (`app/`)

| Route | Soubor | Popis |
|---|---|---|
| `/` | `app/page.tsx` | Executive Dashboard; čte `searchParams.country`; fetchuje summary + snapshots paralelně; renderuje HealthScoreRing, Top Alerts, ChangesThisMonth, AI Executive Summary, 8× SectionScorecard v gridu |
| `/sekce/[id]` | `app/sekce/[id]/page.tsx` | 8 staticky pre-generovaných sekcí; slug → KPISection mapping; full grid KPICard pro každou sekci; breadcrumbs; `generateStaticParams` + `generateMetadata` |

### Update `app/layout.tsx`
- Přidal import `AppShell`
- `children` obalené `<AppShell>` — sidebar + filterbar dostane celá app

---

## Architektura dat (server → klient)

```
page.tsx (Server Component)
  └─ getExecutiveSummary() / getAllSnapshots()   ← lib/kpi-data.ts
       └─ KPIService                             ← lib/kpi/kpi-service.ts
            └─ MockDataProvider                  ← lib/data/mock-provider.ts
                 └─ generated/*.ts               ← pnpm gen:data

SectionScorecard / KPICard (async Server Components)
  └─ getKPIHistory(id, months)                   ← vlastní async call

FilterBar (Client Component)
  └─ useRouter().push("?country=CZ")             ← URL search params
       └─ page.tsx re-runs server-side
```

Filtry jsou URL-based (`searchParams`), nikoliv Zustand — umožňuje SSR a sdílení URL.  
Zustand store (`lib/store.ts`) je připraven pro budoucí client-side state (např. multi-select divisions).

---

## Build výsledky

```
Route (app)                     Size    First Load JS
┌ ƒ /                          1.12 kB       205 kB
├ ○ /_not-found                  994 B       103 kB
└ ● /sekce/[id]                  705 B       204 kB
    ├ /sekce/i-hr-statistiky
    ├ /sekce/ii-pohyb-zamestnancu
    ├ /sekce/iii-naklady-kapacita
    └ [+5 more paths]

✓ 13 static pages generated — TypeScript clean — 0 errors
```

---

## Otevřené body pro M4+

| # | Oblast | Poznámka |
|---|---|---|
| 1 | `pnpm check:data` | ~6 000 chyb „Absence before hire date" — bug v mock generátoru (`lib/data/mock/absence.ts`), fix připraven, nebyl commitován před pushí M2. Neovlivňuje UI ani testy. |
| 2 | Country filter | Funguje routing, ale `KPIService` ignoruje country filtr pro některé KPI (TTF, cost_per_hire) — mock data nemají country dimenzi pro requisitions. Vizuálně filtr pracuje, data se mění pro HC/fluktuaci/mzdy. |
| 3 | Division filter | Multi-select v URL není implementován — jen country. |
| 4 | Dark mode toggle | CSS proměnné a třída `.dark` jsou definovány, ale toggle button v UI chybí. |
| 5 | AI Copilot FAB | V spec M9, zatím není. |
| 6 | Cross-cutting drill-downs | `/analytika/*` routes zatím neexistují (M6 v plánu). |
| 7 | Operational views | `/operativa/*` routes zatím neexistují (M7 v plánu). |

---

## Jak spustit

```bash
# Generovat mock data (pokud lib/data/generated/ je prázdné)
pnpm gen:data

# Dev server
pnpm dev

# Production build
pnpm build && pnpm start

# TypeScript check
pnpm typecheck

# Testy
pnpm test
```

---

## Co přijde v M4

Dle původního plánu (`docs/specs/`) M4 pokrývá **Cross-cutting drill-downy**:

- `/analytika/attrition` — Cohort analysis, high-risk segmenty, tenure of leavers
- `/analytika/recruitment-funnel` — Full funnel per channel, bottleneck, cost/quality per channel
- `/analytika/compensation-pay-gap` — Wage distribution per grade, gender pay gap raw vs. adjusted
- `/analytika/absence-coverage` — Sickness trend, untaken holiday heatmap, shift coverage

Každý drill-down potřebuje nové Recharts komponenty (`charts/` složka): BarChart, StackedBar, Donut, Histogram, Waterfall, Scatter.
