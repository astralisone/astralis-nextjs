'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Quote
} from 'lucide-react';

interface CaseStudyResult {
  metric: string;
  before: string;
  after: string;
  improvement: string;
}

interface CaseStudy {
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: CaseStudyResult[];
  testimonial: string;
  author: string;
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const getImprovementIcon = (improvement: string) => {
    const isPositive = improvement.includes('+') || improvement.includes('Higher') || improvement.includes('Better');
    const isNegative = improvement.includes('-') || improvement.includes('Less') || improvement.includes('Shorter');

    if (isPositive) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (isNegative) {
      return <TrendingDown className="w-4 h-4 text-green-400" />;
    }
    return null;
  };

  const getImprovementColor = (improvement: string) => {
    if (improvement.includes('+') || improvement.includes('Higher') || improvement.includes('Better')) {
      return 'text-green-400';
    } else if (improvement.includes('-') && (improvement.includes('Cost') || improvement.includes('Time') || improvement.includes('Days'))) {
      return 'text-green-400'; // Cost/time reductions are good
    }
    return 'text-blue-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.6 }}
      className="glass-elevated rounded-3xl p-8 border border-white/20 hover:border-purple-500/30 group"
    >
      {/* Company Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
          <Building2 className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{caseStudy.company}</h3>
          <p className="text-sm text-gray-400">{caseStudy.industry}</p>
        </div>
      </div>

      {/* Challenge & Solution */}
      <div className="space-y-4 mb-8">
        <div>
          <h4 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wide">Challenge</h4>
          <p className="text-gray-300 leading-relaxed">{caseStudy.challenge}</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Solution</h4>
          <p className="text-gray-300 leading-relaxed">{caseStudy.solution}</p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="mb-8">
        <h4 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-wide">Results</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {caseStudy.results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-colors"
            >
              <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                {result.metric}
              </div>

              {/* Before/After Comparison */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Before:</span>
                  <span className="text-sm text-red-400 font-mono">{result.before}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">After:</span>
                  <span className="text-sm text-green-400 font-mono">{result.after}</span>
                </div>
              </div>

              {/* Improvement Badge */}
              <div className="mt-3 flex items-center justify-center">
                <div className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border",
                  "bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30"
                )}>
                  {getImprovementIcon(result.improvement)}
                  <span className={getImprovementColor(result.improvement)}>
                    {result.improvement}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="relative">
        {/* Quote Icon */}
        <div className="absolute -top-2 -left-2">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
            <Quote className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        <blockquote className="pl-8 mb-4">
          <p className="text-gray-300 italic leading-relaxed text-lg">
            &quot;{caseStudy.testimonial}&quot;
          </p>
        </blockquote>

        <div className="flex items-center gap-3 pl-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            <span className="text-sm font-bold text-blue-400">
              {caseStudy.author.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-medium text-white text-sm">{caseStudy.author}</div>
            <div className="text-xs text-gray-500">{caseStudy.company}</div>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
