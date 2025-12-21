
import { Job } from 'bullmq';
import { processDocumentOCR } from './processors/ocr.processor';
import { processDocumentEmbedding } from './processors/embedding.processor';
import { processIntakeRouting } from './processors/intakeRouting.processor';
import { processCalendarSync } from './processors/calendarSync.processor';
import { processSchedulingReminder } from './processors/schedulingReminder.processor';
import { processSLAMonitor } from './processors/slaMonitor.processor';
import { processSchedulingAgent } from './processors/schedulingAgent.processor';
import { processHealthCheck } from './processors/health-check.processor';
import { processPendingItemsSync } from './processors/pendingItemsSync.processor';

/**
 * Omni-Processor for all platform background jobs
 * Reduces Redis connection count by using a single Worker instance
 */
export async function platformJobProcessor(job: Job) {
  const { name } = job;
  
  console.log(`[OmniWorker] Starting job: ${name} (ID: ${job.id})`);
  const startTime = Date.now();

  try {
    let result;
    
    switch (name) {
      // Document Processing
      case 'process-document':
        result = await processDocumentOCR(job as any);
        break;
      case 'embed-document':
        result = await processDocumentEmbedding(job as any);
        break;
        
      // Intake & Routing
      case 'route-intake':
        result = await processIntakeRouting(job as any);
        break;
        
      // Scheduling & Calendar
      case 'sync-calendar':
        result = await processCalendarSync(job as any);
        break;
      case 'send-reminder':
        result = await processSchedulingReminder(job as any);
        break;
      case 'process-inbox':
      case 'schedule-meeting':
      case 'send-response':
      case 'retry-task':
        result = await processSchedulingAgent(job as any);
        break;
        
      // System & Maintenance
      case 'check-sla':
        result = await processSLAMonitor(job as any);
        break;
      case 'health-check':
        result = await processHealthCheck(job as any);
        break;
      case 'sync-pending-items':
        result = await processPendingItemsSync(job as any);
        break;
        
      default:
        console.warn(`[OmniWorker] Unknown job name: ${name}`);
        throw new Error(`Unknown job name: ${name}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[OmniWorker] Job completed: ${name} (ID: ${job.id}) in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[OmniWorker] Job FAILED: ${name} (ID: ${job.id}) in ${duration}ms:`, error);
    throw error;
  }
}
