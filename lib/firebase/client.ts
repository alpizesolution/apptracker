'use client';

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { cloudEnabled, firebaseConfig } from './config';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function firebaseApp(): FirebaseApp | null {
  if (!cloudEnabled) return null;
  app ??= getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const a = firebaseApp();
  return a ? getAuth(a) : null;
}

export function getDb(): Firestore | null {
  const a = firebaseApp();
  if (!a) return null;
  db ??= initializeFirestore(a, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  return db;
}
