/**
 * Action Registry for Supplemental Integrations
 * 
 * This file defines the dynamic tools that are injected into the agent's context 
 * based on the user's active integration credentials.
 * 
 * Each tool includes:
 * - action: The DecisionType enum value
 * - provider: The required IntegrationProvider (e.g. GMAIL, SLACK)
 * - schema: The JSON schema to be injected into the system prompt
 */

import { IntegrationProvider } from '@prisma/client';
import { DecisionType } from '../types/agent.types';

export interface ActionDefinition {
    action: DecisionType;
    provider: IntegrationProvider;
    description: string;
    schema: Record<string, unknown>;
}

export const ACTION_REGISTRY: ActionDefinition[] = [
    // ===========================================================================
    // GMAIL
    // ===========================================================================
    {
        action: DecisionType.SEND_BUSINESS_EMAIL,
        provider: IntegrationProvider.GMAIL,
        description: 'Send a professional email from your connected Gmail account',
        schema: {
            type: 'SEND_BUSINESS_EMAIL',
            params: {
                to: 'string[]', // array of email addresses
                subject: 'string',
                body: 'string (html or plain text)',
                cc: 'string[] | null',
                bcc: 'string[] | null',
                attachments: 'string[] | null'
            }
        }
    },
    {
        action: DecisionType.REPLY_TO_EMAIL,
        provider: IntegrationProvider.GMAIL,
        description: 'Reply to an existing email thread',
        schema: {
            type: 'REPLY_TO_EMAIL',
            params: {
                threadId: 'string', // The Gmail "threadId"
                messageId: 'string', // The specific "messageId" being replied to
                body: 'string',
                replyAll: 'boolean'
            }
        }
    },
    {
        action: DecisionType.SEARCH_EMAILS,
        provider: IntegrationProvider.GMAIL,
        description: 'Search for emails using Gmail query syntax',
        schema: {
            type: 'SEARCH_EMAILS',
            params: {
                query: 'string', // e.g. "from:john@example.com subject:invoice"
                maxResults: 'number (default 10)'
            }
        }
    },
    {
        action: DecisionType.GET_EMAIL_THREAD,
        provider: IntegrationProvider.GMAIL,
        description: 'Retrieve the full history of an email thread',
        schema: {
            type: 'GET_EMAIL_THREAD',
            params: {
                threadId: 'string'
            }
        }
    },
    {
        action: DecisionType.DRAFT_EMAIL,
        provider: IntegrationProvider.GMAIL,
        description: 'Create a draft email without sending it (for user review)',
        schema: {
            type: 'DRAFT_EMAIL',
            params: {
                to: 'string[]',
                subject: 'string',
                body: 'string'
            }
        }
    },

    // ===========================================================================
    // GOOGLE CALENDAR
    // ===========================================================================
    {
        action: DecisionType.CREATE_EVENT,
        provider: IntegrationProvider.GOOGLE_CALENDAR, // Often grouped under GOOGLE, check if GOOGLE_CALENDAR exists
        description: 'Create a calendar event with optional conference link',
        schema: {
            type: 'CREATE_EVENT',
            params: {
                title: 'string',
                startTime: 'ISO datetime string',
                endTime: 'ISO datetime string',
                attendees: 'string[] (emails)',
                description: 'string | null',
                location: 'string | null',
                useGoogleMeet: 'boolean'
            }
        }
    },
    {
        action: DecisionType.UPDATE_EVENT,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
        description: 'Update an existing calendar event',
        schema: {
            type: 'UPDATE_EVENT',
            params: {
                eventId: 'string',
                title: 'string | null', // Only include fields to update
                startTime: 'ISO string | null',
                endTime: 'ISO string | null',
                attendees: 'string[] | null'
            }
        }
    },
    {
        action: DecisionType.DELETE_EVENT,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
        description: 'Delete/Cancel a specific calendar event',
        schema: {
            type: 'DELETE_EVENT',
            params: {
                eventId: 'string'
            }
        }
    },
    {
        action: DecisionType.LIST_EVENTS,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
        description: 'List events for a specific time range',
        schema: {
            type: 'LIST_EVENTS',
            params: {
                timeMin: 'ISO datetime string',
                timeMax: 'ISO datetime string',
                maxResults: 'number'
            }
        }
    },
    {
        action: DecisionType.FIND_COMMON_SLOTS,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
        description: 'Find common free time slots for multiple attendees',
        schema: {
            type: 'FIND_COMMON_SLOTS',
            params: {
                attendeeEmails: 'string[]',
                timeMin: 'ISO datetime string',
                timeMax: 'ISO datetime string',
                durationMinutes: 'number'
            }
        }
    },

    // ===========================================================================
    // GOOGLE DRIVE & DOCS
    // ===========================================================================
    {
        action: DecisionType.CREATE_DOC,
        provider: IntegrationProvider.GOOGLE_DOCS,
        description: 'Create a new Google Doc with optional initial content',
        schema: {
            type: 'CREATE_DOC',
            params: {
                title: 'string',
                content: 'string | null (initial text)'
            }
        }
    },
    {
        action: DecisionType.READ_DOC_CONTENT,
        provider: IntegrationProvider.GOOGLE_DOCS,
        description: 'Read the plain text content of a Google Doc',
        schema: {
            type: 'READ_DOC_CONTENT',
            params: {
                fileId: 'string'
            }
        }
    },
    {
        action: DecisionType.APPEND_TO_DOC,
        provider: IntegrationProvider.GOOGLE_DOCS,
        description: 'Append text to the end of an existing Google Doc',
        schema: {
            type: 'APPEND_TO_DOC',
            params: {
                fileId: 'string',
                content: 'string'
            }
        }
    },
    {
        action: DecisionType.SEARCH_FILES,
        provider: IntegrationProvider.GOOGLE_DRIVE,
        description: 'Search for files in Google Drive',
        schema: {
            type: 'SEARCH_FILES',
            params: {
                query: 'string', // Name or content keyword
                mimeType: 'string | null' // e.g. "application/vnd.google-apps.document"
            }
        }
    },
    {
        action: DecisionType.SHARE_FILE,
        provider: IntegrationProvider.GOOGLE_DRIVE,
        description: 'Share a file with an email address',
        schema: {
            type: 'SHARE_FILE',
            params: {
                fileId: 'string',
                email: 'string',
                role: '"reader" | "writer" | "commenter"'
            }
        }
    },

    // ===========================================================================
    // SLACK
    // ===========================================================================
    {
        action: DecisionType.SEND_SLACK_MESSAGE,
        provider: IntegrationProvider.SLACK,
        description: 'Send a message to a Slack channel or user',
        schema: {
            type: 'SEND_SLACK_MESSAGE',
            params: {
                channelId: 'string', // Channel ID (e.g. C12345) or User ID (e.g. U12345)
                text: 'string'
            }
        }
    },
    {
        action: DecisionType.LIST_CHANNELS,
        provider: IntegrationProvider.SLACK,
        description: 'List accessible public and private Slack channels',
        schema: {
            type: 'LIST_CHANNELS',
            params: {
                types: '"public_channel,private_channel"'
            }
        }
    },
    {
        action: DecisionType.GET_CHANNEL_HISTORY,
        provider: IntegrationProvider.SLACK,
        description: 'Get recent messages from a channel',
        schema: {
            type: 'GET_CHANNEL_HISTORY',
            params: {
                channelId: 'string',
                limit: 'number'
            }
        }
    },
    {
        action: DecisionType.ADD_REACTION,
        provider: IntegrationProvider.SLACK,
        description: 'Add an emoji reaction to a message',
        schema: {
            type: 'ADD_REACTION',
            params: {
                channelId: 'string',
                timestamp: 'string', // Message timestamp ID
                emojiName: 'string' // e.g. "thumbsup"
            }
        }
    },

    // ===========================================================================
    // CRM (Salesforce / HubSpot)
    // ===========================================================================
    {
        action: DecisionType.CREATE_RECORD,
        provider: IntegrationProvider.SALESFORCE, // Or HUBSPOT, handled dynamically?
        description: 'Create a new CRM record (Lead, Contact, Opportunity)',
        schema: {
            type: 'CREATE_RECORD',
            params: {
                objectType: '"Lead" | "Contact" | "Opportunity"',
                fields: 'Record<string, any>' // e.g. { FirstName: "John", LastName: "Doe" }
            }
        }
    },
    {
        action: DecisionType.SEARCH_RECORDS,
        provider: IntegrationProvider.SALESFORCE,
        description: 'Search for CRM records by keyword',
        schema: {
            type: 'SEARCH_RECORDS',
            params: {
                query: 'string', // SOQL query or search term
                objectType: '"Lead" | "Contact" | "Account" | null'
            }
        }
    },
    {
        action: DecisionType.GET_RECORD_DETAILS,
        provider: IntegrationProvider.SALESFORCE,
        description: 'Get details of a specific record',
        schema: {
            type: 'GET_RECORD_DETAILS',
            params: {
                recordId: 'string',
                objectType: 'string'
            }
        }
    },

    // ===========================================================================
    // ACCOUNTING (QuickBooks / Xero)
    // ===========================================================================
    {
        action: DecisionType.GET_FINANCIAL_SNAPSHOT,
        provider: IntegrationProvider.QUICKBOOKS,
        description: 'Get a summary of financial data',
        schema: {
            type: 'GET_FINANCIAL_SNAPSHOT',
            params: {
                period: '"this_month" | "last_month" | "ytd"'
            }
        }
    },
    {
        action: DecisionType.CREATE_INVOICE,
        provider: IntegrationProvider.QUICKBOOKS,
        description: 'Create a new invoice',
        schema: {
            type: 'CREATE_INVOICE',
            params: {
                customerId: 'string',
                lineItems: 'Array<{ description: string, amount: number }>',
                dueDate: 'ISO date string | null'
            }
        }
    },
    {
        action: DecisionType.SEARCH_CUSTOMERS,
        provider: IntegrationProvider.QUICKBOOKS,
        description: 'Search for customers in the accounting system',
        schema: {
            type: 'SEARCH_CUSTOMERS',
            params: {
                query: 'string' // Name search
            }
        }
    }
];

export function getActionsForProvider(provider: IntegrationProvider): ActionDefinition[] {
    return ACTION_REGISTRY.filter(def => def.provider === provider);
}

export function getAllowedActions(activeProviders: IntegrationProvider[]): ActionDefinition[] {
    return ACTION_REGISTRY.filter(def => activeProviders.includes(def.provider));
}
