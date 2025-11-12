"use client"

import Link from "next/link"
import {
  MessageCircle,
  Trophy,
  Pencil,
  BarChart,
  Sparkles
} from "lucide-react"
import { ServiceCard } from "./service-card"

const services = [
  {
    title: "Customer Service Automation",
    description: "AI-powered customer support that handles inquiries 24/7 while improving satisfaction scores by 95%.",
    icon: MessageCircle,
    route: "/services/customer-service",
    stats: "95% faster response times"
  },
  {
    title: "Sales Pipeline Optimization",
    description: "AI-driven sales automation that qualifies leads, nurtures prospects, and increases conversion rates by 278%.",
    icon: Trophy,
    route: "/services/sales-pipeline",
    stats: "278% higher conversions"
  },
  {
    title: "Content Generation System",
    description: "AI content creation that scales your marketing while maintaining your unique brand voice and style.",
    icon: Pencil,
    route: "/services/content-generation",
    stats: "300% more content"
  },
  {
    title: "Data Analytics Dashboard",
    description: "AI-powered business intelligence that turns your data into actionable insights and predictions.",
    icon: BarChart,
    route: "/services/data-analytics",
    stats: "91% forecast accuracy"
  },
]

export function ServicesSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">AI Workflow Services</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Transform Your Business with{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
            AI Automation
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Our AI-powered workflow services automate your most time-consuming processes, 
          increase efficiency, and drive measurable business results.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {services.map((service, index) => (
          <ServiceCard key={service.title} {...service} index={index} />
        ))}
      </div>
      
      {/* CTA to Service Wizard */}
      <div className="text-center mt-16">
        <div className="glass-elevated rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Not sure which service is right for you?
          </h3>
          <p className="text-gray-300 mb-6">
            Take our interactive quiz to get personalized recommendations
          </p>
          <Link
            href="/services/wizard"
            className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5" />
            Find My Perfect Service
          </Link>
        </div>
      </div>
    </section>
  )
}