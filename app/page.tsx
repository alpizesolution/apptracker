import Tracker from '@/components/Tracker';
import { GITHUB_APP_SLUG, cloudEnabled } from '@/lib/firebase/config';

export default function Page() {
  return <Tracker cloudEnabled={cloudEnabled} githubAppSlug={GITHUB_APP_SLUG} />;
}
