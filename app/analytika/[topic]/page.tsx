import { notFound } from 'next/navigation';
import { DetailDashboardPage } from '@/components/detail/detail-dashboard-page';
import { AppShell } from '@/components/layout/app-shell';
import { MotionStack } from '@/components/layout/motion-stack';
import {
  ANALYTICS_TOPICS,
  buildCrossCuttingDashboard,
  getAnalyticsTopicBySlug,
} from '@/lib/analytics/cross-cutting';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export function generateStaticParams() {
  return ANALYTICS_TOPICS.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = await params;
  const topic = getAnalyticsTopicBySlug(slug);
  if (!topic) return {};
  return { title: `${topic.title} | AURES HR Analytics` };
}

export default async function AnalyticsTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = await params;
  const topic = getAnalyticsTopicBySlug(slug);
  if (!topic) notFound();

  const data = await buildCrossCuttingDashboard(mockDataProvider, topic, PERIOD);

  return (
    <AppShell activeHref={topic.href} sectionLabel="Analytika" sectionTitle={topic.title}>
      <MotionStack>
        <DetailDashboardPage data={data} />
      </MotionStack>
    </AppShell>
  );
}
