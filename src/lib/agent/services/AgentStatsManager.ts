import {
    AgentStats,
    DecisionRecord,
    DecisionStatus,
    DecisionType,
    AgentDecisionResult,
    AgentInput,
    DecisionOutcome
} from '../types/agent.types';

export class AgentStatsManager {
    private stats: AgentStats;
    private decisionHistory: DecisionRecord[] = [];
    private readonly MAX_HISTORY_SIZE = 100;
    private startTime: Date;

    constructor() {
        this.startTime = new Date();
        this.stats = {
            totalDecisions: 0,
            successfulDecisions: 0,
            failedDecisions: 0,
            pendingApprovals: 0,
            totalActionsExecuted: 0,
            totalEventsProcessed: 0,
            totalErrors: 0,
            averageDecisionTimeMs: 0,
            decisionTimes: [],
            lastDecisionTime: null,
            uptimeMs: 0,
            rateLimitStatus: {
                actionsThisMinute: 0,
                actionsThisHour: 0,
                isLimited: false
            }
        };
    }

    public getStats(rateLimitStatus: AgentStats['rateLimitStatus']): AgentStats {
        const now = Date.now();
        const avgDecisionTime = this.stats.decisionTimes.length > 0
            ? this.stats.decisionTimes.reduce((a, b) => a + b, 0) / this.stats.decisionTimes.length
            : 0;

        return {
            ...this.stats,
            averageDecisionTimeMs: avgDecisionTime,
            rateLimitStatus,
            uptimeMs: now - this.startTime.getTime(),
            timeSinceLastDecisionMs: this.stats.lastDecisionTime
                ? now - this.stats.lastDecisionTime.getTime()
                : null,
        };
    }

    public getDecisionHistory(limit?: number): DecisionRecord[] {
        if (limit) {
            return this.decisionHistory.slice(-limit);
        }
        return [...this.decisionHistory];
    }

    public recordDecisionTime(ms: number) {
        this.stats.decisionTimes.push(ms);
        // Keep only last 100 times for average calculation to handle memory
        if (this.stats.decisionTimes.length > 100) {
            this.stats.decisionTimes.shift();
        }
    }

    public incrementTotalDecisions() {
        this.stats.totalDecisions++;
        this.stats.lastDecisionTime = new Date();
    }

    public incrementSuccessfulDecisions() {
        this.stats.successfulDecisions++;
    }

    public incrementFailedDecisions() {
        this.stats.failedDecisions++;
    }

    public incrementPendingApprovals() {
        this.stats.pendingApprovals++;
    }

    public decrementPendingApprovals() {
        this.stats.pendingApprovals--;
    }

    public incrementTotalActions(count: number) {
        this.stats.totalActionsExecuted += count;
    }

    public incrementTotalEvents() {
        this.stats.totalEventsProcessed++;
    }

    public incrementTotalErrors() {
        this.stats.totalErrors++;
    }

    public async recordDecision(
        agentId: string,
        orgId: string,
        input: AgentInput,
        decision: AgentDecisionResult,
        outcome: DecisionOutcome,
        llmContext: { prompt: string; response: string }
    ): Promise<DecisionRecord> {
        const record: DecisionRecord = {
            id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            agentId,
            orgId,
            inputSource: input.source,
            inputType: input.type,
            inputData: { rawContent: input.rawContent, structuredData: input.structuredData },
            llmPrompt: llmContext.prompt,
            llmResponse: llmContext.response,
            confidence: decision.confidence,
            reasoning: decision.reasoning,
            decisionType: decision.actions[0]?.type ?? DecisionType.NO_ACTION,
            actions: decision.actions,
            status: outcome.status,
            executionTime: outcome.executionTime,
            errorMessage: outcome.errors[0]?.message,
            createdAt: new Date(),
            executedAt: outcome.status === DecisionStatus.EXECUTED ? outcome.completedAt : undefined,
        };

        this.decisionHistory.push(record);

        // Prune history
        if (this.decisionHistory.length > this.MAX_HISTORY_SIZE) {
            this.decisionHistory.shift();
        }

        return record;
    }
}
