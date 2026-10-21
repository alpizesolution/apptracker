'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Board } from '@/lib/types';
import { sanitizeBoard } from '@/lib/sanitize';
import { loadCloudCopy, loadLocalBoard, saveCloudCopy, saveLocalBoard } from '@/lib/local-store';
import { getBrowserSupabase } from '@/lib/supabase/client';

export type SyncStatus = 'local' | 'loading' | 'saving' | 'saved' | 'error' | 'readonly';

const EMPTY: Board = { projects: [], notes: [] };
const SAVE_DELAY_MS = 800;

// Signed out: the board lives in this browser. Signed in: it lives in the
// `boards` table (one row per user, protected by row-level security) and saves
// a moment after each change. `onFirstSync` must be a stable function.
export function useBoard(userId: string | null, onFirstSync: (localCount: number) => boolean) {
  const [board, setBoardState] = useState<Board>(EMPTY);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SyncStatus>(userId ? 'loading' : 'local');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Board | null>(null);
  // Cloud writes stay off until the cloud board has loaded, so a failed load
  // can never overwrite the saved board with an empty one.
  const writable = useRef(false);

  const pushToCloud = useCallback(async (next: Board) => {
    const supabase = getBrowserSupabase();
    if (!supabase || !userId || !writable.current) return;
    setStatus('saving');
    const { error } = await supabase.from('boards').upsert({ user_id: userId, data: next, updated_at: new Date().toISOString() });
    if (pending.current === next) pending.current = null;
    setStatus(error ? 'error' : 'saved');
    if (error) console.error('Sync failed:', error.message);
    else saveCloudCopy(userId, next);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId) {
        setBoardState(loadLocalBoard());
        setReady(true);
        return;
      }
      const supabase = getBrowserSupabase();
      if (!supabase) return;
      const { data, error } = await supabase.from('boards').select('data').eq('user_id', userId).maybeSingle();
      if (cancelled) return;
      if (error) {
        // Offline or the database is unreachable: show the last synced copy, read-only.
        const copy = loadCloudCopy(userId);
        if (copy) setBoardState(copy);
        setStatus('readonly');
        setReady(true);
        return;
      }
      writable.current = true;
      let next = data ? sanitizeBoard(data.data) : EMPTY;
      // First sign-in on this browser: offer to bring the signed-out board along.
      if (!data) {
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
  }, [userId, pushToCloud, onFirstSync]);

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
    const supabase = getBrowserSupabase();
    if (!supabase || !userId) return false;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    pending.current = null;
    const { error } = await supabase.from('boards').delete().eq('user_id', userId);
    if (!error) setBoardState(EMPTY);
    return !error;
  }, [userId]);

  return { board, setBoard, ready, status, deleteCloudBoard };
}
