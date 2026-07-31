import '../index.css';
import '@fontsource-variable/archivo';
import '@fontsource/ibm-plex-mono/400.css';

import ConsentManager from '../components/site/ConsentManager';
import { siteConfig } from '../config/site';

const siteUrl = siteConfig.siteUrl;
const title = siteConfig.metadata.title;
const description = siteConfig.metadata.description;
const ogImage = siteConfig.metadata.image;
const gaMeasurementId = siteConfig.analyticsMeasurementId;
const salesIqWidgetUrl = siteConfig.salesIqWidgetUrl;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | EstoSpaces',
  },
  description,
  applicationName: siteConfig.name,
  keywords: [
    'EstoSpaces',
    'property technology',
    'property search',
    'property enquiries',
    'broker response tracking',
    'Fast Track property workflow',
  ],
  authors: [{ name: siteConfig.legalOperator }],
  creator: siteConfig.legalOperator,
  publisher: siteConfig.legalOperator,
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
    url: siteUrl,
    siteName: siteConfig.name,
    title,
    description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} property-technology platform`,
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a
          className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-lg bg-gray-950 px-4 py-3 font-bold text-white focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-orange-300"
          href="#main-content"
        >
          Skip to main content
        </a>
        {children}
        <script defer src="/navigation.js" />
        <ConsentManager measurementId={gaMeasurementId} salesIqWidgetUrl={salesIqWidgetUrl} />
      </body>
    </html>
  );
}
