import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { cn } from "@/lib/utils";

interface AiImpactCurveProps {
  className?: string;
  withAiValue?: number;
  withoutAiValue?: number;
}

export function AiImpactCurve({ 
  className,
  withAiValue = 90,
  withoutAiValue = 40
}: AiImpactCurveProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const data = [
    { 
      label: 'Without AI', 
      value: withoutAiValue, 
      color: 'linear-gradient(90deg, rgb(239 68 68), rgb(252 165 165))',
      tooltip: 'Manual processes and limited automation'
    },
    { 
      label: 'With AI', 
      value: withAiValue, 
      color: 'linear-gradient(90deg, rgb(34 197 94), rgb(134 239 172))',
      tooltip: 'Full AI-powered automation and optimization'
    },
  ];

  return (
    <div className={cn(
      "w-full",
      className
    )}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white mb-1">
          Performance Impact Comparison
        </h3>
        <p className="text-sm text-gray-400">
          See the dramatic difference AI automation makes
        </p>
      </div>

      <div className="space-y-8">
        {data.map((item, index) => (
          <div key={item.label} className="relative">
            <div 
              className="flex items-center justify-between mb-3"
              onMouseEnter={() => setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="font-semibold text-white cursor-pointer flex items-center gap-2"
                data-tooltip-id={`tooltip-${item.label}`}
                data-tooltip-content={item.tooltip}
              >
                {item.label}
                {item.label === 'With AI' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Recommended
                  </span>
                )}
              </div>
              <div className="text-lg font-bold text-gray-300">
                {item.value}%
              </div>
            </div>

            <div className="relative">
              <div className="glass-card rounded-full h-12 overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ 
                    duration: 1.5, 
                    delay: index * 0.3,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }}
                  className="h-full relative overflow-hidden"
                  style={{
                    background: item.color,
                    borderRadius: '9999px',
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                      duration: 1.5,
                      delay: index * 0.3 + 0.5,
                      ease: 'linear'
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                  />
                </motion.div>
              </div>

              {/* Curved indicator effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: hovered === item.label ? 1 : 0,
                  scale: hovered === item.label ? 1 : 0.8,
                  rotate: hovered === item.label ? (item.label === 'With AI' ? -5 : 5) : 0
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 120,
                  damping: 15
                }}
                className="absolute -top-1 pointer-events-none"
                style={{
                  left: `${Math.min(item.value - 2, 95)}%`,
                }}
              >
                <div className="w-0.5 h-16 bg-gradient-to-b from-white/40 to-transparent" />
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white/60" />
              </motion.div>
            </div>

            <Tooltip 
              id={`tooltip-${item.label}`}
              place="top"
              className="!bg-neutral-800 !text-gray-200 !text-sm !px-3 !py-2 !rounded-lg !border !border-white/10"
            />
          </div>
        ))}
      </div>

      {/* Impact Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-6 glass-card p-4 rounded-xl border border-primary-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Performance Increase</p>
            <p className="text-2xl font-bold gradient-text-ai">
              +{withAiValue - withoutAiValue}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Efficiency Multiplier</p>
            <p className="text-2xl font-bold text-green-400">
              {(withAiValue / withoutAiValue).toFixed(1)}x
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}