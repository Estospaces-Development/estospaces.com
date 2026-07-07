import '../index.css';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import Script from 'next/script';

const siteUrl = 'https://estospaces.com';
const title = 'Estospaces - Verified Property Search for India and England';
const description = 'Search verified property listings across India and England, compare homes with confidence, and connect with trusted property professionals through Estospaces.';
const ogImage = '/assets/estospaces-og.webp';
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
    'India property search',
    'England property search',
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
    alt: 'Estospaces verified property search for India and England',
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
