import { describe, expect, it } from 'vitest';
import {
  PROJECT_BASELINE_BEFORE_FINAL_FEATURES_PERCENT,
  getProjectProgress,
  type ProjectMilestone,
} from '@/lib/project/progress';

describe('project progress', () => {
  it('reports the completed presentation prototype percentage', () => {
    const progress = getProjectProgress();

    expect(progress.percent).toBe(100);
    expect(progress.completedPercent).toBe(100);
    expect(progress.totalPercent).toBe(100);
    expect(progress.completedCount).toBe(progress.totalCount);
    expect(progress.labelCs).toContain('dokončen');
    expect(progress.baselineBeforeFinalFeaturesPercent).toBe(PROJECT_BASELINE_BEFORE_FINAL_FEATURES_PERCENT);
  });

  it('can calculate an in-progress milestone set', () => {
    const milestones: ProjectMilestone[] = [
      { id: 'done', title: 'Done', percent: 40, completed: true },
      { id: 'todo', title: 'Todo', percent: 60, completed: false },
    ];

    const progress = getProjectProgress(milestones);

    expect(progress.percent).toBe(40);
    expect(progress.completedPercent).toBe(40);
    expect(progress.completedCount).toBe(1);
    expect(progress.totalCount).toBe(2);
  });
});
