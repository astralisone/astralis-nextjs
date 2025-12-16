import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowCanvas } from './WorkflowCanvas';
import { NodePalette } from './NodePalette';
import { PropertyPanel } from './PropertyPanel';
import { useWorkflowBuilder } from '../hooks/useWorkflowBuilder';
import { validateWorkflow } from '../utils/validation';
import type {
  WorkflowBuilderProps,
  WorkflowData,
  WorkflowNode,
  N8nNodeDefinition,
  ValidationResult
} from '../types';

import 'reactflow/dist/style.css';

export function WorkflowBuilder({
  initialWorkflow,
  availableNodes,
  onWorkflowChange,
  onValidate,
  onSave,
  onDeploy,
  readOnly = false,
  className = '',
}: WorkflowBuilderProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const {
    workflow,
    nodes,
    edges,
    selectedNode,
    isValidating,
    validationResult,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    selectNode,
    validateWorkflow: validateWorkflowHook,
    saveWorkflow,
    deployWorkflow,
    resetWorkflow,
  } = useWorkflowBuilder({
    initialWorkflow,
    availableNodes,
    onWorkflowChange,
  });

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    selectNode(nodeId);
  }, [selectNode]);

  // Handle validation
  const handleValidate = useCallback(async () => {
    await validateWorkflowHook();

    if (onValidate) {
      const customValidation = await onValidate(workflow);
      // Merge with internal validation
    }
  }, [validateWorkflowHook, onValidate, workflow]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (onSave) {
      await onSave(workflow);
    } else {
      await saveWorkflow();
    }
  }, [onSave, workflow, saveWorkflow]);

  // Handle deploy
  const handleDeploy = useCallback(async () => {
    if (onDeploy) {
      await onDeploy(workflow);
    } else {
      await deployWorkflow();
    }
  }, [onDeploy, workflow, deployWorkflow]);

  return (
    <div className={`flex h-full bg-slate-50 dark:bg-slate-900 ${className}`}>
      {/* Node Palette - Left Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <NodePalette
          availableNodes={availableNodes}
          onNodeAdd={(type, position) => addNode(type, position)}
          readOnly={readOnly}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        <ReactFlowProvider>
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => {
              // Handle node position/size changes
              changes.forEach(change => {
                if (change.type === 'position' && change.position) {
                  updateNode(change.id, { position: change.position });
                }
              });
            }}
            onEdgesChange={(changes) => {
              // Handle edge changes
              changes.forEach(change => {
                if (change.type === 'remove') {
                  deleteEdge(change.id);
                }
              });
            }}
            onConnect={(connection) => {
              addEdge(connection.source!, connection.target!);
            }}
            onNodeSelect={handleNodeSelect}
            onNodeDelete={(nodeId) => deleteNode(nodeId)}
            readOnly={readOnly}
          />
        </ReactFlowProvider>
      </div>

      {/* Property Panel - Right Sidebar */}
      <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <PropertyPanel
          selectedNode={selectedNode}
          onNodeUpdate={(nodeId, updates) => updateNode(nodeId, updates)}
          onValidate={handleValidate}
          onSave={handleSave}
          onDeploy={handleDeploy}
          validationResult={validationResult}
          isValidating={isValidating}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}