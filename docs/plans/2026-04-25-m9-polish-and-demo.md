# Implementační plán — Milník 9 (Polish, demo setup, PDF briefing)

> **Stav k 2026-04-25:** M9 je implementovaný jako finální prezentační vrstva prototypu. Projekt je pro demo v1 vedený jako 100% dokončený.

## Cíl

Dodat poslední dvě featury nad M0-M8:

1. Polish a demo setup pro průchod s HR Directorkou.
2. PDF briefing export přes tisknutelnou route `/briefing`.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `lib/project/progress.ts` | Deterministický model dokončení projektu |
| `lib/briefing/executive-briefing.ts` | View-model pro executive briefing |
| `app/briefing/page.tsx` | Tisknutelná briefing route |
| `components/briefing/executive-briefing-page.tsx` | UI PDF briefingu |
| `components/briefing/print-button.tsx` | Browser print export |
| `components/layout/page-loading.tsx` | Sdílený loading stav |
| `components/layout/empty-state.tsx` | Sdílený empty stav |
| `docs/demo-walkthrough-hr-director.md` | Doporučený demo průchod |

## Dokončení projektu

- Před M9 + PDF exportem: **82 %** prezentačního prototypu.
- Po M9 + PDF exportu: **100 %** prezentačního prototypu v1.
- Procento se zobrazuje v `AppShell` a používá ho briefing.

## Ověření

```bash
pnpm lint
pnpm typecheck
pnpm test tests/project/progress.test.ts tests/briefing/executive-briefing.test.ts
pnpm build
```

## Poznámka k exportu

PDF se negeneruje na serveru. Route `/briefing` je optimalizovaná pro browser print flow, takže uživatel použije systémový dialog pro uložení do PDF.
