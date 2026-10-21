'use client';

import { useState } from 'react';
import { ArrowCircleUpRightIcon, PaletteIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import type { Note } from '@/lib/types';
import { parseIdeas } from '@/lib/sanitize';

const NOTE_COLORS = ['note-yellow', 'note-pink', 'note-lime', 'note-orange', 'note-sky'];

export default function NotesView({ notes, onAdd, onChange, onCycleColor, onDelete, onMakeApp }: {
  notes: Note[];
  onAdd: (lines: string[]) => void;
  onChange: (id: string, text: string) => void;
  onCycleColor: (id: string) => void;
  onDelete: (id: string) => void;
  onMakeApp: (id: string) => void;
}) {
  const [paste, setPaste] = useState('');

  const add = () => {
    const lines = parseIdeas(paste);
    if (!lines.length) return;
    onAdd(lines);
    setPaste('');
  };

  return (
    <div>
      <div className="notes-input">
        <label htmlFor="notesPasteInput" className="label">Paste ideas (one per line)</label>
        <textarea id="notesPasteInput" rows={3} className="textarea" placeholder={'IPON CHECKLIST\nPAGIBIG LOAN TRACKER\nDORM APP'} value={paste} onChange={e => setPaste(e.target.value)} />
        <div className="row">
          <span className="hint">Each line becomes its own sticky note. Click a note to edit it.</span>
          <button className="btn btn-lime" onClick={add}><PlusIcon /> Add notes</button>
        </div>
      </div>
      <div className="notes-grid">
        {notes.length === 0 && <div className="notes-empty">No sticky notes yet. Paste your ideas above.</div>}
        {notes.map(n => (
          <div key={n.id} className={`note ${NOTE_COLORS[n.color % NOTE_COLORS.length]}`}>
            <textarea rows={4} placeholder="Write an idea..." defaultValue={n.text} maxLength={1000} aria-label="Idea" onBlur={e => { if (e.target.value.trim() !== n.text) onChange(n.id, e.target.value); }} />
            <div className="note-foot">
              <button onClick={() => onMakeApp(n.id)} title="Turn into an app card (Idea stage)"><ArrowCircleUpRightIcon /> Make app</button>
              <span>
                <button onClick={() => onCycleColor(n.id)} title="Change color"><PaletteIcon /></button>
                <button onClick={() => onDelete(n.id)} title="Delete note"><TrashIcon /></button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
