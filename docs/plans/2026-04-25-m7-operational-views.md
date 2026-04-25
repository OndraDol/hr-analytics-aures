# Implementační plán — Milník 7 (Operational views)

> **Stav k 2026-04-25:** Operativní pohledy jsou implementované jako statické routy `/operativa/[view]` a napojené do sidebaru i sekčních cross-linků.

## Cíl

Doplnit reporty, které HR aktuálně potřebuje jako konkrétní operativní výstupy:

1. `/operativa/hired-fired` — nástupy a odchody.
2. `/operativa/org-chart` — organizační struktura a manažerské rozpětí.
3. `/operativa/vacation-balances` — zůstatky dovolené.
4. `/operativa/enps-latest` — detail poslední eNPS vlny.
5. `/operativa/esg` — ESG people datapointy.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `lib/analytics/operational-views.ts` | katalog M7 view + datové buildery |
| `app/operativa/[view]/page.tsx` | statické Next routy pro M7 |
| `components/layout/app-shell.tsx` | sidebar rozšířený o Analytiku a Operativu |
| `lib/sections/catalog.ts` | sekční odkazy upravené na existující M6/M7 routy |
| `tests/operational/operational-views.test.ts` | test kompletnosti M7 modelů a cross-linků |

## Datové vrstvy

- Hired/Fired používá workforce events a HRIS dimenze.
- Org chart používá employee-manager vazby, departments a division dimenzi.
- Vacation balances počítá odhad zůstatku z aktivních zaměstnanců a čerpání dovolené YTD.
- eNPS latest používá poslední survey wave `2025-Q4`.
- ESG skládá demografii, women-in-management, školení a work accidents.

## Ověření

```bash
pnpm typecheck
pnpm test tests/operational/operational-views.test.ts
pnpm build
```

## Další krok

M8 AI Copilot:

- sidebar / sheet,
- pre-canned dotazy,
- typewriter efekt,
- mock provider připravený na pozdější live API.
