'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';
import { TECH_FIELDS, addTechValue, techSuggestions, type FormTech, type TechFieldKey } from '@/lib/tech';

function Highlight({ value, query }: { value: string; query: string }) {
  const i = query ? value.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{value}</>;
  return <>{value.slice(0, i)}<b>{value.slice(i, i + query.length)}</b>{value.slice(i + query.length)}</>;
}

function TechField({ fieldKey, values, typed, projects, onValues, onTyped }: {
  fieldKey: TechFieldKey;
  values: string[];
  typed: string;
  projects: Project[];
  onValues: (v: string[]) => void;
  onTyped: (v: string) => void;
}) {
  const field = TECH_FIELDS.find(f => f.key === fieldKey)!;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputId = `techInput-${fieldKey}`;
  const listId = `techSuggest-${fieldKey}`;

  const known = techSuggestions(fieldKey, typed, values, projects);
  const query = typed.trim();
  const isNew = query && !known.some(v => v.toLowerCase() === query.toLowerCase()) && !values.some(v => v.toLowerCase() === query.toLowerCase());
  const items = isNew ? [...known, query] : known;
  const showList = open && items.length > 0;

  const add = (raw: string) => {
    onValues(addTechValue(values, raw));
    onTyped('');
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showList) { setOpen(true); return; }
      setActive(i => (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
    } else if ((e.key === 'Enter' || e.key === 'Tab') && query) {
      e.preventDefault();
      add(showList && items[active] ? items[active] : typed);
    } else if (e.key === ',') {
      e.preventDefault();
      add(typed);
    } else if (e.key === 'Backspace' && typed === '' && values.length) {
      onValues(values.slice(0, -1));
    } else if (e.key === 'Escape' && showList) {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div className="tech-field">
      <label className={`tech-label tech-${fieldKey}`} htmlFor={inputId}>{field.label}</label>
      <div className="tag-input" onClick={() => document.getElementById(inputId)?.focus()}>
        <span className="tag-list">
          {values.map((v, i) => (
            <span key={v} className={`tech-tag tech-${fieldKey}`}>
              {v}
              <button type="button" onClick={() => onValues(values.filter((_, j) => j !== i))} title={`Remove ${v}`}>&times;</button>
            </span>
          ))}
        </span>
        <input
          type="text" id={inputId} autoComplete="off" placeholder={field.placeholder} maxLength={60}
          role="combobox" aria-autocomplete="list" aria-expanded={showList} aria-controls={listId}
          value={typed}
          onChange={e => { onTyped(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
      </div>
      {showList && (
        <ul id={listId} className="suggest" role="listbox">
          {items.map((v, i) => (
            <li key={v} role="option" aria-selected={i === active} className={i === active ? 'active' : ''} onMouseDown={e => { e.preventDefault(); add(v); }}>
              {isNew && i === items.length - 1 ? <>Add &quot;<b>{v}</b>&quot;</> : <Highlight value={v} query={query} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TechFields({ tech, typed, projects, onChange, onTypedChange }: {
  tech: FormTech;
  typed: Record<TechFieldKey, string>;
  projects: Project[];
  onChange: (t: FormTech) => void;
  onTypedChange: (t: Record<TechFieldKey, string>) => void;
}) {
  return (
    <div className="tech-fields">
      {TECH_FIELDS.map(f => (
        <TechField
          key={f.key} fieldKey={f.key} values={tech[f.key]} typed={typed[f.key]} projects={projects}
          onValues={v => onChange({ ...tech, [f.key]: v })}
          onTyped={v => onTypedChange({ ...typed, [f.key]: v })}
        />
      ))}
    </div>
  );
}
