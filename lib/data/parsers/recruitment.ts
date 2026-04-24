import * as XLSX from 'xlsx';
import type { Gender } from '@/lib/types';

interface RawRecruitRow {
  'Client'?: string;
  'Candidate'?: string;
  "Candidate's gender"?: string;
  'Ref. number'?: string;
  'Job vacancy'?: string;
  "Job's web title"?: string;
  "Job's date created"?: string | Date | number;
  'Job status'?: string;
  'Branch'?: string;
  'Source'?: string;
  'Rating'?: number | string;
}

export interface RecruitmentRow {
  client: string;
  candidateName: string;
  gender: Gender | 'unknown';
  refNumber: string;
  jobVacancy: string;
  jobWebTitle: string;
  jobDateCreated: string;
  jobStatus: string;
  branch: string;
  source: string;
  rating: number | null;
}

export interface RecruitmentParseResult {
  rows: RecruitmentRow[];
  sources: Map<string, number>;
  genderCounts: { male: number; female: number; unknown: number };
  vacancies: Map<
    string,
    { title: string; createdAt: string; client: string; branch: string; status: string }
  >;
}

const toIsoDate = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  if (typeof v === 'string' && v.length >= 10) return v.slice(0, 10);
  return '';
};

export function parseRecruitment(filePath: string): RecruitmentParseResult {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase().includes('hiring')) ?? wb.SheetNames[0];
  if (!sheetName) throw new Error('Recruitment: missing sheet');
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Recruitment: sheet ${sheetName} empty`);
  const raws = XLSX.utils.sheet_to_json<RawRecruitRow>(ws, { defval: '' });

  const rows: RecruitmentRow[] = [];
  const sources = new Map<string, number>();
  const genderCounts = { male: 0, female: 0, unknown: 0 };
  const vacancies = new Map<
    string,
    { title: string; createdAt: string; client: string; branch: string; status: string }
  >();

  for (const r of raws) {
    const candidateName = String(r['Candidate'] ?? '').trim();
    if (!candidateName) continue;
    const rawG = String(r["Candidate's gender"] ?? '').trim().toLowerCase();
    const gender: Gender | 'unknown' =
      rawG === 'male' ? 'male' : rawG === 'female' ? 'female' : 'unknown';

    const rawRating = Number(r['Rating']);
    const row: RecruitmentRow = {
      client: String(r['Client'] ?? '').trim(),
      candidateName,
      gender,
      refNumber: String(r['Ref. number'] ?? '').trim(),
      jobVacancy: String(r['Job vacancy'] ?? '').trim(),
      jobWebTitle: String(r["Job's web title"] ?? '').trim(),
      jobDateCreated: toIsoDate(r["Job's date created"]),
      jobStatus: String(r['Job status'] ?? '').trim(),
      branch: String(r['Branch'] ?? '').trim(),
      source: String(r['Source'] ?? '').trim(),
      rating: Number.isFinite(rawRating) && rawRating > 0 ? rawRating : null,
    };
    rows.push(row);

    if (row.source) sources.set(row.source, (sources.get(row.source) ?? 0) + 1);
    genderCounts[gender] += 1;

    if (row.refNumber && !vacancies.has(row.refNumber)) {
      vacancies.set(row.refNumber, {
        title: row.jobWebTitle || row.jobVacancy,
        createdAt: row.jobDateCreated,
        client: row.client,
        branch: row.branch,
        status: row.jobStatus,
      });
    }
  }

  return { rows, sources, genderCounts, vacancies };
}
