import '../index.css';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const siteUrl = 'https://estospaces.com';
const title = 'Estospaces - Virtual Property Tours & Verified UK Listings';
const description = 'Search verified UK property listings, explore immersive virtual tours, and connect with trusted brokers through Estospaces.';
const ogImage = '/assets/estospaces-og.webp';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Estospaces',
  },
  description,
  applicationName: 'Estospaces',
  keywords: [
    'Estospaces',
    'virtual property tours',
    'verified property listings',
    'UK property search',
    'real estate platform',
    'rent property',
    'buy property',
  ],
  authors: [{ name: 'Estospaces' }],
  creator: 'Estospaces',
  publisher: 'Estospaces',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteUrl,
    siteName: 'Estospaces',
    title,
    description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Estospaces virtual property tours and verified UK listings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
