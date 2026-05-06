import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  HeartPulse,
  LineChart,
  Network,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { KpiCode, SectionId } from '@/lib/kpi/catalog';

export type SectionSlug =
  | 'hr-statistics'
  | 'workforce-movement'
  | 'cost-structure'
  | 'recruitment'
  | 'retention'
  | 'succession'
  | 'engagement'
  | 'talent-growth';

export interface SectionDefinition {
  id: SectionId;
  slug: SectionSlug;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  primaryKpi: KpiCode;
  secondaryKpis: KpiCode[];
  icon: LucideIcon;
  accent: string;
  href: string;
  relatedAnalytics: Array<{ label: string; href: string }>;
  relatedOperational: Array<{ label: string; href: string }>;
}

export const SECTION_CATALOG: readonly SectionDefinition[] = [
  {
    id: 'I',
    slug: 'hr-statistics',
    title: 'Stav zaměstnanců',
    shortTitle: 'Lidé',
    eyebrow: 'Sekce I',
    description: 'Kolik lidí a FTE firma má, kde se stav mění a co to znamená pro plán kapacit, DEI a odměňování.',
    primaryKpi: 'HR_STATS',
    secondaryKpis: ['HC_FTE_DIV', 'AVG_WAGE'],
    icon: BarChart3,
    accent: '#1d4ed8',
    href: '/sekce/hr-statistics',
    relatedAnalytics: [{ label: 'Odměňování a rozdíly v odměnách', href: '/analytika/compensation-pay-gap' }],
    relatedOperational: [{ label: 'Lidé pro ESG reporting', href: '/operativa/esg' }],
  },
  {
    id: 'II',
    slug: 'workforce-movement',
    title: 'Nástupy a odchody',
    shortTitle: 'Pohyb',
    eyebrow: 'Sekce II',
    description: 'Pohyb zaměstnanců po divizích, zemích a aktuální čistá změna.',
    primaryKpi: 'WF_MOVEMENT',
    secondaryKpis: ['FLUCT', 'TTF'],
    icon: LineChart,
    accent: '#2563eb',
    href: '/sekce/workforce-movement',
    relatedAnalytics: [{ label: 'Detail odchodů', href: '/analytika/attrition' }],
    relatedOperational: [{ label: 'Seznam nástupů a odchodů', href: '/operativa/hired-fired' }],
  },
  {
    id: 'III',
    slug: 'cost-structure',
    title: 'Náklady a struktura',
    shortTitle: 'Náklady',
    eyebrow: 'Sekce III',
    description: 'Mzdové náklady, kapacitní plán, FTE a průměrná mzda.',
    primaryKpi: 'WAGE_KPI',
    secondaryKpis: ['CAP_KPI', 'HC_FTE_DIV', 'AVG_WAGE'],
    icon: CircleDollarSign,
    accent: '#f97316',
    href: '/sekce/cost-structure',
    relatedAnalytics: [{ label: 'Odměňování a rozdíly v odměnách', href: '/analytika/compensation-pay-gap' }],
    relatedOperational: [{ label: 'Zůstatky dovolené', href: '/operativa/vacation-balances' }],
  },
  {
    id: 'IV',
    slug: 'recruitment',
    title: 'Nábor',
    shortTitle: 'Nábor',
    eyebrow: 'Sekce IV',
    description: 'Jak rychle obsazujeme role, kde se nábor zpomaluje a kolik nás stojí jeden nástup.',
    primaryKpi: 'TTF',
    secondaryKpis: ['TTF_CRIT', 'TIME_TO_PROD', 'CPH', 'QUALITY_HIRE', 'EMPLOYER_EVAL'],
    icon: BriefcaseBusiness,
    accent: '#0ea5e9',
    href: '/sekce/recruitment',
    relatedAnalytics: [{ label: 'Průchod náborem', href: '/analytika/recruitment-funnel' }],
    relatedOperational: [{ label: 'Seznam nástupů a odchodů', href: '/operativa/hired-fired' }],
  },
  {
    id: 'V',
    slug: 'retention',
    title: 'Udržení lidí',
    shortTitle: 'Udržení',
    eyebrow: 'Sekce V',
    description: 'Kde lidé odcházejí, jak moc to ohrožuje klíčové role a co má HR ověřit jako první.',
    primaryKpi: 'FLUCT',
    secondaryKpis: ['FLUCT_CRIT', 'ENPS', 'SUCCESSION'],
    icon: HeartPulse,
    accent: '#e11d48',
    href: '/sekce/retention',
    relatedAnalytics: [{ label: 'Detail odchodů', href: '/analytika/attrition' }],
    relatedOperational: [{ label: 'Seznam nástupů a odchodů', href: '/operativa/hired-fired' }],
  },
  {
    id: 'VI',
    slug: 'succession',
    title: 'Nástupnictví',
    shortTitle: 'Nástupci',
    eyebrow: 'Sekce VI',
    description: 'Které klíčové role mají nástupce, kde je mezera a kdo potřebuje plán rozvoje.',
    primaryKpi: 'SUCCESSION',
    secondaryKpis: ['FLUCT_CRIT', 'TALENT_GROWTH'],
    icon: Network,
    accent: '#7c3aed',
    href: '/sekce/succession',
    relatedAnalytics: [{ label: 'Pokrytí kritických rolí', href: '/analytika/succession-coverage' }],
    relatedOperational: [{ label: 'Organizační struktura', href: '/operativa/org-chart' }],
  },
  {
    id: 'VII',
    slug: 'engagement',
    title: 'Spokojenost a zapojení',
    shortTitle: 'Zapojení',
    eyebrow: 'Sekce VII',
    description: 'Jak lidé hodnotí firmu, kde je slabší odezva a které týmy potřebují navazující rozhovor.',
    primaryKpi: 'ENPS',
    secondaryKpis: ['FLUCT', 'SICKNESS_RATE'],
    icon: Activity,
    accent: '#10b981',
    href: '/sekce/engagement',
    relatedAnalytics: [{ label: 'Zapojení vs odchody', href: '/analytika/engagement-pulse' }],
    relatedOperational: [{ label: 'Poslední eNPS měření', href: '/operativa/enps-latest' }],
  },
  {
    id: 'VIII',
    slug: 'talent-growth',
    title: 'Talenty a rozvoj',
    shortTitle: 'Rozvoj',
    eyebrow: 'Sekce VIII',
    description: 'Kolik lidí má růstový potenciál, jak je rozvíjíme a kde mohou pokrýt budoucí role.',
    primaryKpi: 'TALENT_GROWTH',
    secondaryKpis: ['SUCCESSION', 'QUALITY_HIRE'],
    icon: Sparkles,
    accent: '#db2777',
    href: '/sekce/talent-growth',
    relatedAnalytics: [{ label: 'Růstový potenciál a 9-box', href: '/analytika/talent-pipeline' }],
    relatedOperational: [{ label: 'Lidé pro ESG reporting', href: '/operativa/esg' }],
  },
] as const;

export const SECTION_BY_SLUG = new Map<SectionSlug, SectionDefinition>(
  SECTION_CATALOG.map((section) => [section.slug, section]),
);

export function getSectionBySlug(slug: string): SectionDefinition | null {
  return SECTION_BY_SLUG.get(slug as SectionSlug) ?? null;
}
