import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { Prisma, AgentTaskType } from '@prisma/client';
import type {
  SchedulingAgentJobData,
  ProcessInboxJobData,
  ScheduleMeetingJobData,
  SendResponseJobData,
  RetryTaskJobData,
} from '../queues/schedulingAgent.queue';
import {
  queueScheduleMeeting,
  queueSendResponse,
  queueRetryTask,
  queueProcessInbox,
} from '../queues/schedulingAgent.queue';
import * as conflictService from '@/lib/services/conflict.service';
import * as schedulingService from '@/lib/services/scheduling.service';
import { webhookService, WebhookEventType } from '@/lib/services/webhook.service';
import { smsService, type MeetingDetails } from '@/lib/services/sms.service';
import { sendSchedulingAgentEmail, type SchedulingAgentEmailOptions } from '@/lib/email';
import OpenAI from 'openai';

// Initialize OpenAI for task classification
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Task Classification Result
 */
interface TaskClassificationResult {
  taskType: AgentTaskType;
  intent: string;
  entities: {
    date?: string;
    time?: string;
    duration?: number;
    participants?: string[];
    subject?: string;
    location?: string;
    eventId?: string;
  };
  priority: number;
  confidence: number;
}

/**
 * Classify task content using AI
 */
async function classifyTask(rawContent: string): Promise<TaskClassificationResult> {
  const systemPrompt = `You are a scheduling assistant that classifies user requests.
Analyze the input and determine:
1. Task type (SCHEDULE_MEETING, RESCHEDULE_MEETING, CANCEL_MEETING, CHECK_AVAILABILITY, CREATE_TASK, UPDATE_TASK, INQUIRY, REMINDER, UNKNOWN)
2. Intent description
3. Extract entities: date, time, duration (minutes), participants (emails), subject, location, eventId
4. Priority (1-5, where 5 is highest urgency)
5. Confidence (0-1)

Return JSON:
{
  "taskType": "SCHEDULE_MEETING",
  "intent": "User wants to schedule a meeting",
  "entities": {
    "date": "2024-01-15",
    "time": "14:00",
    "duration": 60,
    "participants": ["john@example.com"],
    "subject": "Project Review",
    "location": "Conference Room A"
  },
  "priority": 3,
  "confidence": 0.95
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);

    // Validate task type
    const validTaskTypes: AgentTaskType[] = [
      'SCHEDULE_MEETING',
      'RESCHEDULE_MEETING',
      'CANCEL_MEETING',
      'CHECK_AVAILABILITY',
      'CREATE_TASK',
      'UPDATE_TASK',
      'INQUIRY',
      'REMINDER',
      'UNKNOWN',
    ];

    const taskType = validTaskTypes.includes(parsed.taskType)
      ? parsed.taskType
      : 'UNKNOWN';

    return {
      taskType,
      intent: String(parsed.intent || 'Classification completed'),
      entities: parsed.entities || {},
      priority: Math.min(5, Math.max(1, Number(parsed.priority) || 3)),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
    };
  } catch (error) {
    console.error('[SchedulingAgent] AI classification error:', error);
    // Return default classification on error
    return {
      taskType: 'UNKNOWN',
      intent: 'Classification failed - requires manual review',
      entities: {},
      priority: 3,
      confidence: 0,
    };
  }
}

/**
 * Scheduling Agent Processor
 *
 * Processes jobs from the scheduling-agent queue including:
 * - AI classification of incoming requests
 * - Meeting scheduling with conflict detection
 * - Response generation and delivery
 * - Task retry handling
 */
export async function processSchedulingAgent(job: Job<SchedulingAgentJobData>) {
  const { type, data } = job.data;

  console.log(`[SchedulingAgent] Processing job: ${job.name} (${job.id})`);

  switch (type) {
    case 'process-inbox':
      return processInbox(job, data);
    case 'schedule-meeting':
      return scheduleMeeting(job, data);
    case 'send-response':
      return sendResponse(job, data);
    case 'retry-task':
      return retryTask(job, data);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

/**
 * Process Inbox Handler
 *
 * Fetches the SchedulingAgentTask, runs AI classification,
 * and queues the next action based on task type.
 */
async function processInbox(
  job: Job<SchedulingAgentJobData>,
  data: ProcessInboxJobData
): Promise<{ success: boolean; taskId: string; taskType: string }> {
  const { taskId, userId } = data;
  const startTime = Date.now();

  console.log(`[SchedulingAgent:ProcessInbox] Processing task: ${taskId}`);

  try {
    // Fetch the SchedulingAgentTask
    const task = await prisma.schedulingAgentTask.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) {
      throw new Error(`SchedulingAgentTask not found: ${taskId}`);
    }

    await job.updateProgress(10);

    // Update status to PROCESSING
    await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: {
        status: 'PROCESSING',
      },
    });

    await job.updateProgress(30);

    // Run AI classification on the task content
    const classificationResult = await classifyTask(task.rawContent);

    console.log(`[SchedulingAgent:ProcessInbox] Classification result: ${classificationResult.taskType} (confidence: ${classificationResult.confidence})`);

    await job.updateProgress(70);

    // Update the task with classification results
    const processingTime = Date.now() - startTime;
    const aiMetadata: Prisma.InputJsonObject = {
      classificationResult: {
        taskType: classificationResult.taskType,
        intent: classificationResult.intent,
        entities: classificationResult.entities,
        confidence: classificationResult.confidence,
        priority: classificationResult.priority,
      },
      processedBy: 'gpt-4-turbo-preview',
      processedAt: new Date().toISOString(),
    };
    const updatedTask = await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: {
        taskType: classificationResult.taskType,
        intent: classificationResult.intent,
        entities: classificationResult.entities,
        confidence: classificationResult.confidence,
        priority: classificationResult.priority,
        processedAt: new Date(),
        processingTime,
        aiMetadata,
      },
    });

    await job.updateProgress(85);

    // Queue next action based on taskType
    await queueNextAction(updatedTask, userId);

    await job.updateProgress(100);

    console.log(`[SchedulingAgent:ProcessInbox] Task ${taskId} processed successfully (${processingTime}ms)`);

    return {
      success: true,
      taskId,
      taskType: classificationResult.taskType,
    };
  } catch (error) {
    console.error(`[SchedulingAgent:ProcessInbox] Error processing task ${taskId}:`, error);

    // Update task status to FAILED
    await updateTaskOnError(taskId, error);

    throw error;
  }
}

/**
 * Schedule Meeting Handler
 *
 * Executes meeting scheduling with conflict detection.
 */
async function scheduleMeeting(
  job: Job<SchedulingAgentJobData>,
  data: ScheduleMeetingJobData
): Promise<{ success: boolean; taskId: string; eventId?: string }> {
  const { taskId, schedulingData, checkConflicts = true } = data;

  console.log(`[SchedulingAgent:ScheduleMeeting] Scheduling meeting for task: ${taskId}`);

  try {
    // Fetch the task
    const task = await prisma.schedulingAgentTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`SchedulingAgentTask not found: ${taskId}`);
    }

    await job.updateProgress(20);

    // Update status to PROCESSING
    await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: { status: 'PROCESSING' },
    });

    await job.updateProgress(40);

    // Parse dates
    const startTime = new Date(schedulingData.startTime);
    const endTime = new Date(schedulingData.endTime);

    // Check for conflicts if requested
    if (checkConflicts) {
      console.log(`[SchedulingAgent:ScheduleMeeting] Checking conflicts for ${schedulingData.startTime} - ${schedulingData.endTime}`);

      const conflictResult = await conflictService.detectConflicts(
        data.userId,
        startTime,
        endTime,
        schedulingData.participants
      );

      if (conflictResult.hasConflict) {
        console.log(`[SchedulingAgent:ScheduleMeeting] Conflicts detected for task ${taskId}:`, conflictResult.conflicts.length);

        // Find alternative slots
        const alternatives = await conflictService.findAlternativeSlots(
          data.userId,
          (endTime.getTime() - startTime.getTime()) / (1000 * 60), // duration in minutes
          startTime
        );

        // Update task with proposed alternatives
        await prisma.schedulingAgentTask.update({
          where: { id: taskId },
          data: {
            status: 'AWAITING_INPUT',
            proposedSlots: alternatives.slice(0, 5) as unknown as Prisma.InputJsonValue,
            resolution: `Conflict detected with ${conflictResult.conflicts.length} event(s). ${alternatives.length} alternative slots available.`,
          },
        });

        // Queue response with alternatives
        await queueSendResponse({
          taskId,
          userId: data.userId,
          responseType: 'alternatives',
          channel: 'email',
        });

        return {
          success: false,
          taskId,
          eventId: undefined,
        };
      }
    }

    await job.updateProgress(60);

    // Create the SchedulingEvent
    const event = await schedulingService.createEvent({
      userId: data.userId,
      title: schedulingData.title,
      description: schedulingData.description,
      location: schedulingData.location,
      startTime,
      endTime,
      participantEmails: schedulingData.participants,
      isRecurring: false,
      syncToGoogle: true,
    });

    console.log(`[SchedulingAgent:ScheduleMeeting] Created event ${event.id} for task ${taskId}`);

    // Update task with scheduling result
    await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: {
        status: 'SCHEDULED',
        schedulingEventId: event.id,
        selectedSlot: {
          startTime: schedulingData.startTime,
          endTime: schedulingData.endTime,
          title: schedulingData.title,
        },
        resolution: `Meeting scheduled successfully: ${event.title} on ${startTime.toISOString()}`,
        completedAt: new Date(),
      },
    });

    await job.updateProgress(90);

    // Queue confirmation response to user
    await queueSendResponse({
      taskId,
      userId: data.userId,
      responseType: 'confirmation',
      channel: 'email',
    });

    await job.updateProgress(100);

    console.log(`[SchedulingAgent:ScheduleMeeting] Meeting scheduled for task: ${taskId}, event: ${event.id}`);

    return {
      success: true,
      taskId,
      eventId: event.id,
    };
  } catch (error) {
    console.error(`[SchedulingAgent:ScheduleMeeting] Error scheduling meeting for task ${taskId}:`, error);

    await updateTaskOnError(taskId, error);

    throw error;
  }
}

/**
 * Send email response to user
 */
async function sendEmailResponse(
  task: {
    id: string;
    userId: string;
    orgId: string | null;
    user: { email: string; name: string | null } | null;
    schedulingEventId: string | null;
    proposedSlots: unknown;
    selectedSlot: unknown;
    entities: unknown;
    title: string | null;
    intent: string | null;
  },
  responseType: 'confirmation' | 'alternatives' | 'clarification' | 'error',
  userId: string
): Promise<void> {
  if (!task.user?.email) {
    throw new Error('User email not found for task');
  }

  // Map error response type to clarification for email (error doesn't have a dedicated email template)
  const emailResponseType: 'confirmation' | 'alternatives' | 'clarification' | 'cancellation' =
    responseType === 'error' ? 'clarification' : responseType;

  // Build email options
  const emailOptions: SchedulingAgentEmailOptions = {
    recipientEmail: task.user.email,
    recipientName: task.user.name || 'there',
    taskId: task.id,
    responseType: emailResponseType,
  };

  // Fetch scheduling event details if available
  if (task.schedulingEventId) {
    const event = await prisma.schedulingEvent.findUnique({
      where: { id: task.schedulingEventId },
      select: {
        title: true,
        startTime: true,
        endTime: true,
        timezone: true,
        location: true,
        participantEmails: true,
      },
    });

    if (event) {
      emailOptions.meetingDetails = {
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        timezone: event.timezone,
        location: event.location || undefined,
        participants: event.participantEmails,
      };
    }
  } else if (task.selectedSlot) {
    // Use selectedSlot data if no event yet
    const slot = task.selectedSlot as Record<string, unknown>;
    if (slot.startTime && slot.endTime) {
      emailOptions.meetingDetails = {
        title: (slot.title as string) || task.title || 'Meeting',
        startTime: new Date(slot.startTime as string),
        endTime: new Date(slot.endTime as string),
        timezone: (slot.timezone as string) || 'UTC',
        location: slot.location as string | undefined,
        participants: slot.participants as string[] | undefined,
      };
    }
  } else if (task.entities) {
    // Try to build meeting details from entities
    const entities = task.entities as Record<string, unknown>;
    if (entities.date && entities.time) {
      const startTime = new Date(`${entities.date}T${entities.time}:00`);
      const duration = (entities.duration as number) || 60;
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      emailOptions.meetingDetails = {
        title: (entities.subject as string) || task.title || 'Meeting',
        startTime,
        endTime,
        timezone: (entities.timezone as string) || 'UTC',
        location: entities.location as string | undefined,
        participants: entities.participants as string[] | undefined,
      };
    }
  }

  // Add alternative slots if present
  if (responseType === 'alternatives' && task.proposedSlots) {
    const slots = task.proposedSlots as Array<{ startTime: string; endTime: string; confidence?: number }>;
    emailOptions.alternativeSlots = slots;
  }

  // Add clarification message if needed
  if (responseType === 'clarification' || responseType === 'error') {
    const entities = task.entities as Record<string, unknown> | null;
    const missingFields: string[] = [];

    if (!entities?.date) missingFields.push('date');
    if (!entities?.time) missingFields.push('time');
    if (!entities?.subject && !task.title) missingFields.push('meeting title/subject');

    if (responseType === 'error') {
      emailOptions.clarificationNeeded =
        task.intent ||
        'We encountered an issue processing your scheduling request. Please reply with more details or try rephrasing your request.';
    } else if (missingFields.length > 0) {
      emailOptions.clarificationNeeded =
        `To schedule your meeting, we need the following information:\n\n` +
        missingFields.map((field) => `- ${field.charAt(0).toUpperCase() + field.slice(1)}`).join('\n') +
        `\n\nPlease reply to this email with these details.`;
    } else {
      emailOptions.clarificationNeeded =
        task.intent ||
        'We need more information to complete your scheduling request. Please reply with additional details.';
    }
  }

  // Send the email with retry logic
  try {
    await sendSchedulingAgentEmail(emailOptions);
    console.log(`[SchedulingAgent:SendEmail] Email sent successfully to ${task.user.email} (${responseType})`);
  } catch (error) {
    console.error(`[SchedulingAgent:SendEmail] Failed to send email to ${task.user.email}:`, error);
    throw new Error(`Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send SMS response to user
 */
async function sendSmsResponse(
  task: {
    id: string;
    userId: string;
    orgId: string | null;
    user: { email: string; name: string | null } | null;
    schedulingEventId: string | null;
    proposedSlots: unknown;
    selectedSlot: unknown;
    entities: unknown;
    title: string | null;
    intent: string | null;
  },
  responseType: 'confirmation' | 'alternatives' | 'clarification' | 'error',
  recipientPhone?: string
): Promise<void> {
  // Validate phone number
  if (!recipientPhone) {
    throw new Error('Recipient phone number is required for SMS channel');
  }

  console.log(`[SchedulingAgent:SendSms] Sending ${responseType} SMS to ${recipientPhone}`);

  // Build meeting details from task
  let meetingDetails: MeetingDetails | null = null;

  // Try to extract meeting details from schedulingEvent
  if (task.schedulingEventId) {
    const event = await prisma.schedulingEvent.findUnique({
      where: { id: task.schedulingEventId },
      select: {
        title: true,
        startTime: true,
        endTime: true,
        location: true,
      },
    });

    if (event) {
      const duration = Math.round(
        (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
      );
      meetingDetails = {
        meetingTitle: event.title,
        startTime: event.startTime,
        location: event.location || undefined,
        duration,
      };
    }
  }

  // Fallback to selectedSlot if no event
  if (!meetingDetails && task.selectedSlot) {
    const slot = task.selectedSlot as Record<string, unknown>;
    if (slot.startTime && slot.endTime) {
      const startTime = new Date(slot.startTime as string);
      const endTime = new Date(slot.endTime as string);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      meetingDetails = {
        meetingTitle: (slot.title as string) || task.title || 'Meeting',
        startTime,
        location: slot.location as string | undefined,
        duration,
      };
    }
  }

  // Fallback to entities if still no details
  if (!meetingDetails && task.entities) {
    const entities = task.entities as Record<string, unknown>;
    if (entities.date && entities.time) {
      const startTime = new Date(`${entities.date}T${entities.time}:00`);
      const duration = (entities.duration as number) || 60;

      meetingDetails = {
        meetingTitle: (entities.subject as string) || task.title || 'Meeting',
        startTime,
        location: entities.location as string | undefined,
        duration,
      };
    }
  }

  // Send SMS based on response type
  try {
    let result;

    switch (responseType) {
      case 'confirmation':
        if (!meetingDetails) {
          throw new Error('Meeting details required for confirmation SMS');
        }
        result = await smsService.sendConfirmation(recipientPhone, meetingDetails);
        break;

      case 'alternatives':
        // For alternatives, send a simple message directing to email
        result = await smsService.sendSms(
          recipientPhone,
          'We found scheduling conflicts. Please check your email for alternative time slots.'
        );
        break;

      case 'clarification':
      case 'error':
        // For clarification/error, send a simple message directing to email
        result = await smsService.sendSms(
          recipientPhone,
          'We need more information to schedule your meeting. Please check your email for details.'
        );
        break;

      default:
        throw new Error(`Unsupported SMS response type: ${responseType}`);
    }

    if (result.skipped) {
      console.log(
        `[SchedulingAgent:SendSms] SMS sending skipped (Twilio not configured): ${result.error}`
      );
    } else if (!result.success) {
      throw new Error(`SMS delivery failed: ${result.error}`);
    } else {
      console.log(
        `[SchedulingAgent:SendSms] SMS sent successfully to ${recipientPhone} (${responseType})`
      );
    }
  } catch (error) {
    console.error(`[SchedulingAgent:SendSms] Failed to send SMS to ${recipientPhone}:`, error);
    throw new Error(`SMS delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send Response Handler
 *
 * Generates and sends response to user via specified channel.
 */
async function sendResponse(
  job: Job<SchedulingAgentJobData>,
  data: SendResponseJobData
): Promise<{ success: boolean; taskId: string; channel: string }> {
  const { taskId, responseType, channel } = data;

  console.log(`[SchedulingAgent:SendResponse] Sending ${responseType} response via ${channel} for task: ${taskId}`);

  try {
    // Fetch the task for context
    const task = await prisma.schedulingAgentTask.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!task) {
      throw new Error(`SchedulingAgentTask not found: ${taskId}`);
    }

    await job.updateProgress(30);

    // Send response via the specified channel
    switch (channel) {
      case 'email':
        await sendEmailResponse(task, responseType, data.userId);
        break;
      case 'sms':
        await sendSmsResponse(task, responseType, data.recipientPhone);
        break;
      case 'chat':
        console.log(`[SchedulingAgent:SendResponse] Would send chat message`);
        // TODO: Use chat service to send response
        break;
      case 'webhook':
        // Send webhook notification with retry logic
        if (!data.webhookUrl) {
          console.error(`[SchedulingAgent:SendResponse] No webhook URL provided for task ${taskId}`);
          throw new Error('Webhook URL is required for webhook channel');
        }

        // Map responseType to webhook event type
        const eventType = mapResponseTypeToWebhookEvent(responseType, task.status);

        // Build event details from task
        const eventDetails: Record<string, unknown> = {
          taskType: task.taskType,
          status: task.status,
          intent: task.intent,
          entities: task.entities || {},
        };

        // Add scheduling-specific details if available
        if (task.schedulingEventId) {
          eventDetails.eventId = task.schedulingEventId;
        }

        if (task.selectedSlot) {
          eventDetails.selectedSlot = task.selectedSlot;
        }

        if (task.proposedSlots) {
          eventDetails.proposedSlots = task.proposedSlots;
        }

        if (task.resolution) {
          eventDetails.resolution = task.resolution;
        }

        // Merge with any additional metadata
        if (data.metadata) {
          Object.assign(eventDetails, data.metadata);
        }

        console.log(`[SchedulingAgent:SendResponse] Sending webhook to ${data.webhookUrl} (event: ${eventType})`);

        // Send webhook with retry logic
        const webhookResult = await webhookService.sendWebhook(
          {
            event: eventType,
            data: {
              taskId,
              eventDetails,
              timestamp: new Date().toISOString(),
              userId: data.userId,
              orgId: task.orgId || undefined,
            },
          },
          {
            url: data.webhookUrl,
            secret: process.env.WEBHOOK_SECRET,
            maxRetries: 3,
            timeout: 30000, // 30 seconds
          }
        );

        if (!webhookResult.success) {
          console.error(
            `[SchedulingAgent:SendResponse] Webhook delivery failed after ${webhookResult.attempts} attempts: ${webhookResult.error}`
          );
          throw new Error(`Webhook delivery failed: ${webhookResult.error}`);
        }

        console.log(
          `[SchedulingAgent:SendResponse] Webhook delivered successfully in ${webhookResult.duration}ms ` +
          `(${webhookResult.attempts} attempt${webhookResult.attempts > 1 ? 's' : ''})`
        );
        break;
    }

    await job.updateProgress(80);

    // Log the response in task metadata
    await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: {
        aiMetadata: {
          ...(task.aiMetadata as Record<string, unknown> || {}),
          lastResponse: {
            type: responseType,
            channel,
            sentAt: new Date().toISOString(),
          },
        },
      },
    });

    await job.updateProgress(100);

    console.log(`[SchedulingAgent:SendResponse] Response sent for task: ${taskId}`);

    return {
      success: true,
      taskId,
      channel,
    };
  } catch (error) {
    console.error(`[SchedulingAgent:SendResponse] Error sending response for task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Retry Task Handler
 *
 * Retries a failed task by re-queuing it for processing.
 */
async function retryTask(
  job: Job<SchedulingAgentJobData>,
  data: RetryTaskJobData
): Promise<{ success: boolean; taskId: string; newAttempt: number }> {
  const { taskId, userId, reason, previousAttempts } = data;
  const newAttempt = previousAttempts + 1;

  console.log(`[SchedulingAgent:RetryTask] Retrying task: ${taskId} (attempt ${newAttempt})`);

  try {
    // Fetch the task
    const task = await prisma.schedulingAgentTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`SchedulingAgentTask not found: ${taskId}`);
    }

    await job.updateProgress(30);

    // Check if max retries exceeded
    const maxRetries = 5;
    if (newAttempt > maxRetries) {
      console.log(`[SchedulingAgent:RetryTask] Max retries (${maxRetries}) exceeded for task: ${taskId}`);

      await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          errorMessage: `Max retries (${maxRetries}) exceeded. Last error: ${reason}`,
          retryCount: newAttempt - 1,
        },
      });

      return {
        success: false,
        taskId,
        newAttempt,
      };
    }

    // Build retry history with proper Prisma types
    const existingMetadata = (task.aiMetadata as Prisma.JsonObject) || {};
    const existingRetryHistory = Array.isArray(existingMetadata.retryHistory)
      ? (existingMetadata.retryHistory as Prisma.JsonArray)
      : [];
    const newRetryEntry: Prisma.JsonObject = {
      attempt: newAttempt,
      reason,
      timestamp: new Date().toISOString(),
    };

    const updatedMetadata: Prisma.InputJsonObject = {
      ...existingMetadata,
      retryHistory: [...existingRetryHistory, newRetryEntry] as Prisma.InputJsonArray,
    };

    // Update retry count
    await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: {
        status: 'PENDING',
        retryCount: newAttempt,
        errorMessage: null,
        aiMetadata: updatedMetadata,
      },
    });

    await job.updateProgress(60);

    // Re-queue for processing
    await queueProcessInbox({
      taskId,
      userId,
      orgId: task.orgId || undefined,
      priority: task.priority,
    });

    await job.updateProgress(100);

    console.log(`[SchedulingAgent:RetryTask] Task ${taskId} re-queued for processing (attempt ${newAttempt})`);

    return {
      success: true,
      taskId,
      newAttempt,
    };
  } catch (error) {
    console.error(`[SchedulingAgent:RetryTask] Error retrying task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Queue next action based on task type
 */
async function queueNextAction(
  task: {
    id: string;
    userId: string;
    orgId: string | null;
    taskType: string;
    entities: unknown;
    title: string | null;
  },
  userId: string
): Promise<void> {
  switch (task.taskType) {
    case 'SCHEDULE_MEETING':
      // Extract scheduling data from entities and queue meeting
      const entities = task.entities as Record<string, unknown> | null;

      // Try to construct start/end times from entities
      let startTimeStr: string | undefined;
      let endTimeStr: string | undefined;

      if (entities?.startTime && entities?.endTime) {
        // Already have ISO timestamps
        startTimeStr = entities.startTime as string;
        endTimeStr = entities.endTime as string;
      } else if (entities?.date && entities?.time) {
        // Combine date and time to create ISO timestamps
        const date = entities.date as string;
        const time = entities.time as string;
        const duration = (entities.duration as number) || 60; // Default 60 minutes

        // Parse date and time
        const dateObj = new Date(`${date}T${time}:00`);
        if (!isNaN(dateObj.getTime())) {
          startTimeStr = dateObj.toISOString();
          const endDate = new Date(dateObj.getTime() + duration * 60 * 1000);
          endTimeStr = endDate.toISOString();
        }
      }

      if (startTimeStr && endTimeStr) {
        await queueScheduleMeeting({
          taskId: task.id,
          userId,
          orgId: task.orgId || undefined,
          schedulingData: {
            title: (entities?.subject as string) || task.title || 'Meeting',
            startTime: startTimeStr,
            endTime: endTimeStr,
            participants: entities?.participants as string[] | undefined,
            location: entities?.location as string | undefined,
            description: entities?.description as string | undefined,
          },
        });
      } else {
        // Need more info, send clarification request
        await queueSendResponse({
          taskId: task.id,
          userId,
          responseType: 'clarification',
          channel: 'email',
        });

        await prisma.schedulingAgentTask.update({
          where: { id: task.id },
          data: { status: 'AWAITING_INPUT' },
        });
      }
      break;

    case 'RESCHEDULE_MEETING':
    case 'CANCEL_MEETING':
    case 'CHECK_AVAILABILITY':
      // TODO: Implement handlers for these task types
      console.log(`[SchedulingAgent] Task type ${task.taskType} not yet implemented`);
      await prisma.schedulingAgentTask.update({
        where: { id: task.id },
        data: {
          status: 'AWAITING_INPUT',
          resolution: `Task type ${task.taskType} pending implementation`,
        },
      });
      break;

    case 'CREATE_TASK':
    case 'UPDATE_TASK':
      // TODO: Implement task creation/update handlers
      console.log(`[SchedulingAgent] Task type ${task.taskType} not yet implemented`);
      await prisma.schedulingAgentTask.update({
        where: { id: task.id },
        data: {
          status: 'AWAITING_INPUT',
          resolution: `Task type ${task.taskType} pending implementation`,
        },
      });
      break;

    case 'INQUIRY':
      // Send response to inquiry
      await queueSendResponse({
        taskId: task.id,
        userId,
        responseType: 'confirmation',
        channel: 'email',
      });
      break;

    case 'REMINDER':
      // TODO: Implement reminder scheduling
      console.log(`[SchedulingAgent] Task type REMINDER not yet implemented`);
      await prisma.schedulingAgentTask.update({
        where: { id: task.id },
        data: {
          status: 'COMPLETED',
          resolution: 'Reminder noted (implementation pending)',
        },
      });
      break;

    case 'UNKNOWN':
    default:
      // Request clarification for unknown task types
      await queueSendResponse({
        taskId: task.id,
        userId,
        responseType: 'clarification',
        channel: 'email',
      });

      await prisma.schedulingAgentTask.update({
        where: { id: task.id },
        data: { status: 'AWAITING_INPUT' },
      });
      break;
  }
}

/**
 * Update task status on error
 */
async function updateTaskOnError(taskId: string, error: unknown): Promise<void> {
  try {
    await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    });
  } catch (updateError) {
    console.error(`[SchedulingAgent] Failed to update task status on error:`, updateError);
  }
}

/**
 * Map response type and task status to webhook event type
 *
 * @param responseType - The type of response being sent
 * @param taskStatus - Current status of the task
 * @returns Appropriate webhook event type
 */
function mapResponseTypeToWebhookEvent(
  responseType: 'confirmation' | 'alternatives' | 'error' | 'clarification',
  taskStatus: string
): WebhookEventType {
  // Map based on responseType first
  switch (responseType) {
    case 'confirmation':
      // Check task status to determine if it's a confirmation, cancellation, or reschedule
      if (taskStatus === 'SCHEDULED') {
        return 'scheduling.confirmed';
      } else if (taskStatus === 'CANCELLED') {
        return 'scheduling.cancelled';
      } else if (taskStatus === 'RESCHEDULED') {
        return 'scheduling.rescheduled';
      }
      return 'scheduling.confirmed'; // Default confirmation

    case 'alternatives':
      // When alternatives are provided, there was a conflict
      return 'scheduling.conflict_detected';

    case 'clarification':
      // When clarification is needed, awaiting user input
      return 'scheduling.awaiting_input';

    case 'error':
      // Map error responses based on status
      if (taskStatus === 'AWAITING_INPUT') {
        return 'scheduling.awaiting_input';
      }
      return 'scheduling.conflict_detected'; // Default for errors

    default:
      return 'scheduling.confirmed';
  }
}
