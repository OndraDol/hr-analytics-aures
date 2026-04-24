import * as XLSX from 'xlsx';
import type {
  Position,
  Department,
  Division,
  PositionId,
  DepartmentId,
  DivisionId,
} from '@/lib/types';

interface RawRow {
  'Pobočka'?: string;
  'dep_sk'?: string;
  'kod_hier_sk'?: string;
  'Department'?: string;
  'Hierarchický kód'?: string;
  'Position'?: string;
  'poz_kod'?: string;
  'OSČPV'?: string;
  'Name'?: string;
  'LP platnost'?: string | number | Date;
  'Note'?: string;
  'Cap'?: number | string;
  'Actual Branch'?: number | string;
  'Note2'?: string;
}

export interface StaffplanParseResult {
  positions: Position[];
  departments: Department[];
  divisions: Division[];
  /** OSČPV → positionId mapping pro staff plan entries */
  employeeToPosition: Map<string, PositionId>;
}

const toNumber = (v: number | string | undefined): number => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

function inferRoleFamily(title: string, deptName: string): string {
  const t = title.toLowerCase();
  const d = deptName.toLowerCase();
  if (d.includes('driver')) return 'OPS-Driver';
  if (d.includes('helper')) return 'OPS-Helper';
  if (d.includes('call cent')) return 'Call Centre';
  if (d.includes('selling') || t.includes('sales')) return 'Sales';
  if (d.includes('buy')) return 'Buyer';
  if (d.includes('f&i')) return 'F&I';
  if (d.includes('marketing')) return 'Marketing';
  if (d.includes('customer experience')) return 'CX';
  if (d.includes('hr')) return 'HR';
  if (d.includes('finance') || d.includes('accounting')) return 'Finance';
  return 'Other';
}

export function parseStaffplan(filePath: string): StaffplanParseResult {
  const wb = XLSX.readFile(filePath);
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) throw new Error('Staffplan: missing sheet');
  const ws = wb.Sheets[firstSheetName];
  if (!ws) throw new Error(`Staffplan: sheet ${firstSheetName} empty`);
  const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: '' });

  const positions: Position[] = [];
  const deptMap = new Map<DepartmentId, Department>();
  const divMap = new Map<DivisionId, Division>();
  const employeeToPosition = new Map<string, PositionId>();

  for (const r of rows) {
    const positionId = String(r['poz_kod'] ?? '').trim();
    const title = String(r['Position'] ?? '').trim();
    const deptName = String(r['Department'] ?? '').trim();
    const hierCode = String(r['Hierarchický kód'] ?? '').trim();
    if (!positionId || !title || !deptName) continue;

    const departmentId: DepartmentId = hierCode || deptName;
    const divisionId: DivisionId = hierCode.slice(0, 2) || deptName.slice(0, 2);

    if (!deptMap.has(departmentId)) {
      deptMap.set(departmentId, {
        id: departmentId,
        name: deptName,
        divisionId,
        headEmployeeId: null,
      });
    }
    if (!divMap.has(divisionId)) {
      divMap.set(divisionId, {
        id: divisionId,
        name: deptName,
        country: 'CZ',
        parentId: null,
        costCenter: null,
      });
    }

    positions.push({
      id: positionId,
      title,
      divisionId,
      departmentId,
      criticalFlag: false,
      grade: 'IC',
      roleFamily: inferRoleFamily(title, deptName),
      capFte: toNumber(r['Cap']),
      actualFte: toNumber(r['Actual Branch']),
    });

    const employeeId = String(r['OSČPV'] ?? '').trim();
    if (employeeId) employeeToPosition.set(employeeId, positionId);
  }

  return {
    positions,
    departments: Array.from(deptMap.values()),
    divisions: Array.from(divMap.values()),
    employeeToPosition,
  };
}
