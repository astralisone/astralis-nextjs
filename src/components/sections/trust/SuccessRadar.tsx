import React, { useState, useEffect } from 'react';
import { Trophy, Rocket, Star, Zap, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

const SuccessRadar = () => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { 
      id: 'satisfaction', 
      label: 'Client Satisfaction', 
      value: 97, 
      color: '#10B981', 
      company: 'TechCorp',
      position: { top: '15%', left: '50%' }
    },
    { 
      id: 'growth', 
      label: 'Revenue Growth', 
      value: 94, 
      color: '#3B82F6', 
      company: 'GrowthCo',
      position: { top: '35%', right: '15%' }
    },
    { 
      id: 'savings', 
      label: 'Time Savings', 
      value: 92, 
      color: '#F59E0B', 
      company: 'RetailPlus',
      position: { top: '35%', left: '15%' }
    },
    { 
      id: 'accuracy', 
      label: 'Process Accuracy', 
      value: 94, 
      color: '#8B5CF6', 
      company: 'ConsultingFirm',
      position: { bottom: '25%', right: '25%' }
    },
    { 
      id: 'roi', 
      label: 'ROI Achievement', 
      value: 89, 
      color: '#F97316', 
      company: 'GrowthCo',
      position: { bottom: '35%', left: '35%' }
    },
    { 
      id: 'efficiency', 
      label: 'Team Efficiency', 
      value: 88, 
      color: '#EF4444', 
      company: 'ScaleUp',
      position: { bottom: '15%', left: '50%' }
    }
  ];

  const stats = [
    { icon: Rocket, label: 'Implementations', value: '312', color: '#3B82F6' },
    { icon: Clock, label: 'Avg Time to ROI', value: '6 weeks', color: '#8B5CF6' },
    { icon: Trophy, label: 'Client Retention', value: '97%', color: '#10B981' },
    { icon: DollarSign, label: 'Total Savings', value: '$156M', color: '#F59E0B' }
  ];

  const MetricDot = ({ metric, index }: { metric: typeof metrics[0], index: number }) => {
    const isHovered = hoveredMetric === metric.id;
    const baseSize = 16;
    const hoverSize = 24;
    
    return (
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
          animationComplete ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          ...metric.position,
          animationDelay: `${index * 150}ms`
        }}
        onMouseEnter={() => setHoveredMetric(metric.id)}
        onMouseLeave={() => setHoveredMetric(null)}
      >
        {/* Pulse effect */}
        <div 
          className={`absolute inset-0 rounded-full animate-ping ${
            isHovered ? 'opacity-75' : 'opacity-0'
          }`}
          style={{ 
            backgroundColor: metric.color,
            width: hoverSize,
            height: hoverSize,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Main dot */}
        <div
          className={`rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
            isHovered ? 'scale-125' : 'scale-100'
          }`}
          style={{
            backgroundColor: metric.color,
            width: isHovered ? hoverSize : baseSize,
            height: isHovered ? hoverSize : baseSize,
            boxShadow: `0 0 20px ${metric.color}40, 0 4px 12px rgba(0,0,0,0.15)`
          }}
        />
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-fadeIn">
            <div className="font-semibold">{metric.value}%</div>
            <div className="text-gray-300">{metric.label}</div>
            <div className="text-xs text-gray-400">({metric.company})</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 font-medium">Live Success Metrics</span>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Gregs Client Success Radar
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Real-time results from our Revenue Operations deployments across industries
        </p>
      </div>

      {/* Main Radar */}
      <div className="relative max-w-4xl mx-auto mb-16">
        {/* Background circles */}
        <div className="relative w-full aspect-square max-w-2xl mx-auto">
          {[1, 2, 3].map((ring) => (
            <div
              key={ring}
              className="absolute border border-gray-700/30 rounded-full"
              style={{
                width: `${ring * 33.33}%`,
                height: `${ring * 33.33}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Center metric */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                97%
              </div>
              <div className="text-gray-300 font-medium">Client Satisfaction</div>
            </div>
          </div>

          {/* Metric dots */}
          {metrics.map((metric, index) => (
            <MetricDot key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </div>

      {/* Live Updates */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Live Updates</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="text-gray-300">
            <span className="w-2 h-2 bg-gray-500 rounded-full inline-block mr-2" />
            AI system prevented $45K in attribution losses today
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="text-center max-w-2xl mx-auto">
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-white transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-green-500/25 mb-6">
          <Users className="w-5 h-5" />
          Join 312 successful companies
        </button>
        
        <p className="text-xl text-gray-300 mb-8">
          See how Revenue Operations can transform your business metrics
        </p>
        
        <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-2xl font-semibold text-white transition-all duration-300 hover:transform hover:scale-105 shadow-xl hover:shadow-purple-500/25">
          <span className="flex items-center gap-2">
            Schedule Success Review
            <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SuccessRadar;