import { Node, Edge } from 'reactflow';

export type WorkflowNodeType = 
  | 'trigger'
  | 'action'
  | 'condition' 
  | 'integration'
  | 'output'
  | 'custom';

export type WorkflowCategory = 
  | 'lead-generation'
  | 'sales-automation'
  | 'customer-service'
  | 'marketing'
  | 'operations'
  | 'data-processing'
  | 'integration'
  | 'notification';

export interface WorkflowNodeData {
  label: string;
  category: WorkflowCategory;
  type: WorkflowNodeType;
  icon?: string;
  color?: string;
  gradient?: string;
  description?: string;
  config?: Record<string, any>;
  integrations?: string[];
  isCustomizable?: boolean;
}

export interface WorkflowNode extends Node {
  data: WorkflowNodeData;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  category: WorkflowCategory;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  roi: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  metrics: {
    automationScore: number;
    timeSavings: string;
    costReduction: string;
    scalability: number;
  };
  features: string[];
  integrations: Integration[];
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  isPremium: boolean;
  tags: string[];
}

export interface WorkflowExport {
  format: 'pdf' | 'png' | 'json' | 'link';
  data: any;
  url?: string;
}

export interface WorkflowState {
  selectedIndustry: string;
  currentTemplate: WorkflowTemplate | null;
  nodes: WorkflowNode[];
  edges: Edge[];
  isEditing: boolean;
  viewMode: 'demo' | 'builder' | 'preview';
  customizations: Record<string, any>;
}