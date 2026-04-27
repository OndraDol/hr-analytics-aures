# HR Overview UX Pass — Q1 2026 Refresh

Datum: 2026-04-27

Cíl: snížit fragmentaci stránky pro HR Directora, sjednotit AI komentáře, dát všem grafům viditelné osy a hodnoty, kalibrovat mock data tak, aby vznikla realistická "headline story" pro Q1 2026.

## Hlavní změny

### Brand a kopie
- **Rename "Přehled lidí" → "HR Overview"** napříč hero, sidebarem, briefingem, metadata title a testy.
- Sekundární tagline pod heroem: `HR Overview · Q1 2026`.

### Homepage (`app/page.tsx`)
- Z 6 panelů na 3 zóny: **Pulse hero → Top 3 alerty → Mapa oblastí**.
- `ExecutiveSummary` komponenta odstraněna z homepage. AI shrnutí (`dashboard.aiSummaryCs`) je teď pod nadpisem v hero.
- `WhatChanged` komponenta odstraněna z homepage. Informace o změně je vizuálně absorbována jako "delta chip" na alert kartě (zlepšení / nový problém / ke sledování).
- `HypothesesPanel` zabalen do `<details>` (default zavřený) — k dispozici, ale nepřebíjí prostor.

### TopAlerts (`components/dashboard/top-alerts.tsx`)
- Přepnuto na 3-sloupcový grid alert karet (1 alert = 1 karta).
- Každá karta má: severity badge, KPI název + hodnotu, **mini timeline graf s osami a tooltipem** (přes nový Sparkline), threshold line, reasonCs, delta chip a CTA.
- Karta s `rank=1` má výraznější červený rámeček.

### Sekce/[slug] (`components/sections/section-page.tsx`)
- Z 6 vrstev na 5: **Hero strip → Trend chart → KPI grid → Breakdown → Akce + Souvislosti**.
- Odstraněn fialový panel "Co je důležité" — `executiveSignalCs` je teď jediný lead odstavec pod h1.
- Přidán `SectionTrendChart` na primární KPI sparkline (full-width, X+Y osa, threshold line, tooltip).
- Status pill v hero pravém rohu místo dvojitého textového komentáře.
- KPI grid je 2x2 / 4x1 layout pro primary + 3 supporting KPI.
- Související odkazy jsou kompaktní pills v patičce, ne velký panel.

### Sparkline (`components/kpi/sparkline.tsx`)
- Refaktorován do tří-sloupcového layoutu: **Y labels (max/min) | SVG chart | endpoint hodnota**.
- X osa zobrazuje první a poslední period.
- Hover tooltip vykreslen v HTML přes absolute pozici.
- Volitelný `target` prop kreslí horizontální dashed čáru pro threshold.
- `compact` prop skryje Y labels v úzkých kontejnerech (KPI karty).
- `unitSuffix` (`%`, ` dnů`, ` Kč`, ` měs.`) připojený k číslům.

### Mock data + KPI thresholds
- **Calibrace prahů** (`lib/kpi/catalog.ts`) na realistická čísla pro AURES retail/auto:
  - HOLIDAY_UNTAKEN: green 3 / amber 5 / red 8 dní
  - TTF: green 38 / amber 50 / red 60 dní
  - TTF_CRIT: green 40 / amber 55 / red 65 dní
  - CPH: green 80 k / amber 110 k / red 150 k Kč
  - QUALITY_HIRE: green 22 / amber 18 / red 12 % (direction up)
  - FLUCT_CRIT: green 18 / amber 30 / red 45 %
- **Generátor recruitment cost** (`scripts/gen-data.ts`) snížen z `18k + n·1450 + ~22k` na `9k + n·700 + ~12k` (cca 30–50 k Kč CPH).
- **FLUCT_CRIT denominator fix** (`lib/analytics/kpi-evaluator.ts`): místo end-of-period kritického headcountu se používá union start+end, čímž se rate drží pod 100 %.

Výsledné rozložení Q1 2026: **12 green / 7 amber / 1 red**, health score **60**, headline alert: "Fluktuace klíčových pozic 57,6 %" (red), následují "Pokrytí nástupnictvím 77,1 %" a "Doba do obsazení klíčových pozic 44,9 dne" (amber).

## Out of scope (záměrně)
- Žádné nové AI funkce.
- Žádná změna chart library (zůstává Recharts).
- Žádná změna routovací struktury (4 skupiny levého menu zachovány).
- Dark mode policy beze změny.

## Verifikace

```bash
pnpm gen:data
pnpm test       # 89 / 89 passed
pnpm build      # 24 statických stránek OK
```

Pre-existing typecheck warningy (`@playwright/test` typings ve specu) zůstávají bez vlivu na build/test.

## Plán

Plán je v `~/.claude/plans/ancient-stargazing-shannon.md` (Codex-friendly, self-contained).
