import Tracker, { type Account } from '@/components/Tracker';
import { getUser } from '@/lib/supabase/server';
import { GITHUB_APP_SLUG, cloudEnabled } from '@/lib/supabase/config';

export default async function Page() {
  const user = await getUser();
  const meta = (user?.user_metadata || {}) as Record<string, unknown>;
  const account: Account | null = user
    ? {
        id: user.id,
        login: String(meta.user_name || meta.preferred_username || meta.name || 'GitHub user'),
        avatarUrl: typeof meta.avatar_url === 'string' && meta.avatar_url.startsWith('https://avatars.githubusercontent.com/') ? meta.avatar_url : ''
      }
    : null;

  return <Tracker account={account} cloudEnabled={cloudEnabled} githubAppSlug={GITHUB_APP_SLUG} />;
}
