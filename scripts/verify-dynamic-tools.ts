
import { AgentContextService } from '../src/lib/agent/services/AgentContextService';
import { integrationService } from '../src/lib/services/integration.service';
import { IntegrationProvider } from '@prisma/client';
import { DecisionType } from '../src/lib/agent/types/agent.types';

// Mock the integration service
const mockCredentials = [
    {
        provider: 'GOOGLE_CALENDAR' as IntegrationProvider,
        isActive: true,
        status: 'CONNECTED_ACTIVE',
        credentialName: 'Test Calendar',
        id: 'test-cred-id',
        userId: 'test-user',
        orgId: 'test-org',
        createdAt: new Date(),
        updatedAt: new Date(),
        // ... other required fields mocked
    }
];

// Monkey-patch the singleton
(integrationService as any).listCredentials = async (userId: string, orgId: string) => {
    console.log(`[Mock] listCredentials called for ${userId}`);
    return mockCredentials as any[];
};

async function verify() {
    console.log('Starting Dynamic Tool Verification...');

    const service = new AgentContextService({
        orgId: 'test-org',
        enabledActions: [DecisionType.ASSIGN_PIPELINE, DecisionType.CREATE_TASK] // Core actions
    });

    const agentInput = {
        rawContent: 'Schedule a meeting',
        source: 'TEXT',
        type: 'TEXT',
        timestamp: new Date(),
        metadata: { userId: 'test-user' }
    } as any;

    console.log('Building Decision Context...');
    const context = await service.buildDecisionContext(agentInput, 'test-agent');

    console.log('Available Actions:', context.availableActions);

    // Check if Core actions are present
    const hasCore = context.availableActions.includes(DecisionType.ASSIGN_PIPELINE);
    console.log(`Core Action (ASSIGN_PIPELINE) Present: ${hasCore}`);

    // Check if Supplemental actions are present
    const hasListEvents = context.availableActions.includes(DecisionType.LIST_EVENTS);
    console.log(`Supplemental Action (LIST_EVENTS) Present: ${hasListEvents}`);

    // Check if Active Integrations are correct
    const hasGoogleCalendar = context.availableIntegrations?.some(i => i.provider === 'GOOGLE_CALENDAR');
    console.log(`Active Integration (GOOGLE_CALENDAR) Present: ${hasGoogleCalendar}`);

    if (hasCore && hasListEvents && hasGoogleCalendar) {
        console.log('SUCCESS: Context logic correctly merges core and supplemental tools.');
    } else {
        console.error('FAILURE: Context logic failed to merge tools correctly.');
        process.exit(1);
    }

    // Verify System Prompt Injection
    console.log('Building System Prompt...');
    const activeProviders = context.availableIntegrations?.map(i => i.provider as IntegrationProvider) || [];
    const prompt = service.buildSystemPrompt(context.org, activeProviders);

    if (prompt.includes('"type": "LIST_EVENTS"')) {
        console.log('SUCCESS: System prompt contains dynamic action schemas.');
    } else {
        console.error('FAILURE: System prompt missing dynamic action schemas.');
        const schemaIndex = prompt.indexOf('### Action Parameter Schemas');
        if (schemaIndex !== -1) {
            console.log('Schema Section:', prompt.substring(schemaIndex, schemaIndex + 1000));
        } else {
            console.log('Schema Section NOT FOUND');
        }
    }
}

verify().catch(console.error);
