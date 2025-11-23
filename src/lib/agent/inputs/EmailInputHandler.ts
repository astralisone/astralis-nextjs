/**
 * EmailInputHandler - Processes incoming emails received via webhook
 *
 * Supports email webhook payloads from:
 * - SendGrid Inbound Parse
 * - Mailgun Routes
 * - Generic email webhook formats
 *
 * Features:
 * - Email type detection (new inquiry, reply, auto-reply, bounce, spam)
 * - Thread/conversation ID extraction
 * - Attachment metadata parsing
 * - Auto-reply and bounce detection
 * - Spam filtering
 * - Name extraction from email addresses
 */

import { z } from 'zod';
import {
  BaseInputHandler,
  type InputHandlerConfig,
  type ValidationResult,
  type ProcessingResult,
} from './BaseInputHandler';
import type {
  AgentInputSource,
  AgentInput,
  EmailEventPayload,
} from '../types/agent.types';
import { AgentInputSource as InputSource } from '../types/agent.types';

// =============================================================================
// Email Types & Enums
// =============================================================================

/**
 * Types of emails that can be detected
 */
export enum EmailType {
  /** New email inquiry/conversation starter */
  NEW_INQUIRY = 'new_inquiry',
  /** Reply to an existing thread */
  REPLY = 'reply',
  /** Automated reply (out of office, vacation, etc.) */
  AUTO_REPLY = 'auto_reply',
  /** Bounced/undeliverable email */
  BOUNCE = 'bounce',
  /** Suspected spam email */
  SPAM = 'spam',
  /** Forward of another email */
  FORWARD = 'forward',
  /** Newsletter or marketing email */
  NEWSLETTER = 'newsletter',
  /** System notification email */
  NOTIFICATION = 'notification',
  /** Unknown/unclassified email type */
  UNKNOWN = 'unknown',
}

/**
 * Supported email webhook providers
 */
export enum EmailProvider {
  SENDGRID = 'sendgrid',
  MAILGUN = 'mailgun',
  GENERIC = 'generic',
}

/**
 * Parsed email attachment metadata
 */
export interface EmailAttachment {
  /** Original filename */
  filename: string;
  /** MIME content type */
  contentType: string;
  /** Size in bytes */
  size: number;
  /** Content ID (for inline attachments) */
  contentId?: string;
  /** Attachment disposition (inline vs attachment) */
  disposition?: 'inline' | 'attachment';
  /** URL to download attachment (if provided by webhook) */
  url?: string;
}

/**
 * Parsed email headers
 */
export interface EmailHeaders {
  /** Message-ID header */
  messageId?: string;
  /** In-Reply-To header (for threading) */
  inReplyTo?: string;
  /** References header (for threading) */
  references?: string[];
  /** Date header */
  date?: string;
  /** X-Mailer or User-Agent */
  mailer?: string;
  /** List-Unsubscribe header (indicates newsletter) */
  listUnsubscribe?: string;
  /** Auto-Submitted header */
  autoSubmitted?: string;
  /** X-Auto-Response-Suppress header */
  autoResponseSuppress?: string;
  /** Precedence header */
  precedence?: string;
  /** Return-Path header */
  returnPath?: string;
  /** DKIM signature result */
  dkimResult?: string;
  /** SPF result */
  spfResult?: string;
  /** Raw headers map */
  raw?: Record<string, string>;
}

/**
 * Normalized email data after parsing
 */
export interface ParsedEmail {
  /** Detected email provider */
  provider: EmailProvider;
  /** Unique message ID */
  messageId: string;
  /** Sender email address */
  from: string;
  /** Sender display name (if available) */
  fromName?: string;
  /** Recipient email addresses */
  to: string[];
  /** CC recipients */
  cc?: string[];
  /** BCC recipients (if visible) */
  bcc?: string[];
  /** Reply-To address */
  replyTo?: string;
  /** Email subject line */
  subject: string;
  /** Plain text body */
  textBody: string;
  /** HTML body (if available) */
  htmlBody?: string;
  /** Parsed attachment metadata */
  attachments: EmailAttachment[];
  /** Parsed headers */
  headers: EmailHeaders;
  /** Detected email type */
  emailType: EmailType;
  /** Thread/conversation ID (if detected) */
  threadId?: string;
  /** Spam score (0-10, if available) */
  spamScore?: number;
  /** Whether email is suspected spam */
  isSpam: boolean;
  /** Whether email is an auto-reply */
  isAutoReply: boolean;
  /** Whether email is a bounce */
  isBounce: boolean;
  /** Raw timestamp from email */
  timestamp?: Date;
  /** Original raw payload */
  rawPayload: unknown;
}

// =============================================================================
// Zod Validation Schemas
// =============================================================================

/**
 * Schema for SendGrid Inbound Parse webhook payload
 * @see https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook
 */
const SendGridEmailSchema = z.object({
  // Required fields
  from: z.string().min(1, 'From address is required'),
  to: z.string().min(1, 'To address is required'),
  subject: z.string().default(''),
  text: z.string().default(''),

  // Optional fields
  html: z.string().optional(),
  sender_ip: z.string().optional(),
  envelope: z.string().optional(), // JSON string
  headers: z.string().optional(), // Raw headers
  dkim: z.string().optional(),
  SPF: z.string().optional(),
  spam_score: z.string().optional(),
  spam_report: z.string().optional(),
  attachments: z.string().optional(), // Number of attachments
  'attachment-info': z.string().optional(), // JSON string with attachment details
  charsets: z.string().optional(), // JSON string

  // Attachment files (dynamically named)
}).passthrough();

/**
 * Schema for Mailgun webhook payload
 * @see https://documentation.mailgun.com/en/latest/user_manual.html#routes
 */
const MailgunEmailSchema = z.object({
  // Required fields
  sender: z.string().min(1, 'Sender address is required'),
  recipient: z.string().min(1, 'Recipient address is required'),
  subject: z.string().default(''),
  'body-plain': z.string().default(''),

  // Optional fields
  'body-html': z.string().optional(),
  'stripped-text': z.string().optional(),
  'stripped-html': z.string().optional(),
  from: z.string().optional(),
  'Message-Id': z.string().optional(),
  'In-Reply-To': z.string().optional(),
  References: z.string().optional(),
  Date: z.string().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
  token: z.string().optional(),
  signature: z.string().optional(),
  'message-headers': z.string().optional(), // JSON array
  'content-id-map': z.string().optional(), // JSON object
  attachments: z.string().optional(), // JSON array

  // Spam/virus info
  'X-Mailgun-Sflag': z.string().optional(), // 'Yes' or 'No'
  'X-Mailgun-Sscore': z.string().optional(),
  'X-Mailgun-Spf': z.string().optional(),
  'X-Mailgun-Dkim-Check-Result': z.string().optional(),

}).passthrough();

/**
 * Schema for generic email webhook payload
 */
const GenericEmailSchema = z.object({
  // Try multiple common field names for sender
  from: z.string().optional(),
  sender: z.string().optional(),
  from_email: z.string().optional(),
  fromEmail: z.string().optional(),

  // Try multiple common field names for recipient
  to: z.union([z.string(), z.array(z.string())]).optional(),
  recipient: z.string().optional(),
  recipients: z.union([z.string(), z.array(z.string())]).optional(),
  to_email: z.string().optional(),
  toEmail: z.string().optional(),

  // Subject
  subject: z.string().optional(),
  title: z.string().optional(),

  // Body content
  text: z.string().optional(),
  body: z.string().optional(),
  text_body: z.string().optional(),
  textBody: z.string().optional(),
  'body-plain': z.string().optional(),
  plain: z.string().optional(),
  content: z.string().optional(),

  // HTML body
  html: z.string().optional(),
  html_body: z.string().optional(),
  htmlBody: z.string().optional(),
  'body-html': z.string().optional(),

  // Message ID
  message_id: z.string().optional(),
  messageId: z.string().optional(),
  'Message-Id': z.string().optional(),
  id: z.string().optional(),

  // Headers
  headers: z.union([z.string(), z.record(z.string())]).optional(),

  // Attachments
  attachments: z.union([
    z.string(),
    z.array(z.object({
      filename: z.string().optional(),
      name: z.string().optional(),
      contentType: z.string().optional(),
      content_type: z.string().optional(),
      type: z.string().optional(),
      size: z.number().optional(),
      url: z.string().optional(),
    }).passthrough()),
  ]).optional(),

  // Timestamp
  timestamp: z.union([z.string(), z.number(), z.date()]).optional(),
  date: z.union([z.string(), z.date()]).optional(),

  // Spam score
  spam_score: z.union([z.string(), z.number()]).optional(),
  spamScore: z.union([z.string(), z.number()]).optional(),

}).passthrough();

/**
 * Combined email input schema that accepts any supported format
 */
const EmailInputSchema = z.union([
  SendGridEmailSchema,
  MailgunEmailSchema,
  GenericEmailSchema,
]);

// =============================================================================
// Email Detection Patterns
// =============================================================================

/**
 * Patterns for detecting auto-reply emails
 */
const AUTO_REPLY_PATTERNS = {
  subjects: [
    /^auto[:\s-]*reply/i,
    /^automatic\s+reply/i,
    /^out\s+of\s+(the\s+)?office/i,
    /^ooo[:\s]/i,
    /away\s+from\s+(my\s+)?desk/i,
    /^vacation\s+reply/i,
    /^holiday\s+notice/i,
    /^\[auto-?reply\]/i,
    /^re:.*\[auto\]/i,
    /on\s+leave/i,
    /^automatic\s+response/i,
    /abwesenheitsnotiz/i, // German
    /absence\s+du\s+bureau/i, // French
  ],
  headers: {
    'auto-submitted': ['auto-replied', 'auto-generated', 'auto-notified'],
    'x-auto-response-suppress': ['all', 'oof', 'autoreply'],
    'precedence': ['bulk', 'junk', 'list', 'auto_reply'],
    'x-autoreply': ['yes'],
    'x-autorespond': [],
  },
};

/**
 * Patterns for detecting bounce emails
 */
const BOUNCE_PATTERNS = {
  subjects: [
    /^undelivered\s+mail/i,
    /^returned\s+mail/i,
    /^mail\s+delivery\s+(failed|failure|system)/i,
    /^delivery\s+(status\s+)?notification/i,
    /failure\s+notice/i,
    /^undeliverable/i,
    /could\s+not\s+be\s+delivered/i,
    /^rejected/i,
    /^(non[- ])?delivery\s+(report|notification)/i,
    /^postmaster/i,
    /^mailer[- ]daemon/i,
  ],
  fromAddresses: [
    /^mailer-daemon@/i,
    /^postmaster@/i,
    /^mail-daemon@/i,
    /^bounce/i,
    /^noreply/i,
    /^no-reply/i,
    /^donotreply/i,
  ],
};

/**
 * Patterns for detecting spam emails
 */
const SPAM_PATTERNS = {
  subjects: [
    /\$\$\$/,
    /free\s+money/i,
    /click\s+here\s+now/i,
    /act\s+now/i,
    /limited\s+time/i,
    /congratulations.*winner/i,
    /you'?ve?\s+won/i,
    /claim\s+your\s+prize/i,
    /nigerian?\s+prince/i,
    /urgent.*transfer/i,
    /viagra|cialis/i,
    /\bsex\b/i,
    /\bxxx\b/i,
  ],
  /** Spam score threshold (0-10 scale) */
  scoreThreshold: 5.0,
};

/**
 * Patterns for detecting newsletter/marketing emails
 */
const NEWSLETTER_PATTERNS = {
  headers: {
    'list-unsubscribe': true,
    'list-id': true,
    'x-campaign': true,
    'x-mailchimp': true,
    'x-sendgrid-marketing': true,
  },
  subjects: [
    /newsletter/i,
    /digest/i,
    /weekly\s+update/i,
    /monthly\s+recap/i,
  ],
};

/**
 * Patterns for detecting reply emails
 */
const REPLY_PATTERNS = {
  subjects: [
    /^re:\s*/i,
    /^aw:\s*/i, // German
    /^sv:\s*/i, // Swedish/Norwegian
    /^antw:\s*/i, // Dutch
    /^r:\s*/i, // Italian
    /^rif:\s*/i, // Italian
    /^res:\s*/i, // Portuguese/Spanish
  ],
};

/**
 * Patterns for detecting forwarded emails
 */
const FORWARD_PATTERNS = {
  subjects: [
    /^fwd?:\s*/i,
    /^fw:\s*/i,
    /^wg:\s*/i, // German
    /^vs:\s*/i, // Swedish/Norwegian
    /^tr:\s*/i, // French
    /^i:\s*/i, // Italian
    /^rv:\s*/i, // Spanish
    /^enc:\s*/i, // Portuguese
  ],
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a unique ID for messages without one
 */
function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}@agent-generated`;
}

/**
 * Extract email address from a string that may contain name + email
 * Examples:
 * - "John Doe <john@example.com>" -> "john@example.com"
 * - "john@example.com" -> "john@example.com"
 * - "<john@example.com>" -> "john@example.com"
 */
function extractEmail(input: string): string {
  if (!input) return '';

  // Try to extract from angle brackets
  const angleMatch = input.match(/<([^>]+)>/);
  if (angleMatch) {
    return angleMatch[1].trim().toLowerCase();
  }

  // Check if it's already a plain email
  const emailMatch = input.match(/[\w.+-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    return emailMatch[0].trim().toLowerCase();
  }

  return input.trim().toLowerCase();
}

/**
 * Extract display name from an email string
 * Examples:
 * - "John Doe <john@example.com>" -> "John Doe"
 * - "john@example.com" -> undefined
 * - '"John Doe" <john@example.com>' -> "John Doe"
 */
function extractName(input: string): string | undefined {
  if (!input) return undefined;

  // Check for quoted name
  const quotedMatch = input.match(/^"([^"]+)"\s*</);
  if (quotedMatch) {
    return quotedMatch[1].trim();
  }

  // Check for name before angle bracket
  const angleIndex = input.indexOf('<');
  if (angleIndex > 0) {
    const name = input.substring(0, angleIndex).trim();
    if (name && !name.includes('@')) {
      return name;
    }
  }

  return undefined;
}

/**
 * Extract name from email address if no display name is available
 * Example: "john.doe@example.com" -> "John Doe"
 */
function extractNameFromEmail(email: string): string {
  if (!email) return '';

  const localPart = email.split('@')[0];
  if (!localPart) return email;

  // Replace common separators with spaces and capitalize
  return localPart
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/**
 * Parse a comma-separated list of email addresses
 */
function parseEmailList(input: string | string[] | undefined): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map(extractEmail).filter(Boolean);
  }

  // Handle comma-separated string
  return input
    .split(/,\s*/)
    .map(extractEmail)
    .filter(Boolean);
}

/**
 * Parse headers from various formats
 */
function parseHeaders(headers: string | Record<string, string> | undefined): Record<string, string> {
  if (!headers) return {};

  if (typeof headers === 'object') {
    // Normalize header names to lowercase
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  }

  // Parse raw headers string
  const result: Record<string, string> = {};
  const lines = headers.split(/\r?\n/);
  let currentKey = '';
  let currentValue = '';

  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation of previous header
      currentValue += ' ' + line.trim();
    } else {
      // Save previous header if exists
      if (currentKey) {
        result[currentKey.toLowerCase()] = currentValue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentKey = line.substring(0, colonIndex).trim();
        currentValue = line.substring(colonIndex + 1).trim();
      }
    }
  }

  // Save last header
  if (currentKey) {
    result[currentKey.toLowerCase()] = currentValue;
  }

  return result;
}

/**
 * Parse Mailgun message headers (JSON array format)
 */
function parseMailgunHeaders(headersJson: string | undefined): Record<string, string> {
  if (!headersJson) return {};

  try {
    const parsed = JSON.parse(headersJson);
    if (Array.isArray(parsed)) {
      const result: Record<string, string> = {};
      for (const [key, value] of parsed) {
        if (typeof key === 'string' && typeof value === 'string') {
          result[key.toLowerCase()] = value;
        }
      }
      return result;
    }
  } catch {
    // Invalid JSON, return empty
  }

  return {};
}

/**
 * Extract thread ID from email headers
 */
function extractThreadId(headers: EmailHeaders): string | undefined {
  // Priority: In-Reply-To > first Reference > Message-ID
  if (headers.inReplyTo) {
    // Clean up the message ID
    const cleaned = headers.inReplyTo.replace(/[<>]/g, '').trim();
    return cleaned || undefined;
  }

  if (headers.references && headers.references.length > 0) {
    // Use the first reference (original message)
    const cleaned = headers.references[0].replace(/[<>]/g, '').trim();
    return cleaned || undefined;
  }

  return undefined;
}

/**
 * Parse references header into array
 */
function parseReferences(references: string | undefined): string[] {
  if (!references) return [];

  // References are space-separated message IDs
  return references
    .split(/\s+/)
    .map((ref) => ref.replace(/[<>]/g, '').trim())
    .filter(Boolean);
}

/**
 * Parse attachments from various formats
 */
function parseAttachments(
  attachmentData: string | unknown[] | undefined,
  attachmentInfo?: string
): EmailAttachment[] {
  if (!attachmentData && !attachmentInfo) return [];

  const attachments: EmailAttachment[] = [];

  // Handle SendGrid attachment-info JSON
  if (attachmentInfo) {
    try {
      const info = JSON.parse(attachmentInfo);
      if (typeof info === 'object') {
        for (const [key, details] of Object.entries(info)) {
          if (typeof details === 'object' && details !== null) {
            const att = details as Record<string, unknown>;
            attachments.push({
              filename: String(att.filename || att.name || key),
              contentType: String(att.type || att['content-type'] || 'application/octet-stream'),
              size: Number(att.size || 0),
              contentId: att['content-id'] ? String(att['content-id']) : undefined,
            });
          }
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  // Handle array of attachment objects
  if (Array.isArray(attachmentData)) {
    for (const att of attachmentData) {
      if (typeof att === 'object' && att !== null) {
        const a = att as Record<string, unknown>;
        attachments.push({
          filename: String(a.filename || a.name || 'unknown'),
          contentType: String(a.contentType || a.content_type || a.type || 'application/octet-stream'),
          size: Number(a.size || 0),
          contentId: a.contentId ? String(a.contentId) : undefined,
          url: a.url ? String(a.url) : undefined,
        });
      }
    }
  }

  // Handle Mailgun attachments JSON string
  if (typeof attachmentData === 'string' && attachmentData.startsWith('[')) {
    try {
      const parsed = JSON.parse(attachmentData);
      if (Array.isArray(parsed)) {
        return parseAttachments(parsed);
      }
    } catch {
      // Not valid JSON
    }
  }

  return attachments;
}

/**
 * Detect if an email is an auto-reply
 */
function detectAutoReply(subject: string, headers: EmailHeaders): boolean {
  // Check subject patterns
  for (const pattern of AUTO_REPLY_PATTERNS.subjects) {
    if (pattern.test(subject)) {
      return true;
    }
  }

  // Check header indicators
  if (headers.autoSubmitted) {
    const value = headers.autoSubmitted.toLowerCase();
    if (AUTO_REPLY_PATTERNS.headers['auto-submitted'].some((v) => value.includes(v))) {
      return true;
    }
  }

  if (headers.autoResponseSuppress) {
    const value = headers.autoResponseSuppress.toLowerCase();
    if (AUTO_REPLY_PATTERNS.headers['x-auto-response-suppress'].some((v) => value.includes(v))) {
      return true;
    }
  }

  if (headers.precedence) {
    const value = headers.precedence.toLowerCase();
    if (AUTO_REPLY_PATTERNS.headers['precedence'].some((v) => value === v)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect if an email is a bounce
 */
function detectBounce(subject: string, from: string, headers: EmailHeaders): boolean {
  // Check subject patterns
  for (const pattern of BOUNCE_PATTERNS.subjects) {
    if (pattern.test(subject)) {
      return true;
    }
  }

  // Check from address patterns
  for (const pattern of BOUNCE_PATTERNS.fromAddresses) {
    if (pattern.test(from)) {
      return true;
    }
  }

  // Check return path
  if (headers.returnPath) {
    for (const pattern of BOUNCE_PATTERNS.fromAddresses) {
      if (pattern.test(headers.returnPath)) {
        return true;
      }
    }
  }

  // Check auto-submitted header for bounces
  if (headers.autoSubmitted) {
    const value = headers.autoSubmitted.toLowerCase();
    if (value.includes('auto-generated') && BOUNCE_PATTERNS.subjects.some((p) => p.test(subject))) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate spam likelihood
 */
function detectSpam(
  subject: string,
  spamScore: number | undefined,
  headers: EmailHeaders
): { isSpam: boolean; score: number } {
  let score = spamScore ?? 0;

  // Add points for suspicious subject patterns
  for (const pattern of SPAM_PATTERNS.subjects) {
    if (pattern.test(subject)) {
      score += 2;
    }
  }

  // Check SPF and DKIM results
  if (headers.spfResult && !['pass', 'softfail'].includes(headers.spfResult.toLowerCase())) {
    score += 1;
  }

  if (headers.dkimResult && headers.dkimResult.toLowerCase() !== 'pass') {
    score += 1;
  }

  return {
    isSpam: score >= SPAM_PATTERNS.scoreThreshold,
    score: Math.min(score, 10),
  };
}

/**
 * Detect if email is a newsletter/marketing email
 */
function detectNewsletter(headers: EmailHeaders): boolean {
  const rawHeaders = headers.raw ?? {};

  for (const header of Object.keys(NEWSLETTER_PATTERNS.headers)) {
    if (rawHeaders[header] || headers.listUnsubscribe) {
      return true;
    }
  }

  return false;
}

/**
 * Determine the email type based on content and headers
 */
function determineEmailType(
  subject: string,
  from: string,
  headers: EmailHeaders,
  isSpam: boolean,
  isBounce: boolean,
  isAutoReply: boolean
): EmailType {
  // Priority order: Bounce > Spam > Auto-Reply > Newsletter > Forward > Reply > New

  if (isBounce) {
    return EmailType.BOUNCE;
  }

  if (isSpam) {
    return EmailType.SPAM;
  }

  if (isAutoReply) {
    return EmailType.AUTO_REPLY;
  }

  if (detectNewsletter(headers)) {
    return EmailType.NEWSLETTER;
  }

  // Check for forward
  for (const pattern of FORWARD_PATTERNS.subjects) {
    if (pattern.test(subject)) {
      return EmailType.FORWARD;
    }
  }

  // Check for reply
  for (const pattern of REPLY_PATTERNS.subjects) {
    if (pattern.test(subject)) {
      return EmailType.REPLY;
    }
  }

  // Check headers for reply indicators
  if (headers.inReplyTo || (headers.references && headers.references.length > 0)) {
    return EmailType.REPLY;
  }

  // Check for system notification patterns in from address
  const systemPatterns = [/^notify@/i, /^notification/i, /^alert@/i, /^system@/i];
  if (systemPatterns.some((p) => p.test(from))) {
    return EmailType.NOTIFICATION;
  }

  return EmailType.NEW_INQUIRY;
}

// =============================================================================
// Provider-Specific Parsers
// =============================================================================

/**
 * Parse SendGrid Inbound Parse webhook payload
 */
function parseSendGridEmail(payload: z.infer<typeof SendGridEmailSchema>): ParsedEmail {
  const from = extractEmail(payload.from);
  const fromName = extractName(payload.from) ?? extractNameFromEmail(from);
  const to = parseEmailList(payload.to);

  // Parse envelope for additional data
  let envelopeData: { to?: string[]; from?: string } = {};
  if (payload.envelope) {
    try {
      envelopeData = JSON.parse(payload.envelope);
    } catch {
      // Invalid JSON
    }
  }

  // Parse headers
  const rawHeaders = parseHeaders(payload.headers);
  const headers: EmailHeaders = {
    messageId: rawHeaders['message-id'],
    inReplyTo: rawHeaders['in-reply-to'],
    references: parseReferences(rawHeaders['references']),
    date: rawHeaders['date'],
    mailer: rawHeaders['x-mailer'] || rawHeaders['user-agent'],
    listUnsubscribe: rawHeaders['list-unsubscribe'],
    autoSubmitted: rawHeaders['auto-submitted'],
    autoResponseSuppress: rawHeaders['x-auto-response-suppress'],
    precedence: rawHeaders['precedence'],
    returnPath: rawHeaders['return-path'],
    dkimResult: payload.dkim,
    spfResult: payload.SPF,
    raw: rawHeaders,
  };

  // Parse spam score
  const spamScore = payload.spam_score ? parseFloat(payload.spam_score) : undefined;

  // Detect email characteristics
  const isAutoReply = detectAutoReply(payload.subject, headers);
  const isBounce = detectBounce(payload.subject, from, headers);
  const spamResult = detectSpam(payload.subject, spamScore, headers);

  // Determine email type
  const emailType = determineEmailType(
    payload.subject,
    from,
    headers,
    spamResult.isSpam,
    isBounce,
    isAutoReply
  );

  // Parse attachments
  const attachments = parseAttachments(undefined, payload['attachment-info']);

  return {
    provider: EmailProvider.SENDGRID,
    messageId: headers.messageId ?? generateMessageId(),
    from,
    fromName,
    to: to.length > 0 ? to : (envelopeData.to ?? []),
    subject: payload.subject,
    textBody: payload.text,
    htmlBody: payload.html,
    attachments,
    headers,
    emailType,
    threadId: extractThreadId(headers),
    spamScore: spamResult.score,
    isSpam: spamResult.isSpam,
    isAutoReply,
    isBounce,
    timestamp: headers.date ? new Date(headers.date) : undefined,
    rawPayload: payload,
  };
}

/**
 * Parse Mailgun webhook payload
 */
function parseMailgunEmail(payload: z.infer<typeof MailgunEmailSchema>): ParsedEmail {
  const from = extractEmail(payload.sender || payload.from || '');
  const fromName = extractName(payload.from || payload.sender || '') ?? extractNameFromEmail(from);
  const to = parseEmailList(payload.recipient);

  // Parse headers
  const rawHeaders = parseMailgunHeaders(payload['message-headers']);
  const headers: EmailHeaders = {
    messageId: payload['Message-Id'] || rawHeaders['message-id'],
    inReplyTo: payload['In-Reply-To'] || rawHeaders['in-reply-to'],
    references: parseReferences(payload.References || rawHeaders['references']),
    date: payload.Date || rawHeaders['date'],
    mailer: rawHeaders['x-mailer'] || rawHeaders['user-agent'],
    listUnsubscribe: rawHeaders['list-unsubscribe'],
    autoSubmitted: rawHeaders['auto-submitted'],
    autoResponseSuppress: rawHeaders['x-auto-response-suppress'],
    precedence: rawHeaders['precedence'],
    returnPath: rawHeaders['return-path'],
    dkimResult: payload['X-Mailgun-Dkim-Check-Result'],
    spfResult: payload['X-Mailgun-Spf'],
    raw: rawHeaders,
  };

  // Parse spam score
  const spamScore = payload['X-Mailgun-Sscore'] ? parseFloat(payload['X-Mailgun-Sscore']) : undefined;
  const isMailgunSpam = payload['X-Mailgun-Sflag']?.toLowerCase() === 'yes';

  // Detect email characteristics
  const isAutoReply = detectAutoReply(payload.subject, headers);
  const isBounce = detectBounce(payload.subject, from, headers);
  const spamResult = detectSpam(payload.subject, spamScore, headers);

  // Determine email type
  const emailType = determineEmailType(
    payload.subject,
    from,
    headers,
    isMailgunSpam || spamResult.isSpam,
    isBounce,
    isAutoReply
  );

  // Parse attachments
  const attachments = parseAttachments(payload.attachments);

  // Parse timestamp
  let timestamp: Date | undefined;
  if (payload.timestamp) {
    const ts = typeof payload.timestamp === 'string'
      ? parseInt(payload.timestamp, 10)
      : payload.timestamp;
    timestamp = new Date(ts * 1000);
  } else if (headers.date) {
    timestamp = new Date(headers.date);
  }

  return {
    provider: EmailProvider.MAILGUN,
    messageId: headers.messageId ?? generateMessageId(),
    from,
    fromName,
    to,
    subject: payload.subject,
    textBody: payload['stripped-text'] || payload['body-plain'],
    htmlBody: payload['stripped-html'] || payload['body-html'],
    attachments,
    headers,
    emailType,
    threadId: extractThreadId(headers),
    spamScore: spamResult.score,
    isSpam: isMailgunSpam || spamResult.isSpam,
    isAutoReply,
    isBounce,
    timestamp,
    rawPayload: payload,
  };
}

/**
 * Parse generic email webhook payload
 */
function parseGenericEmail(payload: z.infer<typeof GenericEmailSchema>): ParsedEmail {
  // Extract from address (try multiple field names)
  const fromRaw = payload.from || payload.sender || payload.from_email || payload.fromEmail || '';
  const from = extractEmail(fromRaw);
  const fromName = extractName(fromRaw) ?? extractNameFromEmail(from);

  // Extract to addresses (try multiple field names)
  const toRaw = payload.to || payload.recipient || payload.recipients || payload.to_email || payload.toEmail;
  const to = parseEmailList(toRaw as string | string[] | undefined);

  // Extract subject
  const subject = payload.subject || payload.title || '';

  // Extract text body (try multiple field names)
  const textBody = payload.text || payload.body || payload.text_body ||
    payload.textBody || payload['body-plain'] || payload.plain || payload.content || '';

  // Extract HTML body
  const htmlBody = payload.html || payload.html_body || payload.htmlBody || payload['body-html'];

  // Extract message ID
  const messageId = payload.message_id || payload.messageId ||
    payload['Message-Id'] || payload.id || generateMessageId();

  // Parse headers
  const rawHeaders = parseHeaders(payload.headers as string | Record<string, string> | undefined);
  const headers: EmailHeaders = {
    messageId,
    inReplyTo: rawHeaders['in-reply-to'],
    references: parseReferences(rawHeaders['references']),
    date: rawHeaders['date'],
    mailer: rawHeaders['x-mailer'] || rawHeaders['user-agent'],
    listUnsubscribe: rawHeaders['list-unsubscribe'],
    autoSubmitted: rawHeaders['auto-submitted'],
    autoResponseSuppress: rawHeaders['x-auto-response-suppress'],
    precedence: rawHeaders['precedence'],
    returnPath: rawHeaders['return-path'],
    raw: rawHeaders,
  };

  // Parse spam score
  const spamScoreRaw = payload.spam_score || payload.spamScore;
  const spamScore = spamScoreRaw !== undefined
    ? (typeof spamScoreRaw === 'string' ? parseFloat(spamScoreRaw) : spamScoreRaw)
    : undefined;

  // Detect email characteristics
  const isAutoReply = detectAutoReply(subject, headers);
  const isBounce = detectBounce(subject, from, headers);
  const spamResult = detectSpam(subject, spamScore, headers);

  // Determine email type
  const emailType = determineEmailType(
    subject,
    from,
    headers,
    spamResult.isSpam,
    isBounce,
    isAutoReply
  );

  // Parse attachments
  const attachments = parseAttachments(payload.attachments as string | unknown[] | undefined);

  // Parse timestamp
  let timestamp: Date | undefined;
  if (payload.timestamp) {
    if (payload.timestamp instanceof Date) {
      timestamp = payload.timestamp;
    } else if (typeof payload.timestamp === 'number') {
      timestamp = new Date(payload.timestamp * 1000);
    } else {
      timestamp = new Date(payload.timestamp);
    }
  } else if (payload.date) {
    timestamp = payload.date instanceof Date ? payload.date : new Date(payload.date);
  }

  return {
    provider: EmailProvider.GENERIC,
    messageId,
    from,
    fromName,
    to,
    subject,
    textBody,
    htmlBody,
    attachments,
    headers,
    emailType,
    threadId: extractThreadId(headers),
    spamScore: spamResult.score,
    isSpam: spamResult.isSpam,
    isAutoReply,
    isBounce,
    timestamp,
    rawPayload: payload,
  };
}

// =============================================================================
// EmailInputHandler Class
// =============================================================================

/**
 * Configuration options specific to EmailInputHandler
 */
export interface EmailHandlerConfig extends InputHandlerConfig {
  /** Automatically skip spam emails (don't emit events) */
  skipSpam?: boolean;
  /** Automatically skip bounce emails (don't emit events) */
  skipBounces?: boolean;
  /** Automatically skip auto-reply emails (don't emit events) */
  skipAutoReplies?: boolean;
  /** Custom spam score threshold (0-10) */
  spamThreshold?: number;
  /** Allowed sender domains (whitelist) */
  allowedDomains?: string[];
  /** Blocked sender domains (blacklist) */
  blockedDomains?: string[];
}

/**
 * Email-specific input metadata
 */
export interface EmailInputMetadata {
  senderEmail: string;
  senderName?: string;
  emailType: EmailType;
  threadId?: string;
  messageId: string;
  isSpam: boolean;
  isAutoReply: boolean;
  isBounce: boolean;
  spamScore?: number;
  hasAttachments: boolean;
  attachmentCount: number;
  provider: EmailProvider;
}

/**
 * EmailInputHandler - Processes incoming emails received via webhook
 *
 * @example
 * ```typescript
 * const emailHandler = new EmailInputHandler({
 *   skipSpam: true,
 *   skipBounces: true,
 * });
 *
 * // Process a SendGrid webhook
 * const result = await emailHandler.handleInput(sendGridPayload);
 *
 * // Or use specific provider method
 * const result = await emailHandler.handleSendGridEmail(sendGridPayload);
 * ```
 */
export class EmailInputHandler extends BaseInputHandler {
  private skipSpam: boolean;
  private skipBounces: boolean;
  private skipAutoReplies: boolean;
  private spamThreshold: number;
  private allowedDomains: Set<string>;
  private blockedDomains: Set<string>;

  // Email-specific statistics
  private emailStats = {
    totalEmails: 0,
    byType: new Map<EmailType, number>(),
    byProvider: new Map<EmailProvider, number>(),
    skippedSpam: 0,
    skippedBounces: 0,
    skippedAutoReplies: 0,
    skippedBlockedDomain: 0,
  };

  constructor(config: EmailHandlerConfig = {}) {
    super(config);

    this.skipSpam = config.skipSpam ?? false;
    this.skipBounces = config.skipBounces ?? false;
    this.skipAutoReplies = config.skipAutoReplies ?? false;
    this.spamThreshold = config.spamThreshold ?? SPAM_PATTERNS.scoreThreshold;
    this.allowedDomains = new Set((config.allowedDomains ?? []).map((d) => d.toLowerCase()));
    this.blockedDomains = new Set((config.blockedDomains ?? []).map((d) => d.toLowerCase()));
  }

  // ==========================================================================
  // BaseInputHandler Implementation
  // ==========================================================================

  protected getSource(): AgentInputSource {
    return InputSource.EMAIL;
  }

  /**
   * Validate email webhook payload
   */
  public validate(input: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic type check
    if (typeof input !== 'object' || input === null) {
      return {
        isValid: false,
        errors: ['Input must be a non-null object'],
        warnings: [],
      };
    }

    // Try to validate with Zod schemas
    const sendGridResult = SendGridEmailSchema.safeParse(input);
    const mailgunResult = MailgunEmailSchema.safeParse(input);
    const genericResult = GenericEmailSchema.safeParse(input);

    // Check if at least one schema matches
    if (!sendGridResult.success && !mailgunResult.success && !genericResult.success) {
      // Try to determine what's missing
      const obj = input as Record<string, unknown>;

      if (!obj.from && !obj.sender && !obj.from_email && !obj.fromEmail) {
        errors.push('Missing sender email address (from, sender, from_email, or fromEmail field)');
      }

      if (!obj.to && !obj.recipient && !obj.recipients && !obj.to_email && !obj.toEmail) {
        errors.push('Missing recipient email address (to, recipient, recipients, to_email, or toEmail field)');
      }

      if (errors.length === 0) {
        errors.push('Invalid email webhook payload format');
      }

      return {
        isValid: false,
        errors,
        warnings,
      };
    }

    // Determine which format matched and return sanitized input
    let sanitizedInput: unknown;
    if (sendGridResult.success) {
      sanitizedInput = sendGridResult.data;
    } else if (mailgunResult.success) {
      sanitizedInput = mailgunResult.data;
    } else if (genericResult.success) {
      sanitizedInput = genericResult.data;
    }

    // Add warnings for potential issues
    const obj = input as Record<string, unknown>;
    if (!obj.subject && !(obj as Record<string, unknown>).title) {
      warnings.push('Email has no subject line');
    }

    if (!obj.text && !obj.body && !obj['body-plain'] && !obj.content) {
      warnings.push('Email has no text body');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      sanitizedInput,
    };
  }

  /**
   * Process email webhook payload and emit event
   */
  public async handleInput(input: unknown): Promise<ProcessingResult> {
    const startTime = Date.now();

    return this.processWithErrorHandling(input, async () => {
      // Detect provider and parse email
      const parsedEmail = this.detectAndParseEmail(input);

      // Update statistics
      this.updateEmailStats(parsedEmail);

      // Check skip conditions
      const skipReason = this.shouldSkipEmail(parsedEmail);
      if (skipReason) {
        this.logger.info(`Skipping email: ${skipReason}`, {
          from: parsedEmail.from,
          subject: parsedEmail.subject,
          emailType: parsedEmail.emailType,
        });

        // Return success but without emitting event
        const normalizedInput = this.createAgentInput(parsedEmail);
        return this.createSuccessResult(normalizedInput, undefined, startTime);
      }

      // Create normalized AgentInput
      const normalizedInput = this.createAgentInput(parsedEmail);

      // Create event payload
      const eventPayload = this.createEventPayload(parsedEmail, normalizedInput.correlationId!);

      // Emit event
      const emitResult = await this.emitEvent(
        'email:received',
        eventPayload,
        normalizedInput.correlationId
      );

      this.logger.info('Email processed successfully', {
        messageId: parsedEmail.messageId,
        from: parsedEmail.from,
        emailType: parsedEmail.emailType,
        threadId: parsedEmail.threadId,
        correlationId: normalizedInput.correlationId,
      });

      return this.createSuccessResult(
        normalizedInput,
        { type: 'email:received', result: emitResult },
        startTime
      );
    });
  }

  // ==========================================================================
  // Provider-Specific Methods
  // ==========================================================================

  /**
   * Handle SendGrid Inbound Parse webhook specifically
   */
  public async handleSendGridEmail(payload: unknown): Promise<ProcessingResult> {
    const validation = SendGridEmailSchema.safeParse(payload);
    if (!validation.success) {
      return {
        success: false,
        input: this.normalizeInput(payload, 'validation_error'),
        error: new Error(`Invalid SendGrid payload: ${validation.error.message}`),
        processingTimeMs: 0,
      };
    }

    const parsedEmail = parseSendGridEmail(validation.data);
    return this.processEmail(parsedEmail);
  }

  /**
   * Handle Mailgun webhook specifically
   */
  public async handleMailgunEmail(payload: unknown): Promise<ProcessingResult> {
    const validation = MailgunEmailSchema.safeParse(payload);
    if (!validation.success) {
      return {
        success: false,
        input: this.normalizeInput(payload, 'validation_error'),
        error: new Error(`Invalid Mailgun payload: ${validation.error.message}`),
        processingTimeMs: 0,
      };
    }

    const parsedEmail = parseMailgunEmail(validation.data);
    return this.processEmail(parsedEmail);
  }

  /**
   * Handle generic email webhook
   */
  public async handleGenericEmail(payload: unknown): Promise<ProcessingResult> {
    const validation = GenericEmailSchema.safeParse(payload);
    if (!validation.success) {
      return {
        success: false,
        input: this.normalizeInput(payload, 'validation_error'),
        error: new Error(`Invalid email payload: ${validation.error.message}`),
        processingTimeMs: 0,
      };
    }

    const parsedEmail = parseGenericEmail(validation.data);
    return this.processEmail(parsedEmail);
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Detect email provider and parse the payload
   */
  private detectAndParseEmail(input: unknown): ParsedEmail {
    const obj = input as Record<string, unknown>;

    // Detect SendGrid format
    // SendGrid uses 'from', 'to' as primary fields with 'envelope' and 'headers' as strings
    if (obj.envelope !== undefined || (obj.from && obj.to && obj.dkim !== undefined)) {
      const validation = SendGridEmailSchema.safeParse(input);
      if (validation.success) {
        return parseSendGridEmail(validation.data);
      }
    }

    // Detect Mailgun format
    // Mailgun uses 'sender', 'recipient' and 'body-plain'
    if (obj.sender !== undefined && obj.recipient !== undefined) {
      const validation = MailgunEmailSchema.safeParse(input);
      if (validation.success) {
        return parseMailgunEmail(validation.data);
      }
    }

    // Fall back to generic format
    return parseGenericEmail(input as z.infer<typeof GenericEmailSchema>);
  }

  /**
   * Process a parsed email (shared logic for all providers)
   */
  private async processEmail(parsedEmail: ParsedEmail): Promise<ProcessingResult> {
    const startTime = Date.now();

    // Update statistics
    this.updateEmailStats(parsedEmail);

    // Check skip conditions
    const skipReason = this.shouldSkipEmail(parsedEmail);
    if (skipReason) {
      this.logger.info(`Skipping email: ${skipReason}`, {
        from: parsedEmail.from,
        subject: parsedEmail.subject,
        emailType: parsedEmail.emailType,
      });

      const normalizedInput = this.createAgentInput(parsedEmail);
      return this.createSuccessResult(normalizedInput, undefined, startTime);
    }

    // Create normalized AgentInput
    const normalizedInput = this.createAgentInput(parsedEmail);

    // Create event payload
    const eventPayload = this.createEventPayload(parsedEmail, normalizedInput.correlationId!);

    // Emit event
    const emitResult = await this.emitEvent(
      'email:received',
      eventPayload,
      normalizedInput.correlationId
    );

    this.logger.info('Email processed successfully', {
      messageId: parsedEmail.messageId,
      from: parsedEmail.from,
      emailType: parsedEmail.emailType,
      threadId: parsedEmail.threadId,
      correlationId: normalizedInput.correlationId,
    });

    return this.createSuccessResult(
      normalizedInput,
      { type: 'email:received', result: emitResult },
      startTime
    );
  }

  /**
   * Check if email should be skipped based on configuration
   */
  private shouldSkipEmail(email: ParsedEmail): string | null {
    // Check spam
    if (this.skipSpam && email.isSpam) {
      this.emailStats.skippedSpam++;
      return 'spam detected';
    }

    // Check custom spam threshold
    if (email.spamScore !== undefined && email.spamScore >= this.spamThreshold) {
      this.emailStats.skippedSpam++;
      return `spam score ${email.spamScore} exceeds threshold ${this.spamThreshold}`;
    }

    // Check bounce
    if (this.skipBounces && email.isBounce) {
      this.emailStats.skippedBounces++;
      return 'bounce email';
    }

    // Check auto-reply
    if (this.skipAutoReplies && email.isAutoReply) {
      this.emailStats.skippedAutoReplies++;
      return 'auto-reply';
    }

    // Check domain whitelist
    if (this.allowedDomains.size > 0) {
      const senderDomain = email.from.split('@')[1]?.toLowerCase();
      if (senderDomain && !this.allowedDomains.has(senderDomain)) {
        this.emailStats.skippedBlockedDomain++;
        return `sender domain ${senderDomain} not in allowed list`;
      }
    }

    // Check domain blacklist
    if (this.blockedDomains.size > 0) {
      const senderDomain = email.from.split('@')[1]?.toLowerCase();
      if (senderDomain && this.blockedDomains.has(senderDomain)) {
        this.emailStats.skippedBlockedDomain++;
        return `sender domain ${senderDomain} is blocked`;
      }
    }

    return null;
  }

  /**
   * Create normalized AgentInput from parsed email
   */
  private createAgentInput(email: ParsedEmail): AgentInput {
    const metadata: EmailInputMetadata = {
      senderEmail: email.from,
      senderName: email.fromName,
      emailType: email.emailType,
      threadId: email.threadId,
      messageId: email.messageId,
      isSpam: email.isSpam,
      isAutoReply: email.isAutoReply,
      isBounce: email.isBounce,
      spamScore: email.spamScore,
      hasAttachments: email.attachments.length > 0,
      attachmentCount: email.attachments.length,
      provider: email.provider,
    };

    return this.normalizeInput(
      email.rawPayload,
      `email_${email.emailType}`,
      {
        metadata: {
          // Email-specific metadata (spread from metadata object)
          ...metadata,
          // Override with standard AgentInputMetadata fields
          tags: [
            email.emailType,
            email.provider,
            ...(email.isSpam ? ['spam'] : []),
            ...(email.isAutoReply ? ['auto-reply'] : []),
            ...(email.isBounce ? ['bounce'] : []),
            ...(email.threadId ? ['thread'] : ['new']),
          ],
          relatedEntityIds: email.threadId
            ? { threadId: email.threadId, messageId: email.messageId }
            : { messageId: email.messageId },
          priorityHint: this.calculatePriority(email),
        },
      }
    );
  }

  /**
   * Create event payload for email:received event
   */
  private createEventPayload(email: ParsedEmail, correlationId: string): EmailEventPayload {
    return {
      id: email.messageId,
      timestamp: email.timestamp ?? new Date(),
      source: InputSource.EMAIL,
      orgId: this.orgId,
      metadata: {
        provider: email.provider,
        emailType: email.emailType,
        threadId: email.threadId,
        isSpam: email.isSpam,
        isAutoReply: email.isAutoReply,
        isBounce: email.isBounce,
        spamScore: email.spamScore,
        correlationId,
      },
      emailId: email.messageId,
      from: email.from,
      to: email.to,
      subject: email.subject,
      body: email.textBody,
      attachments: email.attachments.map((att) => ({
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
      })),
    };
  }

  /**
   * Calculate priority hint based on email content
   */
  private calculatePriority(email: ParsedEmail): number {
    // Default priority is 3 (medium)
    let priority = 3;

    // Lower priority for spam, bounces, auto-replies
    if (email.isSpam) return 1;
    if (email.isBounce) return 2;
    if (email.isAutoReply) return 2;
    if (email.emailType === EmailType.NEWSLETTER) return 1;

    // Check for urgency keywords in subject
    const urgentPatterns = [
      /urgent/i,
      /asap/i,
      /emergency/i,
      /critical/i,
      /important/i,
      /priority/i,
      /time.?sensitive/i,
    ];

    for (const pattern of urgentPatterns) {
      if (pattern.test(email.subject)) {
        priority = Math.min(priority + 1, 5);
      }
    }

    // Replies might need faster response
    if (email.emailType === EmailType.REPLY) {
      priority = Math.min(priority + 1, 5);
    }

    return priority;
  }

  /**
   * Update email-specific statistics
   */
  private updateEmailStats(email: ParsedEmail): void {
    this.emailStats.totalEmails++;

    // Update by type count
    const typeCount = this.emailStats.byType.get(email.emailType) ?? 0;
    this.emailStats.byType.set(email.emailType, typeCount + 1);

    // Update by provider count
    const providerCount = this.emailStats.byProvider.get(email.provider) ?? 0;
    this.emailStats.byProvider.set(email.provider, providerCount + 1);
  }

  /**
   * Determine input type from parsed email
   */
  protected determineInputType(input: unknown): string {
    // This is called by processWithErrorHandling before we have parsed the email
    // Return a generic type, the actual type is set in createAgentInput
    return 'email_received';
  }

  // ==========================================================================
  // Public Utility Methods
  // ==========================================================================

  /**
   * Get email-specific statistics
   */
  public getEmailStats(): {
    totalEmails: number;
    byType: Record<string, number>;
    byProvider: Record<string, number>;
    skippedSpam: number;
    skippedBounces: number;
    skippedAutoReplies: number;
    skippedBlockedDomain: number;
  } {
    return {
      totalEmails: this.emailStats.totalEmails,
      byType: Object.fromEntries(this.emailStats.byType),
      byProvider: Object.fromEntries(this.emailStats.byProvider),
      skippedSpam: this.emailStats.skippedSpam,
      skippedBounces: this.emailStats.skippedBounces,
      skippedAutoReplies: this.emailStats.skippedAutoReplies,
      skippedBlockedDomain: this.emailStats.skippedBlockedDomain,
    };
  }

  /**
   * Reset email-specific statistics
   */
  public resetEmailStats(): void {
    this.emailStats = {
      totalEmails: 0,
      byType: new Map(),
      byProvider: new Map(),
      skippedSpam: 0,
      skippedBounces: 0,
      skippedAutoReplies: 0,
      skippedBlockedDomain: 0,
    };
  }

  /**
   * Parse an email address and extract components
   */
  public static parseEmailAddress(input: string): {
    email: string;
    name?: string;
    domain: string;
    localPart: string;
  } {
    const email = extractEmail(input);
    const name = extractName(input);
    const [localPart = '', domain = ''] = email.split('@');

    return {
      email,
      name,
      domain,
      localPart,
    };
  }

  /**
   * Check if an email address appears to be a no-reply address
   */
  public static isNoReplyAddress(email: string): boolean {
    const patterns = [
      /^no-?reply/i,
      /^do-?not-?reply/i,
      /^noreply/i,
      /^mailer-?daemon/i,
      /^postmaster/i,
      /^bounce/i,
    ];

    return patterns.some((p) => p.test(email));
  }

  /**
   * Extract a clean subject line (remove Re:, Fwd:, etc.)
   */
  public static cleanSubject(subject: string): string {
    // Remove common reply/forward prefixes
    const prefixes = [
      /^(re|aw|sv|antw|r|rif|res):\s*/i,
      /^(fwd?|fw|wg|vs|tr|i|rv|enc):\s*/i,
    ];

    let cleaned = subject.trim();
    let changed = true;

    while (changed) {
      changed = false;
      for (const prefix of prefixes) {
        const newCleaned = cleaned.replace(prefix, '');
        if (newCleaned !== cleaned) {
          cleaned = newCleaned;
          changed = true;
        }
      }
    }

    return cleaned.trim();
  }
}

// =============================================================================
// Convenience Exports
// =============================================================================

// Export utility functions for external use
export { extractEmail, extractName, extractNameFromEmail };

// Note: ParsedEmail, EmailAttachment, and EmailHeaders are already exported
// with their interface declarations above
