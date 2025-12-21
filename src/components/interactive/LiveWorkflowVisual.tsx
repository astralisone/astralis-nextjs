'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Search, 
  Mail, 
  Calendar,
  Layers
} from 'lucide-react';

const workflowSteps = [
  { id: 'intake', icon: Mail, label: 'Intake', color: '#3B82F6' },
  { id: 'ocr', icon: Search, label: 'OCR Extraction', color: '#8B5CF6' },
  { id: 'ai', icon: Cpu, label: 'AI Classification', color: '#EC4899' },
  { id: 'routing', icon: Layers, label: 'Intelligent Routing', color: '#F59E0B' },
  { id: 'action', icon: Zap, label: 'Automated Action', color: '#10B981' },
  { id: 'complete', icon: CheckCircle2, label: 'Resolved', color: '#059669' },
];

export function LiveWorkflowVisual() {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((current) => (current + 1) % workflowSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 relative overflow-hidden">
      {/* Background Particles Simulation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-astralis-blue/20 rounded-full"
            animate={{
              x: [Math.random() * 400, Math.random() * 400],
              y: [Math.random() * 300, Math.random() * 300],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-3 relative">
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center relative z-10"
                    animate={{
                      backgroundColor: isActive ? step.color : isCompleted ? '#1e293b' : '#0f172a',
                      borderColor: isActive ? step.color : isCompleted ? '#334155' : '#1e293b',
                      scale: isActive ? 1.1 : 1,
                      boxShadow: isActive ? `0 0 20px ${step.color}40` : 'none',
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ border: '2px solid' }}
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-colors duration-500",
                      isActive ? "text-white" : isCompleted ? "text-slate-400" : "text-slate-600"
                    )} />
                    
                    {/* Active pulse effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ border: `2px solid ${step.color}` }}
                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  
                  <motion.span 
                    className="text-[10px] font-bold uppercase tracking-wider text-center"
                    animate={{ 
                      color: isActive ? '#f8fafc' : '#64748b',
                      opacity: isActive ? 1 : 0.6 
                    }}
                  >
                    {step.label}
                  </motion.span>
                </div>

                {/* Connection Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block flex-1 h-px bg-slate-800 relative min-w-[20px]">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-astralis-blue to-transparent"
                      initial={{ left: '-100%' }}
                      animate={isActive ? { left: '100%' } : { left: '-100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Status Card Below */}
        <motion.div 
          className="mt-12 bg-slate-950/80 border border-slate-800 rounded-xl p-6 shadow-2xl"
          layout
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-500">AGENT ACTIVE</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                  Thread ID: {Math.random().toString(36).substring(2, 10)}
                </span>
              </div>
              
              <h4 className="text-white font-semibold mb-2">
                Processing: {workflowSteps[activeStep].label}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {getStepDescription(activeStep)}
              </p>
              
              <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-astralis-blue"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function getStepDescription(step: number) {
  const descriptions = [
    "Omnichannel intake monitor detected a new customer inquiry via Gmail integration. Payload extraction initiated.",
    "Tesseract OCR engine performing document layout analysis and text layer extraction from PDF attachment.",
    "GPT-4o classification agent analyzing semantic intent and extracting structured metadata from request body.",
    "Intelligent router matching intent to SALES pipeline. Identifying best-available operator based on capacity.",
    "Workflow engine triggering n8n sequence for CRM sync and automated response generation.",
    "Task lifecycle complete. Handed off to human operator for final review in the Dashboard console."
  ];
  return descriptions[step];
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
