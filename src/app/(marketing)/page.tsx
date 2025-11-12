import type { Metadata } from 'next'
import { HomePageClient } from '@/components/pages/home-client'

export const metadata: Metadata = {
  title: 'Astralis - Creative Agency & Digital Products | AI Solutions & Custom Development',
  description: 'Transform your business with Astralis creative agency. AI solutions, custom software development, and digital products marketplace.',
  keywords: 'creative agency, AI solutions, custom software development, digital products, automation, web development, React, Next.js',
  openGraph: {
    title: 'Astralis - Creative Agency & Digital Products',
    description: 'Transform your business with Astralis creative agency. AI solutions, custom software development, and digital products marketplace.',
    type: 'website',
    url: 'https://astralis.one',
    images: [
      {
        url: '/images/astralis-agency-logo.png',
        width: 1200,
        height: 630,
        alt: 'Astralis Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astralis - Creative Agency & Digital Products',
    description: 'Transform your business with Astralis creative agency. AI solutions, custom software development, and digital products marketplace.',
    images: ['/images/astralis-agency-logo.png'],
  },
}

export default function HomePage() {
  return <HomePageClient />
}
