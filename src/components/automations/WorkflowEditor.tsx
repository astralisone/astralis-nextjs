'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Trash2,
  Plus,
  Save,
  ExternalLink,
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position?: [number, number];
  parameters: Record<string, any>;
}

interface WorkflowData {
  name: string;
  nodes: WorkflowNode[];
  connections: Record<string, any>;
}

interface WorkflowEditorProps {
  workflowJson: WorkflowData | null;
  onChange: (workflow: WorkflowData) => void;
  n8nWorkflowId?: string;
}

export function WorkflowEditor({
  workflowJson,
  onChange,
  n8nWorkflowId,
}: WorkflowEditorProps) {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(workflowJson);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingParam, setEditingParam] = useState<{
    nodeId: string;
    key: string;
  } | null>(null);

  useEffect(() => {
    setWorkflow(workflowJson);
    // Expand all nodes by default so parameters are visible
    if (workflowJson?.nodes) {
      setExpandedNodes(new Set(workflowJson.nodes.map(node => node.id)));
    }
  }, [workflowJson]);

  if (!workflow) {
    return (
      <Alert>
        <AlertDescription>
          No workflow configuration available. Deploy from a template first.
        </AlertDescription>
      </Alert>
    );
  }

  const toggleNodeExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const updateNodeParameter = (nodeId: string, key: string, value: any) => {
    if (!workflow) return;

    const updatedNodes = workflow.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          parameters: {
            ...node.parameters,
            [key]: value,
          },
        };
      }
      return node;
    });

    const updatedWorkflow = {
      ...workflow,
      nodes: updatedNodes,
    };

    setWorkflow(updatedWorkflow);
    onChange(updatedWorkflow);
  };

  const deleteNode = (nodeId: string) => {
    if (!workflow) return;
    if (!confirm('Are you sure you want to delete this node?')) return;

    const updatedNodes = workflow.nodes.filter((node) => node.id !== nodeId);

    // Remove connections involving this node
    const updatedConnections = { ...workflow.connections };
    delete updatedConnections[nodeId];
    Object.keys(updatedConnections).forEach((key) => {
      if (updatedConnections[key]?.main) {
        updatedConnections[key].main = updatedConnections[key].main.map(
          (connections: any[]) =>
            connections.filter((conn: any) => conn.node !== nodeId)
        );
      }
    });

    const updatedWorkflow = {
      ...workflow,
      nodes: updatedNodes,
      connections: updatedConnections,
    };

    setWorkflow(updatedWorkflow);
    onChange(updatedWorkflow);
  };

  const renderParameterInput = (
    node: WorkflowNode,
    key: string,
    value: any
  ) => {
    const isEditing =
      editingParam?.nodeId === node.id && editingParam?.key === key;

    // Determine input type based on value
    const inputType = typeof value === 'boolean' ? 'checkbox' : 'text';

    if (typeof value === 'object' && value !== null) {
      return (
        <Textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateNodeParameter(node.id, key, parsed);
            } catch (err) {
              // Invalid JSON, don't update yet
            }
          }}
          className="font-mono text-xs"
          rows={5}
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => updateNodeParameter(node.id, key, e.target.checked)}
          className=" ui-icon w-5 h-5 text-astralis-blue border-slate-300 rounded focus:ring-astralis-blue"
        />
      );
    }

    if (typeof value === 'string' && value.length > 100) {
      return (
        <Textarea
          value={value}
          onChange={(e) => updateNodeParameter(node.id, key, e.target.value)}
          rows={3}
        />
      );
    }

    return (
      <Input
        type={inputType}
        value={value?.toString() || ''}
        onChange={(e) => updateNodeParameter(node.id, key, e.target.value)}
      />
    );
  };

  const getNodeTypeColor = (type: string) => {
    if (type.includes('webhook')) return 'bg-purple-100 text-purple-700';
    if (type.includes('gmail') || type.includes('email'))
      return 'bg-blue-100 text-blue-700';
    if (type.includes('slack')) return 'bg-pink-100 text-pink-700';
    if (type.includes('http')) return 'bg-green-100 text-green-700';
    if (type.includes('code')) return 'bg-orange-100 text-orange-700';
    return 'bg-slate-100 text-slate-700';
  };

  const toggleAllNodes = () => {
    if (expandedNodes.size === workflow.nodes.length) {
      // All expanded, collapse all
      setExpandedNodes(new Set());
    } else {
      // Some collapsed, expand all
      setExpandedNodes(new Set(workflow.nodes.map(node => node.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-astralis-navy">
            Workflow Configuration
          </h3>
          <p className="text-sm text-slate-600">
            {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''} •
            {expandedNodes.size} expanded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllNodes}
          >
            {expandedNodes.size === workflow.nodes.length ? 'Collapse All' : 'Expand All'}
          </Button>
          {n8nWorkflowId && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`http://localhost:5678/workflow/${n8nWorkflowId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className=" ui-icon w-5 h-5 mr-2" />
                Edit in n8n
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Nodes */}
      <div className="space-y-3">
        {workflow.nodes.map((node, index) => {
          const isExpanded = expandedNodes.has(node.id);
          const nodeTypeColor = getNodeTypeColor(node.type);

          return (
            <Card key={node.id} variant="bordered">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleNodeExpanded(node.id)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className=" ui-icon w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronRight className=" ui-icon w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium text-slate-500">
                        #{index + 1}
                      </span>
                      <h4 className="text-base font-semibold text-astralis-navy">
                        {node.name}
                      </h4>
                      <Badge variant="secondary" className={nodeTypeColor}>
                        {node.type.split('.').pop()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleNodeExpanded(node.id)}
                    >
                      <Settings className=" ui-icon w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNode(node.id)}
                    >
                      <Trash2 className=" ui-icon w-5 h-5 text-error" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {/* Node ID and Type */}
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <Label className="text-xs text-slate-600">Node ID</Label>
                      <p className="text-sm font-mono text-slate-900">
                        {node.id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Type</Label>
                      <p className="text-sm font-mono text-slate-900">
                        {node.type}
                      </p>
                    </div>
                  </div>

                  {/* Node Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`node-name-${node.id}`}>Node Name</Label>
                    <Input
                      id={`node-name-${node.id}`}
                      value={node.name}
                      onChange={(e) => {
                        const updatedNodes = workflow.nodes.map((n) =>
                          n.id === node.id ? { ...n, name: e.target.value } : n
                        );
                        const updatedWorkflow = {
                          ...workflow,
                          nodes: updatedNodes,
                        };
                        setWorkflow(updatedWorkflow);
                        onChange(updatedWorkflow);
                      }}
                    />
                  </div>

                  {/* Parameters */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Parameters</Label>
                    {Object.keys(node.parameters).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">
                        No parameters configured
                      </p>
                    ) : (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                        {Object.entries(node.parameters).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label
                              htmlFor={`param-${node.id}-${key}`}
                              className="text-xs font-medium text-slate-700"
                            >
                              {key}
                            </Label>
                            {renderParameterInput(node, key, value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connections */}
                  {workflow.connections[node.id] && (
                    <div className="pt-3 border-t border-slate-200">
                      <Label className="text-xs text-slate-600">
                        Connections
                      </Label>
                      <div className="mt-2 space-y-1">
                        {workflow.connections[node.id].main?.map(
                          (connections: any[], idx: number) =>
                            connections.map((conn: any, connIdx: number) => (
                              <p
                                key={`${idx}-${connIdx}`}
                                className="text-sm text-slate-600"
                              >
                                → {conn.node} (output {idx})
                              </p>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Alert>
        <AlertDescription className="text-sm">
          Changes are saved automatically. For advanced workflow editing, use
          the n8n visual editor.
        </AlertDescription>
      </Alert>
    </div>
  );
}
