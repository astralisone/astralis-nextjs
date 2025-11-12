'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Integration } from '@/types/workflow';
import { Check, Star } from 'lucide-react';

interface IntegrationShowcaseProps {
  integrations: Integration[];
  selectedIntegrations?: string[];
  onIntegrationSelect?: (integrationId: string) => void;
  className?: string;
}

const integrationCategories = {
  'CRM': { color: 'from-blue-500 to-cyan-600', icon: '📊' },
  'Marketing': { color: 'from-pink-500 to-rose-600', icon: '📈' },
  'Payments': { color: 'from-green-500 to-emerald-600', icon: '💳' },
  'E-commerce': { color: 'from-orange-500 to-amber-600', icon: '🛒' },
  'Email Marketing': { color: 'from-purple-500 to-violet-600', icon: '✉️' },
  'Communication': { color: 'from-indigo-500 to-blue-600', icon: '💬' },
  'Automation': { color: 'from-yellow-500 to-orange-600', icon: '⚡' },
  'Analytics': { color: 'from-emerald-500 to-teal-600', icon: '📊' }
};

export function IntegrationShowcase({
  integrations,
  selectedIntegrations = [],
  onIntegrationSelect,
  className
}: IntegrationShowcaseProps) {
  // Group integrations by category
  const groupedIntegrations = integrations.reduce((groups, integration) => {
    const category = integration.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(integration);
    return groups;
  }, {} as Record<string, Integration[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("space-y-8", className)}
    >
      {/* Header */}
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Powerful Integrations
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300"
        >
          Connect with 500+ popular tools and platforms
        </motion.p>
      </div>

      {/* Integration Categories */}
      <div className="space-y-6">
        {Object.entries(groupedIntegrations).map(([category, categoryIntegrations], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + categoryIndex * 0.1 }}
            className="space-y-4"
          >
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                `bg-gradient-to-br ${integrationCategories[category as keyof typeof integrationCategories]?.color || 'from-gray-500 to-gray-600'}`
              )}>
                {integrationCategories[category as keyof typeof integrationCategories]?.icon || '🔗'}
              </div>
              <div>
                <h4 className="font-semibold text-white">{category}</h4>
                <p className="text-sm text-gray-400">
                  {categoryIntegrations.length} integration{categoryIntegrations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryIntegrations.map((integration, integrationIndex) => {
                const isSelected = selectedIntegrations.includes(integration.id);

                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.5 + categoryIndex * 0.1 + integrationIndex * 0.05,
                      duration: 0.3
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={cn(
                      "relative group cursor-pointer transition-all duration-300",
                      "glass-card border rounded-xl p-4",
                      isSelected ? [
                        "border-primary-500/50 shadow-lg shadow-primary-500/20",
                        "bg-primary-500/5"
                      ] : [
                        "border-white/10 hover:border-white/20"
                      ]
                    )}
                    onClick={() => onIntegrationSelect?.(integration.id)}
                  >
                    {/* Background gradient on hover */}
                    <div className={cn(
                      "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                      `bg-gradient-to-br ${integrationCategories[category as keyof typeof integrationCategories]?.color || 'from-gray-500 to-gray-600'}`
                    )} />

                    {/* Content */}
                    <div className="relative space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.icon}</div>
                          <div>
                            <h5 className="font-semibold text-white text-sm">
                              {integration.name}
                            </h5>
                            {integration.isPremium && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-yellow-400">Premium</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-300 line-clamp-2">
                        {integration.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {integration.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {integration.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{integration.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className={cn(
                      "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      `bg-gradient-to-br ${integrationCategories[category as keyof typeof integrationCategories]?.color || 'from-gray-500 to-gray-600'}`
                    )} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 pt-6 border-t border-white/10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">500+</div>
            <div className="text-sm text-gray-400">Integrations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">99.9%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">50ms</div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">24/7</div>
            <div className="text-sm text-gray-400">Support</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
