# Implementační plán — Milník 5 (Full section dashboards)

> **Stav k 2026-04-25 07:35 UTC:** Všechny sekce I-VIII mají funkční dashboard. Retention zůstává jako detailní referenční sekce, ostatní sekce běží přes společný sekční framework a dynamickou routu `/sekce/[slug]`.

## Cíl

Doplnit chybějící sekce tak, aby demo pokrylo kompletní strukturu z HR návrhu:

1. I. HR statistiky.
2. II. Nástupy a odchody.
3. III. Náklady a struktura.
4. IV. Recruitment.
5. VI. Nástupnictví.
6. VII. Engagement.
7. VIII. Talent & Growth.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `app/sekce/[slug]/page.tsx` | dynamické statické routy pro všechny nové sekce |
| `components/sections/section-page.tsx` | společný sekční layout: hero, KPI grid, grafy, tabulka, akce, drill-down odkazy |
| `components/charts/section-charts.tsx` | klientské Recharts grafy pro sekční trend a breakdown |
| `lib/analytics/section-summaries.ts` | datové summary pro sekce I, II, III, IV, VI, VII, VIII |
| `tests/sections/section-summaries.test.ts` | garance, že každá nová sekce vrací KPI, metriky, grafy, tabulku a akce |

## Datový update

Recruitment export už nebyl jen parser bez výstupu. Generátor dat nově vytváří:

- `RecruitmentRequisition[]` do `lib/data/generated/requisitions.ts`,
- `FunnelCount[]` do `lib/data/generated/funnel-counts.ts`,
- `MockDataProvider.getRequisitions()` a `getFunnelCounts()` vrací fakta přes stejný provider pattern jako zbytek aplikace.

To umožňuje Recruitment sekci pracovat s reálnou kostrou náborového exportu místo čistého fallbacku.

## Ověření

```bash
pnpm gen:data
pnpm lint
pnpm typecheck
pnpm test tests/sections/section-summaries.test.ts
pnpm build
```

Před tagováním milníku probíhá ještě plná validace:

```bash
pnpm check:data
pnpm test
```

## Další krok

M6 Cross-cutting detail views:

- Attrition analytics,
- Recruitment funnel detail,
- Compensation & pay gap,
- Absence & coverage.
