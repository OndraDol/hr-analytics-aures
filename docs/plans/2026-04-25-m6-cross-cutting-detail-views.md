# Implementační plán — Milník 6 (Cross-cutting detail views)

> **Stav k 2026-04-25:** Cross-cutting analytické drill-downy jsou implementované jako statické routy `/analytika/[topic]` nad existujícím M1 data providerem a M2-M5 analytickým základem.

## Cíl

Doplnit čtyři analyticky hlubší pohledy, které propojují KPI napříč sekcemi:

1. `/analytika/attrition` — attrition deep dive.
2. `/analytika/recruitment-funnel` — recruitment funnel breakdown.
3. `/analytika/compensation-pay-gap` — compensation & pay gap.
4. `/analytika/absence-coverage` — absence & coverage.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `lib/analytics/cross-cutting.ts` | katalog M6 topiců + datové buildery |
| `lib/analytics/detail-types.ts` | společný datový kontrakt pro detailní stránky |
| `components/detail/detail-dashboard-page.tsx` | sdílený UI layout pro analytiku a operativu |
| `app/analytika/[topic]/page.tsx` | statické Next routy pro M6 |
| `tests/analytics/cross-cutting.test.ts` | test kompletnosti M6 modelů |

## Datové vrstvy

- Attrition propojuje workforce events, active HC, payroll, grade a eNPS.
- Recruitment funnel používá `RecruitmentRequisition[]` a `FunnelCount[]`.
- Compensation počítá raw a grade-adjusted pay gap z payrollu.
- Absence kombinuje sick days, dovolené YTD a coverage signál.

## Ověření

```bash
pnpm typecheck
pnpm test tests/analytics/cross-cutting.test.ts
pnpm build
```

## Další krok

M7 Operational views:

- Hired & fired,
- Org chart,
- Vacation balances,
- eNPS latest,
- ESG people data.
