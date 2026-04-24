import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseStaffplan } from '@/lib/data/parsers/staffplan';
import { parseWorkforceEvents } from '@/lib/data/parsers/workforce-events';
import { parseRecruitment } from '@/lib/data/parsers/recruitment';
import { createNamePseudonymizer } from '@/lib/data/parsers/names';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_SP = path.resolve(__dirname, '../fixtures/mini-staffplan.xlsx');
const FIXTURE_WF = path.resolve(__dirname, '../fixtures/mini-workforce.xlsx');
const FIXTURE_R = path.resolve(__dirname, '../fixtures/mini-recruitment.xlsx');

describe('parseStaffplan', () => {
  it('parses 3 positions from fixture', () => {
    const result = parseStaffplan(FIXTURE_SP);
    expect(result.positions).toHaveLength(3);
  });

  it('correctly identifies vacancy vs filled', () => {
    const result = parseStaffplan(FIXTURE_SP);
    const vacant = result.positions.filter((p) => p.actualFte === 0);
    const filled = result.positions.filter((p) => p.actualFte > 0);
    expect(vacant).toHaveLength(1);
    expect(filled).toHaveLength(2);
  });

  it('extracts distinct department entries (by hier code) and unique names set', () => {
    const result = parseStaffplan(FIXTURE_SP);
    // Fixture has 3 distinct hier codes (0101196, 0101, 0403) → 3 dept entries
    expect(result.departments).toHaveLength(3);
    const uniqueNames = Array.from(new Set(result.departments.map((d) => d.name))).sort();
    expect(uniqueNames).toEqual([
      'Customer Experience',
      'OPS Region 1 CZ_Bazaar - Drivers',
    ]);
  });
});

describe('parseWorkforceEvents', () => {
  it('parses 4 events from fixture', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    expect(result.events).toHaveLength(4);
  });

  it('identifies hire vs termination', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    const hires = result.events.filter((e) => e.type === 'hire');
    const terms = result.events.filter((e) => e.type === 'terminate');
    expect(hires).toHaveLength(3);
    expect(terms).toHaveLength(1);
  });

  it('extracts unique employees', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    expect(result.employees.size).toBe(3);
  });

  it('splits org unit code from name', () => {
    const result = parseWorkforceEvents(FIXTURE_WF);
    const first = result.events[0];
    expect(first).toBeDefined();
    expect(first!.orgUnitCode).toBe('04030020035');
    expect(first!.orgUnitName).toBe('OPS Region 1 CZ_Bazaar - Drivers');
  });
});

describe('parseRecruitment', () => {
  it('parses 2 hiring rows', () => {
    const result = parseRecruitment(FIXTURE_R);
    expect(result.rows).toHaveLength(2);
  });

  it('extracts sources', () => {
    const result = parseRecruitment(FIXTURE_R);
    expect(result.sources.get('Prace.cz')).toBe(1);
    expect(result.sources.get('AAA Career')).toBe(1);
  });

  it('counts hires by gender', () => {
    const result = parseRecruitment(FIXTURE_R);
    expect(result.genderCounts.male).toBe(1);
    expect(result.genderCounts.female).toBe(1);
  });
});

describe('createNamePseudonymizer', () => {
  it('returns same pseudonym for same employeeId (stable)', () => {
    const p = createNamePseudonymizer(42);
    const a = p.pseudonymize('23_10001.01', 'male');
    const b = p.pseudonymize('23_10001.01', 'male');
    expect(a).toEqual(b);
  });

  it('returns different pseudonyms for different ids', () => {
    const p = createNamePseudonymizer(42);
    const a = p.pseudonymize('23_10001.01', 'male');
    const b = p.pseudonymize('23_10002.01', 'female');
    // either first or last name must differ for distinct ids in most cases
    expect(a.firstName === b.firstName && a.lastName === b.lastName).toBe(false);
  });

  it('produces non-empty first and last names', () => {
    const p = createNamePseudonymizer(42);
    const male = p.pseudonymize('23_10001.01', 'male');
    expect(male.firstName.length).toBeGreaterThan(0);
    expect(male.lastName.length).toBeGreaterThan(0);
  });

  it('applies Czech female form to last names', () => {
    const p = createNamePseudonymizer(42);
    const female = p.pseudonymize('23_10002.01', 'female');
    // female last names must end with á or ová
    expect(female.lastName.endsWith('á') || female.lastName.endsWith('ová')).toBe(true);
  });
});
