import type { Project, Stage } from './types.ts';

// `tile` sets the stage color class (see globals.css); `emoji` matches the filter pills.
export const STAGE_CONFIG: Record<Stage, { tile: string; emoji: string; short: string }> = {
  'Idea': { tile: 'stage-idea', emoji: '💡', short: 'Idea' },
  'Prototype': { tile: 'stage-prototype', emoji: '🧪', short: 'Prototype' },
  'MVP': { tile: 'stage-mvp', emoji: '🔨', short: 'MVP' },
  'Testing/Review': { tile: 'stage-testing', emoji: '🔍', short: 'Testing' },
  'Shipped/Live': { tile: 'stage-live', emoji: '🚀', short: 'Live' },
  'Paused/Blocked': { tile: 'stage-paused', emoji: '⛔', short: 'Blocked' }
};

export function calculateProgress(project: Project): number {
  if (project.manualProgress !== null) return Math.min(100, Math.max(0, Math.round(project.manualProgress)));
  if (project.milestones.length === 0) return 0;
  const done = project.milestones.filter(m => m.completed).length;
  return Math.round((done / project.milestones.length) * 100);
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}
