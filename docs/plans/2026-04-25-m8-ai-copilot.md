# Implementační plán — Milník 8 (AI Copilot)

> **Stav k 2026-04-25:** M8 je implementovaný. Aplikace má globální demo Copilot dostupný přes floating button ve všech stránkách, mock provider, 10 předpřipravených dotazů, typewriter efekt a testy provideru.

## Cíl

Doplnit globální AI Copilot zážitek napříč aplikací:

1. Floating action button dostupný na všech stránkách.
2. Sidebar / sheet s chat-like rozhraním.
3. 8-12 předpřipravených dotazů a odpovědí.
4. Typewriter efekt při zobrazení odpovědi.
5. `CopilotProvider` interface pro mock a budoucí live implementaci.
6. Kontextové dotazy podle aktuální stránky: Executive, sekce, analytika, operativa.

## Hotové soubory

| Soubor | Účel |
|---|---|
| `content/copilot-queries.json` | pre-canned otázky a markdown odpovědi |
| `lib/ai/copilot-provider.ts` | `CopilotProvider`, query model, mock provider |
| `components/copilot/copilot-fab.tsx` | floating button pro otevření Copilota |
| `components/copilot/copilot-sidebar.tsx` | client-side panel se seznamem dotazů a odpovědí |
| `components/copilot/typewriter-text.tsx` | malý typewriter efekt bez externí dependency |
| `tests/ai/copilot-provider.test.ts` | test výběru dotazů, fallbacku a kontextů |

## Datový kontrakt

```ts
interface CopilotQuery {
  id: string;
  labelCs: string;
  context: 'global' | 'executive' | 'section' | 'analytics' | 'operational';
  suggestedFor?: string[];
  answerMarkdownCs: string;
}

interface CopilotProvider {
  list(context?: CopilotContext): Promise<CopilotQuery[]>;
  answer(queryId: string, context?: CopilotContext): Promise<CopilotAnswer>;
}
```

## Obsah dotazů

Minimální sada pro demo:

- Proč roste fluktuace?
- Kde máme největší retenční riziko?
- Co vysvětluje pay gap?
- Který recruitment kanál je nejdražší?
- Kde se ztrácí kandidáti ve funnelu?
- Kde máme problém s nemocností?
- Co má HR udělat tento týden?
- Které segmenty potřebují eNPS follow-up?
- Jaká rizika jsou pro leadership nejdůležitější?
- Co bych ukázal CEO jako první?

## UX pravidla

- Copilot musí být globální doplněk, ne hlavní navigace.
- Text odpovědí musí být jasně označený jako demo / pre-generated.
- Odpověď má odkazovat na konkrétní existující routy, např. `/analytika/attrition`.
- UI nesmí blokovat hlavní dashboard; sidebar se zavírá bez ztráty stránky.
- Žádné live API volání v M8.

## Implementační kroky

1. ✅ Připravit JSON obsah a provider.
2. ✅ Přidat testy provideru.
3. ✅ Postavit client component sidebar a typewriter.
4. ✅ Napojit FAB do `AppShell`.
5. ✅ Přidat kontext z `activeHref`.
6. ✅ Ověřit přes lint, typecheck a cílený test.
7. ✅ Zapsat stav do `PROJEKT_ZAZNAM.md`.

## Ověření

```bash
pnpm lint
pnpm typecheck
pnpm test tests/ai/copilot-provider.test.ts
pnpm build
```

## Pozdější rozšíření

- Live model provider přes OpenAI/Anthropic API.
- RAG-like kontext z aktuálních KPI modelů.
- Export odpovědi do action backlogu.
- Per-user historie dotazů.
