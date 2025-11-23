import { NextResponse } from 'next/server';
import { initializeAgentSystem } from '@/lib/agent';

// Extend global type to include our custom property
declare global {
  var agentSystemInitialized: boolean | undefined;
}

export async function GET() {
  try {
    console.log('🔄 Manual agent system initialization requested...');

    if (globalThis.agentSystemInitialized) {
      return NextResponse.json({
        success: true,
        message: 'Agent system already initialized',
        initialized: true
      });
    }

    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    console.log('🤖 Initializing Orchestration Agent System...');
    console.log(`   Claude API Key: ${hasClaudeKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   OpenAI API Key: ${hasOpenAIKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Environment check - ANTHROPIC_API_KEY length: ${process.env.ANTHROPIC_API_KEY?.length || 0}`);
    console.log(`   Environment check - OPENAI_API_KEY length: ${process.env.OPENAI_API_KEY?.length || 0}`);

    if (hasClaudeKey || hasOpenAIKey) {
      console.log('🚀 Starting agent system initialization...');
      await initializeAgentSystem({
        enableWebhooks: true,
        enableEmail: true,
        enableDBTriggers: true,
        enableWorkerEvents: true,
      });

      globalThis.agentSystemInitialized = true;

      console.log('✅ Orchestration Agent System initialized successfully');
      console.log('   Features enabled: Webhooks, Email, DB Triggers, Worker Events');
      console.log('   Default LLM Provider: Claude (with OpenAI fallback)');
      console.log('   Agent will process intake requests automatically');

      return NextResponse.json({
        success: true,
        message: 'Agent system initialized successfully',
        initialized: true,
        features: ['webhooks', 'email', 'db-triggers', 'worker-events'],
        providers: {
          claude: hasClaudeKey,
          openai: hasOpenAIKey
        }
      });
    } else {
      console.warn('⚠️  No LLM API keys configured - Orchestration Agent disabled');
      console.log('   Intake creation will use fallback routing only');
      console.log('   To enable AI orchestration, add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env.local');

      return NextResponse.json({
        success: false,
        message: 'No API keys configured',
        initialized: false,
        error: 'Missing ANTHROPIC_API_KEY or OPENAI_API_KEY'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Failed to initialize Orchestration Agent System:', error);

    return NextResponse.json({
      success: false,
      message: 'Agent system initialization failed',
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}