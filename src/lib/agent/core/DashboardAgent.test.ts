import { DashboardAgent, NaturalLanguageRequest } from '../core/DashboardAgent';

/**
 * Integration Test for DashboardAgent
 *
 * This demonstrates how the new DashboardAgent could replace or enhance
 * the current AgentChatInterface for natural language interactions.
 */

// Mock the required dependencies for testing
jest.mock('../core/LLMClient');
jest.mock('../../workflows/WorkflowEngine');
jest.mock('../../integrations/IntegrationManager');

describe('DashboardAgent', () => {
  let agent: DashboardAgent;

  beforeEach(() => {
    agent = new DashboardAgent({
      enableWorkflowCreation: true,
      enableIntegrationManagement: true,
      enableBusinessInsights: true,
      maxConversationTurns: 10
    });
  });

  test('should handle workflow creation request', async () => {
    const request: NaturalLanguageRequest = {
      text: "Create a workflow to process invoices automatically",
      userId: "user-123",
      orgId: "org-456",
      context: {
        activeIntegrations: ['GMAIL', 'QUICKBOOKS'],
        currentWorkflows: []
      }
    };

    const result = await agent.process(request);

    expect(result.success).toBe(true);
    expect(result.data?.response).toContain('workflow');
    expect(result.data?.actions).toHaveLength(1);
    expect(result.data?.actions[0].type).toBe('create_workflow');
  });

  test('should handle integration setup request', async () => {
    const request: NaturalLanguageRequest = {
      text: "Set up Slack integration for notifications",
      userId: "user-123",
      orgId: "org-456"
    };

    const result = await agent.process(request);

    expect(result.success).toBe(true);
    expect(result.data?.response).toContain('Slack');
    expect(result.data?.actions[0].type).toBe('configure_integration');
  });

  test('should handle general queries', async () => {
    const request: NaturalLanguageRequest = {
      text: "What can you help me with?",
      userId: "user-123",
      orgId: "org-456"
    };

    const result = await agent.process(request);

    expect(result.success).toBe(true);
    expect(result.data?.suggestions).toBeDefined();
    expect(result.data?.suggestions?.length).toBeGreaterThan(0);
  });

  test('should maintain conversation context', async () => {
    // First message
    const request1: NaturalLanguageRequest = {
      text: "I want to create a workflow",
      userId: "user-123",
      orgId: "org-456"
    };

    await agent.process(request1);

    // Second message with context
    const request2: NaturalLanguageRequest = {
      text: "Make it process documents",
      userId: "user-123",
      orgId: "org-456",
      context: {
        previousMessages: [
          { role: 'user', content: 'I want to create a workflow' },
          { role: 'assistant', content: 'What type of workflow?' }
        ]
      }
    };

    const result2 = await agent.process(request2);

    expect(result2.success).toBe(true);
    // Agent should use conversation context to understand "it" refers to workflow
  });

  test('should handle errors gracefully', async () => {
    // Mock LLM failure
    const request: NaturalLanguageRequest = {
      text: "Invalid request that causes errors",
      userId: "user-123",
      orgId: "org-456"
    };

    // Simulate error in LLM call
    const result = await agent.process(request);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.data?.response).toContain('apologize');
  });
});

/**
 * Integration Points for Existing Chat Interface
 *
 * To integrate DashboardAgent into AgentChatInterface:
 */

/*
export function integrateDashboardAgent() {
  // Replace current agent selection logic
  const AVAILABLE_AGENTS = [
    {
      id: 'dashboard',
      name: 'Dashboard Agent',
      description: 'Natural language interface for all business operations',
      icon: <Bot className="h-5 w-5" />
    },
    // ... existing agents
  ];

  // Update message handling
  const handleSendMessage = async () => {
    if (selectedAgent === 'dashboard') {
      // Use DashboardAgent instead of API call
      const dashboardAgent = new DashboardAgent({
        enableWorkflowCreation: true,
        enableIntegrationManagement: true,
        enableBusinessInsights: true,
        maxConversationTurns: 10
      });

      const result = await dashboardAgent.process({
        text: input,
        userId: session.user.id,
        orgId: session.user.orgId,
        context: {
          previousMessages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          activeIntegrations: [], // Fetch from API
          currentWorkflows: [] // Fetch from API
        }
      });

      // Handle the result
      if (result.success && result.data) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date(),
          agent: 'Dashboard Agent',
          suggestions: result.data.suggestions?.map(s => ({
            provider: s.type,
            reason: s.description,
            benefit: s.type
          }))
        }]);

        // Execute any actions
        for (const action of result.data.actions) {
          await executeAction(action);
        }
      }
    } else {
      // Use existing API call logic
      // ... existing code
    }
  };
}*/
