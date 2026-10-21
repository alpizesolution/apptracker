'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  IconContext, ArrowCounterClockwiseIcon, CheckCircleIcon, CloudCheckIcon, CloudSlashIcon, DotsThreeVerticalIcon, DownloadSimpleIcon,
  GithubLogoIcon, HammerIcon, KanbanIcon, KeyIcon, MoonIcon, NoteIcon, PlusIcon, RocketLaunchIcon, ShieldCheckIcon, SignInIcon, SignOutIcon,
  SquaresFourIcon, StackIcon, SunIcon, TrashIcon, UploadSimpleIcon, WarningCircleIcon, WifiSlashIcon, XIcon
} from '@phosphor-icons/react';
import { STAGES, type Board, type Login, type LoginsByProject, type Project, type RepoSummary, type Stage } from '@/lib/types';
import { STAGE_CONFIG, newId } from '@/lib/stages';
import { allTech } from '@/lib/tech';
import { extractLogins, isBackup, safeUrl, sanitizeBoard, sanitizeProject } from '@/lib/sanitize';
import { findProjectForRepo, mergeRepo, projectFromRepo } from '@/lib/github';
import { THEME_KEY, clearCloudCopy, loadLogins, saveLogins } from '@/lib/local-store';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { useBoard } from './useBoard';
import ProjectCard, { type CardActions } from './ProjectCard';
import KanbanBoard from './KanbanBoard';
import NotesView from './NotesView';
import ProjectModal, { type ProjectDraft } from './ProjectModal';
import LoginsModal from './LoginsModal';
import ReposModal from './ReposModal';

export interface Account {
  id: string;
  login: string;
  avatarUrl: string;
}

type View = 'grid' | 'kanban' | 'notes';
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const ICONS = { weight: 'bold' as const, size: '1em' };

const askToCopyLocal = (count: number) =>
  window.confirm(`Copy the ${count} app${count === 1 ? '' : 's'} saved in this browser to your account?`);

// Browser state read without effects, so the server render and first client render agree.
function subscribeOnline(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => { window.removeEventListener('online', cb); window.removeEventListener('offline', cb); };
}
function subscribeTheme(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
const isOnline = () => navigator.onLine;
const isDark = () => document.documentElement.classList.contains('dark');

function useToast() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 3200);
  }, []);
  return { msg, show, toast };
}

function download(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Tracker({ account, cloudEnabled, githubAppSlug }: { account: Account | null; cloudEnabled: boolean; githubAppSlug: string }) {
  const { msg, show, toast } = useToast();
  const { board, setBoard, ready, status, deleteCloudBoard } = useBoard(account?.id || null, askToCopyLocal);
  const [logins, setLoginsState] = useState<LoginsByProject>(() => (typeof window === 'undefined' ? {} : loadLogins()));
  const [view, setView] = useState<View>('grid');
  const [filter, setFilter] = useState<Stage | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [loginsFor, setLoginsFor] = useState<string | null>(null);
  const [reposOpen, setReposOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const online = useSyncExternalStore(subscribeOnline, isOnline, () => true);
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const { projects, notes } = board;

  // Browser-only setup: network toasts, install prompt, service worker.
  useEffect(() => {
    const up = () => toast('Back online! Connection re-established.');
    const down = () => toast('Offline: changes are kept and saved when you are back online.');
    const beforeInstall = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('Service worker not registered:', err));
    }
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'failed') {
      toast('GitHub sign-in did not finish. Please try again.');
      history.replaceState(null, '', '/');
    }
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
      window.removeEventListener('beforeinstallprompt', beforeInstall);
    };
  }, [toast]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setEditing(null);
      setLoginsFor(null);
      setReposOpen(false);
      setMenuOpen(false);
    };
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('click', onClick); window.removeEventListener('keydown', onKey); };
  }, []);

  const setLogins = (update: (l: LoginsByProject) => LoginsByProject) => {
    setLoginsState(prev => {
      const next = update(prev);
      saveLogins(next);
      return next;
    });
  };

  const updateProject = (id: string, update: (p: Project) => Project) =>
    setBoard(b => ({ ...b, projects: b.projects.map(p => (p.id === id ? update(p) : p)) }));

  const find = (id: string) => projects.find(p => p.id === id);

  const actions: CardActions = {
    edit: id => { const p = find(id); if (p) setEditing(p); },
    duplicate: id => {
      const p = find(id);
      if (!p) return;
      setBoard(b => ({ ...b, projects: [{ ...structuredClone(p), id: newId('proj'), name: `${p.name} (Copy)`, github: null }, ...b.projects] }));
      toast(`Duplicated "${p.name}"`);
    },
    remove: id => {
      const p = find(id);
      if (!p || !window.confirm(`Delete "${p.name}" permanently?`)) return;
      setBoard(b => ({ ...b, projects: b.projects.filter(x => x.id !== id) }));
      setLogins(l => Object.fromEntries(Object.entries(l).filter(([k]) => k !== id)));
      toast(`Removed "${p.name}"`);
    },
    setStage: (id, stage) => {
      const p = find(id);
      if (!p || p.stage === stage) return;
      updateProject(id, x => ({ ...x, stage }));
      toast(`Moved "${p.name}" to ${stage}`);
    },
    toggleMilestone: (id, mId) => updateProject(id, p => ({ ...p, milestones: p.milestones.map(m => (m.id === mId ? { ...m, completed: !m.completed } : m)) })),
    addMilestone: (id, text) => {
      updateProject(id, p => ({ ...p, milestones: [...p.milestones, { id: newId('m'), text: text.trim().slice(0, 200), completed: false }] }));
      toast('Task added');
    },
    removeMilestone: (id, mId) => updateProject(id, p => ({ ...p, milestones: p.milestones.filter(m => m.id !== mId) })),
    setLiveUrl: id => {
      const p = find(id);
      if (!p) return;
      const raw = window.prompt(`Live website link for "${p.name}"`, 'https://');
      if (!raw || raw.trim() === 'https://') return;
      const url = safeUrl(raw);
      if (!url) { toast('That is not a web address. Use one like https://myapp.com'); return; }
      updateProject(id, x => ({ ...x, liveUrl: url }));
      toast(`Live link added to "${p.name}"`);
    },
    openLogins: id => setLoginsFor(id)
  };

  const saveDraft = (draft: ProjectDraft) => {
    if (editing && editing !== 'new') {
      updateProject(editing.id, p => sanitizeProject({ ...p, ...draft }));
      toast(`Saved changes to "${draft.name}"`);
    } else {
      const project = sanitizeProject({ ...draft, id: newId('proj'), milestones: [{ id: newId('m'), text: 'Architecture design & scaffolding', completed: false }] });
      setBoard(b => ({ ...b, projects: [project, ...b.projects] }));
      toast(`Created new app "${draft.name}"`);
    }
    setEditing(null);
  };

  const importRepos = (repos: RepoSummary[]) => {
    const refreshed = repos.filter(r => findProjectForRepo(projects, r)).length;
    const added = repos.length - refreshed;
    setBoard(b => {
      let list = [...b.projects];
      const fresh: Project[] = [];
      for (const repo of repos) {
        const existing = findProjectForRepo(list, repo);
        if (existing) list = list.map(p => (p.id === existing.id ? mergeRepo(p, repo) : p));
        else fresh.push(projectFromRepo(repo));
      }
      return { ...b, projects: [...fresh, ...list] };
    });
    setReposOpen(false);
    toast([added && `Added ${added} repo${added === 1 ? '' : 's'}`, refreshed && `refreshed ${refreshed}`].filter(Boolean).join(', ') || 'Nothing to import');
  };

  // Notes
  const addNotes = (lines: string[]) => {
    setBoard(b => ({ ...b, notes: [...lines.map((text, i) => ({ id: newId('note'), text, color: (b.notes.length + i) % 5 })), ...b.notes] }));
    toast(`Added ${lines.length} sticky note${lines.length === 1 ? '' : 's'}`);
  };
  const noteToApp = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note?.text.trim()) return;
    const [title, ...rest] = note.text.split(/\r?\n/);
    setBoard(b => ({
      notes: b.notes.filter(n => n.id !== id),
      projects: [sanitizeProject({
        id: newId('proj'), name: title, desc: rest.join(' '), stage: 'Idea', nextAction: 'Define scope and main features',
        milestones: [{ id: newId('m'), text: 'Architecture design & scaffolding', completed: false }]
      }), ...b.projects]
    }));
    toast(`"${title.trim()}" added to your apps as an Idea`);
  };

  // Backups
  const exportBoard = (withLogins: boolean) => {
    if (withLogins && !window.confirm('This file will contain your app passwords in plain text. Keep it somewhere private. Continue?')) return;
    const stamp = new Date().toISOString().slice(0, 10);
    download(`alpize-tracker-backup-${stamp}${withLogins ? '-with-logins' : ''}.json`, withLogins ? { ...board, logins } : board);
    toast(withLogins ? 'Backup with logins downloaded' : 'Backup downloaded (logins left out)');
  };

  const importBoard = (file: File) => {
    file.text().then(textValue => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(textValue);
      } catch {
        toast('That file is not a valid JSON backup');
        return;
      }
      if (!isBackup(parsed)) { toast('Invalid backup file: no projects found'); return; }
      const next: Board = sanitizeBoard(parsed);
      if (!Array.isArray(parsed) && !Array.isArray((parsed as Board).notes)) next.notes = notes;
      if ((projects.length || notes.length) && !window.confirm(`Replace your board with the ${next.projects.length} apps in this backup?`)) return;
      const restored = extractLogins(parsed, next);
      setBoard(() => next);
      if (Object.keys(restored).length) setLogins(l => ({ ...l, ...restored }));
      toast(`Restored ${next.projects.length} apps from the backup`);
    });
  };

  const clearAll = () => {
    if (!window.confirm('Delete all tracked apps? Export a backup first if you want to keep them.')) return;
    setBoard(b => ({ ...b, projects: [] }));
    toast('All projects cleared');
  };

  const deleteCloud = async () => {
    if (!window.confirm('Delete your synced projects and notes from ALPIZE? This cannot be undone. Logins saved in this browser stay here.')) return;
    if (await deleteCloudBoard()) toast('Your cloud data was deleted');
    else toast('Could not delete your data. Try again.');
  };

  const signIn = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${location.origin}/auth/callback` } });
    if (error) toast('Could not start GitHub sign-in. Try again.');
  };

  const toggleTheme = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#0a0a0a' : '#111111');
    try { localStorage.setItem(THEME_KEY, next ? 'dark' : 'light'); } catch { /* storage blocked */ }
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') toast('Installing ALPIZE SOLUTION...');
    setInstallPrompt(null);
  };

  // Filtering
  const q = search.trim().toLowerCase();
  const filtered = projects.filter(p => {
    if (filter !== 'all' && p.stage !== filter) return false;
    if (!q) return true;
    return [p.name, p.desc, p.nextAction, p.platform].some(v => v.toLowerCase().includes(q)) || allTech(p).some(t => t.value.toLowerCase().includes(q));
  });
  const live = projects.filter(p => p.stage === 'Shipped/Live').length;
  const wip = projects.filter(p => ['Idea', 'Prototype', 'MVP'].includes(p.stage)).length;
  const paused = projects.filter(p => p.stage === 'Paused/Blocked').length;
  const loginsProject = loginsFor ? find(loginsFor) : undefined;
  const signedIn = Boolean(account);
  const syncLabel = { local: 'On this device', loading: 'Loading…', saving: 'Saving…', saved: 'Synced', error: 'Sync error', readonly: 'Read-only' }[status];

  return (
    <IconContext.Provider value={ICONS}>
      {!online && (
        <div className="offline-banner"><WifiSlashIcon /> Working offline. {signedIn ? 'Reconnect to sync your latest changes.' : 'Changes are saved on this device.'}</div>
      )}

      {status === 'readonly' && (
        <div className="offline-banner" role="alert"><CloudSlashIcon /> Can&apos;t reach your saved board, so this is the last synced copy. Changes made now won&apos;t be saved. Reload when you are back online.</div>
      )}
      {status === 'error' && (
        <div className="offline-banner" role="alert"><CloudSlashIcon /> Your last change didn&apos;t sync. It will try again with your next change.</div>
      )}

      <header className="topbar">
        <div className="wrap">
          <Link className="logo" href="/" aria-label="ALPIZE SOLUTION home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon.svg" alt="" />
            <span className="logo-text">ALPIZE <span>SOLUTION</span></span>
          </Link>

          <nav className="nav" aria-label="Main">
            <span className={`net-pill${online && status !== 'error' && status !== 'readonly' ? '' : ' offline'}`} title={signedIn ? 'Sync status' : 'Saved in this browser'}>
              <span className="dot" />{online ? syncLabel : 'Offline'}
            </span>
            <button className={`nav-link${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')} title="Card view"><SquaresFourIcon /><span className="nav-label">Cards</span></button>
            <button className={`nav-link${view === 'kanban' ? ' active' : ''}`} onClick={() => setView('kanban')} title="Kanban board"><KanbanIcon /><span className="nav-label">Kanban</span></button>
            <button className={`nav-link${view === 'notes' ? ' active' : ''}`} onClick={() => setView('notes')} title="Idea sticky notes"><NoteIcon /><span className="nav-label">Ideas</span></button>

            {installPrompt && <button className="btn btn-lime btn-sm" onClick={install}><DownloadSimpleIcon /> Install</button>}

            <button className="nav-icon" onClick={toggleTheme} title={dark ? 'Switch to light theme' : 'Switch to dark theme'} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>

            <div className="menu-wrap" ref={menuRef}>
              <button className="nav-icon" onClick={() => setMenuOpen(o => !o)} title="Backup and more" aria-label="Backup and more" aria-expanded={menuOpen}>
                {account?.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img className="avatar" src={account.avatarUrl} alt="" />
                  : <DotsThreeVerticalIcon />}
              </button>
              {menuOpen && (
                <div className="menu" role="menu">
                  {account && <div className="menu-who">Signed in as <b>{account.login}</b></div>}
                  {account && <button onClick={() => { setReposOpen(true); setMenuOpen(false); }}><GithubLogoIcon /> Import from GitHub</button>}
                  {account && <hr />}
                  <button onClick={() => { exportBoard(false); setMenuOpen(false); }}><DownloadSimpleIcon /> Export backup</button>
                  <button onClick={() => { exportBoard(true); setMenuOpen(false); }}><KeyIcon /> Export with logins</button>
                  <button onClick={() => { importRef.current?.click(); setMenuOpen(false); }}><UploadSimpleIcon /> Import backup</button>
                  <hr />
                  <button className="danger" onClick={() => { clearAll(); setMenuOpen(false); }}><TrashIcon /> Clear all projects</button>
                  {account && <button className="danger" onClick={() => { setMenuOpen(false); deleteCloud(); }}><ArrowCounterClockwiseIcon /> Delete my cloud data</button>}
                  {account && (
                    <form action="/auth/signout" method="post" onSubmit={() => clearCloudCopy(account.id)}>
                      <button type="submit"><SignOutIcon /> Sign out</button>
                    </form>
                  )}
                </div>
              )}
              <input ref={importRef} type="file" accept=".json,application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importBoard(f); e.target.value = ''; }} />
            </div>

            {cloudEnabled && !account && (
              <button className="btn btn-lime" onClick={signIn}><GithubLogoIcon /> Sign in</button>
            )}
            <button className="btn btn-pink" onClick={() => setEditing('new')}><PlusIcon /> New App</button>
          </nav>
        </div>
      </header>

      <main className="wrap" style={{ flex: 1 }}>
        <section className="hero">
          <span className="tag">Your apps. Every stage. One board.</span>
          <h1>Every <span className="hl-box">app</span> I&apos;m <span className="hl-mark">building</span></h1>
          <p className="lead">
            From first idea to live launch. Track progress, next steps, links and logins for every app you build.{' '}
            {signedIn ? 'Synced to your GitHub account.' : cloudEnabled ? 'Sign in with GitHub to pull in your repos and sync across devices.' : 'Saved on your device and works offline.'}
          </p>
          <div className="sticker sticker-circle"><div><b>{projects.length}</b>apps in the works</div></div>
          <div className="sticker sticker-tag"><div>{live} live &amp; kicking 🚀</div></div>
        </section>

        <section className="stats">
          <div className="stat"><div className="stat-head"><span>Total apps</span><StackIcon /></div><div className="stat-num">{projects.length}</div><div className="stat-sub">Tracked portfolio</div></div>
          <div className="stat yellow"><div className="stat-head"><span>In progress</span><HammerIcon /></div><div className="stat-num">{wip}</div><div className="stat-sub">Idea, Prototype &amp; MVP</div></div>
          <div className="stat lime"><div className="stat-head"><span>Shipped &amp; live</span><RocketLaunchIcon /></div><div className="stat-num">{live}</div><div className="stat-sub">Production deployments</div></div>
          <div className="stat pink"><div className="stat-head"><span>Blocked / paused</span><WarningCircleIcon /></div><div className="stat-num">{paused}</div><div className="stat-sub">Needs unblocking or review</div></div>
        </section>

        {view !== 'notes' && (
          <section className="panel">
            <div className="panel-row">
              <div className="search-box">
                <label htmlFor="searchInput" className="sr-only">Search apps</label>
                <input type="text" id="searchInput" className="field" placeholder="Search by name, stack, next step..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="icon-btn clear" onClick={() => setSearch('')} title="Clear search"><XIcon /></button>}
              </div>
              <button className="btn btn-pink" onClick={() => setEditing('new')}><PlusIcon /> Add app</button>
            </div>
            <div className="filters">
              <span className="filters-label">Stage:</span>
              <button onClick={() => setFilter('all')} className={`pill filter-btn${filter === 'all' ? ' active' : ''}`}>All</button>
              {STAGES.map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`pill filter-btn${filter === s ? ' active' : ''}`}>{STAGE_CONFIG[s].short} {STAGE_CONFIG[s].emoji}</button>
              ))}
            </div>
          </section>
        )}

        {!ready ? (
          <p className="hint" style={{ textAlign: 'center', padding: '40px 0' }}>Loading your board…</p>
        ) : view === 'notes' ? (
          <NotesView
            notes={notes}
            onAdd={addNotes}
            onChange={(id, text) => setBoard(b => ({ ...b, notes: b.notes.map(n => (n.id === id ? { ...n, text: text.trim().slice(0, 1000) } : n)) }))}
            onCycleColor={id => setBoard(b => ({ ...b, notes: b.notes.map(n => (n.id === id ? { ...n, color: (n.color + 1) % 5 } : n)) }))}
            onDelete={id => setBoard(b => ({ ...b, notes: b.notes.filter(n => n.id !== id) }))}
            onMakeApp={noteToApp}
          />
        ) : projects.length === 0 ? (
          <div className="empty">
            <div className="big">🚀</div>
            <h3>Your board is empty</h3>
            <p className="hint">Add the apps you are working on{signedIn ? ', or pull them in from GitHub.' : cloudEnabled ? ', or sign in with GitHub to import your repos.' : '.'}</p>
            <div className="empty-actions">
              <button className="btn btn-pink" onClick={() => setEditing('new')}><PlusIcon /> Add new app</button>
              {signedIn && <button className="btn btn-lime" onClick={() => setReposOpen(true)}><GithubLogoIcon /> Import from GitHub</button>}
              {cloudEnabled && !signedIn && <button className="btn btn-lime" onClick={signIn}><SignInIcon /> Sign in with GitHub</button>}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="big">🫥</div>
            <h3>No apps match</h3>
            <p className="hint">Try another search or stage, or add a new app.</p>
            <button className="btn btn-pink" onClick={() => setEditing('new')}><PlusIcon /> Add new app</button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid">
            {filtered.map(p => <ProjectCard key={p.id} project={p} loginCount={(logins[p.id] || []).length} actions={actions} />)}
          </div>
        ) : (
          <KanbanBoard projects={filtered} actions={actions} />
        )}
      </main>

      <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite"><CheckCircleIcon weight="fill" /><span>{msg}</span></div>

      {editing && <ProjectModal project={editing === 'new' ? null : editing} projects={projects} onSave={saveDraft} onClose={() => setEditing(null)} />}

      {loginsProject && (
        <LoginsModal
          projectName={loginsProject.name}
          logins={logins[loginsProject.id] || []}
          toast={toast}
          onClose={() => setLoginsFor(null)}
          onAdd={added => setLogins(l => ({ ...l, [loginsProject.id]: [...(l[loginsProject.id] || []), ...added.map(x => ({ ...x, id: newId('login') }) as Login)] }))}
          onDelete={id => setLogins(l => ({ ...l, [loginsProject.id]: (l[loginsProject.id] || []).filter(x => x.id !== id) }))}
        />
      )}

      {reposOpen && <ReposModal projects={projects} githubAppSlug={githubAppSlug} onImport={importRepos} onClose={() => setReposOpen(false)} />}

      <footer className="footer">
        <div className="wrap">
          <span>&copy; <b>ALPIZE SOLUTION</b> &bull; <Link href="/privacy">Privacy</Link></span>
          <span>{signedIn ? <><CloudCheckIcon /> Synced to your account</> : cloudEnabled ? <><CloudSlashIcon /> Saved in this browser</> : <><ShieldCheckIcon /> Works offline</>}</span>
        </div>
      </footer>
    </IconContext.Provider>
  );
}
