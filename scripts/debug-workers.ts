
import { queueDocumentProcessing } from '../src/workers/queues/document-processing.queue';
import { queueIntakeRouting } from '../src/workers/queues/intakeRouting.queue';
import { queueProcessInbox } from '../src/workers/queues/schedulingAgent.queue';
import { redisConnection, closeRedisConnection } from '../src/workers/redis';

async function main() {
  const timestamp = Date.now();
  console.log(`[Debug] Starting worker queue tests at ${new Date().toISOString()}`);

  try {
    // 1. Test Document Processing Queue
    console.log('[Debug] 1. Testing Document Processing Queue...');
    const docId = `debug-doc-${timestamp}`;
    await queueDocumentProcessing({
      documentId: docId,
      orgId: 'debug-org',
      performOCR: true,
    });
    console.log(`[Debug] -> Document job queued with ID: ${docId}`);

    // 2. Test Intake Routing Queue
    console.log('[Debug] 2. Testing Intake Routing Queue...');
    const intakeId = `debug-intake-${timestamp}`;
    await queueIntakeRouting({
      intakeRequestId: intakeId,
      orgId: 'debug-org',
      source: 'API',
      title: 'Debug Intake Request',
      requestData: { test: true },
    });
    console.log(`[Debug] -> Intake job queued with ID: ${intakeId}`);

    // 3. Test Scheduling Agent Queue
    console.log('[Debug] 3. Testing Scheduling Agent Queue...');
    const taskId = `debug-task-${timestamp}`;
    await queueProcessInbox({
      taskId: taskId,
      userId: 'debug-user',
      priority: 3,
    });
    console.log(`[Debug] -> Scheduling job queued with ID: ${taskId}`);

    console.log('\n[Debug] All test jobs queued successfully.');
    console.log('[Debug] Please check your worker logs for the following processing messages:');
    console.log(`   - [Worker] Processing document ${docId}`);
    console.log(`   - [Worker:IntakeRouting] Job intake-${intakeId} completed`); // or started
    console.log(`   - [Worker:SchedulingAgent] Job process-inbox-${taskId} completed`); // or started

  } catch (err) {
    console.error('[Debug] Failed to queue jobs:', err);
  } finally {
    // Wait a moment for Redis commands to flush
    await new Promise(resolve => setTimeout(resolve, 1000));
    await closeRedisConnection();
    process.exit(0);
  }
}

main();
