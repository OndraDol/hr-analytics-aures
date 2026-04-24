import * as XLSX from 'xlsx';
import type { EmployeeId, EmploymentType } from '@/lib/types';

interface RawWfRow {
  'OSČPV'?: string;
  'Kód a název struktury'?: string;
  'Druh PV'?: string;
  'Datum změny'?: string | number | Date;
  'Akademický titul'?: string;
  'Jméno'?: string;
  'Příjmení'?: string;
  'Titul'?: string;
  'Důvod uvedení'?: string;
  'Druh vynětí'?: string | number;
  'Vynětí od'?: string;
  'Predp. ukonč. vyn.'?: string;
}

export interface WorkforceEventRaw {
  date: string;
  employeeId: EmployeeId;
  type: 'hire' | 'terminate';
  orgUnitCode: string;
  orgUnitName: string;
  employmentType: EmploymentType;
  firstName: string;
  lastName: string;
}

export interface WorkforceEmployeeInfo {
  firstName: string;
  lastName: string;
  firstSeenDate: string;
  lastSeenDate: string;
  currentlyActive: boolean;
  orgUnitCode: string;
  orgUnitName: string;
  employmentType: EmploymentType;
}

export interface WorkforceParseResult {
  events: WorkforceEventRaw[];
  employees: Map<EmployeeId, WorkforceEmployeeInfo>;
}

const normalizeEmploymentType = (v: string | undefined): EmploymentType => {
  const s = String(v ?? '').trim().toUpperCase();
  if (s === 'PP') return 'PP';
  if (s === 'DPP') return 'DPP';
  if (s === 'DPČ' || s === 'DPC') return 'DPČ';
  if (s === 'STATUTAR') return 'STATUTAR';
  if (s === 'UČEŇ BEZ PV' || s === 'UCEN') return 'UCEN';
  return 'PP';
};

const toIsoDate = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  if (typeof v === 'string' && v.length >= 10) return v.slice(0, 10);
  return '';
};

const splitOrgUnit = (raw: string): { code: string; name: string } => {
  const s = String(raw ?? '').trim();
  const idx = s.indexOf('-');
  if (idx < 0) return { code: s, name: '' };
  return { code: s.slice(0, idx), name: s.slice(idx + 1) };
};

export function parseWorkforceEvents(filePath: string): WorkforceParseResult {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Workforce: missing sheet');
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Workforce: sheet ${sheetName} empty`);
  const rows = XLSX.utils.sheet_to_json<RawWfRow>(ws, { defval: '' });

  const events: WorkforceEventRaw[] = [];
  const employees: WorkforceParseResult['employees'] = new Map();

  for (const r of rows) {
    const employeeId = String(r['OSČPV'] ?? '').trim();
    if (!employeeId) continue;
    const date = toIsoDate(r['Datum změny']);
    if (!date) continue;
    const reason = String(r['Důvod uvedení'] ?? '').trim();
    const type: 'hire' | 'terminate' | null =
      reason.startsWith('1') ? 'hire' : reason.startsWith('2') ? 'terminate' : null;
    if (!type) continue;

    const org = splitOrgUnit(String(r['Kód a název struktury'] ?? ''));
    const firstName = String(r['Jméno'] ?? '').trim();
    const lastName = String(r['Příjmení'] ?? '').trim();
    const employmentType = normalizeEmploymentType(r['Druh PV']);

    events.push({
      date,
      employeeId,
      type,
      orgUnitCode: org.code,
      orgUnitName: org.name,
      employmentType,
      firstName,
      lastName,
    });

    const existing = employees.get(employeeId);
    if (!existing) {
      employees.set(employeeId, {
        firstName,
        lastName,
        firstSeenDate: date,
        lastSeenDate: date,
        currentlyActive: type === 'hire',
        orgUnitCode: org.code,
        orgUnitName: org.name,
        employmentType,
      });
    } else {
      if (date < existing.firstSeenDate) existing.firstSeenDate = date;
      if (date > existing.lastSeenDate) {
        existing.lastSeenDate = date;
        existing.currentlyActive = type === 'hire';
        existing.orgUnitCode = org.code;
        existing.orgUnitName = org.name;
        existing.employmentType = employmentType;
      }
    }
  }

  return { events, employees };
}
