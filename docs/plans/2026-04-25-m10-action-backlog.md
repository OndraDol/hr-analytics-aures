# Implementační plán — Milník 10 (Action Backlog)

> **Stav k 2026-04-25:** Action Backlog je implementovaný jako route `/akce` a navázaný do hlavní navigace.

## Cíl

Převést analytické výstupy dashboardu do jedné prioritizované akční fronty pro HR vedení.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `lib/actions/action-backlog.ts` | Builder akčního backlogu ze statusů KPI, driverů a doporučení |
| `components/actions/action-backlog-page.tsx` | UI pro seznam akcí, souhrn a vysvětlení prioritizace |
| `app/akce/page.tsx` | Statická route pro backlog |
| `app/akce/loading.tsx` | Loading stav pro backlog |
| `tests/actions/action-backlog.test.ts` | Test kompletnosti a řazení backlogu |

## Chování

- Backlog obsahuje jen KPI mimo zelený stav.
- Řazení kombinuje status, prioritu KPI, termín a velikost změny.
- Každá položka ukazuje vlastníka, termín, effort, hodnotu KPI, top driver a odkaz do kontextové stránky.
- Červené P1 akce dostávají termín `Tento týden`.

## Ověření

```bash
pnpm lint
pnpm typecheck
pnpm test tests/actions/action-backlog.test.ts
pnpm build
```
