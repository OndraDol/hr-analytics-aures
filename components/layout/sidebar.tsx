'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Banknote,
  UserPlus,
  ShieldCheck,
  Trophy,
  Heart,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { letter: 'I',    name: 'HR Statistiky',      slug: 'i-hr-statistiky',      Icon: Users },
  { letter: 'II',   name: 'Pohyb zaměstnanců',  slug: 'ii-pohyb-zamestnancu', Icon: ArrowLeftRight },
  { letter: 'III',  name: 'Náklady & Kapacita', slug: 'iii-naklady-kapacita', Icon: Banknote },
  { letter: 'IV',   name: 'Nábor',              slug: 'iv-nabor',             Icon: UserPlus },
  { letter: 'V',    name: 'Retence',            slug: 'v-retence',            Icon: ShieldCheck },
  { letter: 'VI',   name: 'Nástupnictví',       slug: 'vi-nastupnictvi',      Icon: Trophy },
  { letter: 'VII',  name: 'Angažovanost',       slug: 'vii-angazovanost',     Icon: Heart },
  { letter: 'VIII', name: 'Talent & Rozvoj',    slug: 'viii-talent-rozvoj',   Icon: GraduationCap },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col border-r bg-[var(--color-surface)] transition-[width] duration-300 shrink-0 overflow-hidden',
        'border-[var(--color-border)]',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-3 px-4 border-b border-[var(--color-border)] shrink-0">
        <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs shrink-0">
          A
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight truncate">
              AURES Holdings
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">HR Analytics</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <NavLink
          href="/"
          Icon={LayoutDashboard}
          label="Dashboard"
          collapsed={collapsed}
          active={pathname === '/'}
        />

        {!collapsed && (
          <p className="mt-4 mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Sekce
          </p>
        )}

        {SECTIONS.map((s) => (
          <NavLink
            key={s.slug}
            href={`/sekce/${s.slug}`}
            Icon={s.Icon}
            label={`${s.letter} · ${s.name}`}
            collapsed={collapsed}
            active={pathname === `/sekce/${s.slug}`}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex h-10 items-center justify-center border-t border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0"
        aria-label={collapsed ? 'Rozbalit' : 'Sbalit'}
      >
        <ChevronLeft size={16} className={cn('transition-transform duration-300', collapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}

function NavLink({
  href,
  Icon,
  label,
  collapsed,
  active,
}: {
  href: string;
  Icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-xs transition-colors whitespace-nowrap',
        active
          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]',
      )}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
