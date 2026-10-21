import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, openSession } from '@/lib/session';
import { summarizeRepo } from '@/lib/github';
import type { RepoSummary } from '@/lib/types';

const MAX_REPOS = 300;

async function gh(path: string, token: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    cache: 'no-store'
  });
  return { ok: res.ok, status: res.status, body: res.ok ? await res.json() : null };
}

// Repos the user shared with the ALPIZE GitHub App. A GitHub App only sees the
// repos picked during install, read-only. If sign-in uses a plain OAuth App
// instead, fall back to the repos that token can list.
async function listRepos(token: string): Promise<{ repos: RepoSummary[]; installations: number } | { status: number }> {
  const installs = await gh('/user/installations?per_page=100', token);
  const raw: Record<string, unknown>[] = [];
  let installations = 0;

  if (installs.ok) {
    const list = (installs.body?.installations || []) as { id: number }[];
    installations = list.length;
    for (const inst of list) {
      for (let page = 1; page <= 3 && raw.length < MAX_REPOS; page++) {
        const res = await gh(`/user/installations/${inst.id}/repositories?per_page=100&page=${page}`, token);
        if (!res.ok) break;
        const repos = res.body?.repositories || [];
        raw.push(...repos);
        if (repos.length < 100) break;
      }
    }
  } else if (installs.status === 401) {
    return { status: 401 };
  } else {
    for (let page = 1; page <= 3 && raw.length < MAX_REPOS; page++) {
      const res = await gh(`/user/repos?per_page=100&sort=pushed&page=${page}`, token);
      if (!res.ok) return { status: res.status };
      raw.push(...res.body);
      if (res.body.length < 100) break;
    }
  }

  const seen = new Set<string>();
  const repos = raw.map(summarizeRepo).filter((r): r is RepoSummary => {
    if (!r || seen.has(r.fullName)) return false;
    seen.add(r.fullName);
    return true;
  });
  repos.sort((a, b) => (b.pushedAt || '').localeCompare(a.pushedAt || ''));
  return { repos: repos.slice(0, MAX_REPOS), installations };
}

export async function GET() {
  const session = await openSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: 'GitHub access expired. Sign out and sign in again.', reconnect: true }, { status: 401 });

  const result = await listRepos(session.githubToken);
  if ('status' in result) {
    const reconnect = result.status === 401;
    return NextResponse.json(
      { error: reconnect ? 'GitHub access expired. Sign out and sign in again.' : 'GitHub did not answer. Try again in a minute.', reconnect },
      { status: reconnect ? 401 : 502 }
    );
  }
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
