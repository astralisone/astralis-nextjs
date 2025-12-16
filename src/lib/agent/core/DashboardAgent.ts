import { BaseAgent, AgentConfig, AgentResult } from '../core/BaseAgent';
import { LLMClient } from '../core/LLMClient';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';
import { IntegrationManager } from '../../integrations/IntegrationManager';

export interface DashboardAgentConfig extends AgentConfig {
  enableWorkflowCreation: boolean;
  enableIntegrationManagement: boolean;
  enableBusinessInsights: boolean;
  maxConversationTurns: number;
}

export interface NaturalLanguageRequest {
  text: string;
  userId: string;
  orgId: string;
  context?: {
    previousMessages?: Array<{role: 'user'|'assistant', content: string}>;
    currentWorkflows?: string[];
    activeIntegrations?: string[];
  };
}

export interface DashboardAgentResponse {
  response: string;
  actions: Array<{
    type: 'create_workflow' | 'configure_integration' | 'run_analysis' | 'suggest_improvement';
    data: any;
    confidence: number;
  }>;
  suggestions?: Array<{
    type: string;
    description: string;
    action: () => Promise<void>;
  }>;
}

/**
 * DashboardAgent - Specialized agent for natural language dashboard interactions
 *
 * Handles complex natural language requests for:
 * - Workflow creation and management
 * - Integration setup and configuration
 * - Business process automation
 * - Data analysis and insights
 * - Multi-turn conversational interactions
 */
export class DashboardAgent extends BaseAgent {
  private llmClient: LLMClient;
  private workflowEngine: WorkflowEngine;
  private integrationManager: IntegrationManager;
  private conversationMemory: Map<string, Array<{role: string, content: string}>>;

  constructor(config: DashboardAgentConfig) {
    super({
      name: 'DashboardAgent',
      description: 'Natural language interface for business operations',
      capabilities: [
        'natural_language_processing',
        'workflow_creation',
        'integration_management',
        'business_analysis',
        'conversational_ai'
      ],
      ...config
    });

    this.llmClient = new LLMClient({
      provider: 'claude',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      maxTokens: 4000
    });

    this.workflowEngine = new WorkflowEngine();
    this.integrationManager = new IntegrationManager();
    this.conversationMemory = new Map();
  }

  async process(request: NaturalLanguageRequest): Promise<AgentResult<DashboardAgentResponse>> {
    try {
      // Analyze the natural language request
      const intent = await this.analyzeIntent(request);

      // Maintain conversation context
      const conversationContext = this.getConversationContext(request.userId, request);

      // Process based on intent
      switch (intent.type) {
        case 'create_workflow':
          return await this.handleWorkflowCreation(request, intent, conversationContext);

        case 'manage_integration':
          return await this.handleIntegrationManagement(request, intent);

        case 'analyze_data':
          return await this.handleDataAnalysis(request, intent);

        case 'general_query':
          return await this.handleGeneralQuery(request, conversationContext);

        default:
          return await this.handleFallback(request);
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          response: "I apologize, but I encountered an error processing your request. Please try rephrasing or contact support.",
          actions: [],
          suggestions: [{
            type: 'help',
            description: 'Get help with available commands',
            action: async () => console.log('Help action triggered')
          }]
        }
      };
    }
  }

  private async analyzeIntent(request: NaturalLanguageRequest): Promise<{
    type: 'create_workflow' | 'manage_integration' | 'analyze_data' | 'general_query';
    confidence: number;
    entities: Record<string, any>;
  }> {
    const prompt = `
Analyze this user request and determine the intent:

"${request.text}"

Context:
- Previous messages: ${request.context?.previousMessages?.slice(-3) || 'none'}
- Active integrations: ${request.context?.activeIntegrations?.join(', ') || 'none'}
- Current workflows: ${request.context?.currentWorkflows?.join(', ') || 'none'}

Return JSON with:
- type: "create_workflow" | "manage_integration" | "analyze_data" | "general_query"
- confidence: number 0-1
- entities: extracted entities like workflow types, integration names, etc.
`;

    const analysis = await this.llmClient.complete([{
      role: 'user',
      content: prompt
    }]);

    try {
      return JSON.parse(analysis.content);
    } catch {
      return {
        type: 'general_query',
        confidence: 0.5,
        entities: {}
      };
    }
  }

  private async handleWorkflowCreation(
    request: NaturalLanguageRequest,
    intent: any,
    context: any
  ): Promise<AgentResult<DashboardAgentResponse>> {

    // Use LLM to understand workflow requirements
    const workflowSpec = await this.generateWorkflowSpec(request.text, context);

    // Create the workflow
    const workflow = await this.workflowEngine.createWorkflow({
      name: workflowSpec.name,
      description: workflowSpec.description,
      steps: workflowSpec.steps,
      orgId: request.orgId,
      createdBy: request.userId
    });

    return {
      success: true,
      data: {
        response: `I've created a new workflow called "${workflow.name}" with ${workflowSpec.steps.length} steps. It will help automate ${workflowSpec.description}.`,
        actions: [{
          type: 'create_workflow',
          data: workflow,
          confidence: intent.confidence
        }],
        suggestions: [{
          type: 'test_workflow',
          description: 'Test the new workflow',
          action: async () => console.log('Test workflow action')
        }]
      }
    };
  }

  private async handleIntegrationManagement(
    request: NaturalLanguageRequest,
    intent: any
  ): Promise<AgentResult<DashboardAgentResponse>> {

    const integrationSpec = await this.analyzeIntegrationRequest(request.text);

    return {
      success: true,
      data: {
        response: `I can help you set up the ${integrationSpec.provider} integration. This will allow you to ${integrationSpec.benefits}.`,
        actions: [{
          type: 'configure_integration',
          data: integrationSpec,
          confidence: intent.confidence
        }],
        suggestions: [{
          type: 'setup_integration',
          description: `Set up ${integrationSpec.provider}`,
          action: async () => window.location.href = '/integrations'
        }]
      }
    };
  }

  private async handleDataAnalysis(
    request: NaturalLanguageRequest,
    intent: any
  ): Promise<AgentResult<DashboardAgentResponse>> {

    const analysisSpec = await this.generateAnalysisRequest(request.text);

    return {
      success: true,
      data: {
        response: `I'll analyze your ${analysisSpec.dataType} data to provide insights about ${analysisSpec.focus}.`,
        actions: [{
          type: 'run_analysis',
          data: analysisSpec,
          confidence: intent.confidence
        }]
      }
    };
  }

  private async handleGeneralQuery(
    request: NaturalLanguageRequest,
    context: any
  ): Promise<AgentResult<DashboardAgentResponse>> {

    const response = await this.llmClient.complete([
      {
        role: 'system',
        content: `You are a helpful AI assistant for business operations.
        Available capabilities: workflow creation, integration management, data analysis.
        Be conversational and helpful.`
      },
      ...context,
      {
        role: 'user',
        content: request.text
      }
    ]);

    return {
      success: true,
      data: {
        response: response.content,
        actions: [],
        suggestions: [
          {
            type: 'create_workflow',
            description: 'Create a new workflow',
            action: async () => console.log('Create workflow suggestion')
          },
          {
            type: 'manage_integrations',
            description: 'Set up integrations',
            action: async () => window.location.href = '/integrations'
          }
        ]
      }
    };
  }

  private async handleFallback(request: NaturalLanguageRequest): Promise<AgentResult<DashboardAgentResponse>> {
    return {
      success: true,
      data: {
        response: "I'm not sure how to help with that request. Try asking me to create a workflow, set up an integration, or analyze some data.",
        actions: [],
        suggestions: [
          {
            type: 'help',
            description: 'See what I can help with',
            action: async () => console.log('Help action')
          }
        ]
      }
    };
  }

  private getConversationContext(userId: string, request: NaturalLanguageRequest) {
    const memory = this.conversationMemory.get(userId) || [];
    const context = request.context?.previousMessages || [];

    return [...memory.slice(-5), ...context.slice(-3)]; // Last 8 messages
  }

  private async generateWorkflowSpec(text: string, context: any) {
    // This would use LLM to parse workflow requirements
    return {
      name: "Generated Workflow",
      description: "Workflow created from natural language",
      steps: []
    };
  }

  private async analyzeIntegrationRequest(text: string) {
    // This would analyze which integration is needed
    return {
      provider: "Unknown",
      benefits: "various business operations"
    };
  }

  private async generateAnalysisRequest(text: string) {
    // This would determine what analysis to run
    return {
      dataType: "business data",
      focus: "performance metrics"
    };
  }
}