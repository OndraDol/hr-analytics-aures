# Next Session Handoff — HR Analytics AURES

Poslední aktualizace: 2026-04-26

## Aktuální stav — v2 hotová, M18/M19 QA doplněné

V1 prototyp i **v2 Perfection Pass** jsou hotové. M18 UX polish QA a M19 Presentation QA doplnily mobilní navigaci, briefing empty states, AURES token konzistenci a Playwright browser guardy. Projekt je ve stavu decision-ready executive cockpitu pro HR Directorku Kateřinu Topolovou.

**Master plán:** [`docs/plans/2026-04-25-v2-perfection-master-plan.md`](plans/2026-04-25-v2-perfection-master-plan.md) definuje 6 milníků M12–M17:

- **M12** Decision Support Layer — KPI hierarchy zóny, alerts ranking 1–5, action backlog timeline, threshold confidence overlay.
- **M13** AURES Visual Identity — sidebar branding, typografie upgrade, brand palette, KPI featured state.
- **M14** Charts & Motion — custom Recharts tooltipy, gradient fills, sparkline hover, threshold pulse, page enter animations.
- **M15** Drill-Down Intelligence — recruitment driver per stage/HM/channel, cross-KPI hypotheses, anomaly visibility, severity tooltip.
- **M16** Executive PDF Mastery + Operational Polish + ESG Audit Trail — McKinsey-grade PDF, print preview, ESG Data Quality column.
- **M17** Stabilizace v2 — smoke + a11y + dark mode review, walkthrough, PROJEKT_ZAZNAM, progress model.

**Další krok:** spustit plný `pnpm qa:visual` na Linux/macOS/Windows nebo CI, projít případné screenshot nálezy a teprve potom řešit Real Data Readiness / Power BI vendor handoff.

**Implementace:** v2 milníky reálně provádí **Codex** (OpenAI Codex/CLI). Master plán a navazující detailní plány jsou Codex-friendly (samostatné, bez závislosti na specifických nástrojích). Claude Code je primárně pro plánování a review.

## Aktuální stav

Prezentační prototyp v1 + M11 traceability pass je hotový na **100 %**. v2 Perfection Pass je také hotový na **100 %** (`lib/project/progress.ts`: M12–M17 dokončeno).

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
pnpm qa:visual
```

Výsledek po M19: lint a typecheck bez chyb, test suite 23 souborů / 83 testů, build 24 statických stránek. `pnpm qa:visual` v Termuxu korektně skipuje, protože Playwright browser binaries nejsou na Androidu podporované.

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

Pokračovat v **M19 Presentation QA / demo review**:

1. Ověřit desktop/tablet/mobile demo flow přes `/`, `/akce`, `/briefing`, `/sekce/retention`, `/analytika/recruitment-funnel`, `/operativa/esg`.
2. Držet změny úzké: jen prezentační UX, mobilní dostupnost, print/briefing a vizuální konzistence.
3. Validovat přes `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` a podle dostupnosti browseru `pnpm qa:visual`.

Poznámka: Termux/Android nepodporuje Playwright browser binaries, takže `pnpm qa:visual` zde pouze zahlásí skip. Plný screenshot QA běh spusť na Linux/macOS/Windows nebo v CI.

## Nezačínat znovu

Projekt už má hotovou architekturu, v1 flow i M11 dohledatelnost. v2 staví **na** v1 — refaktoruje KPI Card do zón, přidává AURES branding, prohlubuje drill-down. Není potřeba přestavovat routing, datový model ani KPI engine.
