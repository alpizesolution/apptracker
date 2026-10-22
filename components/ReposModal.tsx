'use client';

import { useEffect, useState } from 'react';
import { ArrowsClockwiseIcon, GithubLogoIcon, LockSimpleIcon, XIcon } from '@phosphor-icons/react';
import type { Project, RepoSummary } from '@/lib/types';
import { findProjectForRepo, summarizeRepo } from '@/lib/github';

type Load = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; repos: RepoSummary[]; installations: number };

// Lists the repos GitHub lets us see and adds the picked ones as cards.
// Repos already on the board are refreshed instead (description, website, last push).
export default function ReposModal({ projects, githubAppSlug, onImport, onClose }: {
  projects: Project[];
  githubAppSlug: string;
  onImport: (repos: RepoSummary[]) => void;
  onClose: () => void;
}) {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/github/repos', { cache: 'no-store' })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setLoad({ state: 'error', message: typeof body.error === 'string' ? body.error : 'Could not reach GitHub.' });
          return;
        }
        const repos = (Array.isArray(body.repos) ? body.repos : [])
          .map((r: Record<string, unknown>) => summarizeRepo({ full_name: r.fullName, name: r.name, description: r.description, homepage: r.homepage, html_url: r.htmlUrl, language: r.language, private: r.private, pushed_at: r.pushedAt }))
          .filter(Boolean) as RepoSummary[];
        setLoad({ state: 'ready', repos, installations: Number(body.installations) || 0 });
      })
      .catch(() => { if (!cancelled) setLoad({ state: 'error', message: 'Could not reach GitHub. Check your connection.' }); });
    return () => { cancelled = true; };
  }, [attempt]);

  const repos = load.state === 'ready' ? load.repos : [];
  const q = query.trim().toLowerCase();
  const shown = repos.filter(r => !q || r.fullName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  const linkedCount = repos.filter(r => findProjectForRepo(projects, r)).length;
  const installUrl = githubAppSlug ? `https://github.com/apps/${encodeURIComponent(githubAppSlug)}/installations/new` : '';

  const toggle = (name: string) => setPicked(prev => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });

  return (
    <div className="overlay">
      <div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="reposTitle">
        <div className="modal-head">
          <h3 id="reposTitle"><GithubLogoIcon /> Import from GitHub</h3>
          <button className="icon-btn" onClick={onClose} title="Close"><XIcon /></button>
        </div>
        <div className="modal-body">
          {load.state === 'loading' && <p className="hint">Loading your repos…</p>}
          {load.state === 'error' && (
            <div className="warn" role="alert">
              <span>{load.message}</span>
              <button className="btn btn-sm" onClick={() => { setLoad({ state: 'loading' }); setAttempt(a => a + 1); }}>Try again</button>
            </div>
          )}
          {load.state === 'ready' && (
            <>
              <p className="hint" style={{ margin: 0 }}>
                Pick repos to add as app cards. Repos already on your board ({linkedCount}) get their description, website and last push refreshed.
                {installUrl && <> Missing a repo? <a href={installUrl} target="_blank" rel="noopener noreferrer"><b>Choose which repos ALPIZE can see</b></a>, then reload this list.</>}
              </p>
              <div className="repo-tools">
                <input type="text" className="field field-sm" placeholder="Filter repos…" aria-label="Filter repos" value={query} onChange={e => setQuery(e.target.value)} />
                <button className="btn btn-sm" onClick={() => setPicked(new Set(shown.filter(r => !findProjectForRepo(projects, r)).map(r => r.fullName)))}>Select new</button>
                <button className="btn btn-sm" onClick={() => { setLoad({ state: 'loading' }); setAttempt(a => a + 1); }} title="Reload list"><ArrowsClockwiseIcon /></button>
              </div>
              <ul className="repo-list">
                {shown.length === 0 && <li className="hint">{repos.length === 0 ? 'No repos shared yet. Use the link above to pick some.' : 'No repos match.'}</li>}
                {shown.map(r => {
                  const linked = Boolean(findProjectForRepo(projects, r));
                  return (
                    <li key={r.fullName}>
                      <label>
                        <input type="checkbox" className="check" checked={picked.has(r.fullName)} onChange={() => toggle(r.fullName)} />
                        <span className="repo-name">{r.fullName}</span>
                        {r.private && <LockSimpleIcon aria-label="Private" />}
                        {linked && <span className="chip">On board</span>}
                      </label>
                      {r.description && <span className="hint repo-desc">{r.description}</span>}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            {load.state === 'ready' && repos.length > 0 && (
              <button className="btn" onClick={() => onImport(repos.filter(r => findProjectForRepo(projects, r)))} disabled={linkedCount === 0}>
                <ArrowsClockwiseIcon /> Refresh linked ({linkedCount})
              </button>
            )}
            <button className="btn btn-pink" disabled={picked.size === 0} onClick={() => onImport(repos.filter(r => picked.has(r.fullName)))}>
              Add {picked.size || ''} repo{picked.size === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
