import { ILLMClient } from './LLMClient';
import { automationService, AutomationService } from '../../services/automation.service';
import { integrationService, IntegrationService } from '../../services/integration.service';
import { Logger } from '../types/agent.types';

export interface DashboardAgentConfig {
  orgId: string;
  enableWorkflowCreation: boolean;
  enableIntegrationManagement: boolean;
  enableBusinessInsights: boolean;
  maxConversationTurns: number;
  logger?: Logger;
}

export interface NaturalLanguageRequest {
  text: string;
  userId: string;
  orgId: string;
  context?: {
    previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    currentWorkflows?: string[];
    activeIntegrations?: string[];
  };
}

export interface DashboardAgentResponse {
  success: boolean;
  error?: string;
  data?: {
    response: string;
    actions: Array<{
      type: 'create_workflow' | 'configure_integration' | 'run_analysis' | 'suggest_improvement';
      data: any;
      confidence: number;
    }>;
    suggestions?: Array<{
      type: string;
      description: string;
    }>;
  };
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
export class DashboardAgent {
  private llmClient: ILLMClient;
  private automationService: AutomationService;
  private integrationService: IntegrationService;
  private config: DashboardAgentConfig;
  private logger: Logger;
  private conversationMemory: Map<string, Array<{ role: string; content: string }>>;

  constructor(config: DashboardAgentConfig, llmClient: ILLMClient) {
    this.config = config;
    this.llmClient = llmClient;
    this.automationService = automationService;
    this.integrationService = integrationService;
    this.conversationMemory = new Map();
    this.logger = config.logger || {
      debug: (msg, data) => console.debug(`[DashboardAgent] ${msg}`, data ?? ''),
      info: (msg, data) => console.info(`[DashboardAgent] ${msg}`, data ?? ''),
      warn: (msg, data) => console.warn(`[DashboardAgent] ${msg}`, data ?? ''),
      error: (msg, err, data) => console.error(`[DashboardAgent] ${msg}`, err, data ?? ''),
    };
  }

  /**
   * Process a natural language request from the dashboard
   */
  async process(request: NaturalLanguageRequest): Promise<DashboardAgentResponse> {
    this.logger.info('Processing natural language request', { text: request.text });

    try {
      // 1. Analyze intent using LLM
      const analysis = await this.analyzeIntent(request);
      this.logger.debug('Intent analysis complete', analysis);

      // 2. Clearer context for the response generation
      const context = {
        ...request.context,
        analysis,
        orgId: request.orgId,
        userId: request.userId
      };

      // 3. Generate response and actions based on intent
      let response: any;
      switch (analysis.type) {
        case 'create_workflow':
          response = await this.handleWorkflowCreation(request.text, context);
          break;
        case 'manage_integration':
          response = await this.handleIntegrationManagement(request.text, context);
          break;
        case 'analyze_data':
          response = await this.handleDataAnalysis(request.text, context);
          break;
        default:
          response = await this.handleGeneralQuery(request.text, context);
      }

      return {
        success: true,
        data: response
      };
    } catch (error) {
      this.logger.error('Error processing dashboard request', error as Error);
      return {
        success: false,
        error: (error as Error).message,
        data: {
          response: "I'm sorry, I encountered an error while processing your request. Please try again.",
          actions: []
        }
      };
    }
  }

  /**
   * Analyze the user's intent using the LLM
   */
  private async analyzeIntent(request: NaturalLanguageRequest): Promise<{
    type: 'create_workflow' | 'manage_integration' | 'analyze_data' | 'general_query';
    confidence: number;
    entities: Record<string, any>;
  }> {
    const prompt = `
Analyze this user request and determine the intent:

"${request.text}"

Context:
- Previous messages: ${JSON.stringify(request.context?.previousMessages?.slice(-3)) || 'none'}
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
      // Try to extract JSON
      let content = analysis.content;
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim();
      }
      return JSON.parse(content);
    } catch {
      return {
        type: 'general_query',
        confidence: 0.5,
        entities: {}
      };
    }
  }

  private async handleWorkflowCreation(text: string, context: any) {
    const spec = await this.generateWorkflowSpec(text, context);

    return {
      response: `I've prepared a draft for the "${spec.name}" workflow. It will automate ${spec.description}. Would you like me to create this in n8n for you?`,
      actions: [{
        type: 'create_workflow',
        data: spec,
        confidence: 0.9
      }],
      suggestions: [
        { type: 'optimization', description: 'Add error handling for potential timeouts' },
        { type: 'integration', description: 'Connect QuickBooks to sync financial data' }
      ]
    };
  }

  private async handleIntegrationManagement(text: string, context: any) {
    const integration = await this.analyzeIntegrationRequest(text);

    return {
      response: `I can help you set up the ${integration.provider} integration. This will allow you to ${integration.benefits}. Setting up this integration usually takes about 2 minutes.`,
      actions: [{
        type: 'configure_integration',
        data: { provider: integration.provider },
        confidence: 1.0
      }]
    };
  }

  private async handleDataAnalysis(text: string, context: any) {
    const analysisRequest = await this.generateAnalysisRequest(text);

    return {
      response: `I'm starting an analysis of your ${analysisRequest.dataType} data, focusing on ${analysisRequest.focus} for the ${analysisRequest.timeframe}. I'll generate a report for you shortly.`,
      actions: [{
        type: 'run_analysis',
        data: analysisRequest,
        confidence: 0.85
      }]
    };
  }

  private async handleGeneralQuery(text: string, context: any) {
    const prompt = `
Generate a helpful response to the user's dashboard query.

User Query: "${text}"

Available Capabilities:
- Create and manage automation workflows (n8n)
- Set up third-party integrations (Slack, Gmail, Salesforce, etc.)
- Run data analysis on sales, productivity, and project metrics
- Track quotas and team activity

Context:
- Organization: ${context.orgId}
- Current View: Dashboard

Provide a concise, professional response and suggest 2-3 specific actions the user might want to take.
`;

    const completion = await this.llmClient.complete([{
      role: 'user',
      content: prompt
    }]);

    return {
      response: completion.content,
      actions: [],
      suggestions: [
        { type: 'discovery', description: 'Show me my most effective automations' },
        { type: 'setup', description: 'Help me connect my calendar' }
      ]
    };
  }

  private async generateWorkflowSpec(text: string, context: any) {
    const prompt = `
Generate a detailed workflow specification based on the following user request and business context:

User Request: "${text}"

Current Business Context:
- Active Integrations: ${context.activeIntegrations?.join(', ') || 'none'}
- Existing Workflows: ${context.currentWorkflows?.join(', ') || 'none'}

Return a JSON object with:
- name: A professional name for the workflow
- description: A clear description of what it automates
- steps: An array of steps, where each step has:
  - id: string
  - label: string
  - type: string (e.g., "TRIGGER", "ACTION", "CONDITION")
  - config: object with specific parameters for the step

Focus on creating a practical, high-value workflow that leverages the available integrations.
`;

    const response = await this.llmClient.complete([{
      role: 'user',
      content: prompt
    }]);

    try {
      // Try to extract JSON from the response
      let content = response.content;
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim();
      }
      return JSON.parse(content);
    } catch {
      return {
        name: "Generated Workflow",
        description: "Automated business process",
        steps: []
      };
    }
  }

  private async analyzeIntegrationRequest(text: string) {
    const prompt = `
Identify which integration the user wants to set up and what the primary business benefit would be.

User Request: "${text}"

Return a JSON object with:
- provider: The name of the integration provider (e.g., "SLACK", "GOOGLE_CALENDAR", "GMAIL", "SALESFORCE")
- benefits: A concise explanation of the business value this integration provides.

If multiple integrations are mentioned, prioritize the most prominent one.
`;

    const response = await this.llmClient.complete([{
      role: 'user',
      content: prompt
    }]);

    try {
      let content = response.content;
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim();
      }
      return JSON.parse(content);
    } catch {
      return {
        provider: "Unknown",
        benefits: "streamlined business operations"
      };
    }
  }

  private async generateAnalysisRequest(text: string) {
    const prompt = `
Analyze the user's data analysis request and determine the parameters for the analysis.

User Request: "${text}"

Return a JSON object with:
- dataType: The category of data to analyze (e.g., "SALES", "SUPPORT", "PRODUCTIVITY")
- focus: The specific metrics or insights to prioritize.
- timeframe: The period to analyze (e.g., "last_30_days", "current_quarter")

Be specific to ensure the analysis provides actionable business value.
`;

    const response = await this.llmClient.complete([{
      role: 'user',
      content: prompt
    }]);

    try {
      let content = response.content;
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim();
      }
      return JSON.parse(content);
    } catch {
      return {
        dataType: "business operations",
        focus: "performance metrics",
        timeframe: "recent"
      };
    }
  }
}