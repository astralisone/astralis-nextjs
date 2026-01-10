
import { createLLMClient, LLMFactoryConfig } from './src/lib/agent/core/LLMFactory';
import { LLMProvider } from './src/lib/agent/types/agent.types';
import { OllamaClient } from './src/lib/agent/core/OllamaClient';

// Mock process.env
process.env.OLLAMA_BASE_URL = 'http://localhost:11434';

async function test() {
    console.log('Testing LLMFactory with undefined model...');

    try {
        // Simulate what might happen if model is cast to undefined
        const config: any = {
            provider: 'OLLAMA',
            model: undefined
        };

        const client = createLLMClient(config);
        console.log('Client created:', client);
        console.log('Client model:', client.model); // Should be undefined

        if (client instanceof OllamaClient) {
            // Check private fields or verify behavior
            // We can't easily call protected _complete, but we can check if model property is set
        }

    } catch (error) {
        console.error('Error creating client:', error);
    }

    console.log('\nTesting JSON stringify with undefined model...');
    const body = {
        model: undefined,
        messages: []
    };
    console.log('Stringified:', JSON.stringify(body));
}

test();
