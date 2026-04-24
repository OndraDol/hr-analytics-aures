import type { Grade } from '@/lib/types';

export interface GradeInput {
  title: string;
  hierCode: string;
}

const B0_PATTERNS = [
  /\bceo\b/i,
  /\bcfo\b/i,
  /\bcto\b/i,
  /\bcoo\b/i,
  /\bcmo\b/i,
  /\bcpo\b/i,
  /chief\s+\w+\s+officer/i,
  /group\s+ceo/i,
];

const B1_PATTERNS = [
  /\bdirector\b/i,
  /\bhead\s+of\b/i,
  /divisional\s+director/i,
  /group\s+\w+\s+director/i,
];

const B2_PATTERNS = [
  /senior\s+(?:.+\s+)?manager/i,
  /group\s+.+\s+manager/i,
  /group\s+.+\s+operations\s+manager/i,
  /regional\s+manager/i,
];

const B3_PATTERNS = [
  /\bmanager\b/i,
  /team\s+lead/i,
  /supervisor/i,
  /store\s+manager/i,
  /branch\s+manager/i,
];

export function inferGrade({ title }: GradeInput): Grade {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return 'IC';

  if (B0_PATTERNS.some((pattern) => pattern.test(normalizedTitle))) return 'B0';
  if (B1_PATTERNS.some((pattern) => pattern.test(normalizedTitle))) return 'B1';
  if (B2_PATTERNS.some((pattern) => pattern.test(normalizedTitle))) return 'B2';
  if (B3_PATTERNS.some((pattern) => pattern.test(normalizedTitle))) return 'B3';

  return 'IC';
}
