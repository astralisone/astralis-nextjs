import type { AgentInput, IntegrationProvider } from '../types/agent.types';

/**
 * Communication Channel Types
 * Defines how different types of communications should be handled
 */
export enum CommunicationChannel {
  /** System communications using internal email service */
  SYSTEM = 'system',
  /** Business communications using integrations (Gmail, etc.) */
  BUSINESS = 'business',
  /** Integration-specific actions (Calendar, CRM, etc.) */
  INTEGRATION = 'integration'
}

/**
 * Communication Classification Result
 */
export interface CommunicationClassification {
  /** The determined communication channel */
  channel: CommunicationChannel;
  /** Confidence score (0.0-1.0) */
  confidence: number;
  /** Reasoning for the classification */
  reasoning: string;
  /** Required integrations for this communication type */
  requiredIntegrations?: IntegrationProvider[];
  /** Fallback options if primary channel unavailable */
  fallbackOptions?: CommunicationChannel[];
  /** Additional context about the classification */
  metadata?: Record<string, unknown>;
}

/**
 * Communication Classifier
 * Intelligently classifies communication intents to determine appropriate channels
 */
export class CommunicationClassifier {
  /**
   * Classify a communication intent into the appropriate channel
   */
  classifyIntent(intent: string, context: AgentInput): CommunicationClassification {
    const normalizedIntent = intent.toLowerCase().trim();

    // System communications (highest priority)
    const systemClassification = this.classifySystemCommunication(normalizedIntent, context);
    if (systemClassification) {
      return systemClassification;
    }

    // Business communications
    const businessClassification = this.classifyBusinessCommunication(normalizedIntent, context);
    if (businessClassification) {
      return businessClassification;
    }

    // Integration-specific actions
    const integrationClassification = this.classifyIntegrationAction(normalizedIntent, context);
    if (integrationClassification) {
      return integrationClassification;
    }

    // Default fallback
    return {
      channel: CommunicationChannel.SYSTEM,
      confidence: 0.5,
      reasoning: 'Unable to classify intent, defaulting to system communication',
      fallbackOptions: [CommunicationChannel.BUSINESS]
    };
  }

  /**
   * Classify system communications (welcome, notifications, etc.)
   */
  private classifySystemCommunication(intent: string, context: AgentInput): CommunicationClassification | null {
    const systemKeywords = [
      'welcome', 'onboard', 'verify', 'reset', 'notification',
      'workflow', 'pipeline', 'system', 'error', 'alert',
      'confirmation', 'acknowledgment', 'reminder'
    ];

    const systemPatterns = [
      /welcome.*(?:new|to)/i,
      /onboard(?:ing)?/i,
      /verify.*email/i,
      /reset.*password/i,
      /workflow.*(?:update|change|notification)/i,
      /pipeline.*(?:stage|move|update)/i,
      /system.*(?:alert|notification|error)/i
    ];

    // Check for system keywords
    const hasSystemKeywords = systemKeywords.some(keyword => intent.includes(keyword));

    // Check for system patterns
    const hasSystemPatterns = systemPatterns.some(pattern => pattern.test(intent));

    // Context-based classification
    const isSystemContext = this.isSystemContext(context);

    if (hasSystemKeywords || hasSystemPatterns || isSystemContext) {
      return {
        channel: CommunicationChannel.SYSTEM,
        confidence: Math.min(0.95, (hasSystemKeywords ? 0.7 : 0) + (hasSystemPatterns ? 0.8 : 0) + (isSystemContext ? 0.9 : 0)),
        reasoning: this.buildSystemReasoning(hasSystemKeywords, hasSystemPatterns, isSystemContext),
        metadata: {
          keywords: systemKeywords.filter(k => intent.includes(k)),
          patterns: systemPatterns.filter(p => p.test(intent)).map(p => p.source)
        }
      };
    }

    return null;
  }

  /**
   * Classify business communications (sales, customer emails, etc.)
   */
  private classifyBusinessCommunication(intent: string, context: AgentInput): CommunicationClassification | null {
    const businessKeywords = [
      'sales', 'customer', 'client', 'proposal', 'quote',
      'invoice', 'contract', 'business', 'meeting', 'call',
      'follow.*up', 'pitch', 'demo', 'presentation'
    ];

    const businessPatterns = [
      /send.*email.*(?:to|about)/i,
      /email.*(?:customer|client|prospect)/i,
      /schedule.*(?:meeting|call|demo)/i,
      /follow.*up.*(?:with|on)/i,
      /(?:sales|business).*communication/i
    ];

    // Check for business keywords
    const hasBusinessKeywords = businessKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword.replace('*', '.*')}\\b`, 'i');
      return regex.test(intent);
    });

    // Check for business patterns
    const hasBusinessPatterns = businessPatterns.some(pattern => pattern.test(intent));

    // Context-based classification (user-initiated vs system)
    const isUserInitiated = this.isUserInitiatedContext(context);

    if ((hasBusinessKeywords || hasBusinessPatterns) && isUserInitiated) {
      return {
        channel: CommunicationChannel.BUSINESS,
        confidence: Math.min(0.9, (hasBusinessKeywords ? 0.6 : 0) + (hasBusinessPatterns ? 0.7 : 0) + (isUserInitiated ? 0.8 : 0)),
        reasoning: this.buildBusinessReasoning(hasBusinessKeywords, hasBusinessPatterns, isUserInitiated),
        requiredIntegrations: ['GMAIL'],
        fallbackOptions: [CommunicationChannel.SYSTEM],
        metadata: {
          businessPurpose: this.extractBusinessPurpose(intent),
          recipientType: this.extractRecipientType(intent)
        }
      };
    }

    return null;
  }

  /**
   * Classify integration-specific actions (calendar, CRM, etc.)
   */
  private classifyIntegrationAction(intent: string, context: AgentInput): CommunicationClassification | null {
    // Calendar actions
    if (this.isCalendarAction(intent)) {
      return {
        channel: CommunicationChannel.INTEGRATION,
        confidence: 0.85,
        reasoning: 'Calendar management action detected',
        requiredIntegrations: ['GOOGLE_CALENDAR'],
        metadata: { actionType: 'calendar' }
      };
    }

    // CRM actions
    if (this.isCRMAction(intent)) {
      return {
        channel: CommunicationChannel.INTEGRATION,
        confidence: 0.85,
        reasoning: 'CRM management action detected',
        requiredIntegrations: ['SALESFORCE', 'HUBSPOT'], // Either/or
        metadata: { actionType: 'crm' }
      };
    }

    // Document management
    if (this.isDocumentAction(intent)) {
      return {
        channel: CommunicationChannel.INTEGRATION,
        confidence: 0.8,
        reasoning: 'Document management action detected',
        requiredIntegrations: ['GOOGLE_DRIVE', 'DROPBOX'],
        metadata: { actionType: 'documents' }
      };
    }

    return null;
  }

  /**
   * Helper methods for classification
   */
  private isSystemContext(context: AgentInput): boolean {
    return context.source === 'system' ||
           context.source === 'workflow' ||
           context.source === 'pipeline' ||
           context.source === 'signup';
  }

  private isUserInitiatedContext(context: AgentInput): boolean {
    return context.source === 'manual' ||
           context.source === 'chat' ||
           context.source === 'api' ||
           context.source === 'user';
  }

  private isCalendarAction(intent: string): boolean {
    const calendarKeywords = ['schedule', 'meeting', 'calendar', 'event', 'appointment', 'call'];
    return calendarKeywords.some(keyword => intent.includes(keyword));
  }

  private isCRMAction(intent: string): boolean {
    const crmKeywords = ['crm', 'contact', 'lead', 'opportunity', 'salesforce', 'hubspot'];
    return crmKeywords.some(keyword => intent.includes(keyword));
  }

  private isDocumentAction(intent: string): boolean {
    const docKeywords = ['document', 'file', 'folder', 'drive', 'upload', 'share'];
    return docKeywords.some(keyword => intent.includes(keyword));
  }

  private buildSystemReasoning(hasKeywords: boolean, hasPatterns: boolean, isSystemContext: boolean): string {
    const reasons = [];
    if (hasKeywords) reasons.push('system keywords detected');
    if (hasPatterns) reasons.push('system patterns matched');
    if (isSystemContext) reasons.push('system context identified');
    return `System communication: ${reasons.join(', ')}`;
  }

  private buildBusinessReasoning(hasKeywords: boolean, hasPatterns: boolean, isUserInitiated: boolean): string {
    const reasons = [];
    if (hasKeywords) reasons.push('business keywords detected');
    if (hasPatterns) reasons.push('business patterns matched');
    if (isUserInitiated) reasons.push('user-initiated context');
    return `Business communication: ${reasons.join(', ')}`;
  }

  private extractBusinessPurpose(intent: string): string {
    if (intent.includes('proposal') || intent.includes('pitch')) return 'sales_proposal';
    if (intent.includes('follow') && intent.includes('up')) return 'follow_up';
    if (intent.includes('meeting') || intent.includes('schedule')) return 'meeting_setup';
    if (intent.includes('invoice') || intent.includes('quote')) return 'billing';
    return 'general_business';
  }

  private extractRecipientType(intent: string): string {
    if (intent.includes('customer') || intent.includes('client')) return 'customer';
    if (intent.includes('prospect') || intent.includes('lead')) return 'prospect';
    if (intent.includes('team') || intent.includes('colleague')) return 'internal';
    return 'external';
  }
}

/**
 * Singleton instance for easy access
 */
export const communicationClassifier = new CommunicationClassifier();