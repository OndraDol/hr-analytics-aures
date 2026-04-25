# Next Session Handoff — HR Analytics AURES

Poslední aktualizace: 2026-04-25

## Aktuální stav

Prezentační prototyp v1 + M11 traceability pass je hotový na **100 %**. Procento aplikace vychází z `lib/project/progress.ts`: dokončeno je 11/11 produktových milníků a 100/100 procentních bodů. M11 navíc doplňuje audit proti XLS zadání.

Těchto 100 % znamená dokončený webový prototyp nad hybridní real/mock datovou vrstvou a dohledatelnost proti `HR_reporting_ver2.xlsx`. Neznamená to hotovou produkční Power BI/DWH implementaci.

## Kde začít

1. Repo je v `/data/data/com.termux/files/home/codex-test/hr-analytics-aures`.
2. Přečíst tento dokument, potom `PROJEKT_ZAZNAM.md`, hlavně sekce „Aktuální stav projektu“ a závěrečné kapitoly 20-22.
3. Přečíst `docs/traceability/hr-reporting-v2-traceability.md`.
4. Přečíst `docs/plans/2026-04-25-m11-xls-perfection-pass.md`.
5. Pustit lokálně `pnpm dev --hostname 127.0.0.1 --port 3000` a projít demo flow.

## Co je hotové

- Executive Dashboard, HR Health Score, Top Alerts, What Changed, scorecardy všech 8 sekcí.
- Sekční dashboardy I-VIII, samostatný Retention detail, 4 analytické drill-downy a 5 operativních pohledů.
- Mock AI Copilot, Action Backlog, PDF briefing přes browser print flow.
- Loading states, empty states, demo walkthrough a stabilizační smoke test.
- `HR_reporting_ver2.xlsx` je přítomný v kořeni repozitáře a M11 traceability matrix mapuje KPI/reporty/ESG datapointy na implementaci.
- `pnpm dev` je upravený bez Turbopacku, aby fungoval v Termux prostředí; Turbopack zůstává jako `pnpm dev:turbo`.

## Zdrojové XLS

Primární workbook z původního zadání je nyní dostupný jako `HR_reporting_ver2.xlsx` v kořeni repozitáře. Má přednost před staršími přepisy v `PROJEKT_ZAZNAM.md` a design specu. Traceability výstup je v `docs/traceability/hr-reporting-v2-traceability.md`.

V repu jsou dostupné reálné/raw exporty:
- `data-sources/raw/Nastupy_vystupy.xlsx`
- `data-sources/raw/Staffplan.xlsx`
- `data-sources/raw/recruitment_report.xlsx`

Workbook obsahuje sheety `Vojta_all`, `HR Reporty_actual`, `ESG reporty_actual`, `NÁVRH_do_BI`, `Návrh_rozpad`, `CZ` a `NÁVRH`.

## Ověření posledního stabilního stavu

Poslední ověřené příkazy:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Výsledek po threshold metodice: lint a typecheck bez chyb, test suite 18 souborů / 72 testů, build 24 statických stránek.

HTTP smoke test přes lokální server prošel pro:
- `/`
- `/akce`
- `/briefing`
- `/sekce/retention`
- `/sekce/hr-statistics`
- `/analytika/attrition`
- `/operativa/hired-fired`
- `/operativa/esg`

## Další session: hlavní cíl

Pokračovat už ne jako M11 discovery, ale jako případný post-M11 review nebo příprava předání:
- znovu projít demo flow s HR Directorkou,
- podle feedbacku upravit texty, priority nebo prahy,
- případně otevřít samostatnou produkční Power BI/DWH fázi.

## Nezačínat znovu

Projekt už má hotovou architekturu, v1 flow i M11 dohledatelnost. Není potřeba přestavovat routing, datový model ani KPI engine, pokud nová business zpětná vazba neodhalí konkrétní rozpor.
