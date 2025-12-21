'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Activity,
  ArrowUpRight
} from 'lucide-react';

export function InteractivePipelineHero() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const stats = [
    { label: 'Avg Speed', value: '4.2m', icon: Zap, color: 'text-amber-400', trend: '+12%' },
    { label: 'Active Users', value: '1,284', icon: Users, color: 'text-blue-400', trend: '+5%' },
    { label: 'Task Success', value: '99.2%', icon: BarChart3, color: 'text-emerald-400', trend: '+0.4%' },
    { label: 'AI Decisions', value: '48.5k', icon: Activity, color: 'text-purple-400', trend: '+24%' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Main Visual Board */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 relative group overflow-hidden"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
            >
              {/* Highlight Glow */}
              <div className="absolute -inset-px bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between relative z-10">
                <div className={`p-2 rounded-lg bg-slate-950/50 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>

              <div className="mt-4 relative z-10">
                <div className="text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>

              {/* Mini Sparkline Visualization */}
              <div className="mt-4 h-8 flex items-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                {[...Array(12)].map((_, j) => (
                  <motion.div
                    key={j}
                    className="flex-1 bg-current"
                    style={{ color: i === 0 ? '#FBBF24' : i === 1 ? '#60A5FA' : i === 2 ? '#34D399' : '#A78BFA' }}
                    animate={{
                      height: hoveredIndex === i 
                        ? [Math.random() * 100 + '%', Math.random() * 100 + '%'] 
                        : '30%'
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: hoveredIndex === i ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Console Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-slate-500 shadow-inner">
        <div className="flex items-center gap-2 mb-2 text-slate-400 border-b border-slate-800 pb-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="ml-2">ASTRALIS_TERMINAL_V1.0.4</span>
        </div>
        <div className="space-y-1">
          <p className="text-blue-400"># Initializing agentic_orchestrator...</p>
          <p># Checking integration health: [GMAIL: OK] [SLACK: OK] [QB: OK]</p>
          <p className="text-emerald-400">&gt; New task received: doc_ocr_extraction (ID: d_4821)</p>
          <p className="animate-pulse">&gt; Processing with GPT-4o-mini... thinking...</p>
        </div>
      </div>
    </div>
  );
}
