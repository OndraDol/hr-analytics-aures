import { Suspense } from 'react';
import { Sidebar } from './sidebar';
import { FilterBar } from './filter-bar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<div className="h-10 border-b border-[var(--color-border)]" />}>
          <FilterBar />
        </Suspense>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
