'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  ArrowRight,
  CheckCircle2,
  Clock,
  Settings
} from 'lucide-react';

interface DemoStep {
  id: number;
  text: string;
  automated: boolean;
}

interface DemoScenario {
  title: string;
  description: string;
  steps: DemoStep[];
}

interface InteractiveDemoProps {
  scenarios: Record<string, DemoScenario>;
  activeScenario: string;
  onScenarioChange: (scenario: string) => void;
}

export function InteractiveDemo({
  scenarios,
  activeScenario,
  onScenarioChange
}: InteractiveDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);

  const scenario = scenarios[activeScenario];

  const playDemo = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentStep(-1);
      setProgress(0);
      return;
    }

    setIsPlaying(true);
    setCurrentStep(0);

    scenario.steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        setProgress(((index + 1) / scenario.steps.length) * 100);

        if (index === scenario.steps.length - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setCurrentStep(-1);
            setProgress(0);
          }, 1500);
        }
      }, index * 1200);
    });
  };

  useEffect(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentStep(-1);
      setProgress(0);
    }
  }, [activeScenario]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Scenario Selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {Object.entries(scenarios).map(([key, scenario]) => (
          <button
            key={key}
            onClick={() => onScenarioChange(key)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-300",
              "border glass-card hover:scale-105",
              activeScenario === key
                ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                : "border-white/20 text-gray-300 hover:border-purple-500/30"
            )}
          >
            {scenario.title}
          </button>
        ))}
      </div>

      {/* Demo Container */}
      <div className="glass-elevated rounded-3xl p-8 lg:p-12">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-4">{scenario.title}</h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {scenario.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-400">
            {isPlaying ? `Step ${currentStep + 1} of ${scenario.steps.length}` : 'Ready to start'}
          </div>
        </div>

        {/* Demo Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Steps Flow */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold mb-6 text-center">Process Flow</h4>
            {scenario.steps.map((step, index) => {
              const isActive = currentStep >= index;
              const isCurrent = currentStep === index;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    scale: isCurrent ? 1.05 : isActive ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                    isCurrent
                      ? "border-purple-500/50 bg-purple-500/10"
                      : isActive
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-gray-700 bg-gray-800/50"
                  )}
                >
                  {/* Step Number/Status */}
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold",
                    isCurrent
                      ? "border-purple-500 bg-purple-500/20 text-purple-300 animate-pulse"
                      : isActive
                        ? "border-green-500 bg-green-500/20 text-green-300"
                        : "border-gray-600 text-gray-400"
                  )}>
                    {isActive && !isCurrent ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Settings className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-medium",
                        isCurrent ? "text-purple-300" : isActive ? "text-green-300" : "text-gray-300"
                      )}>
                        {step.text}
                      </span>
                      {step.automated && (
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.automated ? 'Automated process' : 'Manual input required'}
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < scenario.steps.length - 1 && (
                    <ArrowRight className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-green-400" : "text-gray-600"
                    )} />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Visual Demo Area */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-gray-700">
            <h4 className="text-xl font-bold mb-6 text-center">Live Preview</h4>
            <div className="min-h-[300px] flex items-center justify-center">
              {!isPlaying ? (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Play className="w-12 h-12 text-purple-400" />
                  </div>
                  <p className="text-gray-400">Click play to start the demo</p>
                </div>
              ) : (
                <div className="w-full">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <Settings className="w-10 h-10 text-white" />
                    </div>
                    <h5 className="text-lg font-bold text-purple-300 mb-2">
                      {scenario.steps[currentStep]?.text}
                    </h5>
                    <p className="text-sm text-gray-400">
                      Processing step {currentStep + 1} of {scenario.steps.length}
                    </p>

                    {/* Animated progress indicator */}
                    <div className="mt-6 flex justify-center space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Play Button */}
        <div className="text-center">
          <button
            onClick={playDemo}
            className={cn(
              "inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300",
              "glass-elevated hover:scale-105 border",
              isPlaying
                ? "border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                : "border-purple-500/50 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6" />
                Stop Demo
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Start Demo
              </>
            )}
          </button>
        </div>

        {/* Demo Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 glass-card rounded-xl">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {scenario.steps.filter(s => s.automated).length}
            </div>
            <div className="text-sm text-gray-400">Automated Steps</div>
          </div>
          <div className="text-center p-4 glass-card rounded-xl">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {scenario.steps.length}
            </div>
            <div className="text-sm text-gray-400">Total Steps</div>
          </div>
          <div className="text-center p-4 glass-card rounded-xl">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {Math.round((scenario.steps.filter(s => s.automated).length / scenario.steps.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Automation</div>
          </div>
          <div className="text-center p-4 glass-card rounded-xl">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              ~{scenario.steps.length * 1.2}s
            </div>
            <div className="text-sm text-gray-400">Demo Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
