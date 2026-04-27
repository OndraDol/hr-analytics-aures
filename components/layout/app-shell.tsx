import Link from 'next/link';
import { ChevronDown, CircleGauge, FileDown, FileText, ListChecks, Menu } from 'lucide-react';
import { CopilotFab } from '@/components/copilot/copilot-fab';
import { AuresMonogram } from '@/components/layout/aures-monogram';
import { LogoutButton } from '@/components/auth/logout-button';
import { ANALYTICS_TOPICS } from '@/lib/analytics/cross-cutting';
import { OPERATIONAL_VIEWS } from '@/lib/analytics/operational-views';
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

  const allPills = navGroups.flatMap((group) => group.items);

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
          <LogoutButton />
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="print-hidden sticky top-0 z-20 border-b-2 border-aures-blue-100 bg-white/90 px-5 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{sectionLabel}</p>
              <p className="truncate text-sm font-medium text-zinc-950">{sectionTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/briefing"
                className="hidden items-center gap-2 rounded-full bg-aures-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-aures-orange-600 sm:inline-flex"
              >
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </Link>
            </div>
          </div>
        </header>
        <nav
          aria-label="Sekce"
          className="print-hidden sticky top-[60px] z-10 -mx-px border-b border-zinc-200 bg-white/90 backdrop-blur lg:hidden"
        >
          <div className="flex gap-2 overflow-x-auto px-5 py-2">
            {allPills.map((item) => {
              const Icon = item.icon;
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition',
                    active
                      ? 'border-aures-orange-300 bg-aures-orange-50 text-aures-orange-800'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-aures-blue-200 hover:bg-aures-blue-50 hover:text-aures-blue-800',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <details className="group mx-5 mt-3 lg:hidden" aria-label="Navigace">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-aures-blue-100 bg-aures-blue-50 px-3 py-2 text-sm font-semibold text-aures-blue-950 marker:hidden">
            <span className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Navigace všech oblastí
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
            <div className="border-t border-zinc-200 pt-3">
              <LogoutButton variant="light" />
            </div>
          </nav>
        </details>
        <div className="mx-auto max-w-screen-2xl">{children}</div>
      </div>
      <CopilotFab context={{ activeHref, sectionLabel, sectionTitle }} />
    </div>
  );
}
