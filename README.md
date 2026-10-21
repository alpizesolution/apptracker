# ALPIZE SOLUTION – App & Project Tracker

Offline-first tracker for ALPIZE SOLUTION apps and projects. Installable as a PWA on desktop and mobile.

## Features

- Card grid and Kanban board views (drag cards between stages)
- Per-project checklist, progress bar, next priority, tech stack, repo and live links
- Search and stage filters
- Bold neo-brutalist look (cream background, black outlines, hard shadows) with a cream and a dark theme; the moon/sun button switches them
- Live website link next to the Repo link on each card; click **Add Live** to set one
- Idea board: paste a list of ideas and each line becomes a sticky note; turn a note into an app card with **Make App**
- Tech stack fields (Framework, Frontend, Backend, Database, Hosting, Other tools) that suggest common options as you type, plus anything you've used in other apps
- Per-app logins (username, role, password) with show/hide and copy buttons. Logins are stored only in your browser and are never committed to this repo
- Everything is saved in your browser (`localStorage`), with JSON export and import for backups
- Works offline through a service worker and can be installed as an app

The tracker starts with the projects found in the `alpizesolution` GitHub organization. Edit any card to add its tagline, stack and live URL. Use **⋮ → Reset to ALPIZE Projects** to go back to that starting list.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App page |
| `app.js` | App logic and the starting project list (`DEFAULT_PROJECTS`) |
| `manifest.webmanifest` | PWA manifest (name, icons, colors) |
| `sw.js` | Service worker for offline use. Bump `CACHE_VERSION` after changing app files. |
| `icons/` | App icons |

## Run locally

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080. The service worker needs `http://localhost` or HTTPS, it does not run from `file://`.

## Deploy to GitHub Pages

1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
3. After a minute the app is live at https://alpizesolution.github.io/apptracker/.

Data is stored per browser, so export a JSON backup before switching devices or clearing browser data.
