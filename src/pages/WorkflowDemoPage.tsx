import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';
import { Industry, IndustrySelector } from '@/components/ui/industry-selector';
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder';
import { WorkflowCustomizer } from '@/components/workflow/WorkflowCustomizer';
import { IntegrationShowcase } from '@/components/workflow/IntegrationShowcase';
import { WorkflowTemplate } from '@/types/workflow';
import { getTemplatesByIndustry, integrations } from '@/data/workflowTemplates';
import { WorkflowExporter } from '@/utils/workflowExport';
import {
  Play,
  Pause as PauseIcon,
  Settings as CogIcon,
  Eye as EyeIcon,
  Pencil,
  RefreshCw as ArrowPathIcon,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function WorkflowDemoPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('saas');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'demo' | 'builder' | 'integrations'>('demo');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const workflowRef = useRef<HTMLDivElement>(null);
  const [shareId, setShareId] = useState<string | null>(null);

  // Get templates for selected industry
  const templates = getTemplatesByIndustry(selectedIndustry);

  // Load shared workflow if shareId is provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const share = urlParams.get('share');
    
    if (share) {
      const sharedTemplate = WorkflowExporter.loadSharedWorkflow(share);
      if (sharedTemplate) {
        setSelectedTemplate(sharedTemplate);
        setSelectedIndustry(sharedTemplate.industry as Industry);
        setShareId(share);
      }
    }
  }, []);

  // Auto-select first template when industry changes
  useEffect(() => {
    if (templates.length > 0 && !shareId) {
      setSelectedTemplate(templates[0]);
    }
  }, [selectedIndustry, templates, shareId]);

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsPlaying(false);
  };

  const handleTemplateChange = (updatedTemplate: WorkflowTemplate) => {
    setSelectedTemplate(updatedTemplate);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetWorkflow = () => {
    if (selectedTemplate && templates.length > 0) {
      const originalTemplate = templates.find(t => t.id === selectedTemplate.id);
      if (originalTemplate) {
        setSelectedTemplate(originalTemplate);
        setIsPlaying(false);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Interactive Workflow Demo - Astralis Agency</title>
        <meta name="description" content="Experience our custom workflow automation builder with industry-specific templates, drag-and-drop functionality, and powerful integrations." />
      </Helmet>

      <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-purple-900/10 to-neutral-900" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 pt-24 pb-12"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary-500/20">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-300">Interactive Demo</span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Custom Workflow
              <span className="block bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                Demo Builder
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Experience our interactive workflow builder with industry-specific templates, 
              drag-and-drop functionality, and powerful integrations.
            </motion.p>

            {/* Industry Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <IndustrySelector
                value={selectedIndustry}
                onChange={setSelectedIndustry}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 pb-24">
            {/* Template Selector */}
            {templates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mb-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Choose a Template
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={cn(
                        "glass-card border rounded-xl p-6 cursor-pointer transition-all duration-300",
                        selectedTemplate?.id === template.id
                          ? "border-primary-500/50 shadow-lg shadow-primary-500/20"
                          : "border-white/10 hover:border-white/20"
                      )}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-white">{template.name}</h4>
                          <Badge
                            variant={
                              template.complexity === 'beginner' ? 'default' :
                              template.complexity === 'intermediate' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {template.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{template.roi}</span>
                          <span>{template.estimatedTime}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Controls */}
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mb-6"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* View Mode Selector */}
                  <div className="flex items-center glass-card border border-white/10 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'demo' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('demo')}
                      className="px-3 py-1 text-sm"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Demo
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'builder' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('builder')}
                      className="px-3 py-1 text-sm"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Builder
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'integrations' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('integrations')}
                      className="px-3 py-1 text-sm"
                    >
                      Integrations
                    </Button>
                  </div>

                  {/* Workflow Controls */}
                  {viewMode !== 'integrations' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={togglePlayback}
                        className="flex items-center gap-2"
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetWorkflow}
                        className="flex items-center gap-2"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCustomizer(true)}
                        className="flex items-center gap-2"
                      >
                        <CogIcon className="w-4 h-4" />
                        Customize
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Workflow Display */}
            <AnimatePresence mode="wait">
              {selectedTemplate && (
                <motion.div
                  key={`${selectedTemplate.id}-${viewMode}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {viewMode === 'integrations' ? (
                    <div className="space-y-8">
                      <IntegrationShowcase
                        integrations={integrations}
                        selectedIntegrations={selectedTemplate.integrations.map(i => i.id)}
                      />
                    </div>
                  ) : (
                    <div 
                      ref={workflowRef}
                      className="h-[600px] w-full rounded-xl overflow-hidden"
                    >
                      <WorkflowBuilder
                        template={selectedTemplate}
                        isEditing={viewMode === 'builder'}
                        onTemplateChange={handleTemplateChange}
                        className="h-full"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Template Features */}
            {selectedTemplate && viewMode !== 'integrations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Features */}
                <div className="glass-card border border-white/10 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">Key Features</h4>
                  <div className="space-y-2">
                    {selectedTemplate.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="glass-card border border-white/10 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">Expected Results</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-400">
                        {selectedTemplate.metrics.automationScore}%
                      </div>
                      <div className="text-xs text-gray-400">Automation Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {selectedTemplate.metrics.timeSavings}
                      </div>
                      <div className="text-xs text-gray-400">Time Savings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {selectedTemplate.metrics.costReduction}
                      </div>
                      <div className="text-xs text-gray-400">Cost Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {selectedTemplate.metrics.scalability}%
                      </div>
                      <div className="text-xs text-gray-400">Scalability</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Customizer Modal */}
        {selectedTemplate && (
          <WorkflowCustomizer
            template={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            workflowElement={workflowRef.current}
            isOpen={showCustomizer}
            onClose={() => setShowCustomizer(false)}
          />
        )}
      </div>
    </>
  );
}