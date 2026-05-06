// Mapování abstraktní role z KPI katalogu na konkrétní HR persony AURESu.
// Marie Voršílková je reálná HR Director; ostatní jsou demo persony pro
// uvěřitelnost executive layeru (action backlog, briefing, alerts).

export interface HrPersona {
  name: string;
  roleCs: string;
}

const OWNERS: Record<string, HrPersona> = {
  'HR reporting': { name: 'Marie Voršílková', roleCs: 'HR Director' },
  HRBP: { name: 'Martin Vaněk', roleCs: 'HRBP CZ' },
  Recruiting: { name: 'Petra Dvořáková', roleCs: 'Lead Recruiter' },
  'Recru & Business': { name: 'Petra Dvořáková', roleCs: 'Lead Recruiter' },
  Payroll: { name: 'Lenka Čermáková', roleCs: 'Payroll & Comp Manager' },
  Training: { name: 'Tomáš Horák', roleCs: 'Talent & Learning Lead' },
};

const FALLBACK: HrPersona = { name: 'Marie Voršílková', roleCs: 'HR Director' };

export function resolveOwner(role: string | null | undefined): HrPersona {
  if (!role) return FALLBACK;
  const normalized = role.trim();
  return OWNERS[normalized] ?? FALLBACK;
}

export function ownerLabel(role: string | null | undefined): string {
  const persona = resolveOwner(role);
  return `${persona.name} (${persona.roleCs})`;
}
