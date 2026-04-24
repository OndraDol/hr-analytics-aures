import { ABSENCE } from '@/lib/data/generated/absence';
import { EMPLOYEES } from '@/lib/data/generated/employees';
import { PAYROLL } from '@/lib/data/generated/payroll';
import { PERFORMANCE } from '@/lib/data/generated/performance';
import { POSITIONS } from '@/lib/data/generated/positions';

const errors: string[] = [];
const positionIds = new Set(POSITIONS.map((position) => position.id));
const employeeIds = new Set(EMPLOYEES.map((employee) => employee.id));
const employeeById = new Map(EMPLOYEES.map((employee) => [employee.id, employee]));

for (const employee of EMPLOYEES) {
  if (!positionIds.has(employee.positionId)) {
    errors.push(`Employee ${employee.id} references unknown position ${employee.positionId}`);
  }
}

for (const row of PAYROLL) {
  if (!employeeIds.has(row.employeeId)) {
    errors.push(`Payroll row references unknown employee ${row.employeeId}`);
  }
}

for (const row of ABSENCE) {
  const employee = employeeById.get(row.employeeId);
  if (!employee) {
    errors.push(`Absence row references unknown employee ${row.employeeId}`);
    continue;
  }
  if (row.dateFrom < employee.hireDate) {
    errors.push(`Absence ${row.employeeId} starts before hire date`);
  }
  if (employee.terminationDate && row.dateFrom > employee.terminationDate) {
    errors.push(`Absence ${row.employeeId} starts after termination date`);
  }
}

for (const row of PERFORMANCE) {
  const employee = employeeById.get(row.employeeId);
  if (!employee) {
    errors.push(`Performance review references unknown employee ${row.employeeId}`);
    continue;
  }

  const cycleYear = Number(row.cycle);
  if (new Date(employee.hireDate).getUTCFullYear() > cycleYear) {
    errors.push(`Performance ${row.employeeId} cycle ${row.cycle} is before hire`);
  }
  if (employee.terminationDate && new Date(employee.terminationDate).getUTCFullYear() < cycleYear) {
    errors.push(`Performance ${row.employeeId} cycle ${row.cycle} is after termination`);
  }
}

if (errors.length > 0) {
  console.error(`Data inconsistencies found (${errors.length}):`);
  for (const error of errors.slice(0, 30)) {
    console.error(`- ${error}`);
  }
  if (errors.length > 30) console.error(`... and ${errors.length - 30} more`);
  process.exit(1);
}

console.log('Data consistency OK');
