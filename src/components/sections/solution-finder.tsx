"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Solution {
  id: string;
  title: string;
  description: string;
  href: string;
}

const solutions: Solution[] = [
  {
    id: 'data-entry',
    title: 'I need to save time on Manual Data Entry',
    description: 'Automate data extraction and entry with AI-powered document processing',
    href: '/solutions#ai-automation'
  },
  {
    id: 'lead-gen',
    title: 'I need to increase Lead Generation',
    description: 'AI-driven lead qualification and automated nurture workflows',
    href: '/solutions#ai-automation'
  },
  {
    id: 'customer-support',
    title: 'I need to optimize Customer Support',
    description: 'Intelligent ticketing, routing, and 24/7 AI assistant capabilities',
    href: '/solutions#platform-engineering'
  }
];

/**
 * Solution Finder Component
 * Interactive solution selector matching user needs
 */
export function SolutionFinder() {
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-astralis-navy">
            Find Your Solution
          </h3>
          <p className="text-lg text-astralis-blue font-semibold">in 60 Seconds</p>
          <div className="h-1 w-32 bg-gradient-to-r from-astralis-blue to-blue-400 rounded-full" />
        </div>

        <div className="space-y-3">
          {solutions.map((solution) => (
            <button
              key={solution.id}
              onClick={() => setSelectedSolution(solution.id)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${selectedSolution === solution.id
                  ? 'border-astralis-blue bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <p className={`
                text-base font-medium
                ${selectedSolution === solution.id
                  ? 'text-astralis-blue'
                  : 'text-slate-700'
                }
              `}>
                {solution.title}
              </p>
            </button>
          ))}
        </div>

        {selectedSolution && (
          <div className="pt-4 border-t border-slate-200 animate-fade-in">
            <p className="text-sm text-slate-600 mb-4">
              {solutions.find(s => s.id === selectedSolution)?.description}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full group"
              onClick={() => {
                const solution = solutions.find(s => s.id === selectedSolution);
                if (solution) window.location.href = solution.href;
              }}
            >
              Explore Full Solution
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export type { Solution };
