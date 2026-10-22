import Link from 'next/link';

export const metadata = { title: 'Privacy - ALPIZE SOLUTION' };

export default function Privacy() {
  return (
    <main className="wrap prose-page">
      <p><Link href="/" className="btn btn-sm">← Back to the tracker</Link></p>
      <h1>Privacy</h1>
      <p>The ALPIZE SOLUTION tracker keeps as little about you as it can.</p>

      <h2>Without signing in</h2>
      <p>Everything you add is saved only in this browser. Nothing is sent to us.</p>

      <h2>When you sign in with GitHub</h2>
      <ul>
        <li>We store your GitHub username, avatar and email (from GitHub) so you can sign in again.</li>
        <li>Your projects and idea notes are stored in our database so they sync across your devices. Only your account can read them.</li>
        <li>Repo sync reads the name, description, website and last-push date of the repos <b>you choose</b> to share with the ALPIZE GitHub App. It never reads or changes your code.</li>
        <li>GitHub&apos;s access token is kept in an encrypted, HttpOnly cookie in your browser, not in our database.</li>
      </ul>

      <h2>App logins and passwords</h2>
      <p>Usernames and passwords you save for your apps never leave your browser, even when you are signed in. They are not uploaded or synced.</p>

      <h2>Deleting your data</h2>
      <p>Open the ⋮ menu and choose <b>Delete my cloud data</b> to erase your synced projects and notes. To remove your account completely, revoke the app in GitHub under Settings → Applications and contact ALPIZE SOLUTION.</p>
    </main>
  );
}
