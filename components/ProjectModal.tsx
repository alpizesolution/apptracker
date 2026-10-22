'use client';

import { useState } from 'react';
import { PencilSimpleIcon, PlusCircleIcon, XIcon } from '@phosphor-icons/react';
import { PLATFORMS, STAGES, type Project, type Stage } from '@/lib/types';
import { TECH_FIELDS, addTechValue, emptyTech, projectTech, type FormTech, type TechFieldKey } from '@/lib/tech';
import { safeUrl } from '@/lib/sanitize';
import TechFields from './TechFields';

const STAGE_LABELS: Record<Stage, string> = {
  'Idea': 'Idea (Planning)',
  'Prototype': 'Prototype (PoC)',
  'MVP': 'MVP (In Active Dev)',
  'Testing/Review': 'Testing / Review',
  'Shipped/Live': 'Shipped / Live',
  'Paused/Blocked': 'Paused / Blocked'
};
const PLATFORM_LABELS: Record<string, string> = { 'Discord/Slack Bot': 'Bot' };

export type ProjectDraft = Omit<Project, 'id' | 'milestones' | 'github'>;

const noTyped = (): Record<TechFieldKey, string> => ({ framework: '', frontend: '', backend: '', database: '', hosting: '', other: '' });

export default function ProjectModal({ project, projects, onSave, onClose }: {
  project: Project | null;
  projects: Project[];
  onSave: (draft: ProjectDraft) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(project?.name || '');
  const [platform, setPlatform] = useState(project?.platform || 'Web App');
  const [desc, setDesc] = useState(project?.desc || '');
  const [stage, setStage] = useState<Stage>(project?.stage || 'Idea');
  const [nextAction, setNextAction] = useState(project?.nextAction || '');
  const [tech, setTech] = useState<FormTech>(project ? projectTech(project) : emptyTech());
  const [typed, setTyped] = useState(noTyped);
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl || '');
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl || '');
  const [progress, setProgress] = useState(project?.manualProgress?.toString() ?? '');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const live = safeUrl(liveUrl);
    const repo = safeUrl(repoUrl);
    if ((liveUrl.trim() && !live) || (repoUrl.trim() && !repo)) {
      setError('Links must be web addresses starting with http:// or https://');
      return;
    }
    // Typed text that wasn't added as a tag yet still counts.
    const finalTech = { ...tech };
    TECH_FIELDS.forEach(f => {
      typed[f.key].split(',').forEach(v => { finalTech[f.key] = addTechValue(finalTech[f.key], v); });
    });
    const { other, ...rest } = finalTech;
    const pct = progress === '' ? null : Math.min(100, Math.max(0, parseInt(progress, 10)));
    onSave({
      name: name.trim(), platform, desc: desc.trim(), stage, nextAction: nextAction.trim(),
      tech: rest, stack: other, liveUrl: live, repoUrl: repo,
      manualProgress: pct === null || Number.isNaN(pct) ? null : pct
    });
  };

  return (
    <div className="overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div className="modal-head">
          <h3 id="modalTitle">{project ? <><PencilSimpleIcon /> Edit app</> : <><PlusCircleIcon /> New app</>}</h3>
          <button className="icon-btn" onClick={onClose} title="Close"><XIcon /></button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-grid cols-3">
            <div>
              <label className="label" htmlFor="formName">App name *</label>
              <input type="text" id="formName" required maxLength={120} className="field" placeholder="e.g. Ipon Checklist" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label" htmlFor="formPlatform">Type</label>
              <select id="formPlatform" className="select field" value={platform} onChange={e => setPlatform(e.target.value)}>
                {!PLATFORMS.includes(platform as (typeof PLATFORMS)[number]) && <option value={platform}>{platform}</option>}
                {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_LABELS[p] || p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="formDesc">Tagline</label>
            <input type="text" id="formDesc" maxLength={400} className="field" placeholder="One line on what it does" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div className="form-grid cols-2">
            <div>
              <label className="label" htmlFor="formStage">Stage</label>
              <select id="formStage" className="select field" value={stage} onChange={e => setStage(e.target.value as Stage)}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="formAction">Next step / blocker</label>
              <input type="text" id="formAction" maxLength={200} className="field" placeholder="e.g. Set up payments" value={nextAction} onChange={e => setNextAction(e.target.value)} />
            </div>
          </div>

          <fieldset className="tech-fieldset">
            <legend className="label">Tech stack</legend>
            <p className="hint" style={{ margin: '0 0 10px' }}>Start typing to see suggestions. Press Enter or comma to add, or pick from the list.</p>
            <TechFields tech={tech} typed={typed} projects={projects} onChange={setTech} onTypedChange={setTyped} />
          </fieldset>

          <div className="form-grid cols-2">
            <div>
              <label className="label" htmlFor="formLiveUrl">Live website</label>
              <input type="text" inputMode="url" id="formLiveUrl" className="field" placeholder="https://myapp.com" value={liveUrl} onChange={e => { setLiveUrl(e.target.value); setError(''); }} />
            </div>
            <div>
              <label className="label" htmlFor="formRepoUrl">GitHub repo</label>
              <input type="text" inputMode="url" id="formRepoUrl" className="field" placeholder="https://github.com/you/repo" value={repoUrl} onChange={e => { setRepoUrl(e.target.value); setError(''); }} />
            </div>
          </div>
          {error && <div className="warn" role="alert">{error}</div>}

          <div>
            <label className="label" htmlFor="formManualProgress">Progress override (%)</label>
            <input type="number" id="formManualProgress" min={0} max={100} className="field" placeholder="Leave empty to use the checklist" value={progress} onChange={e => setProgress(e.target.value)} />
          </div>

          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-pink">Save app</button>
          </div>
        </form>
      </div>
    </div>
  );
}
