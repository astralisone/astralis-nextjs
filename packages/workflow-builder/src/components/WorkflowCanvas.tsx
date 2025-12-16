import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from 'reactflow';
import { WorkflowNode, WorkflowEdge } from '../types';
import { createNodeComponent } from './nodes/NodeFactory';

// Import node types
// CSS should be imported by the consuming application

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeDelete: (nodeId: string) => void;
  readOnly?: boolean;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onNodeDelete,
  readOnly = false,
}: WorkflowCanvasProps) {
  // Create node types mapping
  const nodeTypes = useMemo(() => ({
    trigger: createNodeComponent('trigger'),
    action: createNodeComponent('action'),
    logic: createNodeComponent('logic'),
    data: createNodeComponent('data'),
    integration: createNodeComponent('integration'),
    output: createNodeComponent('output'),
  }), []);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeSelect(node.id);
  }, [onNodeSelect]);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Handle node delete
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    nodesToDelete.forEach(node => onNodeDelete(node.id));
  }, [onNodeDelete]);

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        className="bg-slate-50 dark:bg-slate-900"
      >
        <Controls
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          showZoom
          showFitView
          showInteractive={!readOnly}
        />

        <MiniMap
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger': return '#10b981'; // green
              case 'action': return '#3b82f6'; // blue
              case 'logic': return '#f59e0b'; // amber
              case 'data': return '#8b5cf6'; // purple
              case 'integration': return '#ef4444'; // red
              case 'output': return '#6b7280'; // gray
              default: return '#6b7280';
            }
          }}
        />

        <Background
          variant={BackgroundVariant.Dots}
          gap={15}
          size={1}
          color="#94a3b8"
        />
      </ReactFlow>
    </div>
  );
}