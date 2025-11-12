import type { Metadata } from 'next'
import { ContactPageClient } from '@/components/pages/contact-client'

export const metadata: Metadata = {
  title: 'Contact Us | Astralis Agency - Get in Touch',
  description: 'Have a project in mind? Contact Astralis Agency for AI solutions, custom software development, and digital transformation services.',
  keywords: 'contact, get in touch, project inquiry, consultation, Astralis Agency',
  openGraph: {
    title: 'Contact Astralis Agency',
    description: 'Get in touch with our team for AI solutions and custom development services.',
    type: 'website',
    url: 'https://astralis.one/contact',
    images: [
      {
        url: '/images/astralis-agency-logo.png',
        width: 1200,
        height: 630,
        alt: 'Astralis Agency',
      },
    ],
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
