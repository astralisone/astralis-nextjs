import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { ComparisonCard } from '../../ui/comparison-card';
import {
  ArrowRight,
  Play,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  DollarSign as CurrencyDollarIcon,
  Users as UserGroupIcon
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'manual' | 'automated';
}

interface WorkflowCardProps {
  title: string;
  description: string;
  industry: 'saas' | 'ecommerce' | 'professional-services';
  beforeMetrics: {
    timePerTask: string;
    accuracy: string;
    cost: string;
    effort: string;
  };
  afterMetrics: {
    timePerTask: string;
    accuracy: string;
    cost: string;
    effort: string;
  };
  workflow: WorkflowStep[];
  className?: string;
}

const industryColors = {
  saas: {
    gradient: 'from-purple-500 to-blue-500',
    border: 'border-purple-500/30',
    text: 'text-purple-400'
  },
  ecommerce: {
    gradient: 'from-green-500 to-blue-500',
    border: 'border-green-500/30',
    text: 'text-green-400'
  },
  'professional-services': {
    gradient: 'from-purple-500 to-pink-500',
    border: 'border-purple-500/30',
    text: 'text-purple-400'
  }
};

export function WorkflowCard({
  title,
  description,
  industry,
  beforeMetrics,
  afterMetrics,
  workflow,
  className
}: WorkflowCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const colors = industryColors[industry];

  const playWorkflow = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setCurrentStep(0);
    
    // Animate through workflow steps
    workflow.forEach((_, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        if (index === workflow.length - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setCurrentStep(0);
          }, 1000);
        }
      }, index * 800);
    });
  };

  return (
    <div className={cn(
      "glass-elevated rounded-3xl p-8 relative overflow-hidden group",
      "hover:scale-[1.01] transition-all duration-500",
      colors.border,
      className
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5",
        "group-hover:opacity-10 transition-opacity duration-500",
        colors.gradient
      )} />
      
      {/* Header */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            onClick={playWorkflow}
            disabled={isPlaying}
            className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center",
              "transition-all duration-300 hover:scale-110",
              isPlaying 
                ? "border-green-400 bg-green-400/20 animate-pulse" 
                : `${colors.border} hover:bg-gradient-to-r ${colors.gradient} hover:border-transparent`
            )}
          >
            {isPlaying ? (
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            ) : (
              <Play className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>

      {/* Workflow Animation */}
      <div className="relative mb-8">
        <div className="flex items-center gap-4 mb-6">
          {workflow.map((step, index) => {
            const Icon = step.icon;
            const isActive = isPlaying && currentStep >= index;
            const isAutomated = step.status === 'automated';
            
            return (
              <React.Fragment key={step.id}>
                {/* Workflow Step */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: isActive ? 1 : 0.6
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "relative w-12 h-12 rounded-xl border-2 flex items-center justify-center",
                    isActive 
                      ? isAutomated 
                        ? "border-green-400 bg-green-400/20" 
                        : "border-orange-400 bg-orange-400/20"
                      : "border-gray-600 bg-gray-800/50"
                  )}
                >
                  <Icon className={cn(
                    "w-6 h-6 transition-colors",
                    isActive 
                      ? isAutomated ? "text-green-400" : "text-orange-400"
                      : "text-gray-500"
                  )} />
                  
                  {/* Status indicator */}
                  <div className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-900",
                    isAutomated ? "bg-green-400" : "bg-orange-400"
                  )} />
                </motion.div>

                {/* Arrow between steps */}
                {index < workflow.length - 1 && (
                  <motion.div
                    animate={{
                      opacity: isPlaying && currentStep > index ? 1 : 0.3,
                      x: isPlaying && currentStep > index ? [0, 5, 0] : 0
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <ArrowRight className="w-6 h-6 text-gray-500" />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-gray-400">
          {workflow.map((step, index) => (
            <div key={`${step.id}-label`} className="text-center max-w-[80px]">
              <div className={cn(
                "font-medium transition-colors",
                isPlaying && currentStep >= index ? colors.text : "text-gray-500"
              )}>
                {step.name}
              </div>
              <div className="mt-1">
                {step.status === 'automated' ? 'AI' : 'Manual'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="grid grid-cols-2 gap-6">
        <ComparisonCard
          type="before"
          title="Before"
          subtitle="Manual Process"
          items={[
            { label: "Time per task", value: beforeMetrics.timePerTask, isPositive: false },
            { label: "Accuracy", value: beforeMetrics.accuracy, isPositive: false },
            { label: "Monthly cost", value: beforeMetrics.cost, isPositive: false },
            { label: "Team effort", value: beforeMetrics.effort, isPositive: false }
          ]}
        />
        
        <ComparisonCard
          type="after"
          title="After AI"
          subtitle="Automated Process"
          items={[
            { label: "Time per task", value: afterMetrics.timePerTask, isPositive: true },
            { label: "Accuracy", value: afterMetrics.accuracy, isPositive: true },
            { label: "Monthly cost", value: afterMetrics.cost, isPositive: true },
            { label: "Team effort", value: afterMetrics.effort, isPositive: true }
          ]}
        />
      </div>

      {/* Hover reveal details */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        whileHover={{ opacity: 1, height: 'auto' }}
        className="mt-6 pt-6 border-t border-white/10 overflow-hidden"
      >
        <div className={cn("text-sm font-medium mb-2", colors.text)}>
          Implementation Timeline: 2-3 weeks
        </div>
        <p className="text-xs text-gray-400">
          Full setup, testing, and team training included
        </p>
      </motion.div>
    </div>
  );
}