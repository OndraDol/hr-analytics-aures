'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Country } from '@/lib/types';

const COUNTRIES: Array<{ value: Country | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Všechny' },
  { value: 'CZ',  label: '🇨🇿 CZ' },
  { value: 'SK',  label: '🇸🇰 SK' },
  { value: 'PL',  label: '🇵🇱 PL' },
  { value: 'HU',  label: '🇭🇺 HU' },
  { value: 'DE',  label: '🇩🇪 DE' },
];

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const country = (searchParams.get('country') as Country | 'ALL') ?? 'ALL';

  function setCountry(val: Country | 'ALL') {
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'ALL') params.delete('country');
    else params.set('country', val);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs shrink-0">
      <span className="text-[var(--color-text-muted)] font-medium">Země:</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {COUNTRIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCountry(c.value)}
            className={cn(
              'px-2.5 py-1 rounded-full border transition-colors',
              country === c.value
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="ml-auto text-[var(--color-text-muted)]">
        Rok:{' '}
        <strong className="text-[var(--color-text-primary)]">2025</strong>
      </div>
    </div>
  );
}
