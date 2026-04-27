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

  it('keeps the generic section page in a simplified Czech manager view', () => {
    const source = readProjectFile('components/sections/section-page.tsx');

    expect(source).toContain('Co je důležité');
    expect(source).toContain('Podpůrné metriky');
    expect(source).toContain('Co udělat');
    expect(source).toContain('variant="simple"');
    expect(source).not.toContain('Executive signal');
    expect(source).not.toContain('Trend KPI');
    expect(source).not.toContain('Drill-down');
    expect(source).not.toContain('Threshold');
    expect(source).not.toContain('Severita');
  });

  it('keeps the app shell brand and sidebar status from overlapping navigation', () => {
    const source = readProjectFile('components/layout/app-shell.tsx');

    expect(source).toContain('Přehled lidí');
    expect(source).toContain('lg:flex lg:flex-col');
    expect(source).toContain('min-h-0 flex-1');
    expect(source).not.toContain('absolute bottom-5');
    expect(source).not.toContain('HR Analytics');
  });

  it('hides methodology wording from executive dashboard panels', () => {
    const alertSource = readProjectFile('components/dashboard/top-alerts.tsx');
    const changesSource = readProjectFile('components/dashboard/what-changed.tsx');
    const kpiSource = readProjectFile('components/kpi/kpi-card-zones.tsx');

    expect(alertSource).not.toContain('severityScore');
    expect(alertSource).not.toContain('thresholdDistanceCs');
    expect(changesSource).not.toContain('severityScore');
    expect(changesSource).not.toContain('thresholdDistanceCs');
    expect(kpiSource).not.toContain('KpiSeverityBadge');
    expect(kpiSource).not.toContain('ThresholdBar');
    expect(kpiSource).not.toContain('dataQuality');
  });
});
