
import { getQueueStats as getDocStats } from './queues/document-processing.queue';
import { getEmbeddingQueueStats } from './queues/document-embedding.queue';
import { getIntakeRoutingQueueStats } from './queues/intakeRouting.queue';
import { getSchedulingAgentQueueStats } from './queues/schedulingAgent.queue';
import { closeRedisConnection } from './redis';

async function checkQueueStats() {
  try {
    console.log('--- Worker Queue Statistics ---');
    
    const docStats = await getDocStats();
    console.log('Document Processing:', docStats);

    const embeddingStats = await getEmbeddingQueueStats();
    console.log('Document Embedding:', embeddingStats);

    const intakeStats = await getIntakeRoutingQueueStats();
    console.log('Intake Routing:', intakeStats);

    const schedulingStats = await getSchedulingAgentQueueStats();
    console.log('Scheduling Agent:', schedulingStats);

  } catch (error) {
    console.error('Error fetching queue stats:', error);
  } finally {
    await closeRedisConnection();
    process.exit(0);
  }
}

checkQueueStats();
