import { DEFAULT_AGENT_CONFIG } from '../types/agent.types';

export interface RateLimiterState {
    minuteTimestamps: number[];
    hourTimestamps: number[];
}

export class AgentRateLimiter {
    private state: RateLimiterState = {
        minuteTimestamps: [],
        hourTimestamps: [],
    };

    /**
     * Check if the agent is rate limited.
     * @param maxPerMinute Configured max actions per minute
     * @param maxPerHour Configured max actions per hour
     * @returns true if limited
     */
    public isRateLimited(
        maxPerMinute: number = DEFAULT_AGENT_CONFIG.maxActionsPerMinute,
        maxPerHour: number = DEFAULT_AGENT_CONFIG.maxActionsPerHour
    ): boolean {
        const now = Date.now();

        // Clean old timestamps
        this.state.minuteTimestamps = this.state.minuteTimestamps.filter(t => now - t < 60000);
        this.state.hourTimestamps = this.state.hourTimestamps.filter(t => now - t < 3600000);

        return (
            this.state.minuteTimestamps.length >= maxPerMinute ||
            this.state.hourTimestamps.length >= maxPerHour
        );
    }

    /**
     * Record an action execution for rate limiting.
     */
    public recordAction(): void {
        const now = Date.now();
        this.state.minuteTimestamps.push(now);
        this.state.hourTimestamps.push(now);
    }

    /**
     * Get current usage stats.
     */
    public getUsage() {
        const now = Date.now();
        return {
            actionsThisMinute: this.state.minuteTimestamps.filter(t => now - t < 60000).length,
            actionsThisHour: this.state.hourTimestamps.filter(t => now - t < 3600000).length,
        };
    }
}
