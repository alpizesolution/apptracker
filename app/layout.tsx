import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/bricolage-grotesque/800.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/500.css';
import '@fontsource/lexend/600.css';
import '@fontsource/lexend/700.css';
import '@fontsource/lexend/800.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALPIZE SOLUTION - App & Project Tracker',
  description: 'Track every app you are building, from first idea to live launch. Sign in with GitHub to sync your repos.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon-192.png' },
  appleWebApp: { capable: true, title: 'ALPIZE', statusBarStyle: 'black-translucent' }
};

export const viewport: Viewport = { themeColor: '#111111', width: 'device-width', initialScale: 1 };

// Apply the saved theme before the page paints. Cream (light) is the default.
const themeScript = `try{if(localStorage.getItem('alpize_solution_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
