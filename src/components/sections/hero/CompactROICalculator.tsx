import React, { useState } from 'react';
import { Slider } from '../../ui/slider';
import { AnimatedCounter } from '../../ui/animated-counter';
import { useROICalculations, formatCurrency, formatNumber } from '../../../hooks/useROICalculations';
import { cn } from "@/lib/utils";
import { ROIGradientGraph } from './ROIGradientGraph';
import { 
  Sparkles,
  ArrowRight,
  BarChart
} from 'lucide-react';

interface CompactROICalculatorProps {
  className?: string;
}

const quickIndustrySelect = [
  { id: 'saas', name: 'SaaS', emoji: '🚀' },
  { id: 'ecommerce', name: 'E-commerce', emoji: '🛒' },
  { id: 'professional-services', name: 'Services', emoji: '💼' },
  { id: 'general', name: 'Other', emoji: '🏢' }
];

export function CompactROICalculator({ className }: CompactROICalculatorProps) {
  const [teamSize, setTeamSize] = useState([15]);
  const [industry, setIndustry] = useState<'saas' | 'ecommerce' | 'professional-services' | 'general'>('general');
  
  const metrics = useROICalculations({
    teamSize: teamSize[0],
    industry
  });

  return (
    <div className={cn(
      "rounded-2xl p-6 border border-white/10 relative overflow-hidden",
      "bg-gradient-to-br from-white/[0.02] to-white/[0.05]",
      "backdrop-filter backdrop-blur-xl backdrop-saturate-150",
      "-webkit-backdrop-filter",
      className
    )}
    style={{
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      background: 'rgba(255, 255, 255, 0.03)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-400 font-medium">ROI Calculator</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
            Save <span className="gradient-text-ai text-3xl lg:text-4xl tabular-nums">
              <AnimatedCounter 
                value={metrics.hoursSaved} 
                formatValue={formatNumber}
                duration={1200}
              />
            </span> Hours/Month
          </h1>
        </div>
        
        {/* Quick Industry Pills */}
        <div className="hidden lg:flex gap-2">
          {quickIndustrySelect.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setIndustry(ind.id as any)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                "hover:scale-105",
                industry === ind.id 
                  ? "border border-primary-500/50 text-white" 
                  : "border border-white/10 text-gray-400 hover:text-white"
              )}
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                background: industry === ind.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <span className="mr-1">{ind.emoji}</span>
              {ind.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Industry Selector */}
      <div className="lg:hidden mb-4">
        <div className="grid grid-cols-4 gap-2">
          {quickIndustrySelect.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setIndustry(ind.id as any)}
              className={cn(
                "p-2 rounded-lg text-xs font-medium transition-all duration-300 text-center",
                industry === ind.id 
                  ? "border border-primary-500/50 text-white" 
                  : "border border-white/10 text-gray-400"
              )}
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                background: industry === ind.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div className="text-lg mb-1">{ind.emoji}</div>
              {ind.name}
            </button>
          ))}
        </div>
      </div>

      {/* ROI Gradient Graph - Main Visual Focus */}
      <div className="mb-6">
        <ROIGradientGraph 
          teamSize={teamSize[0]}
          industry={industry}
          monthlySavings={metrics.monthlySavings}
          hoursSaved={metrics.hoursSaved}
          roiPercentage={metrics.roiPercentage}
          className=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Team Size Slider */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-white">Team Size:</label>
            <div className="text-lg font-bold gradient-text-ai tabular-nums">
              {teamSize[0]}
            </div>
          </div>
          
          <Slider
            value={teamSize}
            onValueChange={setTeamSize}
            max={500}
            min={1}
            step={1}
            className="w-full mb-2"
          />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>500+</span>
          </div>
        </div>

        {/* Center: Key Metrics */}
        <div className="lg:col-span-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Monthly Savings */}
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Monthly Savings</div>
              <div className="text-xl lg:text-2xl font-bold text-primary-400 tabular-nums">
                <AnimatedCounter 
                  value={metrics.monthlySavings} 
                  formatValue={formatCurrency}
                  duration={1200}
                />
              </div>
            </div>

            {/* ROI Percentage */}
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Monthly ROI</div>
              <div className="text-xl lg:text-2xl font-bold text-primary-400 tabular-nums">
                <AnimatedCounter 
                  value={metrics.roiPercentage} 
                  suffix="%"
                  duration={1200}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
            <span>
              <AnimatedCounter value={metrics.tasksAutomated} formatValue={formatNumber} />
              {' '}tasks automated
            </span>
            <span>•</span>
            <span>
              <AnimatedCounter value={metrics.paybackPeriod} formatValue={(val) => val.toFixed(1)} />
              {' '}month payback
            </span>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="lg:col-span-3">
          <div className="text-center">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-1 mb-3 px-2 py-1 rounded-full bg-primary-500/10 border border-primary-500/30">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-primary-400">5 audits left</span>
            </div>
            
            {/* Primary CTA */}
            <button className="w-full btn-primary px-4 py-3 rounded-xl magnetic-cta text-sm font-semibold">
              Get Free Audit
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            
            {/* Secondary Action */}
            <button className="w-full mt-2 text-xs text-gray-400 hover:text-primary-400 transition-colors underline">
              See detailed breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-500/5 rounded-full blur-xl animate-float" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/5 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />
    </div>
  );
}