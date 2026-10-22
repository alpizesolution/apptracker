# ALPIZE SOLUTION – App & Project Tracker

Track every app you are building, from first idea to live launch. Anyone can use it in the browser without an account, or sign in with GitHub to pull in their repos and sync their board across devices.

Built with Next.js (App Router) and Firebase (Authentication + Firestore), hosted on Vercel.

## Features

- Card grid and Kanban board (drag cards between stages), with stage colors
- Per-app checklist, progress bar, next step, tech stack, repo and live links
- Import a checklist from a JSON file (the { } button under each checklist shows the format)
- Tech stack fields (Framework, Frontend, Backend, Database, Hosting, Other tools) that suggest options as you type
- Idea board: paste a list and each line becomes a sticky note; **Make app** turns a note into a card
- Per-app logins (username, role, password), kept only in the browser
- Cream and dark themes, installable as an app (PWA), works offline
- **Sign in with GitHub** (optional): your board syncs to your account, and **Import from GitHub** adds or refreshes cards from the repos you choose to share
- JSON backup export and import (logins are left out unless you pick **Export with logins**)

## How it fits together

| Part | What it does |
| --- | --- |
| `app/page.tsx`, `components/` | The tracker UI (React client components) |
| `components/useAccount.ts` | GitHub sign-in with Firebase Auth (popup) |
| `components/useBoard.ts` | Loads and saves the board: browser storage when signed out, the Firestore document `boards/{uid}` when signed in |
| `lib/sanitize.ts` | Checks everything that comes from outside (backups, database, GitHub). Only `http(s)` links are allowed |
| `app/api/session` | Checks a new sign-in (Firebase ID token + GitHub confirms the same account) and stores GitHub's token in an encrypted, HttpOnly cookie |
| `app/api/github/repos` | Lists the repos the user shared with the GitHub App (server side, token never reaches the page) |
| `proxy.ts` | Per-request Content Security Policy with a nonce |
| `next.config.ts` | Security headers (HSTS, frame blocking, referrer and permissions policy) |
| `firestore.rules` | Firestore security rules: each user can only read and write their own board |
| `public/sw.js` | Offline support |

App logins never leave the browser, even when signed in.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Without the environment variables below the tracker runs in browser-only mode (no sign-in button).

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. CI runs all four on every pull request.

## Turn on GitHub sign-in and sync

You need three things: a Firebase project, a GitHub App, and the Vercel project.

### 1. Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (the free Spark plan is enough).
2. **Build → Firestore Database → Create database** (production mode). Open the **Rules** tab, paste the contents of `firestore.rules`, and **Publish**.
3. **Project settings → General → Your apps → Add app → Web**. Copy `apiKey`, `authDomain`, `projectId` and `appId` from the config it shows.
4. **Build → Authentication → Get started → Sign-in method → GitHub**: turn it on. Copy the **callback URL** it shows (`https://<project>.firebaseapp.com/__/auth/handler`); you need it in the next step.
5. **Authentication → Settings → Authorized domains**: add your Vercel domain (for example `apptracker.vercel.app`) and any custom domain.

### 2. GitHub App

A GitHub App lets each person pick exactly which repos the tracker can see, read-only, instead of granting access to all their code.

1. Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App** (create it under the `alpizesolution` organization if you want the org to own it).
2. **Callback URL:** the Firebase callback URL from step 1.4.
3. Check **Request user authorization (OAuth) during installation**.
4. Turn off the **Webhook** (not needed).
5. **Permissions:** Repository → *Metadata: Read-only*. Account → *Email addresses: Read-only*. Nothing else.
6. **Where can this app be installed:** *Any account*, so other people can use it.
7. Create the app, then **Generate a new client secret**. Paste the **Client ID** and secret into Firebase's GitHub sign-in settings (step 1.4) and save. Note the app's URL name (the `<slug>` in `github.com/apps/<slug>`).

### 3. Vercel

1. In [Vercel](https://vercel.com), **Add New → Project** and import `alpizesolution/apptracker`. The Next.js settings are detected automatically.
2. Add these **Environment Variables** (see `.env.example`):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (the Firebase web config is public by design; Firestore rules are what protect the data)
   - `NEXT_PUBLIC_GITHUB_APP_SLUG`
   - `TOKEN_SECRET` (random, 32+ characters: `openssl rand -base64 48`)
3. Deploy. For local development, put the same values in `.env.local`.

## Moving your old board

The first version saved everything in the browser at its own address, so it does not carry over automatically. On the old site, open **⋮ → Export JSON backup**, then on the new site use **⋮ → Import backup**. Logins inside an old backup are restored to the new site's browser storage. After signing in, **Import from GitHub** can also rebuild the list from your repos.
