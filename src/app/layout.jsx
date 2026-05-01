import '../index.css';

const siteUrl = 'https://estospaces.com';
const title = 'Estospaces - Discover Your Dream Home';
const description = 'Explore verified property listings with immersive virtual tours, trusted brokers, and a smoother property search experience across the UK.';

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
        url: '/assets/modern-apartment.png',
        width: 1200,
        height: 630,
        alt: 'Modern apartment preview on Estospaces',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/assets/modern-apartment.png'],
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
