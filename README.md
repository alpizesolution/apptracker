# ALPIZE SOLUTION – App & Project Tracker

Track every app you are building, from first idea to live launch. Anyone can use it in the browser without an account, or sign in with GitHub to pull in their repos and sync their board across devices.

Built with Next.js (App Router) and Supabase, hosted on Vercel.

## Features

- Card grid and Kanban board (drag cards between stages), with stage colors
- Per-app checklist, progress bar, next step, tech stack, repo and live links
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
| `components/useBoard.ts` | Loads and saves the board: browser storage when signed out, the `boards` table when signed in |
| `lib/sanitize.ts` | Checks everything that comes from outside (backups, database, GitHub). Only `http(s)` links are allowed |
| `app/auth/callback` | Finishes GitHub sign-in and stores GitHub's token in an encrypted, HttpOnly cookie |
| `app/api/github/repos` | Lists the repos the user shared with the GitHub App (server side, token never reaches the page) |
| `proxy.ts` | Per-request Content Security Policy with a nonce, and keeps the sign-in session fresh |
| `next.config.ts` | Security headers (HSTS, frame blocking, referrer and permissions policy) |
| `supabase/migrations/` | The `boards` table with row-level security, so each user can only reach their own row |
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

You need three things: a Supabase project, a GitHub App, and the Vercel project.

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free tier is enough).
2. Open **SQL Editor**, paste the contents of `supabase/migrations/0001_boards.sql`, and run it.
3. Copy the **Project URL** and **anon public key** from **Project Settings → API**.

### 2. GitHub App

A GitHub App lets each person pick exactly which repos the tracker can see, read-only, instead of granting access to all their code.

1. Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App** (create it under the `alpizesolution` organization if you want the org to own it).
2. **Callback URL:** `https://<your-supabase-project>.supabase.co/auth/v1/callback`
3. Check **Request user authorization (OAuth) during installation**.
4. Turn off the **Webhook** (not needed).
5. **Permissions:** Repository → *Metadata: Read-only*. Account → *Email addresses: Read-only*. Nothing else.
6. **Where can this app be installed:** *Any account*, so other people can use it.
7. Create the app, then **Generate a new client secret**. Note the **Client ID**, the secret, and the app's URL name (the `<slug>` in `github.com/apps/<slug>`).

### 3. Connect them

1. In Supabase, **Authentication → Sign In / Providers → GitHub**: turn it on and paste the GitHub App's Client ID and secret.
2. In Supabase, **Authentication → URL Configuration**: set **Site URL** to your Vercel address and add `https://<your-domain>/auth/callback` and `http://localhost:3000/auth/callback` to **Redirect URLs**.

### 4. Vercel

1. In [Vercel](https://vercel.com), **Add New → Project** and import `alpizesolution/apptracker`. The Next.js settings are detected automatically.
2. Add these **Environment Variables** (see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GITHUB_APP_SLUG`
   - `TOKEN_SECRET` (random, 32+ characters: `openssl rand -base64 48`)
3. Deploy. For local development, put the same values in `.env.local`.

## Moving your old board

The first version saved everything in the browser at its own address, so it does not carry over automatically. On the old site, open **⋮ → Export JSON backup**, then on the new site use **⋮ → Import backup**. Logins inside an old backup are restored to the new site's browser storage. After signing in, **Import from GitHub** can also rebuild the list from your repos.
