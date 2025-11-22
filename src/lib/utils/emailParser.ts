/**
 * Email Parser Utilities
 *
 * Helper functions for parsing and processing incoming emails
 * for the scheduling agent email channel handler.
 */

// ============================================================================
// Types
// ============================================================================

export interface ParsedEvent {
  uid?: string;
  summary?: string;
  description?: string;
  dtstart?: Date;
  dtend?: Date;
  location?: string;
  organizer?: string;
  attendees?: string[];
  status?: string;
  sequence?: number;
  method?: string;
}

export interface EmailIntent {
  intent: string;
  priority: number;
  confidence: number;
}

// ============================================================================
// HTML Processing
// ============================================================================

/**
 * Strip HTML tags from content and return plain text
 * Preserves some structure by converting block elements to newlines
 */
export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Replace common block elements with newlines
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Normalize whitespace
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

// ============================================================================
// Email Signature Removal
// ============================================================================

/**
 * Common email signature patterns to detect and strip
 */
const SIGNATURE_PATTERNS = [
  // Standard separators
  /^[-_=]{2,}\s*$/m,
  // "Sent from" patterns
  /^Sent from my (iPhone|iPad|Android|Samsung|BlackBerry|Windows Phone|Mobile).*/im,
  /^Sent from (?:Yahoo|Outlook|Gmail|Mail) for .*/im,
  /^Get Outlook for .*/im,
  // Reply indicators
  /^On .+ wrote:$/m,
  /^From:.*\nSent:.*\nTo:.*\nSubject:.*/m,
  /^-{2,}.*Original Message.*-{2,}/im,
  /^>{2,}\s*On .+ wrote:/m,
  // Common signature starters
  /^(Best|Regards|Thanks|Cheers|Sincerely|Kind regards|Best regards|Thank you|Warm regards),?\s*$/im,
  /^(--\s*$)/m,
  // Confidentiality notices
  /^(CONFIDENTIALITY|DISCLAIMER|NOTICE):/im,
  /^This email (?:and any|message).*(confidential|privileged|intended).*/im,
];

/**
 * Strip email signature from text body
 * Attempts to detect and remove common signature patterns
 */
export function stripEmailSignature(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleanedText = text;
  const lines = cleanedText.split('\n');
  let cutoffIndex = lines.length;

  // Find the earliest signature indicator
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const remainingText = lines.slice(i).join('\n');

    for (const pattern of SIGNATURE_PATTERNS) {
      if (pattern.test(line) || pattern.test(remainingText)) {
        // Found signature, check if it's in a reasonable position
        // (signatures are typically in the last 30% of the email)
        if (i > lines.length * 0.3) {
          cutoffIndex = Math.min(cutoffIndex, i);
          break;
        }
      }
    }
  }

  // Take content before signature
  cleanedText = lines.slice(0, cutoffIndex).join('\n');

  // Clean up trailing whitespace and empty lines
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n').trim();

  return cleanedText;
}

// ============================================================================
// ICS Calendar Parsing
// ============================================================================

/**
 * Parse an ICS calendar attachment and extract event details
 * @param content Base64 encoded or plain text ICS content
 * @returns Parsed event details or null if parsing fails
 */
export function parseIcsAttachment(content: string): ParsedEvent | null {
  if (!content || typeof content !== 'string') {
    return null;
  }

  try {
    // Decode base64 if necessary
    let icsContent = content;
    if (isBase64(content)) {
      icsContent = Buffer.from(content, 'base64').toString('utf-8');
    }

    // Validate it looks like ICS content
    if (!icsContent.includes('BEGIN:VCALENDAR') && !icsContent.includes('BEGIN:VEVENT')) {
      return null;
    }

    const event: ParsedEvent = {};

    // Extract VEVENT block
    const veventMatch = icsContent.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
    if (!veventMatch) {
      return null;
    }

    const vevent = veventMatch[0];

    // Parse UID
    const uidMatch = vevent.match(/UID:(.+)/);
    if (uidMatch) {
      event.uid = unfoldIcsLine(uidMatch[1].trim());
    }

    // Parse SUMMARY (title)
    const summaryMatch = vevent.match(/SUMMARY(?:;[^:]*)?:(.+)/);
    if (summaryMatch) {
      event.summary = unfoldIcsLine(summaryMatch[1].trim());
    }

    // Parse DESCRIPTION
    const descMatch = vevent.match(/DESCRIPTION(?:;[^:]*)?:(.+)/);
    if (descMatch) {
      event.description = unfoldIcsLine(descMatch[1].trim());
    }

    // Parse DTSTART
    const dtstartMatch = vevent.match(/DTSTART(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/);
    if (dtstartMatch) {
      event.dtstart = parseIcsDate(dtstartMatch[1]);
    }

    // Parse DTEND
    const dtendMatch = vevent.match(/DTEND(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/);
    if (dtendMatch) {
      event.dtend = parseIcsDate(dtendMatch[1]);
    }

    // Parse LOCATION
    const locationMatch = vevent.match(/LOCATION(?:;[^:]*)?:(.+)/);
    if (locationMatch) {
      event.location = unfoldIcsLine(locationMatch[1].trim());
    }

    // Parse ORGANIZER
    const organizerMatch = vevent.match(/ORGANIZER(?:;[^:]*)?:(.+)/);
    if (organizerMatch) {
      const organizer = unfoldIcsLine(organizerMatch[1].trim());
      event.organizer = organizer.replace(/^mailto:/i, '');
    }

    // Parse ATTENDEES
    const attendeeMatches = vevent.matchAll(/ATTENDEE(?:;[^:]*)?:(.+)/g);
    event.attendees = [];
    for (const match of attendeeMatches) {
      const attendee = unfoldIcsLine(match[1].trim()).replace(/^mailto:/i, '');
      event.attendees.push(attendee);
    }

    // Parse STATUS
    const statusMatch = vevent.match(/STATUS:(.+)/);
    if (statusMatch) {
      event.status = statusMatch[1].trim();
    }

    // Parse SEQUENCE
    const sequenceMatch = vevent.match(/SEQUENCE:(\d+)/);
    if (sequenceMatch) {
      event.sequence = parseInt(sequenceMatch[1], 10);
    }

    // Parse METHOD from VCALENDAR
    const methodMatch = icsContent.match(/METHOD:(.+)/);
    if (methodMatch) {
      event.method = methodMatch[1].trim();
    }

    return event;
  } catch (error) {
    console.error('[EmailParser] Error parsing ICS content:', error);
    return null;
  }
}

/**
 * Check if a string is base64 encoded
 */
function isBase64(str: string): boolean {
  if (!str || str.length === 0) {
    return false;
  }
  // Base64 strings should only contain valid base64 characters
  // and should not start with ICS content directly
  return /^[A-Za-z0-9+/=]+$/.test(str.replace(/\s/g, '')) &&
    !str.startsWith('BEGIN:');
}

/**
 * Unfold ICS line continuations
 * ICS format allows long lines to be split with CRLF + whitespace
 */
function unfoldIcsLine(line: string): string {
  return line
    .replace(/\r?\n[ \t]/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse ICS date format (YYYYMMDD or YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
 */
function parseIcsDate(dateStr: string): Date | undefined {
  if (!dateStr) {
    return undefined;
  }

  try {
    // Handle YYYYMMDD format
    if (dateStr.length === 8) {
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1;
      const day = parseInt(dateStr.substring(6, 8), 10);
      return new Date(year, month, day);
    }

    // Handle YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ format
    if (dateStr.length >= 15) {
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1;
      const day = parseInt(dateStr.substring(6, 8), 10);
      const hour = parseInt(dateStr.substring(9, 11), 10);
      const minute = parseInt(dateStr.substring(11, 13), 10);
      const second = parseInt(dateStr.substring(13, 15), 10);

      // If ends with Z, it's UTC
      if (dateStr.endsWith('Z')) {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }

      return new Date(year, month, day, hour, minute, second);
    }

    return undefined;
  } catch {
    return undefined;
  }
}

// ============================================================================
// Email Intent Extraction
// ============================================================================

/**
 * Intent keywords and their scoring
 */
const INTENT_KEYWORDS: Record<string, { keywords: string[]; priority: number; confidence: number }> = {
  SCHEDULE_MEETING: {
    keywords: [
      'schedule', 'book', 'set up', 'arrange', 'meeting', 'call', 'appointment',
      'catch up', 'sync', 'discuss', 'meet', 'calendar', 'time to talk',
      'quick call', 'zoom', 'teams', 'available for', 'let\'s meet'
    ],
    priority: 3,
    confidence: 0.7,
  },
  RESCHEDULE_MEETING: {
    keywords: [
      'reschedule', 'move', 'postpone', 'change time', 'different time',
      'push back', 'another time', 'can\'t make it', 'conflict', 'rain check'
    ],
    priority: 4,
    confidence: 0.75,
  },
  CANCEL_MEETING: {
    keywords: [
      'cancel', 'cancellation', 'won\'t be able', 'can\'t attend',
      'not going to make', 'have to skip', 'drop the meeting'
    ],
    priority: 4,
    confidence: 0.8,
  },
  CHECK_AVAILABILITY: {
    keywords: [
      'available', 'availability', 'free', 'open slots', 'when can',
      'what times', 'your calendar', 'check your schedule'
    ],
    priority: 2,
    confidence: 0.65,
  },
  URGENT: {
    keywords: [
      'urgent', 'asap', 'immediately', 'emergency', 'critical',
      'right away', 'as soon as possible', 'pressing', 'time-sensitive'
    ],
    priority: 5,
    confidence: 0.85,
  },
  FOLLOW_UP: {
    keywords: [
      'follow up', 'following up', 'checking in', 'just wanted to check',
      'any update', 'status', 'touched base', 'circle back'
    ],
    priority: 2,
    confidence: 0.6,
  },
  CONFIRMATION: {
    keywords: [
      'confirm', 'confirmed', 'see you', 'looking forward', 'sounds good',
      'works for me', 'perfect', 'great', 'accepted'
    ],
    priority: 2,
    confidence: 0.7,
  },
};

/**
 * Extract intent from email subject line
 * Analyzes subject for scheduling-related keywords and assigns intent/priority
 */
export function extractEmailIntent(subject: string): EmailIntent {
  if (!subject || typeof subject !== 'string') {
    return {
      intent: 'UNKNOWN',
      priority: 3,
      confidence: 0.0,
    };
  }

  const lowerSubject = subject.toLowerCase();
  let bestMatch: EmailIntent = {
    intent: 'UNKNOWN',
    priority: 3,
    confidence: 0.0,
  };

  // Check each intent category
  for (const [intent, config] of Object.entries(INTENT_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of config.keywords) {
      if (lowerSubject.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // Calculate confidence based on keyword matches
    if (matchCount > 0) {
      const confidence = Math.min(
        config.confidence + (matchCount - 1) * 0.1,
        0.95
      );

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          intent,
          priority: config.priority,
          confidence,
        };
      }
    }
  }

  // Boost priority for urgent markers
  if (bestMatch.intent !== 'URGENT' && lowerSubject.match(/urgent|asap|emergency/i)) {
    bestMatch.priority = Math.min(bestMatch.priority + 1, 5);
  }

  // Check for RE: / FW: prefixes (indicates thread continuation)
  if (/^(re|fw|fwd):\s*/i.test(subject)) {
    if (bestMatch.intent === 'UNKNOWN') {
      bestMatch.intent = 'FOLLOW_UP';
      bestMatch.confidence = 0.5;
    }
  }

  return bestMatch;
}

// ============================================================================
// Additional Utilities
// ============================================================================

/**
 * Extract email address from a formatted email string
 * Handles formats like "John Doe <john@example.com>" or just "john@example.com"
 */
export function extractEmailAddress(emailString: string): string | null {
  if (!emailString) {
    return null;
  }

  // Try to match email in angle brackets
  const bracketMatch = emailString.match(/<([^>]+@[^>]+)>/);
  if (bracketMatch) {
    return bracketMatch[1].toLowerCase().trim();
  }

  // Try to match plain email address
  const emailMatch = emailString.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    return emailMatch[0].toLowerCase().trim();
  }

  return null;
}

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  const address = extractEmailAddress(email);
  if (!address) {
    return null;
  }

  const parts = address.split('@');
  return parts.length === 2 ? parts[1] : null;
}

/**
 * Clean and normalize email content for processing
 * Combines HTML stripping, signature removal, and whitespace normalization
 */
export function cleanEmailContent(
  textBody: string | undefined,
  htmlBody: string | undefined
): string {
  // Prefer text body, fall back to HTML
  let content = textBody || '';

  if (!content && htmlBody) {
    content = stripHtmlTags(htmlBody);
  }

  // Strip signature
  content = stripEmailSignature(content);

  // Final cleanup
  content = content
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Limit content length to prevent excessive processing
  const MAX_CONTENT_LENGTH = 10000;
  if (content.length > MAX_CONTENT_LENGTH) {
    content = content.substring(0, MAX_CONTENT_LENGTH) + '...[truncated]';
  }

  return content;
}
