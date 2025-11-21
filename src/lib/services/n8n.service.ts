import axios, { AxiosInstance } from 'axios';

/**
 * N8N Service
 *
 * Handles integration with n8n workflow automation engine via REST API.
 * Provides methods to create, manage, and execute workflows.
 *
 * Requirements:
 * - N8N_HOST: n8n server hostname
 * - N8N_PORT: n8n server port (default: 5678)
 * - N8N_PROTOCOL: http or https
 * - N8N_BASIC_AUTH_USER: n8n basic auth username
 * - N8N_BASIC_AUTH_PASSWORD: n8n basic auth password
 */

interface N8nWorkflowData {
  name: string;
  nodes: any[];
  connections: any;
  active?: boolean;
  settings?: any;
}

interface N8nWorkflowResponse {
  id: string;
  name: string;
  nodes: any[];
  connections: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface N8nExecutionResponse {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  data: any;
}

export class N8nService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    const protocol = process.env.N8N_PROTOCOL || 'http';
    const host = process.env.N8N_HOST || 'localhost';
    const port = process.env.N8N_PORT || '5678';
    this.baseUrl = `${protocol}://${host}:${port}/api/v1`;

    // Prepare authentication headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use API Key if available (preferred method)
    const apiKey = process.env.N8N_API_KEY;
    if (apiKey) {
      headers['X-N8N-API-KEY'] = apiKey;
      console.log('[N8N Service] Using API key authentication');
    } else {
      // Fallback to Basic Auth
      const authUser = process.env.N8N_BASIC_AUTH_USER || '';
      const authPassword = process.env.N8N_BASIC_AUTH_PASSWORD || '';
      if (authUser && authPassword) {
        const authString = Buffer.from(`${authUser}:${authPassword}`).toString('base64');
        headers['Authorization'] = `Basic ${authString}`;
        console.log('[N8N Service] Using Basic Auth authentication');
      } else {
        console.warn('[N8N Service] No authentication configured - this may fail in production');
      }
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers,
      timeout: 30000, // 30 second timeout
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[N8N Service] API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Create new workflow in n8n
   */
  async createWorkflow(data: N8nWorkflowData): Promise<N8nWorkflowResponse> {
    try {
      // Create workflow (without 'active' field - it's read-only)
      const response = await this.client.post<N8nWorkflowResponse>('/workflows', {
        name: data.name,
        nodes: data.nodes,
        connections: data.connections,
        settings: data.settings || {},
      });

      console.log(`[N8N Service] Workflow created: ${response.data.id}`);

      // Note: Workflow activation via API is complex and version-dependent
      // For now, workflows are created as inactive and can be activated manually in n8n UI
      if (data.active) {
        console.log(`[N8N Service] Workflow created as inactive - activate manually in n8n UI at http://localhost:5678`);
      }

      return response.data;
    } catch (error) {
      console.error('[N8N Service] Failed to create workflow:', error);
      throw new Error(
        `Failed to create n8n workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflowResponse> {
    try {
      const response = await this.client.get<N8nWorkflowResponse>(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error(`[N8N Service] Failed to get workflow ${workflowId}:`, error);
      throw new Error(
        `Failed to get n8n workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    updates: Partial<N8nWorkflowData>
  ): Promise<N8nWorkflowResponse> {
    try {
      const response = await this.client.patch<N8nWorkflowResponse>(
        `/workflows/${workflowId}`,
        updates
      );

      console.log(`[N8N Service] Workflow updated: ${workflowId}`);
      return response.data;
    } catch (error) {
      console.error(`[N8N Service] Failed to update workflow ${workflowId}:`, error);
      throw new Error(
        `Failed to update n8n workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await this.client.delete(`/workflows/${workflowId}`);
      console.log(`[N8N Service] Workflow deleted: ${workflowId}`);
    } catch (error) {
      console.error(`[N8N Service] Failed to delete workflow ${workflowId}:`, error);
      throw new Error(
        `Failed to delete n8n workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute workflow manually
   */
  async executeWorkflow(workflowId: string, data: any = {}): Promise<N8nExecutionResponse> {
    try {
      const response = await this.client.post<N8nExecutionResponse>(
        `/workflows/${workflowId}/execute`,
        { data }
      );

      console.log(`[N8N Service] Workflow executed: ${workflowId}, execution: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(`[N8N Service] Failed to execute workflow ${workflowId}:`, error);
      throw new Error(
        `Failed to execute n8n workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get workflow execution history
   */
  async getExecutions(
    workflowId: string,
    limit: number = 100
  ): Promise<N8nExecutionResponse[]> {
    try {
      const response = await this.client.get<{ data: N8nExecutionResponse[] }>('/executions', {
        params: {
          workflowId,
          limit,
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error(`[N8N Service] Failed to get executions for workflow ${workflowId}:`, error);
      throw new Error(
        `Failed to get n8n executions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get execution details
   */
  async getExecution(executionId: string): Promise<N8nExecutionResponse> {
    try {
      const response = await this.client.get<N8nExecutionResponse>(`/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error(`[N8N Service] Failed to get execution ${executionId}:`, error);
      throw new Error(
        `Failed to get n8n execution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowId: string): Promise<N8nWorkflowResponse> {
    return this.updateWorkflow(workflowId, { active: true });
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<N8nWorkflowResponse> {
    return this.updateWorkflow(workflowId, { active: false });
  }

  /**
   * Health check - verify n8n is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      // n8n health endpoint might vary, using workflows list as health check
      await this.client.get('/workflows', { params: { limit: 1 } });
      return true;
    } catch (error) {
      console.error('[N8N Service] Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const n8nService = new N8nService();
