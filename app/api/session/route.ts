import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, sealSession, sessionCookieOptions, verifyIdToken } from '@/lib/session';

function sameOrigin(request: NextRequest) {
  return request.headers.get('origin') === new URL(request.url).origin;
}

// Called by the page right after a GitHub sign-in. The Firebase ID token proves
// who signed in; GitHub confirms the access token belongs to that same account.
// Only then is the token stored, server side, for repo import.
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const idToken = typeof body?.idToken === 'string' ? body.idToken : '';
  const githubToken = typeof body?.githubToken === 'string' ? body.githubToken : '';
  if (!idToken || !githubToken || githubToken.length > 500) return NextResponse.json({ error: 'Missing sign-in details.' }, { status: 400 });

  const user = await verifyIdToken(idToken);
  if (!user || !user.githubId) return NextResponse.json({ error: 'Sign-in could not be verified.' }, { status: 401 });

  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    cache: 'no-store'
  });
  const gh = res.ok ? await res.json() : null;
  if (!gh || String(gh.id) !== user.githubId) return NextResponse.json({ error: 'GitHub account does not match.' }, { status: 401 });

  const avatar = typeof gh.avatar_url === 'string' && gh.avatar_url.startsWith('https://avatars.githubusercontent.com/') ? gh.avatar_url : '';
  const response = NextResponse.json({ login: String(gh.login || ''), avatarUrl: avatar });
  try {
    response.cookies.set(SESSION_COOKIE, await sealSession({ uid: user.uid, githubToken, login: String(gh.login || ''), avatarUrl: avatar }), sessionCookieOptions);
  } catch (err) {
    // Sign-in and sync still work; only repo import is unavailable until TOKEN_SECRET is set.
    console.error('Could not store the GitHub session:', err);
  }
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
