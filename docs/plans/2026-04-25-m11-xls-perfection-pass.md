# Implementační plán — Milník 11 (XLS Perfection Pass)

> **Stav k 2026-04-25:** Implementováno. V1 prototyp je hotový na 100 % a M11 doplňuje dohledatelnost proti `HR_reporting_ver2.xlsx`.

## Cíl

Dovést prototyp do finální prezentační kvality podle původního XLS zadání: plně dohledatelný, funkční, přehledný, bez zjevných chyb a použitelný jako přesné zadání pro Power BI dodavatele. Produkční Power BI/DWH implementace zůstává mimo M11.

## Klíčové práce

- **XLS traceability:** hotovo v `docs/traceability/hr-reporting-v2-traceability.md`. Pokrývá 20 KPI, 8 BI sekcí, operativní reporty, ESG prvky a očekávané akce při odchylce.
- **Obsahová QA:** KPI katalog je srovnaný s klíčovými prahy z `NÁVRH_do_BI`; dokumentace už používá `HR_reporting_ver2.xlsx` jako primární zdroj.
- **Funkční QA:** smoke test hlídá hlavní route modely a interní linky; traceability test hlídá workbook a pokrytí KPI kódů.
- **Vizuální polish:** ESG readiness view bylo rozšířené na celý `ESG reporty_actual`; další vizuální ladění je už review/fine-tuning.
- **Dokumentace:** handoff, design spec a projektový záznam rozlišují webový prototyp od budoucí produkční BI fáze.

## Akceptační kritéria

- Každý KPI a report z dostupného XLS zadání má explicitní stav: implementováno, částečně implementováno, mimo scope, nebo blokováno chybějícím vstupem.
- Všechny hlavní demo routy vrací 200 a mají smysluplný obsah bez placeholderů.
- Demo flow pro HR Directorku je jasné: Executive Dashboard → Action Backlog → detailní analytika → Copilot → PDF briefing.
- Dokumentace jasně rozlišuje 100% hotový webový prezentační prototyp od budoucí produkční Power BI/DWH implementace.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` a `pnpm build` procházejí.

## Test Plan

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm dev --hostname 127.0.0.1 --port 3000
```

Po startu serveru projít minimálně:
- `/`
- `/akce`
- `/briefing`
- všechny `/sekce/*`
- všechny `/analytika/*`
- všechny `/operativa/*`

## Výstupy

- `HR_reporting_ver2.xlsx` je lokálně přítomný v kořeni projektu.
- `docs/traceability/hr-reporting-v2-traceability.md` mapuje workbook na implementaci.
- `tests/traceability/xls-traceability.test.ts` ověřuje sheety workbooku a pokrytí KPI kódů v traceability dokumentu.
- `lib/kpi/catalog.ts` obsahuje vybrané prahy z XLS pro TTF, TTF critical, CPH, fluktuaci, kritickou fluktuaci, succession a eNPS.
- `/operativa/esg` explicitně ukazuje readiness pro všech 21 ESG/ESRS datapointů.

## Assumptions

- `HR_reporting_ver2.xlsx` je primární zdroj pravdy a má přednost před staršími přepisy v dokumentaci.
- V1 zůstává mock-data prototyp; produkční datové napojení, governance, RLS a Power BI model nejsou cílem M11.
- M11 nemá přidávat velké nové produktové moduly, pokud nejde o zjevně chybějící část původního XLS zadání.
