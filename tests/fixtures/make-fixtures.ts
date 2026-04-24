import * as XLSX from 'xlsx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== Mini Staffplan =====
const staffRows = [
  ['Pobočka', 'dep_sk', 'kod_hier_sk', 'Department', 'Hierarchický kód',
   'Position', 'poz_kod', 'OSČPV', 'Name', 'LP platnost', 'Note', 'Cap',
   'Actual Branch', 'Note2'],
  ['', '', '0101', 'Customer Experience', '0101196',
   'Group Customer Experience Manager', '011960000004370.001', '23_30679.01',
   'Preclík Jan', '2026-07-13', 'HPP', 1.0, 1.0, ''],
  ['', '', '0101', 'Customer Experience', '0101',
   'CX Specialist', '011960000004371.001', '', 'vacancy', '', '', 1.0, 0.0, ''],
  ['', '', '0403', 'OPS Region 1 CZ_Bazaar - Drivers', '0403',
   'Driver', '040300000000000.001', '23_10001.01', 'Novák Pavel', '', 'HPP', 1.0, 1.0, ''],
];
const ws1 = XLSX.utils.aoa_to_sheet(staffRows);
const wb1 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb1, ws1, 'Con02faaa');
XLSX.writeFile(wb1, path.join(__dirname, 'mini-staffplan.xlsx'));

// ===== Mini Workforce events =====
const wfRows = [
  ['OSČPV', 'Kód a název struktury', 'Druh PV', 'Datum změny', 'Akademický titul',
   'Jméno', 'Příjmení', 'Titul', 'Důvod uvedení', 'Druh vynětí', 'Vynětí od', 'Predp. ukonč. vyn.'],
  ['23_10001.01', '04030020035-OPS Region 1 CZ_Bazaar - Drivers', 'PP', '2020-03-15',
   '', 'Pavel', 'Novák', '', '1 - Nástup osoby', 0, '', ''],
  ['23_10002.01', '04030020035-OPS Region 1 CZ_Bazaar - Drivers', 'PP', '2022-06-01',
   '', 'Jana', 'Svobodová', '', '1 - Nástup osoby', 0, '', ''],
  ['23_10002.01', '04030020035-OPS Region 1 CZ_Bazaar - Drivers', 'PP', '2024-11-30',
   '', 'Jana', 'Svobodová', '', '2 - Ukončení PV', 0, '', ''],
  ['23_30679.01', '0101196-Customer Experience', 'PP', '2019-01-15',
   '', 'Jan', 'Preclík', '', '1 - Nástup osoby', 0, '', ''],
];
const ws2 = XLSX.utils.aoa_to_sheet(wfRows);
const wb2 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb2, ws2, 'Osb17');
XLSX.writeFile(wb2, path.join(__dirname, 'mini-workforce.xlsx'));

// ===== Mini Recruitment =====
const recruitRows = [
  ['Client', 'Client ID', 'Candidate', "Candidate's gender", 'Candidate ID',
   "Candidate's LinkedIn", 'Consent signing date', 'Employment status', 'Availability',
   'Availability - date', 'Availability - note', 'Seniority', 'Minimum salary expectations',
   'Salary units', 'Ref. number', 'Job vacancy', "Job's web title", "Job's date created",
   'Job status', "Client's contact person", 'Branch', 'Source', 'Source notes', 'On hold date', 'Rating'],
  ['Aures Holdings', '100001', 'Dusek Petr', 'male', '4075689', '', '2024-09-22',
   '', '', '', '', '', '0', '', 'A12045', 'Driver', 'Driver (Praha)', '2024-09-01',
   'filled', 'HR Team', 'Praha', 'Prace.cz', '', '', 4],
  ['Aures Holdings', '100002', 'Novotná Petra', 'female', '4075722', '', '2024-10-05',
   '', '', '', '', '', '0', '', 'A12046', 'CX Specialist', 'CX Specialist (Praha)',
   '2024-10-01', 'filled', 'HR Team', 'Praha', 'AAA Career', '', '', 5],
];
const wsR = XLSX.utils.aoa_to_sheet(recruitRows);
const wbR = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbR, wsR, 'Hiring processes');
XLSX.writeFile(wbR, path.join(__dirname, 'mini-recruitment.xlsx'));

console.log('Fixtures written.');
