import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { GITHUB_TOKEN_COOKIE, sealToken, tokenCookieOptions } from '@/lib/token-cookie';

// GitHub sends the user back here after they approve sign-in. Supabase swaps the
// one-time code for a session; we keep GitHub's token for repo sync, sealed in a cookie.
export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const supabase = await getServerSupabase();
  if (!code || !supabase) return NextResponse.redirect(`${origin}/?auth=failed`);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) return NextResponse.redirect(`${origin}/?auth=failed`);

  const response = NextResponse.redirect(`${origin}/`);
  const providerToken = data.session.provider_token;
  if (providerToken) {
    try {
      response.cookies.set(GITHUB_TOKEN_COOKIE, await sealToken(providerToken, data.session.user.id), tokenCookieOptions);
    } catch (err) {
      // Sign-in still works; only repo import is unavailable until TOKEN_SECRET is set.
      console.error('Could not store the GitHub token:', err);
    }
  }
  return response;
}
