# Implementační plán — Milník 4 (Executive Dashboard)

> **Stav k 2026-04-25 07:20 UTC:** Executive Dashboard je implementovaný jako hlavní vstup do prototypu. Root stránka `/` už ukazuje health score, největší alerty, měsíční změny, scorecards sekcí I-VIII a krátké executive AI shrnutí.

## Cíl

Postavit první obrazovku, kterou uvidí HR Directorka:

1. HR Health Score vážené prioritou KPI.
2. Hero KPI pro stav lidí, fluktuaci a eNPS.
3. Top alerty podle závažnosti, priority a trendu.
4. What changed panel rozdělený na zlepšení, problémy a watchlist.
5. Scorecards všech sekcí I-VIII s proklikem do detailu.
6. Executive AI Summary jako krátké interpretační shrnutí nad tvrdými KPI.
7. Navigaci rozšířenou z Retention-only shellu na celý katalog sekcí.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `app/page.tsx` | server page Executive Dashboardu |
| `components/dashboard/health-score-hero.tsx` | health score hero + hlavní KPI |
| `components/dashboard/top-alerts.tsx` | top alert panel |
| `components/dashboard/what-changed.tsx` | změny proti minulému období |
| `components/dashboard/section-scorecards.tsx` | scorecards sekcí I-VIII |
| `components/dashboard/executive-summary.tsx` | executive AI summary |
| `components/layout/app-shell.tsx` | společný shell s navigací pro `/` i sekce |
| `lib/analytics/executive-dashboard.ts` | agregace dat pro executive view |
| `lib/sections/catalog.ts` | katalog sekcí I-VIII, routing a metadata |
| `tests/dashboard/executive-dashboard.test.ts` | testy health score, alertů a scorecards |
| `tests/kpi/sections.test.ts` | test konzistence sekcí a KPI katalogu |

## Ověření

```bash
pnpm lint
pnpm typecheck
pnpm test tests/dashboard/executive-dashboard.test.ts tests/kpi/sections.test.ts
```

Před tagováním milníku probíhá ještě plná validace:

```bash
pnpm gen:data
pnpm check:data
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Další krok

M5 Full section dashboards:

- doplnit sekce I, II, III, IV, VI, VII a VIII,
- sjednotit layout sekčních stránek přes katalog,
- zachovat Retention jako referenční detail,
- doplnit testy pro sekční datové souhrny a routy.
