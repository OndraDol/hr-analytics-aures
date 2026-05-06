# HR Analytics AURES — instrukce pro Claude

## Aktivní plán

**Vždy si na začátku přečti:** `docs/plans/2026-05-06-logical-content-pass.md`

Tento plán je rozpracovaný, neběží žádná implementace — jeho obsah řídí všechny další úpravy prototypu (logický a obsahový pass napříč webem). Před jakýmkoliv zásahem do `lib/`, `components/` nebo `app/` plán znovu otevři, ať pracuješ proti aktuálnímu znění.

## Kontext

- HR Director: **Marie Voršílková** (NE Kateřina Topolová) — primární persona executive dashboardu
- Stack: Next.js 15, React 19, TypeScript, Tailwind, vitest, Playwright
- Mock + real data; klíčové architektonické pointy v `PROJEKT_ZAZNAM.md`

## Workflow

- Plán implementovat fáze po fázi (1 → 6), každá samostatně mergovatelná
- Po každé fázi: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
- Větvení: feature branch → merge do `main` (uživatel push potvrzuje)
