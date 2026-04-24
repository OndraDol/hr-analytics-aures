import { EMPLOYEES } from '@/lib/data/generated/employees';
import { POSITIONS } from '@/lib/data/generated/positions';
import { PAYROLL } from '@/lib/data/generated/payroll';
import { ABSENCE } from '@/lib/data/generated/absence';
import { PERFORMANCE } from '@/lib/data/generated/performance';

const errors: string[] = [];

// 1. All employees refer to existing position
const posIds = new Set(POSITIONS.map((p) => p.id));
for (const e of EMPLOYEES) {
  if (!posIds.has(e.positionId)) errors.push(`Employee ${e.id} → unknown position ${e.positionId}`);
}

// 2. All payroll rows refer to existing employee
const empIds = new Set(EMPLOYEES.map((e) => e.id));
for (const p of PAYROLL) {
  if (!empIds.has(p.employeeId)) errors.push(`Payroll for unknown employee ${p.employeeId}`);
}

// 3. Absence bounds match employee hire/term
for (const a of ABSENCE) {
  const e = EMPLOYEES.find((x) => x.id === a.employeeId);
  if (!e) { errors.push(`Absence for unknown employee ${a.employeeId}`); continue; }
  if (a.dateFrom < e.hireDate) errors.push(`Absence ${a.employeeId} before hire date`);
  if (e.terminationDate && a.dateFrom > e.terminationDate) errors.push(`Absence ${a.employeeId} after termination`);
}

// 4. Performance review cycle employees active in cycle
for (const p of PERFORMANCE) {
  const e = EMPLOYEES.find((x) => x.id === p.employeeId);
  if (!e) { errors.push(`Performance for unknown employee ${p.employeeId}`); continue; }
  const year = Number(p.cycle);
  if (new Date(e.hireDate).getFullYear() > year) errors.push(`Performance ${p.employeeId} cycle before hire`);
  if (e.terminationDate && new Date(e.terminationDate).getFullYear() < year)
    errors.push(`Performance ${p.employeeId} after termination`);
}

if (errors.length === 0) {
  console.log('✅ Data consistency OK');
  process.exit(0);
} else {
  console.error(`❌ Data inconsistencies (${errors.length}):`);
  for (const e of errors.slice(0, 20)) console.error('  -', e);
  if (errors.length > 20) console.error(`  ... and ${errors.length - 20} more`);
  process.exit(1);
}
