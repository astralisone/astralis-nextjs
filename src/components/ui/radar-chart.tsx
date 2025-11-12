import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RadarDataPoint {
  id: string;
  label: string;
  value: number; // 0-100
  color: string;
  company?: string;
  industry?: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  className?: string;
}

export function RadarChart({ data, size = 300, className }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const center = size / 2;
  const maxRadius = center - 50;

  // Generate concentric circles (grid)
  const circles = [0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => ratio * maxRadius);
  
  // Calculate positions for data points
  const dataPoints = data.map((item, index) => {
    const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2; // Start from top
    const radius = (item.value / 100) * maxRadius;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    
    return {
      ...item,
      x,
      y,
      angle,
      radius
    };
  });

  return (
    <div className={cn("relative", className)}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="drop-shadow-lg"
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={maxRadius}
          fill="url(#radarGradient)"
          className="opacity-30"
        />
        
        {/* Grid circles */}
        {circles.map((radius, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="1"
            className="opacity-60"
          />
        ))}
        
        {/* Grid lines */}
        {dataPoints.map((point, index) => (
          <line
            key={`line-${index}`}
            x1={center}
            y1={center}
            x2={center + Math.cos(point.angle) * maxRadius}
            y2={center + Math.sin(point.angle) * maxRadius}
            stroke="rgba(139, 92, 246, 0.15)"
            strokeWidth="1"
            className="opacity-50"
          />
        ))}
        
        {/* Data points */}
        {dataPoints.map((point, index) => (
          <g key={point.id}>
            {/* Pulsing circle */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill={point.color}
              className="opacity-20"
              animate={{
                r: [8, 12, 8],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3
              }}
            />
            
            {/* Main dot */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill={point.color}
              filter="url(#glow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                type: "spring",
                stiffness: 200
              }}
              className="cursor-pointer"
            />
            
            {/* Value label */}
            <motion.text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className="text-xs font-bold fill-white"
              initial={{ opacity: 0, y: point.y }}
              animate={{ opacity: 1, y: point.y - 15 }}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
            >
              {point.value}%
            </motion.text>
          </g>
        ))}
        
        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r="20"
          fill="rgba(139, 92, 246, 0.1)"
          stroke="rgba(139, 92, 246, 0.3)"
          strokeWidth="2"
        />
        
        {/* Center icon */}
        <text
          x={center}
          y={center + 5}
          textAnchor="middle"
          className="text-lg fill-purple-400"
        >
          ⚡
        </text>
      </svg>
      
      {/* Legend */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full">
        <div className="flex flex-wrap justify-center gap-4">
          {dataPoints.map((point, index) => (
            <motion.div
              key={`legend-${point.id}`}
              className="flex items-center gap-2 text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: point.color }}
              />
              <span className="text-gray-300 font-medium">
                {point.label}
              </span>
              {point.company && (
                <span className="text-gray-500">
                  ({point.company})
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}