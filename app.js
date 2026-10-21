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

  if (isOnline) {
    badge.className = "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    text.innerText = "Online";
    banner.classList.add('hidden');
  } else {
    badge.className = "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20";
    text.innerText = "Offline Mode";
    banner.classList.remove('hidden');
  }
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

const STAGE_CONFIG = {
  'Idea': { color: 'border-purple-500/30 text-purple-400 bg-purple-500/10', dot: 'bg-purple-400', tile: 'stage-idea' },
  'Prototype': { color: 'border-blue-500/30 text-blue-400 bg-blue-500/10', dot: 'bg-blue-400', tile: 'stage-prototype' },
  'MVP': { color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10', dot: 'bg-indigo-400', tile: 'stage-mvp' },
  'Testing/Review': { color: 'border-amber-500/30 text-amber-400 bg-amber-500/10', dot: 'bg-amber-400', tile: 'stage-testing' },
  'Shipped/Live': { color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10', dot: 'bg-emerald-400', tile: 'stage-live' },
  'Paused/Blocked': { color: 'border-rose-500/30 text-rose-400 bg-rose-500/10', dot: 'bg-rose-400', tile: 'stage-paused' }
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
  document.getElementById('statTotal').innerText = projects.length;
  
  const wipCount = projects.filter(p => ['Idea', 'Prototype', 'MVP'].includes(p.stage)).length;
  const liveCount = projects.filter(p => p.stage === 'Shipped/Live').length;
  const pausedCount = projects.filter(p => p.stage === 'Paused/Blocked').length;

  document.getElementById('statWIP').innerText = wipCount;
  document.getElementById('statLive').innerText = liveCount;
  document.getElementById('statPaused').innerText = pausedCount;
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
      const matchStack = (p.stack || []).some(s => s.toLowerCase().includes(q));
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
    gridContainer.innerHTML = filtered.map(p => renderProjectCard(p, false)).join('');
  } else {
    gridContainer.classList.add('hidden');
    kanbanContainer.classList.remove('hidden');
    renderKanban(filtered);
  }

  updateStats();
}

function renderProjectCard(project, isCompact = false) {
  const progress = calculateProgress(project);
  const stageStyle = STAGE_CONFIG[project.stage] || { color: 'border-slate-700 text-slate-300 bg-slate-800', dot: 'bg-slate-400', tile: '' };

  const milestonesHtml = (project.milestones || []).map(m => `
    <li class="flex items-center justify-between text-xs py-1 group/item">
      <label class="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white flex-1 min-w-0 pr-2">
        <input 
          type="checkbox" 
          ${m.completed ? 'checked' : ''} 
          onchange="toggleMilestone('${project.id}', '${m.id}')"
          class="custom-checkbox w-3.5 h-3.5 rounded border border-slate-700 bg-slate-950 focus:ring-0 transition cursor-pointer"
        >
        <span class="${m.completed ? 'line-through text-slate-500' : ''} truncate">${escapeHtml(m.text)}</span>
      </label>
      <button 
        onclick="deleteMilestone('${project.id}', '${m.id}')" 
        class="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 rounded transition"
        title="Remove milestone"
      >
        <i class="ph ph-trash text-sm"></i>
      </button>
    </li>
  `).join('');

  const stackHtml = (project.stack || []).map(tag => `
    <span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60">${escapeHtml(tag)}</span>
  `).join('');

  return `
    <div class="stage-tile ${stageStyle.tile} bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xl relative group">
      <div>
        <!-- Top Row: Stage & Menu -->
        <div class="flex items-start justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageStyle.color}">
              <span class="w-1.5 h-1.5 rounded-full ${stageStyle.dot}"></span>
              ${project.stage}
            </span>
            <span class="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50">
              ${escapeHtml(project.platform || 'Web App')}
            </span>
          </div>
          
          <div class="flex items-center gap-1">
            <button onclick="duplicateProject('${project.id}')" title="Duplicate App" class="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition">
              <i class="ph ph-copy text-sm"></i>
            </button>
            <button onclick="editProject('${project.id}')" title="Edit App Details" class="text-slate-500 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition">
              <i class="ph ph-pencil-simple text-sm"></i>
            </button>
            <button onclick="deleteProject('${project.id}')" title="Delete App" class="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition">
              <i class="ph ph-trash text-sm"></i>
            </button>
          </div>
        </div>

        <!-- App Title & Tagline -->
        <h2 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
          ${escapeHtml(project.name)}
        </h2>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
          ${escapeHtml(project.desc || 'No description provided for this application.')}
        </p>

        <!-- Next Priority / Blocker Badge -->
        <div class="mt-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-start gap-2.5">
          <div class="p-1 rounded-md bg-amber-500/10 text-amber-400 mt-0.5">
            <i class="ph-bold ph-lightning text-xs"></i>
          </div>
          <div class="text-[11px] min-w-0">
            <span class="text-slate-500 uppercase font-bold text-[10px] block tracking-wide">Next Priority / Blocker</span>
            <span class="text-slate-200 font-medium truncate block">${escapeHtml(project.nextAction || 'Define next action step')}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex justify-between items-center text-xs mb-1.5">
            <span class="text-[11px] font-medium text-slate-400">Milestone Velocity</span>
            <span class="text-xs font-semibold text-slate-200 font-mono">${progress}%</span>
          </div>
          <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
            <div class="bg-gradient-to-r from-indigo-500 via-brand-500 to-emerald-400 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="mt-4 pt-4 border-t border-slate-800/60">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Checklist</span>
            <span class="text-[11px] text-slate-500 font-mono">${(project.milestones || []).filter(m => m.completed).length}/${(project.milestones || []).length} done</span>
          </div>

          <ul class="space-y-0.5 max-h-36 overflow-y-auto pr-1">
            ${milestonesHtml || '<li class="text-xs text-slate-600 italic py-1">No checklist items yet</li>'}
          </ul>

          <!-- Add Milestone Input -->
          <div class="mt-2.5 flex gap-1.5">
            <input 
              type="text" 
              id="milestoneInput-${project.id}" 
              placeholder="Add item..." 
              onkeydown="if(event.key === 'Enter'){ addMilestone('${project.id}'); }"
              class="flex-1 px-2.5 py-1 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            >
            <button 
              onclick="addMilestone('${project.id}')"
              class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium transition"
            >
              Add
            </button>
          </div>
        </div>

        <!-- Tech Stack Tags -->
        <div class="mt-4 flex flex-wrap gap-1.5">
          ${stackHtml}
        </div>
      </div>

      <!-- Card Bottom Links -->
      <div class="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs text-slate-400">
        <div class="flex items-center gap-x-3 gap-y-1 flex-wrap min-w-0">
          ${project.repoUrl ? `
            <a href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="hover:text-white flex items-center gap-1 transition">
              <i class="ph-bold ph-git-branch text-sm text-indigo-400"></i>
              <span>Repo</span>
            </a>
          ` : `<span class="text-slate-600 flex items-center gap-1 cursor-not-allowed"><i class="ph-bold ph-git-branch text-sm"></i> No Repo</span>`}

          ${project.liveUrl ? `
            <a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition">
              <i class="ph-bold ph-arrow-square-out text-sm"></i>
              <span>Live App</span>
            </a>
          ` : `
            <button onclick="setLiveUrl('${project.id}')" title="Add the live website link" class="text-slate-500 hover:text-emerald-400 flex items-center gap-1 whitespace-nowrap transition">
              <i class="ph-bold ph-globe text-sm"></i>
              <span>Add Live</span>
            </button>
          `}

          <button onclick="openLogins('${project.id}')" title="Saved logins for this app" class="hover:text-white flex items-center gap-1 transition">
            <i class="ph-bold ph-key text-sm text-amber-400"></i>
            <span>Logins${(project.logins || []).length ? ` (${project.logins.length})` : ''}</span>
          </button>
        </div>

        <!-- Quick Stage Changer Dropdown -->
        <select onchange="updateProjectStage('${project.id}', this.value)" class="bg-slate-950 border border-slate-800 text-[11px] text-slate-400 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500">
          ${STAGES.map(s => `<option value="${s}" ${s === project.stage ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function renderKanban(filteredProjects) {
  const container = document.getElementById('kanbanColumnsContainer');
  container.innerHTML = STAGES.map(stage => {
    const stageProjects = filteredProjects.filter(p => p.stage === stage);
    const stageStyle = STAGE_CONFIG[stage];

    const cardsHtml = stageProjects.map(p => {
      const progress = calculateProgress(p);
      return `
        <div 
          draggable="true" 
          ondragstart="handleDragStart(event, '${p.id}')"
          class="stage-tile ${stageStyle.tile} p-4 rounded-xl bg-slate-900 border border-slate-800/90 shadow-md hover:border-slate-700 transition cursor-grab active:cursor-grabbing mb-3"
        >
          <div class="flex items-start justify-between gap-1 mb-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">${escapeHtml(p.platform || 'Web')}</span>
            <div class="flex items-center gap-1">
              <button onclick="editProject('${p.id}')" class="text-slate-500 hover:text-slate-300 p-0.5"><i class="ph ph-pencil-simple text-xs"></i></button>
              <button onclick="deleteProject('${p.id}')" class="text-slate-500 hover:text-rose-400 p-0.5"><i class="ph ph-trash text-xs"></i></button>
            </div>
          </div>

          <h4 class="text-sm font-bold text-white mb-1">${escapeHtml(p.name)}</h4>
          <p class="text-[11px] text-slate-400 line-clamp-2 mb-2.5">${escapeHtml(p.desc || '')}</p>

          <!-- Progress bar -->
          <div class="mb-2">
            <div class="flex justify-between text-[11px] text-slate-500 mb-0.5">
              <span>Progress</span>
              <span class="font-mono text-slate-300">${progress}%</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
              <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${progress}%"></div>
            </div>
          </div>

          ${p.nextAction ? `
            <div class="text-[11px] bg-slate-950/70 p-1.5 rounded border border-slate-800/80 text-amber-300/90 truncate mb-2">
              <i class="ph-bold ph-lightning text-[10px] mr-0.5"></i> ${escapeHtml(p.nextAction)}
            </div>
          ` : ''}

          <div class="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
            <span>${(p.milestones || []).filter(m => m.completed).length}/${(p.milestones || []).length} tasks</span>
            <div class="flex items-center gap-2">
              ${p.repoUrl ? `<a href="${escapeHtml(p.repoUrl)}" target="_blank" class="hover:text-slate-300"><i class="ph-bold ph-git-branch"></i></a>` : ''}
              ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" class="text-emerald-400 hover:text-emerald-300"><i class="ph-bold ph-arrow-square-out"></i></a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div 
        class="stage-tile stage-column ${stageStyle.tile} min-w-0 bg-slate-900/40 border border-slate-800/70 rounded-2xl p-3 flex flex-col max-h-[75vh]"
        ondragover="handleDragOver(event)"
        ondragleave="handleDragLeave(event)"
        ondrop="handleDrop(event, '${stage}')"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${stageStyle.dot}"></span>
            <span class="text-xs font-bold text-slate-200">${stage}</span>
          </div>
          <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">${stageProjects.length}</span>
        </div>

        <!-- Scrollable Cards -->
        <div class="overflow-y-auto flex-1 pr-1">
          ${cardsHtml || '<div class="h-24 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-600">Drop apps here</div>'}
        </div>
      </div>
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
    title.innerHTML = '<i class="ph-bold ph-plus-circle text-indigo-400"></i> New Application';
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
  document.getElementById('formStack').value = (proj.stack || []).join(', ');
  document.getElementById('formLiveUrl').value = proj.liveUrl || '';
  document.getElementById('formRepoUrl').value = proj.repoUrl || '';
  document.getElementById('formManualProgress').value = proj.manualProgress !== null && proj.manualProgress !== undefined ? proj.manualProgress : '';

  const title = document.getElementById('modalTitle');
  title.innerHTML = '<i class="ph-bold ph-pencil-simple text-indigo-400"></i> Edit App Details';

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
  const rawStack = document.getElementById('formStack').value;
  const liveUrl = document.getElementById('formLiveUrl').value.trim();
  const repoUrl = document.getElementById('formRepoUrl').value.trim();
  const rawProgress = document.getElementById('formManualProgress').value;
  
  const stack = rawStack.split(',').map(s => s.trim()).filter(Boolean);
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
    if (btn.dataset.filter === filter) {
      btn.className = "filter-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white transition whitespace-nowrap";
    } else {
      btn.className = "filter-btn px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition whitespace-nowrap";
    }
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
    document.getElementById(id).className = key === mode
      ? "p-1.5 rounded text-xs transition bg-indigo-600 text-white shadow"
      : "p-1.5 rounded text-xs transition text-slate-400 hover:text-white";
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
const NOTE_COLORS = [
  'bg-amber-200 text-amber-950',
  'bg-pink-200 text-pink-950',
  'bg-emerald-200 text-emerald-950',
  'bg-sky-200 text-sky-950',
  'bg-violet-200 text-violet-950'
];

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
    grid.innerHTML = '<div class="col-span-full py-12 text-center text-xs text-slate-500">No sticky notes yet. Paste your ideas above.</div>';
    return;
  }
  grid.innerHTML = notes.map(n => `
    <div class="${NOTE_COLORS[n.color % NOTE_COLORS.length]} rounded-lg p-3 shadow-lg shadow-black/30 flex flex-col min-h-[140px] rotate-[-0.5deg] hover:rotate-0 transition">
      <textarea
        onchange="updateNoteText('${n.id}', this.value)"
        class="flex-1 w-full bg-transparent resize-none text-sm font-semibold leading-snug focus:outline-none placeholder-black/40"
        rows="4"
        placeholder="Write an idea..."
      >${escapeHtml(n.text)}</textarea>
      <div class="flex items-center justify-between pt-2 mt-1 border-t border-black/10 text-black/60">
        <button onclick="noteToProject('${n.id}')" title="Turn into a project card (Idea stage)" class="text-[11px] font-semibold hover:text-black flex items-center gap-1">
          <i class="ph-bold ph-arrow-circle-up-right text-sm"></i> Make App
        </button>
        <div class="flex items-center gap-1">
          <button onclick="cycleNoteColor('${n.id}')" title="Change color" class="p-1 rounded hover:bg-black/10 hover:text-black"><i class="ph-bold ph-palette text-sm"></i></button>
          <button onclick="deleteNote('${n.id}')" title="Delete note" class="p-1 rounded hover:bg-black/10 hover:text-black"><i class="ph-bold ph-trash text-sm"></i></button>
        </div>
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
    list.innerHTML = '<div class="text-xs text-slate-500 italic">No logins saved for this app yet.</div>';
    return;
  }
  list.innerHTML = logins.map(l => {
    const shown = revealedLogins.has(l.id);
    return `
      <div class="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
        <div class="col-span-12 sm:col-span-5 min-w-0 flex items-center gap-1.5">
          <span class="font-mono text-slate-200 truncate" title="${escapeHtml(l.username)}">${escapeHtml(l.username)}</span>
          <button onclick="copyLoginField('${l.id}', 'username')" title="Copy username" class="text-slate-500 hover:text-white p-0.5 flex-shrink-0"><i class="ph ph-copy text-sm"></i></button>
        </div>
        <div class="col-span-5 sm:col-span-3 min-w-0 text-slate-400 truncate" title="${escapeHtml(l.role)}">${escapeHtml(l.role || '-')}</div>
        <div class="col-span-7 sm:col-span-4 min-w-0 flex items-center justify-end gap-1">
          <span class="font-mono text-slate-200 truncate">${shown ? escapeHtml(l.password) : (l.password ? '••••••••' : '-')}</span>
          <button onclick="toggleLoginReveal('${l.id}')" title="${shown ? 'Hide' : 'Show'} password" class="text-slate-500 hover:text-white p-0.5 flex-shrink-0"><i class="ph ${shown ? 'ph-eye-slash' : 'ph-eye'} text-sm"></i></button>
          <button onclick="copyLoginField('${l.id}', 'password')" title="Copy password" class="text-slate-500 hover:text-white p-0.5 flex-shrink-0"><i class="ph ph-copy text-sm"></i></button>
          <button onclick="deleteLogin('${l.id}')" title="Remove login" class="text-slate-500 hover:text-rose-400 p-0.5 flex-shrink-0"><i class="ph ph-trash text-sm"></i></button>
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
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'light' ? '#f8fafc' : '#0f172a');
  const icon = document.getElementById('themeToggleIcon');
  const btn = document.getElementById('themeToggleBtn');
  if (icon) icon.className = `ph-bold ${theme === 'light' ? 'ph-moon' : 'ph-sun'} text-lg`;
  if (btn) btn.title = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
}

function toggleTheme() {
  const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
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
  const text = document.getElementById('toastMsg');
  text.innerText = msg;
  toast.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
  }, 3200);
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
  applyTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
  loadData();
};
  
