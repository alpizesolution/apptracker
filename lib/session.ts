import 'server-only';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { firebaseConfig } from './firebase/config';

// After a GitHub sign-in, the server keeps who signed in and their GitHub token
// in one HttpOnly cookie, encrypted with TOKEN_SECRET. Page scripts can never
// read it, and the token is only ever used by /api/github/repos.
export const SESSION_COOKIE = 'alpize_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export interface Session {
  uid: string;
  githubToken: string;
  login: string;
  avatarUrl: string;
}

async function key(): Promise<CryptoKey> {
  const secret = process.env.TOKEN_SECRET || '';
  if (secret.length < 32) throw new Error('TOKEN_SECRET must be at least 32 characters');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url');

export async function sealSession(session: Session): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), new TextEncoder().encode(JSON.stringify(session)));
  return `${b64(iv)}.${b64(new Uint8Array(sealed))}`;
}

export async function openSession(value: string | undefined): Promise<Session | null> {
  if (!value) return null;
  const [iv, data] = value.split('.');
  if (!iv || !data) return null;
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(iv, 'base64url') }, await key(), Buffer.from(data, 'base64url'));
    const s = JSON.parse(new TextDecoder().decode(plain));
    if (typeof s.uid !== 'string' || typeof s.githubToken !== 'string') return null;
    return { uid: s.uid, githubToken: s.githubToken, login: String(s.login || ''), avatarUrl: String(s.avatarUrl || '') };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE
};

// Firebase ID tokens are signed by Google; check them against Google's public keys.
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

export interface VerifiedUser {
  uid: string;
  githubId: string | null;
}

export async function verifyIdToken(idToken: string): Promise<VerifiedUser | null> {
  const projectId = firebaseConfig.projectId;
  if (!projectId) return null;
  try {
    const { payload } = await jwtVerify(idToken, googleKeys, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ['RS256']
    });
    if (typeof payload.sub !== 'string' || !payload.sub) return null;
    const identities = (payload.firebase as { identities?: Record<string, unknown[]> } | undefined)?.identities;
    const github = identities?.['github.com']?.[0];
    return { uid: payload.sub, githubId: github === undefined ? null : String(github) };
  } catch {
    return null;
  }
}
