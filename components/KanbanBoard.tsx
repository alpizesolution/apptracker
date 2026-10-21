'use client';

import { useState } from 'react';
import { ArrowSquareOutIcon, GithubLogoIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { STAGES, type Project, type Stage } from '@/lib/types';
import { STAGE_CONFIG, calculateProgress } from '@/lib/stages';
import { ExternalLink, type CardActions } from './ProjectCard';

export default function KanbanBoard({ projects, actions }: { projects: Project[]; actions: CardActions }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);

  return (
    <div className="kanban-scroll">
      <div className="kanban">
        {STAGES.map(stageName => {
          const stage = STAGE_CONFIG[stageName];
          const list = projects.filter(p => p.stage === stageName);
          return (
            <section
              key={stageName}
              className={`kcol ${stage.tile}${over === stageName ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setOver(stageName); }}
              onDragLeave={() => setOver(null)}
              onDrop={e => {
                e.preventDefault();
                setOver(null);
                if (dragId) actions.setStage(dragId, stageName);
                setDragId(null);
              }}
            >
              <div className="kcol-head"><span>{stage.emoji} {stageName}</span><span className="count">{list.length}</span></div>
              <div className="kcol-body">
                {list.length === 0 && <div className="drop-empty">Drop apps here</div>}
                {list.map(p => {
                  const progress = calculateProgress(p);
                  return (
                    <div key={p.id} className={`kcard ${stage.tile}`} draggable onDragStart={e => { setDragId(p.id); e.dataTransfer.setData('text/plain', p.id); }}>
                      <div className="meta">
                        <span>{p.platform}</span>
                        <span>
                          <button className="icon-btn" onClick={() => actions.edit(p.id)} title="Edit app"><PencilSimpleIcon /></button>
                          <button className="icon-btn danger" onClick={() => actions.remove(p.id)} title="Delete app"><TrashIcon /></button>
                        </span>
                      </div>
                      <h4>{p.name}</h4>
                      <p className="desc">{p.desc}</p>
                      <div className="progress-head" style={{ fontSize: 12, margin: 0 }}><span>Progress</span><span>{progress}%</span></div>
                      <div className="bar"><div style={{ width: `${progress}%` }} data-zero={progress === 0 ? '' : undefined} /></div>
                      {p.nextAction && <div className="nexttxt">⚡ {p.nextAction}</div>}
                      <div className="foot">
                        <span>{p.milestones.filter(m => m.completed).length}/{p.milestones.length} tasks</span>
                        <span>
                          <ExternalLink href={p.repoUrl} title="Repo"><GithubLogoIcon /></ExternalLink>
                          <ExternalLink href={p.liveUrl} title="Live website"><ArrowSquareOutIcon /></ExternalLink>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
