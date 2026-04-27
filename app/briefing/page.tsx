import type { Metadata } from 'next';
import { ExecutiveBriefingPage } from '@/components/briefing/executive-briefing-page';
import { AppShell } from '@/components/layout/app-shell';
import { buildExecutiveBriefing } from '@/lib/briefing/executive-briefing';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export const metadata: Metadata = {
  title: 'PDF podklad | AURES Přehled lidí',
};

export default async function BriefingPage() {
  const briefing = await buildExecutiveBriefing(mockDataProvider, PERIOD);

  return (
    <AppShell activeHref="/briefing" sectionLabel="Vedení" sectionTitle="PDF podklad">
      <ExecutiveBriefingPage data={briefing} />
    </AppShell>
  );
}
