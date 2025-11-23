/**
 * AI Routing Service
 *
 * Provides intelligent intake request classification and routing using GPT-4.
 * Features:
 * - Content classification (category, subcategory, tags)
 * - Priority assignment (1-5 scale)
 * - Automatic team member assignment based on role matching
 * - Pipeline routing based on category matching
 * - Full intake processing pipeline with error handling
 */

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { IntakeSource, IntakeStatus, UserRole, Prisma } from '@prisma/client';

/**
 * Classification categories for intake requests
 */
export type ClassificationCategory =
  | 'SALES_INQUIRY'
  | 'SUPPORT_REQUEST'
  | 'BILLING_QUESTION'
  | 'PARTNERSHIP'
  | 'GENERAL';

/**
 * Priority levels for intake requests
 * 1 = Low (general inquiries, no urgency)
 * 2 = Normal (standard requests, reasonable timeline)
 * 3 = Medium (business impact, needs attention this week)
 * 4 = High (urgent client issue, revenue impact)
 * 5 = Critical (emergency, immediate action required)
 */
export type PriorityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Result of AI classification
 */
export interface ClassificationResult {
  category: ClassificationCategory;
  subcategory: string;
  priority: PriorityLevel;
  tags: string[];
  suggestedAssignee?: string;
  suggestedPipeline?: string;
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * Routing decision after classification
 */
export interface RoutingDecision {
  assignedToId?: string;
  assignedPipelineId?: string;
  priority: PriorityLevel;
  tags: string[];
  routingMeta: RoutingMeta;
}

/**
 * Metadata stored with routing decisions
 */
export interface RoutingMeta {
  category: ClassificationCategory;
  subcategory: string;
  confidence: number;
  reasoning: string;
  classifiedAt: string;
  aiModel: string;
  suggestedAssignee?: string;
  suggestedPipeline?: string;
  assignmentMethod?: 'role_match' | 'load_balance' | 'fallback' | 'none';
  pipelineMatchMethod?: 'name_match' | 'description_match' | 'none';
  error?: string;
  failedAt?: string;
}

/**
 * Role mapping for assignee suggestions
 */
const ROLE_MAPPING: Record<string, UserRole[]> = {
  sales: [UserRole.ADMIN, UserRole.OPERATOR],
  support: [UserRole.OPERATOR, UserRole.ADMIN],
  billing: [UserRole.ADMIN],
  technical: [UserRole.OPERATOR, UserRole.ADMIN],
  account_manager: [UserRole.PM, UserRole.ADMIN],
  project_manager: [UserRole.PM, UserRole.OPERATOR],
  general: [UserRole.OPERATOR, UserRole.ADMIN, UserRole.PM],
};

/**
 * AI Routing Service
 *
 * Handles classification and routing of intake requests using GPT-4.
 */
export class AIRoutingService {
  private openai: OpenAI;
  private classificationModel = 'gpt-4-turbo-preview';

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    console.log('[AIRoutingService] Initializing OpenAI client');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
      maxRetries: 2,
    });
  }

  /**
   * Classify incoming request using GPT-4
   *
   * @param title - Request title
   * @param description - Request description/body
   * @param source - Source of the request (FORM, EMAIL, CHAT, API)
   * @param metadata - Additional metadata about the request
   * @returns Classification result with category, priority, tags, and confidence
   */
  async classifyRequest(
    title: string,
    description: string,
    source: IntakeSource,
    metadata?: Record<string, unknown>
  ): Promise<ClassificationResult> {
    const systemPrompt = `You are an AI intake routing assistant for a professional services business.
Analyze incoming requests and classify them for routing.

Categories:
- SALES_INQUIRY: New business opportunities, pricing questions, demo requests, product inquiries
- SUPPORT_REQUEST: Existing client issues, bugs, technical help, troubleshooting
- BILLING_QUESTION: Invoice questions, payment issues, subscription changes, refunds
- PARTNERSHIP: Collaboration proposals, integration requests, affiliate inquiries
- GENERAL: Everything else that doesn't fit the above categories

Priority Levels (1-5):
1 = Low: General inquiries with no urgency, informational requests
2 = Normal: Standard requests with reasonable timeline, routine matters
3 = Medium: Business impact, needs attention this week, potential revenue
4 = High: Urgent client issue, direct revenue impact, time-sensitive
5 = Critical: Emergency, system down, immediate action required, major client at risk

Assignee Suggestions (based on request type):
- sales: For sales inquiries, demos, pricing
- support: For technical issues, bugs, help requests
- billing: For payment, invoice, subscription issues
- technical: For complex technical questions, integrations
- account_manager: For existing client relationship matters
- project_manager: For project-related requests
- general: When unclear who should handle

You MUST return a valid JSON object with these exact fields:
{
  "category": "SALES_INQUIRY" | "SUPPORT_REQUEST" | "BILLING_QUESTION" | "PARTNERSHIP" | "GENERAL",
  "subcategory": "string describing specific type",
  "priority": 1 | 2 | 3 | 4 | 5,
  "tags": ["array", "of", "relevant", "tags"],
  "suggestedAssignee": "sales" | "support" | "billing" | "technical" | "account_manager" | "project_manager" | "general",
  "suggestedPipeline": "optional pipeline name suggestion",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of classification decision"
}`;

    const userPrompt = `Classify this intake request:

Title: ${title || 'No title provided'}
Description: ${description || 'No description provided'}
Source: ${source}
${metadata ? `Additional Context: ${JSON.stringify(metadata, null, 2)}` : ''}

Return a JSON classification.`;

    console.log(`[AIRoutingService] Classifying request: "${title?.substring(0, 50)}..."`);
    const startTime = Date.now();

    try {
      const response = await this.openai.chat.completions.create({
        model: this.classificationModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temperature for more consistent classifications
        max_tokens: 500,
      });

      const duration = Date.now() - startTime;
      console.log(`[AIRoutingService] Classification completed in ${duration}ms`);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No classification response from AI');
      }

      const parsed = JSON.parse(content);

      // Validate and normalize the response
      const result: ClassificationResult = {
        category: this.validateCategory(parsed.category),
        subcategory: String(parsed.subcategory || 'general'),
        priority: this.validatePriority(parsed.priority),
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
        suggestedAssignee: parsed.suggestedAssignee
          ? String(parsed.suggestedAssignee)
          : undefined,
        suggestedPipeline: parsed.suggestedPipeline
          ? String(parsed.suggestedPipeline)
          : undefined,
        confidence: this.validateConfidence(parsed.confidence),
        reasoning: String(parsed.reasoning || 'Classification completed'),
      };

      console.log(
        `[AIRoutingService] Classified as ${result.category} with priority ${result.priority} (confidence: ${result.confidence})`
      );

      return result;
    } catch (error) {
      console.error('[AIRoutingService] Classification error:', error);

      if (error instanceof Error) {
        console.error('[AIRoutingService] Error details:', {
          name: error.name,
          message: error.message,
        });
      }

      throw new Error(
        `Failed to classify request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Route request to appropriate team member or pipeline
   *
   * @param orgId - Organization ID
   * @param classification - Classification result from classifyRequest
   * @returns Routing decision with assigned user, pipeline, and metadata
   */
  async routeRequest(
    orgId: string,
    classification: ClassificationResult
  ): Promise<RoutingDecision> {
    console.log(
      `[AIRoutingService] Routing request for org ${orgId}, category: ${classification.category}`
    );

    // Fetch organization's team members and pipelines in parallel
    const [teamMembers, pipelines] = await Promise.all([
      prisma.users.findMany({
        where: { orgId, isActive: true },
        select: { id: true, role: true, email: true, name: true },
      }),
      prisma.pipeline.findMany({
        where: { orgId, isActive: true },
        select: { id: true, name: true, description: true },
      }),
    ]);

    console.log(
      `[AIRoutingService] Found ${teamMembers.length} team members and ${pipelines.length} pipelines`
    );

    let assignedPipelineId: string | undefined;
    let pipelineMatchMethod: RoutingMeta['pipelineMatchMethod'] = 'none';

    // Match category to pipeline by name
    const pipelineNameMatch = pipelines.find(
      (p) =>
        p.name.toLowerCase().includes(classification.category.toLowerCase()) ||
        p.name
          .toLowerCase()
          .includes(classification.category.replace('_', ' ').toLowerCase())
    );

    if (pipelineNameMatch) {
      assignedPipelineId = pipelineNameMatch.id;
      pipelineMatchMethod = 'name_match';
      console.log(
        `[AIRoutingService] Matched pipeline by name: ${pipelineNameMatch.name}`
      );
    } else {
      // Try matching by description
      const pipelineDescMatch = pipelines.find(
        (p) =>
          p.description
            ?.toLowerCase()
            .includes(classification.category.toLowerCase()) ||
          p.description
            ?.toLowerCase()
            .includes(classification.subcategory.toLowerCase())
      );

      if (pipelineDescMatch) {
        assignedPipelineId = pipelineDescMatch.id;
        pipelineMatchMethod = 'description_match';
        console.log(
          `[AIRoutingService] Matched pipeline by description: ${pipelineDescMatch.name}`
        );
      }
    }

    // Also check suggested pipeline name
    if (!assignedPipelineId && classification.suggestedPipeline) {
      const suggestedMatch = pipelines.find(
        (p) =>
          p.name
            .toLowerCase()
            .includes(classification.suggestedPipeline!.toLowerCase()) ||
          classification.suggestedPipeline!
            .toLowerCase()
            .includes(p.name.toLowerCase())
      );

      if (suggestedMatch) {
        assignedPipelineId = suggestedMatch.id;
        pipelineMatchMethod = 'name_match';
        console.log(
          `[AIRoutingService] Matched suggested pipeline: ${suggestedMatch.name}`
        );
      }
    }

    let assignedToId: string | undefined;
    let assignmentMethod: RoutingMeta['assignmentMethod'] = 'none';

    // Match suggested role to team member
    if (classification.suggestedAssignee && teamMembers.length > 0) {
      const targetRoles =
        ROLE_MAPPING[classification.suggestedAssignee.toLowerCase()] ||
        ROLE_MAPPING.general;

      const matchedMember = teamMembers.find((m) =>
        targetRoles.includes(m.role as UserRole)
      );

      if (matchedMember) {
        assignedToId = matchedMember.id;
        assignmentMethod = 'role_match';
        console.log(
          `[AIRoutingService] Assigned to ${matchedMember.name || matchedMember.email} by role match`
        );
      }
    }

    // Load balance if no specific assignment
    if (!assignedToId && teamMembers.length > 0) {
      assignedToId = await this.loadBalanceAssignment(orgId, teamMembers);
      assignmentMethod = assignedToId ? 'load_balance' : 'none';
    }

    // Fallback to first available team member
    if (!assignedToId && teamMembers.length > 0) {
      assignedToId = teamMembers[0].id;
      assignmentMethod = 'fallback';
      console.log(
        `[AIRoutingService] Fallback assignment to ${teamMembers[0].name || teamMembers[0].email}`
      );
    }

    const routingMeta: RoutingMeta = {
      category: classification.category,
      subcategory: classification.subcategory,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      classifiedAt: new Date().toISOString(),
      aiModel: this.classificationModel,
      suggestedAssignee: classification.suggestedAssignee,
      suggestedPipeline: classification.suggestedPipeline,
      assignmentMethod,
      pipelineMatchMethod,
    };

    return {
      assignedToId,
      assignedPipelineId,
      priority: classification.priority,
      tags: classification.tags,
      routingMeta,
    };
  }

  /**
   * Process intake request through full AI routing pipeline
   *
   * @param intakeId - ID of the intake request to process
   * @returns void - Updates the intake request in the database
   */
  async processIntakeRequest(intakeId: string): Promise<void> {
    console.log(`[AIRoutingService] Processing intake request: ${intakeId}`);

    // Fetch the intake request
    const intake = await prisma.intakeRequest.findUnique({
      where: { id: intakeId },
      include: { organization: true },
    });

    if (!intake) {
      throw new Error(`Intake request ${intakeId} not found`);
    }

    // Update status to ROUTING
    await prisma.intakeRequest.update({
      where: { id: intakeId },
      data: { status: IntakeStatus.ROUTING },
    });

    console.log(`[AIRoutingService] Status updated to ROUTING for ${intakeId}`);

    try {
      // Classify the request
      const classification = await this.classifyRequest(
        intake.title,
        intake.description || '',
        intake.source,
        intake.requestData as Record<string, unknown>
      );

      // Route the request
      const routing = await this.routeRequest(intake.orgId, classification);

      // Determine final status
      const newStatus = routing.assignedToId
        ? IntakeStatus.ASSIGNED
        : IntakeStatus.NEW;

      // Update intake with routing decision
      await prisma.intakeRequest.update({
        where: { id: intakeId },
        data: {
          status: newStatus,
          priority: routing.priority,
          assignedPipeline: routing.assignedPipelineId,
          aiRoutingMeta: routing.routingMeta as unknown as Prisma.InputJsonValue,
        },
      });

      console.log(
        `[AIRoutingService] Intake ${intakeId} routed successfully - Status: ${newStatus}, Priority: ${routing.priority}`
      );

      // TODO: Send notification to assigned team member
      // This would integrate with a notification service
    } catch (error) {
      console.error(
        `[AIRoutingService] Error processing intake ${intakeId}:`,
        error
      );

      // Update with error status - fallback to manual routing
      const errorMeta: RoutingMeta = {
        category: 'GENERAL',
        subcategory: 'unclassified',
        confidence: 0,
        reasoning: 'Classification failed - requires manual review',
        classifiedAt: new Date().toISOString(),
        aiModel: this.classificationModel,
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date().toISOString(),
        assignmentMethod: 'none',
        pipelineMatchMethod: 'none',
      };

      await prisma.intakeRequest.update({
        where: { id: intakeId },
        data: {
          status: IntakeStatus.NEW, // Fallback to manual routing
          aiRoutingMeta: errorMeta as unknown as Prisma.InputJsonValue,
        },
      });

      throw error;
    }
  }

  /**
   * Load balance assignment across team members based on current workload
   *
   * @param orgId - Organization ID
   * @param teamMembers - Available team members
   * @returns ID of the team member with lowest workload
   */
  private async loadBalanceAssignment(
    orgId: string,
    teamMembers: Array<{ id: string; role: UserRole; email: string; name: string | null }>
  ): Promise<string | undefined> {
    if (teamMembers.length === 0) {
      return undefined;
    }

    // Get current workload per team member
    // Note: This is a simplified approach - in production, you might want to
    // track assignee directly on the intake request model
    const workloadCounts = await prisma.intakeRequest.groupBy({
      by: ['assignedPipeline'],
      where: {
        orgId,
        status: {
          in: [
            IntakeStatus.NEW,
            IntakeStatus.ROUTING,
            IntakeStatus.ASSIGNED,
            IntakeStatus.PROCESSING,
          ],
        },
      },
      _count: true,
    });

    console.log(
      `[AIRoutingService] Current workload distribution: ${workloadCounts.length} active assignments`
    );

    // For now, assign to the first team member
    // A more sophisticated approach would track individual assignee workloads
    return teamMembers[0].id;
  }

  /**
   * Validate and normalize category value
   */
  private validateCategory(value: unknown): ClassificationCategory {
    const validCategories: ClassificationCategory[] = [
      'SALES_INQUIRY',
      'SUPPORT_REQUEST',
      'BILLING_QUESTION',
      'PARTNERSHIP',
      'GENERAL',
    ];

    const normalized = String(value).toUpperCase().replace(/\s+/g, '_');

    if (validCategories.includes(normalized as ClassificationCategory)) {
      return normalized as ClassificationCategory;
    }

    console.warn(
      `[AIRoutingService] Invalid category "${value}", defaulting to GENERAL`
    );
    return 'GENERAL';
  }

  /**
   * Validate and normalize priority value
   */
  private validatePriority(value: unknown): PriorityLevel {
    const num = Number(value);

    if (Number.isInteger(num) && num >= 1 && num <= 5) {
      return num as PriorityLevel;
    }

    console.warn(
      `[AIRoutingService] Invalid priority "${value}", defaulting to 2`
    );
    return 2;
  }

  /**
   * Validate and normalize confidence value
   */
  private validateConfidence(value: unknown): number {
    const num = Number(value);

    if (!Number.isNaN(num) && num >= 0 && num <= 1) {
      return Math.round(num * 100) / 100; // Round to 2 decimal places
    }

    console.warn(
      `[AIRoutingService] Invalid confidence "${value}", defaulting to 0.5`
    );
    return 0.5;
  }
}

// Singleton instance
let aiRoutingServiceInstance: AIRoutingService | null = null;

/**
 * Get singleton instance of AIRoutingService
 *
 * @returns AIRoutingService instance
 */
export function getAIRoutingService(): AIRoutingService {
  if (!aiRoutingServiceInstance) {
    aiRoutingServiceInstance = new AIRoutingService();
  }
  return aiRoutingServiceInstance;
}

// Export singleton for convenience
export const aiRoutingService = new AIRoutingService();
