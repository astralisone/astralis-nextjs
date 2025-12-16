
import { OrchestrationAgent } from '../src/lib/agent/core/OrchestrationAgent';
import { ChatAgent } from '../src/lib/agent/core/ChatAgent';
import { LLMProvider, DecisionType, AgentDecisionResult, DecisionStatusEnum } from '../src/lib/agent/types/agent.types';

// Mock LLM Response for testing without API keys if needed
class MockOrchestrationAgent extends OrchestrationAgent {
    // Mock creating LLM client to avoid API key check
    protected createLLMClient(): any {
        return {
            generate: async () => {
                return "Mock response";
            },
            initialize: async () => {
                return true;
            }
        };
    }

    async makeLLMDecision(systemPrompt: string, userPrompt: string): Promise<string> {
        console.log('[MockAgent] Received Prompt:', userPrompt.substring(0, 100) + '...');

        // Simulate response for "Check integrations"
        if (userPrompt.includes('integration') || userPrompt.includes('status')) {
            return JSON.stringify({
                reasoning: "User wants to check integration status. I should use the GET_INTEGRATIONS_STATUS tool.",
                intent: {
                    primary: 'INFO_REQUEST',
                    confidence: 0.9
                },
                actions: [
                    {
                        type: "GET_INTEGRATIONS_STATUS",
                        params: {},
                        reasoning: "Fetching integration status"
                    }
                ],
                requiresApproval: false,
                confidence: 0.9,
                priority: "HIGH"
            });
        }

        return JSON.stringify({
            reasoning: "I don't know what to do.",
            intent: {
                primary: 'unknown',
                confidence: 0.5
            },
            actions: [],
            confidence: 0.5,
            requiresApproval: false,
            priority: "LOW"
        });
    }
}

async function main() {
    console.log('Starting Verification...');

    // Initialize Agent
    const orchestrator = new MockOrchestrationAgent({
        orgId: 'test-org',
        llmProvider: LLMProvider.CLAUDE,
        llmModel: 'claude-3-5-sonnet-20241022',
        temperature: 0,
        // Enable auto-execute to test the OmniscientTools handler
        autoExecuteThreshold: 0.1,
        requireApprovalThreshold: 0.0,
        enabledActions: [
            DecisionType.GET_INTEGRATIONS_STATUS,
            DecisionType.LIST_ACTIVE_AUTOMATIONS,
            DecisionType.NO_ACTION
        ],
    });

    // We need to initialize it to register handlers
    // In real app 'start()' does this but also starts listeners. we just need setup.
    // OrchestrationAgent constructor calls 'registerDefaultHandlers' via ActionExecutor init
    // But our 'OmniscientTools' registration logic in ActionExecutor is likely dynamic import.
    // We need to wait a bit or ensure it's loaded.

    // Hack: Wait for dynamic import in ActionExecutor
    await new Promise(r => setTimeout(r, 1000));

    const chatAgent = new ChatAgent({
        orchestrationAgent: orchestrator,
        maxTurns: 3
    });

    // Test 1: Check Integrations
    console.log('\n--- Test 1: "Check my integrations" ---');
    const response1 = await chatAgent.chat("Check my integrations status");

    console.log('Response:', response1.message);
    console.log('Steps:', JSON.stringify(response1.steps, null, 2));

    if (response1.steps && response1.steps.length > 0) {
        console.log('✅ Tool execution detected.');
        const observation = response1.steps[0].observation;
        if (observation.includes('integrations')) {
            console.log('✅ Integrations data found in observation.');
        } else {
            console.log('❌ Integrations data NOT found in observation.');
        }
    } else {
        console.log('❌ No tool execution steps.');
    }

    process.exit(0);
}

main().catch(console.error);
