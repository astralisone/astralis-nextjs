
import { createOrchestrationAgent } from '../src/lib/agent/core/OrchestrationAgent';
import { AgentEventBus } from '../src/lib/agent/inputs/EventBus';
import { AgentInputSource, DecisionType } from '../src/lib/agent/types/agent.types';

// 0. Setup Environment
import fs from 'fs';
import path from 'path';

// Manually load .env.local if present and not already executing in a robust environment
// (Verify script often runs in isolation via tsx)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log('Loading .env.local...');
    const envConfig = fs.readFileSync(envLocalPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key.trim()]) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
        }
    });
}

async function main() {
    console.log('=== Verifying Refactored Orchestration Agent ===');

    try {


        // 1. Initialize Agent
        console.log('Initializing Agent...');
        const agent = createOrchestrationAgent({
            orgId: 'verify-org-123',
            dryRun: true, // Safety first
            enabledActions: [DecisionType.CREATE_TASK, DecisionType.SEND_NOTIFICATION],
            maxActionsPerMinute: 10,
        });



        await agent.start();
        console.log('Agent started successfully.');

        // 2. Test Standard Event Processing
        console.log('Testing Standard Event Processing (intake:received)...');
        const eventBus = AgentEventBus.getInstance();

        // Emit event and wait a bit for async processing (since handleEvent is void/async)
        // In a real test we'd mock the decision engine, but here we just want to ensure NO CRASH.
        await eventBus.emit('intake:received', {
            id: 'intake-1',
            title: 'Test Intake',
            description: 'Testing the agent refactor',
            source: 'EMAIL',
        }, { source: 'system' });

        // Give it a moment to process
        await new Promise(r => setTimeout(r, 2000));
        console.log('Event emitted. Checking agent stats...');

        const stats = agent.getStats();
        console.log('Agent Stats:', JSON.stringify(stats, null, 2));

        if (stats.totalEventsProcessed > 0) {
            console.log('✅ Standard event processed (stat incremented).');
        } else {
            console.warn('⚠️ Standard event might not have been processed yet.');
        }

        // 3. Test Task Execution Event
        console.log('Testing Task Execution Event (task:created)...');
        await eventBus.emit('task:created', {
            id: 'task-123',
            title: 'Auto Task',
            orgId: 'verify-org-123',
        }, { source: 'system' });

        await new Promise(r => setTimeout(r, 1000));
        console.log('✅ task:created event emitted (no crash observed).');

        // 4. Verify Context Service Integration (indirectly via process success above)
        // If stats.totalDecisions > 0 or totalEventsProcessed > 0, context service worked enough to not crash.

        await agent.stop();
        console.log('=== Verification Complete ===');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
}

main();
