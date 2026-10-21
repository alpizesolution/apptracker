'use client';

import { useState } from 'react';
import {
  ArrowSquareOutIcon, CopyIcon, GithubLogoIcon, GlobeIcon, KeyIcon, LightningIcon, LockSimpleIcon, PencilSimpleIcon, TrashIcon
} from '@phosphor-icons/react';
import { STAGES, type Project, type Stage } from '@/lib/types';
import { STAGE_CONFIG, calculateProgress } from '@/lib/stages';
import { allTech } from '@/lib/tech';
import { safeUrl } from '@/lib/sanitize';

export interface CardActions {
  edit: (id: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  setStage: (id: string, stage: Stage) => void;
  toggleMilestone: (id: string, milestoneId: string) => void;
  addMilestone: (id: string, text: string) => void;
  removeMilestone: (id: string, milestoneId: string) => void;
  setLiveUrl: (id: string) => void;
  openLogins: (id: string) => void;
}

// Links are re-checked at render time too, so nothing but http(s) ever reaches an href.
export function ExternalLink({ href, className, title, children }: { href: string; className?: string; title?: string; children: React.ReactNode }) {
  const url = safeUrl(href);
  if (!url) return null;
  return <a className={className} href={url} target="_blank" rel="noopener noreferrer" title={title}>{children}</a>;
}

function pushedLabel(iso: string | null): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return '';
  return days <= 0 ? 'pushed today' : days === 1 ? 'pushed yesterday' : `pushed ${days}d ago`;
}

export default function ProjectCard({ project, loginCount, actions }: { project: Project; loginCount: number; actions: CardActions }) {
  const [item, setItem] = useState('');
  const progress = calculateProgress(project);
  const stage = STAGE_CONFIG[project.stage];
  const done = project.milestones.filter(m => m.completed).length;
  const tech = allTech(project);

  const addItem = () => {
    if (!item.trim()) return;
    actions.addMilestone(project.id, item);
    setItem('');
  };

  return (
    <article className={`card ${stage.tile}`}>
      <div>
        <div className="card-top">
          <div className="card-badges">
            <span className={`stage-pill ${stage.tile}`}>{stage.emoji} {project.stage}</span>
            <span className="chip">{project.platform}</span>
            {project.github?.private && <span className="chip" title="Private repo"><LockSimpleIcon /> Private</span>}
          </div>
          <div className="card-actions">
            <button className="icon-btn" onClick={() => actions.duplicate(project.id)} title="Duplicate app"><CopyIcon /></button>
            <button className="icon-btn" onClick={() => actions.edit(project.id)} title="Edit app"><PencilSimpleIcon /></button>
            <button className="icon-btn danger" onClick={() => actions.remove(project.id)} title="Delete app"><TrashIcon /></button>
          </div>
        </div>

        <h2>{project.name}</h2>
        <p className="desc">{project.desc || 'No tagline yet.'}</p>

        <div className="next">
          <LightningIcon />
          <div style={{ minWidth: 0 }}>
            <small>Next step / blocker</small>
            <span>{project.nextAction || 'Define the next step'}</span>
          </div>
        </div>

        <div className="progress">
          <div className="progress-head"><span>Progress</span><span>{progress}%</span></div>
          <div className="bar"><div style={{ width: `${progress}%` }} data-zero={progress === 0 ? '' : undefined} /></div>
        </div>

        <div className="checklist">
          <div className="checklist-head"><span>Checklist</span><span>{done}/{project.milestones.length} done</span></div>
          <ul>
            {project.milestones.length === 0 && <li className="hint">No checklist items yet</li>}
            {project.milestones.map(m => (
              <li key={m.id}>
                <label>
                  <input type="checkbox" className="check" checked={m.completed} onChange={() => actions.toggleMilestone(project.id, m.id)} />
                  <span className={m.completed ? 'done' : ''}>{m.text}</span>
                </label>
                <button className="icon-btn danger" onClick={() => actions.removeMilestone(project.id, m.id)} title="Remove item"><TrashIcon /></button>
              </li>
            ))}
          </ul>
          <div className="add-row">
            <input
              type="text" className="field field-sm" placeholder="Add item..." aria-label={`Add checklist item to ${project.name}`}
              value={item} maxLength={200} onChange={e => setItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem(); }}
            />
            <button className="btn btn-sm" onClick={addItem}>Add</button>
          </div>
        </div>

        {tech.length > 0 && (
          <div className="stack">
            {tech.map(t => (
              <span key={`${t.key}-${t.value}`} className={`chip tech-chip tech-${t.key}`} title={t.label}><small>{t.short}</small>{t.value}</span>
            ))}
          </div>
        )}
      </div>

      <div className="card-foot">
        <div className="links">
          {project.repoUrl
            ? <ExternalLink className="link" href={project.repoUrl}><GithubLogoIcon /> Repo</ExternalLink>
            : <span className="link muted"><GithubLogoIcon /> No repo</span>}
          {project.liveUrl
            ? <ExternalLink className="link live" href={project.liveUrl}><ArrowSquareOutIcon /> Live</ExternalLink>
            : <button className="link ghost" onClick={() => actions.setLiveUrl(project.id)} title="Add the live website link"><GlobeIcon /> Add live</button>}
          <button className="link" onClick={() => actions.openLogins(project.id)} title="Saved logins for this app"><KeyIcon /> Logins{loginCount ? ` (${loginCount})` : ''}</button>
          {project.github?.pushedAt && <span className="hint pushed">{pushedLabel(project.github.pushedAt)}</span>}
        </div>
        <select className="stage-select" value={project.stage} onChange={e => actions.setStage(project.id, e.target.value as Stage)} title="Change stage" aria-label={`Stage of ${project.name}`}>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </article>
  );
}
