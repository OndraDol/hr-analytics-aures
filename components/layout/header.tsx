import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-1 text-[11px] text-[var(--color-text-muted)]">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="select-none">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[var(--color-text-primary)] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--color-text-secondary)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
