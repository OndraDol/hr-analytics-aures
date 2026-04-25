import type { LucideIcon } from 'lucide-react';
import type { Period } from '@/lib/data/provider';

export interface DetailMetric {
  label: string;
  value: string;
  detail: string;
  tone: 'blue' | 'orange' | 'emerald' | 'rose' | 'violet' | 'zinc';
}

export interface DetailBreakdownRow {
  label: string;
  value: number;
  secondary?: number;
  detail: string;
}

export interface DetailBreakdown {
  title: string;
  subtitle: string;
  valueLabel: string;
  secondaryLabel?: string;
  rows: DetailBreakdownRow[];
}

export interface DetailTableRow {
  label: string;
  value: string;
  secondary: string;
  detail: string;
}

export interface DetailTable {
  title: string;
  subtitle: string;
  rows: DetailTableRow[];
}

export interface DetailLink {
  label: string;
  href: string;
}

export interface DetailDashboardData {
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  period: Period;
  metrics: DetailMetric[];
  primaryBreakdown: DetailBreakdown;
  secondaryBreakdown: DetailBreakdown;
  table: DetailTable;
  insightCs: string;
  actions: string[];
  relatedLinks: DetailLink[];
}
