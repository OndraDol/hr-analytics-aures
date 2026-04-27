# UX Cleanup Pass v3 — méně poučování, jména, mobile-first, password gate

Datum: 2026-04-27

Cíl: ubrat preskriptivní "Co dělat" panely, ukázat **konkrétní lidi** za daty, vyřešit drift úzkých sloupců a Recharts overflow, udělat mobil použitelný na první pohled, zamknout demo heslem.

## Hlavní změny

### 1. Méně doporučení / poučování
- `KpiCardDecisionZone` (`components/kpi/kpi-card-zones.tsx`) **nerenderuje nic ve `variant="simple"`**. V "full" variantě je "Doporučená akce" zabalena do `<details>` "Návrh kroku" (default zavřeno). AI vhled zachován.
- `components/sections/section-page.tsx` — panel "Co udělat" přepracován na `<details>` "Návrh dalšího kroku" v patičce.
- `components/detail/detail-dashboard-page.tsx` — panel "Akční výstup" přepracován na `<details>` "Návrh dalšího kroku".
- TopAlerts beze změny — zůstávají popis problému + driver + delta chip + odkaz.
- Briefing (KPI karty) automaticky bez "Doporučené akce" díky úpravě KpiCardDecisionZone.

### 2. Konkrétní jména v reportech
- Helper `formatEmployeeName` v `lib/analytics/format.ts`.
- `SectionDashboardData.peopleHighlight?: SectionPeopleHighlight` (volitelný).
- `lib/analytics/section-summaries.ts` naplňuje:
  - **Retention**: top 6 nejnovějších kritických odchodů Q1 (jméno, pozice, divize, datum). Title: "Klíčoví lidé, kteří odešli v Q1".
  - **Workforce-movement**: top 6 odchodů Q1 (libovolných), barva pillu rose pro kritické / amber pro standardní.
  - **Succession**: 6 rolí bez nástupce s konkrétním jménem incumbenta a divizí.
- Nová komponenta `components/sections/people-panel.tsx` se v sekcích renderuje pod hlavním grafem, když existuje `peopleHighlight`.

### 3. Layout fix
- `components/layout/app-shell.tsx` — children wrapped v `<div className="mx-auto max-w-screen-2xl">` (1536 px max). Vpravo na big monitorech mizí prázdný prostor.
- `components/charts/section-charts.tsx` + `retention-charts.tsx` — `h-72` → `h-72 w-full min-w-0`. Recharts už nevyleze ven ze svého sloupce.
- Panel wrappery v section-page a detail-dashboard mají `overflow-hidden` + vnitřní `min-w-0` div, aby graf nikdy nepřetekl.
- `detail-dashboard-page.tsx` — breakdown grafy stackované pod sebe na 1024-1535 px (`2xl:grid-cols-[...]`), 3-sloupcový grid metrik je `sm:grid-cols-2 md:grid-cols-3`.
- `executive-briefing-page.tsx` — KPI metric grid `sm:grid-cols-2 md:grid-cols-3`, change groups `md:grid-cols-2 xl:grid-cols-3`.
- Long titulky na hero sekce truncate, font scaling `text-3xl md:text-4xl xl:text-5xl`.

### 4. "Stav aplikace" widget pryč
- Blok s progres barem v1/v2 v sidebaru (`app-shell.tsx` 95-111) **smazán**. Místo něj **`LogoutButton`** (komponenta `components/auth/logout-button.tsx`).
- `ProgressPill` helper odstraněn (byl použit jen tam).

### 5. Mobile-first navigace
- Pod hlavním headerem nová **sticky pills lišta** (`lg:hidden`, `top-[60px]`) s **horizontal scrollable** seznamem všech sekcí (Vedení / Sekce / Analytika / Operativa, dohromady 22 pills). Každý pill = ikona + název + active state.
- Plný 2-sloupcový grid s nadpisy skupin zachován v collapsible `<details>` "Navigace všech oblastí" pod pills lištou.
- Header zjednodušen: tlačítko "Export PDF" zůstává jen na sm+, status pill pryč.

### 6. Password gate
- `components/auth/password-gate.tsx` (`'use client'`): full-screen modal, heslo `AURESHR12345`, `localStorage["aures-hr-overview-unlocked"]`. Pre-mount placeholder div proti hydration mismatch.
- Wrap v `app/layout.tsx` kolem `{children}`.
- "Odhlásit se" v sidebar footeru (desktop) i v mobile collapsible navigace (`LogoutButton variant="dark|light"`).
- **Note**: gate je client-side security-by-obscurity, ne enterprise auth. Pro veřejné demo postačuje.

### 7. GitHub Pages
- `next.config.ts` `basePath: /hr-analytics-aures` se aktivuje při `GITHUB_PAGES=true` v existujícím workflow `.github/workflows/pages.yml`. URL: `https://ondradol.github.io/hr-analytics-aures/`.

## Out of scope
- Country switcher (zrušený uživatelem — pracujeme jen s CZ daty).
- Backend / serverside auth.
- Žádné další sekce nad Retention/Workforce-Movement/Succession nedostaly `peopleHighlight`.

## Verifikace
```
pnpm test    # 89/89 ✓
pnpm build   # 24 stránek static export ✓
```

## Plán
Plán: `~/.claude/plans/ancient-stargazing-shannon.md` (Codex-friendly, self-contained).
