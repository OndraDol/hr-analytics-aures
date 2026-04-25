import type { Metadata } from 'next';
import { ActionBacklogPage } from '@/components/actions/action-backlog-page';
import { AppShell } from '@/components/layout/app-shell';
import { buildActionBacklog } from '@/lib/actions/action-backlog';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export const metadata: Metadata = {
  title: 'Akční backlog | AURES HR Analytics',
};

export default async function ActionsPage() {
  const backlog = await buildActionBacklog(mockDataProvider, PERIOD);

  return (
    <AppShell activeHref="/akce" sectionLabel="Akce" sectionTitle="Akční backlog">
      <ActionBacklogPage data={backlog} />
    </AppShell>
  );
}
