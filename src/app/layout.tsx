import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Godson Groove – Oiling imaginations through storytelling',
    template: '%s | Godson Groove',
  },
  description:
    'A storytelling universe platform where children read, learn, and grow through immersive story worlds.',
  keywords: ['children books', 'storytelling', 'kids reading', 'digital books', 'Nigeria'],
  authors: [{ name: 'Godson Groove' }],
  creator: 'Godson Groove',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Godson Groove',
    title: 'Godson Groove – Oiling imaginations through storytelling',
    description: 'A storytelling universe platform where children read, learn, and grow.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Godson Groove',
    description: 'Oiling imaginations through storytelling',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/faviconyellow.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#F5C842',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
