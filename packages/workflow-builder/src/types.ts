import { Node, Edge } from 'reactflow';

// Base workflow node types
export type NodeType =
  | 'trigger'
  | 'action'
  | 'logic'
  | 'data'
  | 'integration'
  | 'output';

// n8n-compatible node definition
export interface N8nNodeDefinition {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  properties: N8nNodeProperty[];
  inputs?: number;
  outputs?: number;
}

// n8n node property definition
export interface N8nNodeProperty {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'json';
  default?: any;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  description?: string;
}

// Workflow node data
export interface WorkflowNodeData {
  n8nDefinition?: N8nNodeDefinition;
  properties: Record<string, any>;
  isConfigured: boolean;
  errors?: string[];
}

// React Flow compatible node
export interface WorkflowNode extends Node {
  type: NodeType;
  data: WorkflowNodeData;
}

// React Flow compatible edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

// Complete workflow data
export interface WorkflowData {
  id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings?: {
    timezone?: string;
    errorWorkflow?: string;
    maxConcurrency?: number;
  };
}

// Main component props
export interface WorkflowBuilderProps {
  initialWorkflow?: WorkflowData;
  availableNodes: N8nNodeDefinition[];
  onWorkflowChange?: (workflow: WorkflowData) => void;
  onValidate?: (workflow: WorkflowData) => Promise<ValidationResult>;
  onSave?: (workflow: WorkflowData) => Promise<void>;
  onDeploy?: (workflow: WorkflowData) => Promise<void>;
  readOnly?: boolean;
  className?: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    nodeId?: string;
    edgeId?: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

// API response types
export interface N8nWorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface N8nNodeResponse {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  properties: N8nNodeProperty[];
  inputs?: number;
  outputs?: number;
}

// Hook return types
export interface UseWorkflowBuilderReturn {
  workflow: WorkflowData;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  isValidating: boolean;
  validationResult: ValidationResult | null;

  // Actions
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (source: string, target: string) => void;
  deleteEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  validateWorkflow: () => Promise<ValidationResult>;
  saveWorkflow: () => Promise<void>;
  deployWorkflow: () => Promise<void>;
  resetWorkflow: () => void;
}