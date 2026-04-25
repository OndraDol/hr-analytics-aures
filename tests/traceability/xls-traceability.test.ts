import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { KPI_CATALOG } from '@/lib/kpi/catalog';

const workbookPath = join(process.cwd(), 'HR_reporting_ver2.xlsx');
const traceabilityPath = join(
  process.cwd(),
  'docs/traceability/hr-reporting-v2-traceability.md',
);

function getSheet(workbook: XLSX.WorkBook, name: string): XLSX.WorkSheet {
  const sheet = workbook.Sheets[name];
  if (!sheet) throw new Error(`Missing workbook sheet: ${name}`);
  return sheet;
}

describe('HR_reporting_ver2 traceability', () => {
  it('keeps the primary XLS workbook available with the expected source sheets', () => {
    expect(existsSync(workbookPath)).toBe(true);

    const workbook = XLSX.readFile(workbookPath);
    expect(workbook.SheetNames).toEqual([
      'Vojta_all',
      'HR Reporty_actual',
      'ESG reporty_actual',
      'NÁVRH_do_BI',
      'Návrh_rozpad',
      'CZ',
      'NÁVRH',
    ]);

    const kpiRows = XLSX.utils.sheet_to_json(getSheet(workbook, 'NÁVRH_do_BI'), {
      header: 1,
      blankrows: false,
      defval: '',
    });
    const reportRows = XLSX.utils.sheet_to_json(getSheet(workbook, 'NÁVRH'), {
      header: 1,
      blankrows: false,
      defval: '',
    });
    const esgRows = XLSX.utils.sheet_to_json(getSheet(workbook, 'ESG reporty_actual'), {
      header: 1,
      blankrows: false,
      defval: '',
    });

    expect(kpiRows).toHaveLength(21);
    expect(reportRows.length).toBeGreaterThanOrEqual(13);
    expect(esgRows).toHaveLength(22);
  });

  it('documents every KPI code and workbook sheet in the traceability matrix', () => {
    const traceability = readFileSync(traceabilityPath, 'utf8');

    for (const sheetName of [
      'Vojta_all',
      'HR Reporty_actual',
      'ESG reporty_actual',
      'NÁVRH_do_BI',
      'Návrh_rozpad',
      'CZ',
      'NÁVRH',
    ]) {
      expect(traceability).toContain(sheetName);
    }

    for (const definition of KPI_CATALOG) {
      expect(traceability).toContain(`\`${definition.code}\``);
    }

    expect(traceability).toContain('ECBR');
    expect(traceability).toContain('ESRS S1-11 Sociální ochrana');
  });
});
