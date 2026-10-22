'use client';

import { useCallback, useEffect, useState } from 'react';
import { GithubAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { clearCloudCopy } from '@/lib/local-store';

export interface Account {
  id: string;
  login: string;
  avatarUrl: string;
}

function toAccount(user: User): Account {
  const github = user.providerData.find(p => p.providerId === 'github.com');
  const photo = github?.photoURL || user.photoURL || '';
  return {
    id: user.uid,
    login: github?.displayName || user.displayName || github?.email || user.email || 'GitHub user',
    avatarUrl: photo.startsWith('https://avatars.githubusercontent.com/') ? photo : ''
  };
}

// Firebase keeps the sign-in in the browser. After a fresh sign-in the page also
// hands GitHub's token to /api/session, which checks it and keeps it server side.
export function useAccount(cloudEnabled: boolean) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(!cloudEnabled);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, user => {
      setAccount(user ? toAccount(user) : null);
      setReady(true);
    });
  }, []);

  const signIn = useCallback(async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    if (!auth) return 'Sign-in is not set up yet.';
    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      const githubToken = GithubAuthProvider.credentialFromResult(result)?.accessToken;
      if (githubToken) {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: await result.user.getIdToken(), githubToken })
        });
        if (!res.ok) return 'Signed in, but GitHub repo import is unavailable right now.';
      }
      return null;
    } catch (err) {
      const code = (err as { code?: string }).code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
      if (code === 'auth/popup-blocked') return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.';
      if (code === 'auth/account-exists-with-different-credential') return 'This email already signed in another way.';
      return 'GitHub sign-in did not finish. Please try again.';
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (account) clearCloudCopy(account.id);
    await fetch('/api/session', { method: 'DELETE' }).catch(() => undefined);
    if (auth) await firebaseSignOut(auth);
  }, [account]);

  return { account, ready, signIn, signOut };
}
