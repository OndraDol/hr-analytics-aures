import Link from 'next/link';
import { CircleGauge, FileDown, FileText, ListChecks } from 'lucide-react';
import { CopilotFab } from '@/components/copilot/copilot-fab';
import { ANALYTICS_TOPICS } from '@/lib/analytics/cross-cutting';
import { OPERATIONAL_VIEWS } from '@/lib/analytics/operational-views';
import { getProjectProgress } from '@/lib/project/progress';
import { SECTION_CATALOG } from '@/lib/sections/catalog';
import { cn } from '@/lib/utils';

export function AppShell({
  children,
  activeHref = '/',
  sectionLabel = 'Executive',
  sectionTitle = 'HR Analytics',
}: {
  children: React.ReactNode;
  activeHref?: string;
  sectionLabel?: string;
  sectionTitle?: string;
}) {
  const projectProgress = getProjectProgress();
  const navGroups = [
    {
      label: 'Executive',
      items: [
        { href: '/', label: 'Executive', icon: CircleGauge },
        { href: '/akce', label: 'Akční backlog', icon: ListChecks },
        { href: '/briefing', label: 'PDF briefing', icon: FileText },
      ],
    },
    {
      label: 'Sekce',
      items: SECTION_CATALOG.map((section) => ({
        href: section.href,
        label: section.shortTitle,
        icon: section.icon,
      })),
    },
    {
      label: 'Analytika',
      items: ANALYTICS_TOPICS.map((topic) => ({
        href: topic.href,
        label: topic.shortTitle,
        icon: topic.icon,
      })),
    },
    {
      label: 'Operativa',
      items: OPERATIONAL_VIEWS.map((view) => ({
        href: view.href,
        label: view.shortTitle,
        icon: view.icon,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-zinc-950">
      <aside className="print-hidden fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r border-zinc-200 bg-white px-4 py-5 pb-40 lg:block">
        <Link href="/" className="block rounded-md px-2 py-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">AURES Holdings</p>
          <p className="mt-1 text-xl font-semibold text-zinc-950">HR Analytics</p>
        </Link>
        <nav className="mt-8 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{group.label}</p>
              <div className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                        active && 'bg-blue-50 text-blue-700',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs font-semibold text-zinc-500">Demo snapshot</p>
          <p className="mt-1 text-sm text-zinc-800">Q1 2026 · mock + real skeleton</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>Dokončení prototypu</span>
              <span>{projectProgress.percent} %</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full rounded-full bg-blue-700" style={{ width: `${projectProgress.percent}%` }} />
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="print-hidden sticky top-0 z-20 border-b border-zinc-200 bg-white/85 px-5 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{sectionLabel}</p>
              <p className="text-sm font-medium text-zinc-950">{sectionTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/briefing"
                className="hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 sm:inline-flex"
              >
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {projectProgress.percent} % hotovo
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
      <CopilotFab context={{ activeHref, sectionLabel, sectionTitle }} />
    </div>
  );
}
