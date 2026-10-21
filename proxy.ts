import { NextResponse, type NextRequest } from 'next/server';
import { firebaseConfig } from '@/lib/firebase/config';

// Runs before every page: sets a per-request Content Security Policy with a nonce.
// The Firebase hosts are what GitHub sign-in (popup) and Firestore sync talk to.
function contentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV === 'development';
  const authDomain = firebaseConfig.authDomain ? `https://${firebaseConfig.authDomain}` : '';
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://avatars.githubusercontent.com;
    font-src 'self';
    connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://apis.google.com;
    frame-src ${authDomain || "'none'"};
    worker-src 'self';
    manifest-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `.replace(/\s{2,}/g, ' ').trim();
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|icons/|sw.js|manifest.webmanifest|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
};
