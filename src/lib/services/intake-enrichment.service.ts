import { createLLMClient } from '@/lib/agent/core';
import { LLMProvider } from '@/lib/agent/types/agent.types';
import { prisma } from '@/lib/prisma';

/**
 * Intake Enrichment Service
 * 
 * Uses LLM to assess, prioritize, and enrich intake requests 
 * with business context and metadata.
 */
export class IntakeEnrichmentService {
    private llmClient;

    constructor() {
        // Default to the same provider as the main agent
        this.llmClient = createLLMClient({
            provider: (process.env.AGENT_LLM_PROVIDER as any) || LLMProvider.CLAUDE,
            model: process.env.AGENT_LLM_MODEL || 'claude-3-5-sonnet-20240620',
        });
    }

    /**
     * Enrich an intake request using AI
     */
    async enrichIntake(intakeId: string): Promise<void> {
        console.log(`[IntakeEnrichment] Enriching intake ${intakeId}`);

        const intake = await prisma.intakeRequest.findUnique({
            where: { id: intakeId }
        });

        if (!intake) {
            console.warn(`[IntakeEnrichment] Intake ${intakeId} not found`);
            return;
        }

        const prompt = `
      Analyze this business intake request and provide intelligent enrichment:
      
      Title: ${intake.title}
      Description: ${intake.description || 'No description provided'}
      Source: ${intake.source}
      Data: ${JSON.stringify(intake.requestData || {})}
      
      You must respond with a valid JSON object only:
      {
        "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
        "urgency": 1-5,
        "classification": "SALES" | "SUPPORT" | "BILLING" | "PARTNERSHIP" | "GENERAL",
        "entities": {
          "names": string[],
          "companies": string[],
          "products": string[]
        },
        "summary": "A concise one-sentence summary of the request",
        "keyPains": string[],
        "proactiveRecommendation": "A smart recommendation for the next best action"
      }
    `;

        try {
            const response = await this.llmClient.complete([{ role: 'user', content: prompt }]);

            // Clean the response content for JSON parsing
            let content = response.content.trim();
            if (content.includes('```json')) {
                content = content.split('```json')[1].split('```')[0].trim();
            } else if (content.includes('```')) {
                content = content.split('```')[1].split('```')[0].trim();
            }

            const enrichment = JSON.parse(content);

            await prisma.intakeRequest.update({
                where: { id: intakeId },
                data: {
                    priority: enrichment.urgency || intake.priority,
                    aiRoutingMeta: {
                        ...(intake.aiRoutingMeta as any || {}),
                        enrichment,
                        enrichedAt: new Date().toISOString(),
                        enrichmentStatus: 'SUCCESS'
                    }
                }
            });

            console.log(`[IntakeEnrichment] Intake ${intakeId} enriched successfully`);
        } catch (error) {
            console.error(`[IntakeEnrichment] Enrichment failed for ${intakeId}:`, error);

            await prisma.intakeRequest.update({
                where: { id: intakeId },
                data: {
                    aiRoutingMeta: {
                        ...(intake.aiRoutingMeta as any || {}),
                        enrichmentStatus: 'FAILED',
                        enrichmentError: error instanceof Error ? error.message : String(error)
                    }
                }
            });
        }
    }
}

export const intakeEnrichmentService = new IntakeEnrichmentService();
