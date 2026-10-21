export const STAGES = ['Idea', 'Prototype', 'MVP', 'Testing/Review', 'Shipped/Live', 'Paused/Blocked'] as const;
export type Stage = (typeof STAGES)[number];

export const PLATFORMS = ['Web App', 'PWA', 'SaaS', 'API / Backend', 'Mobile App', 'Chrome Extension', 'CLI Tool', 'Discord/Slack Bot'] as const;

export const TECH_KEYS = ['framework', 'frontend', 'backend', 'database', 'hosting'] as const;
export type TechKey = (typeof TECH_KEYS)[number];

export interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export interface GithubLink {
  fullName: string;
  private: boolean;
  pushedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  platform: string;
  desc: string;
  stage: Stage;
  nextAction: string;
  tech: Record<TechKey, string[]>;
  // "Other tools". Kept under its original name so older backups still import.
  stack: string[];
  liveUrl: string;
  repoUrl: string;
  manualProgress: number | null;
  milestones: Milestone[];
  github: GithubLink | null;
}

export interface Note {
  id: string;
  text: string;
  color: number;
}

export interface Board {
  projects: Project[];
  notes: Note[];
}

// App logins never leave the browser, so they live outside the synced Board.
export interface Login {
  id: string;
  username: string;
  role: string;
  password: string;
}
export type LoginsByProject = Record<string, Login[]>;

export interface RepoSummary {
  fullName: string;
  name: string;
  description: string;
  homepage: string;
  htmlUrl: string;
  language: string;
  private: boolean;
  pushedAt: string | null;
}
