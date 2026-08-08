import type { Metadata } from 'next';
import { Fredericka_the_Great, Geist, Geist_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
// oxlint-disable-next-line import/no-unassigned-import -- Next.js loads global styles from the root layout.
import './global.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

const fredericka = Fredericka_the_Great({
  subsets: ['latin'],
  weight: '400',
  adjustFontFallback: false,
  variable: '--font-blueprint-display',
});

function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (explicitUrl) return explicitUrl.startsWith('http') ? explicitUrl : `https://${explicitUrl}`;
  if (vercelUrl) return `https://${vercelUrl}`;
  return 'http://localhost:3000';
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Boring Table — Headless tables, assembled your way',
    template: '%s — Boring Table',
  },
  description:
    'A typed, framework-agnostic table engine with composable plugins and a React binding. Keep full control of every rendered element.',
  applicationName: 'Boring Table',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Boring Table',
    title: 'Boring Table — Headless tables, assembled your way',
    description:
      'Turn typed data, column functions, and plugins into a render-ready row model without giving up your markup.',
    images: [
      {
        url: '/logo.svg',
        width: 462,
        height: 459,
        alt: 'Boring Table mascot',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} ${fredericka.variable} flex min-h-screen flex-col`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
