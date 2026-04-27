import { describe, it, expect } from 'vitest';
import { SECTION_CATALOG } from '@/lib/sections/catalog';

describe('SECTION_CATALOG', () => {
  it('contains all 8 BI sections with unique slugs and primary KPI codes', () => {
    expect(SECTION_CATALOG).toHaveLength(8);
    expect(new Set(SECTION_CATALOG.map((section) => section.slug)).size).toBe(8);
    expect(new Set(SECTION_CATALOG.map((section) => section.id)).size).toBe(8);
    expect(SECTION_CATALOG.every((section) => section.primaryKpi.length > 0)).toBe(true);
  });

  it('contains route and related-link metadata for each section', () => {
    for (const section of SECTION_CATALOG) {
      expect(section.href).toBe(`/sekce/${section.slug}`);
      expect(section.relatedAnalytics.length).toBeGreaterThan(0);
      expect(section.relatedOperational.length).toBeGreaterThan(0);
    }
  });

  it('names the first section for HR users, not analysts', () => {
    expect(SECTION_CATALOG[0]!.title).toBe('Stav zaměstnanců');
    expect(SECTION_CATALOG[0]!.description).toContain('Kolik lidí');
  });

  it('uses Czech section labels in the main navigation', () => {
    const labels = SECTION_CATALOG.flatMap((section) => [
      section.title,
      section.shortTitle,
      section.description,
      ...section.relatedAnalytics.map((link) => link.label),
      ...section.relatedOperational.map((link) => link.label),
    ]).join(' ');

    expect(labels).not.toMatch(/\bRecruitment\b|\bRetention\b|\bSuccession\b|\bEngagement\b|\bTalent\b|deep dive|funnel|candidate experience/i);
  });
});
