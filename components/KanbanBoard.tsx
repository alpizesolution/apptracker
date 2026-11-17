'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowSquareOutIcon, GithubLogoIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { STAGES, type Project, type Stage } from '@/lib/types';
import { STAGE_CONFIG, calculateProgress } from '@/lib/stages';
import { ExternalLink, type CardActions } from './ProjectCard';

// ─── Touch drag state (module-level refs, one active drag at a time) ─────────
interface TouchDragState {
  dragId: string;
  clone: HTMLElement;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

/** Returns the Stage for a column element that contains the given point, or null. */
function stageFromPoint(x: number, y: number): Stage | null {
  // Hide the clone so elementFromPoint can hit the column beneath it
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    const stage = (el as HTMLElement).dataset?.stage as Stage | undefined;
    if (stage) return stage;
  }
  return null;
}

export default function KanbanBoard({ projects, actions }: { projects: Project[]; actions: CardActions }) {
  // ── Mouse drag state ──────────────────────────────────────────────────────
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);

  // ── "Move to…" dropdown state ─────────────────────────────────────────────
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ── Touch drag (mutable ref, no re-render needed during drag) ────────────
  const touchDrag = useRef<TouchDragState | null>(null);
  const [touchOver, setTouchOver] = useState<Stage | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>, p: Project) => {
    const touch = e.touches[0];
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    // Clone the card for a floating ghost
    const clone = card.cloneNode(true) as HTMLElement;
    clone.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      pointer-events: none;
      opacity: 0.75;
      z-index: 9999;
      transition: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    `;
    document.body.appendChild(clone);

    touchDrag.current = {
      dragId: p.id,
      clone,
      startX: touch.clientX,
      startY: touch.clientY,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };

    // Dim the original
    card.style.opacity = '0.3';
    // Suppress scroll while dragging
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const state = touchDrag.current;
    if (!state) return;
    e.preventDefault();

    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // Move ghost
    state.clone.style.left = `${x - state.offsetX}px`;
    state.clone.style.top = `${y - state.offsetY}px`;

    // Detect column beneath (clone is pointer-events:none so it won't block)
    const stage = stageFromPoint(x, y);
    setTouchOver(stage);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const state = touchDrag.current;
    if (!state) return;

    // Restore original card opacity
    (e.currentTarget as HTMLElement).style.opacity = '';

    // Remove ghost
    state.clone.remove();
    touchDrag.current = null;

    // Commit the move
    if (touchOver) {
      actions.setStage(state.dragId, touchOver);
    }
    setTouchOver(null);
  }, [touchOver, actions]);

  return (
    <div className="kanban-scroll">
      <div className="kanban">
        {STAGES.map(stageName => {
          const stage = STAGE_CONFIG[stageName];
          const list = projects.filter(p => p.stage === stageName);
          const isOver = over === stageName || touchOver === stageName;
          return (
            <section
              key={stageName}
              // data-stage lets stageFromPoint() identify this column
              data-stage={stageName}
              className={`kcol ${stage.tile}${isOver ? ' drag-over' : ''}`}
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
                  const menuOpen = openMenuId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`kcard ${stage.tile}`}
                      draggable
                      onDragStart={e => { setDragId(p.id); e.dataTransfer.setData('text/plain', p.id); }}
                      onTouchStart={ev => handleTouchStart(ev, p)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div className="meta">
                        <span>{p.platform}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {/* "Move to…" dropdown button */}
                          <div style={{ position: 'relative' }}>
                            <button
                              className="icon-btn"
                              title="Move to stage"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenMenuId(menuOpen ? null : p.id);
                              }}
                              style={{ fontSize: 16, lineHeight: 1 }}
                            >
                              ⋯
                            </button>
                            {menuOpen && (
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '110%',
                                  zIndex: 1000,
                                  background: 'var(--card-bg, #1e1e2e)',
                                  border: '1px solid var(--border, #333)',
                                  borderRadius: 8,
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                                  minWidth: 160,
                                  overflow: 'hidden',
                                }}
                                // Close when clicking outside
                                onMouseLeave={() => setOpenMenuId(null)}
                              >
                                <div style={{ padding: '6px 12px', fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Move to…
                                </div>
                                {STAGES.filter(s => s !== stageName).map(s => (
                                  <button
                                    key={s}
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '8px 12px',
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: 13,
                                      color: 'inherit',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      actions.setStage(p.id, s);
                                    }}
                                  >
                                    {STAGE_CONFIG[s].emoji} {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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

      {/* Close any open menu when clicking the board background */}
      {openMenuId && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
}
