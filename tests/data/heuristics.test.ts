import { describe, it, expect } from 'vitest';
import { inferGrade } from '@/lib/data/heuristics/grade';
import { inferCriticalFlag } from '@/lib/data/heuristics/critical-position';

describe('inferGrade', () => {
  it('assigns B0 to C-level titles', () => {
    expect(inferGrade({ title: 'Chief Executive Officer', hierCode: '01' })).toBe('B0');
    expect(inferGrade({ title: 'CFO', hierCode: '02' })).toBe('B0');
  });

  it('assigns B1 to group and divisional directors', () => {
    expect(inferGrade({ title: 'Group Marketing Director', hierCode: '01' })).toBe('B1');
    expect(inferGrade({ title: 'Sales Division Director', hierCode: '03' })).toBe('B1');
  });

  it('assigns B2 to senior and group manager level', () => {
    expect(inferGrade({ title: 'Group Customer Experience Manager', hierCode: '0101196' })).toBe(
      'B2',
    );
    expect(inferGrade({ title: 'Senior Project Manager', hierCode: '02' })).toBe('B2');
  });

  it('assigns B3 to team leader and manager roles', () => {
    expect(inferGrade({ title: 'Team Leader', hierCode: '0403' })).toBe('B3');
    expect(inferGrade({ title: 'Store Manager', hierCode: '03' })).toBe('B3');
  });

  it('assigns IC by default', () => {
    expect(inferGrade({ title: 'Driver', hierCode: '0403' })).toBe('IC');
    expect(inferGrade({ title: 'CX Specialist', hierCode: '0101' })).toBe('IC');
  });
});

describe('inferCriticalFlag', () => {
  it('marks all B0 and B1 positions as critical', () => {
    expect(inferCriticalFlag({ grade: 'B0', roleFamily: 'Sales', singletonInDept: true })).toBe(
      true,
    );
    expect(inferCriticalFlag({ grade: 'B1', roleFamily: 'F&I', singletonInDept: false })).toBe(
      true,
    );
  });

  it('marks B2 positions in revenue role families as critical', () => {
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'F&I', singletonInDept: true })).toBe(
      true,
    );
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'Sales', singletonInDept: true })).toBe(
      true,
    );
  });

  it('does not mark B2 support positions critical by default', () => {
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'HR', singletonInDept: false })).toBe(
      false,
    );
  });

  it('does not mark IC positions critical', () => {
    expect(inferCriticalFlag({ grade: 'IC', roleFamily: 'F&I', singletonInDept: true })).toBe(
      false,
    );
  });
});
