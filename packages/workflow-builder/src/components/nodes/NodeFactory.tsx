import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData, NodeType } from '../../types';
import { TriggerNode } from './TriggerNode';
import { ActionNode } from './ActionNode';
import { LogicNode } from './LogicNode';
import { DataNode } from './DataNode';
import { IntegrationNode } from './IntegrationNode';
import { OutputNode } from './OutputNode';

export function createNodeComponent(type: NodeType) {
  return function NodeComponent(props: NodeProps<WorkflowNodeData>) {
    const { data, selected } = props;

    // Common node styling
    const baseClasses = `
      px-4 py-2 shadow-lg rounded-lg border-2 transition-all duration-200
      ${selected
        ? 'border-blue-500 shadow-blue-200 dark:shadow-blue-900'
        : 'border-slate-300 dark:border-slate-600'
      }
      ${data.isConfigured
        ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700'
        : 'bg-white dark:bg-slate-800'
      }
    `;

    switch (type) {
      case 'trigger':
        return <TriggerNode {...props} className={baseClasses} />;
      case 'action':
        return <ActionNode {...props} className={baseClasses} />;
      case 'logic':
        return <LogicNode {...props} className={baseClasses} />;
      case 'data':
        return <DataNode {...props} className={baseClasses} />;
      case 'integration':
        return <IntegrationNode {...props} className={baseClasses} />;
      case 'output':
        return <OutputNode {...props} className={baseClasses} />;
      default:
        return <DefaultNode {...props} className={baseClasses} />;
    }
  };
}

// Fallback default node
function DefaultNode({ data, className }: NodeProps<WorkflowNodeData> & { className?: string }) {
  return (
    <div className={className}>
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold text-sm">{data.n8nDefinition?.displayName || 'Unknown Node'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}