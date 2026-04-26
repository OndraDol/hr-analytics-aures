import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const pageFiles = [
  'app/page.tsx',
  'app/akce/page.tsx',
  'app/briefing/page.tsx',
  'app/sekce/[slug]/page.tsx',
  'app/sekce/retention/page.tsx',
  'app/analytika/[topic]/page.tsx',
  'app/operativa/[view]/page.tsx',
];

describe('route page files', () => {
  it('keeps all top-level demo route entrypoints present', () => {
    for (const file of pageFiles) {
      expect(existsSync(path.join(repoRoot, file)), file).toBe(true);
    }
  });
});
