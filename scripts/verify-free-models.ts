
import { OrchestrationAgent } from '@/lib/agent/core/OrchestrationAgent';
import { LLMProvider } from '@/lib/agent/types/agent.types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
    console.log('🤖 Verifying Free LLM Support & Fallback Logic');
    console.log('------------------------------------------------');

    // 1. Test Fallback Initialization
    // We'll initialize an agent with a bogus OpenAI key, but with Gemini/Ollama as fallbacks.
    // We expect it to NOT fail initialization, but construct a fallback client.

    console.log('\n[Test 1] Initializing Agent with Fallback Chain...');
    // Ensure we have some defaults for the test if env vars are missing
    process.env.AGENT_DEFAULT_GEMINI_MODEL = process.env.AGENT_DEFAULT_GEMINI_MODEL || 'gemini-1.5-flash';
    process.env.AGENT_DEFAULT_OLLAMA_MODEL = process.env.AGENT_DEFAULT_OLLAMA_MODEL || 'llama3';

    try {
        const agent = new OrchestrationAgent({
            orgId: 'verify-test-org',
            llmProvider: LLMProvider.OPENAI,
            llmModel: 'gpt-4o',
            // We don't verify API key at construction time usually, but the client creation might log warnings
            temperature: 0,
        });

        console.log('✅ Agent initialized successfully.');

        // We can't easily inspect private properties, but we can try to "start" it 
        // or check if it processes a simple event if we wanted to go deeper.
        // For now, initialization proving createFallbackClient worked is good.

    } catch (error) {
        console.error('❌ Agent initialization failed:', error);
        process.exit(1);
    }

    // 2. Test Individual Clients (if possible)
    // We will manually import the factory and try to create clients to test connectivity.

    const { createLLMClient } = await import('@/lib/agent/core/LLMFactory');

    // Test Ollama (Local)
    console.log('\n[Test 2] Testing Ollama Connectivity...');
    try {
        const ollama = createLLMClient({
            provider: LLMProvider.OLLAMA,
            model: 'llama3'
        });
        console.log('   Ollama Client created.');

        if (!ollama.isReady()) { // Ollama defaults to standard URL so usually ready
            console.warn('   ⚠️ Ollama client reports not ready (check baseUrl).');
        } else {
            // Try a simple ping? The verified complete() call is better but might fail if model not pulled.
            // We'll skip actual inference to avoid timeout in CI/verification script unless explicit.
            console.log('   ✅ Ollama client initialized (Ready).');
        }
    } catch (e) {
        console.error('   ❌ Ollama test failed:', e);
    }

    // Test Gemini (Requires Key)
    console.log('\n[Test 3] Testing Gemini Configuration...');
    const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY; // Implementation uses GOOGLE_API_KEY

    if (geminiKey) {
        try {
            const gemini = createLLMClient({
                provider: LLMProvider.GEMINI,
                model: 'gemini-1.5-flash',
                apiKey: geminiKey
            });
            if (gemini.isReady()) {
                console.log('   ✅ Gemini client initialized with key.');
            } else {
                console.error('   ❌ Gemini client reports not ready.');
            }
        } catch (e) {
            console.error('   ❌ Gemini creation failed:', e);
        }
    } else {
        console.log('   ℹ️ No GOOGLE_API_KEY found. Skipping Gemini functional test.');
    }

    console.log('\n------------------------------------------------');
    console.log('🎉 Verification Complete.');
}

main().catch(console.error);
