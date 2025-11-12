import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Trophy,
  Users as UserGroupIcon,
  Clock as ClockIcon,
  Star,
  ArrowRight,
  Play,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  Filter as FunnelIcon,
  Zap as BoltIcon,
  Tag as TargetIcon
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { InteractiveDemo } from '@/components/services/InteractiveDemo';
import { PricingComparison } from '@/components/services/PricingComparison';
import { CaseStudyCard } from '@/components/services/CaseStudyCard';
import { ROICalculator } from '@/components/services/ROICalculator';
import { ServiceFeatureGrid } from '@/components/services/ServiceFeatureGrid';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';

export default function SalesPipelinePage() {
  const [activeDemo, setActiveDemo] = useState<'lead-scoring' | 'nurturing' | 'forecasting'>('lead-scoring');

  const demoScenarios = {
    'lead-scoring': {
      title: "AI Lead Scoring & Qualification",
      description: "Watch AI automatically score and prioritize your leads",
      steps: [
        { id: 1, text: "New lead enters system", automated: true },
        { id: 2, text: "AI analyzes behavior & data", automated: true },
        { id: 3, text: "Assigns priority score", automated: true },
        { id: 4, text: "Routes to best sales rep", automated: true }
      ]
    },
    'nurturing': {
      title: "Automated Lead Nurturing",
      description: "See personalized follow-ups sent automatically",
      steps: [
        { id: 1, text: "Identify nurturing opportunity", automated: true },
        { id: 2, text: "Generate personalized content", automated: true },
        { id: 3, text: "Send at optimal time", automated: true },
        { id: 4, text: "Track engagement & adjust", automated: true }
      ]
    },
    'forecasting': {
      title: "Predictive Sales Forecasting",
      description: "Advanced analytics predict deal outcomes",
      steps: [
        { id: 1, text: "Analyze historical data", automated: true },
        { id: 2, text: "Model deal probability", automated: true },
        { id: 3, text: "Generate forecast report", automated: true },
        { id: 4, text: "Alert on risk factors", automated: true }
      ]
    }
  };

  const pricingTiers = [
    {
      name: "Growth",
      price: "$497",
      period: "/month",
      description: "Perfect for small to medium sales teams",
      features: [
        "AI Lead Scoring",
        "Automated follow-ups",
        "Basic pipeline analytics",
        "CRM integration",
        "Email sequence automation",
        "Up to 5,000 leads/month"
      ],
      highlighted: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "$997",
      period: "/month",
      description: "Ideal for growing sales organizations",
      features: [
        "Everything in Growth",
        "Advanced lead nurturing",
        "Predictive forecasting",
        "Custom workflows",
        "A/B testing",
        "Up to 25,000 leads/month",
        "Sales coaching insights",
        "Priority support"
      ],
      highlighted: true,
      cta: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large sales organizations with complex needs",
      features: [
        "Everything in Professional",
        "Custom AI model training",
        "Advanced integrations",
        "Dedicated success manager",
        "Unlimited leads",
        "Custom reporting",
        "White-label options",
        "SLA guarantees"
      ],
      highlighted: false,
      cta: "Contact Sales"
    }
  ];

  const caseStudies = [
    {
      company: "CloudTech Solutions",
      industry: "SaaS",
      challenge: "Low lead conversion rates and inconsistent follow-up processes",
      solution: "Implemented AI lead scoring and automated nurturing sequences",
      results: [
        { metric: "Lead Conversion Rate", before: "2.3%", after: "8.7%", improvement: "+278%" },
        { metric: "Sales Cycle Length", before: "90 days", after: "42 days", improvement: "-53%" },
        { metric: "Revenue per Lead", before: "$147", after: "$412", improvement: "+180%" },
        { metric: "Sales Team Productivity", before: "65%", after: "89%", improvement: "+37%" }
      ],
      testimonial: "Our conversion rates nearly quadrupled, and our sales team can now focus on closing deals instead of chasing unqualified leads.",
      author: "Jennifer Walsh, VP of Sales"
    },
    {
      company: "Manufacturing Pro",
      industry: "Manufacturing",
      challenge: "Complex B2B sales cycle with multiple stakeholders and touchpoints",
      solution: "Multi-touch nurturing system with stakeholder mapping",
      results: [
        { metric: "Pipeline Value", before: "$2.1M", after: "$5.8M", improvement: "+176%" },
        { metric: "Deal Size", before: "$45K", after: "$78K", improvement: "+73%" },
        { metric: "Win Rate", before: "18%", after: "34%", improvement: "+89%" },
        { metric: "Sales Forecast Accuracy", before: "67%", after: "92%", improvement: "+37%" }
      ],
      testimonial: "The predictive insights help us focus on the deals that matter most. Our forecast accuracy has never been better.",
      author: "Robert Chen, Sales Director"
    }
  ];

  const features = [
    {
      icon: TargetIcon,
      title: "AI Lead Scoring",
      description: "Automatically prioritize leads based on conversion probability",
      benefits: ["Behavioral analysis", "Firmographic scoring", "Intent prediction"]
    },
    {
      icon: BoltIcon,
      title: "Automated Nurturing",
      description: "Personalized follow-up sequences that adapt to prospect behavior",
      benefits: ["Multi-channel outreach", "Dynamic content", "Optimal timing"]
    },
    {
      icon: BarChart,
      title: "Predictive Analytics",
      description: "Forecast deal outcomes and identify at-risk opportunities",
      benefits: ["Deal probability", "Revenue forecasting", "Risk alerts"]
    },
    {
      icon: FunnelIcon,
      title: "Pipeline Optimization",
      description: "Identify bottlenecks and optimize your sales process",
      benefits: ["Stage analysis", "Conversion tracking", "Process insights"]
    },
    {
      icon: UserGroupIcon,
      title: "Sales Coaching",
      description: "AI-powered insights to improve sales team performance",
      benefits: ["Performance metrics", "Coaching recommendations", "Best practice sharing"]
    },
    {
      icon: Trophy,
      title: "Revenue Intelligence",
      description: "Deep insights into what drives your sales success",
      benefits: ["Win/loss analysis", "Competitive insights", "Market trends"]
    }
  ];

  const processSteps = [
    {
      title: "Sales Process Audit",
      description: "Comprehensive analysis of your current sales process and data",
      duration: "1-2 weeks",
      deliverables: ["Process mapping", "Data quality assessment", "Opportunity identification"]
    },
    {
      title: "AI Model Setup",
      description: "Custom AI models trained on your historical sales data",
      duration: "2-3 weeks",
      deliverables: ["Lead scoring model", "Forecasting algorithms", "Custom workflows"]
    },
    {
      title: "CRM Integration",
      description: "Seamless integration with your existing sales tools and processes",
      duration: "1-2 weeks",
      deliverables: ["Technical integration", "Data synchronization", "Workflow automation"]
    },
    {
      title: "Team Training",
      description: "Comprehensive training for your sales team on the new system",
      duration: "1 week",
      deliverables: ["Team workshops", "User guides", "Best practices training"]
    },
    {
      title: "Launch & Optimization",
      description: "Go-live support and continuous optimization based on performance",
      duration: "Ongoing",
      deliverables: ["Launch support", "Performance monitoring", "Regular optimizations"]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      <SEOHead
        title="Sales Pipeline Optimization - AI-Powered Sales Automation | Astralis"
        description="Boost sales conversion by 278% with AI-powered pipeline optimization. Automated lead scoring, nurturing, and predictive forecasting."
        keywords="sales automation, pipeline optimization, lead scoring, sales forecasting, CRM automation, sales AI"
      />
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
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
                <Trophy className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-300">Sales Pipeline Optimization</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Supercharge Your Sales with{' '}
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  AI-Powered Automation
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Transform your sales process with intelligent lead scoring, automated nurturing, and 
                predictive forecasting. Increase conversion rates by 278% while reducing sales cycle 
                time and improving forecast accuracy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Watch Live Demo <Play className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                  Calculate ROI <BarChart className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { metric: "278%", label: "Higher Conversion" },
                  { metric: "53%", label: "Shorter Cycle" },
                  { metric: "92%", label: "Forecast Accuracy" },
                  { metric: "37%", label: "Team Productivity" }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{item.metric}</div>
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
              <h2 className="text-4xl font-bold mb-6">See How It Works</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience AI-powered sales automation across your entire pipeline
              </p>
            </div>
            
            <InteractiveDemo
              scenarios={demoScenarios}
              activeScenario={activeDemo}
              onScenarioChange={(scenario) => setActiveDemo(scenario as "lead-scoring" | "nurturing" | "forecasting")}
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Complete Sales Intelligence</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Every tool your sales team needs to close more deals faster
              </p>
            </div>
            
            <ServiceFeatureGrid features={features} />
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Proven Results</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Real companies achieving extraordinary sales growth
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
                <h2 className="text-4xl font-bold mb-6">Calculate Your Sales ROI</h2>
                <p className="text-xl text-gray-300">
                  See how much additional revenue you could generate
                </p>
              </div>
              
              <ROICalculator type="sales-pipeline" />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Plans That Scale With You</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From growing teams to enterprise organizations
              </p>
            </div>
            
            <PricingComparison tiers={pricingTiers} />
          </div>
        </section>

        {/* Implementation Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Implementation Roadmap</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From audit to optimization in 5-8 weeks
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
                Ready to Transform Your Sales Results?
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                Join sales teams already closing more deals with AI-powered pipeline optimization
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Start Free Consultation <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                  Schedule Demo <PhoneIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Free CRM integration</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}