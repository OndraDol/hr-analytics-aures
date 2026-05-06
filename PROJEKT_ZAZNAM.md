# HR Analytics / BI reporting — projektový záznam

> Živý pracovní dokument. Zapisujeme sem postupně pochopení požadavků, rozhodnutí, otevřené otázky, strukturu datasetu a další postup. Zdrojový podklad: `HR_reporting_ver2.xlsx`.

Poslední aktualizace: 2026-04-27

---

## Aktuální stav projektu (2026-04-27)

**v1 = 100 % hotová. v2 Perfection Pass + HR Overview UX Pass jsou implementované a stabilizované.**

**HR Overview UX Pass (2026-04-27):** rename "Přehled lidí" → "HR Overview", homepage z 6 panelů na 3 zóny (hero / 3 alert karty s mini timeline grafem / mapa oblastí), sekce/[slug] z 6 vrstev na 5 s plnošířkovým trend chartem, sparkline rebuild s viditelnými min/max + endpoint hodnotou + X osou + threshold line, kalibrace KPI thresholdů a recruitment cost generátoru pro realistickou Q1 2026 story (12 green / 7 amber / 1 red headline). Detail viz `docs/releases/v2-hr-overview-pass.md`.

**UX Cleanup Pass v3 (2026-04-27):** méně preskriptivních doporučení (KPI Decision zone skryta v simple variantě, sekční "Co udělat" → `<details>`), peopleHighlight panel s konkrétními jmény (Retention / Workforce-Movement / Succession), Recharts overflow guard (`min-w-0`), `max-w-screen-2xl` na hlavní layout, mobile sticky pills lišta sekcí, "Stav aplikace" widget odstraněn, password gate `AURESHR12345` přes `localStorage`. Detail viz `docs/releases/v2-ux-cleanup-pass.md`.

Webový prezentační prototyp v1 (M0–M11) je dokončený na 100 % (`lib/project/progress.ts`: 11/11 milníků, 100/100 procentních bodů). **v2 Perfection Pass** (M12–M17) je také dokončený a posouvá prototyp z „demo-ready" do „investment-ready" stavu z pohledu HR Directorky Marie Voršílkové.

**v2 master plán:** [`docs/plans/2026-04-25-v2-perfection-master-plan.md`](docs/plans/2026-04-25-v2-perfection-master-plan.md) — 6 milníků M12–M17:

- M12 Decision Support Layer (KPI hierarchy zóny, alerts ranking, action timeline, threshold confidence)
- M13 AURES Visual Identity (sidebar branding, typografie, brand palette, featured state)
- M14 Charts & Motion (custom tooltips, gradient fills, threshold pulse, stagger animations)
- M15 Drill-Down Intelligence (recruitment driver multi-dim, cross-KPI hypotheses, anomaly upgrade)
- M16 Executive PDF Mastery + Operational Polish + ESG Audit Trail
- M17 Stabilizace v2 (a11y, dark mode review, progress model, walkthrough)

Procento dokončenosti zůstává 100 % pro v1 prototyp; v2 se bude měřit samostatně přes nový `version: 'v2'` flag v progress modelu (definováno v M17).

Aktuální v2 stav v kódu:
- M12 Decision Support Layer hotovo: KPI zóny, severity breakdown, ranked alerts, timeline backlog, threshold confidence overlay.
- M13 Visual Identity hotovo: AURES tokeny, branded sidebar, orange action CTA, dynamičtější Health Score.
- M14 Charts & Motion hotovo: custom tooltipy, gradienty, sparkline hover, threshold pulse, page enter motion.
- M15 Drill-Down Intelligence hotovo v demo rozsahu: recruitment stage/channel/role drivery, cross-KPI hypotézy, anomaly flag.
- M16 Executive PDF + ESG hotovo v demo rozsahu: cover page, print preview, ranked briefing alerts, ESG Data Quality pro 21 datapointů.
- M17 Stabilizace hotovo: v1/v2 progress model, route smoke guard, walkthrough update, release notes a dark-mode policy.
- M18 UX polish QA hotovo: mobilní navigace, briefing empty states bez fake fallbacku, AURES token konzistence.
- M19 Presentation QA hotovo: Playwright konfigurace, desktop/mobile/briefing preview e2e guardy, `pnpm qa:visual` wrapper s Termux skipem.

Součástí dokončené v1 je:
- Executive Dashboard se zdravotním skóre, alerty, změnami a scorecardy sekcí I-VIII.
- Sekční dashboardy, Retention detail, analytické drill-downy a operativní pohledy.
- Demo Copilot, Action Backlog, PDF briefing přes print flow a demo walkthrough pro HR Directorku.
- Primární workbook `HR_reporting_ver2.xlsx` v kořeni repozitáře a traceability matrix `docs/traceability/hr-reporting-v2-traceability.md`.
- Stabilizační ověření: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm qa:visual` a HTTP smoke hlavních rout.

---

## 0) Upřesněný cíl projektu (2026-04-24)

**Cílem NENÍ postavit datový warehouse ani produkční reporting.** Cílem je:

1. Vytvořit **vizuální prototyp reportu** (webová aplikace, případně simulace PBI vzhledu), který:
   - ukáže HR Directorce, jak by finální BI reporting mohl vypadat,
   - slouží jako **zadání pro externího dodavatele reportingu**, který následně postaví produkční řešení v Power BI.
2. Prototyp pojede nad **mock daty** simulujícími věrohodnou firmu (CZ/SK/PL, ~automotive retail, struktura B0–B3).
3. Reálná data jsou k dispozici jen částečně (přehled zaměstnanců z EGJE, Recruitment reporty) — pro prezentační prototyp nedostatečná, proto mock.

Důsledky pro rozsah:
- Místo star schema, ETL a historizace řešíme **generátor věrohodných mock dat** + **frontend dashboard**.
- Místo automatizované produkce KPI řešíme **příběh reportu** (jak se uživatel pohybuje, co vidí, kde drilluje).
- Sekce 4 (datový model) a 5 (přístup) níže zůstávají jako *kontext pro dodavatele*, ale nejsou cílem této fáze.

### 0.1 Navrhované tech varianty prototypu

| Varianta | ➕ | ➖ |
|---|---|---|
| **A. Webová aplikace (Next.js/React + Recharts/ECharts + Tailwind)** ⭐ | Plná kontrola nad designem, interaktivita, snadné sdílení URL, vypadá „produktově". Vhodné jako persuasion tool. | Není to vizuálně 1:1 Power BI — může být otázka „proč to není v PBI?". |
| **B. Skutečný Power BI Desktop soubor s mock daty** | Nejblíže finálnímu výstupu dodavatele, HR Directorka vidí rovnou cílovou platformu. | Rigidnější design, závislé na PBI licenci pro sdílení, pomalejší iterace mock dat. |
| **C. Streamlit / Dash prototyp** | Rychlé postavení v Pythonu, dobré pro datovou vrstvu. | Vzhled „analytický", ne „BI produkt". Méně persuasive. |

Moje doporučení: **A** (webová appka s PBI-like vzhledem). Rychlá iterace, nejlepší UX pro prezentaci, HR Directorka snadno proklikává v prohlížeči. PBI dodá až dodavatel.

### 0.2 Rozsah mock dat (orientačně)

Firma cca **1 500–2 000 zaměstnanců**, 3 země (CZ/SK/PL), 5–7 divizí, několik desítek poboček, grade B0–B3. Historie 24–36 měsíců (pro MoM / YoY trendy). Konzistentní napříč fakty (HC ↔ payroll ↔ nábor ↔ absence).

### 0.3 Analytická filozofie — „thinking layer", ne „viewer" (2026-04-24)

**Nechceme BI jako tabulky a grafy. Chceme BI, které za uživatele přemýšlí.** Každá metrika má vědět:

1. **Kde je?** (hodnota a trend)
2. **Kde by měla být?** (target + prahy green/acceptable/red z `NÁVRH_do_BI`)
3. **Je to v pořádku?** (status + barevná signalizace, hned na první pohled)
4. **Proč taková je?** (driver analysis — co/kdo do metriky nejvíc přispěl, kde se to zlomilo)
5. **Co se změnilo?** (MoM / YoY delta, anomálie, nové red flags od minule)
6. **Co s tím?** (doporučená akce — z `Action if Off Track` + kontextualizovaná situací)

**Implementace analytické vrstvy (kombinace, ne volba):**

| Vrstva | Co dělá | Technologie |
|---|---|---|
| **Rule-based scorecarding** | Porovnání hodnot s prahy, výpočet trendu, status (🟢/🟡/🔴), delta vs. předchozí období / budget / target. | Deterministické výpočty v JS/TS. |
| **Driver analysis** | Segmentace metriky (podle divize / země / grade / tenure) a identifikace **top přispěvatelů** ke změně. | Statistika + ranking. |
| **Anomaly flagging** | Detekce výkyvů oproti vlastní historii (z-score, výraznější odchylky). | Rolling statistics nad mock historií. |
| **Template-driven narratives** | Automaticky generovaný textový komentář („Fluktuace v divizi Sales CZ vzrostla MoM o 3,2 pp, překročila červený práh 32 %. Hlavním driverem jsou odchody z pozic Junior Sales — 14 z celkových 22."). | Šablony vyplněné z dat — deterministické, žádné halucinace. |
| **Action suggestions** | Napojení doporučení z `Action if Off Track` na aktuální stav. Kontextualizováno („Protože driver X = Y, navrhujeme Z."). | Rule-based + šablony. |
| **(volitelně) LLM insights** | Sofistikovanější shrnutí / hypotézy. **Není nutné pro prototyp** — vnímám jako nice-to-have. | Claude / GPT API. |

### 0.4 Navrhovaná architektura obrazovek

```
1. Executive Dashboard (landing)
   ├── Health Score hero (% KPI v zelené, vážené prioritou)
   ├── Top 5 Alerts (nejhorší / nejrychleji se zhoršující)
   ├── What's changed this month (nové red flags, zlepšení)
   └── Scorecards sekcí I–VIII (každá = 1 card, mini trend + status)

2. Per-section views (I–VIII)
   ├── I.    HR Statistics — HC/FTE, demografie, gender pay gap, DEI
   ├── II.   Workforce Movement — nástupy/odchody per země/divize
   ├── III.  Cost & Structure — Wage KPI, CAP KPI, HC/FTE vs budget, Avg wage
   ├── IV.   Recruitment — TTF, TTF critical, Time to Productivity, CpH, Quality, Employer Evaluation
   ├── V.    Retention — Fluktuace (overall + critical), důvody odchodů
   ├── VI.   Succession — Succession rate, kritické role s / bez nástupce
   ├── VII.  Engagement — eNPS, trendy, segmenty
   └── VIII. Talent & Growth — hodnocení, růstový potenciál, IM / povýšení

3. Cross-cutting detail views (drill-downs, analyticky nejhlubší)
   ├── Attrition analytics — příčiny, high-risk segmenty, cohort analysis
   ├── Recruitment funnel — CV→interview→offer→hire, bottlenecks
   ├── Compensation & pay gap — distribuce mezd, gap po segmentech
   └── Absence & coverage — nemocnost, dovolené, pokrytí směn

4. Operational views (z 'NÁVRH' sheet — co HR aktuálně posílá ručně)
   ├── Hired & Fired (týdenní / měsíční pro IT, vedení)
   ├── Org Chart
   └── Vacation balances
```

### 0.5 Standard KPI cardu (anatomie)

Každá KPI v reportu má stejnou strukturu — konzistence vytváří důvěru:

```
┌─────────────────────────────────────────────────────────┐
│  🔴  FLUKTUACE — KRITICKÉ POZICE                        │
│  ─────────────────────────────────────────────────      │
│  12,4 %          ▲ +2,1 pp MoM    ▲ +4,8 pp YoY        │
│  Cíl 0 % | Zelená <5 % | Akceptovatelné <10 %           │
│                                                         │
│  📉 ══════════════════ sparkline 12M ═════════════      │
│                                                         │
│  ⚠  Metrika překročila červený práh 10 %.              │
│     Hlavní přispěvatelé (MoM):                          │
│     • Divize Sales CZ:  +3 odchody (Key Account)        │
│     • Divize OPS SK:    +2 odchody (Team Leader)        │
│                                                         │
│  💡 Doporučená akce: Retence klíčových lidí             │
│     1:1 review s nadřízenými u rizikových segmentů.     │
│                                                         │
│  [ Otevřít detailní analýzu ▸ ]                         │
└─────────────────────────────────────────────────────────┘
```

Pět deterministických vrstev analytiky v jednom cardu: hodnota → trend → prahy → driver → akce. **Toto je ten „ne jen zobrazovač"**.

## 1) Vstupy, které máme k dispozici

Soubor `HR_reporting_ver2.xlsx` obsahuje 7 záložek. Stručný obsah:

| Záložka | Obsah | Váha pro projekt |
|---|---|---|
| `NÁVRH_do_BI` | **Hlavní vstup** — vize HR Director: 20 KPI × 17 atributů (příjemce, priorita, zdroj, definice, vzorec, frekvence, vlastník, analýza rizik, business impact, cíl, prahy green/acc/red, trend, akce při neplnění, sekce BI I–VIII). | **Klíčová** |
| `Návrh_rozpad` | Rozpad tematických oblastí reportingu: HC/FTE, Recruitment, Fluktuace, Výkon & rozvoj, L&D, Engagement, Absence, C&B, DEI/ESG, HR operativa. | Vysoká |
| `NÁVRH` | Seznam 10 cílových reportů (Nástupy/Odchody, Fluktuace, HC různé pohledy, Interní přestupy, Org chart, Zůstatky dovolených, eNPS, HR měsíční report pro vedení, ESG, ECBR). | Vysoká |
| `CZ` | Česká verze KPI matice (kratší, 14 KPI). | Kontext |
| `HR Reporty_actual` | **Inventura as-is** — 76 reportů, které HR aktuálně produkuje (příjemci, frekvence, časová dotace, vlastník, typ ad-hoc/definované, poznámky k automatizaci). | Vysoká pro ROI |
| `Vojta_all` | Detail reportů Vojtěcha Smějsíka (cca 47 položek, většina opakovaně). | Kontext |
| `ESG reporty_actual` | 21 povinných ESG metrik (People: employees, employment practices, training, DEI, H&S + ESRS alt. datapoints). | Střední |

## 2) Co jsem z podkladu pochopil

### 2.1 Záměr
HR Director chce **komplexní BI reporting HR oddělení**, který:
- nahradí velkou část ručních / ad-hoc reportů (desítky hodin měsíčně),
- pokryje strategické KPI pro vedení (B0–B3), ESG povinnosti i operativní přehledy (dovolené, směny, nemocnost),
- bude mít jasné cíle, prahy (green / acceptable / red), trendy (MoM, YoY, QoQ) a akce při neplnění,
- bude strukturován do 8 BI sekcí (I. HR statistiky → VIII. Talent & Growth).

### 2.2 Cílové KPI (z `NÁVRH_do_BI`)

| # | Sekce | KPI | Priorita | Zdroj | Frekvence | Vlastník |
|---|---|---|---|---|---|---|
| 1 | I. | HR statistics (HC, FTE, demografie, gender pay gap, DEI) | 1 | HRIS | ročně | HR reporting |
| 2 | II. | Employees in/out per division, country | 1 | HRIS | měsíčně | HR reporting |
| 3 | — | Untaken Holiday | 1 | Payroll | měsíčně | Payroll |
| 4 | — | Sickness rate | — | Payroll | měsíčně | Payroll |
| 5 | — | Shifts coverage | — | Payroll | měsíčně | Payroll |
| 6 | III. | Wage KPI | — | Payroll | ročně | Payroll |
| 7 | — | CAP KPI | — | Payroll | ročně | HR reporting |
| 8 | — | HC, FTE per division | 1 | HRIS | ročně | HR reporting |
| 9 | — | Avg. wage | 1 | Payroll | ročně | Payroll |
| 10 | IV. | Time to fill | — | Recru reporting | měsíčně | Recruiting |
| 11 | — | TTF critical roles | — | Recru reporting | — | — |
| 12 | — | Time to Productivity | — | Recru reporting | čtvrtletně | Recru & Business |
| 13 | — | Cost per Hire | — | Recru reporting | ročně | Recruiting |
| 14 | — | Quality of hiring | — | Recru reporting | čtvrtletně | Recruiting |
| 15 | — | Employer Evaluation | — | Recru reporting | měsíčně | Recruiting |
| 16 | V. | Fluctuation rate | 1 | HRIS | pololetně | HR reporting |
| 17 | — | Fluctuation rate — critical positions | 1 | HRIS | pololetně | HR reporting |
| 18 | VI. | Succession rate | — | Talent Pool | čtvrtletně | Training |
| 19 | VII. | eNPS | — | Survio | ročně | (bez vlastníka) |
| 20 | VIII. | Talent & Growth potential | — | Annual appraisal | ročně | Training |

**Pilotní rozsah (Priorita 1):** HR statistics, Employees in/out, HC/FTE per division, Avg. wage, Fluctuation rate (overall + critical), Untaken Holiday.

### 2.3 Datové zdroje (dle záložek)
- **HRIS** — pravděpodobně EGJE (zmíněn napříč záložkou `Vojta_all`). Master pro HC/FTE, demografii, org strukturu, evidenci nástupů/odchodů.
- **Payroll** — mzdy, nemocnost, dovolené, směny.
- **Recru reporting / ATS** — nábor, funnel, TTF, náklady.
- **Talent Pool** — nástupnictví, kritické role.
- **Survio** — eNPS.
- **Annual appraisal** — roční hodnocení, talent & growth.
- **Edunio** — tréninky (zmíněno v HR Reporty_actual).

### 2.4 Kontext společnosti (interpretace, k potvrzení)
- Působnost **CZ / SK / PL** (opakovaně zmíněné `HR_dist (CZ, SK, PL)`).
- Automotive / retail (pozice *výkupčí*, *F&I = Finance & Insurance*, pobočková struktura, směny).
- Grade struktura **B0–B3** (zřejmě seniority / management levels = příjemci).
- Existuje **PowerBI** a proběhly dílčí automatizace (TTH, Vacancy report).

## 3) Otevřené otázky (čím dál tím detailnější)

### A. Kontext a cíl projektu
1. **Kdo je HR Director** — autor návrhu (potřebujeme jméno pro schvalování priorit)? Marie Voršílková (potvrzeno 2026-05-06). Primární business owner projektu.
2. **Cílová platforma** — PowerBI (nad stávajícím modelem), nebo budujeme nový DWH / semantic layer (Fabric, Databricks, Snowflake, …)? Pokud PowerBI, existuje dataset / dataflow nad kterým stavíme?
3. **Rozsah zemí v 1. fázi** — jen CZ, nebo rovnou CZ+SK+PL? (každá země může mít odlišné zdroje / číselníky.)
4. **Časový rámec / milníky** — existuje deadline (ESG reporting za FY, roční hodnocení, atd.)?
5. **Success kritéria** — čím poznáme, že pilot uspěl? (Např. úspora X hodin měsíčně, X automatizovaných reportů, X KPI v BI.)

### B. Recipients (B0–B3) a governance
6. Jak přesně mapovat B0–B3 na pozice? (B0 = CEO + C-level? B1 = divisional head? B2 = senior manager? B3 = team leader?)
7. Kdo má na co práva (row-level security)? Může divizní manažer vidět jen svou divizi? Cross-country viditelnost?
8. Kdo vlastní prahové hodnoty („to be informed" u řady KPI) — kdo je doplní a kdo je reviduje?

### C. Data a definice
9. **Master data** — co je systém pravdy pro zaměstnance (employee_id), pozici (position_id), organizační strukturu? Jak řešíme neshody EGJE vs. PowerBI vs. Edunio (zmíněno v `HR_Reporty_actual R26`)?
10. **Definice "kritická pozice"** — existuje udržovaný číselník (pozice, role, či osoby)? Kdo jej spravuje a jak často se mění?
11. **HC vs FTE** — definice: započítávají se MD/rodičovská, dlouhodobé nemoci, externisté (IČAři), brigádníci?
12. **Fluktuace** — čitatel/jmenovatel: odchody / průměrný HC v období, nebo / počáteční HC? Zahrnujeme dobrovolné i nedobrovolné? (Návrh_rozpad to rozlišuje.)
13. **Avg. wage** — hrubá / super-hrubá / total cost? Základ, nebo včetně bonusů / benefitů?
14. **Gender pay gap** — metodika (mean vs median, raw vs adjusted)?
15. **Time to fill vs Time to hire** — definice ve zdroji (ATS): kdy startuje počítadlo (schválení RQ / publikace inzerátu)? Kdy končí (akceptace offeru / nástup)?
16. **Cost per hire** — které náklady? (interní čas HR, inzerce, agentury, nástupní bonus?)
17. **Quality of hire** — „rating v kompetenčním modelu + early fluctuation rate" — jak přesně poskládat do jedné metriky?

### D. Akronymy a specifika ve Excelu
18. **CAP KPI** — co přesně znamená (Capacity? Capex personnel? něco jiného)?
19. **B0 v „Hiring freeze for BO"** (R9) — Back Office?
20. **ECBR** (R10 v NÁVRH, R25 v HR_Reporty_actual) — co je to za reporting a kdo je adresát?
21. **Kompetenční model** — je to produkt (ATS) nebo interní nástroj?

### E. Technické
22. **Historizace** — chceme denní/měsíční snapshoty (SCD2)? Bez toho nelze trendy YoY/MoM smysluplně počítat zpětně.
23. **Jak získat data z EGJE** — existuje API / export / databázový přístup? Frekvence aktualizace?
24. **ESG reporting** — má vlastní data flow do KPMG, integrovat do stejného datasetu, nebo odlišné (ESRS má vlastní pravidla)?
25. **ECB / ČNB / Insurance / Audit** reporty v `HR_Reporty_actual` — mají být také součástí BI, nebo zůstávají jako exporty ze stejného datasetu?

## 4) Úvodní představa datasetu (návrh k diskusi)

Navrhuji **star schema** (dimenze + faktové tabulky) s denním/měsíčním snapshotem. Není to finální, je to odpich pro diskusi:

### 4.1 Dimenze
- `dim_employee` (SCD2) — employee_id, full_name, gender, birth_date, nationality, education, hire_date (first), tenure_start
- `dim_position` — position_id, position_name, job_family, grade (B0–B3), critical_flag, country
- `dim_org_unit` — org_unit_id, country, division, department, cost_center, parent_unit_id
- `dim_manager` — manager_id (→ employee), management_level
- `dim_date` — den, měsíc, kvartál, rok, FY flag, pracovní den
- `dim_contract_type` — HPP / DPP / DPČ / IČO / agentura, full-time / part-time
- `dim_kpi` — kpi_code, name, owner, section, target, green_thr, acc_thr, red_thr, direction (↑/↓/flat)

### 4.2 Faktové tabulky
- `fact_employee_snapshot_daily` — stav k datu (active, on_leave, maternity, sick_long_term), úvazek (FTE), grade, org_unit, manager, contract_type, zákl. mzda
- `fact_employee_event` — hire / termination (voluntary / involuntary) / internal_move / promotion / probation_end, reason_code
- `fact_payroll_monthly` — employee × month × wage_component (base / variable / benefits / non-personal), cost center
- `fact_recruitment_requisition` — RQ lifecycle (approved → published → offer → accepted → start), critical_flag
- `fact_recruitment_funnel` — applications → interviews → offers → hires per channel
- `fact_absence_daily` — sick / vacation (planned / taken / remaining) / other
- `fact_shifts_daily` — planned vs. covered (u pozic, kde má smysl)
- `fact_training` — employee × course × hours × cost × completion
- `fact_performance_eval` — employee × cycle: perf_rating, growth_potential, talent_flag, successor_for (position_id)
- `fact_survey_enps` — cycle × segment: promoters / passives / detractors / responses / invited
- `fact_hs_accident` — incident × severity × type

### 4.3 Odvozené (KPI) výpočty
KPI z `NÁVRH_do_BI` se skládají jako míry (measures) v sémantickém modelu nad uvedenými fakty. Prahové hodnoty a cíle drží `dim_kpi`, což umožňuje konzistentní vizualizaci (semafor) napříč dashboardy.

## 5) Úvodní představa postupu

Navrhuji 3 možné přístupy, z nich doporučuji **B**:

**A. Big Bang — postavit celý warehouse a všech 20 KPI najednou.**
- ➕ Koherentní architektura, žádné refaktory.
- ➖ 6–9 měsíců bez dodaného byznys přínosu, vysoké riziko změn zadání.

**B. Iterativně po sekcích, pilot na Priorita 1.** ⭐ doporučeno
- Postavit základ modelu (dim_employee, dim_date, dim_org_unit, fact_employee_snapshot, fact_employee_event) a nad tím sekce **I + II + V** (HC/FTE, Employees in/out, Fluktuace + kritické pozice) + **Untaken Holiday**.
- ➕ Rychlé dodání hodnoty (2–3 měsíce), brzká zpětná vazba od HR Director i divizí, postupné rozšiřování.
- ➖ Vyžaduje disciplínu, aby se architektura dál neroztahala ad-hoc.

**C. Rozšíření PowerBI reportů bez DWH.**
- ➕ Nejrychlejší.
- ➖ Neškáluje, duplikovaný business logic, problém s historizací a konzistencí KPI napříč reporty. Zachovává současnou bolest (Edunio vs. PowerBI vs. EGJE).

### 5.1 Navrhovaný milník 0 (než začneme kódovat)
1. **Kick-off s HR Director** — odsouhlasit pilotní rozsah (P1 KPI, země, recipients).
2. **Data discovery** — přístup k EGJE, Payroll, ATS, Survio; vzorky dat; SLAs.
3. **Definice glossary** — jednotné definice HC, FTE, fluktuace, kritické pozice (viz otevřené otázky C).
4. **Master data audit** — jaký je současný stav konzistence (EGJE ↔ PowerBI ↔ Edunio), kde jsou opravy potřeba (zmíněno opakovaně v `HR_Reporty_actual`).
5. **Spec + plán** — detailní spec pro pilot, rozepsaný implementační plán.

## 6) Rozhodnutí (log)

| Datum | Rozhodnutí | Kdo | Odůvodnění |
|---|---|---|---|
| 2026-04-24 | Cíl = **prototyp / demo**, ne produkce. Produkční reporting postaví externí dodavatel v Power BI. | Uživatel | Prototyp slouží jako brief pro dodavatele a persuasion tool pro HR Directorku. |
| 2026-04-24 | **Rozsah = plné komplexní demo** (všechny sekce I–VIII + cross-cutting + operational). | Uživatel | „Musí to být fakt komplexní." Částečné demo by neodráželo skutečnou ambici. |
| 2026-04-24 | **Charakter = analytika, ne zobrazovač.** Implementace přes rule-based scorecarding, driver analysis, anomaly flagging, template narratives, action suggestions. | Uživatel | „Nechce jen zobrazovač dat, ale opravdovou analytiku." |
| 2026-04-24 | **Jazyk prototypu = čeština.** | Uživatel | Primární publikum je HR Directorka, česko-mluvící. |
| 2026-04-24 | **LLM insights = ano, včetně reálné implementace** (ne jen mock). | Uživatel | „Jděme i do LLM insights, proč ne." |
| 2026-04-24 | **REVIZE: LLM = mock, ne hlavní feature.** Uživatel nemá Anthropic API klíč. Ručně psané „jakoby AI" komentáře v JSON. Architektura zůstává LLM-ready — později se dá přepnout na živé API. | Uživatel | „Nemám API klíč, teď jen mock demo, nedělej z toho hlavní featuru, uvidíme." |
| 2026-04-24 | **Časový rámec: volný, důraz na kvalitu.** | Uživatel | „Času dost, pojďme to udělat mega kvalitní." |
| 2026-04-24 | **Vizuální směr = A (Modern SaaS Analytics).** | Uživatel | Schváleno. |
| 2026-04-24 | **Tech stack schválen:** Next.js 15 + TS + Tailwind v4 + shadcn/ui + Recharts + Framer Motion + Zustand + TanStack Table + Vercel hosting. | Uživatel | Schváleno. |
| 2026-04-24 | **Architektura MUSÍ být připravena na budoucí přísun reálných dat** (Data Provider pattern, swap mock ↔ real bez změny UI). | Uživatel | „Mysli na to, že v budoucnu dodám alespoň část reálných dat." |
| 2026-04-24 | **Firma = AURES Holdings a.s.** (ne fiktivní). | Uživatel | Reálné jméno, reálný vizuál, reálná data poskytnuta. |
| 2026-04-24 | **Paleta:** Deep Blue 700 (`#1d4ed8`) primary + Orange 500 (`#f97316`) akcent. Light default + dark switcher. | AI / Uživatel | Deep blue = AURES corporate, Orange = AAA AUTO heritage. |
| 2026-04-24 | **CZ terminologie = jednoduchá, srozumitelná** (např. „doba do obsazení" místo „time to fill"). Glossary draft v specu. | Uživatel | „Raději se džme jednodušších českých výrazů a termínů, ať je to pochopitelné." |
| 2026-04-24 | **Reálná data přijata** — dostupná jako kostra (org, události, nábor). Zbytek fakt mock-generovaný konzistentně. | — | Viz sekce 8 a update 6 ve specu. |
| 2026-04-24 | **Review body = po milnících 3, 5, 9.** | Uživatel | |
| 2026-04-24 | **Frontend design** — použijeme `frontend-design` skill při implementační fázi. `writing-plans` skill pro rozpis implementace. | AI | Dle superpowers skills best practice. |
| 2026-04-24 | **Data strategie = hybrid.** Reálná data (pokud je uživatel vytáhne z EGJE a ATS) slouží jako *kostra* (org struktura, pozice, employee master); ostatní fakta (payroll, absence, nábor funnel, performance, eNPS) dogenerujeme mock. | Uživatel | Reálná data nestačí („jen přehled zaměstnanců + recruitment reporty"); hybrid zajistí věrohodnost struktury a plnost pro všech 20 KPI. |

## 7) LLM insights — strategie implementace (2026-04-24)

LLM insights můžeme realizovat na třech úrovních. Doporučuji kombinaci **A + C** (pre-generated per KPI + on-demand Copilot). Všechny tři jsou reálné.

| Úroveň | Co dělá | Implementace | Náklady | Deterministika |
|---|---|---|---|---|
| **A. Pre-generated per KPI** ⭐ | Pro každou KPI v aktuálním stavu mock dat vygenerujeme **jeden krátký LLM komentář** (2–4 věty), uložíme do JSON, v UI se zobrazuje vedle rule-based narrativu. Přidává „měkké" hypotézy („Tento pokles může souviset s..."). | Při build-time script volá Claude API se strukturovanou promptou + KPI daty, výsledek se cacheuje. | Jednorázové pár desetikorun. | Deterministické po build. |
| **B. Mock LLM (ručně psané)** | Ručně napsané komentáře, které vypadají jako od LLM. Žádné API. | Píše se ručně do JSON. | 0 Kč, jen čas. | Plně deterministické. |
| **C. Live Copilot (on-demand)** ⭐ | Sidebar nebo chat UI kde se HR Directorka přirozeně ptá („Proč roste fluktuace v Sales?"), LLM dostane kontext dat a odpoví. | Live volání Claude API s RAG-like kontextem aktuálního filtru / KPI. | Za každou odpověď pár haléřů. | Nedeterministické, ale ohromně „wow" pro demo. |

**Doporučený stack:** Claude API (Claude Sonnet 4.6 pro pre-generated komentáře, případně Opus 4.7 pro Copilot když potřebujeme nejchytřejší odpovědi). Prompt caching na fixní kontext (definice KPI, prahy) = levnější a rychlejší.

### 7.1 Ochrana proti halucinacím
- LLM dostává **deterministicky spočtená čísla v promptě** (už hotová). Nepočítá, jen interpretuje.
- Šablona promptu je zamčená: *„Na základě těchto čísel napiš 2–4 věty interpretace. Nevymýšlej nová čísla. Pokud chybí data, řekni to."*
- V UI vždy **LLM komentář vedle rule-based narrativu** — rule-based je kotva pravdy.

## 8) Data status — reálná data přijata (2026-04-24, 15:47)

Uživatel do adresáře nahrál 3 exporty. **Staly se kostrou datového modelu**, zbytek doplníme mockem.

| Soubor | Obsah | Rozsah | Role |
|---|---|---|---|
| `Nastupy_vystupy.xlsx` | Workforce events (nástupy + odchody), sheet `Osb17` | 17 932 událostí (9 152 nástupů + 8 780 odchodů), **2016–2026** (10 let) | **Kostra** pro HC, fluktuaci, tenure, movement. |
| `Staffplan.xlsx` | Aktuální staff plan — pozice × divize × FTE Cap vs Actual, sheet `Con02faaa` | **2 182 pozic**, **206 departmentů**, Cap 1 864 FTE, Actual 1 735 FTE, **vacancy rate 9 %** | **Kostra** pro org strukturu, HC/FTE per divize, kritické pozice, succession. |
| `recruitment_report.xlsx` | Hiring processes, interviews, sources | **7 869 hiring**, 5 000+ interviews, 10 klientů/entit, **15+ sources** (Prace.cz, Profesia.sk, AAA Career, …), gender split | **Kostra** pro Recruitment sekci (TTF, funnel, sources, Employer Eval). |

**Reálné AURES parametry zjištěné z dat:**
- Země: CZ + SK + PL + HU + DE (Driverama GmbH).
- Entity: Aures Holdings, Autocentrum AAA Auto, AAA Auto SK/PL/HU, Mototechna, Driverama (více entit), Auto Diskont.
- Divize: OPS (Bazaar — Helpers + Drivers), SELLING, BUY, F&I, Call Centre, Customer Experience, Marketing, + podpůrné.
- Regionální rozdělení: Region Praha, Region 1/2/3/4 CZ.
- Pracovní poměry: PP (~60 %), DPP (~38 %), DPČ (~2 %).

**Co stále mock:** payroll, absence, eNPS, performance, training, accidents, succession plán, grade B0–B3 (odvodíme heuristikou), kritičnost pozic (odvodíme heuristikou).

**Rozhodnutí: NEČEKÁME na další data.** S tím, co máme, je datový základ pevný. Uživatel paralelně doplní mock, integrace proběhne v implementaci.

## 11) Stav implementace (2026-04-24 23:20 UTC)

**GitHub:** https://github.com/OndraDol/hr-analytics-aures (private, branch `main`)

**Hotovo:**
- ✅ M0 kompletní — Next.js 15 App Router + strict TypeScript + Tailwind v4 + Geist/Instrument Serif fonty + AURES paleta (Deep Blue + Orange) light/dark tokeny + Vitest setup + runtime/dev dependencies.
- ✅ M1 kompletní — doménové typy (`lib/types.ts`), 3 Excel parsery (Staffplan, Nastupy_vystupy, recruitment_report), pseudonymizace jmen, grade/critical heuristiky, mock generátory, `DataProvider`, `MockDataProvider`, `gen:data`, `check:data`.
- ✅ ESLint 9 / Next.js 15 flat config compatibility vyřešena (FlatCompat).
- ✅ Data pipeline běží nad reálnou kostrou: 2 182 pozic, 17 932 workforce eventů, 7 869 recruitment řádků, 10 362 zaměstnanců a konzistentní mock fakta.
- ✅ Generované TS moduly jsou memory-friendly (`JSON.parse` payload), aby `typecheck`/`test` nepadaly na OOM v Termuxu.

**Kompletní verifikace:** `pnpm gen:data`, `pnpm check:data`, `pnpm lint`, `pnpm build`, `pnpm typecheck`, `pnpm test` — **všechno zelené**.

**Aktuální rozpracování:** žádné v M1. Další na řadě je M2 — KPI core.

**Navazování z jiné session / mobilu:**
1. `git clone https://github.com/OndraDol/hr-analytics-aures` → `pnpm install`
2. `pnpm gen:data` — vygeneruje lokální `lib/data/generated/*.ts` moduly (ignorované gitem)
3. `pnpm check:data && pnpm test` — ověří konzistenci a test suite (39 testů)
4. Pokračuj plánem M2 — KPI katalog + analytická vrstva.

**Otevřené drobnosti:**
- Historická poznámka o chybějícím workbooku je uzavřená. `HR_reporting_ver2.xlsx` je od M11 dostupný v kořeni repozitáře a je primární zdroj pravdy pro traceability.

## 9) LLM revize — implementace bez API (2026-04-24)

Místo živých volání Claude API použijeme **pre-written „AI insights"** v JSON. V UI to vypadá jako AI vrstva, ale je to ručně napsaný text per KPI / per scénář mock dat.

- Pro každou KPI v aktuálním snímku mock dat napíšeme 1–3 insight varianty (2–4 věty, „AI-sounding" tón).
- UI zobrazuje ikonou ✨ a badge „AI Insight", vedle tvrdého rule-based narrativu.
- Pro Copilot (sidebar / chat) připravíme 8–12 pre-canned dotazů + odpovědí, demo uživatel klikne, zobrazí se „odpověď jako od AI".
- **Architektura zůstává API-ready** — v kódu je interface `getAIInsight(kpiContext) → Promise<string>`, který v demo módu čte z JSON, v budoucnu může volat Claude API bez změny UI.

## 10) Vizuální směr a technologický stack — návrh k diskusi (2026-04-24)

### 10.1 Tři možné vizuální směry

| Směr | Reference | Charakter | Proč ano / proč ne |
|---|---|---|---|
| **A. „Modern SaaS Analytics"** ⭐ | Vercel Analytics, Dub.co, Linear Insights, Posthog | Čistě, prostorové, jemné gradienty, tlusté číslice, decentní animace, dark mode optional. | ➕ Vypadá jako drahý produkt, „wow" faktor. ➖ Není to Power BI look. |
| **B. „Executive Briefing"** | Bloomberg Terminal + McKinsey deck | Hustá data, tabulky, málo whitespace, profesionálně vážné, serif + sans kombo. | ➕ Důvěra, C-level serious. ➖ Pro HR Directorku možná až moc „tvrdé". |
| **C. „Near Power BI"** | Náhled Power BI dashboardů | Imituje PBI — modro-šedá paleta, karty s KPI, klasické grafy. | ➕ HR Directorka vidí „ah, takhle to bude v PBI". ➖ Omezuje kreativitu, svazuje ruce, ztrácí persuasion. |

**Doporučuji A.** Důvody:
1. Demo má nadchnout, ne přesně imitovat PBI (to udělá dodavatel).
2. Moderní SaaS vzhled podpoří dojem „chytrého" produktu → vrstva analytiky uvěřitelnější.
3. Je jednoduché přepnout na firemní barvy / branding, pokud bude potřeba.

### 10.2 Technologický stack (návrh)

| Vrstva | Volba | Proč |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Produkční kvalita, dobré DX, snadné nasazení (Vercel zdarma pro demo). |
| Styling | **Tailwind CSS v4** | Rychlý iterativní design. |
| Komponenty | **shadcn/ui** (Radix primitives) | Přístupné, nestylované, přesně padnou do designu. |
| Grafy | **Recharts** + `recharts-to-png` pro export | Flexibilní, široká nabídka, React-native. |
| Ikony | **Lucide** | Konzistentní, krásné. |
| Animace | **Framer Motion** (decentně) | Drobné přechody dodají premium dojem. |
| State | **Zustand** (pro globální filtry) | Minimální, bez boilerplate. |
| Tabulky | **TanStack Table** | Pro drill-downy a detaily s řazením / filtrováním. |
| Mock data | **TypeScript generator** s deterministickým seedem | Reproducibilní výsledky (stejná čísla při každém buildu). |
| Fonty | **Geist Sans / Inter** + **Instrument Serif** pro akcenty | Moderní, čitelné, v češtině bezproblémové (diakritika). |
| Hosting / sdílení | Vercel (preview URL) | Uživatel pošle HR Directorce odkaz, žádná instalace. |

### 10.3 Co naopak NEPOTŘEBUJEME (YAGNI)

- Autentizaci / role / RLS (je to demo).
- Backend / databázi — všechno statické JSON + TS moduly.
- Real-time / webhooky.
- Internationalization framework (jazyk je CZ-only).
- Testing framework nad rámec základu (smoke test per sekce stačí).

## 11) Další kroky

1. **Schválit vizuální směr (A / B / C)** a tech stack — vede k spec.
2. Paralelně: uživatel pokračuje s pokusem získat reálná data z EGJE + Recruitment.
3. **Napsat spec** (`docs/specs/2026-04-24-hr-analytics-prototype.md`): detail všech obrazovek, KPI katalog s prahovými hodnotami (z `NÁVRH_do_BI`), mock data schema, narrativní šablony, AI insight vzory, user journey.
4. **Spec review** uživatelem.
5. **Implementační plán** s milníky (kostra → pilotní sekce end-to-end → rozšíření → polish).

## 7) Další kroky

1. Projít tento dokument s uživatelem, opravit moje nesprávná pochopení.
2. Projít otevřené otázky (sekce 3), dohodnout, které zodpoví uživatel a které je třeba eskalovat na HR Director / IT.
3. Schválit pilotní rozsah a přístup.
4. Vytvořit samostatný **spec** pro pilot a **plán implementace**.

## 12) Stav implementace — M2 KPI core (2026-04-25 06:15 UTC)

**Hotovo:**
- ✅ `lib/kpi/catalog.ts` — katalog všech 20 KPI se sekcí, prioritou, zdrojem, definicí, vzorcem, prahy, trendem a doporučenou akcí.
- ✅ `lib/analytics/kpi-evaluator.ts` — výpočet hodnoty, statusu, trendu, delta vs. target a 12M sparkline.
- ✅ `lib/analytics/driver-analyzer.ts` — top divizní přispěvatelé změny.
- ✅ `lib/analytics/anomaly-detector.ts` — z-score anomaly flag.
- ✅ `lib/analytics/narrative-generator.ts` — český rule-based narrativ.
- ✅ `lib/analytics/action-recommender.ts` — doporučená akce z KPI katalogu, doplněná o top driver.
- ✅ `lib/analytics/kpi-engine.ts` — `buildKpiCardModel()` jako jeden entrypoint pro UI KPI kartu.
- ✅ `lib/ai/insight-provider.ts` + `content/ai-insights/kpi-insights.json` — mock AI insight provider.

**Ověřeno cíleně:**
- `pnpm test tests/kpi/catalog.test.ts tests/analytics/kpi-evaluator.test.ts tests/ai/insight-provider.test.ts`
- `pnpm typecheck`

**Další na řadě: M3 — referenční sekce V. Retention**
- layout shell + navigace,
- KPI card komponenty,
- stránka sekce Retention,
- Attrition drill-down,
- napojení na `buildKpiCardModel()` a `mockDataProvider`.

## 13) Stav implementace — M3 Retention reference section (2026-04-25 06:35 UTC)

**Hotovo:**
- ✅ Root stránka už není placeholder; ukazuje stav prototypu a vede do Retention.
- ✅ `/sekce/retention` — první skutečná dashboard stránka.
- ✅ `AppShell` — základ navigace, sticky header, demo snapshot.
- ✅ KPI karta s hodnotou, statusem, trendem, sparkline, narrativem, doporučenou akcí a AI insightem.
- ✅ Retention trend graf a segment graf přes Recharts.
- ✅ `lib/analytics/retention-summary.ts` — segmenty, odchody, klíčové odchody, risk score.
- ✅ Recharts se renderují až po client mountu, aby build neměl warningy o nulové velikosti.

**Ověřeno:**
- `pnpm gen:data`
- `pnpm check:data`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` (48 testů)
- `pnpm build`

**Další na řadě: M4 — Executive Dashboard**
- HR Health Score,
- Top Alerts,
- What Changed,
- scorecards sekcí I-VIII,
- AI Executive Summary,
- napojení Retention jako první hotové sekce.

## 14) Stav implementace — M4 Executive Dashboard (2026-04-25 07:20 UTC)

**Hotovo:**
- ✅ `/` je hlavní Executive Dashboard místo preview placeholderu.
- ✅ HR Health Score se počítá deterministicky ze všech 20 KPI, váženě podle priority.
- ✅ Hero KPI ukazuje stav lidí, fluktuaci a eNPS.
- ✅ Top Alerts řadí rizika podle statusu, priority a velikosti změny.
- ✅ What Changed panel rozlišuje zlepšení, červené problémy a amber watchlist.
- ✅ Scorecards pokrývají všechny sekce I-VIII a vedou na sekční routy.
- ✅ `SECTION_CATALOG` sjednocuje navigaci, metadata sekcí, primární KPI a navazující analytiku/operativu.
- ✅ `AppShell` už není Retention-only; podporuje executive i sekční kontext.

**Ověřeno cíleně:**
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test tests/dashboard/executive-dashboard.test.ts tests/kpi/sections.test.ts`

**Další na řadě: M5 — Full section dashboards**
- sekce I. HR statistiky,
- sekce II. Nástupy a odchody,
- sekce III. Náklady a struktura,
- sekce IV. Recruitment,
- sekce VI. Nástupnictví,
- sekce VII. Engagement,
- sekce VIII. Talent & Growth.

## 15) Stav implementace — M5 Full section dashboards (2026-04-25 07:35 UTC)

**Hotovo:**
- ✅ `/sekce/[slug]` generuje statické stránky pro všechny nové sekce kromě Retention, která zůstává samostatný referenční detail.
- ✅ Sekce I. HR statistiky — HC/FTE, gender mix, management mix, věková struktura a raw gender pay gap signál.
- ✅ Sekce II. Nástupy a odchody — hires, leavers, net change, divizní movement a rizikové čisté změny.
- ✅ Sekce III. Náklady a struktura — wage cost, cost components, avg wage, CAP/FTE gap a top cost divize.
- ✅ Sekce IV. Recruitment — requisitions, funnel, critical roles, channel mix a recruitment risk list.
- ✅ Sekce VI. Nástupnictví — readiness portfolio, gaps podle divizí a role bez pokrytí.
- ✅ Sekce VII. Engagement — eNPS, participace, promoters/passives/detractors, segmenty a vazba na odchody.
- ✅ Sekce VIII. Talent & Growth — potenciál, výkonové hodnocení, talent pool, školení a divizní talent pipeline.
- ✅ Recruitment parser je napojený do generátoru dat: vznikají `requisitions.ts` a `funnel-counts.ts`.
- ✅ `MockDataProvider` nově vrací náborová fakta přes `getRequisitions()` a `getFunnelCounts()`.
- ✅ Společný `GenericSectionPage` sjednocuje UX pro všechny nové sekce: hero, KPI cards, 12M trend, breakdown chart, tabulka, akce a drill-down odkazy.

**Ověřeno cíleně:**
- `pnpm gen:data`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test tests/sections/section-summaries.test.ts`
- `pnpm build` (13 statických stránek)

**Další na řadě: M6 — Cross-cutting detail views**
- Attrition analytics,
- Recruitment funnel detail,
- Compensation & pay gap,
- Absence & coverage.

## 16) Stav implementace — M6 Cross-cutting detail views (2026-04-25)

**Hotovo:**
- ✅ `/analytika/[topic]` generuje statické stránky pro čtyři cross-cutting drill-downy.
- ✅ Attrition deep dive — tenure cohorty, high-risk segmenty, critical leavers, eNPS a mzdový kontext.
- ✅ Recruitment funnel breakdown — stage konverze, bottleneck, time per stage, kanály a cost per hire.
- ✅ Compensation & pay gap — raw vs. adjusted gender pay gap, grade rozpad, tenure wage progression a outliery.
- ✅ Absence & coverage — sickness rate, vacation balance, long-term absence cases a coverage signál.
- ✅ `DetailDashboardPage` sjednocuje UI pro M6 a navazující M7: hero, metriky, grafy, tabulka, akce a navazující odkazy.

**Ověření cíleně:**
- `pnpm typecheck`
- `pnpm test tests/analytics/cross-cutting.test.ts`

**Další na řadě: M7 — Operational views**
- Hired & fired,
- Org chart,
- Vacation balances,
- eNPS latest,
- ESG people data.

## 17) Stav implementace — M7 Operational views (2026-04-25)

**Hotovo:**
- ✅ `/operativa/[view]` generuje statické stránky pro pět operativních pohledů.
- ✅ Hired & fired — nástupy, odchody, net změna, důvody odchodů a řádkový výstup.
- ✅ Org chart — headcount podle divizí, manažerské rozpětí, oddělení a vlastníci.
- ✅ Vacation balances — odhad zůstatků dovolené podle zaměstnance a divize.
- ✅ eNPS latest — poslední survey vlna, mix odpovědí a follow-up backlog.
- ✅ ESG people data — demografie, women-in-management, work accidents, training datapointy a readiness tabulka.
- ✅ Sidebar je rozšířený o skupiny Analytika a Operativa.
- ✅ Sekční cross-linky vedou jen na implementované M6/M7 routy.

**Ověření cíleně:**
- `pnpm typecheck`
- `pnpm test tests/operational/operational-views.test.ts`

**M8 — AI Copilot implementován**
- ✅ Globální floating button ve všech stránkách přes `AppShell`.
- ✅ Sidebar / sheet s chat-like rozhraním.
- ✅ 10 pre-canned dotazů a markdown odpovědí v `content/copilot-queries.json`.
- ✅ Kontextové řazení dotazů podle aktuální route.
- ✅ Typewriter efekt pro odpověď.
- ✅ Mock `CopilotProvider` připravený na budoucí live provider.

## 18) Plán implementace — M8 AI Copilot (2026-04-25)

**Implementováno:**
- ✅ Detailní plán je uložený v `docs/plans/2026-04-25-m8-ai-copilot.md`.
- ✅ M8 zůstává mock-only: žádné live API volání, protože prototyp nemá API klíč.
- ✅ Architektura je API-ready přes `CopilotProvider` interface.
- ✅ Copilot je globální doplněk v `AppShell`, dostupný přes floating button a sidebar.
- ✅ Obsah je v `content/copilot-queries.json` jako sada 10 předpřipravených dotazů a markdown odpovědí.

**Navržené soubory pro M8:**
- `lib/ai/copilot-provider.ts`
- `components/copilot/copilot-fab.tsx`
- `components/copilot/copilot-sidebar.tsx`
- `components/copilot/typewriter-text.tsx`
- `content/copilot-queries.json`
- `tests/ai/copilot-provider.test.ts`

**Ověření cíleně:**
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test tests/ai/copilot-provider.test.ts`

## 19) Stav implementace — M9 Polish + PDF briefing (2026-04-25)

**Hotovo:**
- ✅ `/briefing` generuje executive briefing nad stejným datovým modelem jako hlavní dashboard.
- ✅ Export do PDF je řešený přes browser print flow; print CSS skrývá sidebar, header a Copilot UI.
- ✅ `AppShell` ukazuje dokončení prezentačního prototypu: **100 %**.
- ✅ Procentuální model je deterministický v `lib/project/progress.ts`; před M9 + PDF exportem byl projekt vedený jako **82 %**.
- ✅ Přidány sdílené loading a empty states pro polish hlavních rout.
- ✅ Demo průchod pro HR Directorku je popsaný v `docs/demo-walkthrough-hr-director.md`.
- ✅ Plán a stav M9 jsou uložené v `docs/plans/2026-04-25-m9-polish-and-demo.md`.

**Ověření cíleně:**
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test tests/project/progress.test.ts tests/briefing/executive-briefing.test.ts tests/smoke.test.ts`
- `pnpm test` (66 testů)
- `pnpm build` (23 statických stránek včetně `/briefing`)

## 20) Stav implementace — Action Backlog (2026-04-25)

**Hotovo:**
- ✅ `/akce` přidává centrální akční backlog pro HR vedení.
- ✅ Backlog se staví deterministicky ze všech KPI: status, priorita, vlastník, doporučená akce, top driver a termín.
- ✅ Navigace v `AppShell` obsahuje novou položku `Akční backlog`.
- ✅ Demo walkthrough vede po Executive Dashboardu přes nový backlog a teprve potom do detailní analytiky.
- ✅ `tests/actions/action-backlog.test.ts` ověřuje, že backlog obsahuje jen non-green akce, má vlastníky, odkazy a stabilní řazení.

**Ověření cíleně:**
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test tests/actions/action-backlog.test.ts`

## 21) Stabilizace před předáním v1 (2026-04-25)

**Hotovo:**
- ✅ `tests/smoke.test.ts` už není placeholder; ověřuje hlavní demo view-modely a routovatelnost odkazů z Executive Dashboardu a Action Backlogu.
- ✅ Demo walkthrough je srovnaný s aktuálním flow: Executive Dashboard → Action Backlog → detailní analytika → Copilot → PDF briefing.
- ✅ Produkční build generuje 24 statických stránek včetně `/akce` a `/briefing`.

**Ověření:**
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` (68 testů)
- `pnpm build` (24 statických stránek)
- HTTP smoke přes `next start`: `/`, `/akce`, `/briefing`, `/sekce/retention`, `/sekce/hr-statistics`, `/analytika/attrition`, `/operativa/hired-fired`, `/operativa/esg`

**Poznámka k lokálnímu serveru:**
- Výchozí `pnpm dev` je kompatibilní s tímto Termux prostředím; Turbopack zůstává volitelně dostupný přes `pnpm dev:turbo`.

## 22) M11 XLS perfection pass (2026-04-25)

**Aktuální procento dokončení:**
- Webový prezentační prototyp v1: **100 % hotovo**.
- Výpočet: `lib/project/progress.ts` eviduje 11/11 dokončených milníků a 100/100 procentních bodů.
- Pozor: 100 % se vztahuje na v1 prototyp nad mock daty, ne na budoucí produkční Power BI/DWH implementaci.

**Doplněno v M11:**
- `HR_reporting_ver2.xlsx` je přítomný v kořeni repozitáře a je primární zdroj pravdy pro zadání.
- `docs/traceability/hr-reporting-v2-traceability.md` mapuje workbook na implementaci: 20 KPI, operativní reporty, ESG/ESRS datapointy a stav pokrytí.
- KPI katalog je srovnaný s klíčovými prahy z `NÁVRH_do_BI` pro TTF, TTF critical, CPH, fluktuaci, kritickou fluktuaci, succession a eNPS.
- Threshold vrstva je rozšířená o metodiku prahu, zdroj, jistotu, vlastníka revize, vzdálenost od hranice, vizualizační pásma a severity score.
- KPI karty zobrazují threshold bar s target markerem a executive/action vrstvy řadí rizika podle severity score.
- ESG operativní pohled explicitně ukazuje readiness pro všech 21 položek z `ESG reporty_actual`.
- Přidaný je test `tests/traceability/xls-traceability.test.ts`, který ověřuje workbook sheety a pokrytí KPI kódů v traceability dokumentu.

**Ověření po M11 + threshold metodice:**
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 18 souborů / 72 testů
- `pnpm build` — 24 statických stránek

**Handoff dokumenty:**
- `docs/next-session-handoff.md` — první dokument k otevření v další session.
- `docs/plans/2026-04-25-m11-xls-perfection-pass.md` — stav a akceptační kritéria M11.
- `docs/traceability/hr-reporting-v2-traceability.md` — explicitní XLS traceability matrix.

**Důležité zjištění ke zdrojům:**
- Primární `HR_reporting_ver2.xlsx` je dostupný v kořeni repozitáře.
- Dostupné jsou raw exporty v `data-sources/raw/`: `Nastupy_vystupy.xlsx`, `Staffplan.xlsx`, `recruitment_report.xlsx`.
- Pokud se bude workbook v budoucnu měnit, je potřeba aktualizovat traceability matrix i související KPI threshold testy.

**Doporučený první krok příště:**
1. Přečíst `docs/next-session-handoff.md`.
2. Přečíst v2 master plán `docs/plans/2026-04-25-v2-perfection-master-plan.md`.
3. Spustit ověření (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm qa:visual`) — ověřit, že v2/M19 baseline drží.
4. Pokud se pokračuje v prezentaci, projít demo flow na desktop/mobile a řešit už jen konkrétní vizuální nálezy.
5. Pokud se pokračuje směrem k produkci, otevřít samostatný Real Data Readiness plán pro mapování raw XLS exportů, validace a Power BI vendor kontrakty.

## 23) v2 Perfection Pass — master plán schválen (2026-04-25)

**Kontext:** v1 prototyp je technicky 100 %, ale audit z perspektivy HR Directorky Marie Voršílkové odhalil tři kategorie mezer (zadání-vs-implementace, UX, vizuální design). Cíl v2 = posunout produkt z „demo-ready" na „investment-ready" stav, aby HR Directorka:
- za 10 sekund viděla, jestli je něco špatně,
- za 30 sekund identifikovala top 3 problémy s ownerem a deadlinem,
- za 3 minuty pochopila, co se změnilo a kam zaměřit pozornost,
- exportovala McKinsey-grade PDF pro board.

**Master plán:** `docs/plans/2026-04-25-v2-perfection-master-plan.md` — 6 milníků M12–M17 s konkrétními soubory, scope, akceptačními kritérii a sekvencí závislostí.

**Audit zdroje (Phase 1):**
- 3 kategorie mezer popsané přímo v master plánu (sekce „Co v1 nezvládá z pohledu HR Directorky").
- Top 10 UX gaps + Top 8 vizuálních gaps s konkrétními file:line odkazy.
- Co je naopak silné a má zůstat (5 bodů).

**M12–M17** jsou implementované ve v2 release; master plán zůstává jako auditní blueprint scope a akceptačních kritérií.

**Stav:** v2 hotová. M18/M19 prezentační QA hotové; navazuje buď ruční demo review nad screenshot nálezy, nebo Real Data Readiness pro dodavatele.

## 24) M18/M19 Presentation QA dokončeno (2026-04-26)

**M18 UX polish QA:**
- Mobilní navigace v `AppShell` pro viewporty bez desktop sidebaru.
- Briefing empty state bez fake `HR_STATS` fallbacku.
- Sjednocení klíčových dashboard/KPI/briefing prvků na AURES brand tokeny.
- Regresní guardy v `tests/ux-polish.test.ts`.

**M19 Presentation QA:**
- Playwright tooling: `playwright.config.ts`, `tests/e2e/presentation-qa.spec.ts`, `pnpm qa:visual`.
- Desktop/mobile/briefing preview guardy pro hlavní demo routy a horizontální overflow.
- `scripts/qa-visual.ts` korektně skipuje Playwright browser run v Termux/Android prostředí; plný screenshot běh je určený pro Linux/macOS/Windows nebo CI.

**Poslední ověření:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` prošly; `pnpm qa:visual` v Termuxu skončil řízeným skipem kvůli nepodporovaným Playwright browser binaries.
