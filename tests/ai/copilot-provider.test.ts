import { describe, expect, it } from 'vitest';
import copilotQueries from '@/content/copilot-queries.json';
import {
  MockCopilotProvider,
  type CopilotQuery,
} from '@/lib/ai/copilot-provider';
import { ANALYTICS_TOPICS } from '@/lib/analytics/cross-cutting';
import { OPERATIONAL_VIEWS } from '@/lib/analytics/operational-views';
import { SECTION_CATALOG } from '@/lib/sections/catalog';

const queries = copilotQueries as CopilotQuery[];

describe('MockCopilotProvider', () => {
  it('returns contextual queries before generic queries', async () => {
    const provider = new MockCopilotProvider();
    const items = await provider.list({
      activeHref: '/analytika/attrition',
      sectionLabel: 'Analytika',
      sectionTitle: 'Attrition deep dive',
    });

    expect(items).toHaveLength(8);
    expect(items[0]?.id).toBe('attrition-growth');
    expect(items.some((item) => item.context === 'global')).toBe(true);
  });

  it('returns executive suggestions for the root dashboard', async () => {
    const provider = new MockCopilotProvider();
    const items = await provider.list({ activeHref: '/', sectionLabel: 'Vedení' });

    expect(items[0]?.id).toBe('leadership-priorities');
    expect(items.map((item) => item.id)).toContain('demo-narrative');
  });

  it('answers a known query from prepared content', async () => {
    const answer = await new MockCopilotProvider().answer('pay-gap-explanation', {
      activeHref: '/analytika/compensation-pay-gap',
    });

    expect(answer.source).toBe('mock');
    expect(answer.labelCs).toBe('Co vysvětluje rozdíl v odměnách?');
    expect(answer.answerMarkdownCs).toContain('/analytika/compensation-pay-gap');
  });

  it('returns a fallback answer for an unknown query', async () => {
    const answer = await new MockCopilotProvider().answer('missing-query', {
      activeHref: '/sekce/recruitment',
      sectionTitle: 'Nábor',
    });

    expect(answer.source).toBe('fallback');
    expect(answer.context).toBe('section');
    expect(answer.answerMarkdownCs).toContain('Nábor');
  });

  it('only links to existing application routes', () => {
    const allowedRoutes = new Set([
      '/',
      ...SECTION_CATALOG.map((section) => section.href),
      ...ANALYTICS_TOPICS.map((topic) => topic.href),
      ...OPERATIONAL_VIEWS.map((view) => view.href),
    ]);

    for (const query of queries) {
      const links = Array.from(query.answerMarkdownCs.matchAll(/\[[^\]]+\]\(([^)]+)\)/g));
      expect(links.length, query.id).toBeGreaterThan(0);

      for (const link of links) {
        expect(allowedRoutes.has(link[1] ?? ''), `${query.id} links to ${link[1]}`).toBe(true);
      }
    }
  });
});
