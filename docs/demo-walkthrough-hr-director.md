# Demo Walkthrough — HR Director

## Cíl průchodu

Ukázat HR Analytics jako rozhodovací nástroj, ne jen jako sadu grafů. Demo má během několika minut odpovědět na tři otázky: jaký je celkový stav, kde jsou největší rizika a co má HR dělat dál.

## Doporučený průchod

1. Otevřít `/` a začít HR Health Scorem.
2. Projít Top Alerts a zdůraznit rank 1-5, ownera, stáří problému a vysvětlení severity.
3. Přejít na `/akce` a ukázat timeline rail: tento týden / 14 dnů / měsíční review / další cyklus.
4. Z backlogu otevřít kontext nejvyšší priority nebo přejít na Retention jako referenční detail.
5. Z KPI karty ukázat 3 zóny: headline, insight, decision. U náborových KPI zdůraznit stage/channel/role drivery.
6. Otevřít Copilota a zvolit otázku k fluktuaci nebo leadership prioritám.
7. Přejít na `/operativa/esg` a ukázat Data Quality sloupec, aby bylo jasné, co je ready/mock/blocked.
8. Přejít na `/briefing`, zapnout náhled tisku a exportovat executive podklad do PDF.

## Message track

- Prototyp pokrývá všech 20 KPI z návrhu a všech 8 HR reporting sekcí.
- V1 prototyp je dokončený na 100 % pro prezentační demo; produkční Power BI řešení bude řešit reálné datové napojení a governance.
- Mock data záměrně ukazují realistické problémy, aby šlo otestovat rozhodovací tok.
- v2 Perfection Pass doplňuje rozhodovací vrstvu: ranking, owner, deadline, confidence, hypotézy a audit trail.

## v2 enhancements

- KPI karta je rozdělená na HEADLINE / INSIGHT / DECISION.
- Severity má explainable breakdown místo nejasného čísla.
- Top Alerts mají rank chip, ownera a stáří problému.
- Action Backlog má deadline timeline.
- Charty mají custom tooltipy, gradienty a jemný motion.
- Sparkline ukazuje hover bod a hodnotu.
- What Changed obsahuje cross-KPI hypotézy.
- Recruitment KPI ukazují stage/channel/role drivery.
- ESG tabulka ukazuje Data Quality pro všech 21 datapointů.
- Briefing má cover page a print preview.

## Navazující diskuse

- Které KPI mají být v první produkční vlně v Power BI.
- Kdo vlastní prahy a akční doporučení.
- Jaké reálné zdroje budou dostupné pro HRIS, payroll a recruitment.
