import { notFound } from 'next/navigation';
import { DetailDashboardPage } from '@/components/detail/detail-dashboard-page';
import { AppShell } from '@/components/layout/app-shell';
import {
  OPERATIONAL_VIEWS,
  buildOperationalDashboard,
  getOperationalViewBySlug,
} from '@/lib/analytics/operational-views';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export function generateStaticParams() {
  return OPERATIONAL_VIEWS.map((view) => ({ view: view.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }) {
  const { view: slug } = await params;
  const view = getOperationalViewBySlug(slug);
  if (!view) return {};
  return { title: `${view.title} | AURES HR Analytics` };
}

export default async function OperationalViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view: slug } = await params;
  const view = getOperationalViewBySlug(slug);
  if (!view) notFound();

  const data = await buildOperationalDashboard(mockDataProvider, view, PERIOD);

  return (
    <AppShell activeHref={view.href} sectionLabel="Operativa" sectionTitle={view.title}>
      <DetailDashboardPage data={data} />
    </AppShell>
  );
}
