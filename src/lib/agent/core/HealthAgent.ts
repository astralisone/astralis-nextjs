/**
 * HealthAgent - Proactive system monitoring agent
 * 
 * Periodically checks the business pulse and system health.
 * Emits events to the OrchestrationAgent if issues are detected.
 */

import { AgentEventBus } from '../inputs/EventBus';
import { ActionExecutor } from './ActionExecutor';
import { DecisionType, Logger } from '../types/agent.types';

export interface HealthAgentConfig {
    orgId: string;
    checkIntervalMs: number;
    logger?: Logger;
}

export class HealthAgent {
    private config: HealthAgentConfig;
    private logger: Logger;
    private eventBus: AgentEventBus;
    private timer: NodeJS.Timeout | null = null;
    private actionExecutor: ActionExecutor;

    constructor(config: HealthAgentConfig, actionExecutor: ActionExecutor) {
        this.config = config;
        this.actionExecutor = actionExecutor;
        this.eventBus = AgentEventBus.getInstance();
        this.logger = config.logger || {
            debug: (msg, data) => console.debug(`[HealthAgent] ${msg}`, data || ''),
            info: (msg, data) => console.info(`[HealthAgent] ${msg}`, data || ''),
            warn: (msg, data) => console.warn(`[HealthAgent] ${msg}`, data || ''),
            error: (msg, err, data) => console.error(`[HealthAgent] ${msg}`, err, data || ''),
        };
    }

    /**
     * Start the proactive monitoring loop
     */
    public start() {
        if (this.timer) return;
        this.logger.info('Starting HealthAgent proactive monitoring');

        // Initial check after 5 seconds to avoid startup rush
        setTimeout(() => this.checkPulse(), 5000);

        this.timer = setInterval(() => this.checkPulse(), this.config.checkIntervalMs);
    }

    /**
     * Stop the proactive monitoring loop
     */
    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.logger.info('Stopped HealthAgent proactive monitoring');
        }
    }

    /**
     * Perform a pulse check and emit events if issues are found
     */
    private async checkPulse() {
        this.logger.info('Performing proactive pulse check');
        try {
            // Execute GET_BUSINESS_PULSE via ActionExecutor
            const result = await this.actionExecutor.execute([
                {
                    type: 'GET_BUSINESS_PULSE' as DecisionType,
                    params: {},
                    priority: 1,
                    requiresConfirmation: false
                }
            ], {
                orgId: this.config.orgId,
                userId: 'system-health-agent', // System-level execution context
                dryRun: false,
            });

            const pulseResult = result.results[0];
            if (pulseResult.success && pulseResult.data?.pulse !== 'HEALTHY') {
                this.logger.warn('HealthAgent detected pulse anomalies', pulseResult.data);

                // Emit a system event that the OrchestrationAgent or other listeners can react to
                this.eventBus.emit('system:health_warning', {
                    type: 'SYSTEM_EVENT',
                    source: 'HEALTH_AGENT',
                    timestamp: new Date(),
                    orgId: this.config.orgId,
                    payload: {
                        pulse: pulseResult.data.pulse,
                        insights: pulseResult.data.insights,
                        summary: pulseResult.data.summary,
                        recommendation: 'Check the dashboard for detailed optimization suggestions.'
                    },
                });
            } else if (pulseResult.success) {
                this.logger.info('Pulse check completed: System is healthy');
            }
        } catch (error) {
            this.logger.error('Failed proactive pulse check', error);
        }
    }
}
