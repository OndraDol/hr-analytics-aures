import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function readProjectFile(filePath: string): string {
  return readFileSync(path.join(repoRoot, filePath), 'utf8');
}

describe('M18 UX polish guards', () => {
  it('keeps a mobile navigation surface in the app shell', () => {
    const source = readProjectFile('components/layout/app-shell.tsx');

    expect(source).toContain('Navigace');
    expect(source).toContain('lg:hidden');
    expect(source).toContain('navGroups.map');
  });

  it('does not render a fake HR_STATS fallback in the executive briefing changes', () => {
    const source = readProjectFile('components/briefing/executive-briefing-page.tsx');

    expect(source).not.toContain("code: 'HR_STATS'");
    expect(source).toContain('function BriefingEmptyChange()');
    expect(source).toContain('V aktuálním období není významný signál pro tuto kategorii.');
  });
});
