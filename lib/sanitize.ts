// Everything that comes from outside the app (backup files, the database, GitHub)
// goes through here, so the UI can trust the shape and the URLs it renders.
import { STAGES, TECH_KEYS } from './types.ts';
import type { Board, Login, LoginsByProject, Milestone, Note, Project, Stage } from './types.ts';
import { newId } from './stages.ts';

export const LIMITS = { projects: 500, milestones: 200, notes: 1000, logins: 100, tags: 30 };

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Only http(s) links are allowed, so a link can never run script (javascript:, data:, ...).
// A bare domain like "myapp.com" is treated as https.
export function safeUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let value = raw.trim();
  if (!value) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = 'https://' + value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return '';
    return url.href.slice(0, 500);
  } catch {
    return '';
  }
}

// "owner/repo" as GitHub allows it. Owners have no dots; a repo is never "." or "..".
export function isRepoFullName(value: string): boolean {
  return /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/.test(value) && !/\/\.{1,2}$/.test(value);
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function id(value: unknown, prefix: string, seen: Set<string>): string {
  const candidate = typeof value === 'string' && ID_RE.test(value) && !seen.has(value) ? value : newId(prefix);
  seen.add(candidate);
  return candidate;
}

function tags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    const t = text(v, 60);
    if (t && !out.some(x => x.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= LIMITS.tags) break;
  }
  return out;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function sanitizeProject(input: unknown, seen: Set<string> = new Set()): Project {
  const p = record(input);
  const tech = record(p.tech);
  const progress = Number(p.manualProgress);
  const hasProgress = p.manualProgress !== null && p.manualProgress !== undefined && p.manualProgress !== '' && Number.isFinite(progress);
  const msSeen = new Set<string>();
  const milestones: Milestone[] = (Array.isArray(p.milestones) ? p.milestones : [])
    .slice(0, LIMITS.milestones)
    .map(m => record(m))
    .filter(m => text(m.text, 200))
    .map(m => ({ id: id(m.id, 'm', msSeen), text: text(m.text, 200), completed: m.completed === true }));
  const gh = record(p.github);
  const fullName = text(gh.fullName, 140);

  return {
    id: id(p.id, 'proj', seen),
    name: text(p.name, 120) || 'Untitled app',
    platform: text(p.platform, 40) || 'Web App',
    desc: text(p.desc, 400),
    stage: (STAGES as readonly string[]).includes(p.stage as string) ? p.stage as Stage : 'Idea',
    nextAction: text(p.nextAction, 200),
    tech: Object.fromEntries(TECH_KEYS.map(k => [k, tags(tech[k])])) as Project['tech'],
    stack: tags(p.stack),
    liveUrl: safeUrl(p.liveUrl),
    repoUrl: safeUrl(p.repoUrl),
    manualProgress: hasProgress ? Math.min(100, Math.max(0, Math.round(progress))) : null,
    milestones,
    github: isRepoFullName(fullName)
      ? { fullName, private: gh.private === true, pushedAt: text(gh.pushedAt, 40) || null }
      : null
  };
}

export function sanitizeNote(input: unknown, index: number, seen: Set<string>): Note {
  const n = record(input);
  const color = Number(n.color);
  return {
    id: id(n.id, 'note', seen),
    text: text(n.text, 1000),
    color: Number.isInteger(color) && color >= 0 ? color % 5 : index % 5
  };
}

export function sanitizeBoard(input: unknown): Board {
  const raw = record(input);
  // Older backups are a plain array of projects.
  const projectList = Array.isArray(input) ? input : Array.isArray(raw.projects) ? raw.projects : [];
  const noteList = Array.isArray(raw.notes) ? raw.notes : [];
  const projectIds = new Set<string>();
  const noteIds = new Set<string>();
  return {
    projects: projectList.slice(0, LIMITS.projects).map(p => sanitizeProject(p, projectIds)),
    notes: noteList.slice(0, LIMITS.notes).map((n, i) => sanitizeNote(n, i, noteIds))
  };
}

export function isBackup(input: unknown): boolean {
  return Array.isArray(input) || Array.isArray(record(input).projects);
}

function sanitizeLogins(value: unknown): Login[] {
  const seen = new Set<string>();
  return (Array.isArray(value) ? value : []).slice(0, LIMITS.logins).map(l => record(l))
    .filter(l => text(l.username, 200))
    .map(l => ({ id: id(l.id, 'login', seen), username: text(l.username, 200), role: text(l.role, 80), password: text(l.password, 200) }));
}

export function sanitizeLoginsMap(input: unknown): LoginsByProject {
  const out: LoginsByProject = {};
  for (const [projectId, logins] of Object.entries(record(input))) {
    if (!ID_RE.test(projectId)) continue;
    const clean = sanitizeLogins(logins);
    if (clean.length) out[projectId] = clean;
  }
  return out;
}

// Backups made by the first version kept logins inside each project, and a
// "with logins" export keeps them in a top-level `logins` map. Pull either out.
// Must run on the raw input, keyed by the ids sanitizeBoard kept.
export function extractLogins(input: unknown, board: Board): LoginsByProject {
  const raw = record(input);
  const out: LoginsByProject = sanitizeLoginsMap(raw.logins);
  const projectList = Array.isArray(input) ? input : Array.isArray(raw.projects) ? raw.projects : [];
  projectList.slice(0, LIMITS.projects).forEach((p, i) => {
    const logins = sanitizeLogins(record(p).logins);
    const target = board.projects[i];
    if (target && logins.length) out[target.id] = [...(out[target.id] || []), ...logins];
  });
  const ids = new Set(board.projects.map(p => p.id));
  return Object.fromEntries(Object.entries(out).filter(([k]) => ids.has(k)));
}

// Each pasted line becomes a sticky note. Trailing pipes are dropped ("EVENT TRACKER|").
export function parseIdeas(pasted: string): string[] {
  return pasted.split(/\r?\n/).map(l => l.replace(/[|]+$/, '').trim()).filter(Boolean).map(l => l.slice(0, 1000));
}

// One login per line: username, then role, separated by a tab or 2+ spaces
// (else the first space). A last line that is one word and not an email is the
// shared password.
export function parseLogins(pasted: string, password: string): { logins: Omit<Login, 'id'>[]; password: string } {
  const lines = pasted.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let pw = password.trim();
  const last = lines[lines.length - 1];
  if (last && !/\s/.test(last) && !last.includes('@') && lines.length > 1) {
    lines.pop();
    if (!pw) pw = last;
  }
  const logins = lines.map(line => {
    let [username, ...role] = line.split(/\t+|\s{2,}/);
    if (role.length === 0) [username, ...role] = line.split(/\s+/);
    return { username: username.trim().slice(0, 200), role: role.join(' ').trim().slice(0, 80), password: pw.slice(0, 200) };
  });
  return { logins, password: pw };
}
