# Implementační plán — Milník 3 (Retention reference section)

> **Stav k 2026-04-25 06:35 UTC:** První dashboardový svislý řez je implementovaný. Sekce V. Retention je napojená na M1 data layer a M2 KPI core.

## Cíl

Postavit referenční sekci, která ukáže cílový UX pattern pro zbytek dashboardu:

1. Root preview místo placeholderu.
2. Layout shell s navigací a headerem.
3. Retention stránka `/sekce/retention`.
4. KPI karty napojené na `buildKpiCardModel()`.
5. Trend a segment grafy přes Recharts.
6. Driver panel, doporučené akce a mock AI insight blok.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `app/page.tsx` | preview landing s odkazem na Retention |
| `app/sekce/retention/page.tsx` | server page, která skládá data pro Retention |
| `components/layout/app-shell.tsx` | shell s navigací a sticky headerem |
| `components/kpi/kpi-card.tsx` | standardní KPI karta |
| `components/kpi/status-badge.tsx` | status badge |
| `components/kpi/sparkline.tsx` | SVG sparkline pro KPI karty |
| `components/charts/retention-charts.tsx` | Recharts trend a segment chart |
| `components/retention/retention-page.tsx` | kompozice Retention sekce |
| `lib/analytics/retention-summary.ts` | retenční segmenty a risk summary |

## Ověření

```bash
pnpm gen:data
pnpm check:data
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Poznámka: Recharts grafy se renderují až po client mountu, aby statický build nevypisoval warningy o nulové velikosti kontejneru.

## Další krok

M4 Executive Dashboard:

- HR Health Score,
- Top Alerts,
- What Changed,
- Section scorecards I-VIII,
- AI Executive Summary,
- napojení Retention jako první plně funkční sekce.
