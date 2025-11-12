import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pencil,
  Sparkles,
  FileText as DocumentTextIcon,
  Clock as ClockIcon,
  Star,
  ArrowRight,
  Play,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  Zap as BoltIcon,
  Eye as EyeIcon,
  Rocket as RocketLaunchIcon
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { InteractiveDemo } from '@/components/services/InteractiveDemo';
import { PricingComparison } from '@/components/services/PricingComparison';
import { CaseStudyCard } from '@/components/services/CaseStudyCard';
import { ROICalculator } from '@/components/services/ROICalculator';
import { ServiceFeatureGrid } from '@/components/services/ServiceFeatureGrid';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';

export default function ContentGenerationPage() {
  const [activeDemo, setActiveDemo] = useState<'blog-writing' | 'social-media' | 'email-campaigns'>('blog-writing');

  const demoScenarios = {
    'blog-writing': {
      title: "AI Blog Post Generation",
      description: "Watch AI create SEO-optimized blog posts from just a topic",
      steps: [
        { id: 1, text: "Input topic & keywords", automated: false },
        { id: 2, text: "AI researches & outlines", automated: true },
        { id: 3, text: "Generates optimized content", automated: true },
        { id: 4, text: "Human review & publish", automated: false }
      ]
    },
    'social-media': {
      title: "Multi-Platform Social Content",
      description: "Generate platform-specific content from a single brief",
      steps: [
        { id: 1, text: "Define campaign brief", automated: false },
        { id: 2, text: "AI adapts for each platform", automated: true },
        { id: 3, text: "Optimizes for engagement", automated: true },
        { id: 4, text: "Schedules across platforms", automated: true }
      ]
    },
    'email-campaigns': {
      title: "Personalized Email Sequences",
      description: "Create targeted email campaigns with dynamic personalization",
      steps: [
        { id: 1, text: "Segment audience data", automated: true },
        { id: 2, text: "Generate personalized copy", automated: true },
        { id: 3, text: "A/B test variations", automated: true },
        { id: 4, text: "Optimize based on results", automated: true }
      ]
    }
  };

  const pricingTiers = [
    {
      name: "Creator",
      price: "$197",
      period: "/month",
      description: "Perfect for solopreneurs and small businesses",
      features: [
        "AI blog post generation",
        "Social media content",
        "Basic email templates",
        "SEO optimization",
        "50 articles per month",
        "Basic brand voice training"
      ],
      highlighted: false,
      cta: "Start Free Trial"
    },
    {
      name: "Growth",
      price: "$497",
      period: "/month",
      description: "Ideal for growing marketing teams",
      features: [
        "Everything in Creator",
        "Advanced email sequences",
        "Multi-platform campaigns",
        "Custom brand voice",
        "200 articles per month",
        "Content calendar planning",
        "Performance analytics",
        "Priority support"
      ],
      highlighted: true,
      cta: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with high-volume needs",
      features: [
        "Everything in Growth",
        "Custom AI model training",
        "Unlimited content generation",
        "Advanced integrations",
        "Dedicated content strategist",
        "White-label capabilities",
        "Custom workflows",
        "SLA guarantees"
      ],
      highlighted: false,
      cta: "Contact Sales"
    }
  ];

  const caseStudies = [
    {
      company: "Digital Marketing Hub",
      industry: "Marketing Agency",
      challenge: "Struggled to produce enough quality content for 50+ client accounts",
      solution: "Implemented AI content generation system with brand voice training",
      results: [
        { metric: "Content Output", before: "120 posts/month", after: "480 posts/month", improvement: "+300%" },
        { metric: "Content Creation Time", before: "4 hours", after: "45 minutes", improvement: "-81%" },
        { metric: "Client Satisfaction", before: "3.8/5", after: "4.6/5", improvement: "+21%" },
        { metric: "Team Capacity", before: "50 clients", after: "150 clients", improvement: "+200%" }
      ],
      testimonial: "We tripled our client capacity without hiring additional writers. The AI maintains our brand voice perfectly.",
      author: "Amanda Foster, Creative Director"
    },
    {
      company: "TechStart Solutions",
      industry: "SaaS",
      challenge: "Needed consistent, technical content for multiple product lines",
      solution: "Custom AI training for technical writing with automated SEO optimization",
      results: [
        { metric: "Organic Traffic", before: "45K visits", after: "180K visits", improvement: "+300%" },
        { metric: "Lead Generation", before: "230 leads/month", after: "820 leads/month", improvement: "+257%" },
        { metric: "Content Costs", before: "$15K/month", after: "$4.5K/month", improvement: "-70%" },
        { metric: "Publishing Frequency", before: "8 posts/month", after: "32 posts/month", improvement: "+300%" }
      ],
      testimonial: "Our content marketing ROI improved dramatically. We're publishing 4x more content at a fraction of the cost.",
      author: "David Park, Head of Marketing"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Create high-quality content across all formats and channels",
      benefits: ["Blog posts & articles", "Social media content", "Email campaigns"]
    },
    {
      icon: EyeIcon,
      title: "SEO Optimization",
      description: "Built-in SEO best practices for maximum search visibility",
      benefits: ["Keyword optimization", "Meta descriptions", "Schema markup"]
    },
    {
      icon: BoltIcon,
      title: "Brand Voice Training",
      description: "Train AI to match your unique brand voice and style",
      benefits: ["Tone consistency", "Style adaptation", "Voice evolution"]
    },
    {
      icon: DocumentTextIcon,
      title: "Multi-Format Creation",
      description: "Generate content for every marketing channel and format",
      benefits: ["Long-form articles", "Social posts", "Email sequences"]
    },
    {
      icon: RocketLaunchIcon,
      title: "Performance Analytics",
      description: "Track content performance and optimize for better results",
      benefits: ["Engagement metrics", "Conversion tracking", "A/B testing"]
    },
    {
      icon: ClockIcon,
      title: "Content Calendar",
      description: "Automated planning and scheduling across all platforms",
      benefits: ["Strategic planning", "Auto-scheduling", "Campaign coordination"]
    }
  ];

  const processSteps = [
    {
      title: "Brand Voice Analysis",
      description: "Analyze your existing content to understand your unique brand voice",
      duration: "1 week",
      deliverables: ["Brand voice profile", "Style guidelines", "Tone documentation"]
    },
    {
      title: "AI Model Training",
      description: "Train custom AI models on your brand voice and content preferences",
      duration: "2 weeks",
      deliverables: ["Custom AI model", "Content templates", "Quality benchmarks"]
    },
    {
      title: "System Integration",
      description: "Integrate with your existing content management and publishing tools",
      duration: "1 week",
      deliverables: ["Platform integrations", "Workflow automation", "Publishing setup"]
    },
    {
      title: "Team Training",
      description: "Train your team on the new content generation workflow",
      duration: "1 week",
      deliverables: ["Team workshops", "Best practices guide", "Quality control processes"]
    },
    {
      title: "Launch & Optimization",
      description: "Launch the system and continuously optimize based on performance",
      duration: "Ongoing",
      deliverables: ["System monitoring", "Performance optimization", "Regular updates"]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      <SEOHead
        title="Content Generation System - AI-Powered Content Creation | Astralis"
        description="Scale content production by 300% with AI. Generate SEO-optimized blog posts, social media content, and email campaigns that match your brand voice."
        keywords="AI content generation, automated content creation, content marketing automation, AI writing, blog post generation"
      />
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8">
                <Pencil className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Content Generation System</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Scale Content Production with{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI-Powered Creation
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Generate high-quality, SEO-optimized content at scale while maintaining your unique 
                brand voice. Create blog posts, social media content, and email campaigns 300% faster 
                with AI that learns your style.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Watch Live Demo <Play className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                  See Content Samples <EyeIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { metric: "300%", label: "More Content" },
                  { metric: "81%", label: "Time Saved" },
                  { metric: "4.6/5", label: "Quality Score" },
                  { metric: "70%", label: "Cost Reduction" }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{item.metric}</div>
                    <div className="text-sm text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">See AI Content Creation</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience how AI creates engaging content across different formats
              </p>
            </div>
            
            <InteractiveDemo
              scenarios={demoScenarios}
              activeScenario={activeDemo}
              onScenarioChange={(scenario) => setActiveDemo(scenario as "blog-writing" | "social-media" | "email-campaigns")}
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Complete Content Solution</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to create, optimize, and distribute content at scale
              </p>
            </div>
            
            <ServiceFeatureGrid features={features} />
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Content Success Stories</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                See how businesses transformed their content marketing
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {caseStudies.map((study, index) => (
                <CaseStudyCard key={index} caseStudy={study} />
              ))}
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="glass-elevated rounded-3xl p-12 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-6">Calculate Content ROI</h2>
                <p className="text-xl text-gray-300">
                  See how much you could save on content creation costs
                </p>
              </div>
              
              <ROICalculator type="content-generation" />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Flexible Content Plans</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From individual creators to enterprise content teams
              </p>
            </div>
            
            <PricingComparison tiers={pricingTiers} />
          </div>
        </section>

        {/* Implementation Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Setup Process</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From brand analysis to content creation in just 5 weeks
              </p>
            </div>
            
            <ProcessTimeline steps={processSteps} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="glass-elevated rounded-3xl p-12 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Scale Your Content?
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                Join content teams already creating more engaging content with AI
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                  Schedule Demo <PhoneIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Custom brand voice training</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}