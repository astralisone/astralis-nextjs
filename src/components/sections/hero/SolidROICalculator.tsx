import React, { useState } from 'react';
import { SolidSlider } from '../../ui/solid-slider';
import { SolidButton } from '../../ui/solid-button';
import { SolidCard, SolidCardHeader, SolidCardTitle, SolidCardContent } from '../../ui/solid-card';
import { SolidBadge } from '../../ui/solid-badge';
import { AnimatedCounter } from '../../ui/animated-counter';
import { useROICalculations, formatCurrency, formatNumber } from '../../../hooks/useROICalculations';
import { cn } from "@/lib/utils";
import {
  Calculator as CalculatorIcon,
  ArrowRight,
  TrendingUp as ArrowTrendingUpIcon,
  Clock as ClockIcon,
  DollarSign as CurrencyDollarIcon
} from 'lucide-react';

interface SolidROICalculatorProps {
  className?: string;
}

const industries = [
  { id: 'saas', name: 'SaaS', description: '$2M-$50M ARR' },
  { id: 'ecommerce', name: 'E-commerce', description: '$10M+ GMV' },
  { id: 'professional-services', name: 'Professional Services', description: '$5M+ Revenue' },
  { id: 'general', name: 'Other Industries', description: 'All business types' }
];

export function SolidROICalculator({ className }: SolidROICalculatorProps) {
  const [teamSize, setTeamSize] = useState([15]);
  const [industry, setIndustry] = useState<'saas' | 'ecommerce' | 'professional-services' | 'general'>('general');
  
  const metrics = useROICalculations({
    teamSize: teamSize[0],
    industry
  });

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <SolidBadge variant="secondary" className="mb-4">
          <CalculatorIcon className="w-3 h-3 mr-1" />
          Interactive ROI Calculator
        </SolidBadge>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Calculate Your Revenue Operations Impact
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Get instant projections for time savings, cost reduction, and ROI potential 
          with automated revenue operations workflows.
        </p>
      </div>

      <SolidCard>
        <SolidCardContent className="p-8">
          {/* Industry Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Select Your Industry
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {industries.map((ind) => (
                <SolidButton
                  key={ind.id}
                  variant={industry === ind.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-start text-left"
                  onClick={() => setIndustry(ind.id as any)}
                >
                  <div className="font-semibold text-sm">{ind.name}</div>
                  <div className="text-xs opacity-70 mt-1">{ind.description}</div>
                </SolidButton>
              ))}
            </div>
          </div>

          {/* Team Size Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Size
              </h3>
              <SolidBadge variant="outline" className="text-lg px-3 py-1">
                {teamSize[0]} employees
              </SolidBadge>
            </div>
            
            <SolidSlider
              value={teamSize}
              onValueChange={setTeamSize}
              max={500}
              min={1}
              step={1}
              className="mb-4"
            />
            
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>1 employee</span>
              <span>500+ employees</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Hours Saved */}
            <SolidCard className="text-center">
              <SolidCardHeader className="pb-2">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <SolidCardTitle className="text-sm text-gray-600 dark:text-gray-300">
                  Hours Saved
                </SolidCardTitle>
              </SolidCardHeader>
              <SolidCardContent className="pt-0">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  <AnimatedCounter 
                    value={metrics.hoursSaved} 
                    formatValue={formatNumber}
                    duration={1200}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
              </SolidCardContent>
            </SolidCard>

            {/* Monthly Savings */}
            <SolidCard className="text-center">
              <SolidCardHeader className="pb-2">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <SolidCardTitle className="text-sm text-gray-600 dark:text-gray-300">
                  Monthly Savings
                </SolidCardTitle>
              </SolidCardHeader>
              <SolidCardContent className="pt-0">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  <AnimatedCounter 
                    value={metrics.monthlySavings} 
                    formatValue={formatCurrency}
                    duration={1200}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">cost reduction</div>
              </SolidCardContent>
            </SolidCard>

            {/* ROI Percentage */}
            <SolidCard className="text-center">
              <SolidCardHeader className="pb-2">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <SolidCardTitle className="text-sm text-gray-600 dark:text-gray-300">
                  Monthly ROI
                </SolidCardTitle>
              </SolidCardHeader>
              <SolidCardContent className="pt-0">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  <AnimatedCounter 
                    value={metrics.roiPercentage} 
                    suffix="%"
                    duration={1200}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">return</div>
              </SolidCardContent>
            </SolidCard>

            {/* Payback Period */}
            <SolidCard className="text-center">
              <SolidCardHeader className="pb-2">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <CalculatorIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <SolidCardTitle className="text-sm text-gray-600 dark:text-gray-300">
                  Payback Period
                </SolidCardTitle>
              </SolidCardHeader>
              <SolidCardContent className="pt-0">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  <AnimatedCounter 
                    value={metrics.paybackPeriod} 
                    formatValue={(val) => val.toFixed(1)}
                    duration={1200}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">months</div>
              </SolidCardContent>
            </SolidCard>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                <AnimatedCounter 
                  value={metrics.tasksAutomated} 
                  formatValue={formatNumber}
                  duration={1200}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Tasks Automated Monthly
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                <AnimatedCounter 
                  value={metrics.annualRevenuePotential} 
                  formatValue={formatCurrency}
                  duration={1200}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Annual Revenue Potential
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center border-t pt-8">
            <SolidBadge variant="warning" className="mb-4">
              Limited Time: Only 5 Revenue Audits Available This Month
            </SolidBadge>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SolidButton size="lg" className="flex items-center gap-2">
                Get Free Revenue Audit
                <ArrowRight className="w-4 h-4" />
              </SolidButton>
              
              <SolidButton variant="outline" size="lg">
                Download Detailed Report
              </SolidButton>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              No commitment required • Get results in 24 hours • 97% client satisfaction rate
            </p>
          </div>
        </SolidCardContent>
      </SolidCard>
    </div>
  );
}