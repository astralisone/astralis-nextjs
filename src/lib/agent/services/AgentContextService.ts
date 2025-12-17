import {
    AgentInput,
    DecisionContext,
    OrgContext,
    HistoricalContext,
    DecisionType as DecisionTypeEnum,
    DecisionType,
    AgentConfig
} from '../types/agent.types';
import { PromptBuilder, OrgContext as PromptOrgContext } from '../prompts';
import { integrationService } from '../../services/integration.service';
import { getAllowedActions } from '../core/ActionRegistry';
import { IntegrationProvider } from '@prisma/client';

// Inline communication classifier to simplify dependencies
class CommunicationClassifier {
    classifyIntent(intent: string, context: any) {
        const normalizedIntent = intent.toLowerCase().trim();

        // System communications (highest priority)
        if (this.isSystemCommunication(normalizedIntent, context)) {
            return {
                channel: 'system' as const,
                confidence: 0.9,
                reasoning: 'System communication detected',
                requiredIntegrations: [],
                fallbackOptions: ['business']
            };
        }

        // Business communications
        if (this.isBusinessCommunication(normalizedIntent, context)) {
            return {
                channel: 'business' as const,
                confidence: 0.8,
                reasoning: 'Business communication detected',
                requiredIntegrations: ['GMAIL', 'OUTLOOK'],
                fallbackOptions: ['system']
            };
        }

        // Default to integration channel
        return {
            channel: 'integration' as const,
            confidence: 0.6,
            reasoning: 'Defaulting to integration channel',
            requiredIntegrations: [],
            fallbackOptions: ['system', 'business']
        };
    }

    private isSystemCommunication(intent: string, context: any): boolean {
        const systemKeywords = ['system', 'admin', 'notification', 'alert', 'error', 'status'];
        return systemKeywords.some(keyword => intent.includes(keyword));
    }

    private isBusinessCommunication(intent: string, context: any): boolean {
        const businessKeywords = ['email', 'contact', 'reach out', 'proposal', 'metting', 'schedule'];
        return businessKeywords.some(keyword => intent.includes(keyword));
    }
}

export class AgentContextService {
    private communicationClassifier = new CommunicationClassifier();

    constructor(private config: { orgId: string; enabledActions: DecisionType[] }) { }

    public updateConfig(config: { orgId?: string; enabledActions?: DecisionType[] }) {
        if (config.orgId) this.config.orgId = config.orgId;
        if (config.enabledActions) this.config.enabledActions = config.enabledActions;
    }

    /**
     * Build the full decision context.
     */
    public async buildDecisionContext(input: AgentInput, agentId: string): Promise<DecisionContext> {
        // Fetch active integrations for the user
        // Assuming input.userId or input.metadata.userId is available
        const userId = (input as any).userId || input.metadata?.userId;
        let activeProviders: IntegrationProvider[] = [];

        if (userId) {
            try {
                const credentials = await integrationService.listCredentials(userId, this.config.orgId);
                activeProviders = credentials
                    .filter(c => c.isActive && c.status === 'CONNECTED_ACTIVE')
                    .map(c => c.provider);
            } catch (error) {
                console.warn('[AgentContextService] Failed to fetch credentials:', error);
            }
        }

        // Determine allowed supplemental actions based on active integrations
        const supplementalActions = getAllowedActions(activeProviders).map(def => def.action);

        // Merge core enabled actions with supplemental actions
        // Use Set to avoid duplicates
        const allEnabledActions = Array.from(new Set([
            ...this.config.enabledActions,
            ...supplementalActions
        ]));

        const org: OrgContext = {
            id: this.config.orgId,
            name: 'Organization', // Simplified for now
            pipelines: [],
            users: [],
            settings: {} as any,
        };

        const history: HistoricalContext = {
            recentDecisions: [],
            relatedIntakes: [],
            relatedEvents: [],
        };

        // Map active providers to the expected context shape
        const availableIntegrationsList = activeProviders.map(provider => ({
            provider,
            available: true
        }));

        const communicationClassification = this.communicationClassifier.classifyIntent(input.rawContent, input);

        const availableActions = this.filterActionsByCommunicationType(
            allEnabledActions,
            communicationClassification,
            activeProviders
        );

        return {
            input,
            org,
            history,
            availableActions,
            communicationClassification,
            availableIntegrations: availableIntegrationsList,
            decisionTimestamp: new Date(),
            sessionId: agentId,
        };
    }

    /**
     * Filter available actions based on communication type and available integrations.
     */
    public filterActionsByCommunicationType(
        enabledActions: DecisionType[],
        communicationClassification: any,
        availableIntegrations: IntegrationProvider[]
    ): DecisionType[] {
        // If it's a specific channel, we prioritize those actions, but we should always allow
        // actions that are explicitly enabled by active integrations if they make sense contextually.
        // For now, we'll be permissive: if it's in enabledActions (which now includes supplemental),
        // we allow it unless it's strictly a system-only context.

        return enabledActions.filter(action => {
            // Always allow core internal actions
            const coreActions = [
                DecisionTypeEnum.ASSIGN_PIPELINE,
                DecisionTypeEnum.CREATE_TASK,
                DecisionTypeEnum.ESCALATE,
                DecisionTypeEnum.NO_ACTION,
                DecisionTypeEnum.SEND_NOTIFICATION
            ];

            if (coreActions.includes(action)) return true;

            // For other actions, check if they are supplemental actions supported by active integrations
            // The fact that they are in 'enabledActions' means they are either configured core or 
            // added via buildDecisionContext's supplemental logic.
            // We can refine this filtering later based on strict channel rules if needed.
            return true;
        });
    }

    /**
     * Build the system prompt for LLM.
     */
    public buildSystemPrompt(org: OrgContext, activeProviders: IntegrationProvider[] = []): string {
        // Generate schemas for authorized tools
        const authorizedTools = getAllowedActions(activeProviders);
        const actionSchemas = JSON.stringify(authorizedTools.map(t => t.schema), null, 2);

        const promptOrg: PromptOrgContext = {
            orgName: org.name,
            pipelines: org.pipelines.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                stages: p.stages.map((s, i) => ({ id: s, name: s, order: i })),
            })),
            teamMembers: org.users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                isAvailable: u.isAvailable,
            })),
            timezone: org.settings.timezone,
            currentDateTime: new Date(),
            actionSchemas // Inject the dynamic schemas
        };

        return PromptBuilder.buildSystemPrompt(promptOrg);
    }

    /**
     * Build the user prompt for LLM.
     */
    public buildUserPrompt(input: AgentInput, context: DecisionContext): string {
        let prompt = `## Input Information\n\n`;
        prompt += `- **Source:** ${input.source}\n`;
        prompt += `- **Type:** ${input.type}\n`;
        prompt += `- **Timestamp:** ${input.timestamp.toISOString()}\n`;

        if (input.metadata?.senderEmail) {
            prompt += `- **Sender Email:** ${input.metadata.senderEmail}\n`;
        }
        if (input.metadata?.senderName) {
            prompt += `- **Sender Name:** ${input.metadata.senderName}\n`;
        }

        prompt += `\n## Content\n\n${input.rawContent}\n`;

        if (input.structuredData && Object.keys(input.structuredData).length > 0) {
            prompt += `\n## Structured Data\n\n\`\`\`json\n${JSON.stringify(input.structuredData, null, 2)}\n\`\`\`\n`;
        }

        if (context.history && context.history.recentDecisions.length > 0) {
            prompt += `\n## Recent Decisions\n\n`;
            for (const decision of context.history.recentDecisions.slice(0, 5)) {
                prompt += `- ${decision.decisionType} (${decision.inputType}): Confidence ${decision.confidence.toFixed(2)}, Status: ${decision.status}\n`;
            }
        }

        prompt += `\n## Available Actions\n\n`;
        prompt += context.availableActions.map(a => `- ${a}`).join('\n');

        prompt += `\n\n---\n\nBased on the above information, analyze the input and provide your decision in the required JSON format.`;

        return prompt;
    }
}
