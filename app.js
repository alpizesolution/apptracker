/* ==========================================================================
   1. Service Worker Registration
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('ALPIZE SOLUTION Service Worker registered successfully.'))
      .catch(err => console.warn('Service Worker registration note:', err));
  });
}

// Intercept native beforeinstallprompt for PC / Mobile installation
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) {
    installBtn.classList.remove('hidden');
  }
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) installBtn.classList.add('hidden');
  showToast("ALPIZE SOLUTION successfully installed as standalone app!");
});

function installPWA() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then((choice) => {
    if (choice.outcome === 'accepted') {
      showToast("Installing ALPIZE SOLUTION PC app...");
    }
    deferredInstallPrompt = null;
    document.getElementById('pwaInstallBtn').classList.add('hidden');
  });
}

/* ==========================================================================
   2. Online / Offline Status Engine
   ========================================================================== */
function updateNetworkStatus() {
  const isOnline = navigator.onLine;
  const badge = document.getElementById('networkStatusBadge');
  const text = document.getElementById('networkStatusText');
  const banner = document.getElementById('offlineBanner');

  badge.classList.toggle('offline', !isOnline);
  text.innerText = isOnline ? "Online" : "Offline";
  banner.classList.toggle('hidden', isOnline);
}
window.addEventListener('online', () => {
  updateNetworkStatus();
  showToast("Back online! Connection re-established.");
});
window.addEventListener('offline', () => {
  updateNetworkStatus();
  showToast("Offline mode enabled: Local storage operational.");
});

/* ==========================================================================
   3. Seed Data (ALPIZE SOLUTION repos) & State Management
   ========================================================================== */
const STAGES = ['Idea', 'Prototype', 'MVP', 'Testing/Review', 'Shipped/Live', 'Paused/Blocked'];

// `tile` sets the stage color class (see styles.css); `emoji` matches the filter pills.
const STAGE_CONFIG = {
  'Idea': { tile: 'stage-idea', emoji: '💡' },
  'Prototype': { tile: 'stage-prototype', emoji: '🧪' },
  'MVP': { tile: 'stage-mvp', emoji: '🔨' },
  'Testing/Review': { tile: 'stage-testing', emoji: '🔍' },
  'Shipped/Live': { tile: 'stage-live', emoji: '🚀' },
  'Paused/Blocked': { tile: 'stage-paused', emoji: '⛔' }
};

const DEFAULT_PROJECTS = [
  {
    "id": "proj_001",
    "name": "ALPIZE App Tracker",
    "platform": "PWA",
    "desc": "Public repo alpizesolution/apptracker · last push 2026-10-21. This tracker. Offline-first app & project tracker.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "https://alpizesolution.github.io/apptracker/",
    "repoUrl": "https://github.com/alpizesolution/apptracker",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m001a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m001b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_002",
    "name": "PestPatrol",
    "platform": "Web App",
    "desc": "Public repo alpizesolution/pestpatrol · last push 2026-10-21.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/pestpatrol",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m002a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m002b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_003",
    "name": "DSP",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/DSP · last push 2026-10-21.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/DSP",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m003a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m003b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_004",
    "name": "Kwaderno",
    "platform": "Web App",
    "desc": "Public repo alpizesolution/kwaderno · last push 2026-10-21.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/kwaderno",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m004a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m004b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_005",
    "name": "Songlist",
    "platform": "Web App",
    "desc": "Public repo alpizesolution/songlist-sh · last push 2026-10-21.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/songlist-sh",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m005a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m005b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_006",
    "name": "Master EPS-TOPIK PH",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/MASTER-EPS-TOPIK · last push 2026-10-21. Older versions: master-eps-topik-ph, Firebase-Master-Eps-topik-PH.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/MASTER-EPS-TOPIK",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m006a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m006b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_007",
    "name": "TindaMate",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/tindamate · last push 2026-10-20.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/tindamate",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m007a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m007b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_008",
    "name": "EMC Hotel",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/emchotel · last push 2026-10-19.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/emchotel",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m008a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m008b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_009",
    "name": "Peptide Tracker PH",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/peptide-tracker-ph · last push 2026-10-15.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/peptide-tracker-ph",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m009a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m009b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_010",
    "name": "Queerky Tracker",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/queerkytracker · last push 2026-10-15.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/queerkytracker",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m010a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m010b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_011",
    "name": "Zelected Fashion Video Bot",
    "platform": "Discord/Slack Bot",
    "desc": "Private repo alpizesolution/zelected-fashion-video-bot · last push 2026-09-28.",
    "stage": "MVP",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/zelected-fashion-video-bot",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m011a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m011b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_012",
    "name": "Queerky City",
    "platform": "Web App",
    "desc": "Public repo alpizesolution/queerkycity · last push 2026-05-01.",
    "stage": "Paused/Blocked",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/queerkycity",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m012a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m012b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_013",
    "name": "Hiraya",
    "platform": "Web App",
    "desc": "Public repo alpizesolution/hiraya · last push 2026-03-30.",
    "stage": "Paused/Blocked",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/hiraya",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m013a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m013b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_014",
    "name": "ZTUDIO",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/ZTUDIO · last push 2026-01-16.",
    "stage": "Paused/Blocked",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/ZTUDIO",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m014a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m014b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  },
  {
    "id": "proj_015",
    "name": "HAIRDO",
    "platform": "Web App",
    "desc": "Private repo alpizesolution/HAIRDO · last push 2025-12-30. Related repo: HAIRSTYLE.",
    "stage": "Paused/Blocked",
    "nextAction": "Add tagline, tech stack and live URL",
    "stack": [],
    "liveUrl": "",
    "repoUrl": "https://github.com/alpizesolution/HAIRDO",
    "manualProgress": null,
    "milestones": [
      {
        "id": "m015a",
        "text": "Repository created on GitHub",
        "completed": true
      },
      {
        "id": "m015b",
        "text": "Fill in project details",
        "completed": false
      }
    ]
  }
];

const STORAGE_KEY = 'alpize_solution_projects';
const NOTES_KEY = 'alpize_solution_notes';

let projects = [];
let notes = [];
let currentFilter = 'all';
let searchQuery = '';
let currentView = 'grid'; // 'grid' | 'kanban' | 'notes'

/* ==========================================================================
   4. Local Storage & IndexedDB Fallback
   ========================================================================== */
function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      projects = JSON.parse(stored);
      // Fill live URLs added to the seed list after this browser first saved it.
      DEFAULT_PROJECTS.forEach(seed => {
        const match = projects.find(p => p.repoUrl === seed.repoUrl);
        if (match && !match.liveUrl && seed.liveUrl) match.liveUrl = seed.liveUrl;
      });
    } else {
      projects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
      saveData();
    }
  } catch (e) {
    console.error("Storage error:", e);
    projects = DEFAULT_PROJECTS;
  }
  try {
    notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
  } catch (e) {
    notes = [];
  }
  render();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
  updateStats();
}

function loadTemplateSeed() {
  projects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
  saveData();
  render();
  showToast("Reset to ALPIZE SOLUTION project list");
}

function clearAllData() {
  if (confirm("Are you sure you want to delete all tracked apps? Make sure to export a JSON backup first.")) {
    projects = [];
    saveData();
    render();
    showToast("All projects cleared");
  }
}

/* ==========================================================================
   5. Computations & Calculations
   ========================================================================== */
function calculateProgress(project) {
  if (project.manualProgress !== null && project.manualProgress !== undefined && project.manualProgress !== '') {
    return Math.min(100, Math.max(0, parseInt(project.manualProgress, 10)));
  }
  if (!project.milestones || project.milestones.length === 0) return 0;
  const done = project.milestones.filter(m => m.completed).length;
  return Math.round((done / project.milestones.length) * 100);
}

function updateStats() {
  const wipCount = projects.filter(p => ['Idea', 'Prototype', 'MVP'].includes(p.stage)).length;
  const liveCount = projects.filter(p => p.stage === 'Shipped/Live').length;
  const pausedCount = projects.filter(p => p.stage === 'Paused/Blocked').length;

  document.getElementById('statTotal').innerText = projects.length;
  document.getElementById('statWIP').innerText = wipCount;
  document.getElementById('statLive').innerText = liveCount;
  document.getElementById('statPaused').innerText = pausedCount;
  document.getElementById('stickerTotal').innerText = projects.length;
  document.getElementById('stickerLive').innerText = liveCount;
}

/* ==========================================================================
   6. Rendering Engine (Grid & Kanban Views)
   ========================================================================== */
function render() {
  const gridContainer = document.getElementById('gridView');
  const kanbanContainer = document.getElementById('kanbanView');
  const emptyState = document.getElementById('emptyState');
  const notesView = document.getElementById('notesView');
  const filterBar = document.getElementById('filterBar');

  if (currentView === 'notes') {
    gridContainer.classList.add('hidden');
    kanbanContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    filterBar.classList.add('hidden');
    notesView.classList.remove('hidden');
    renderNotes();
    updateStats();
    return;
  }
  notesView.classList.add('hidden');
  filterBar.classList.remove('hidden');

  let filtered = projects.filter(p => {
    if (currentFilter !== 'all' && p.stage !== currentFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = (p.desc || '').toLowerCase().includes(q);
      const matchAction = (p.nextAction || '').toLowerCase().includes(q);
      const matchPlatform = (p.platform || '').toLowerCase().includes(q);
      const matchStack = allTech(p).some(t => t.value.toLowerCase().includes(q));
      return matchName || matchDesc || matchAction || matchPlatform || matchStack;
    }
    return true;
  });

  if (filtered.length === 0) {
    gridContainer.classList.add('hidden');
    kanbanContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    updateStats();
    return;
  }

  emptyState.classList.add('hidden');

  if (currentView === 'grid') {
    gridContainer.classList.remove('hidden');
    kanbanContainer.classList.add('hidden');
    gridContainer.innerHTML = filtered.map(p => renderProjectCard(p)).join('');
  } else {
    gridContainer.classList.add('hidden');
    kanbanContainer.classList.remove('hidden');
    renderKanban(filtered);
  }

  updateStats();
}

function renderProjectCard(project) {
  const progress = calculateProgress(project);
  const stage = STAGE_CONFIG[project.stage] || { tile: '', emoji: '' };
  const milestones = project.milestones || [];
  const doneCount = milestones.filter(m => m.completed).length;
  const loginCount = (project.logins || []).length;

  const milestonesHtml = milestones.map(m => `
    <li>
      <label>
        <input type="checkbox" class="check" ${m.completed ? 'checked' : ''} onchange="toggleMilestone('${project.id}', '${m.id}')">
        <span class="${m.completed ? 'done' : ''}">${escapeHtml(m.text)}</span>
      </label>
      <button class="icon-btn danger" onclick="deleteMilestone('${project.id}', '${m.id}')" title="Remove item"><i class="ph-bold ph-trash"></i></button>
    </li>
  `).join('');

  const stackHtml = allTech(project).map(t => `<span class="chip tech-chip tech-${t.key}" title="${t.label}"><small>${t.short}</small>${escapeHtml(t.value)}</span>`).join('');

  return `
    <article class="card ${stage.tile}">
      <div>
        <div class="card-top">
          <div class="card-badges">
            <span class="stage-pill ${stage.tile}">${stage.emoji} ${escapeHtml(project.stage)}</span>
            <span class="chip">${escapeHtml(project.platform || 'Web App')}</span>
          </div>
          <div class="card-actions">
            <button class="icon-btn" onclick="duplicateProject('${project.id}')" title="Duplicate app"><i class="ph-bold ph-copy"></i></button>
            <button class="icon-btn" onclick="editProject('${project.id}')" title="Edit app"><i class="ph-bold ph-pencil-simple"></i></button>
            <button class="icon-btn danger" onclick="deleteProject('${project.id}')" title="Delete app"><i class="ph-bold ph-trash"></i></button>
          </div>
        </div>

        <h2>${escapeHtml(project.name)}</h2>
        <p class="desc">${escapeHtml(project.desc || 'No tagline yet.')}</p>

        <div class="next">
          <i class="ph-bold ph-lightning"></i>
          <div style="min-width: 0;">
            <small>Next step / blocker</small>
            <span>${escapeHtml(project.nextAction || 'Define the next step')}</span>
          </div>
        </div>

        <div class="progress">
          <div class="progress-head"><span>Progress</span><span>${progress}%</span></div>
          <div class="bar"><div style="width: ${progress}%"></div></div>
        </div>

        <div class="checklist">
          <div class="checklist-head"><span>Checklist</span><span>${doneCount}/${milestones.length} done</span></div>
          <ul>${milestonesHtml || '<li class="hint">No checklist items yet</li>'}</ul>
          <div class="add-row">
            <input type="text" id="milestoneInput-${project.id}" class="field field-sm" placeholder="Add item..." onkeydown="if(event.key === 'Enter'){ addMilestone('${project.id}'); }">
            <button class="btn btn-sm" onclick="addMilestone('${project.id}')">Add</button>
          </div>
        </div>

        ${stackHtml ? `<div class="stack">${stackHtml}</div>` : ''}
      </div>

      <div class="card-foot">
        <div class="links">
          ${project.repoUrl
            ? `<a class="link" href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noopener noreferrer"><i class="ph-bold ph-github-logo"></i> Repo</a>`
            : `<span class="link muted"><i class="ph-bold ph-github-logo"></i> No repo</span>`}
          ${project.liveUrl
            ? `<a class="link live" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer"><i class="ph-bold ph-arrow-square-out"></i> Live</a>`
            : `<button class="link ghost" onclick="setLiveUrl('${project.id}')" title="Add the live website link"><i class="ph-bold ph-globe"></i> Add live</button>`}
          <button class="link" onclick="openLogins('${project.id}')" title="Saved logins for this app"><i class="ph-bold ph-key"></i> Logins${loginCount ? ` (${loginCount})` : ''}</button>
        </div>
        <select class="stage-select" onchange="updateProjectStage('${project.id}', this.value)" title="Change stage">
          ${STAGES.map(s => `<option value="${s}" ${s === project.stage ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </article>
  `;
}

function renderKanban(filteredProjects) {
  const container = document.getElementById('kanbanColumnsContainer');
  container.innerHTML = STAGES.map(stageName => {
    const stageProjects = filteredProjects.filter(p => p.stage === stageName);
    const stage = STAGE_CONFIG[stageName];

    const cardsHtml = stageProjects.map(p => {
      const progress = calculateProgress(p);
      const milestones = p.milestones || [];
      return `
        <div class="kcard ${stage.tile}" draggable="true" ondragstart="handleDragStart(event, '${p.id}')">
          <div class="meta">
            <span>${escapeHtml(p.platform || 'Web')}</span>
            <span>
              <button class="icon-btn" onclick="editProject('${p.id}')" title="Edit app"><i class="ph-bold ph-pencil-simple"></i></button>
              <button class="icon-btn danger" onclick="deleteProject('${p.id}')" title="Delete app"><i class="ph-bold ph-trash"></i></button>
            </span>
          </div>
          <h4>${escapeHtml(p.name)}</h4>
          <p class="desc">${escapeHtml(p.desc || '')}</p>
          <div class="progress-head" style="font-size: 12px; margin: 0;"><span>Progress</span><span>${progress}%</span></div>
          <div class="bar"><div style="width: ${progress}%"></div></div>
          ${p.nextAction ? `<div class="nexttxt">⚡ ${escapeHtml(p.nextAction)}</div>` : ''}
          <div class="foot">
            <span>${milestones.filter(m => m.completed).length}/${milestones.length} tasks</span>
            <span>
              ${p.repoUrl ? `<a href="${escapeHtml(p.repoUrl)}" target="_blank" rel="noopener noreferrer" title="Repo"><i class="ph-bold ph-github-logo"></i></a>` : ''}
              ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer" title="Live website"><i class="ph-bold ph-arrow-square-out"></i></a>` : ''}
            </span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <section class="kcol ${stage.tile}" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${stageName}')">
        <div class="kcol-head"><span>${stage.emoji} ${stageName}</span><span class="count">${stageProjects.length}</span></div>
        <div class="kcol-body">${cardsHtml || '<div class="drop-empty">Drop apps here</div>'}</div>
      </section>
    `;
  }).join('');
}

/* ==========================================================================
   7. Drag & Drop for Kanban
   ========================================================================== */
let draggedProjectId = null;

function handleDragStart(e, id) {
  draggedProjectId = id;
  e.dataTransfer.setData('text/plain', id);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, targetStage) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!draggedProjectId) return;

  const proj = projects.find(p => p.id === draggedProjectId);
  if (proj && proj.stage !== targetStage) {
    proj.stage = targetStage;
    saveData();
    render();
    showToast(`Moved "${proj.name}" to ${targetStage}`);
  }
  draggedProjectId = null;
}

/* ==========================================================================
   8. Milestone & Task Operations
   ========================================================================== */
function toggleMilestone(projectId, milestoneId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  const milestone = (proj.milestones || []).find(m => m.id === milestoneId);
  if (milestone) {
    milestone.completed = !milestone.completed;
    saveData();
    render();
  }
}

function addMilestone(projectId) {
  const input = document.getElementById(`milestoneInput-${projectId}`);
  if (!input || !input.value.trim()) return;

  const proj = projects.find(p => p.id === projectId);
  if (proj) {
    if (!proj.milestones) proj.milestones = [];
    proj.milestones.push({
      id: 'm_' + Date.now(),
      text: input.value.trim(),
      completed: false
    });
    saveData();
    render();
    input.value = '';
    input.focus();
    showToast("Task added");
  }
}

function deleteMilestone(projectId, milestoneId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  proj.milestones = (proj.milestones || []).filter(m => m.id !== milestoneId);
  saveData();
  render();
}

function updateProjectStage(projectId, newStage) {
  const proj = projects.find(p => p.id === projectId);
  if (proj) {
    proj.stage = newStage;
    saveData();
    render();
    showToast(`Stage updated to ${newStage}`);
  }
}

/* ==========================================================================
   9. Project CRUD Modal Actions
   ========================================================================== */
function openModal(isEdit = false) {
  const modal = document.getElementById('projectModal');
  const title = document.getElementById('modalTitle');
  if (!isEdit) {
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    title.innerHTML = '<i class="ph-bold ph-plus-circle"></i> New app';
    setFormTech({});
  }
  modal.classList.remove('hidden');
  document.getElementById('formName').focus();
}

function closeModal() {
  document.getElementById('projectModal').classList.add('hidden');
}

function editProject(id) {
  const proj = projects.find(p => p.id === id);
  if (!proj) return;

  document.getElementById('projectId').value = proj.id;
  document.getElementById('formName').value = proj.name || '';
  document.getElementById('formPlatform').value = proj.platform || 'Web App';
  document.getElementById('formDesc').value = proj.desc || '';
  document.getElementById('formStage').value = proj.stage || 'Idea';
  document.getElementById('formAction').value = proj.nextAction || '';
  setFormTech(projectTech(proj));
  document.getElementById('formLiveUrl').value = proj.liveUrl || '';
  document.getElementById('formRepoUrl').value = proj.repoUrl || '';
  document.getElementById('formManualProgress').value = proj.manualProgress !== null && proj.manualProgress !== undefined ? proj.manualProgress : '';

  const title = document.getElementById('modalTitle');
  title.innerHTML = '<i class="ph-bold ph-pencil-simple"></i> Edit app';

  openModal(true);
}

function duplicateProject(id) {
  const proj = projects.find(p => p.id === id);
  if (!proj) return;

  const copy = JSON.parse(JSON.stringify(proj));
  copy.id = 'proj_' + Date.now();
  copy.name = copy.name + ' (Copy)';
  delete copy.logins;
  projects.unshift(copy);
  saveData();
  render();
  showToast(`Duplicated "${proj.name}"`);
}

function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById('projectId').value;
  const name = document.getElementById('formName').value.trim();
  const platform = document.getElementById('formPlatform').value;
  const desc = document.getElementById('formDesc').value.trim();
  const stage = document.getElementById('formStage').value;
  const nextAction = document.getElementById('formAction').value.trim();
  const liveUrl = document.getElementById('formLiveUrl').value.trim();
  const repoUrl = document.getElementById('formRepoUrl').value.trim();
  const rawProgress = document.getElementById('formManualProgress').value;
  
  commitPendingTech();
  const tech = JSON.parse(JSON.stringify(formTech));
  // "Other" tools stay in `stack` so older backups and code keep working.
  const stack = tech.other || [];
  delete tech.other;
  const manualProgress = rawProgress === '' ? null : parseInt(rawProgress, 10);

  if (id) {
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        name,
        platform,
        desc,
        stage,
        nextAction,
        tech,
        stack,
        liveUrl,
        repoUrl,
        manualProgress
      };
      showToast(`Saved changes to "${name}"`);
    }
  } else {
    const newProj = {
      id: 'proj_' + Date.now(),
      name,
      platform,
      desc,
      stage,
      nextAction,
      tech,
      stack,
      liveUrl,
      repoUrl,
      manualProgress,
      milestones: [
        { id: 'm_' + Date.now(), text: 'Architecture design & scaffolding', completed: false }
      ]
    };
    projects.unshift(newProj);
    showToast(`Created new app "${name}"`);
  }

  saveData();
  render();
  closeModal();
}

/* ==========================================================================
   9b. Tech Stack Fields (framework, frontend, backend...) with suggestions
   ========================================================================== */
const TECH_FIELDS = [
  { key: 'framework', label: 'Framework', short: 'FW', placeholder: 'e.g. Next.js, Laravel, Flutter',
    suggest: ['Next.js', 'Nuxt', 'SvelteKit', 'Remix', 'Astro', 'Vite', 'React', 'Vue', 'Angular', 'Svelte', 'Laravel', 'CodeIgniter', 'Symfony', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails', 'Express', 'NestJS', 'Spring Boot', 'ASP.NET Core', 'Flutter', 'React Native', 'Expo', 'Ionic', 'Capacitor', 'Electron', 'Tauri', 'Gatsby', 'WordPress'] },
  { key: 'frontend', label: 'Frontend', short: 'FE', placeholder: 'e.g. React, Tailwind CSS',
    suggest: ['HTML/CSS', 'JavaScript', 'TypeScript', 'Vanilla JS', 'React', 'Vue', 'Angular', 'Svelte', 'SolidJS', 'Alpine.js', 'jQuery', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'shadcn/ui', 'DaisyUI', 'Sass', 'Blade', 'Livewire', 'Inertia.js', 'Flutter', 'React Native', 'Kotlin', 'Swift'] },
  { key: 'backend', label: 'Backend', short: 'BE', placeholder: 'e.g. Node.js, Firebase',
    suggest: ['Node.js', 'Express', 'NestJS', 'PHP', 'Laravel', 'Python', 'Django', 'Flask', 'FastAPI', 'Go', 'Java', 'Spring Boot', 'C# / .NET', 'Ruby on Rails', 'Firebase', 'Supabase', 'Appwrite', 'PocketBase', 'Convex', 'Cloudflare Workers', 'AWS Lambda', 'Serverless', 'GraphQL', 'REST API', 'None (static)'] },
  { key: 'database', label: 'Database', short: 'DB', placeholder: 'e.g. MySQL, Firestore',
    suggest: ['MySQL', 'PostgreSQL', 'SQLite', 'MariaDB', 'MongoDB', 'Firestore', 'Firebase Realtime DB', 'Supabase', 'Redis', 'SQL Server', 'DynamoDB', 'PlanetScale', 'Neon', 'Turso', 'localStorage', 'IndexedDB', 'Google Sheets'] },
  { key: 'hosting', label: 'Hosting', short: 'HOST', placeholder: 'e.g. Vercel, GitHub Pages',
    suggest: ['GitHub Pages', 'Vercel', 'Netlify', 'Firebase Hosting', 'Cloudflare Pages', 'Render', 'Railway', 'Fly.io', 'Heroku', 'AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'Hostinger', 'cPanel', 'Play Store', 'App Store'] },
  { key: 'other', label: 'Other tools', short: '+', placeholder: 'e.g. Stripe, OpenAI',
    suggest: ['PWA', 'Stripe', 'PayMongo', 'GCash', 'PayPal', 'Xendit', 'OpenAI', 'Claude API', 'Gemini API', 'Google Maps', 'Twilio', 'Semaphore SMS', 'Resend', 'SendGrid', 'Cloudinary', 'Firebase Auth', 'Clerk', 'Auth0', 'Docker', 'GitHub Actions', 'Figma', 'Chart.js'] }
];

let formTech = {};
let techActive = { key: null, index: -1, items: [] };

// A project's tech as { key: [values] }; older projects only have `stack`, shown as "Other tools".
function projectTech(project) {
  const tech = {};
  TECH_FIELDS.forEach(f => {
    tech[f.key] = f.key === 'other'
      ? [...(project.stack || [])]
      : [...((project.tech && project.tech[f.key]) || [])];
  });
  return tech;
}

function allTech(project) {
  const tech = projectTech(project);
  return TECH_FIELDS.flatMap(f => tech[f.key].map(value => ({ key: f.key, label: f.label, short: f.short, value })));
}

function setFormTech(tech) {
  formTech = {};
  TECH_FIELDS.forEach(f => { formTech[f.key] = [...(tech[f.key] || [])]; });
  renderTechFields();
}

function renderTechFields() {
  document.getElementById('techFields').innerHTML = TECH_FIELDS.map(f => `
    <div class="tech-field">
      <label class="tech-label tech-${f.key}" for="techInput-${f.key}">${f.label}</label>
      <div class="tag-input" onclick="document.getElementById('techInput-${f.key}').focus()">
        <span id="techTags-${f.key}" class="tag-list">${renderTechTags(f.key)}</span>
        <input type="text" id="techInput-${f.key}" autocomplete="off" placeholder="${f.placeholder}"
          role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="techSuggest-${f.key}"
          oninput="showTechSuggestions('${f.key}')" onfocus="showTechSuggestions('${f.key}')"
          onkeydown="handleTechKey(event, '${f.key}')" onblur="setTimeout(() => hideTechSuggestions('${f.key}'), 150)">
      </div>
      <ul id="techSuggest-${f.key}" class="suggest hidden" role="listbox"></ul>
    </div>
  `).join('');
}

function renderTechTags(key) {
  return formTech[key].map((value, i) => `
    <span class="tech-tag tech-${key}">${escapeHtml(value)}<button type="button" onclick="removeTech('${key}', ${i})" title="Remove ${escapeHtml(value)}">&times;</button></span>
  `).join('');
}

function refreshTechTags(key) {
  document.getElementById(`techTags-${key}`).innerHTML = renderTechTags(key);
}

// Suggestions: the built-in list plus anything already used in your other apps.
function techSuggestionsFor(key, query) {
  const used = projects.flatMap(p => projectTech(p)[key]);
  const field = TECH_FIELDS.find(f => f.key === key);
  const pool = [...new Set([...field.suggest, ...used])];
  const taken = formTech[key].map(v => v.toLowerCase());
  const q = query.trim().toLowerCase();
  return pool
    .filter(v => !taken.includes(v.toLowerCase()))
    .filter(v => !q || v.toLowerCase().includes(q))
    .sort((a, b) => {
      if (!q) return 0;
      const as = a.toLowerCase().startsWith(q), bs = b.toLowerCase().startsWith(q);
      return as === bs ? 0 : as ? -1 : 1;
    })
    .slice(0, 8);
}

function showTechSuggestions(key) {
  const input = document.getElementById(`techInput-${key}`);
  const list = document.getElementById(`techSuggest-${key}`);
  const items = techSuggestionsFor(key, input.value);
  const typed = input.value.trim();
  if (typed && !items.some(v => v.toLowerCase() === typed.toLowerCase())) items.push(typed);
  techActive = { key, index: items.length ? 0 : -1, items };
  if (items.length === 0) {
    hideTechSuggestions(key);
    return;
  }
  list.innerHTML = items.map((v, i) => `
    <li role="option" class="${i === 0 ? 'active' : ''}" onmousedown="event.preventDefault(); addTech('${key}', ${i})">
      ${v === typed && !techSuggestionsFor(key, typed).includes(v) ? `Add "<b>${escapeHtml(v)}</b>"` : highlightMatch(v, typed)}
    </li>
  `).join('');
  list.classList.remove('hidden');
  input.setAttribute('aria-expanded', 'true');
}

function highlightMatch(value, query) {
  const i = query ? value.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return escapeHtml(value);
  return escapeHtml(value.slice(0, i)) + '<b>' + escapeHtml(value.slice(i, i + query.length)) + '</b>' + escapeHtml(value.slice(i + query.length));
}

function hideTechSuggestions(key) {
  const list = document.getElementById(`techSuggest-${key}`);
  const input = document.getElementById(`techInput-${key}`);
  if (list) list.classList.add('hidden');
  if (input) input.setAttribute('aria-expanded', 'false');
  if (techActive.key === key) techActive = { key: null, index: -1, items: [] };
}

function addTech(key, index) {
  const value = (techActive.key === key ? techActive.items[index] : null) || '';
  addTechValue(key, value);
}

function addTechValue(key, raw) {
  const input = document.getElementById(`techInput-${key}`);
  const value = raw.replace(/,+$/, '').trim();
  if (value && !formTech[key].some(v => v.toLowerCase() === value.toLowerCase())) {
    formTech[key].push(value);
    refreshTechTags(key);
  }
  input.value = '';
  showTechSuggestions(key);
  input.focus();
}

function removeTech(key, index) {
  formTech[key].splice(index, 1);
  refreshTechTags(key);
}

function handleTechKey(e, key) {
  const input = e.target;
  const list = document.getElementById(`techSuggest-${key}`);
  const open = !list.classList.contains('hidden') && techActive.key === key;

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!open) { showTechSuggestions(key); e.preventDefault(); return; }
    e.preventDefault();
    const n = techActive.items.length;
    techActive.index = (techActive.index + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
    [...list.children].forEach((li, i) => li.classList.toggle('active', i === techActive.index));
  } else if ((e.key === 'Enter' || e.key === 'Tab') && input.value.trim()) {
    e.preventDefault();
    if (open && techActive.index >= 0) addTech(key, techActive.index);
    else addTechValue(key, input.value);
  } else if (e.key === ',') {
    e.preventDefault();
    addTechValue(key, input.value);
  } else if (e.key === 'Backspace' && input.value === '' && formTech[key].length) {
    removeTech(key, formTech[key].length - 1);
  } else if (e.key === 'Escape' && open) {
    e.stopPropagation();
    hideTechSuggestions(key);
  }
}

// Typed text that wasn't added yet still counts when the form is saved.
function commitPendingTech() {
  TECH_FIELDS.forEach(f => {
    const input = document.getElementById(`techInput-${f.key}`);
    if (input && input.value.trim()) {
      input.value.split(',').map(v => v.trim()).filter(Boolean).forEach(v => {
        if (!formTech[f.key].some(x => x.toLowerCase() === v.toLowerCase())) formTech[f.key].push(v);
      });
      input.value = '';
    }
  });
}

function setLiveUrl(id) {
  const proj = projects.find(p => p.id === id);
  if (!proj) return;
  let url = (prompt(`Live website link for "${proj.name}"`, 'https://') || '').trim();
  if (!url || url === 'https://') return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  proj.liveUrl = url;
  saveData();
  render();
  showToast(`Live link added to "${proj.name}"`);
}

function deleteProject(id) {
  const proj = projects.find(p => p.id === id);
  if (!proj) return;

  if (confirm(`Delete "${proj.name}" permanently?`)) {
    projects = projects.filter(p => p.id !== id);
    saveData();
    render();
    showToast(`Removed "${proj.name}"`);
  }
}

/* ==========================================================================
   10. Filters, Search & View Modes
   ========================================================================== */
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  render();
}

function handleSearch(val) {
  searchQuery = val;
  const clearBtn = document.getElementById('clearSearchBtn');
  if (val) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  render();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  input.value = '';
  searchQuery = '';
  document.getElementById('clearSearchBtn').classList.add('hidden');
  render();
}

function setViewMode(mode) {
  currentView = mode;
  const buttons = { grid: 'viewGridBtn', kanban: 'viewKanbanBtn', notes: 'viewNotesBtn' };
  Object.entries(buttons).forEach(([key, id]) => {
    document.getElementById(id).classList.toggle('active', key === mode);
  });
  render();
}

function toggleActionMenu() {
  const menu = document.getElementById('actionDropdown');
  menu.classList.toggle('hidden');
}

// Close dropdown on outside click
window.addEventListener('click', (e) => {
  const btn = document.getElementById('actionMenuBtn');
  const menu = document.getElementById('actionDropdown');
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

/* ==========================================================================
   11. JSON Export & Import Backups
   ========================================================================== */
function exportData() {
  const dataStr = JSON.stringify({ projects, notes }, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alpize-solution-projects-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("JSON backup downloaded to PC");
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      // Older backups are a plain array of projects.
      if (Array.isArray(parsed) || (parsed && Array.isArray(parsed.projects))) {
        projects = Array.isArray(parsed) ? parsed : parsed.projects;
        if (parsed.notes && Array.isArray(parsed.notes)) {
          notes = parsed.notes;
          saveNotes();
        }
        saveData();
        render();
        showToast("Projects successfully restored from JSON");
      } else {
        showToast("Invalid backup file: no projects found");
      }
    } catch (err) {
      showToast("Failed to parse JSON backup file");
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

/* ==========================================================================
   12. Idea Sticky Notes
   ========================================================================== */
const NOTE_COLORS = ['note-yellow', 'note-pink', 'note-lime', 'note-orange', 'note-sky'];

function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error("Failed to save notes:", err);
  }
}

function addNotesFromPaste() {
  const input = document.getElementById('notesPasteInput');
  const lines = input.value
    .split(/\r?\n/)
    .map(l => l.replace(/[|]+$/, '').trim())
    .filter(Boolean);
  if (lines.length === 0) return;

  const stamp = Date.now();
  const added = lines.map((text, i) => ({
    id: `note_${stamp}_${i}`,
    text,
    color: (notes.length + i) % NOTE_COLORS.length
  }));
  notes = [...added, ...notes];
  saveNotes();
  input.value = '';
  render();
  showToast(`Added ${added.length} sticky note${added.length === 1 ? '' : 's'}`);
}

function renderNotes() {
  const grid = document.getElementById('notesGrid');
  if (notes.length === 0) {
    grid.innerHTML = '<div class="notes-empty">No sticky notes yet. Paste your ideas above.</div>';
    return;
  }
  grid.innerHTML = notes.map(n => `
    <div class="note ${NOTE_COLORS[n.color % NOTE_COLORS.length]}">
      <textarea rows="4" placeholder="Write an idea..." onchange="updateNoteText('${n.id}', this.value)">${escapeHtml(n.text)}</textarea>
      <div class="note-foot">
        <button onclick="noteToProject('${n.id}')" title="Turn into an app card (Idea stage)"><i class="ph-bold ph-arrow-circle-up-right"></i> Make app</button>
        <span>
          <button onclick="cycleNoteColor('${n.id}')" title="Change color"><i class="ph-bold ph-palette"></i></button>
          <button onclick="deleteNote('${n.id}')" title="Delete note"><i class="ph-bold ph-trash"></i></button>
        </span>
      </div>
    </div>
  `).join('');
}

function updateNoteText(id, text) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  note.text = text.trim();
  saveNotes();
}

function cycleNoteColor(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  note.color = (note.color + 1) % NOTE_COLORS.length;
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  render();
}

function noteToProject(id) {
  const note = notes.find(n => n.id === id);
  if (!note || !note.text) return;
  const [title, ...rest] = note.text.split(/\r?\n/);
  projects.unshift({
    id: 'proj_' + Date.now(),
    name: title.trim(),
    platform: 'Web App',
    desc: rest.join(' ').trim(),
    stage: 'Idea',
    nextAction: 'Define scope and main features',
    stack: [],
    liveUrl: '',
    repoUrl: '',
    manualProgress: null,
    milestones: [
      { id: 'm_' + Date.now(), text: 'Architecture design & scaffolding', completed: false }
    ]
  });
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  saveData();
  render();
  showToast(`"${title.trim()}" added to your apps as an Idea`);
}

/* ==========================================================================
   13. Per-App Logins (stored in this browser only)
   ========================================================================== */
let loginsProjectId = null;
const revealedLogins = new Set();

function openLogins(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  loginsProjectId = projectId;
  revealedLogins.clear();
  document.getElementById('loginsTitle').innerText = `${proj.name} Logins`;
  document.getElementById('loginsPasteInput').value = '';
  document.getElementById('loginsPasswordInput').value = '';
  renderLogins();
  document.getElementById('loginsModal').classList.remove('hidden');
}

function closeLogins() {
  document.getElementById('loginsModal').classList.add('hidden');
  loginsProjectId = null;
  revealedLogins.clear();
  render();
}

function renderLogins() {
  const proj = projects.find(p => p.id === loginsProjectId);
  const list = document.getElementById('loginsList');
  const logins = (proj && proj.logins) || [];
  if (logins.length === 0) {
    list.innerHTML = '<div class="hint">No logins saved for this app yet.</div>';
    return;
  }
  list.innerHTML = logins.map(l => {
    const shown = revealedLogins.has(l.id);
    return `
      <div class="login-row">
        <div class="cell">
          <span class="mono" title="${escapeHtml(l.username)}">${escapeHtml(l.username)}</span>
          <button class="icon-btn" onclick="copyLoginField('${l.id}', 'username')" title="Copy username"><i class="ph-bold ph-copy"></i></button>
        </div>
        <div class="role" title="${escapeHtml(l.role)}">${escapeHtml(l.role || '-')}</div>
        <div class="cell end">
          <span class="mono">${shown ? escapeHtml(l.password) : (l.password ? '••••••••' : '-')}</span>
          <button class="icon-btn" onclick="toggleLoginReveal('${l.id}')" title="${shown ? 'Hide' : 'Show'} password"><i class="ph-bold ${shown ? 'ph-eye-slash' : 'ph-eye'}"></i></button>
          <button class="icon-btn" onclick="copyLoginField('${l.id}', 'password')" title="Copy password"><i class="ph-bold ph-copy"></i></button>
          <button class="icon-btn danger" onclick="deleteLogin('${l.id}')" title="Remove login"><i class="ph-bold ph-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

function addLoginsFromPaste() {
  const proj = projects.find(p => p.id === loginsProjectId);
  if (!proj) return;
  const lines = document.getElementById('loginsPasteInput').value
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  let password = document.getElementById('loginsPasswordInput').value.trim();

  // A last line that is a single word and not an email is the shared password.
  const last = lines[lines.length - 1];
  if (last && !/\s/.test(last) && !last.includes('@')) {
    lines.pop();
    if (!password) password = last;
  }
  if (lines.length === 0) {
    showToast("Paste at least one username");
    return;
  }

  const stamp = Date.now();
  const added = lines.map((line, i) => {
    // Username and role are separated by a tab or 2+ spaces, else by the first space.
    let [username, ...role] = line.split(/\t+|\s{2,}/);
    if (role.length === 0) [username, ...role] = line.split(/\s+/);
    return { id: `login_${stamp}_${i}`, username: username.trim(), role: role.join(' ').trim(), password };
  });
  proj.logins = [...(proj.logins || []), ...added];
  saveData();
  document.getElementById('loginsPasteInput').value = '';
  document.getElementById('loginsPasswordInput').value = '';
  renderLogins();
  showToast(`Saved ${added.length} login${added.length === 1 ? '' : 's'} on this device`);
}

function toggleLoginReveal(loginId) {
  if (revealedLogins.has(loginId)) revealedLogins.delete(loginId);
  else revealedLogins.add(loginId);
  renderLogins();
}

function copyLoginField(loginId, field) {
  const proj = projects.find(p => p.id === loginsProjectId);
  const login = proj && (proj.logins || []).find(l => l.id === loginId);
  if (!login) return;
  navigator.clipboard.writeText(login[field] || '')
    .then(() => showToast(`${field === 'password' ? 'Password' : 'Username'} copied`))
    .catch(() => showToast("Could not copy to clipboard"));
}

function deleteLogin(loginId) {
  const proj = projects.find(p => p.id === loginsProjectId);
  if (!proj) return;
  proj.logins = (proj.logins || []).filter(l => l.id !== loginId);
  saveData();
  renderLogins();
}

/* ==========================================================================
   14. Light / Dark Theme
   ========================================================================== */
const THEME_KEY = 'alpize_solution_theme';

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#111111');
  const icon = document.getElementById('themeToggleIcon');
  const btn = document.getElementById('themeToggleBtn');
  if (icon) icon.className = `ph-bold ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`;
  if (btn) btn.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}

function toggleTheme() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (e) {}
}

/* ==========================================================================
   15. Utilities & Toast System
   ========================================================================== */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    if (loginsProjectId) closeLogins();
  }
});

window.onload = function() {
  updateNetworkStatus();
  applyTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  loadData();
};
  
