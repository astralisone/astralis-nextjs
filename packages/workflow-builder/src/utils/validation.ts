import { WorkflowData, ValidationResult } from '../types';

export async function validateWorkflow(workflow: WorkflowData): Promise<ValidationResult> {
  const errors: ValidationResult['errors'] = [];

  // Check if workflow has a name
  if (!workflow.name || workflow.name.trim() === '') {
    errors.push({
      message: 'Workflow must have a name',
      severity: 'error',
    });
  }

  // Check if workflow has at least one node
  if (workflow.nodes.length === 0) {
    errors.push({
      message: 'Workflow must have at least one node',
      severity: 'error',
    });
  }

  // Check for trigger nodes
  const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push({
      message: 'Workflow must have at least one trigger node',
      severity: 'warning',
    });
  }

  // Check for orphaned nodes (nodes not connected to anything)
  const connectedNodeIds = new Set<string>();
  workflow.edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  workflow.nodes.forEach(node => {
    if (!connectedNodeIds.has(node.id)) {
      errors.push({
        nodeId: node.id,
        message: `Node "${node.data.n8nDefinition?.displayName || node.id}" is not connected`,
        severity: 'warning',
      });
    }
  });

  // Check for required properties
  workflow.nodes.forEach(node => {
    if (node.data.n8nDefinition?.properties) {
      node.data.n8nDefinition.properties.forEach(prop => {
        if (prop.required) {
          const value = node.data.properties[prop.name];
          if (value === undefined || value === null || value === '') {
            errors.push({
              nodeId: node.id,
              message: `Required property "${prop.displayName}" is not set`,
              severity: 'error',
            });
          }
        }
      });
    }
  });

  // Check for cycles in the workflow
  const hasCycles = detectCycles(workflow);
  if (hasCycles) {
    errors.push({
      message: 'Workflow contains cycles (circular dependencies)',
      severity: 'error',
    });
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

function detectCycles(workflow: WorkflowData): boolean {
  const adjList: Record<string, string[]> = {};
  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};

  // Build adjacency list
  workflow.nodes.forEach(node => {
    adjList[node.id] = [];
  });

  workflow.edges.forEach(edge => {
    if (adjList[edge.source]) {
      adjList[edge.source].push(edge.target);
    }
  });

  // DFS to detect cycles
  function hasCycle(nodeId: string): boolean {
    if (recStack[nodeId]) return true;
    if (visited[nodeId]) return false;

    visited[nodeId] = true;
    recStack[nodeId] = true;

    for (const neighbor of adjList[nodeId] || []) {
      if (hasCycle(neighbor)) return true;
    }

    recStack[nodeId] = false;
    return false;
  }

  for (const nodeId of Object.keys(adjList)) {
    if (hasCycle(nodeId)) return true;
  }

  return false;
}