/**
 * Action Runtime Service
 *
 * Executes cached actions with proper error handling, authentication, and monitoring.
 * Actions are executed against real APIs using stored credentials.
 */

import { actionRepository } from './action-repository';
import { IntegrationService } from './integration.service';
import {
  IActionRuntime,
  ExecutionContext,
  ExecutionResult,
  ActionCapabilities,
  ValidationResult,
  ActionExecutionSpec
} from '@/lib/types/action';

export class ActionRuntime implements IActionRuntime {
  private integrationService: IntegrationService;

  constructor() {
    this.integrationService = new IntegrationService();
  }

  /**
   * Execute an action by key
   */
  async executeAction(
    actionKey: string,
    params: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    try {
      // 1. Get action definition
      const action = await actionRepository.findByKey(actionKey);
      if (!action) {
        throw new Error(`Action not found: ${actionKey}`);
      }

      // 2. Validate execution context
      const validation = await this.validateExecution(actionKey, params);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // 3. Check capabilities and permissions
      const capabilities = await this.getActionCapabilities(actionKey);
      if (!capabilities.supported) {
        throw new Error(`Action not supported: ${actionKey}`);
      }

      // 4. Get integration credentials
      const integrationId = context.integrationId || await this.findIntegrationForAction(action.provider, context.orgId);
      if (!integrationId) {
        throw new Error(`No integration found for provider: ${action.provider}`);
      }

      const credentials = await this.integrationService.getCredentialWithData(integrationId);
      if (!credentials) {
        throw new Error(`Integration credentials not found: ${integrationId}`);
      }

      // 5. Execute the action
      const result = await this.executeApiCall(action.executionSpec, params, credentials.credentialData);

      // 6. Record successful execution
      const executionTime = Date.now() - startTime;
      await this.recordExecution({
        actionId: action.id,
        actionKey,
        status: 'success',
        inputParams: params,
        outputData: result,
        executionTime,
        userId: context.userId,
        orgId: context.orgId,
        integrationId,
        startedAt: new Date(startTime),
        completedAt: new Date(),
      });

      // 7. Update action usage stats
      await actionRepository.update(action.id, {
        executionCount: action.executionCount + 1,
        lastExecutedAt: new Date(),
      });

      return {
        success: true,
        data: result,
        executionTime,
        executionId,
      };

    } catch (error) {
      // Record failed execution
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Try to record execution failure (don't throw if this fails)
      try {
        const action = await actionRepository.findByKey(actionKey);
        if (action) {
          await this.recordExecution({
            actionId: action.id,
            actionKey,
            status: 'failed',
            inputParams: params,
            errorMessage,
            executionTime,
            userId: context.userId,
            orgId: context.orgId,
            integrationId: context.integrationId,
            startedAt: new Date(startTime),
            completedAt: new Date(),
          });
        }
      } catch (recordError) {
        console.error('Failed to record execution:', recordError);
      }

      return {
        success: false,
        error: errorMessage,
        executionTime,
        executionId,
      };
    }
  }

  /**
   * Validate action execution parameters
   */
  async validateExecution(actionKey: string, params: Record<string, any>): Promise<ValidationResult> {
    try {
      const action = await actionRepository.findByKey(actionKey);
      if (!action) {
        return {
          isValid: false,
          errors: [`Action not found: ${actionKey}`],
          warnings: [],
        };
      }

      // Use JSON Schema validation if available
      if (action.inputSchema) {
        const errors = this.validateAgainstSchema(params, action.inputSchema);
        return {
          isValid: errors.length === 0,
          errors,
          warnings: [],
        };
      }

      // Basic validation if no schema
      return {
        isValid: true,
        errors: [],
        warnings: ['No input validation schema available'],
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
      };
    }
  }

  /**
   * Get action capabilities and requirements
   */
  async getActionCapabilities(actionKey: string): Promise<ActionCapabilities> {
    try {
      const action = await actionRepository.findByKey(actionKey);
      if (!action) {
        return {
          supported: false,
          requiresAuth: false,
          rateLimited: false,
        };
      }

      // Check if action requires authentication
      const requiresAuth = this.executionSpecRequiresAuth(action.executionSpec);

      // Basic rate limiting check (could be enhanced)
      const rateLimited = action.executionSpec.method !== 'GET';

      return {
        supported: action.status === 'ACTIVE',
        requiresAuth,
        rateLimited,
        estimatedCost: this.estimateExecutionCost(action),
      };

    } catch (error) {
      return {
        supported: false,
        requiresAuth: false,
        rateLimited: false,
      };
    }
  }

  /**
   * Execute API call based on execution spec
   */
  private async executeApiCall(
    spec: ActionExecutionSpec,
    params: Record<string, any>,
    credentials: Record<string, any>
  ): Promise<any> {
    // Build request URL
    const url = `${spec.baseUrl}${spec.endpoint}`;

    // Build headers
    const headers = { ...spec.headers };

    // Add authentication
    switch (spec.authType) {
      case 'oauth2':
        if (credentials.access_token) {
          headers['Authorization'] = `Bearer ${credentials.access_token}`;
        }
        break;
      case 'api_key':
        if (credentials.api_key) {
          headers['X-API-Key'] = credentials.api_key;
        }
        break;
      case 'basic':
        if (credentials.username && credentials.password) {
          const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
          headers['Authorization'] = `Basic ${auth}`;
        }
        break;
      case 'bearer':
        if (credentials.token) {
          headers['Authorization'] = `Bearer ${credentials.token}`;
        }
        break;
    }

    // Build request body
    let body: any = null;
    if (spec.bodyTemplate) {
      body = this.interpolateTemplate(spec.bodyTemplate, params);
    }

    // Execute request
    const response = await fetch(url, {
      method: spec.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    // Apply response mapping if specified
    if (spec.responseMapping) {
      return this.mapResponse(responseData, spec.responseMapping);
    }

    return responseData;
  }

  /**
   * Find integration for action and organization
   */
  private async findIntegrationForAction(provider: string, orgId?: string): Promise<string | null> {
    if (!orgId) return null;

    try {
      // This would need to be implemented in IntegrationService
      // For now, return null - integrationId should be provided in context
      return null;
    } catch (error) {
      console.error('Failed to find integration:', error);
      return null;
    }
  }

  /**
   * Record execution in database
   */
  private async recordExecution(execution: any): Promise<void> {
    try {
      await prisma.actionExecution.create({
        data: {
          actionId: execution.actionId,
          actionKey: execution.actionKey,
          status: execution.status,
          inputParams: execution.inputParams,
          outputData: execution.outputData,
          errorMessage: execution.errorMessage,
          executionTime: execution.executionTime,
          userId: execution.userId,
          orgId: execution.orgId,
          integrationId: execution.integrationId,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
        },
      });
    } catch (error) {
      console.error('Failed to record execution:', error);
      // Don't throw - execution recording failure shouldn't break the action
    }
  }

  /**
   * Validate parameters against JSON schema
   */
  private validateAgainstSchema(params: any, schema: any): string[] {
    const errors: string[] = [];

    // Basic validation - could be enhanced with a proper JSON Schema validator
    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in params)) {
          errors.push(`Missing required parameter: ${required}`);
        }
      }
    }

    return errors;
  }

  /**
   * Check if execution spec requires authentication
   */
  private executionSpecRequiresAuth(spec: ActionExecutionSpec): boolean {
    return spec.authType !== 'none';
  }

  /**
   * Estimate execution cost (placeholder)
   */
  private estimateExecutionCost(action: any): number {
    // Placeholder - could be based on API pricing, complexity, etc.
    return 0.01; // 1 cent per execution
  }

  /**
   * Interpolate template with parameters
   */
  private interpolateTemplate(template: any, params: Record<string, any>): any {
    // Simple template interpolation - could be enhanced
    const templateStr = JSON.stringify(template);
    const interpolated = templateStr.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
    return JSON.parse(interpolated);
  }

  /**
   * Map API response using response mapping
   */
  private mapResponse(responseData: any, mapping: Record<string, string>): any {
    const result: any = {};

    for (const [outputKey, responsePath] of Object.entries(mapping)) {
      // Simple dot notation path resolution
      const value = this.getValueByPath(responseData, responsePath);
      if (value !== undefined) {
        result[outputKey] = value;
      }
    }

    return result;
  }

  /**
   * Get value from object using dot notation path
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const actionRuntime = new ActionRuntime();