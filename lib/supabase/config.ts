// Sign-in and sync turn on only when the Supabase keys are set (see README).
// Without them the tracker runs as before, saved in the browser.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || '';

export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
