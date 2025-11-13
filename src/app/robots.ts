import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout/',
          '/orders/',
          '/profile/',
          '/settings/',
          '/onboarding/',
        ],
      },
    ],
    sitemap: 'https://astralisone.com/sitemap.xml',
  };
}
