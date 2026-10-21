import 'server-only';

// The GitHub token is kept in an HttpOnly cookie, encrypted with TOKEN_SECRET,
// so page scripts can never read it and a leaked cookie value is useless alone.
export const GITHUB_TOKEN_COOKIE = 'gh_token';
export const GITHUB_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

async function key(): Promise<CryptoKey> {
  const secret = process.env.TOKEN_SECRET || '';
  if (secret.length < 32) throw new Error('TOKEN_SECRET must be at least 32 characters');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url');

export async function sealToken(token: string, userId: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // The user id is bound in as additional data, so the cookie only opens for the same account.
  const sealed = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(userId) },
    await key(),
    new TextEncoder().encode(token)
  );
  return `${b64(iv)}.${b64(new Uint8Array(sealed))}`;
}

export async function openToken(value: string | undefined, userId: string): Promise<string | null> {
  if (!value) return null;
  const [iv, data] = value.split('.');
  if (!iv || !data) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Buffer.from(iv, 'base64url'), additionalData: new TextEncoder().encode(userId) },
      await key(),
      Buffer.from(data, 'base64url')
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

export const tokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: GITHUB_TOKEN_MAX_AGE
};
