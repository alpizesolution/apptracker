import type { Project, RepoSummary, TechKey } from './types.ts';
import { newId } from './stages.ts';
import { isRepoFullName, safeUrl, sanitizeProject } from './sanitize.ts';
import { TECH_FIELDS } from './tech.ts';
import type { TechFieldKey } from './tech.ts';

// Maps GitHub primary language names to the correct TechKey bucket.
const LANG_BUCKET: Record<string, TechKey> = {
  // Frontend / mobile
  'JavaScript': 'frontend', 'TypeScript': 'frontend', 'CSS': 'frontend',
  'HTML': 'frontend', 'Dart': 'frontend', 'Swift': 'frontend', 'Kotlin': 'frontend',
  // Backend / systems
  'Python': 'backend', 'Go': 'backend', 'Rust': 'backend', 'Java': 'backend',
  'C#': 'backend', 'C++': 'backend', 'C': 'backend', 'Ruby': 'backend',
  'PHP': 'backend', 'Elixir': 'backend', 'Haskell': 'backend', 'Scala': 'backend',
  'Shell': 'backend', 'Dockerfile': 'backend',
};

/**
 * Tries to match each topic (case-insensitive) against the `suggest` arrays in
 * TECH_FIELDS. Returns a map of tech-field key → matched suggestion strings.
 */
function topicsToTech(topics: string[]): Partial<Record<TechFieldKey, string[]>> {
  const result: Partial<Record<TechFieldKey, string[]>> = {};

  for (const topic of topics) {
    const topicLower = topic.toLowerCase();
    for (const field of TECH_FIELDS) {
      const match = field.suggest.find(s => s.toLowerCase() === topicLower);
      if (match) {
        const bucket = result[field.key] ?? [];
        if (!bucket.includes(match)) bucket.push(match);
        result[field.key] = bucket;
        break; // first field-match wins; don't double-count
      }
    }
  }

  return result;
}

// Shape the raw GitHub API repo into the few fields the tracker uses.
export function summarizeRepo(raw: Record<string, unknown>): RepoSummary | null {
  const fullName = typeof raw.full_name === 'string' ? raw.full_name : '';
  if (!isRepoFullName(fullName)) return null;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const topics = Array.isArray(raw.topics)
    ? (raw.topics as unknown[]).filter((t): t is string => typeof t === 'string')
    : [];

  const summary: RepoSummary & { topics?: string[] } = {
    fullName,
    name: str(raw.name) || fullName.split('/')[1],
    description: str(raw.description).slice(0, 400),
    homepage: safeUrl(raw.homepage),
    htmlUrl: safeUrl(raw.html_url) || `https://github.com/${fullName}`,
    language: str(raw.language).slice(0, 40),
    private: raw.private === true,
    pushedAt: str(raw.pushed_at) || null,
    topics,
  };

  return summary;
}

function prettyName(repoName: string): string {
  return repoName.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

export function projectFromRepo(repo: RepoSummary): Project {
  // Determine the correct tech bucket for the primary language.
  const langBucket: TechKey = repo.language
    ? (LANG_BUCKET[repo.language] ?? 'frontend')
    : 'frontend';

  // Build the base tech object (all TECH_KEYS start empty).
  const tech: Record<TechKey, string[]> = {
    framework: [], frontend: [], backend: [], database: [], hosting: [],
  };
  if (repo.language) tech[langBucket] = [repo.language];

  // Extract and merge topics into the right tech fields.
  const topics = (repo as RepoSummary & { topics?: string[] }).topics ?? [];
  const topicTech = topicsToTech(topics);
  for (const [key, values] of Object.entries(topicTech) as [TechFieldKey, string[]][]) {
    if (key === 'other') continue; // 'other' maps to `stack`, not `tech`
    const techKey = key as TechKey;
    const existing = tech[techKey] ?? [];
    for (const v of values) {
      if (!existing.some(e => e.toLowerCase() === v.toLowerCase())) existing.push(v);
    }
    tech[techKey] = existing;
  }

  // Topics that mapped to 'other' go into stack.
  const extraStack: string[] = (topicTech.other ?? []);

  return sanitizeProject({
    id: newId('proj'),
    name: prettyName(repo.name),
    platform: 'Web App',
    desc: repo.description,
    stage: repo.homepage ? 'Shipped/Live' : 'MVP',
    nextAction: '',
    tech,
    stack: extraStack,
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
