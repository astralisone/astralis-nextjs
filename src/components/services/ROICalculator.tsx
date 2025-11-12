'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Calculator,
  TrendingUp,
  DollarSign,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ROICalculatorProps {
  type: 'customer-service' | 'sales-pipeline' | 'content-generation' | 'data-analytics';
}

interface CalculatorInputs {
  [key: string]: number;
}

interface CalculatorResults {
  monthlySavings: number;
  annualSavings: number;
  timeReduction: number;
  efficiencyGain: number;
  roi: number;
  paybackPeriod: number;
}

const calculatorConfigs = {
  'customer-service': {
    title: 'Customer Service ROI Calculator',
    inputs: [
      { key: 'supportTickets', label: 'Monthly Support Tickets', placeholder: '1000', min: 100, max: 100000 },
      { key: 'avgResolutionTime', label: 'Avg Resolution Time (minutes)', placeholder: '45', min: 10, max: 480 },
      { key: 'agentHourlyRate', label: 'Agent Hourly Rate ($)', placeholder: '25', min: 15, max: 100 },
      { key: 'numAgents', label: 'Number of Agents', placeholder: '8', min: 1, max: 100 },
    ],
    calculate: (inputs: CalculatorInputs): CalculatorResults => {
      const currentMonthlyCost = (inputs.supportTickets * (inputs.avgResolutionTime / 60) * inputs.agentHourlyRate);
      const automatedMonthlyCost = currentMonthlyCost * 0.35; // 65% reduction
      const monthlySavings = currentMonthlyCost - automatedMonthlyCost;
      const timeReduction = 85; // 85% time reduction
      const efficiencyGain = 180; // 180% efficiency gain

      return {
        monthlySavings,
        annualSavings: monthlySavings * 12,
        timeReduction,
        efficiencyGain,
        roi: (monthlySavings * 12 / 3588) * 100, // Against annual Professional plan cost
        paybackPeriod: 3588 / monthlySavings, // Months to payback
      };
    }
  },
  'sales-pipeline': {
    title: 'Sales Pipeline ROI Calculator',
    inputs: [
      { key: 'monthlyLeads', label: 'Monthly Leads', placeholder: '500', min: 50, max: 10000 },
      { key: 'currentConversionRate', label: 'Current Conversion Rate (%)', placeholder: '3', min: 1, max: 20 },
      { key: 'avgDealValue', label: 'Average Deal Value ($)', placeholder: '5000', min: 500, max: 100000 },
      { key: 'salesTeamSize', label: 'Sales Team Size', placeholder: '5', min: 1, max: 50 },
    ],
    calculate: (inputs: CalculatorInputs): CalculatorResults => {
      const currentRevenue = inputs.monthlyLeads * (inputs.currentConversionRate / 100) * inputs.avgDealValue;
      const improvedConversionRate = inputs.currentConversionRate * 2.78; // 278% improvement
      const newRevenue = inputs.monthlyLeads * (improvedConversionRate / 100) * inputs.avgDealValue;
      const monthlySavings = newRevenue - currentRevenue;

      return {
        monthlySavings,
        annualSavings: monthlySavings * 12,
        timeReduction: 53, // 53% shorter sales cycle
        efficiencyGain: 37, // 37% team productivity gain
        roi: (monthlySavings * 12 / 11964) * 100, // Against annual Professional plan cost
        paybackPeriod: 11964 / monthlySavings,
      };
    }
  },
  'content-generation': {
    title: 'Content Generation ROI Calculator',
    inputs: [
      { key: 'contentPieces', label: 'Content Pieces per Month', placeholder: '20', min: 5, max: 200 },
      { key: 'avgCreationTime', label: 'Avg Creation Time (hours)', placeholder: '4', min: 1, max: 20 },
      { key: 'contentWriterRate', label: 'Content Writer Rate ($/hour)', placeholder: '50', min: 25, max: 200 },
      { key: 'teamSize', label: 'Content Team Size', placeholder: '3', min: 1, max: 20 },
    ],
    calculate: (inputs: CalculatorInputs): CalculatorResults => {
      const currentMonthlyCost = inputs.contentPieces * inputs.avgCreationTime * inputs.contentWriterRate;
      const automatedMonthlyCost = currentMonthlyCost * 0.3; // 70% cost reduction
      const monthlySavings = currentMonthlyCost - automatedMonthlyCost;

      return {
        monthlySavings,
        annualSavings: monthlySavings * 12,
        timeReduction: 81, // 81% time reduction
        efficiencyGain: 300, // 300% more content
        roi: (monthlySavings * 12 / 5964) * 100, // Against annual Growth plan cost
        paybackPeriod: 5964 / monthlySavings,
      };
    }
  },
  'data-analytics': {
    title: 'Data Analytics ROI Calculator',
    inputs: [
      { key: 'reportingHours', label: 'Weekly Reporting Hours', placeholder: '20', min: 5, max: 100 },
      { key: 'analystHourlyRate', label: 'Analyst Hourly Rate ($)', placeholder: '75', min: 30, max: 200 },
      { key: 'decisionDelayDays', label: 'Avg Decision Delay (days)', placeholder: '7', min: 1, max: 30 },
      { key: 'teamSize', label: 'Analytics Team Size', placeholder: '2', min: 1, max: 20 },
    ],
    calculate: (inputs: CalculatorInputs): CalculatorResults => {
      const currentMonthlyCost = inputs.reportingHours * 4 * inputs.analystHourlyRate * inputs.teamSize;
      const automatedMonthlyCost = currentMonthlyCost * 0.15; // 85% reduction in reporting time
      const monthlySavings = currentMonthlyCost - automatedMonthlyCost;

      const decisionSpeedValue = inputs.decisionDelayDays * 1000; // $1000 per day of faster decisions
      const totalMonthlySavings = monthlySavings + (decisionSpeedValue * 4); // 4 weeks per month

      return {
        monthlySavings: totalMonthlySavings,
        annualSavings: totalMonthlySavings * 12,
        timeReduction: 95, // 95% faster reporting
        efficiencyGain: 400, // 400% faster decisions
        roi: (totalMonthlySavings * 12 / 10764) * 100, // Against annual Pro plan cost
        paybackPeriod: 10764 / totalMonthlySavings,
      };
    }
  }
};

export function ROICalculator({ type }: ROICalculatorProps) {
  const config = calculatorConfigs[type];
  const [inputs, setInputs] = useState<CalculatorInputs>({});
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize inputs with placeholders
  useEffect(() => {
    const initialInputs: CalculatorInputs = {};
    config.inputs.forEach(input => {
      initialInputs[input.key] = parseInt(input.placeholder);
    });
    setInputs(initialInputs);
  }, [type]);

  // Calculate results when inputs change
  useEffect(() => {
    if (Object.keys(inputs).length === config.inputs.length) {
      const newResults = config.calculate(inputs);
      setResults(newResults);
    }
  }, [inputs, config]);

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setInputs(prev => ({ ...prev, [key]: numValue }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${Math.round(percentage)}%`;
  };

  const runCalculation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      // Results are already calculated in useEffect
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-4">
          <Calculator className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">ROI Calculator</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">{config.title}</h3>
        <p className="text-gray-400">
          Enter your current metrics to see potential savings and ROI
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-white mb-4">Your Current Metrics</h4>

          {config.inputs.map((input, index) => (
            <motion.div
              key={input.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-300 block">
                {input.label}
              </label>
              <input
                type="number"
                min={input.min}
                max={input.max}
                placeholder={input.placeholder}
                value={inputs[input.key] || ''}
                onChange={(e) => handleInputChange(input.key, e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </motion.div>
          ))}

          <Button
            onClick={runCalculation}
            disabled={isCalculating}
            className={cn(
              "w-full py-4 mt-6",
              isCalculating ? "btn-secondary" : "btn-primary"
            )}
          >
            {isCalculating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Calculator className="w-5 h-5" />
                </motion.div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" />
                Calculate ROI
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-white mb-4">Your Potential Results</h4>

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Monthly Savings */}
              <div className="glass-card p-6 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Monthly Savings</div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(results.monthlySavings)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Annual Savings */}
              <div className="glass-card p-6 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Annual Savings</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatCurrency(results.annualSavings)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Reduction */}
              <div className="glass-card p-6 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Time Reduction</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatPercentage(results.timeReduction)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI */}
              <div className="glass-card p-6 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Annual ROI</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {formatPercentage(results.roi)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payback Period */}
              <div className="text-center p-4 glass-card rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Payback Period</div>
                <div className="text-lg font-bold text-white">
                  {results.paybackPeriod < 1
                    ? '< 1 month'
                    : `${Math.round(results.paybackPeriod)} months`
                  }
                </div>
              </div>
            </motion.div>
          )}

          {!results && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Calculator className="w-12 h-12 mx-auto mb-4" />
                <p>Enter your metrics to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          * Results are estimates based on industry averages and may vary depending on your specific use case and implementation.
        </p>
      </div>
    </div>
  );
}
