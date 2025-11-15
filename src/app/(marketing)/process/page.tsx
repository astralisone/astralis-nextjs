import { Metadata } from 'next';
import { ProcessHero } from '@/components/sections/process/ProcessHero';
import { ProcessSteps } from '@/components/sections/process/ProcessSteps';
import { ProcessMethodology } from '@/components/sections/process/ProcessMethodology';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';
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
  const timelineSteps = [
    {
      title: 'Discovery & Strategy',
      description: 'We analyze your business needs and create a tailored AI automation strategy.',
      duration: '1-2 weeks',
      deliverables: ['Business analysis report', 'AI strategy roadmap', 'ROI projections']
    },
    {
      title: 'Design & Planning',
      description: 'Detailed planning of your AI solution architecture and implementation.',
      duration: '2-3 weeks',
      deliverables: ['Technical architecture', 'Integration plan', 'Project timeline']
    },
    {
      title: 'Development & Integration',
      description: 'Building and integrating your custom AI automation solution.',
      duration: '4-8 weeks',
      deliverables: ['Custom AI solution', 'System integrations', 'Testing reports']
    },
    {
      title: 'Launch & Optimization',
      description: 'Deploy your solution and continuously optimize for peak performance.',
      duration: 'Ongoing',
      deliverables: ['Production deployment', 'Performance metrics', '24/7 support']
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <ProcessHero />
      <ProcessSteps />
      <ProcessMethodology />
      <ProcessTimeline steps={timelineSteps} />
      <ProcessCTA />
    </main>
  );
}
