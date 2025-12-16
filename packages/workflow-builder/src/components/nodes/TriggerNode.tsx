import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData } from '../../types';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface BaseNodeProps extends NodeProps<WorkflowNodeData> {
  className?: string;
  icon: React.ReactNode;
  color: string;
}

function BaseNode({ data, selected, className, icon, color, children }: BaseNodeProps & { children?: React.ReactNode }) {
  return (
    <div className={className}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1 rounded ${color}`}>
          {icon}
        </div>
        <div className="font-semibold text-sm truncate">
          {data.n8nDefinition?.displayName || 'Node'}
        </div>
        {data.isConfigured ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-500" />
        )}
      </div>

      {children}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export function TriggerNode(props: NodeProps<WorkflowNodeData>) {
  return (
    <BaseNode {...props} icon={<Zap className="w-4 h-4 text-white" />} color="bg-green-500">
      <div className="text-xs text-slate-600 dark:text-slate-300">
        Triggers workflow execution
      </div>
    </BaseNode>
  );
}