import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from '../../../hooks/useROICalculations';

interface ROIGradientGraphProps {
  className?: string;
  teamSize: number;
  industry: string;
  monthlySavings: number;
  hoursSaved: number;
  roiPercentage: number;
}

export function ROIGradientGraph({ 
  className,
  teamSize,
  industry,
  monthlySavings,
  hoursSaved,
  roiPercentage
}: ROIGradientGraphProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [debouncedValues, setDebouncedValues] = useState({
    monthlySavings,
    hoursSaved,
    roiPercentage
  });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce chart updates - only update after values stop changing for 800ms
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setDebouncedValues({
        monthlySavings,
        hoursSaved,
        roiPercentage
      });
      setAnimationKey(prev => prev + 1);
    }, 800); // Wait 800ms after last change
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [monthlySavings, hoursSaved, roiPercentage]);
  
  // Calculate graph data points based on debounced values
  const graphData = useMemo(() => {
    const months = 12;
    const dataPoints = [];
    
    for (let month = 0; month <= months; month++) {
      const growthFactor = 1 + (debouncedValues.roiPercentage / 1000) * month; // More realistic growth
      
      dataPoints.push({
        month,
        value: debouncedValues.monthlySavings * month * growthFactor,
        hours: debouncedValues.hoursSaved * month,
        barHeight: (debouncedValues.monthlySavings * month * growthFactor) / 1000, // Scale for visualization
      });
    }
    
    return dataPoints;
  }, [debouncedValues]);

  // Calculate max value for scaling
  const maxValue = Math.max(...graphData.map(d => d.value));
  const scaleFactor = 180 / (maxValue || 1); // Scale to fit in 180px height
  
  // Generate bezier curve path
  const generateCurvePath = () => {
    if (graphData.length < 2) return '';
    
    let path = `M 30,${220 - graphData[0].value * scaleFactor}`;
    
    for (let i = 0; i < graphData.length - 1; i++) {
      const x1 = 30 + (i * 60);
      const y1 = 220 - graphData[i].value * scaleFactor;
      const x2 = 30 + ((i + 1) * 60);
      const y2 = 220 - graphData[i + 1].value * scaleFactor;
      
      // Control points for bezier curve
      const cp1x = x1 + 20;
      const cp1y = y1;
      const cp2x = x2 - 20;
      const cp2y = y2;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }
    
    return path;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">
          Revenue Growth Projection
        </h3>
        <p className="text-sm text-gray-400">
          12-month AI automation impact
        </p>
      </div>

      {/* Main Chart Container */}
      <div 
        className="relative rounded-2xl p-6 border border-white/10 overflow-hidden backdrop-filter backdrop-blur-xl backdrop-saturate-150"
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.03)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent pointer-events-none" />
        
        {/* Chart SVG */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={animationKey}
            className="relative h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-full h-full" viewBox="0 0 800 256" preserveAspectRatio="xMidYMid meet">
              <defs>
                {/* Primary gradient for bars */}
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(258, 90%, 66%)" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="hsl(258, 90%, 66%)" stopOpacity="0.2"/>
                </linearGradient>
                
                {/* Curve gradient */}
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(258, 90%, 66%)" />
                  <stop offset="50%" stopColor="hsl(217, 91%, 60%)" />
                  <stop offset="100%" stopColor="hsl(258, 90%, 66%)" />
                </linearGradient>
                
                {/* Glow filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              <g className="opacity-10">
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={i}
                    x1="0" 
                    y1={50 + i * 50} 
                    x2="800" 
                    y2={50 + i * 50} 
                    stroke="white" 
                    strokeWidth="0.5"
                  />
                ))}
              </g>

              {/* Bars */}
              <g>
                {graphData.map((point, i) => {
                  const barWidth = 40;
                  const barX = 30 + (i * 60) - (barWidth / 2);
                  const barHeight = point.value * scaleFactor;
                  const barY = 220 - barHeight;
                  
                  return (
                    <motion.rect
                      key={`bar-${i}`}
                      x={barX}
                      y={220}
                      width={barWidth}
                      height={0}
                      fill="url(#barGradient)"
                      rx="4"
                      initial={{ height: 0, y: 220 }}
                      animate={{ 
                        height: barHeight,
                        y: barY
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}
              </g>

              {/* Bezier curve line */}
              <motion.path
                d={generateCurvePath()}
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="3"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { duration: 1.5, delay: 0.5, ease: "easeInOut" },
                  opacity: { duration: 0.3, delay: 0.5 }
                }}
              />

              {/* Data points on curve */}
              {graphData.map((point, i) => {
                const x = 30 + (i * 60);
                const y = 220 - point.value * scaleFactor;
                
                return (
                  <motion.g key={`point-${i}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.7 + i * 0.05,
                        type: "spring",
                        stiffness: 200
                      }}
                    />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="hsl(258, 90%, 66%)"
                      opacity="0.3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.7 + i * 0.05
                      }}
                    />
                    
                    {/* Value labels */}
                    {i % 3 === 0 && (
                      <motion.text
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        className="fill-white text-xs font-semibold"
                        initial={{ opacity: 0, y: y }}
                        animate={{ opacity: 1, y: y - 15 }}
                        transition={{ delay: 0.8 + i * 0.05 }}
                      >
                        {formatCurrency(point.value).replace(',000', 'k')}
                      </motion.text>
                    )}
                  </motion.g>
                );
              })}

              {/* X-axis labels */}
              <g className="text-gray-400">
                {graphData.map((point, i) => {
                  if (i % 3 === 0) {
                    return (
                      <text
                        key={`label-${i}`}
                        x={30 + (i * 60)}
                        y={245}
                        textAnchor="middle"
                        className="fill-current text-xs"
                      >
                        {i === 0 ? 'Now' : `${i}mo`}
                      </text>
                    );
                  }
                  return null;
                })}
              </g>
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* Key Metrics Below Graph */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-xs text-gray-400 mb-1">Total Revenue</div>
            <div className="text-lg font-bold text-primary-400">
              {formatCurrency(graphData[graphData.length - 1].value)}
            </div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-xs text-gray-400 mb-1">Hours Saved</div>
            <div className="text-lg font-bold text-primary-400">
              {formatNumber(graphData[graphData.length - 1].hours)}
            </div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="text-xs text-gray-400 mb-1">ROI Growth</div>
            <div className="text-lg font-bold text-primary-400">
              {roiPercentage.toFixed(0)}%
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}