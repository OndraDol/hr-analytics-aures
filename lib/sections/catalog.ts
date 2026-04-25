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
    title: 'HR statistiky',
    shortTitle: 'HR Stats',
    eyebrow: 'Sekce I',
    description: 'Základní populace, FTE, demografie, DEI a rozdíly v odměňování.',
    primaryKpi: 'HR_STATS',
    secondaryKpis: ['HC_FTE_DIV', 'AVG_WAGE'],
    icon: BarChart3,
    accent: '#1d4ed8',
    href: '/sekce/hr-statistics',
    relatedAnalytics: [{ label: 'Compensation & pay gap', href: '/analytika/compensation-pay-gap' }],
    relatedOperational: [{ label: 'ESG people data', href: '/operativa/esg' }],
  },
  {
    id: 'II',
    slug: 'workforce-movement',
    title: 'Nástupy a odchody',
    shortTitle: 'Movement',
    eyebrow: 'Sekce II',
    description: 'Pohyb zaměstnanců po divizích, zemích a aktuální čistá změna.',
    primaryKpi: 'WF_MOVEMENT',
    secondaryKpis: ['FLUCT', 'TTF'],
    icon: LineChart,
    accent: '#2563eb',
    href: '/sekce/workforce-movement',
    relatedAnalytics: [{ label: 'Attrition deep dive', href: '/analytika/attrition' }],
    relatedOperational: [{ label: 'Nástupy / odchody', href: '/operativa/hired-fired' }],
  },
  {
    id: 'III',
    slug: 'cost-structure',
    title: 'Náklady a struktura',
    shortTitle: 'Cost',
    eyebrow: 'Sekce III',
    description: 'Mzdové náklady, kapacitní plán, FTE a průměrná mzda.',
    primaryKpi: 'WAGE_KPI',
    secondaryKpis: ['CAP_KPI', 'HC_FTE_DIV', 'AVG_WAGE'],
    icon: CircleDollarSign,
    accent: '#f97316',
    href: '/sekce/cost-structure',
    relatedAnalytics: [{ label: 'Compensation & pay gap', href: '/analytika/compensation-pay-gap' }],
    relatedOperational: [{ label: 'Budget export', href: '/operativa/budget' }],
  },
  {
    id: 'IV',
    slug: 'recruitment',
    title: 'Recruitment',
    shortTitle: 'Recruitment',
    eyebrow: 'Sekce IV',
    description: 'Rychlost náboru, funnel, náklady, kvalita náboru a candidate experience.',
    primaryKpi: 'TTF',
    secondaryKpis: ['TTF_CRIT', 'TIME_TO_PROD', 'CPH', 'QUALITY_HIRE', 'EMPLOYER_EVAL'],
    icon: BriefcaseBusiness,
    accent: '#0ea5e9',
    href: '/sekce/recruitment',
    relatedAnalytics: [{ label: 'Recruitment funnel', href: '/analytika/recruitment-funnel' }],
    relatedOperational: [{ label: 'Vacancy report', href: '/operativa/vacancies' }],
  },
  {
    id: 'V',
    slug: 'retention',
    title: 'Retention',
    shortTitle: 'Retention',
    eyebrow: 'Sekce V',
    description: 'Fluktuace, klíčové pozice, hlavní příčiny změny a retenční akce.',
    primaryKpi: 'FLUCT',
    secondaryKpis: ['FLUCT_CRIT', 'ENPS', 'SUCCESSION'],
    icon: HeartPulse,
    accent: '#e11d48',
    href: '/sekce/retention',
    relatedAnalytics: [{ label: 'Attrition deep dive', href: '/analytika/attrition' }],
    relatedOperational: [{ label: 'Hired & fired', href: '/operativa/hired-fired' }],
  },
  {
    id: 'VI',
    slug: 'succession',
    title: 'Nástupnictví',
    shortTitle: 'Succession',
    eyebrow: 'Sekce VI',
    description: 'Pokrytí klíčových rolí nástupci, gaps a rozvoj následníků.',
    primaryKpi: 'SUCCESSION',
    secondaryKpis: ['FLUCT_CRIT', 'TALENT_GROWTH'],
    icon: Network,
    accent: '#7c3aed',
    href: '/sekce/succession',
    relatedAnalytics: [{ label: 'Critical roles risk', href: '/analytika/attrition' }],
    relatedOperational: [{ label: 'Org chart', href: '/operativa/org-chart' }],
  },
  {
    id: 'VII',
    slug: 'engagement',
    title: 'Engagement',
    shortTitle: 'Engagement',
    eyebrow: 'Sekce VII',
    description: 'eNPS, participace, segmenty a vazba na retenční riziko.',
    primaryKpi: 'ENPS',
    secondaryKpis: ['FLUCT', 'SICKNESS_RATE'],
    icon: Activity,
    accent: '#10b981',
    href: '/sekce/engagement',
    relatedAnalytics: [{ label: 'Attrition correlation', href: '/analytika/attrition' }],
    relatedOperational: [{ label: 'eNPS latest', href: '/operativa/enps-latest' }],
  },
  {
    id: 'VIII',
    slug: 'talent-growth',
    title: 'Talent & Growth',
    shortTitle: 'Talent',
    eyebrow: 'Sekce VIII',
    description: 'Růstový potenciál, výkon, interní mobilita, povýšení a školení.',
    primaryKpi: 'TALENT_GROWTH',
    secondaryKpis: ['SUCCESSION', 'QUALITY_HIRE'],
    icon: Sparkles,
    accent: '#db2777',
    href: '/sekce/talent-growth',
    relatedAnalytics: [{ label: 'Talent matrix', href: '/analytika/talent' }],
    relatedOperational: [{ label: 'Training export', href: '/operativa/training' }],
  },
] as const;

export const SECTION_BY_SLUG = new Map<SectionSlug, SectionDefinition>(
  SECTION_CATALOG.map((section) => [section.slug, section]),
);

export function getSectionBySlug(slug: string): SectionDefinition | null {
  return SECTION_BY_SLUG.get(slug as SectionSlug) ?? null;
}
