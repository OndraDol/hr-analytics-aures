import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GenericSectionPage } from '@/components/sections/section-page';
import { mockAIInsightProvider } from '@/lib/ai/insight-provider';
import { buildSectionDashboard } from '@/lib/analytics/section-summaries';
import { mockDataProvider } from '@/lib/data/mock-provider';
import { getSectionBySlug, SECTION_CATALOG } from '@/lib/sections/catalog';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export function generateStaticParams() {
  return SECTION_CATALOG.filter((section) => section.slug !== 'retention').map((section) => ({
    slug: section.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section || section.slug === 'retention') return {};
  return { title: `${section.title} | AURES HR Analytics` };
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section || section.slug === 'retention') notFound();

  const data = await buildSectionDashboard(mockDataProvider, section, PERIOD, mockAIInsightProvider);

  return (
    <AppShell activeHref={section.href} sectionLabel={section.eyebrow} sectionTitle={section.title}>
      <GenericSectionPage data={data} />
    </AppShell>
  );
}
