import { Metadata } from 'next';
import { ProcessHero } from '@/components/sections/process/ProcessHero';
import { ProcessSteps } from '@/components/sections/process/ProcessSteps';
import { ProcessMethodology } from '@/components/sections/process/ProcessMethodology';
import { ProcessCTA } from '@/components/sections/process/ProcessCTA';

export const metadata: Metadata = {
  title: 'Our Process | Astralis Agency',
  description: 'Discover how Astralis Agency transforms your business with AI automation. Our proven 4-step process ensures successful implementation from discovery to ongoing optimization.',
  keywords: 'AI automation process, business transformation, digital strategy, implementation methodology, project management',
  openGraph: {
    title: 'Our Proven AI Automation Process | Astralis Agency',
    description: 'From strategy to success: Learn how we deliver AI automation solutions that drive real business results.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Astralis Agency Process',
      },
    ],
  },
};

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-background">
      <ProcessHero />
      <ProcessSteps />
      <ProcessMethodology />
      <ProcessCTA />
    </main>
  );
}
