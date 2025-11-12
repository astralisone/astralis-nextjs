'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Clock,
  Check,
  FileText
} from 'lucide-react';

interface ProcessStep {
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500 hidden lg:block" />

        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Step Number Circle */}
              <div className="absolute left-0 top-0 lg:left-6 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-neutral-900 z-10">
                <span className="text-sm font-bold text-white">{index + 1}</span>
              </div>

              {/* Content Card */}
              <div className="ml-16 lg:ml-24">
                <div className="glass-elevated rounded-2xl p-8 border border-white/20 hover:border-purple-500/30 group transition-all duration-300">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Duration Badge */}
                    <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border border-blue-500/30 flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">
                        {step.duration}
                      </span>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wide">
                        Key Deliverables
                      </h4>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {step.deliverables.map((deliverable, deliverableIndex) => (
                        <motion.div
                          key={deliverableIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: (index * 0.2) + (deliverableIndex * 0.1)
                          }}
                          className="flex items-start gap-2 glass-card p-3 rounded-lg border border-gray-700 hover:border-purple-500/30 transition-colors"
                        >
                          <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-green-400" />
                          </div>
                          <span className="text-sm text-gray-300 leading-tight">
                            {deliverable}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </div>

              {/* Connecting Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (index * 0.2) + 0.5 }}
                  className="hidden lg:flex absolute left-8 -bottom-6 w-0.5 h-12 items-center justify-center"
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: steps.length * 0.2 }}
          className="mt-16 glass-elevated rounded-2xl p-8 border border-purple-500/30"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Implementation Summary</h3>
            <p className="text-gray-300">
              Complete setup and optimization timeline
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 glass-card rounded-xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {steps.length} Steps
              </div>
              <div className="text-sm text-gray-400">
                Structured process
              </div>
            </div>

            <div className="text-center p-4 glass-card rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {steps.reduce((acc, step) => acc + step.deliverables.length, 0)}
              </div>
              <div className="text-sm text-gray-400">
                Key deliverables
              </div>
            </div>

            <div className="text-center p-4 glass-card rounded-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                100%
              </div>
              <div className="text-sm text-gray-400">
                Success rate
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
