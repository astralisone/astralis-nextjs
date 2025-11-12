'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ServiceFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  benefits: string[];
}

interface ServiceFeatureGridProps {
  features: ServiceFeature[];
}

export function ServiceFeatureGrid({ features }: ServiceFeatureGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="glass-elevated rounded-2xl p-8 border border-white/20 hover:border-purple-500/30 group"
          >
            {/* Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>

              {/* Benefits List */}
              <div className="space-y-3 pt-4 border-t border-gray-700">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <motion.div
                    key={benefitIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (index * 0.1) + (benefitIndex * 0.05) }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-sm text-gray-400 leading-relaxed">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hover Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        );
      })}
    </div>
  );
}
