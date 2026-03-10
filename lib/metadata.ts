/**
 * Metadata configuration for SEO
 */

import { Metadata } from 'next';

export const siteConfig = {
  name: 'Philly Culture Academy',
  description: 'Learn authentic Philadelphia culinary traditions through structured online programs',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://phillyculture.com',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/phillyculture',
    instagram: 'https://instagram.com/phillyculture',
  },
};

export function createMetadata(options: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const title = options.title 
    ? `${options.title} | ${siteConfig.name}`
    : siteConfig.name;
  
  const description = options.description || siteConfig.description;
  const image = options.image || siteConfig.ogImage;
  const url = siteConfig.url;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@phillyculture',
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate Course structured data (Schema.org)
 */
export function generateCourseSchema(program: {
  title: string;
  description: string;
  basePrice: number;
  thumbnail?: string;
  slug: string;
  duration?: number; // in weeks
}) {
  const url = `${siteConfig.url}/programs/${program.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.title,
    description: program.description,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      sameAs: siteConfig.url,
    },
    offers: {
      '@type': 'Offer',
      price: program.basePrice,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    image: program.thumbnail || siteConfig.ogImage,
    url,
    ...(program.duration && {
      timeRequired: `P${program.duration}W`,
    }),
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.instagram,
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Philadelphia',
      addressRegion: 'PA',
      addressCountry: 'US',
    },
  };
}
