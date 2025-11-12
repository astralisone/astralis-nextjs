'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WorkflowTemplate } from '@/types/workflow';
import { WorkflowExporter, ExportOptions } from '@/utils/workflowExport';
import {
  Settings,
  Download,
  Image,
  FileText,
  Share2,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface WorkflowCustomizerProps {
  template: WorkflowTemplate;
  onTemplateChange: (template: WorkflowTemplate) => void;
  workflowElement: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function WorkflowCustomizer({
  template,
  onTemplateChange,
  workflowElement,
  isOpen,
  onClose,
  className
}: WorkflowCustomizerProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 1,
    includeMetrics: true,
    includeDescription: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'png' | 'json' | 'link') => {
    if (!workflowElement && (format === 'pdf' || format === 'png')) {
      return;
    }

    setIsExporting(true);
    setExportSuccess(null);

    try {
      const options = { ...exportOptions, format };
      const result = await WorkflowExporter.exportWorkflow(
        workflowElement!,
        template,
        options
      );

      setExportSuccess(format === 'link' ? 'Link copied to clipboard!' : `${format.toUpperCase()} exported successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      setExportSuccess(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportSuccess(null), 3000);
    }
  };

  const updateMetrics = (key: keyof typeof template.metrics, value: number) => {
    onTemplateChange({
      ...template,
      metrics: {
        ...template.metrics,
        [key]: value
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] overflow-auto",
              "glass-elevated border border-white/10 rounded-xl",
              className
            )}
          >
            {/* Header */}
            <div className="sticky top-0 glass-card border-b border-white/10 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Customize Workflow</h3>
                  <p className="text-sm text-gray-400">{template.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Export Options */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary-400" />
                  Export Options
                </h4>

                {/* Export Quality */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Export Quality</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[exportOptions.quality || 1]}
                      onValueChange={([value]) => setExportOptions(prev => ({ ...prev, quality: value }))}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Low</span>
                      <span>Quality: {Math.round((exportOptions.quality || 1) * 100)}%</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                {/* Export Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-metrics"
                      checked={exportOptions.includeMetrics}
                      onCheckedChange={(checked) =>
                        setExportOptions(prev => ({ ...prev, includeMetrics: checked }))
                      }
                    />
                    <Label htmlFor="include-metrics" className="text-sm text-gray-300">
                      Include Metrics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-description"
                      checked={exportOptions.includeDescription}
                      onCheckedChange={(checked) =>
                        setExportOptions(prev => ({ ...prev, includeDescription: checked }))
                      }
                    />
                    <Label htmlFor="include-description" className="text-sm text-gray-300">
                      Include Description
                    </Label>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleExport('png')}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Image className="w-4 h-4" />
                    Export PNG
                  </Button>
                  <Button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4" />
                    Export PDF
                  </Button>
                  <Button
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </Button>
                  <Button
                    onClick={() => handleExport('link')}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </Button>
                </div>

                {/* Export Status */}
                <AnimatePresence>
                  {exportSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg",
                        exportSuccess.includes('failed')
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : "bg-green-500/10 border border-green-500/20 text-green-400"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm">{exportSuccess}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Metrics Customization */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-400" />
                  Workflow Metrics
                </h4>

                <div className="space-y-6">
                  {/* Automation Score */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">
                      Automation Score: {template.metrics.automationScore}%
                    </Label>
                    <Slider
                      value={[template.metrics.automationScore]}
                      onValueChange={([value]) => updateMetrics('automationScore', value)}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Scalability */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">
                      Scalability Score: {template.metrics.scalability}%
                    </Label>
                    <Slider
                      value={[template.metrics.scalability]}
                      onValueChange={([value]) => updateMetrics('scalability', value)}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Time Savings */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Time Savings</Label>
                    <div className="glass-card p-3 rounded-lg">
                      <input
                        type="text"
                        value={template.metrics.timeSavings}
                        onChange={(e) => onTemplateChange({
                          ...template,
                          metrics: {
                            ...template.metrics,
                            timeSavings: e.target.value
                          }
                        })}
                        className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 border-none outline-none"
                        placeholder="e.g., 15 hours/week"
                      />
                    </div>
                  </div>

                  {/* Cost Reduction */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Cost Reduction</Label>
                    <div className="glass-card p-3 rounded-lg">
                      <input
                        type="text"
                        value={template.metrics.costReduction}
                        onChange={(e) => onTemplateChange({
                          ...template,
                          metrics: {
                            ...template.metrics,
                            costReduction: e.target.value
                          }
                        })}
                        className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 border-none outline-none"
                        placeholder="e.g., 60%"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Template Details</h4>
                <div className="glass-card p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Industry:</span>
                      <span className="text-white ml-2 capitalize">{template.industry}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Complexity:</span>
                      <span className="text-white ml-2 capitalize">{template.complexity}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Nodes:</span>
                      <span className="text-white ml-2">{template.nodes.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Connections:</span>
                      <span className="text-white ml-2">{template.edges.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
