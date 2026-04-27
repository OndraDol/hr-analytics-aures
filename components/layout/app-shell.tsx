import Link from 'next/link';
import { ChevronDown, CircleGauge, FileDown, FileText, ListChecks, Menu } from 'lucide-react';
import { CopilotFab } from '@/components/copilot/copilot-fab';
import { AuresMonogram } from '@/components/layout/aures-monogram';
import { ANALYTICS_TOPICS } from '@/lib/analytics/cross-cutting';
import { OPERATIONAL_VIEWS } from '@/lib/analytics/operational-views';
import { getProjectProgress } from '@/lib/project/progress';
import { SECTION_CATALOG } from '@/lib/sections/catalog';
import { cn } from '@/lib/utils';

export function AppShell({
  children,
  activeHref = '/',
  sectionLabel = 'Vedení',
  sectionTitle = 'HR Overview',
}: {
  children: React.ReactNode;
  activeHref?: string;
  sectionLabel?: string;
  sectionTitle?: string;
}) {
  const v1Progress = getProjectProgress();
  const v2Progress = getProjectProgress(undefined, 'v2');
  const navGroups = [
    {
      label: 'Vedení',
      items: [
        { href: '/', label: 'Hlavní přehled', icon: CircleGauge },
        { href: '/akce', label: 'Akční úkoly', icon: ListChecks },
        { href: '/briefing', label: 'PDF podklad', icon: FileText },
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
      <aside className="print-hidden fixed inset-y-0 left-0 hidden w-64 border-r border-aures-blue-800 bg-gradient-to-b from-aures-blue-950 via-aures-blue-900 to-aures-graphite-900 text-zinc-100 lg:flex lg:flex-col">
        <div className="px-4 py-5">
          <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-1">
            <AuresMonogram />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aures-blue-200">AURES Holdings</p>
              <p className="mt-1 text-xl font-semibold text-white">HR Overview</p>
            </div>
          </Link>
        </div>
        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-aures-blue-200/75">{group.label}</p>
              <div className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white',
                        active && 'bg-aures-orange-500/15 text-aures-orange-300 ring-1 ring-aures-orange-400/20',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t border-aures-blue-800/80 p-4">
          <div className="rounded-lg border border-aures-blue-800 bg-aures-blue-900/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-aures-blue-200">Stav aplikace</p>
                <p className="mt-1 text-xs text-zinc-300">Q1 2026 · ukázková data</p>
              </div>
              <p className="font-mono text-sm font-semibold text-white">{v2Progress.percent} %</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-medium text-zinc-300">
              <ProgressPill label="v1" percent={v1Progress.percent} colorClass="bg-emerald-500" />
              <ProgressPill label="v2" percent={v2Progress.percent} colorClass="bg-aures-orange-500" />
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="print-hidden sticky top-0 z-20 border-b-2 border-aures-blue-100 bg-white/90 px-5 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{sectionLabel}</p>
              <p className="text-sm font-medium text-zinc-950">{sectionTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/briefing"
                className="hidden items-center gap-2 rounded-full bg-aures-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-aures-orange-600 sm:inline-flex"
              >
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                stav {v2Progress.percent} %
              </div>
            </div>
          </div>
          <details className="group mt-3 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-aures-blue-100 bg-aures-blue-50 px-3 py-2 text-sm font-semibold text-aures-blue-950 marker:hidden">
              <span className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                Navigace
              </span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <nav className="mt-3 grid gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{group.label}</p>
                  <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = item.href === activeHref;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-aures-blue-50 hover:text-aures-blue-800',
                            active && 'bg-aures-orange-50 text-aures-orange-700 ring-1 ring-aures-orange-200',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </details>
        </header>
        {children}
      </div>
      <CopilotFab context={{ activeHref, sectionLabel, sectionTitle }} />
    </div>
  );
}

function ProgressPill({
  label,
  percent,
  colorClass,
}: {
  label: string;
  percent: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span>{percent} %</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-aures-blue-950">
        <div className={cn('h-full rounded-full', colorClass)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
