
import { ActionExecutor } from '../src/lib/agent/core/ActionExecutor';
import { DecisionType } from '../src/lib/agent/types/agent.types';

async function main() {
    console.log('Initializing ActionExecutor...');
    const executor = new ActionExecutor({ dryRun: true, orgId: 'test-org', userId: 'test-user' });

    console.log('Testing GET_KANBAN_STATE with dryRun: true');
    try {
        const result = await executor.execute([
            {
                type: DecisionType.GET_KANBAN_STATE,
                params: {},
            }
        ]);

        console.log('Result:', JSON.stringify(result, null, 2));

        const handlerResult = result.results.find(r => r.action === DecisionType.GET_KANBAN_STATE);

        if (handlerResult?.success && handlerResult.data?.columns) {
            console.log('SUCCESS: GET_KANBAN_STATE handler found and returned data.');
        } else {
            console.error('FAILURE: GET_KANBAN_STATE payload incorrect or handler missing.');
            console.error('Available handlers might be missing or execute failed.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Execution Failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);
