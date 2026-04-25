import queries from '@/content/copilot-queries.json';

export type CopilotContextType = 'global' | 'executive' | 'section' | 'analytics' | 'operational';

export interface CopilotContext {
  activeHref?: string;
  sectionLabel?: string;
  sectionTitle?: string;
  contextType?: CopilotContextType;
}

export interface CopilotQuery {
  id: string;
  labelCs: string;
  context: CopilotContextType;
  suggestedFor?: string[];
  answerMarkdownCs: string;
}

export interface CopilotAnswer {
  queryId: string;
  labelCs: string;
  answerMarkdownCs: string;
  context: CopilotContextType;
  source: 'mock' | 'fallback';
}

export interface CopilotProvider {
  list(context?: CopilotContext): Promise<CopilotQuery[]>;
  answer(queryId: string, context?: CopilotContext): Promise<CopilotAnswer>;
}

const allQueries = queries as CopilotQuery[];

function inferContextType(context?: CopilotContext): CopilotContextType {
  if (context?.contextType) return context.contextType;
  const activeHref = context?.activeHref ?? '';
  if (activeHref === '/') return 'executive';
  if (activeHref.startsWith('/sekce/')) return 'section';
  if (activeHref.startsWith('/analytika/')) return 'analytics';
  if (activeHref.startsWith('/operativa/')) return 'operational';
  return 'global';
}

function scoreQuery(query: CopilotQuery, context?: CopilotContext): number {
  const contextType = inferContextType(context);
  const activeHref = context?.activeHref;
  if (activeHref && query.suggestedFor?.includes(activeHref)) return 4;
  if (query.context === contextType) return 3;
  if (query.context === 'global') return 2;
  return 1;
}

function byContextScore(context?: CopilotContext) {
  return (left: CopilotQuery, right: CopilotQuery): number => {
    const scoreDiff = scoreQuery(right, context) - scoreQuery(left, context);
    if (scoreDiff !== 0) return scoreDiff;
    return allQueries.indexOf(left) - allQueries.indexOf(right);
  };
}

function fallbackAnswer(context?: CopilotContext): CopilotAnswer {
  const contextType = inferContextType(context);
  const title = context?.sectionTitle ?? 'aktuální stránka';

  return {
    queryId: '*',
    labelCs: 'Obecná odpověď',
    context: contextType,
    source: 'fallback',
    answerMarkdownCs: `### Kontext není připravený\nPro ${title} zatím není připravená konkrétní demo odpověď. Použijte doporučené otázky v sidebaru nebo přejděte na [Executive dashboard](/), kde je sada ukázkových dotazů nejširší.\n\nDemo Copilot v této fázi nepoužívá live AI model a odpovídá jen z předpřipraveného obsahu.`,
  };
}

export class MockCopilotProvider implements CopilotProvider {
  async list(context?: CopilotContext): Promise<CopilotQuery[]> {
    return [...allQueries].sort(byContextScore(context)).slice(0, 8);
  }

  async answer(queryId: string, context?: CopilotContext): Promise<CopilotAnswer> {
    const query = allQueries.find((item) => item.id === queryId);
    if (!query) return fallbackAnswer(context);

    return {
      queryId: query.id,
      labelCs: query.labelCs,
      answerMarkdownCs: query.answerMarkdownCs,
      context: query.context,
      source: 'mock',
    };
  }
}

export const mockCopilotProvider = new MockCopilotProvider();
