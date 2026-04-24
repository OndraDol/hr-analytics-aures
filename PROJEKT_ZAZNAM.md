# HR Analytics / BI reporting — projektový záznam

> Živý pracovní dokument. Zapisujeme sem postupně pochopení požadavků, rozhodnutí, otevřené otázky, strukturu datasetu a další postup. Zdrojový podklad: `HR_reporting_ver2.xlsx`.

Poslední aktualizace: 2026-04-24

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
1. **Kdo je HR Director** — autor návrhu (potřebujeme jméno pro schvalování priorit)? Kateřina Topolová? Kdo je primární business owner projektu?
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

## 11) Stav implementace (2026-04-24 16:45)

**GitHub:** https://github.com/OndraDol/hr-analytics-aures (private, branch `main`)

**Hotovo (pushed, zelené):**
- ✅ M0 kompletní — Next.js 15 App Router + strict TypeScript + Tailwind v4 + Geist/Instrument Serif fonty + AURES paleta (Deep Blue + Orange) light/dark tokeny + Vitest setup + runtime/dev dependencies.
- ✅ M1 progress: doménové typy (`lib/types.ts`), 3 Excel parsery (Staffplan, Nastupy_vystupy, recruitment_report) + fixture generátor + 11 unit testů.
- ✅ ESLint 9 / Next.js 15 flat config compatibility vyřešena (FlatCompat).

**Kompletní verifikace:** `pnpm lint`, `pnpm build`, `pnpm typecheck`, `pnpm test` — **všechno zelené**.

**Aktuální rozpracování:**
- **Další na řadě: Task 11 — Name pseudonymizer** (`lib/data/parsers/names.ts`). Adresář `lib/data/heuristics/` existuje (připraven pro tasky 12–13).
- Mezi Taskem 10 a 11 neexistuje žádná rozpracovaná změna v tree (`git status` čistý).

**Navazování z jiné session / mobilu:**
1. `git clone https://github.com/OndraDol/hr-analytics-aures` → `pnpm install` → `pnpm test` (musí projít 11 testů).
2. Otevři `docs/plans/2026-04-24-m0-m1-foundation-and-data.md`, najdi **Progress tracker** → první řádek s `⏭️`.
3. Pokračuj implementací Tasku 11 (Pseudonymizer) přesně dle sekce „Task 11: Anonymizační vrstva" v plánu — kompletní kód, testy i commit zpráva jsou v plánu.
4. Po každém dokončeném tasku: `git push origin main` (drží repo aktuální pro další přepojení).

**Otevřené drobnosti:**
- `HR_reporting_ver2.xlsx` je stále otevřený v Excelu na workstationu — nelze přesunout do `data-sources/raw/`. Až uzavřeš, spusť `mv HR_reporting_ver2.xlsx data-sources/raw/ && git add data-sources/raw/HR_reporting_ver2.xlsx && git commit -m "chore: move HR reporting návrh into data-sources/raw" && git push`.

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
