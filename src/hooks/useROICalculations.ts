import { useState, useEffect, useMemo } from 'react';

export interface ROIInputs {
  teamSize: number;
  industry: 'saas' | 'ecommerce' | 'professional-services' | 'general';
  currentRevenue?: number;
  hoursPerTask?: number;
  tasksPerMonth?: number;
}

export interface ROIMetrics {
  hoursSaved: number;
  monthlySavings: number;
  tasksAutomated: number;
  roiPercentage: number;
  paybackPeriod: number;
  annualRevenuePotential: number;
}

const industryMultipliers = {
  saas: { efficiency: 1.4, value: 85, automation: 0.35 },
  ecommerce: { efficiency: 1.3, value: 65, automation: 0.30 },
  'professional-services': { efficiency: 1.5, value: 95, automation: 0.40 },
  general: { efficiency: 1.2, value: 75, automation: 0.32 }
};

export function useROICalculations(inputs: ROIInputs): ROIMetrics {
  const [animatedMetrics, setAnimatedMetrics] = useState<ROIMetrics>({
    hoursSaved: 0,
    monthlySavings: 0,
    tasksAutomated: 0,
    roiPercentage: 0,
    paybackPeriod: 0,
    annualRevenuePotential: 0
  });

  const targetMetrics = useMemo(() => {
    const multiplier = industryMultipliers[inputs.industry];
    
    // Calculate base metrics (more realistic)
    const baseHoursPerEmployee = 15; // realistic hours per month that can be automated
    const hourlyValue = multiplier.value; // $ value per hour
    
    const hoursSaved = Math.round(
      inputs.teamSize * baseHoursPerEmployee * multiplier.automation
    );
    
    const monthlySavings = Math.round(
      hoursSaved * hourlyValue
    );
    
    const tasksAutomated = Math.round(
      inputs.teamSize * 50 * multiplier.automation // avg 50 repetitive tasks per employee
    );
    
    // ROI calculation (assuming realistic investment based on team size)
    const investmentAmount = 2500 + (inputs.teamSize * 350); // base + per seat pricing
    const monthlyReturn = monthlySavings - (investmentAmount / 12);
    const roiPercentage = Math.round(
      (monthlyReturn / (investmentAmount / 12)) * 100
    );
    
    const paybackPeriod = investmentAmount / monthlySavings; // in months
    
    // Annual revenue potential increase
    const annualRevenuePotential = Math.round(
      monthlySavings * 12 * multiplier.efficiency
    );

    return {
      hoursSaved,
      monthlySavings,
      tasksAutomated,
      roiPercentage: Math.max(roiPercentage, 100), // minimum 100% ROI
      paybackPeriod: Math.max(paybackPeriod, 0.5), // minimum 0.5 months
      annualRevenuePotential
    };
  }, [inputs]);

  // Animate metrics changes
  useEffect(() => {
    const duration = 1500; // animation duration in ms
    const steps = 30;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedMetrics(prev => ({
        hoursSaved: Math.round(
          prev.hoursSaved + (targetMetrics.hoursSaved - prev.hoursSaved) * easeOutQuart
        ),
        monthlySavings: Math.round(
          prev.monthlySavings + (targetMetrics.monthlySavings - prev.monthlySavings) * easeOutQuart
        ),
        tasksAutomated: Math.round(
          prev.tasksAutomated + (targetMetrics.tasksAutomated - prev.tasksAutomated) * easeOutQuart
        ),
        roiPercentage: Math.round(
          prev.roiPercentage + (targetMetrics.roiPercentage - prev.roiPercentage) * easeOutQuart
        ),
        paybackPeriod: Number(
          (prev.paybackPeriod + (targetMetrics.paybackPeriod - prev.paybackPeriod) * easeOutQuart).toFixed(1)
        ),
        annualRevenuePotential: Math.round(
          prev.annualRevenuePotential + (targetMetrics.annualRevenuePotential - prev.annualRevenuePotential) * easeOutQuart
        )
      }));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedMetrics(targetMetrics);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [targetMetrics]);

  return animatedMetrics;
}

// Format large numbers with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format currency
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}