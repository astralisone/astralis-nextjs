import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Users, Target, Shield, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const steps = [
    {
      icon: Building2,
      title: "Company Information",
      description: "Enter company details, industry, and billing information",
      features: ["Company profile", "Industry classification", "Billing details"]
    },
    {
      icon: Users,
      title: "Contact Management",
      description: "Add team contacts and designate primary stakeholders",
      features: ["Primary contacts", "Team roles", "Communication preferences"]
    },
    {
      icon: Target,
      title: "Engagement Setup",
      description: "Define project scope, timeline, and billing model",
      features: ["Project scope", "Timeline planning", "Billing structure"]
    },
    {
      icon: Shield,
      title: "Access & Environments",
      description: "Configure required access and development environments",
      features: ["System access", "Environment setup", "Security protocols"]
    },
    {
      icon: CheckCircle,
      title: "Review & Launch",
      description: "Review all information and activate the engagement",
      features: ["Final review", "Engagement activation", "Team notification"]
    }
  ];

  const benefits = [
    "Streamlined client onboarding process",
    "Automated access provisioning",
    "Comprehensive audit trail",
    "Real-time progress tracking",
    "Secure data handling",
    "Team collaboration tools"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Client Onboarding
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Streamline Your
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent"> Client Onboarding</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Get your clients up and running faster with our comprehensive 5-step onboarding process. 
            From initial setup to full engagement activation in minutes, not days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/onboarding/wizard">
                Start Onboarding Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
              Learn More
            </Button>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Simple 5-Step Process
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      Step {index + 1}
                    </Badge>
                  </div>
                  <CardTitle className="text-white">{step.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Our Onboarding?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-gray-800/30 border-gray-700 text-center">
                <CardContent className="pt-6">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-medium">{benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-violet-600 border-0">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join hundreds of companies that have streamlined their client onboarding process. 
                Start your first onboarding in under 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="bg-white text-purple-600 hover:bg-gray-100">
                  <Link href="/onboarding/wizard">
                    Start Onboarding Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 