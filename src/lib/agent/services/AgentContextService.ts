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
                requiredIntegrations: ['gmail', 'outlook'],
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
        // Simplified context building to avoid database issues
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

        const communicationClassification = this.communicationClassifier.classifyIntent(input.rawContent, input);
        const availableIntegrations: any[] = []; // Simplified for now
        const availableActions = this.filterActionsByCommunicationType(
            this.config.enabledActions,
            communicationClassification,
            availableIntegrations
        );

        return {
            input,
            org,
            history,
            availableActions,
            communicationClassification,
            availableIntegrations,
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
        availableIntegrations: any[]
    ): DecisionType[] {
        // Filter actions based on communication channel capabilities
        return enabledActions.filter(action => {
            switch (communicationClassification?.channel) {
                case 'system':
                    // System channel supports email and notification actions
                    return [
                        DecisionTypeEnum.SEND_SYSTEM_EMAIL,
                        DecisionTypeEnum.SEND_NOTIFICATION,
                        DecisionTypeEnum.ASSIGN_PIPELINE,
                        DecisionTypeEnum.CREATE_TASK
                    ].includes(action);

                case 'business':
                    // Business channel supports email and integration actions
                    return [
                        DecisionTypeEnum.SEND_BUSINESS_EMAIL,
                        DecisionTypeEnum.TRIGGER_AUTOMATION,
                        DecisionTypeEnum.ASSIGN_PIPELINE,
                        DecisionTypeEnum.CREATE_TASK,
                        DecisionTypeEnum.CREATE_EVENT,
                        DecisionTypeEnum.UPDATE_EVENT
                    ].includes(action);

                case 'integration':
                    // Integration channel supports all actions
                    return true;

                default:
                    // Default to basic actions for unknown channels
                    return [
                        DecisionTypeEnum.ASSIGN_PIPELINE,
                        DecisionTypeEnum.CREATE_TASK,
                        DecisionTypeEnum.SEND_NOTIFICATION
                    ].includes(action);
            }
        });
    }

    /**
     * Build the system prompt for LLM.
     */
    public buildSystemPrompt(org: OrgContext): string {
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
