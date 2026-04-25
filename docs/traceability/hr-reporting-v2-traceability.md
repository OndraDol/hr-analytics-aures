# HR_reporting_ver2.xlsx Traceability Matrix

> Stav: M11 perfection pass, 2026-04-25.
> Zdroj pravdy: `HR_reporting_ver2.xlsx` v kořeni repozitáře.
> Rozsah: prezentační webový prototyp nad hybridní real/mock datovou vrstvou. Produkční Power BI model, RLS, DWH a auditní ETL jsou mimo tuto fázi.

## Workbook

Workbook byl ověřen proti GitHub repozitáři `OndraDol/hr-analytics-aures`, cesta `HR_reporting_ver2.xlsx`, SHA blobu `80d353a797f3e619f16b4bf4c9c5154932f7424e`.

| Sheet | Role v M11 | Stav |
|---|---|---|
| `NÁVRH_do_BI` | Primární KPI matice: 20 KPI, prahy, frekvence, vlastníci, akce, BI sekce. | implemented |
| `NÁVRH` | Cílové operativní/reportovací pohledy. | implemented/partial |
| `ESG reporty_actual` | ESG/KPMG people datapointy a ESRS alternativní datapointy. | implemented/partial |
| `Návrh_rozpad` | Detailní rozpad tematických oblastí. | implemented |
| `CZ` | Česká verze části KPI matice. | implemented |
| `HR Reporty_actual` | Inventura současných HR reportů pro ROI a automatizaci. | partial |
| `Vojta_all` | Detail vybraných pravidelných/ad-hoc výstupů. | partial |

## KPI Traceability

Status zde znamená pokrytí v prezentačním prototypu. Datová poznámka rozlišuje, zda je výpočet opřený o dostupné exporty, mock fakta nebo demo default.

| XLS KPI | Kód | Route / UI | Stav | Datová poznámka |
|---|---|---|---|---|
| HR statistcis: HC, FTE, demographics, gender pay gap, DEI | `HR_STATS` | `/sekce/hr-statistics`, `/operativa/esg`, `/analytika/compensation-pay-gap` | implemented | Hybrid: employee/staffplan skeleton + mock DEI/payroll enrichment. XLS threshold `to be informed` je demo default proti staffplanu. |
| HR statistcis: employees in/out per division, country | `WF_MOVEMENT` | `/sekce/workforce-movement`, `/operativa/hired-fired` | implemented | Reálná kostra z `Nastupy_vystupy.xlsx`; měsíční trend a segmentace v prototypu. |
| Untaken Holiday | `HOLIDAY_UNTAKEN` | `/operativa/vacation-balances`, `/analytika/absence-coverage`, Action Backlog | implemented | Payroll data nejsou v exportu; hodnota je mock model. Thresholdy nastavené na XLS target 0 a red `<5 days`. |
| Sickness rate | `SICKNESS_RATE` | `/analytika/absence-coverage`, Engagement secondary KPI | implemented | Mock absence fakta; XLS neobsahuje konkrétní prahy, proto demo default čeká na HR/Payroll potvrzení. |
| Shifts - coverage | `SHIFT_COVERAGE` | `/analytika/absence-coverage` | implemented | Mock coverage proxy odvozené z nemocnosti; směr v aplikaci je logicky `up`, i když XLS řádek používá šipku dolů. |
| Wage KPI | `WAGE_KPI` | `/sekce/cost-structure`, `/analytika/compensation-pay-gap` | implemented | Mock payroll fakta; XLS threshold `acc. to budget` je reprezentovaný budget defaultem. |
| CAP KPI | `CAP_KPI` | `/sekce/cost-structure` | implemented | Staffplan cap vs. actual FTE; threshold `acc. to budget` je target tolerance. |
| HC, FT per divison | `HC_FTE_DIV` | `/sekce/cost-structure`, `/sekce/hr-statistics` | implemented | Hybrid: actual FTE z people skeletonu a staffplanu. Akce z XLS: hiring freeze / optimalizace. |
| Avg. wage | `AVG_WAGE` | `/sekce/cost-structure`, `/analytika/compensation-pay-gap` | implemented | Mock payroll; threshold `acc. to budget` je demo target. |
| Time to fill | `TTF` | `/sekce/recruitment`, `/analytika/recruitment-funnel` | implemented | Recruitment export + fallback. Prahy z XLS: green 27, acceptable 30, red 32 dní. |
| Time to fill of the critical role | `TTF_CRIT` | `/sekce/recruitment`, `/analytika/recruitment-funnel` | implemented | Critical role flag v prototypu. Prahy z XLS: green 30, acceptable 33, red 40 dní. |
| Time to Productivity | `TIME_TO_PROD` | `/sekce/recruitment` | implemented | Mock onboarding/performance proxy; XLS nemá prahy. |
| Cost per Hire | `CPH` | `/sekce/recruitment`, `/analytika/recruitment-funnel` | implemented | Recruitment cost z exportu/fallbacku. Prahy z XLS: 16000/17000/18000 CZK. |
| Qaulity of hiring process | `QUALITY_HIRE` | `/sekce/recruitment`, `/analytika/recruitment-funnel`, `/analytika/attrition` | implemented | Mock performance + early attrition proxy. XLS obsahuje poměrové prahy 0.25/0.3/0.32, v UI škálované na procentní KPI. |
| Employeer Evaluation | `EMPLOYER_EVAL` | `/sekce/recruitment`, ESG readiness | implemented | Mock candidate rating. Prahy z XLS převedené na 4-5 / 3-4 / 2-3. |
| Fluctuation rate | `FLUCT` | `/sekce/retention`, `/analytika/attrition`, Action Backlog | implemented | HRIS workforce events. Prahy z XLS převedené na 25/30/32 %. |
| Fluctuation rate crit. pos. | `FLUCT_CRIT` | `/sekce/retention`, `/analytika/attrition`, Succession secondary KPI | implemented | Critical flag je heuristika. Prahy z XLS převedené na 0/5/10 %. |
| Succession rate | `SUCCESSION` | `/sekce/succession`, `/sekce/retention` | implemented | Mock succession plans. Prahy z XLS: green >=80 %, amber 60-79 %, red <60 %. |
| eNPS | `ENPS` | `/sekce/engagement`, `/operativa/enps-latest`, `/analytika/attrition` | implemented | Mock Survio responses. Prahy z XLS: 15/10/5. |
| Talent&Growth potential | `TALENT_GROWTH` | `/sekce/talent-growth`, `/sekce/succession` | implemented | Mock annual appraisal. XLS nemá prahy, demo default čeká na Training/HR potvrzení. |

## Threshold Rationale

M11 rozlišuje dvě vrstvy: tříbarevný demo status a metodiku thresholdu. UI proto zobrazuje nejen `green/amber/red`, ale také vzdálenost od hranice, zdroj prahu, jistotu a vlastníka revize.

| Oblast KPI | Metodika prahu | Vizualizace |
|---|---|---|
| Recruitment (`TTF`, `TTF_CRIT`, `CPH`, `EMPLOYER_EVAL`) | Kombinace XLS hodnot a benchmarkové logiky. Prahy jsou vhodné pro demo storytelling, ale mají být potvrzené Recruiting ownerem. | Threshold bar s aktuální hodnotou, target markerem, severity score a textem `kolik nad/pod hranicí`. |
| Retention (`FLUCT`, `FLUCT_CRIT`) | XLS prahy použité jako demo risk limity. Critical retention má nulový target a jasný red příběh. | Red/amber pásmo je záměrně viditelné, protože jde o hlavní demo storyline. |
| Budget/plan KPI (`CAP_KPI`, `HC_FTE_DIV`, `AVG_WAGE`, `WAGE_KPI`) | Target-band/tolerance proti plánu nebo budgetu, ne jednoduché „čím míň/tím líp“. | Bar ukazuje cílové pásmo kolem plánu a vzdálenost od targetu. |
| ESG/People operations (`HOLIDAY_UNTAKEN`, `SICKNESS_RATE`, `SHIFT_COVERAGE`) | Story default tam, kde XLS nemá konkrétní prahy nebo chybí payroll zdroj. | UI explicitně označuje nižší jistotu prahu a nutnost potvrzení HR/Payroll. |
| Engagement/Talent (`ENPS`, `SUCCESSION`, `TALENT_GROWTH`) | XLS tam, kde existuje; u Talent Growth demo default čeká na Training/HR validaci. | Status doplňuje metodická poznámka a vlastník revize. |

## Operational Report Traceability

| XLS report (`NÁVRH`) | Route / UI | Stav | Poznámka |
|---|---|---|---|
| Nástupy a Odchody | `/operativa/hired-fired`, `/sekce/workforce-movement` | implemented | Operativní výstup pro IT/vedení i analytický movement pohled. |
| Fluktuace + Analýza odchodů | `/sekce/retention`, `/analytika/attrition` | implemented | Retention detail + cross-cutting attrition deep dive. |
| Počty zaměstnanců | `/sekce/hr-statistics`, executive hero | implemented | Headcount/FTE, demografie, země/divize. |
| Interní přestupy | `/sekce/workforce-movement`, `/operativa/hired-fired` | partial | Datový typ existuje ve workforce event modelu, demo UI ho pokrývá jen souhrnně. |
| Org. Chart | `/operativa/org-chart` | implemented | Prototyp ukazuje organizační stromový rozpad po divizích, odděleních a manažerských spanech. |
| Zůstatky dovolených | `/operativa/vacation-balances`, `/analytika/absence-coverage` | implemented | Mock payroll/absence model. |
| eNPS | `/operativa/enps-latest`, `/sekce/engagement` | implemented | Poslední vlna, participace, segmenty a follow-up. |
| HR report / Hired Fired pro Káju a vedení | `/briefing`, `/operativa/hired-fired` | implemented | Browser print briefing + operativní hired/fired. |
| ESG reporting | `/operativa/esg` | implemented/partial | Full ESG readiness tabulka; auditní zdroje pro training/accidents/social protection nejsou ve v1. |
| ECBR | žádná dedikovaná route | out-of-scope | XLS uvádí `nice to have`; pro M11 ponecháno jako budoucí Power BI/export téma. |
| TTF - máme | `/sekce/recruitment`, `/analytika/recruitment-funnel` | implemented | Pokryté v recruitment KPI a funnel detailu. |
| Talent pool - máme | `/sekce/succession`, `/sekce/talent-growth` | implemented | Succession + Talent & Growth. |

## ESG Traceability

| ESG datapoint | Route / UI | Stav | Poznámka |
|---|---|---|---|
| Počet zaměstnanců podle země | `/operativa/esg` | implemented | Country breakdown graf. |
| Zaměstnanci podle typu pracovního úvazku | `/operativa/esg` | implemented | Employment type count v readiness tabulce. |
| Struktura zaměstnanců podle pohlaví | `/operativa/esg`, `/sekce/hr-statistics` | implemented | Gender split. |
| Struktura managementu podle pohlaví | `/operativa/esg`, `/sekce/hr-statistics` | partial | Management level je B0-B2 heuristika. |
| Roční fluktuace zaměstnanců podle země | `/operativa/esg`, `/analytika/attrition` | implemented | Workforce events + country segment. |
| Hodnocení náborového procesu | `/operativa/esg`, `/sekce/recruitment` | partial | Mock employer/recruiter evaluation. |
| Roční fluktuace podle typu pracovní pozice | `/operativa/esg`, `/analytika/attrition` | partial | Job type je odvozený přes role family/grade. |
| % zaměstnanců s provedeným hodnocením výkonu | `/operativa/esg`, `/sekce/talent-growth` | implemented | Mock annual appraisal coverage. |
| Školení podle oblasti zaměření | `/operativa/esg`, `/sekce/talent-growth` | implemented | Mock L&D facts. |
| Počet hodin školení a počet účastníků školení | `/operativa/esg`, `/sekce/talent-growth` | implemented | Training table readiness. |
| Počet hodin školení na zaměstnance | `/operativa/esg`, `/sekce/talent-growth` | implemented | Training hours / active HC. |
| Zaměstnanci podle státní příslušnosti | `/operativa/esg`, `/sekce/hr-statistics` | implemented | Nationality field v employee skeletonu. |
| Věková struktura zaměstnanců | `/operativa/esg`, `/sekce/hr-statistics` | implemented | Average age + HR statistics breakdown. |
| Věková struktura managementu | `/operativa/esg`, `/sekce/hr-statistics` | partial | Management level heuristika. |
| Struktura managementu podle pohlaví | `/operativa/esg`, `/sekce/hr-statistics` | partial | Duplicitní ESG položka, stejný zdroj jako výše. |
| Pracovní úrazy | `/operativa/esg` | partial | Mock BOZP facts. |
| ESRS S1-6 Pohlaví | `/operativa/esg` | implemented | Gender datapoint. |
| ESRS S1-6 Fluktuace zaměstnanců | `/operativa/esg` | implemented | Turnover datapoint. |
| ESRS S1-7 Nezaměstnanci / externí pracovníci | `/operativa/esg` | partial | DPP/DPČ/ICO proxy, čeká na HR potvrzení definice. |
| ESRS S1-11 Sociální ochrana | `/operativa/esg` | blocked | Zdroj není ve v1 datech; ponecháno jako explicitně blokovaná ESG položka. |
| ESRS S1-13 Vzdělávání a rozvoj | `/operativa/esg`, `/sekce/talent-growth` | implemented | Training datapoint z mock L&D vrstvy. |

## M11 QA Checklist

- `HR_reporting_ver2.xlsx` je lokálně přítomný a test kontroluje sheety.
- KPI katalog obsahuje 20 kódů a vybrané prahy jsou srovnané s `NÁVRH_do_BI`.
- Všechny hlavní route modely jsou routovatelné přes smoke test.
- ESG view pokrývá celý `ESG reporty_actual` alespoň explicitním stavem readiness.
- Dokumentace už netvrdí, že primární workbook chybí.
