import { useState, useCallback, useEffect } from 'react';
import { WorkflowData, WorkflowNode, WorkflowEdge, N8nNodeDefinition, UseWorkflowBuilderReturn, ValidationResult } from '../types';
import { validateWorkflow } from '../utils/validation';

interface UseWorkflowBuilderOptions {
  initialWorkflow?: WorkflowData;
  availableNodes: N8nNodeDefinition[];
  onWorkflowChange?: (workflow: WorkflowData) => void;
}

export function useWorkflowBuilder({
  initialWorkflow,
  availableNodes,
  onWorkflowChange,
}: UseWorkflowBuilderOptions): UseWorkflowBuilderReturn {
  const [workflow, setWorkflow] = useState<WorkflowData>(
    initialWorkflow || {
      name: 'New Workflow',
      description: '',
      nodes: [],
      edges: [],
    }
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Notify parent of changes
  useEffect(() => {
    onWorkflowChange?.(workflow);
  }, [workflow, onWorkflowChange]);

  // Convert workflow to React Flow format
  const nodes: WorkflowNode[] = workflow.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  }));

  const edges: WorkflowEdge[] = workflow.edges;

  const selectedNode = selectedNodeId ? workflow.nodes.find(n => n.id === selectedNodeId) || null : null;

  // Actions
  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const nodeDefinition = availableNodes.find(n => n.category === type) || availableNodes[0];

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as any,
      position,
      data: {
        n8nDefinition: nodeDefinition,
        properties: {},
        isConfigured: false,
      },
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  }, [availableNodes]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
    }));
    setSelectedNodeId(null);
  }, []);

  const addEdge = useCallback((sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
    };

    setWorkflow(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));
  }, []);

  const deleteEdge = useCallback((edgeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => edge.id !== edgeId),
    }));
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const validateWorkflowHook = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateWorkflow(workflow);
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [workflow]);

  const saveWorkflow = useCallback(async () => {
    // This would typically call an API to save the workflow
    console.log('Saving workflow:', workflow);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, [workflow]);

  const deployWorkflow = useCallback(async () => {
    // This would typically call an API to deploy the workflow to n8n
    console.log('Deploying workflow:', workflow);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, [workflow]);

  const resetWorkflow = useCallback(() => {
    setWorkflow({
      name: 'New Workflow',
      description: '',
      nodes: [],
      edges: [],
    });
    setSelectedNodeId(null);
    setValidationResult(null);
  }, []);

  return {
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
  };
}