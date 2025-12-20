import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { ActionExecutor } from './ActionExecutor';
import { OrchestrationAgent } from './OrchestrationAgent';
import { DecisionType, LLMProvider, AgentInputSource } from '../types/agent.types';
import { prisma } from '@/lib/prisma';

/**
 * Golden Thread Integration Test
 * 
 * Verifies that the agent can connect intake events to proactive business actions.
 */
async function testGoldenThread() {
    console.log('--- Starting Golden Thread Integration Test ---');

    const orgId = 'test-org-id';
    const userId = 'test-user-id';

    // 1. Setup Orchestration Agent
    const orchestrator = new OrchestrationAgent({
        orgId,
        llmProvider: LLMProvider.CLAUDE,
        llmModel: 'claude-3-5-sonnet-20241022',
        temperature: 0,
        autoExecuteThreshold: 0.1, // Force auto-execute for testing
        requireApprovalThreshold: 0.05,
        enabledActions: Object.values(DecisionType) as DecisionType[],
        maxActionsPerMinute: 100,
        maxActionsPerHour: 1000,
        notifyOnHighPriority: false,
        notifyOnFailure: false,
        escalationEmail: 'admin@astralisone.com'
    });

    // 2. Mock an intake event with high-value content
    const intakeInput = {
        type: 'INTAKE_CREATED',
        source: AgentInputSource.WEBHOOK,
        rawContent: 'Priority: Critical. We have a production outage on the payment portal. Also, we need to follow up with the CFO regarding the enterprise contract.',
        timestamp: new Date(),
        metadata: {
            userId,
            orgId,
        }
    };

    console.log('Processing high-value intake...');

    try {
        const decision = await orchestrator.process(intakeInput as any);

        console.log('Decision Intent:', decision.intent);
        console.log('Actions Triggered:', decision.actions.map(a => a.type).join(', '));

        // 3. Verify that the agent suggested proactive actions
        const hasPulseCheck = decision.actions.some(a => a.type === DecisionType.GET_BUSINESS_PULSE);
        const hasBusinessEmail = decision.actions.some(a => a.type === DecisionType.SEND_BUSINESS_EMAIL);

        if (hasPulseCheck || hasBusinessEmail) {
            console.log('✅ Golden Thread verification: Proactive actions detected!');
        } else {
            console.warn('⚠️ Golden Thread verification: No proactive actions were suggested by the LLM.');
        }

        // 4. Verify results if any
        if (decision.executionResults) {
            console.log('Execution Results Summary:');
            decision.executionResults.forEach((res, i) => {
                const actionType = decision.actions[i].type;
                // Distinguish between business success and technical execution success for NO_ACTION
                const status = res.success ? (actionType === DecisionType.NO_ACTION ? 'NEUTRAL (No Action Taken)' : '✅ Success') : '❌ Failed';
                console.log(`  Action ${i + 1} (${actionType}): ${status}`);

                if (actionType === DecisionType.NO_ACTION && res.success) {
                    console.warn(`  ⚠️  Note: Action was technically successful but resulted in NO_ACTION. Reason: ${res.data?.noActionReason || 'None provided'}`);
                }
            });
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

// Run the test
testGoldenThread();
