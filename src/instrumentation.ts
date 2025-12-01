/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically called by Next.js when the server starts.
 * It's used to initialize the Orchestration Agent system on server startup.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeAgentSystem, getAgentInstance } = await import('@/lib/agent');

    console.log('[Instrumentation] Initializing agent system...');

    // Initialize system-wide components
    await initializeAgentSystem({
      enableWebhooks: true,
      enableEmail: true,
      enableDBTriggers: true,
      enableWorkerEvents: true,
    });

    // Start default org agent
    const defaultOrgId = process.env.DEFAULT_ORG_ID;
    if (defaultOrgId) {
      const agent = getAgentInstance(defaultOrgId);
      agent.start();
      console.log(`[Instrumentation] OA started for org: ${defaultOrgId}`);
    } else {
      console.warn('[Instrumentation] DEFAULT_ORG_ID not set, skipping agent startup');
    }
  }
}
