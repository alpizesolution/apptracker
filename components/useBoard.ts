'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Board } from '@/lib/types';
import { sanitizeBoard } from '@/lib/sanitize';
import { loadCloudCopy, loadLocalBoard, saveCloudCopy, saveLocalBoard } from '@/lib/local-store';
import { getDb } from '@/lib/firebase/client';

export type SyncStatus = 'local' | 'loading' | 'saving' | 'saved' | 'error' | 'readonly';

const EMPTY: Board = { projects: [], notes: [] };
const SAVE_DELAY_MS = 800;

function boardDoc(userId: string) {
  const db = getDb();
  return db ? doc(db, 'boards', userId) : null;
}

// Signed out: the board lives in this browser. Signed in: it lives in the
// Firestore document boards/{uid} (only that user can read or write it, see
// firestore.rules) and saves a moment after each change. The board is stored
// as one JSON string so its shape never trips Firestore's nested-array limits.
// `onFirstSync` must be a stable function.
export function useBoard(userId: string | null, authReady: boolean, onFirstSync: (localCount: number) => boolean) {
  const [board, setBoardState] = useState<Board>(EMPTY);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SyncStatus>('loading');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Board | null>(null);
  // Cloud writes stay off until the cloud board has loaded, so a failed load
  // can never overwrite the saved board with an empty one.
  const writable = useRef(false);

  const pushToCloud = useCallback(async (next: Board) => {
    const ref = userId ? boardDoc(userId) : null;
    if (!ref || !userId || !writable.current) return;
    setStatus('saving');
    try {
      await setDoc(ref, { data: JSON.stringify(next), updatedAt: serverTimestamp() });
      saveCloudCopy(userId, next);
      setStatus('saved');
    } catch (err) {
      console.error('Sync failed:', err);
      setStatus('error');
    }
    if (pending.current === next) pending.current = null;
  }, [userId]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    async function load() {
      writable.current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      pending.current = null;
      if (!userId) {
        setBoardState(loadLocalBoard());
        setStatus('local');
        setReady(true);
        return;
      }
      setReady(false);
      setStatus('loading');
      const ref = boardDoc(userId);
      if (!ref) return;
      let raw: unknown = null;
      let exists = false;
      try {
        const snap = await getDoc(ref);
        exists = snap.exists();
        raw = exists ? JSON.parse(String(snap.get('data') || '{}')) : null;
      } catch {
        if (cancelled) return;
        // Offline or the database is unreachable: show the last synced copy, read-only.
        setBoardState(loadCloudCopy(userId) || EMPTY);
        setStatus('readonly');
        setReady(true);
        return;
      }
      if (cancelled) return;
      writable.current = true;
      let next = exists ? sanitizeBoard(raw) : EMPTY;
      // First sign-in on this browser: offer to bring the signed-out board along.
      if (!exists) {
        const local = loadLocalBoard();
        if ((local.projects.length || local.notes.length) && onFirstSync(local.projects.length)) {
          next = local;
          await pushToCloud(next);
        }
      }
      saveCloudCopy(userId, next);
      setBoardState(next);
      setStatus('saved');
      setReady(true);
    }
    load();
    return () => { cancelled = true; };
  }, [userId, authReady, pushToCloud, onFirstSync]);

  // Save whatever is still waiting if the tab is closed mid-delay.
  useEffect(() => {
    const flush = () => {
      if (pending.current && saveTimer.current) {
        clearTimeout(saveTimer.current);
        pushToCloud(pending.current);
      }
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [pushToCloud]);

  const setBoard = useCallback((update: (b: Board) => Board) => {
    setBoardState(prev => {
      const next = update(prev);
      if (!userId) {
        saveLocalBoard(next);
      } else if (writable.current) {
        pending.current = next;
        setStatus('saving');
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => pushToCloud(next), SAVE_DELAY_MS);
      }
      return next;
    });
  }, [userId, pushToCloud]);

  const deleteCloudBoard = useCallback(async () => {
    const ref = userId ? boardDoc(userId) : null;
    if (!ref) return false;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    pending.current = null;
    try {
      await deleteDoc(ref);
      setBoardState(EMPTY);
      return true;
    } catch {
      return false;
    }
  }, [userId]);

  return { board, setBoard, ready, status, deleteCloudBoard };
}
