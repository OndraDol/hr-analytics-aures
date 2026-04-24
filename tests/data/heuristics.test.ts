import { describe, it, expect } from 'vitest';
import { inferGrade } from '@/lib/data/heuristics/grade';
import { inferCriticalFlag } from '@/lib/data/heuristics/critical-position';

describe('inferGrade', () => {
  it('assigns B0 to C-level titles', () => {
    expect(inferGrade({ title: 'Chief Executive Officer', hierCode: '01' })).toBe('B0');
    expect(inferGrade({ title: 'CFO', hierCode: '02' })).toBe('B0');
  });

  it('assigns B1 to Group / Divisional Director', () => {
    expect(inferGrade({ title: 'Group Marketing Director', hierCode: '01' })).toBe('B1');
    expect(inferGrade({ title: 'Sales Division Director', hierCode: '03' })).toBe('B1');
  });

  it('assigns B2 to Senior Manager / Group Manager level', () => {
    expect(inferGrade({ title: 'Group Customer Experience Manager', hierCode: '0101196' })).toBe('B2');
    expect(inferGrade({ title: 'Senior Project Manager', hierCode: '02' })).toBe('B2');
  });

  it('assigns B3 to Team Leader / Manager', () => {
    expect(inferGrade({ title: 'Team Leader', hierCode: '0403' })).toBe('B3');
    expect(inferGrade({ title: 'Store Manager', hierCode: '03' })).toBe('B3');
  });

  it('assigns IC by default', () => {
    expect(inferGrade({ title: 'Driver', hierCode: '0403' })).toBe('IC');
    expect(inferGrade({ title: 'CX Specialist', hierCode: '0101' })).toBe('IC');
  });
});

describe('inferCriticalFlag', () => {
  it('all B0 are critical', () => {
    expect(inferCriticalFlag({ grade: 'B0', roleFamily: 'Sales', singletonInDept: true })).toBe(true);
  });

  it('all B1 are critical', () => {
    expect(inferCriticalFlag({ grade: 'B1', roleFamily: 'F&I', singletonInDept: false })).toBe(true);
  });

  it('B2 in sales-generating roles are critical', () => {
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'F&I', singletonInDept: true })).toBe(true);
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'Sales', singletonInDept: true })).toBe(true);
  });

  it('B2 in support functions not critical by default', () => {
    expect(inferCriticalFlag({ grade: 'B2', roleFamily: 'HR', singletonInDept: false })).toBe(false);
  });

  it('IC is never critical', () => {
    expect(inferCriticalFlag({ grade: 'IC', roleFamily: 'F&I', singletonInDept: true })).toBe(false);
  });
});
