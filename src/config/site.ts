const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const siteUrl = 'https://estospaces.com';
const appBaseUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://app.estospaces.com',
);
const configuredMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
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
  features: {
    showProductScreenshots: true,
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
