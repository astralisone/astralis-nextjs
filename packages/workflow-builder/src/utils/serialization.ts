import { WorkflowData, WorkflowNode, WorkflowEdge, NodeType } from '../types';

export function serializeWorkflow(workflow: WorkflowData): any {
  // Convert our workflow format to n8n workflow format
  const n8nWorkflow = {
    id: workflow.id,
    name: workflow.name,
    nodes: workflow.nodes.map(node => convertNodeToN8n(node)),
    connections: convertEdgesToN8nConnections(workflow.edges),
    settings: workflow.settings || {},
    meta: {
      description: workflow.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  return n8nWorkflow;
}

function convertNodeToN8n(node: WorkflowNode): any {
  const n8nNode = {
    id: node.id,
    name: node.data.n8nDefinition?.displayName || node.id,
    type: mapNodeTypeToN8nType(node.type, node.data.n8nDefinition),
    typeVersion: 1,
    position: [node.position.x, node.position.y],
    parameters: node.data.properties || {},
  };

  // Add credentials if available
  if (node.data.n8nDefinition?.name.includes('credential')) {
    n8nNode.credentials = {
      [node.data.n8nDefinition.name]: {
        id: node.data.properties.credentialId,
      },
    };
  }

  return n8nNode;
}

function mapNodeTypeToN8nType(nodeType: string, definition?: any): string {
  // If we have a specific n8n definition, use its name
  if (definition?.name) {
    return definition.name;
  }

  // Otherwise map our types to common n8n nodes
  switch (nodeType) {
    case 'trigger':
      return 'n8n-nodes-base.webhook';
    case 'action':
      return 'n8n-nodes-base.httpRequest';
    case 'logic':
      return 'n8n-nodes-base.if';
    case 'data':
      return 'n8n-nodes-base.set';
    case 'integration':
      return 'n8n-nodes-base.httpRequest';
    case 'output':
      return 'n8n-nodes-base.emailSend';
    default:
      return 'n8n-nodes-base.httpRequest';
  }
}

function convertEdgesToN8nConnections(edges: WorkflowEdge[]): any {
  const connections: any = {};

  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;

    if (!connections[sourceId]) {
      connections[sourceId] = {
        main: [],
      };
    }

    // Find or create connection to target
    let targetConnection = connections[sourceId].main.find((conn: any) =>
      conn.node === targetId
    );

    if (!targetConnection) {
      targetConnection = {
        node: targetId,
        type: 'main',
        index: 0,
      };
      connections[sourceId].main.push(targetConnection);
    }
  });

  return connections;
}

export function deserializeWorkflow(n8nWorkflow: any): WorkflowData {
  // Convert n8n workflow format to our workflow format
  const workflow: WorkflowData = {
    id: n8nWorkflow.id,
    name: n8nWorkflow.name,
    description: n8nWorkflow.meta?.description || '',
    nodes: n8nWorkflow.nodes?.map(convertN8nNodeToWorkflowNode) || [],
    edges: convertN8nConnectionsToEdges(n8nWorkflow.connections || {}),
    settings: n8nWorkflow.settings || {},
  };

  return workflow;
}

function convertN8nNodeToWorkflowNode(n8nNode: any): WorkflowNode {
  return {
    id: n8nNode.id,
    type: mapN8nTypeToNodeType(n8nNode.type),
    position: {
      x: n8nNode.position[0],
      y: n8nNode.position[1],
    },
    data: {
      n8nDefinition: {
        name: n8nNode.type,
        displayName: n8nNode.name,
        description: '',
        icon: '',
        category: getCategoryFromN8nType(n8nNode.type),
        properties: [], // Would need to fetch from n8n API
      },
      properties: n8nNode.parameters || {},
      isConfigured: Object.keys(n8nNode.parameters || {}).length > 0,
    },
  };
}

function mapN8nTypeToNodeType(n8nType: string): NodeType {
  if (n8nType.includes('webhook') || n8nType.includes('trigger')) {
    return 'trigger';
  } else if (n8nType.includes('if') || n8nType.includes('switch')) {
    return 'logic';
  } else if (n8nType.includes('set') || n8nType.includes('data')) {
    return 'data';
  } else if (n8nType.includes('email') || n8nType.includes('notification')) {
    return 'output';
  } else if (n8nType.includes('http') || n8nType.includes('api')) {
    return 'integration';
  } else {
    return 'action';
  }
}

function getCategoryFromN8nType(n8nType: string): string {
  if (n8nType.includes('webhook')) return 'trigger';
  if (n8nType.includes('http')) return 'integration';
  if (n8nType.includes('email')) return 'communication';
  if (n8nType.includes('if')) return 'logic';
  return 'action';
}

function convertN8nConnectionsToEdges(connections: any): WorkflowEdge[] {
  const edges: WorkflowEdge[] = [];

  Object.entries(connections).forEach(([sourceId, sourceConnections]: [string, any]) => {
    if (sourceConnections.main) {
      sourceConnections.main.forEach((targetConnection: any) => {
        edges.push({
          id: `edge_${sourceId}_${targetConnection.node}`,
          source: sourceId,
          target: targetConnection.node,
          type: 'default',
        });
      });
    }
  });

  return edges;
}