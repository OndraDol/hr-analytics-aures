import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSectionSnapshots } from '@/lib/kpi-data';
import { KPICard } from '@/components/kpi/kpi-card';
import { PageHeader } from '@/components/layout/header';
import { KPICardSkeleton } from '@/components/ui/skeleton';
import type { KPISection } from '@/lib/kpi/types';
import type { Country } from '@/lib/types';

interface SectionMeta {
  section: KPISection;
  name: string;
  description: string;
}

const SLUG_TO_SECTION: Record<string, SectionMeta> = {
  'i-hr-statistiky': {
    section: 'I',
    name: 'HR Statistiky',
    description:
      'Celkový počet zaměstnanců, FTE poměr, gender pay gap a podíl žen v managementu.',
  },
  'ii-pohyb-zamestnancu': {
    section: 'II',
    name: 'Pohyb zaměstnanců',
    description: 'Nástupy, odchody, nemocnost a nevybraná dovolená.',
  },
  'iii-naklady-kapacita': {
    section: 'III',
    name: 'Náklady & Kapacita',
    description: 'Průměrná mzda, Wage KPI, CAP KPI a odchylky HC od plánu.',
  },
  'iv-nabor': {
    section: 'IV',
    name: 'Nábor',
    description:
      'Doba obsazení, náklady na nábor, kvalita hire a hodnocení zaměstnavatele.',
  },
  'v-retence': {
    section: 'V',
    name: 'Retence',
    description: 'Celková fluktuace a fluktuace na kritických pozicích.',
  },
  'vi-nastupnictvi': {
    section: 'VI',
    name: 'Nástupnictví',
    description: 'Pokrytí kritických pozic identifikovanými nástupci.',
  },
  'vii-angazovanost': {
    section: 'VII',
    name: 'Angažovanost',
    description: 'Employee Net Promoter Score (eNPS) a průzkumy spokojenosti.',
  },
  'viii-talent-rozvoj': {
    section: 'VIII',
    name: 'Talent & Rozvoj',
    description: 'Podíl talent pool a rozvojové programy.',
  },
};

export function generateStaticParams() {
  return Object.keys(SLUG_TO_SECTION).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = SLUG_TO_SECTION[id];
  if (!meta) return {};
  return { title: `${meta.name} · HR Analytics AURES` };
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { id } = await params;
  const { country: countryParam } = await searchParams;

  const meta = SLUG_TO_SECTION[id];
  if (!meta) notFound();

  const country = (countryParam as Country | 'ALL') ?? 'ALL';
  const snapshots = await getSectionSnapshots(meta.section, country);

  return (
    <div className="space-y-6 animate-fade-up max-w-[1200px]">
      <PageHeader
        title={meta.name}
        subtitle={meta.description}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: `Sekce ${meta.section} · ${meta.name}` },
        ]}
      />

      {snapshots.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="text-sm text-zinc-500">Žádná data pro toto období a filtr.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {snapshots.map((snap, i) => (
            <Suspense key={snap.kpiValue.kpiId} fallback={<KPICardSkeleton />}>
              <KPICard
                snapshot={snap}
                className="animate-fade-up stagger"
                style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}
              />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  );
}
