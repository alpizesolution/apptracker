// Browser storage. Signed-out boards and every app login live here.
import type { Board, LoginsByProject } from './types.ts';
import { extractLogins, sanitizeBoard, sanitizeLoginsMap } from './sanitize.ts';

// Same keys as the first version, so a board saved there loads unchanged on the same origin.
const BOARD_KEY = 'alpize_solution_projects';
const NOTES_KEY = 'alpize_solution_notes';
const LOGINS_KEY = 'alpize_solution_logins';
export const THEME_KEY = 'alpize_solution_theme';

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Could not save to this browser:', err);
  }
}

export function loadLocalBoard(): Board {
  const rawProjects = read(BOARD_KEY);
  const board = sanitizeBoard({ projects: Array.isArray(rawProjects) ? rawProjects : [], notes: read(NOTES_KEY) || [] });
  // The first version kept logins inside each project; move them to their own key once.
  const legacy = extractLogins(Array.isArray(rawProjects) ? rawProjects : [], board);
  if (Object.keys(legacy).length) {
    saveLogins({ ...legacy, ...loadLogins() });
    saveLocalBoard(board);
  }
  return board;
}

export function saveLocalBoard(board: Board) {
  write(BOARD_KEY, board.projects);
  write(NOTES_KEY, board.notes);
}

// Last synced board per account, shown read-only when the database can't be reached.
const cloudCopyKey = (userId: string) => `alpize_solution_cloud_${userId}`;

export function loadCloudCopy(userId: string): Board | null {
  const raw = read(cloudCopyKey(userId));
  return raw ? sanitizeBoard(raw) : null;
}

export function saveCloudCopy(userId: string, board: Board) {
  write(cloudCopyKey(userId), board);
}

export function clearCloudCopy(userId: string) {
  try {
    localStorage.removeItem(cloudCopyKey(userId));
  } catch { /* storage blocked */ }
}

export function loadLogins(): LoginsByProject {
  return sanitizeLoginsMap(read(LOGINS_KEY));
}

export function saveLogins(logins: LoginsByProject) {
  write(LOGINS_KEY, logins);
}
