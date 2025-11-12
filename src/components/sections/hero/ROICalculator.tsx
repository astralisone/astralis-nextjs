import React, { useState } from 'react';
import { Slider } from '../../ui/slider';
import { AnimatedCounter } from '../../ui/animated-counter';
import { IndustrySelector, Industry } from '../../ui/industry-selector';
import { useROICalculations, formatCurrency, formatNumber } from '../../../hooks/useROICalculations';
import { cn } from "@/lib/utils";
import { AiImpactCurve } from './AiImpactCurve';
import {
  Clock as ClockIcon,
  DollarSign as CurrencyDollarIcon,
  BarChart,
  Sparkles,
  TrendingUp as ArrowTrendingUpIcon
} from 'lucide-react';

interface ROICalculatorProps {
  className?: string;
}

export function ROICalculator({ className }: ROICalculatorProps) {
  const [teamSize, setTeamSize] = useState([15]);
  const [industry, setIndustry] = useState<Industry>('general');
  
  const metrics = useROICalculations({
    teamSize: teamSize[0],
    industry
  });

  return (
    <div className={cn(
      "glass-elevated rounded-3xl p-8 mb-8 border border-white/10",
      "bg-gradient-to-br from-white/[0.02] to-white/[0.05]",
      className
    )}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass-card border border-primary-500/30">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">
            Interactive ROI Calculator
          </span>
        </div>
        
        <h1 className="text-4xl lg:text-6xl font-black mb-4 leading-tight">
          <span className="text-white">Save</span>
          <span className="gradient-text-ai text-6xl lg:text-8xl mx-4 tabular-nums block sm:inline">
            <AnimatedCounter 
              value={metrics.hoursSaved} 
              formatValue={formatNumber}
              duration={1500}
            />
          </span>
          <span className="text-white">Hours This Month</span>
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          See exactly how much Revenue Operations automation will save your business. 
          Adjust the inputs below for your personalized projection.
        </p>
      </div>

      {/* AI Impact Curve - Main Focus */}
      <div className="mb-12">
        <AiImpactCurve 
          withAiValue={Math.min(95, 40 + (metrics.roiPercentage / 10))}
          withoutAiValue={40}
          className="mb-8"
        />
      </div>

      {/* Industry Selection */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-white mb-4">
          Select Your Industry:
        </label>
        <IndustrySelector 
          value={industry} 
          onChange={setIndustry}
        />
      </div>

      {/* Team Size Slider */}
      <div className="glass-card p-6 rounded-2xl mb-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <label className="text-lg font-semibold text-white">
            Current Team Size:
          </label>
          <div className="text-3xl font-bold gradient-text-ai tabular-nums">
            {teamSize[0]} employees
          </div>
        </div>
        
        <div className="space-y-4">
          <Slider
            value={teamSize}
            onValueChange={setTeamSize}
            max={500}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>1 employee</span>
            <span>500+ employees</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hours Saved */}
        <div className="glass-card p-6 rounded-2xl border border-green-500/20 relative overflow-hidden group hover:border-green-500/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 p-2 border border-green-500/30">
                <ClockIcon className="w-full h-full text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Time Savings</h3>
                <p className="text-sm text-gray-400">Monthly automation</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400 tabular-nums">
                <AnimatedCounter 
                  value={metrics.hoursSaved} 
                  suffix=" hrs"
                  formatValue={formatNumber}
                />
              </div>
              <p className="text-sm text-green-300">
                Automated tasks and workflows
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Savings */}
        <div className="glass-card p-6 rounded-2xl border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 p-2 border border-blue-500/30">
                <CurrencyDollarIcon className="w-full h-full text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Cost Reduction</h3>
                <p className="text-sm text-gray-400">Monthly savings</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400 tabular-nums">
                <AnimatedCounter 
                  value={metrics.monthlySavings} 
                  formatValue={formatCurrency}
                />
              </div>
              <p className="text-sm text-blue-300">
                Operational cost reduction
              </p>
            </div>
          </div>
        </div>

        {/* ROI Percentage */}
        <div className="glass-card p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 p-2 border border-purple-500/30">
                <ArrowTrendingUpIcon className="w-full h-full text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ROI Impact</h3>
                <p className="text-sm text-gray-400">Return on investment</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-400 tabular-nums">
                <AnimatedCounter 
                  value={metrics.roiPercentage} 
                  suffix="%"
                  formatValue={formatNumber}
                />
              </div>
              <p className="text-sm text-purple-300">
                Monthly ROI increase
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <div>
          <div className="text-2xl font-bold gradient-text-energy mb-2">
            <AnimatedCounter 
              value={metrics.tasksAutomated} 
              formatValue={formatNumber}
            /> Tasks Automated
          </div>
          <p className="text-sm text-gray-400">Repetitive processes eliminated monthly</p>
        </div>
        
        <div>
          <div className="text-2xl font-bold gradient-text-success mb-2">
            <AnimatedCounter 
              value={metrics.paybackPeriod} 
              formatValue={(val) => val.toFixed(1)}
            /> Month Payback
          </div>
          <p className="text-sm text-gray-400">Time to see full return on investment</p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-8 pt-8 border-t border-white/10 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 urgency-text">
          <BarChart className="w-4 h-4" />
          <span className="text-sm font-medium">
            Only 5 Revenue Audits available this month
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary px-8 py-4 rounded-xl magnetic-cta">
            Get Free Revenue Audit
            <span className="ml-2">→</span>
          </button>
          <button className="glass-card px-8 py-4 rounded-xl border border-white/20 text-white hover:border-primary-500/50 transition-all">
            See Implementation Timeline
          </button>
        </div>
      </div>
    </div>
  );
}