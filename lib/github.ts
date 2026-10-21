import type { Project, RepoSummary } from './types.ts';
import { newId } from './stages.ts';
import { isRepoFullName, safeUrl, sanitizeProject } from './sanitize.ts';

// Shape the raw GitHub API repo into the few fields the tracker uses.
export function summarizeRepo(raw: Record<string, unknown>): RepoSummary | null {
  const fullName = typeof raw.full_name === 'string' ? raw.full_name : '';
  if (!isRepoFullName(fullName)) return null;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    fullName,
    name: str(raw.name) || fullName.split('/')[1],
    description: str(raw.description).slice(0, 400),
    homepage: safeUrl(raw.homepage),
    htmlUrl: safeUrl(raw.html_url) || `https://github.com/${fullName}`,
    language: str(raw.language).slice(0, 40),
    private: raw.private === true,
    pushedAt: str(raw.pushed_at) || null
  };
}

function prettyName(repoName: string): string {
  return repoName.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

export function projectFromRepo(repo: RepoSummary): Project {
  return sanitizeProject({
    id: newId('proj'),
    name: prettyName(repo.name),
    platform: 'Web App',
    desc: repo.description,
    stage: repo.homepage ? 'Shipped/Live' : 'MVP',
    nextAction: '',
    tech: { frontend: repo.language ? [repo.language] : [] },
    stack: [],
    liveUrl: repo.homepage,
    repoUrl: repo.htmlUrl,
    manualProgress: null,
    milestones: [{ id: newId('m'), text: 'Repository created on GitHub', completed: true }],
    github: { fullName: repo.fullName, private: repo.private, pushedAt: repo.pushedAt }
  });
}

export function findProjectForRepo(projects: Project[], repo: RepoSummary): Project | undefined {
  const full = repo.fullName.toLowerCase();
  return projects.find(p =>
    p.github?.fullName.toLowerCase() === full ||
    p.repoUrl.toLowerCase().replace(/\/+$/, '') === `https://github.com/${full}`
  );
}

// Sync fills in what GitHub knows without overwriting what you typed yourself.
export function mergeRepo(project: Project, repo: RepoSummary): Project {
  return {
    ...project,
    desc: project.desc || repo.description,
    liveUrl: project.liveUrl || repo.homepage,
    repoUrl: project.repoUrl || repo.htmlUrl,
    github: { fullName: repo.fullName, private: repo.private, pushedAt: repo.pushedAt }
  };
}
