import type { Grade } from '@/lib/types';

interface Input {
  title: string;
  hierCode: string;
}

const B0_PATTERNS = [
  /\bceo\b/i, /\bcfo\b/i, /\bcto\b/i, /\bcoo\b/i, /\bcmo\b/i, /\bcpo\b/i,
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
  /senior\s+(?:\w+\s+)*manager/i,
  /group\s+(?:\w+\s+)+manager/i,
  /regional\s+manager/i,
];

const B3_PATTERNS = [
  /\bmanager\b/i,
  /team\s+lead/i,
  /supervisor/i,
  /store\s+manager/i,
  /branch\s+manager/i,
];

export function inferGrade({ title }: Input): Grade {
  const t = (title ?? '').trim();
  if (!t) return 'IC';
  if (B0_PATTERNS.some((p) => p.test(t))) return 'B0';
  if (B1_PATTERNS.some((p) => p.test(t))) return 'B1';
  if (B2_PATTERNS.some((p) => p.test(t))) return 'B2';
  if (B3_PATTERNS.some((p) => p.test(t))) return 'B3';
  return 'IC';
}
