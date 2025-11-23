"use client";

import { Search, Wrench, Zap, BarChart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessStep {
  title: string;
  description: string;
}

interface HomepageProcessFlowProps {
  steps: ProcessStep[];
}

/**
 * Homepage Process Flow Component
 * Updated layout: LEFT SIDE = CTA, RIGHT SIDE = 4 process steps in horizontal row
 * Dark background with connecting lines between steps
 */
export function HomepageProcessFlow({ steps }: HomepageProcessFlowProps) {
  const icons = [Search, Wrench, Zap, BarChart];

  const stepsWithIcons = steps.map((step, index) => ({
    icon: icons[index],
    title: step.title,
    description: step.description,
  }));

  return (
    <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT SIDE - CTA Content */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Join 500+ businesses already benefiting from AI-powered automation. Start your journey today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact?intent=start"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-astralis-blue text-white font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Now
              </a>
              <a
                href="/contact?intent=demo"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-100 font-semibold hover:bg-slate-800 transition-colors duration-200"
              >
                Schedule a Demo
              </a>
            </div>
          </div>

          {/* RIGHT SIDE - Process Steps in Horizontal Row */}
          <div className="lg:col-span-8">
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stepsWithIcons.map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === stepsWithIcons.length - 1;

                  return (
                    <div key={index} className="relative">
                      {/* Connecting line - desktop only */}
                      {!isLast && (
                        <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-astralis-cyan/30 z-0">
                          <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-astralis-cyan" />
                        </div>
                      )}

                      {/* Step Content */}
                      <div className="relative z-10 flex flex-col items-center text-center">
                        {/* Icon Circle */}
                        <div className={cn(
                          "w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
                          "bg-astralis-navy border-2 border-astralis-cyan shadow-glow-cyan",
                          "hover:scale-110 hover:shadow-glow-cyan-lg"
                        )}>
                          <Icon className="w-10 h-10 text-astralis-cyan" />
                        </div>

                        {/* Step Number Badge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 rounded-full bg-astralis-blue text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>

                        {/* Title */}
                        <h3 className="text-base md:text-lg font-bold text-white mb-2">
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
