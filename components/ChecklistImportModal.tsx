'use client';

import { useRef, useState } from 'react';
import { BracketsCurlyIcon, CopyIcon, DownloadSimpleIcon, FileArrowUpIcon, XIcon } from '@phosphor-icons/react';
import type { Milestone } from '@/lib/types';
import { CHECKLIST_JSON_EXAMPLE, LIMITS, parseChecklistJson } from '@/lib/sanitize';

const MAX_FILE_BYTES = 200_000;

export default function ChecklistImportModal({ projectName, existingCount, onImport, onClose, toast }: {
  projectName: string;
  existingCount: number;
  onImport: (items: Omit<Milestone, 'id'>[], replace: boolean) => void;
  onClose: () => void;
  toast: (msg: string) => void;
}) {
  const [raw, setRaw] = useState('');
  const [replace, setReplace] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const parsed = raw.trim() ? parseChecklistJson(raw) : null;
  const items = parsed && 'items' in parsed ? parsed.items : [];
  const room = replace ? LIMITS.milestones : LIMITS.milestones - existingCount;

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { toast('That file is too big for a checklist'); return; }
    setRaw(await file.text());
  };

  const copyExample = () => {
    navigator.clipboard.writeText(CHECKLIST_JSON_EXAMPLE)
      .then(() => toast('Example copied'))
      .catch(() => toast('Could not copy to clipboard'));
  };

  const downloadExample = () => {
    const url = URL.createObjectURL(new Blob([CHECKLIST_JSON_EXAMPLE + '\n'], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'checklist-example.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const submit = () => {
    if (items.length === 0 || room <= 0) return;
    onImport(items.slice(0, room), replace);
  };

  return (
    <div className="overlay">
      <div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="checklistImportTitle">
        <div className="modal-head">
          <h3><BracketsCurlyIcon /> <span id="checklistImportTitle">Import checklist</span></h3>
          <button className="icon-btn" onClick={onClose} title="Close"><XIcon /></button>
        </div>
        <div className="modal-body">
          <p className="hint" style={{ margin: 0 }}>Load checklist items for <b>{projectName}</b> from a JSON file, or paste the JSON below.</p>

          <div className="paste-row">
            <button className="btn btn-lime" onClick={() => fileInput.current?.click()}><FileArrowUpIcon /> Choose JSON file</button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={e => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
          </div>

          <div>
            <label htmlFor="checklistJsonInput" className="label">JSON</label>
            <textarea id="checklistJsonInput" rows={7} className="textarea chip-mono" spellCheck={false} placeholder={CHECKLIST_JSON_EXAMPLE} value={raw} onChange={e => setRaw(e.target.value)} />
            {parsed && 'error' in parsed && <div className="warn" role="alert" style={{ marginTop: 8 }}>{parsed.error}</div>}
            {items.length > 0 && (
              <p className="hint" style={{ margin: '8px 0 0' }}>
                Found {items.length} item{items.length === 1 ? '' : 's'} ({items.filter(i => i.completed).length} already done).
                {items.length > room && ` Only the first ${Math.max(0, room)} fit (an app can have ${LIMITS.milestones} items).`}
              </p>
            )}
          </div>

          <section className="json-guide" aria-labelledby="jsonGuideTitle">
            <div className="json-guide-head">
              <h4 id="jsonGuideTitle">JSON guide</h4>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" onClick={copyExample}><CopyIcon /> Copy</button>
                <button className="btn btn-sm" onClick={downloadExample}><DownloadSimpleIcon /> Download</button>
              </div>
            </div>
            <pre className="chip-mono">{CHECKLIST_JSON_EXAMPLE}</pre>
            <ul className="hint">
              <li>Put the items in a list called <code>&quot;checklist&quot;</code>. A plain list <code>[ ... ]</code> works too.</li>
              <li>Each item is either text in quotes, or <code>{'{ "text": "...", "done": true }'}</code> to mark it done.</li>
              <li><code>&quot;done&quot;</code> is optional and defaults to not done. Items are up to 200 characters each.</li>
            </ul>
          </section>

          <div className="modal-foot" style={{ alignItems: 'center' }}>
            {existingCount > 0 && (
              <label className="hint" style={{ marginRight: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" className="check" checked={replace} onChange={e => setReplace(e.target.checked)} />
                Replace the {existingCount} current item{existingCount === 1 ? '' : 's'}
              </label>
            )}
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-pink" onClick={submit} disabled={items.length === 0 || room <= 0}>
              {replace ? 'Replace checklist' : `Add ${items.length || ''} item${items.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
