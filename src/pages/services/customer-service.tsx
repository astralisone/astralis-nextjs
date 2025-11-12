import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Clock as ClockIcon,
  Users as UserGroupIcon,
  BarChart,
  Star,
  ArrowRight,
  Play,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  AlertTriangle as ExclamationTriangleIcon,
  LifeBuoy as LifebuoyIcon,
  Zap as BoltIcon
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { InteractiveDemo } from '@/components/services/InteractiveDemo';
import { PricingComparison } from '@/components/services/PricingComparison';
import { CaseStudyCard } from '@/components/services/CaseStudyCard';
import { ROICalculator } from '@/components/services/ROICalculator';
import { ServiceFeatureGrid } from '@/components/services/ServiceFeatureGrid';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';

export default function CustomerServicePage() {
  const [activeDemo, setActiveDemo] = useState<'chatbot' | 'ticketing' | 'analytics'>('chatbot');

  const demoScenarios = {
    chatbot: {
      title: "AI-Powered Chat Assistant",
      description: "Watch how our AI handles customer inquiries automatically",
      steps: [
        { id: 1, text: "Customer asks product question", automated: true },
        { id: 2, text: "AI analyzes query & context", automated: true },
        { id: 3, text: "Provides accurate response", automated: true },
        { id: 4, text: "Escalates if needed", automated: true }
      ]
    },
    ticketing: {
      title: "Smart Ticket Routing",
      description: "See how tickets are automatically categorized and prioritized",
      steps: [
        { id: 1, text: "Ticket received from customer", automated: true },
        { id: 2, text: "AI categorizes by urgency", automated: true },
        { id: 3, text: "Routes to best agent", automated: true },
        { id: 4, text: "Tracks resolution time", automated: true }
      ]
    },
    analytics: {
      title: "Real-time Analytics Dashboard",
      description: "Monitor customer satisfaction and agent performance",
      steps: [
        { id: 1, text: "Collect interaction data", automated: true },
        { id: 2, text: "Generate insights", automated: true },
        { id: 3, text: "Identify trends", automated: true },
        { id: 4, text: "Suggest improvements", automated: true }
      ]
    }
  };

  const pricingTiers = [
    {
      name: "Starter",
      price: "$299",
      period: "/month",
      description: "Perfect for small businesses getting started",
      features: [
        "AI Chat Assistant",
        "Basic ticket management",
        "Email integration",
        "24/7 chatbot availability",
        "Basic analytics",
        "5 agent seats included"
      ],
      highlighted: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "$699",
      period: "/month",
      description: "Ideal for growing companies with higher volume",
      features: [
        "Everything in Starter",
        "Advanced AI routing",
        "Multi-channel support",
        "Custom workflows",
        "Advanced analytics",
        "15 agent seats included",
        "API integrations",
        "Priority support"
      ],
      highlighted: true,
      cta: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with specific needs",
      features: [
        "Everything in Professional",
        "Custom AI training",
        "White-label solution",
        "Advanced security",
        "Dedicated success manager",
        "Unlimited agent seats",
        "Custom integrations",
        "SLA guarantees"
      ],
      highlighted: false,
      cta: "Contact Sales"
    }
  ];

  const caseStudies = [
    {
      company: "TechFlow Solutions",
      industry: "Software",
      challenge: "High support ticket volume overwhelming their 12-person team",
      solution: "Implemented AI chatbot and smart routing system",
      results: [
        { metric: "Response Time", before: "4 hours", after: "12 minutes", improvement: "+95%" },
        { metric: "Resolution Rate", before: "76%", after: "94%", improvement: "+18%" },
        { metric: "Customer Satisfaction", before: "3.2/5", after: "4.7/5", improvement: "+47%" },
        { metric: "Cost per Ticket", before: "$25", after: "$8", improvement: "-68%" }
      ],
      testimonial: "Our customer satisfaction scores increased dramatically while reducing our support costs by over 60%.",
      author: "Sarah Chen, Customer Success Director"
    },
    {
      company: "RetailMax",
      industry: "E-commerce",
      challenge: "Managing 500+ daily customer inquiries across multiple channels",
      solution: "Multi-channel AI assistant with inventory integration",
      results: [
        { metric: "Daily Inquiries Handled", before: "500", after: "1,200", improvement: "+140%" },
        { metric: "Agent Productivity", before: "45 tickets/day", after: "78 tickets/day", improvement: "+73%" },
        { metric: "First Contact Resolution", before: "58%", after: "89%", improvement: "+31%" },
        { metric: "Support Team Size", before: "25 agents", after: "15 agents", improvement: "-40%" }
      ],
      testimonial: "We're handling twice as many customers with fewer agents, and our team satisfaction has never been higher.",
      author: "Michael Rodriguez, Operations Manager"
    }
  ];

  const features = [
    {
      icon: BoltIcon,
      title: "Instant Response",
      description: "AI responds to customer inquiries in under 2 seconds",
      benefits: ["24/7 availability", "Consistent responses", "No wait times"]
    },
    {
      icon: MessageCircle,
      title: "Multi-Channel Support",
      description: "Unified platform for chat, email, phone, and social media",
      benefits: ["Single dashboard", "Conversation history", "Channel switching"]
    },
    {
      icon: UserGroupIcon,
      title: "Smart Agent Routing",
      description: "Automatically route complex queries to the right specialist",
      benefits: ["Skill-based routing", "Load balancing", "Priority handling"]
    },
    {
      icon: BarChart,
      title: "Advanced Analytics",
      description: "Real-time insights into customer satisfaction and trends",
      benefits: ["Performance metrics", "Trend analysis", "Predictive insights"]
    },
    {
      icon: LifebuoyIcon,
      title: "Seamless Escalation",
      description: "Smooth handoff from AI to human agents when needed",
      benefits: ["Context preservation", "Agent notifications", "Escalation tracking"]
    },
    {
      icon: CheckCircleIcon,
      title: "Quality Assurance",
      description: "Automated quality checks and response validation",
      benefits: ["Response accuracy", "Compliance monitoring", "Continuous improvement"]
    }
  ];

  const processSteps = [
    {
      title: "Discovery & Assessment",
      description: "We analyze your current support processes and identify automation opportunities",
      duration: "1-2 weeks",
      deliverables: ["Current state analysis", "Automation roadmap", "ROI projections"]
    },
    {
      title: "Custom AI Training",
      description: "Train AI models on your specific products, policies, and customer data",
      duration: "2-3 weeks",
      deliverables: ["Custom AI model", "Knowledge base setup", "Response templates"]
    },
    {
      title: "System Integration",
      description: "Integrate with your existing CRM, helpdesk, and communication tools",
      duration: "1-2 weeks",
      deliverables: ["Technical integration", "Data synchronization", "Workflow automation"]
    },
    {
      title: "Testing & Optimization",
      description: "Comprehensive testing and fine-tuning based on real customer interactions",
      duration: "1 week",
      deliverables: ["System validation", "Performance optimization", "Agent training"]
    },
    {
      title: "Launch & Support",
      description: "Go-live support and ongoing optimization for continuous improvement",
      duration: "Ongoing",
      deliverables: ["Launch support", "Performance monitoring", "Regular updates"]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      <SEOHead
        title="Customer Service Automation - AI-Powered Support Solutions | Astralis"
        description="Transform your customer service with AI automation. Reduce response times by 95%, increase satisfaction, and scale support without adding staff."
        keywords="customer service automation, AI chatbot, support automation, customer satisfaction, help desk AI"
      />
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
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
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Customer Service Automation</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Transform Customer Service with{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Automation
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Reduce response times by 95%, increase customer satisfaction, and scale your support 
                operations without adding staff. Our AI-powered system handles inquiries 24/7 while 
                your human agents focus on complex issues.
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
                  { metric: "95%", label: "Faster Response" },
                  { metric: "89%", label: "Resolution Rate" },
                  { metric: "24/7", label: "Availability" },
                  { metric: "68%", label: "Cost Reduction" }
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
              <h2 className="text-4xl font-bold mb-6">See It In Action</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience how our AI transforms customer interactions across different scenarios
              </p>
            </div>
            
            <InteractiveDemo
              scenarios={demoScenarios}
              activeScenario={activeDemo}
              onScenarioChange={(scenario) => setActiveDemo(scenario as "chatbot" | "ticketing" | "analytics")}
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Powerful Features</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to deliver exceptional customer service at scale
              </p>
            </div>
            
            <ServiceFeatureGrid features={features} />
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Real Results from Real Customers</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                See how businesses like yours achieved dramatic improvements
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
                <h2 className="text-4xl font-bold mb-6">Calculate Your ROI</h2>
                <p className="text-xl text-gray-300">
                  See how much you could save with customer service automation
                </p>
              </div>
              
              <ROICalculator type="customer-service" />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose the plan that fits your business size and support volume
              </p>
            </div>
            
            <PricingComparison tiers={pricingTiers} />
          </div>
        </section>

        {/* Implementation Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Implementation Process</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From setup to success in just 5-8 weeks
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
                Ready to Transform Your Customer Service?
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                Join hundreds of companies already providing exceptional support with AI automation
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
                  <span>Free setup & training</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}