'use client';

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { cloudEnabled, firebaseConfig } from './config';

let app: FirebaseApp | null = null;

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
  return a ? getFirestore(a) : null;
}
