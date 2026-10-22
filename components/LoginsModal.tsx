'use client';

import { useState } from 'react';
import { CopyIcon, EyeIcon, EyeSlashIcon, KeyIcon, LockSimpleIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import type { Login } from '@/lib/types';
import { parseLogins } from '@/lib/sanitize';

export default function LoginsModal({ projectName, logins, onAdd, onDelete, onClose, toast }: {
  projectName: string;
  logins: Login[];
  onAdd: (logins: Omit<Login, 'id'>[]) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  toast: (msg: string) => void;
}) {
  const [paste, setPaste] = useState('');
  const [password, setPassword] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const add = () => {
    const parsed = parseLogins(paste, password);
    if (parsed.logins.length === 0) {
      toast('Paste at least one username');
      return;
    }
    onAdd(parsed.logins);
    setPaste('');
    setPassword('');
    toast(`Saved ${parsed.logins.length} login${parsed.logins.length === 1 ? '' : 's'} on this device`);
  };

  const copy = (value: string, what: string) => {
    navigator.clipboard.writeText(value)
      .then(() => toast(`${what} copied`))
      .catch(() => toast('Could not copy to clipboard'));
  };

  const toggle = (id: string) => setRevealed(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="overlay">
      <div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="loginsTitle">
        <div className="modal-head">
          <h3><KeyIcon /> <span id="loginsTitle">{projectName} Logins</span></h3>
          <button className="icon-btn" onClick={onClose} title="Close"><XIcon /></button>
        </div>
        <div className="modal-body">
          <div className="warn">
            <LockSimpleIcon />
            <span>Logins are saved only in this browser on this device, even when you are signed in. They are never uploaded or synced, and normal backups leave them out.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logins.length === 0 && <div className="hint">No logins saved for this app yet.</div>}
            {logins.map(l => {
              const shown = revealed.has(l.id);
              return (
                <div key={l.id} className="login-row">
                  <div className="cell">
                    <span className="mono" title={l.username}>{l.username}</span>
                    <button className="icon-btn" onClick={() => copy(l.username, 'Username')} title="Copy username"><CopyIcon /></button>
                  </div>
                  <div className="role" title={l.role}>{l.role || '-'}</div>
                  <div className="cell end">
                    <span className="mono">{shown ? l.password : l.password ? '••••••••' : '-'}</span>
                    <button className="icon-btn" onClick={() => toggle(l.id)} title={`${shown ? 'Hide' : 'Show'} password`}>{shown ? <EyeSlashIcon /> : <EyeIcon />}</button>
                    <button className="icon-btn" onClick={() => copy(l.password, 'Password')} title="Copy password"><CopyIcon /></button>
                    <button className="icon-btn danger" onClick={() => onDelete(l.id)} title="Remove login"><TrashIcon /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '2px dashed var(--line)', paddingTop: 14 }}>
            <label htmlFor="loginsPasteInput" className="label">Add logins (one per line: username, then role)</label>
            <textarea id="loginsPasteInput" rows={4} className="textarea chip-mono" placeholder={'admin@myapp.local    Admin\nuser@myapp.local    Student'} value={paste} onChange={e => setPaste(e.target.value)} />
            <div className="paste-row" style={{ marginTop: 10 }}>
              <input type="text" autoComplete="off" className="field chip-mono" placeholder="Password for these logins" aria-label="Password for these logins" value={password} onChange={e => setPassword(e.target.value)} />
              <button className="btn btn-lime" onClick={add}><PlusIcon /> Add logins</button>
            </div>
            <p className="hint" style={{ margin: '8px 0 0' }}>If the password is on its own line at the end of what you paste, it is picked up automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
