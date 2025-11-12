import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Lightbulb as LightBulbIcon,
  Cpu as CpuChipIcon,
  Clock as ClockIcon,
  Star,
  ArrowRight,
  Play,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  Zap as BoltIcon,
  Eye as EyeIcon,
  Search as MagnifyingGlassIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { InteractiveDemo } from '@/components/services/InteractiveDemo';
import { PricingComparison } from '@/components/services/PricingComparison';
import { CaseStudyCard } from '@/components/services/CaseStudyCard';
import { ROICalculator } from '@/components/services/ROICalculator';
import { ServiceFeatureGrid } from '@/components/services/ServiceFeatureGrid';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';

export default function DataAnalyticsPage() {
  const [activeDemo, setActiveDemo] = useState<'real-time' | 'predictive' | 'automated-insights'>('real-time');

  const demoScenarios = {
    'real-time': {
      title: "Real-Time Dashboard",
      description: "Live data visualization with automated alerts and insights",
      steps: [
        { id: 1, text: "Collect data from sources", automated: true },
        { id: 2, text: "Process & analyze in real-time", automated: true },
        { id: 3, text: "Generate visual insights", automated: true },
        { id: 4, text: "Alert on anomalies", automated: true }
      ]
    },
    'predictive': {
      title: "Predictive Analytics",
      description: "AI forecasting and trend prediction for strategic decisions",
      steps: [
        { id: 1, text: "Analyze historical patterns", automated: true },
        { id: 2, text: "Build prediction models", automated: true },
        { id: 3, text: "Generate forecasts", automated: true },
        { id: 4, text: "Provide recommendations", automated: true }
      ]
    },
    'automated-insights': {
      title: "Automated Business Intelligence",
      description: "AI discovers insights and generates executive summaries",
      steps: [
        { id: 1, text: "Scan all data sources", automated: true },
        { id: 2, text: "Identify patterns & trends", automated: true },
        { id: 3, text: "Generate insights report", automated: true },
        { id: 4, text: "Send to stakeholders", automated: true }
      ]
    }
  };

  const pricingTiers = [
    {
      name: "Analytics Starter",
      price: "$397",
      period: "/month",
      description: "Essential analytics for small to medium businesses",
      features: [
        "Real-time dashboard",
        "Basic predictive models",
        "Automated reporting",
        "5 data source integrations",
        "Mobile app access",
        "Email alerts"
      ],
      highlighted: false,
      cta: "Start Free Trial"
    },
    {
      name: "Analytics Pro",
      price: "$897",
      period: "/month",
      description: "Advanced analytics for data-driven organizations",
      features: [
        "Everything in Starter",
        "Advanced ML models",
        "Custom dashboards",
        "Unlimited data sources",
        "API access",
        "Advanced forecasting",
        "Custom alerts",
        "Priority support"
      ],
      highlighted: true,
      cta: "Most Popular"
    },
    {
      name: "Enterprise Analytics",
      price: "Custom",
      period: "",
      description: "Complete analytics platform for large enterprises",
      features: [
        "Everything in Pro",
        "Custom AI model training",
        "White-label dashboards",
        "Advanced security",
        "Dedicated data scientist",
        "Custom integrations",
        "On-premise deployment",
        "SLA guarantees"
      ],
      highlighted: false,
      cta: "Contact Sales"
    }
  ];

  const caseStudies = [
    {
      company: "RetailChain Plus",
      industry: "Retail",
      challenge: "Difficulty forecasting inventory needs across 200+ stores",
      solution: "Implemented predictive analytics for demand forecasting and inventory optimization",
      results: [
        { metric: "Inventory Accuracy", before: "67%", after: "94%", improvement: "+40%" },
        { metric: "Stock-out Reduction", before: "15%", after: "3%", improvement: "-80%" },
        { metric: "Working Capital", before: "$12M", after: "$8.2M", improvement: "-32%" },
        { metric: "Forecast Accuracy", before: "72%", after: "91%", improvement: "+26%" }
      ],
      testimonial: "Our inventory management transformed completely. We reduced stock-outs by 80% while freeing up millions in working capital.",
      author: "Lisa Chen, VP Operations"
    },
    {
      company: "FinanceFirst",
      industry: "Financial Services",
      challenge: "Manual reporting taking 40+ hours weekly across multiple systems",
      solution: "Automated analytics platform with real-time dashboards and AI insights",
      results: [
        { metric: "Reporting Time", before: "40 hours/week", after: "2 hours/week", improvement: "-95%" },
        { metric: "Data Accuracy", before: "89%", after: "99%", improvement: "+11%" },
        { metric: "Decision Speed", before: "5 days", after: "Same day", improvement: "+400%" },
        { metric: "Compliance Score", before: "78%", after: "96%", improvement: "+23%" }
      ],
      testimonial: "We went from spending days on reports to having insights at our fingertips. Decision-making speed increased dramatically.",
      author: "Marcus Johnson, Chief Data Officer"
    }
  ];

  const features = [
    {
      icon: BarChart,
      title: "Real-Time Dashboards",
      description: "Live data visualization with customizable KPI tracking",
      benefits: ["Interactive charts", "Custom metrics", "Mobile responsive"]
    },
    {
      icon: CpuChipIcon,
      title: "AI-Powered Analytics",
      description: "Machine learning models for predictive insights and forecasting",
      benefits: ["Predictive models", "Anomaly detection", "Trend analysis"]
    },
    {
      icon: LightBulbIcon,
      title: "Automated Insights",
      description: "AI discovers patterns and generates actionable business insights",
      benefits: ["Pattern recognition", "Insight generation", "Executive summaries"]
    },
    {
      icon: BoltIcon,
      title: "Smart Alerts",
      description: "Intelligent notifications for critical business events",
      benefits: ["Threshold monitoring", "Predictive alerts", "Multi-channel notifications"]
    },
    {
      icon: MagnifyingGlassIcon,
      title: "Data Discovery",
      description: "Automated data exploration to find hidden opportunities",
      benefits: ["Correlation analysis", "Opportunity identification", "Risk assessment"]
    },
    {
      icon: TrendingUpIcon,
      title: "Performance Optimization",
      description: "Continuous monitoring and optimization recommendations",
      benefits: ["Performance tracking", "Optimization suggestions", "ROI analysis"]
    }
  ];

  const processSteps = [
    {
      title: "Data Assessment",
      description: "Comprehensive audit of your current data landscape and infrastructure",
      duration: "1-2 weeks",
      deliverables: ["Data inventory", "Quality assessment", "Architecture recommendations"]
    },
    {
      title: "Platform Setup",
      description: "Configure analytics platform and integrate with your data sources",
      duration: "2-3 weeks",
      deliverables: ["Platform configuration", "Data pipeline setup", "Initial dashboards"]
    },
    {
      title: "AI Model Training",
      description: "Train custom machine learning models on your specific business data",
      duration: "2-3 weeks",
      deliverables: ["Predictive models", "Insight algorithms", "Alert configurations"]
    },
    {
      title: "Dashboard Development",
      description: "Create custom dashboards and reports for your specific needs",
      duration: "1-2 weeks",
      deliverables: ["Custom dashboards", "Report templates", "Mobile access"]
    },
    {
      title: "Launch & Optimization",
      description: "Go-live support and continuous optimization of analytics platform",
      duration: "Ongoing",
      deliverables: ["Launch support", "Performance monitoring", "Regular optimizations"]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      <SEOHead
        title="Data Analytics Dashboard - AI-Powered Business Intelligence | Astralis"
        description="Transform raw data into actionable insights with AI-powered analytics. Real-time dashboards, predictive forecasting, and automated business intelligence."
        keywords="data analytics, business intelligence, predictive analytics, real-time dashboards, AI insights, data visualization"
      />
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
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
                <BarChart className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Data Analytics Dashboard</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Turn Data Into Decisions with{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AI-Powered Analytics
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Transform your business data into actionable insights with real-time dashboards, 
                predictive analytics, and AI-powered business intelligence. Make data-driven 
                decisions faster than ever before.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  View Live Dashboard <Play className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                  Calculate ROI <BarChart className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { metric: "95%", label: "Faster Reporting" },
                  { metric: "91%", label: "Forecast Accuracy" },
                  { metric: "24/7", label: "Real-time Data" },
                  { metric: "80%", label: "Better Decisions" }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{item.metric}</div>
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
              <h2 className="text-4xl font-bold mb-6">Experience Intelligent Analytics</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                See how AI transforms raw data into strategic business insights
              </p>
            </div>
            
            <InteractiveDemo
              scenarios={demoScenarios}
              activeScenario={activeDemo}
              onScenarioChange={(scenario) => setActiveDemo(scenario as "real-time" | "predictive" | "automated-insights")}
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Comprehensive Analytics Platform</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to understand your business data
              </p>
            </div>
            
            <ServiceFeatureGrid features={features} />
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Data-Driven Success Stories</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Real businesses achieving breakthrough results with analytics
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
                <h2 className="text-4xl font-bold mb-6">Calculate Analytics ROI</h2>
                <p className="text-xl text-gray-300">
                  See how much value better data insights could create
                </p>
              </div>
              
              <ROICalculator type="data-analytics" />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Analytics Solutions for Every Scale</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From startups to enterprise, we have the right analytics solution
              </p>
            </div>
            
            <PricingComparison tiers={pricingTiers} />
          </div>
        </section>

        {/* Implementation Process */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Implementation Timeline</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From data assessment to intelligent insights in 6-10 weeks
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
                Ready to Unlock Your Data's Potential?
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                Join data-driven organizations already making smarter decisions with AI analytics
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Start Free Analysis <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 hover:bg-white/10">
                  Schedule Demo <PhoneIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Free data assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}