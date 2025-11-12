'use client';

import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  ConnectionMode,
  BackgroundVariant,
} from 'reactflow';
import { WorkflowNode } from './WorkflowNode';
import { WorkflowTemplate, WorkflowNode as WorkflowNodeType } from '@/types/workflow';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import 'reactflow/dist/style.css';

interface WorkflowBuilderProps {
  template: WorkflowTemplate;
  isEditing?: boolean;
  onTemplateChange?: (template: WorkflowTemplate) => void;
  className?: string;
}

export function WorkflowBuilder({
  template,
  isEditing = false,
  onTemplateChange,
  className
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(template.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(template.edges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      custom: WorkflowNode,
    }),
    []
  );

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);

      if (onTemplateChange) {
        onTemplateChange({
          ...template,
          edges: newEdge
        });
      }
    },
    [edges, setEdges, template, onTemplateChange]
  );

  // Handle node selection
  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: WorkflowNodeType[] }) => {
      setSelectedNodes(nodes.map(node => node.id));
    },
    []
  );

  // Custom edge styling
  const defaultEdgeOptions = {
    style: {
      stroke: 'rgba(147, 51, 234, 0.6)',
      strokeWidth: 2,
    },
    type: 'smoothstep',
    animated: !isEditing,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden",
        "glass-elevated border border-white/10",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-purple-900/5 to-neutral-900" />

      {/* React Flow Container */}
      <div className="relative w-full h-full">
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              selected: selectedNodes.includes(node.id)
            }
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          proOptions={{ hideAttribution: true }}
        >
          {/* Custom Background */}
          <Background
            color="rgba(147, 51, 234, 0.1)"
            gap={20}
            size={1}
            variant={BackgroundVariant.Dots}
          />

          {/* Controls */}
          <Controls
            className="!bg-neutral-800/90 !border-white/10 !backdrop-blur-lg"
          />

          {/* Mini Map */}
          <MiniMap
            className="!bg-neutral-800/90 !border-white/10 !backdrop-blur-lg"
            nodeColor={(node) => {
              const nodeData = node.data as any;
              switch (nodeData.type) {
                case 'trigger': return '#10b981';
                case 'action': return '#3b82f6';
                case 'condition': return '#f59e0b';
                case 'integration': return '#8b5cf6';
                case 'output': return '#ec4899';
                default: return '#6366f1';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.3)"
          />
        </ReactFlow>
      </div>

      {/* Editing Mode Overlay */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 z-10"
          >
            <div className="glass-card px-3 py-2 border border-green-500/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300 font-medium">
                  Editing Mode
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Info Overlay */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-4 right-4 z-10"
      >
        <div className="glass-card p-4 border border-white/10 min-w-[240px]">
          <h3 className="font-semibold text-white mb-2">{template.name}</h3>
          <p className="text-sm text-gray-300 mb-3">{template.description}</p>

          {/* Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Automation Score</span>
              <span className="text-xs text-primary-400 font-semibold">
                {template.metrics.automationScore}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Time Savings</span>
              <span className="text-xs text-green-400 font-semibold">
                {template.metrics.timeSavings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">ROI</span>
              <span className="text-xs text-blue-400 font-semibold">
                {template.roi}
              </span>
            </div>
          </div>

          {/* Complexity Badge */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              template.complexity === 'beginner' && "bg-green-500/10 text-green-400 border border-green-500/20",
              template.complexity === 'intermediate' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
              template.complexity === 'advanced' && "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {template.complexity.charAt(0).toUpperCase() + template.complexity.slice(1)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Node Count Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-4 left-4 z-10"
      >
        <div className="glass-card px-3 py-2 border border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-300">{nodes.length} nodes</span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-gray-300">{edges.length} connections</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
