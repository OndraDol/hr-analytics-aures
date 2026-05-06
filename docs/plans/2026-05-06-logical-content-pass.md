# HR Analytics — Logický a obsahový pass napříč webem

## Context

Po revizi celého prototypu (Executive Dashboard, sekce I–VIII, cross-cutting drill-downy, operativní pohledy, Briefing, Action Backlog, AI Copilot) jsem našel sérii souvisejících problémů, které z prototypu dělají na první pohled matoucí produkt — přesně proto, na co jste si stěžoval:

1. **Narativ tvrdí, co tvrdit nemůže.** Front page hlásí „Fluktuace klíčových pozic vyšší o 11 % … vysvětluje 04_Automotive OPS: drží stav 0 % proti předchozímu měsíci." Pokud Automotive OPS drží stav, nemůže vysvětlovat změnu. Root cause: `lib/analytics/driver-analyzer.ts:37` má fallback `Math.abs(b.delta || b.value)`, který při `delta === 0` přepne na velikost segmentu a vyhodí největší segment jako „top driver" — i když ke změně **nepřispěl**.

2. **Drill-downy vedou na nesouvisející obsah.** Sekce VI Nástupnictví, VII Engagement i VIII Talent & Growth mají v `lib/sections/catalog.ts:128/143/158` `relatedAnalytics` mířící na `/analytika/attrition`. Klik z „Pokrytí nástupnictví" tak ukáže statistiku odchodů — což uživatel správně označil za nesmysl.

3. **Konkrétní jména chybí všude kromě PeoplePanelu.** Mock data mají kvalitní česká jména (Pavel Novotný, Iva Nováková…), ale Top Alerts, KPI cards, Action Backlog, Briefing a Driver-analyzer pracují jen na úrovni divize/grade. Executive vrstva tak působí abstraktně.

4. **Pomocné chyby:** divizní labely propagují prefix `04_` z raw dat až do UI; absolutní změna v procentech je formátovaná stejně jako relativní (matoucí); `direction` z `dim_kpi` se v narativu důsledně nepoužívá; některé operativní pohledy mají duplicity, fake KPI nebo placeholdery.

Cíl tohoto plánu: na první pohled smysluplný, kompletní a personalizovaný executive dashboard pro Marii Voršílkovou (HR Director AURES Holdings).

---

## Co konkrétně se opraví — souhrn nálezů

### A. Narativní engine (root cause #1)

| # | Soubor:řádek | Problém | Oprava |
|---|---|---|---|
| A1 | `lib/analytics/driver-analyzer.ts:37` | `.sort((a,b) => Math.abs(b.delta \|\| b.value) - Math.abs(a.delta \|\| a.value))` — fallback na `value` činí největší segment „driverem" i když má delta=0. | Sortovat výhradně podle `Math.abs(delta)`. **Filtrovat** drivery s `delta === 0` nebo `\|delta\| < THRESHOLD` (1 pp pro pct KPI, 1 počet pro count KPI). Když po filtru nezbude driver, narativ vůbec driver-větu nevyrobí. |
| A2 | `lib/analytics/human-readable.ts:68–79` (`driverSentence`) | `direction = delta > 0 ? 'přidalo' : delta < 0 ? 'ubralo' : 'drží stav'` — generuje větu „drží stav 0 pp", která logicky popírá hlavní tvrzení. | Když je `\|delta\| ≈ 0`, místo věty **vrátit `null`** a v alertu/cardu se driver-věta vynechá. Pro skutečné kontributory věta zachovává „přidalo / ubralo X,Y pp". |
| A3 | `human-readable.ts:56` (`comparisonSentence`) | `formatKpiValue(Math.abs(delta), unit)` zobrazuje absolutní deltu jako `%`, čímž splývá s relativní změnou. | Zavést **`formatDelta(value, unit)`**: pro `unit === 'pct'` vrátit „X,Y pp", jinak ponechat původní formát. Použít v `comparisonSentence`, `driverSentence`, top-alerts, KPI cards. |

### B. Drill-down navigace — tři nové dedikované topiky (volba uživatele)

`lib/sections/catalog.ts` momentálně:
- L128 Sekce VI → `/analytika/attrition` ❌
- L143 Sekce VII → `/analytika/attrition` ❌
- L158 Sekce VIII → `/analytika/attrition` ❌

Vytvoříme 3 nové topiky v `lib/analytics/cross-cutting.ts`:

**B1. `/analytika/succession-coverage`** — incumbenti kritických rolí, ready/1Y/2Y/gap rozpad, věk/tenure incumbenta jako risk score, top 10 nejrizikovějších rolí s jmény incumbentů (a s navrhovaným nástupcem, pokud existuje). Přebírá data z `buildSuccession` v `section-summaries.ts:673–786` a rozšiřuje je o risk view.

**B2. `/analytika/engagement-pulse`** — eNPS po segmentech (země / divize / grade), korelace s fluktuací stejných segmentů, identifikace „red zone" (nízký eNPS + rostoucí odchody), follow-up backlog s konkrétními manažery.

**B3. `/analytika/talent-pipeline`** — Talent matrix 9-box (potenciál × výkon), kalibrace podle divize, internal mobility kandidáti (s jmény) pro otevřené kritické role, talent retention risk (high-potential s nízkým eNPS / dlouho v roli).

Aktualizace `lib/sections/catalog.ts`:
- L128: `href: '/analytika/succession-coverage'`, label „Pokrytí kritických rolí"
- L143: `href: '/analytika/engagement-pulse'`, label „Engagement vs odchody"
- L158: `href: '/analytika/talent-pipeline'`, label „Talent pipeline a 9-box"

`ANALYTICS_TOPICS` rozšířit o tyto 3 položky (slug, popis, builder, navazující odkazy zpět na sekce a operativní pohledy).

### C. Konkrétní jména v narativu (top 1–2 inline + expand)

| # | Vrstva | Soubor | Co přibude |
|---|---|---|---|
| C1 | Driver-analyzer | `lib/analytics/driver-analyzer.ts` | Nová funkce `analyzePeopleContributors(provider, evaluation)` — pro event-based KPI (FLUCT, FLUCT_CRIT, hires, leavers) vrátí top 1–2 zaměstnance, kteří MoM nejvíc změnili agregát (tj. konkrétní leavers / hires / event-people). Existující `analyzeDrivers` zůstává pro segmentové KPI. |
| C2 | Executive Dashboard | `lib/dashboard/executive-dashboard.ts` (build alertů) | Alert dostane novou property `peoplePreview: { name, role, division }[]` (max 2). |
| C3 | Top Alerts UI | `components/dashboard/top-alerts.tsx:84+` | Render `peoplePreview` jako tichý druhý řádek: „Konkrétně: Petr Svoboda (Senior Sales, Praha) · Jana Marešová (Team Leader, Brno)". Pokud je víc než 2, doplnit „+10 dalších" link na sekci. |
| C4 | KPI Card | `components/kpi/kpi-card-zones.tsx` | Přidat slot `peopleSlot` (volitelný). Pokud `kpiCardModel.peoplePreview` existuje, zobrazí se pod narrativem v jemnější typografii. |
| C5 | Action Backlog | `lib/actions/action-backlog.ts` | Pro každou akci dopočítat `peopleContext: { name, role, division, signal }[]` — pro kritickou fluktuaci napojit konkrétní leavery, pro succession akce konkrétní kritické role bez nástupce, pro engagement konkrétní detractor manažery. |
| C6 | Briefing | `app/briefing/page.tsx` + `lib/briefing/executive-briefing.ts` | Nová sekce **„Top 5 lidí Q1"** se třemi tabulkami: Top 5 leavers (jméno, pozice, divize, datum, důvod, tenure), Top 5 hires (jméno, pozice, datum), Top 5 ready successors (incumbent → nástupce). |
| C7 | PeopleHighlight rozšíření | `lib/analytics/section-summaries.ts` | Doplnit `peopleHighlight` do `buildHrStatistics` (top earners se signálem retence), `buildCostStructure` (top earners s critical flag), `buildRecruitment` (kandidáti ve finále kritických rolí), `buildEngagement` (manažeři týmů s nejnižším eNPS), `buildTalentGrowth` (high-potential bez interní mobility). |

### D. Direction & format normalizace

| # | Soubor | Oprava |
|---|---|---|
| D1 | `lib/analytics/format.ts` | Nová funkce `formatDivisionLabel(name)` — `name.replace(/^\d+_/, '')`. Použít všude místo přímého `division.name`. |
| D2 | `lib/data/parsers/staffplan.ts` (volitelně) | Lepší: cleanup u zdroje — při parsingu uložit `displayName` bez prefixu. Aplikovat až při nejbližším `pnpm gen:data`. Zachovat `code` pro ID-stable joiny. |
| D3 | `lib/analytics/format.ts` | Nová funkce `formatDelta(value, unit, isAbsolute = false)` — pro `unit === 'pct' && isAbsolute` vrací „X,Y pp", pro relativní použije „X,Y %". Konzumují `human-readable.ts:56,77` a `top-alerts.tsx:105`. |
| D4 | `lib/kpi/catalog.ts` | Audit `direction` (`up` / `down`) u všech 20 KPI; `narrative-generator.ts` musí hlásit „zlepšení / zhoršení" relativně k direction, ne mechanicky „vyšší / nižší". |
| D5 | `lib/analytics/section-summaries.ts:470` (Cost & Structure) | `executiveSignalCs` upravit: explicitně říct „růst nákladů bez růstu FTE = riziko" (respekt direction='down'). |
| D6 | `lib/analytics/operational-views.ts:371–372` (Vacation balances) | Přepnout tone metriky „Zůstatek celkem" z `violet` na `orange` při překročení prahu (>15 dní = riziko vyplacení). |

### E. Obsahový úklid drill-downů a operativy

| # | Místo | Problém | Oprava |
|---|---|---|---|
| E1 | `lib/analytics/cross-cutting.ts:663` (`/analytika/absence-coverage`) | `coverage = Math.max(88, 98 - sicknessRate * 0.35)` je fake formula. | Odstranit `coverage` metriku úplně. View přejmenovat na **Absence & nemocnost**, slug ponechat. Až bude shifts data, znovu přidat. |
| E2 | `lib/analytics/operational-views.ts:240–326` (`/operativa/org-chart`) | `headEmployeeId` často null, sloupec „Vedoucí" obsahuje placeholder „vedoucí není v datech". | V parseru `staffplan.ts` napropojit head employee přes `directReports` heuristikou (manažer s nejvyšším počtem přímých podřízených v dané org_unit). Pokud ani heuristika nevyhodí jméno, sloupec skrýt. |
| E3 | `lib/analytics/operational-views.ts:529–551` (`/operativa/esg`) | Duplicitní řádky (gender management 2x, L533+L544); pořadí chaotické. | Tabulku seskupit do 5 logických bloků: **Demografie**, **DEI**, **Workforce**, **Safety**, **Learning**. Deduplikovat řádky. Přidat chyběcí ESG datapoint ze srovnávací tabulky. |
| E4 | `lib/analytics/cross-cutting.ts:308` (`/analytika/attrition`) | Tabulka „Correlation explorer" ukazuje jen divize, žádné konkrétní leavery. | Druhá tabulka „Top kritické odchody Q1" (jméno, pozice, divize, datum, důvod, tenure) — používat existující `criticalLeavers` z `retention-summary`. |
| E5 | `lib/analytics/cross-cutting.ts:341–370` (`/analytika/recruitment-funnel`) | Stage konverze počítá z agregátu, bez per-channel/per-role dat. | Rozšířit o `funnelByChannel` a `funnelByRoleCategory`. Identifikovat reálný bottleneck (stage s největším poklesem). Listovat top 3 stuck requisitions s pozicí a počtem dní v aktuální fázi. |
| E6 | `content/copilot-queries.json` | 10 dotazů, ale chybí téma succession a talent. | Doplnit min. 3 nové dotazy: „Které kritické role jsou bez nástupce?", „Kteří talenti jsou připraveni na povýšení?", „Jak se daří retenci high-potential lidí?". |

### F. Briefing & Action Backlog detail

| # | Soubor | Oprava |
|---|---|---|
| F1 | `lib/actions/action-backlog.ts` (`titleCs`, `recommendationCs`) | Generický recommend nahradit šablonou per KPI s placeholderem `{{topPeople}}`. Příklad pro FLUCT_CRIT: „Provést 1:1 retention review s rizikovými lidmi: {{topPeople}}. HRBP zodpovědný: {{owner}}. Termín: do {{due}}." |
| F2 | `lib/actions/action-backlog.ts` (`owner`) | Z KPI katalogu zůstává role (HRBP, Recruiting), ale nově dohledat **konkrétní vlastníka** přes `lib/team/owners-map.ts` (nový soubor s mapováním role → konkrétní jméno) — pro demo pevně nakódovat 5–6 reálných HR rolí AURESu (HR Director Marie Voršílková, HRBP CZ Martin Vaněk apod. — kromě HR Director jsou ostatní domyšlené demo persony). |
| F3 | `lib/briefing/executive-briefing.ts` | Přidat ESG audit trail sekci (přebírá z `/operativa/esg` data quality flagy) — board chce vidět, kde data NEJSOU ready. |

---

## Kritické soubory k úpravě

```
lib/analytics/driver-analyzer.ts            ← root fix (sort + threshold + people contributors)
lib/analytics/human-readable.ts             ← null místo "drží stav", formatDelta integrace
lib/analytics/narrative-generator.ts        ← respekt direction
lib/analytics/format.ts                     ← formatDivisionLabel, formatDelta
lib/analytics/section-summaries.ts          ← peopleHighlight do I, III, IV, VII, VIII; section signal direction
lib/analytics/cross-cutting.ts              ← 3 nové topiky, fix attrition/recruitment/absence/esg
lib/analytics/operational-views.ts          ← org-chart heuristika, vacation tone, ESG dedup
lib/sections/catalog.ts                     ← redirect L128/143/158 na nové topiky
lib/dashboard/executive-dashboard.ts        ← peoplePreview do alertů
lib/actions/action-backlog.ts               ← peopleContext, owners map
lib/briefing/executive-briefing.ts          ← Top 5 lidí sekce + ESG audit trail
lib/team/owners-map.ts                      ← NOVÝ — mapa role → konkrétní persona
content/copilot-queries.json                ← +3 dotazy succession/talent
components/dashboard/top-alerts.tsx         ← peoplePreview render
components/kpi/kpi-card-zones.tsx           ← peopleSlot render
components/sections/people-panel.tsx        ← případné rozšíření o icon set per kontext
app/analytika/[topic]/page.tsx              ← page handler pro 3 nové topiky (pokud generic, jen ANALYTICS_TOPICS)
app/briefing/page.tsx                       ← sekce Top 5 lidí v rendereru
```

## Reuse existujících utilit

- `formatEmployeeName` v `lib/analytics/format.ts` — stávající, bude použita všude pro jména
- `buildSuccession` v `lib/analytics/section-summaries.ts:673–786` — datová báze pro succession-coverage drill-down
- `criticalLeavers` z `retention-summary.ts` — pro attrition tabulku konkrétních odchodů
- `KPI_CATALOG.direction` — pro direction-aware narativ
- `ANALYTICS_TOPICS` registr v `cross-cutting.ts` — pro registraci 3 nových topiků
- `PeoplePanel` komponenta v `components/sections/people-panel.tsx` — reuse pro Top 5 lidí v briefingu

---

## Pořadí implementace (doporučené)

**Fáze 1 — root fix (1 den):** A1, A2, A3, D3 (formatDelta), D1 (formatDivisionLabel). Spustit `pnpm test` a vizuálně ověřit, že už se neobjevuje „drží stav 0 pp" formulace.

**Fáze 2 — drill-downy (2 dny):** B1 succession-coverage, B2 engagement-pulse, B3 talent-pipeline + redirect v `catalog.ts`. Po této fázi dávají kliky na sekcích VI/VII/VIII smysl.

**Fáze 3 — jména do narativu (2 dny):** C1 (people contributors v driver-analyzer), C2–C5 (executive layer integrace), C7 (peopleHighlight rozšíření).

**Fáze 4 — Briefing & Backlog detail (1 den):** C6, F1, F2, F3.

**Fáze 5 — obsahový úklid (1 den):** E1–E6, D2, D4, D5, D6.

**Fáze 6 — verifikace + polish (1 den):** spec review, tests, build, qa visual, demo walkthrough.

Cíleně **NE bigbang** — každá fáze je samostatně mergovatelná, regression risk je distribuovaný.

---

## Verifikace

Pro každou fázi:

```bash
pnpm gen:data        # pokud se měnily parsery (D2)
pnpm lint
pnpm typecheck
pnpm test            # spustit cíleně testy v dané oblasti
pnpm build           # ověřit, že žádná stránka nepadá
```

End-to-end smoke (manuálně v browseru po `pnpm dev`):

1. **Front page (`/`)** — žádný alert nesmí obsahovat větu typu „X drží stav 0 pp proti předchozímu měsíci". Top alerty mají `peoplePreview` (2 jména inline). Hodnoty změn jsou v `pp` u procentních KPI, v relativním % jen u count KPI.
2. **Sekce VI Nástupnictví** → klik „Pokrytí kritických rolí" → `/analytika/succession-coverage` zobrazí kritické role bez nástupce s incumbenty (jména), žádné statistiky odchodů.
3. **Sekce VII Engagement** → klik → `/analytika/engagement-pulse` zobrazí eNPS po segmentech a korelaci s fluktuací.
4. **Sekce VIII Talent & Growth** → klik → `/analytika/talent-pipeline` zobrazí 9-box.
5. **Action Backlog (`/akce`)** — každá akce má `peopleContext` s jmény a konkrétního ownera (Marie Voršílková, Martin Vaněk apod.), ne abstraktní „HR reporting".
6. **Briefing (`/briefing`)** — má sekci „Top 5 lidí Q1" se třemi tabulkami a ESG audit trail.
7. **Operativa Org Chart** — sloupec „Vedoucí" má buď reálné jméno z heuristiky, nebo je sloupec skrytý (žádný placeholder „vedoucí není v datech").
8. **Operativa ESG** — 5 logicky seskupených bloků, žádná duplicita, gender management v každém bloku jen 1×.
9. **Operativa Vacation** — vysoký zůstatek (>15 dní) má tone `orange`, tabulka má jasný signal.
10. **Copilot** — na dotaz „Které kritické role jsou bez nástupce?" vrátí konkrétní seznam.
11. **Divizní labely** — nikde se nezobrazí prefix „04_". V grafech, tabulkách, alertech.
12. **Demo walkthrough** — projít celé `docs/demo-walkthrough-hr-director.md` flow a ověřit, že popis sedí s aktuálním UI po změnách.

## Otevřené otázky pro implementační fázi

- Pro `lib/team/owners-map.ts` (F2) potvrdit s uživatelem, **která jména** dáme jako persony za zbývající HR role (Marie Voršílková jako HR Director je daná, ostatní jsou placeholder — můžou být i fiktivní jména, ale konzistentně používané).
- Pro `engagement-pulse` (B2) potvrdit, jestli mock data eNPS mají dost segmentového detailu, nebo je třeba doplnit generátor.
- Talent matrix 9-box (B3) potřebuje `performance` + `potential` pole v employee snapshot — ověřit, že mock generátor je vyrábí; pokud ne, doplnit.
