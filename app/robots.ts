import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.donggori.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/my-page', '/sign-in', '/sign-up', '/reset-password'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
