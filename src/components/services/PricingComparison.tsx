'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

interface PricingComparisonProps {
  tiers: PricingTier[];
}

export function PricingComparison({ tiers }: PricingComparisonProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={cn(
              "relative overflow-hidden rounded-3xl p-8 transition-all duration-500",
              "glass-elevated border hover:scale-105",
              tier.highlighted
                ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10 lg:-mt-4 lg:mb-4 lg:py-12"
                : "border-white/20 hover:border-purple-500/30"
            )}
          >
            {/* Popular Badge */}
            {tier.highlighted && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              </div>
            )}

            {/* Background Glow */}
            {tier.highlighted && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl" />
            )}

            <div className="relative">
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className={cn(
                  "text-2xl font-bold mb-2",
                  tier.highlighted ? "text-purple-300" : "text-white"
                )}>
                  {tier.name}
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={cn(
                      "text-4xl font-bold",
                      tier.highlighted
                        ? "bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                        : "text-white"
                    )}>
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-gray-400 text-sm">
                        {tier.period}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-4">
                {tier.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                    className="flex items-start gap-3"
                  >
                    <Check className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0",
                      tier.highlighted ? "text-purple-400" : "text-green-400"
                    )} />
                    <span className="text-gray-300 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  className={cn(
                    "w-full py-4 text-base font-bold transition-all duration-300",
                    tier.highlighted
                      ? "btn-primary hover:scale-105"
                      : "btn-outline border-white/30 hover:border-purple-500/50 hover:bg-purple-500/20"
                  )}
                >
                  {tier.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  {tier.name === "Enterprise" ? "Custom pricing available" : "No setup fees • Cancel anytime"}
                </p>
              </div>
            </div>

            {/* Hover Effects */}
            <div className={cn(
              "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
              tier.highlighted
                ? "bg-gradient-to-br from-purple-500/5 to-blue-500/5"
                : "bg-gradient-to-br from-white/2 to-purple-500/5"
            )} />
          </motion.div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16 glass-elevated rounded-3xl p-8 overflow-hidden">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">Compare All Features</h3>
          <p className="text-gray-300">
            See what&apos;s included in each plan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Features</th>
                {tiers.map((tier) => (
                  <th key={tier.name} className="text-center py-4 px-6">
                    <div className={cn(
                      "font-bold",
                      tier.highlighted ? "text-purple-300" : "text-white"
                    )}>
                      {tier.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {/* Core Features */}
              <tr>
                <td className="py-3 px-6 text-gray-300">AI-Powered Automation</td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-gray-300">24/7 Support</td>
                <td className="py-3 px-6 text-center">
                  <span className="text-gray-500 text-sm">Email</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-gray-300">Custom Integrations</td>
                <td className="py-3 px-6 text-center">
                  <span className="text-gray-500 text-sm">Limited</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-gray-300">Dedicated Success Manager</td>
                <td className="py-3 px-6 text-center">
                  <span className="text-gray-500">—</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className="text-gray-500">—</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Money-back Guarantee */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 glass-card px-8 py-4 rounded-2xl">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="font-bold text-white">30-Day Money-Back Guarantee</div>
            <div className="text-sm text-gray-400">Try risk-free. Full refund if not satisfied.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
