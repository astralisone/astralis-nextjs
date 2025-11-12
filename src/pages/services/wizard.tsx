import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Users,
  Building2,
  BarChart,
  MousePointerClick
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  question: string;
  options: WizardOption[];
}

interface WizardOption {
  id: string;
  text: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  weight: Record<string, number>;
}

interface ServiceRecommendation {
  service: string;
  title: string;
  description: string;
  score: number;
  benefits: string[];
  nextSteps: string[];
  route: string;
}

export default function ServiceWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const wizardSteps: WizardStep[] = [
    {
      id: 0,
      title: "Business Challenge",
      description: "Let's identify your primary business challenge",
      question: "What's your biggest operational challenge right now?",
      options: [
        {
          id: "customer-volume",
          text: "Overwhelming customer inquiries",
          description: "Too many support requests, long response times",
          icon: Users,
          weight: { 'customer-service': 3, 'sales-pipeline': 1, 'content-generation': 1, 'data-analytics': 2 }
        },
        {
          id: "sales-conversion",
          text: "Low sales conversion rates",
          description: "Struggling to convert leads into customers",
          icon: BarChart,
          weight: { 'customer-service': 1, 'sales-pipeline': 3, 'content-generation': 2, 'data-analytics': 2 }
        },
        {
          id: "content-creation",
          text: "Content production bottleneck",
          description: "Can't create enough quality content fast enough",
          icon: MousePointerClick,
          weight: { 'customer-service': 1, 'sales-pipeline': 1, 'content-generation': 3, 'data-analytics': 1 }
        },
        {
          id: "data-insights",
          text: "Lack of actionable insights",
          description: "Drowning in data but can't make sense of it",
          icon: BarChart,
          weight: { 'customer-service': 1, 'sales-pipeline': 2, 'content-generation': 1, 'data-analytics': 3 }
        }
      ]
    },
    {
      id: 1,
      title: "Business Size",
      description: "Help us understand your scale",
      question: "What's your business size?",
      options: [
        {
          id: "startup",
          text: "Startup (1-10 employees)",
          description: "Early stage, rapid growth needed",
          icon: Sparkles,
          weight: { 'customer-service': 1, 'sales-pipeline': 2, 'content-generation': 2, 'data-analytics': 1 }
        },
        {
          id: "small",
          text: "Small Business (11-50 employees)",
          description: "Established but looking to scale",
          icon: Building2,
          weight: { 'customer-service': 2, 'sales-pipeline': 2, 'content-generation': 2, 'data-analytics': 2 }
        },
        {
          id: "medium",
          text: "Medium Business (51-200 employees)",
          description: "Growing operations, need efficiency",
          icon: Building2,
          weight: { 'customer-service': 3, 'sales-pipeline': 2, 'content-generation': 2, 'data-analytics': 3 }
        },
        {
          id: "enterprise",
          text: "Enterprise (200+ employees)",
          description: "Large scale operations, complex needs",
          icon: Building2,
          weight: { 'customer-service': 3, 'sales-pipeline': 3, 'content-generation': 3, 'data-analytics': 3 }
        }
      ]
    },
    {
      id: 2,
      title: "Priority Goals",
      description: "What matters most to your business?",
      question: "What's your top priority for the next 6 months?",
      options: [
        {
          id: "customer-satisfaction",
          text: "Improve customer satisfaction",
          description: "Better support experience and faster resolutions",
          icon: Users,
          weight: { 'customer-service': 3, 'sales-pipeline': 1, 'content-generation': 1, 'data-analytics': 2 }
        },
        {
          id: "revenue-growth",
          text: "Increase revenue",
          description: "More leads, better conversion, higher sales",
          icon: BarChart,
          weight: { 'customer-service': 1, 'sales-pipeline': 3, 'content-generation': 2, 'data-analytics': 2 }
        },
        {
          id: "operational-efficiency",
          text: "Operational efficiency",
          description: "Automate processes, reduce manual work",
          icon: Sparkles,
          weight: { 'customer-service': 2, 'sales-pipeline': 2, 'content-generation': 3, 'data-analytics': 3 }
        },
        {
          id: "market-expansion",
          text: "Market expansion",
          description: "Reach new audiences, scale marketing efforts",
          icon: MousePointerClick,
          weight: { 'customer-service': 1, 'sales-pipeline': 2, 'content-generation': 3, 'data-analytics': 2 }
        }
      ]
    },
    {
      id: 3,
      title: "Timeline",
      description: "When do you need to see results?",
      question: "What's your expected timeline for implementation?",
      options: [
        {
          id: "urgent",
          text: "ASAP (within 1 month)",
          description: "Immediate need, quick wins required",
          icon: Sparkles,
          weight: { 'customer-service': 2, 'sales-pipeline': 1, 'content-generation': 3, 'data-analytics': 1 }
        },
        {
          id: "soon",
          text: "Soon (1-3 months)",
          description: "Important but can plan properly",
          icon: BarChart,
          weight: { 'customer-service': 2, 'sales-pipeline': 2, 'content-generation': 2, 'data-analytics': 2 }
        },
        {
          id: "planned",
          text: "Planned (3-6 months)",
          description: "Strategic initiative with proper timeline",
          icon: Building2,
          weight: { 'customer-service': 2, 'sales-pipeline': 3, 'content-generation': 1, 'data-analytics': 3 }
        },
        {
          id: "future",
          text: "Future (6+ months)",
          description: "Long-term planning and preparation",
          icon: Users,
          weight: { 'customer-service': 1, 'sales-pipeline': 3, 'content-generation': 1, 'data-analytics': 3 }
        }
      ]
    }
  ];

  const serviceRecommendations: Record<string, ServiceRecommendation> = {
    'customer-service': {
      service: 'customer-service',
      title: 'Customer Service Automation',
      description: 'AI-powered customer support that handles inquiries 24/7 while improving satisfaction scores.',
      score: 0,
      benefits: [
        '95% faster response times',
        '24/7 availability',
        '68% cost reduction',
        'Higher customer satisfaction'
      ],
      nextSteps: [
        'Book a personalized demo',
        'Free customer service audit',
        'Custom ROI analysis'
      ],
      route: '/services/customer-service'
    },
    'sales-pipeline': {
      service: 'sales-pipeline',
      title: 'Sales Pipeline Optimization',
      description: 'AI-driven sales automation that qualifies leads, nurtures prospects, and forecasts deals.',
      score: 0,
      benefits: [
        '278% higher conversion rates',
        '53% shorter sales cycles',
        '92% forecast accuracy',
        'Automated lead nurturing'
      ],
      nextSteps: [
        'View interactive sales demo',
        'Free pipeline assessment',
        'Custom conversion analysis'
      ],
      route: '/services/sales-pipeline'
    },
    'content-generation': {
      service: 'content-generation',
      title: 'Content Generation System',
      description: 'AI content creation that scales your marketing while maintaining your unique brand voice.',
      score: 0,
      benefits: [
        '300% more content output',
        '81% time savings',
        '70% cost reduction',
        'Consistent brand voice'
      ],
      nextSteps: [
        'See content samples',
        'Free brand voice analysis',
        'Custom content strategy'
      ],
      route: '/services/content-generation'
    },
    'data-analytics': {
      service: 'data-analytics',
      title: 'Data Analytics Dashboard',
      description: 'AI-powered business intelligence that turns your data into actionable insights.',
      score: 0,
      benefits: [
        '95% faster reporting',
        'Real-time insights',
        '91% forecast accuracy',
        'Automated trend detection'
      ],
      nextSteps: [
        'View live dashboard demo',
        'Free data assessment',
        'Custom analytics roadmap'
      ],
      route: '/services/data-analytics'
    }
  };

  const calculateRecommendations = (): ServiceRecommendation[] => {
    const scores = {
      'customer-service': 0,
      'sales-pipeline': 0,
      'content-generation': 0,
      'data-analytics': 0
    };

    // Calculate weighted scores based on answers
    wizardSteps.forEach(step => {
      const answer = answers[step.id];
      if (answer) {
        const option = step.options.find(opt => opt.id === answer);
        if (option) {
          Object.entries(option.weight).forEach(([service, weight]) => {
            scores[service as keyof typeof scores] += weight;
          });
        }
      }
    });

    // Create recommendations with scores
    return Object.entries(serviceRecommendations)
      .map(([key, rec]) => ({
        ...rec,
        score: scores[key as keyof typeof scores]
      }))
      .sort((a, b) => b.score - a.score);
  };

  const handleAnswer = (answerId: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: answerId }));
    
    if (currentStep < wizardSteps.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 300);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const recommendations = showResults ? calculateRecommendations() : [];
  const topRecommendation = recommendations[0];

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      <SEOHead
        title="Service Selection Wizard - Find Your Perfect AI Solution | Astralis"
        description="Take our interactive quiz to discover which AI automation service is perfect for your business needs. Get personalized recommendations in minutes."
        keywords="AI service selection, business automation quiz, AI recommendation engine, service wizard"
      />
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {!showResults ? (
          /* Wizard Steps */
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  Step {currentStep + 1} of {wizardSteps.length}
                </span>
                <span className="text-sm text-gray-400">
                  {Math.round(((currentStep + 1) / wizardSteps.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Current Step */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="glass-elevated rounded-3xl p-12"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    {wizardSteps[currentStep].title}
                  </span>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  {wizardSteps[currentStep].question}
                </h1>
                
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {wizardSteps[currentStep].description}
                </p>
              </div>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-6">
                {wizardSteps[currentStep].options.map((option, index) => {
                  const Icon = option.icon;
                  const isSelected = answers[currentStep] === option.id;
                  
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => handleAnswer(option.id)}
                      className={cn(
                        "glass-card p-6 rounded-2xl border text-left transition-all duration-300",
                        "hover:scale-102 hover:border-purple-500/50",
                        isSelected 
                          ? "border-purple-500/50 bg-purple-500/10" 
                          : "border-white/20 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                          isSelected 
                            ? "border-purple-500/50 bg-purple-500/20" 
                            : "border-gray-600 bg-gray-800"
                        )}>
                          <Icon className={cn(
                            "w-6 h-6",
                            isSelected ? "text-purple-400" : "text-gray-400"
                          )} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-bold text-lg mb-2",
                            isSelected ? "text-purple-300" : "text-white"
                          )}>
                            {option.text}
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                        
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-12">
                <Button
                  onClick={goBack}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                
                <div className="text-gray-400 text-sm">
                  Choose an option to continue
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Results */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  Perfect Match Found!
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Your Recommended Solution
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Based on your answers, here's the AI service that will have the biggest impact on your business
              </p>
            </div>

            {/* Top Recommendation */}
            <div className="glass-elevated rounded-3xl p-12 mb-12 border border-purple-500/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white">
                    #1 Recommendation
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {topRecommendation?.title}
                </h2>
                
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {topRecommendation?.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Benefits */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Key Benefits</h3>
                  <div className="space-y-3">
                    {topRecommendation?.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Next Steps</h3>
                  <div className="space-y-3">
                    {topRecommendation?.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-purple-400 font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => router.push(topRecommendation?.route || '/')}
                    size="lg"
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Explore This Solution <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setCurrentStep(0);
                      setAnswers({});
                    }}
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 border-white/20 hover:bg-white/10"
                  >
                    Retake Quiz
                  </Button>
                </div>
              </div>
            </div>

            {/* All Recommendations */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">All Recommendations</h3>
              <p className="text-gray-300">Ranked by relevance to your business needs</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.service}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "glass-card p-6 rounded-2xl border transition-all duration-300 hover:scale-102",
                    index === 0 
                      ? "border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5" 
                      : "border-white/20 hover:border-purple-500/30"
                  )}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-sm font-bold",
                      index === 0 
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    )}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-2">{rec.title}</h4>
                      <p className="text-gray-300 text-sm">{rec.description}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(rec.route)}
                    variant={index === 0 ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      index === 0 
                        ? "btn-primary" 
                        : "border-white/20 hover:bg-white/10"
                    )}
                  >
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}