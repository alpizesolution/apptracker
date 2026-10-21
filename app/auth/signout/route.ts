import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { GITHUB_TOKEN_COOKIE } from '@/lib/token-cookie';

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  // Only accept sign-out from our own pages.
  if (request.headers.get('origin') !== origin) return new NextResponse('Forbidden', { status: 403 });

  const supabase = await getServerSupabase();
  await supabase?.auth.signOut();
  const response = NextResponse.redirect(`${origin}/`, { status: 303 });
  response.cookies.delete(GITHUB_TOKEN_COOKIE);
  return response;
}
