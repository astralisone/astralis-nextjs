'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { WorkflowNodeData, WorkflowNodeType } from '@/types/workflow';
import {
  Play,
  Settings,
  Zap,
  Share2,
  Download,
  Puzzle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const nodeTypeConfig = {
  trigger: {
    icon: Play,
    gradient: 'from-green-500 to-emerald-600',
    border: 'border-green-500/50',
    glow: 'shadow-green-500/20',
  },
  action: {
    icon: Settings,
    gradient: 'from-blue-500 to-cyan-600',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20',
  },
  condition: {
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-600',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/20',
  },
  integration: {
    icon: Share2,
    gradient: 'from-purple-500 to-violet-600',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/20',
  },
  output: {
    icon: Download,
    gradient: 'from-pink-500 to-rose-600',
    border: 'border-pink-500/50',
    glow: 'shadow-pink-500/20',
  },
  custom: {
    icon: Puzzle,
    gradient: 'from-indigo-500 to-purple-600',
    border: 'border-indigo-500/50',
    glow: 'shadow-indigo-500/20',
  },
};

interface WorkflowNodeProps extends NodeProps {
  data: WorkflowNodeData;
}

export const WorkflowNode = memo(({ data, selected }: WorkflowNodeProps) => {
  const config = nodeTypeConfig[data.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      className="workflow-node"
    >
      {/* Input Handles */}
      {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-gray-600 !border-2 !border-white/20 hover:!border-primary-400 transition-colors"
        />
      )}

      {/* Node Container */}
      <div
        className={cn(
          "relative min-w-[180px] rounded-xl transition-all duration-300",
          "glass-card backdrop-blur-lg border",
          selected ? [
            config.border,
            "shadow-lg",
            config.glow
          ] : [
            "border-white/10",
            "hover:border-white/20"
          ],
          "group cursor-pointer"
        )}
      >
        {/* Background Gradient */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl opacity-5",
            `bg-gradient-to-br ${config.gradient}`,
            selected && "opacity-10"
          )}
        />

        {/* Header */}
        <div className="relative p-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300",
              `bg-gradient-to-br ${config.gradient}`,
              "text-white shadow-lg"
            )}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-white truncate">
                {data.label}
              </h4>
              <p className="text-xs text-gray-400 capitalize">
                {data.type.replace('-', ' ')}
              </p>
            </div>

            {/* Status Indicator */}
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative p-3">
          {data.description && (
            <p className="text-xs text-gray-300 mb-2 line-clamp-2">
              {data.description}
            </p>
          )}

          {/* Integrations */}
          {data.integrations && data.integrations.length > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-gray-400">Integrations:</span>
              <div className="flex gap-1">
                {data.integrations.slice(0, 3).map((integration, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded bg-gray-700 border border-white/10 flex items-center justify-center"
                  >
                    <span className="text-[8px] text-gray-300 font-mono">
                      {integration.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                ))}
                {data.integrations.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{data.integrations.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customizable Badge */}
          {data.isCustomizable && (
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
              <span className="text-xs text-primary-400 font-medium">
                Customizable
              </span>
            </div>
          )}
        </div>

        {/* Hover Effect */}
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          `bg-gradient-to-br ${config.gradient}`
        )} />
      </div>

      {/* Output Handles */}
      {data.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-gray-600 !border-2 !border-white/20 hover:!border-primary-400 transition-colors"
        />
      )}

      {/* Side handles for conditions */}
      {data.type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white/20"
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!w-3 !h-3 !bg-red-500 !border-2 !border-white/20"
            style={{ top: '70%' }}
          />
        </>
      )}
    </motion.div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
