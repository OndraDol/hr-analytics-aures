import { create } from 'zustand';
import type { Country } from '@/lib/types';

export interface GlobalFilters {
  period: { from: string; to: string };
  previousPeriod: { from: string; to: string };
  country: Country | 'ALL';
  divisionIds: string[];
}

interface FilterStore {
  filters: GlobalFilters;
  setCountry: (c: Country | 'ALL') => void;
  setPeriod: (from: string, to: string) => void;
  setDivisions: (ids: string[]) => void;
  reset: () => void;
}

const DEFAULT_FILTERS: GlobalFilters = {
  period: { from: '2025-01-01', to: '2025-12-31' },
  previousPeriod: { from: '2024-01-01', to: '2024-12-31' },
  country: 'ALL',
  divisionIds: [],
};

export const useFilters = create<FilterStore>((set) => ({
  filters: DEFAULT_FILTERS,
  setCountry: (country) => set((s) => ({ filters: { ...s.filters, country } })),
  setPeriod: (from, to) => {
    const prevYear = Number(from.slice(0, 4)) - 1;
    set((s) => ({
      filters: {
        ...s.filters,
        period: { from, to },
        previousPeriod: { from: `${prevYear}${from.slice(4)}`, to: `${prevYear}${to.slice(4)}` },
      },
    }));
  },
  setDivisions: (ids) => set((s) => ({ filters: { ...s.filters, divisionIds: ids } })),
  reset: () => set({ filters: DEFAULT_FILTERS }),
}));
