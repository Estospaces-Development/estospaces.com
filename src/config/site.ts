const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const siteUrl = 'https://estospaces.com';
const appBaseUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://app.estospaces.com',
);
const configuredMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const salesIqWidgetUrl =
  'https://salesiq.zoho.in/widget?wc=siq338477be5e895c804b660f4765d048440ae1b20b437769a0cdecedd3b5619524';
const contactEmail = 'contact@estospaces.com';
const analyticsMeasurementId = /^G-[A-Z0-9]+$/.test(configuredMeasurementId)
  ? configuredMeasurementId
  : '';

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
}

const legalEntities = {
  india: {
    name: 'Estospaces Solutions Private Limited',
    jurisdiction: 'India',
  },
  unitedKingdom: {
    name: 'Estospaces Solutions Limited',
    jurisdiction: 'United Kingdom',
  },
} as const;

const foundingTeam = [
  {
    name: 'Yashwanth Manuwada',
    role: 'Co-Founder',
  },
  {
    name: 'Siranjeevi Subramaniyan',
    role: 'Co-Founder',
  },
] as const;

/**
 * Canonical public facts used by the website.
 *
 * Owner decisions and unverified business details belong in
 * docs/launch-decisions.md, not in this public configuration.
 */
export const siteConfig = {
  name: 'EstoSpaces',
  legalOperator: legalEntities.india.name,
  legalEntities,
  foundingTeam,
  category: 'Property-technology software platform',
  status: 'Private beta',
  marketWording: 'Initial launch areas; availability varies by area',
  siteUrl,
  appBaseUrl,
  analyticsMeasurementId,
  salesIqWidgetUrl,
  contactEmail,
  supportEmail: contactEmail,
  paths: {
    home: '/',
    about: '/about',
    contact: '/contact',
    security: '/security',
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
    blog: '/blogs',
    login: `${appBaseUrl}/login/`,
    register: `${appBaseUrl}/register`,
    brokerRegister: `${appBaseUrl}/register`,
    search: `${appBaseUrl}/search`,
  },
  social: {
    x: 'https://x.com/ESTOSPACES',
    instagram: 'https://www.instagram.com/estospaces/',
    linkedin: 'https://www.linkedin.com/company/estospaces-solutions-private-limited',
  },
  videos: {
    overview: {
      id: 'iX_gHgIUHhs',
      title: 'EstoSpaces in 30 Seconds: Listings, Leads, Viewings and Fast Track in One App',
      thumbnail: '/assets/landing/video-overview-poster.webp',
      tag: 'Overview / 30 sec',
    },
    user: {
      id: 'xM140AfjOBA',
      title: 'How to Use Estospaces | Complete User Masterclass (Find a Home → Get Your Keys)',
      thumbnail: '/assets/landing/video-user-masterclass.webp',
      label: 'Property seeker',
      duration: '17 min',
      summary:
        'Follow one rental through the product: shortlist, Fast Track, documents, viewing, agreement.',
      chapters: [
        ['00:00', 'Welcome to your home journey'],
        ['01:06', 'Account, profile and getting around'],
        ['03:07', 'Find homes that fit'],
        ['04:41', 'Read a listing and save it'],
        ['06:15', 'Ask us to help'],
        ['07:56', 'Choose a home and start Fast Track'],
        ['09:49', 'Share your documents'],
        ['11:44', 'Book your viewing'],
        ['13:04', 'The decision, and how buying differs'],
        ['14:06', 'Agreement, keys and your home'],
        ['15:27', 'Messages, alerts and help'],
        ['16:52', 'Recap and your first step'],
      ],
    },
    manager: {
      id: 'hi-H7D164NA',
      title: 'Stop Losing Property Leads: The Complete Estospaces Manager Walkthrough',
      thumbnail: '/assets/landing/video-manager-walkthrough.webp',
      label: 'Broker or manager',
      duration: '35 min',
      summary:
        'Run the whole journey: profile, listings, live enquiries, Fast Track cases and daily routine.',
      chapters: [
        ['00:00', 'Welcome and course overview'],
        ['00:33', 'Your manager workspace'],
        ['02:55', 'Profile and verification'],
        ['04:59', 'Plans, billing and renewal'],
        ['07:17', 'Create a complete property'],
        ['11:36', 'Maintain and share listings'],
        ['14:13', 'Live response and lead intake'],
        ['16:32', 'Share a focused shortlist'],
        ['18:11', 'Operate the Fast Track workspace'],
        ['20:31', 'Documents and verification'],
        ['22:23', 'Viewings and schedule changes'],
        ['24:18', 'Decisions and applications'],
        ['26:16', 'Agreements and sale differences'],
        ['28:06', 'Handover and inventory closure'],
        ['29:41', 'Messages, alerts and support'],
        ['31:44', 'Analytics and daily routine'],
        ['33:15', 'Plan fit and a practical start'],
      ],
    },
  },
  features: {
    showTutorial: true,
    showTestimonials: false,
    showPublicPricing: false,
    showPublicSearch: false,
    analytics: Boolean(analyticsMeasurementId),
  },
  metadata: {
    title: 'EstoSpaces | Property enquiries with a clearer next step',
    description:
      'EstoSpaces is a private-beta property-technology platform for discovering properties when available, connecting with participating property professionals, and tracking the next step toward a viewing or application.',
    image: '/assets/estospaces-og.webp',
  },
} as const;

export const buildPageMetadata = ({ title, description, path }: PageMetadataInput) => ({
  title,
  description,
  alternates: {
    canonical: path,
  },
  openGraph: {
    type: 'website' as const,
    url: `${siteConfig.siteUrl}${path}`,
    siteName: siteConfig.name,
    title,
    description,
    images: [
      {
        url: siteConfig.metadata.image,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} property-technology platform`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title,
    description,
    images: [siteConfig.metadata.image],
  },
});
