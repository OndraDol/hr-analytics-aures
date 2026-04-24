import type { Grade } from '@/lib/types';

interface Input {
  grade: Grade;
  roleFamily: string;
  singletonInDept: boolean;
}

const REVENUE_ROLE_FAMILIES = new Set(['Sales', 'F&I', 'Buyer']);

export function inferCriticalFlag({ grade, roleFamily, singletonInDept }: Input): boolean {
  if (grade === 'B0' || grade === 'B1') return true;
  if (grade === 'B2' && REVENUE_ROLE_FAMILIES.has(roleFamily)) return true;
  if (grade === 'B3' && REVENUE_ROLE_FAMILIES.has(roleFamily) && singletonInDept) return true;
  return false;
}
