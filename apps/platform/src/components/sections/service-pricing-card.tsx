"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Check } from 'lucide-react';

interface ServicePricingCardProps {
  title: string;
  roi: string;
  description: string;
  features: string[];
  pricing: {
    step: string;
    amount: string;
  };
  timeEstimate: string;
  ctaText?: string;
  ctaHref?: string;
  featured?: boolean;
}

/**
 * Service Pricing Card Component
 * Displays AI service offerings with ROI and pricing slider
 * Updated to match mockup with:
 * - Slider for "Avg Hourly Wage"
 * - STEP indicator in top-right corner
 * - Time estimate above slider
 */
export function ServicePricingCard({
  title,
  roi,
  description,
  features,
  pricing,
  timeEstimate,
  ctaText = 'Explore Full Solution',
  ctaHref = '/services',
  featured = false
}: ServicePricingCardProps) {
  const [hourlyWage, setHourlyWage] = useState([25]);
  const [hoursPerWeek, setHoursPerWeek] = useState([10]);
  // Calculate estimated savings
  const calculateSavings = () => {
    const weeklySavings = hourlyWage[0] * hoursPerWeek[0];
    const monthlySavings = weeklySavings * 4;
    return {
      weekly: weeklySavings,
      monthly: monthlySavings,
      annual: monthlySavings * 12
    };
  };

  const savings = calculateSavings();

  return (
    <Card className={`
      relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
      ${featured
        ? 'border-2 border-astralis-blue shadow-xl'
        : 'border border-slate-200 shadow-lg'
      }
    `}>
      {/* STEP indicator in top-right corner */}
      <div className="absolute top-4 right-4 bg-astralis-blue text-white text-xs font-bold px-3 py-1 rounded-full z-10">
        {pricing.step}
      </div>

      <CardHeader className={`
        pb-4
        ${featured
          ? 'bg-gradient-to-br from-blue-50 to-white border-b-2 border-astralis-blue/20'
          : 'bg-slate-50 border-b border-slate-200'
        }
      `}>
        <div className="space-y-2">
          <CardTitle className="text-xl font-bold text-astralis-navy">
            {title}
          </CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-astralis-blue to-blue-600 bg-clip-text text-transparent">
              {roi}
            </span>
            <span className="text-sm text-slate-600">ROI Increase</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className={`
                w-5 h-5 flex-shrink-0 mt-0.5
                ${featured ? 'text-astralis-blue' : 'text-emerald-500'}
              `} />
              <span className="text-sm text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Pricing Calculator Section */}
        <div className={`
          rounded-lg p-6 space-y-6
          ${featured
            ? 'bg-gradient-to-br from-blue-50 to-white border-2 border-astralis-blue/20'
            : 'bg-slate-50 border border-slate-200'
          }
        `}>
          {/* Time Estimate - Above sliders */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-700">
              Avg Time Spent on Repetitive Tasks / Week
            </span>
            <span className={`
              text-xs px-3 py-1 rounded-full font-medium
              ${featured
                ? 'bg-astralis-blue/10 text-astralis-blue border border-astralis-blue/20'
                : 'bg-slate-200 text-slate-700'
              }
            `}>
              {timeEstimate}
            </span>
          </div>

          {/* Avg Hourly Wage Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Avg Hourly Wage
              </label>
              <span className="text-lg font-bold text-astralis-navy">
                ${hourlyWage[0]}/hr
              </span>
            </div>
            <Slider
              value={hourlyWage}
              onValueChange={setHourlyWage}
              min={15}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>$15</span>
              <span>$100</span>
            </div>
          </div>

          {/* Hours Per Week Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Hours Spent Per Week
              </label>
              <span className="text-lg font-bold text-astralis-navy">
                {hoursPerWeek[0]} hrs
              </span>
            </div>
            <Slider
              value={hoursPerWeek}
              onValueChange={setHoursPerWeek}
              min={5}
              max={40}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>5 hrs</span>
              <span>40 hrs</span>
            </div>
          </div>

          {/* Calculated Savings */}
          <div className="pt-4 border-t border-slate-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Monthly Savings:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ${savings.monthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Annual Savings:</span>
                <span className="font-semibold text-slate-700">
                  ${savings.annual.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant={featured ? 'primary' : 'outline'}
          size="lg"
          className="w-full"
          onClick={() => window.location.href = ctaHref}
        >
          {ctaText}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Button>
      </CardContent>
    </Card>
  );
}

export type { ServicePricingCardProps };
