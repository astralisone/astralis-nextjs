import * as crypto from "crypto";

// ============================================================================
// Twilio Signature Validation
// ============================================================================

/**
 * Validates the X-Twilio-Signature header to ensure the request is from Twilio.
 *
 * The signature is computed by:
 * 1. Taking the full URL of the request
 * 2. Appending all POST parameters sorted by key
 * 3. Computing HMAC-SHA1 with the auth token
 * 4. Base64 encoding the result
 *
 * @param signature - The X-Twilio-Signature header value
 * @param url - The full URL of the webhook endpoint
 * @param params - The POST parameters as key-value pairs
 * @param authToken - The Twilio auth token from environment
 * @returns true if the signature is valid, false otherwise
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
  authToken: string
): boolean {
  if (!signature || !url || !authToken) {
    return false;
  }

  // Sort the POST parameters alphabetically by key
  const sortedKeys = Object.keys(params).sort();

  // Concatenate the full URL with all POST parameters
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  // Compute the HMAC-SHA1 signature
  const computedSignature = crypto
    .createHmac("sha1", authToken)
    .update(data, "utf8")
    .digest("base64");

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch {
    // If buffers have different lengths, they're not equal
    return false;
  }
}

// ============================================================================
// Phone Number Parsing
// ============================================================================

export interface ParsedPhoneNumber {
  /** The country code (e.g., "1" for US/Canada) */
  countryCode: string;
  /** The national number without country code */
  number: string;
  /** The original raw phone number */
  raw: string;
  /** The E.164 formatted number (e.g., "+14155551234") */
  e164: string;
  /** Whether the phone number appears valid */
  isValid: boolean;
}

/**
 * Parses a phone number into its components.
 * Handles various formats: +1234567890, 1234567890, (123) 456-7890, etc.
 *
 * @param phone - The raw phone number string
 * @returns ParsedPhoneNumber object with country code and number
 */
export function parsePhoneNumber(phone: string): ParsedPhoneNumber {
  // Remove all non-digit characters except leading +
  const hasPlus = phone.startsWith("+");
  const digitsOnly = phone.replace(/\D/g, "");

  // Default result for invalid numbers
  const invalidResult: ParsedPhoneNumber = {
    countryCode: "",
    number: digitsOnly,
    raw: phone,
    e164: phone,
    isValid: false,
  };

  if (digitsOnly.length < 10) {
    return invalidResult;
  }

  // Determine country code
  let countryCode: string;
  let nationalNumber: string;

  if (hasPlus || digitsOnly.length === 11) {
    // International format or 11 digits (assume US/Canada with country code)
    if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
      countryCode = "1";
      nationalNumber = digitsOnly.slice(1);
    } else if (digitsOnly.length >= 11) {
      // Try to extract country code (1-3 digits for most countries)
      // For simplicity, assume 1-digit country code for now (US/Canada)
      if (digitsOnly.startsWith("1")) {
        countryCode = "1";
        nationalNumber = digitsOnly.slice(1);
      } else {
        // Unknown country code format
        countryCode = digitsOnly.slice(0, Math.min(3, digitsOnly.length - 10));
        nationalNumber = digitsOnly.slice(countryCode.length);
      }
    } else {
      countryCode = "";
      nationalNumber = digitsOnly;
    }
  } else if (digitsOnly.length === 10) {
    // Assume US/Canada without country code
    countryCode = "1";
    nationalNumber = digitsOnly;
  } else {
    // Unknown format
    return invalidResult;
  }

  // Validate that we have a reasonable number
  if (nationalNumber.length < 10 || nationalNumber.length > 12) {
    return invalidResult;
  }

  return {
    countryCode,
    number: nationalNumber,
    raw: phone,
    e164: `+${countryCode}${nationalNumber}`,
    isValid: true,
  };
}

// ============================================================================
// Quick Reply Detection
// ============================================================================

export type QuickReplyType = "confirm" | "cancel" | "select" | "reschedule" | "help" | "other";

export interface QuickReply {
  /** The type of quick reply detected */
  type: QuickReplyType;
  /** Optional value for selection type replies (e.g., "1", "2", "3") */
  value?: string;
  /** Confidence score 0-1 */
  confidence: number;
}

/**
 * Patterns for detecting quick replies in SMS messages.
 * Each pattern maps to a reply type and optional value extractor.
 */
const QUICK_REPLY_PATTERNS: Array<{
  pattern: RegExp;
  type: QuickReplyType;
  valueExtractor?: (match: RegExpMatchArray) => string;
  confidence: number;
}> = [
  // Confirm patterns (high confidence)
  { pattern: /^(y(es)?|yep|yup|yeah|ok(ay)?|sure|confirm(ed)?|correct|right|absolutely|definitely|affirmative)$/i, type: "confirm", confidence: 0.95 },
  { pattern: /^(sounds good|that works|perfect|great|good|fine)$/i, type: "confirm", confidence: 0.9 },
  { pattern: /^(book it|schedule it|confirm it|let'?s do it)$/i, type: "confirm", confidence: 0.95 },

  // Cancel patterns (high confidence)
  { pattern: /^(n(o)?|nope|nah|cancel(led)?|stop|abort|nevermind|never mind)$/i, type: "cancel", confidence: 0.95 },
  { pattern: /^(don'?t|do not|please don'?t|no thanks|no thank you)$/i, type: "cancel", confidence: 0.85 },
  { pattern: /^(cancel (it|this|that|my|the) ?(appointment|meeting|booking)?)$/i, type: "cancel", confidence: 0.95 },

  // Selection patterns (numbered options)
  { pattern: /^([1-9])$/i, type: "select", valueExtractor: (m) => m[1], confidence: 0.95 },
  { pattern: /^(option|choice|number|#)?\s*([1-9])$/i, type: "select", valueExtractor: (m) => m[2], confidence: 0.9 },
  { pattern: /^(first|second|third|fourth|fifth)( (one|option))?$/i, type: "select", valueExtractor: (m) => {
    const map: Record<string, string> = { first: "1", second: "2", third: "3", fourth: "4", fifth: "5" };
    return map[m[1].toLowerCase()] || "1";
  }, confidence: 0.85 },

  // Reschedule patterns
  { pattern: /^(reschedule|change|move|postpone|delay|different (time|day|date))$/i, type: "reschedule", confidence: 0.95 },
  { pattern: /^(can we|could we|i need to)?\s*(reschedule|change|move|postpone)(\s*(it|this|that|the meeting))?$/i, type: "reschedule", confidence: 0.9 },
  { pattern: /^(another|different) (time|day|date)( (please|works better))?$/i, type: "reschedule", confidence: 0.85 },

  // Help patterns
  { pattern: /^(help|h|commands|options|menu|\?)$/i, type: "help", confidence: 0.95 },
  { pattern: /^(what can (you|i) do|how does this work)$/i, type: "help", confidence: 0.85 },
];

/**
 * Detects if a message is a quick reply (short response to a previous message).
 * SMS conversations often use short replies like "yes", "no", "1", "2", etc.
 *
 * @param message - The SMS message content
 * @returns QuickReply object if detected, null otherwise
 */
export function detectQuickReply(message: string): QuickReply | null {
  // Normalize the message
  const normalized = message.trim().toLowerCase();

  // Skip if message is too long (likely not a quick reply)
  if (normalized.length > 50) {
    return null;
  }

  // Check against patterns
  for (const { pattern, type, valueExtractor, confidence } of QUICK_REPLY_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      const reply: QuickReply = {
        type,
        confidence,
      };

      if (valueExtractor) {
        reply.value = valueExtractor(match);
      }

      return reply;
    }
  }

  return null;
}

// ============================================================================
// SMS Content Extraction
// ============================================================================

export interface ExtractedSMSContent {
  /** The original message body */
  body: string;
  /** Whether the message contains media */
  hasMedia: boolean;
  /** Number of media attachments */
  mediaCount: number;
  /** Media URLs if present */
  mediaUrls: Array<{ url: string; contentType: string }>;
  /** Detected quick reply, if any */
  quickReply: QuickReply | null;
  /** Whether this appears to be a multi-part message */
  isMultiPart: boolean;
}

/**
 * Extracts and normalizes content from a Twilio SMS webhook payload.
 *
 * @param params - The Twilio webhook parameters
 * @returns Extracted SMS content with metadata
 */
export function extractSMSContent(params: Record<string, string>): ExtractedSMSContent {
  const body = params.Body || "";
  const numMedia = parseInt(params.NumMedia || "0", 10);

  // Extract media URLs
  const mediaUrls: Array<{ url: string; contentType: string }> = [];
  for (let i = 0; i < numMedia; i++) {
    const url = params[`MediaUrl${i}`];
    const contentType = params[`MediaContentType${i}`];
    if (url) {
      mediaUrls.push({ url, contentType: contentType || "application/octet-stream" });
    }
  }

  // Detect if this might be a multi-part SMS (concatenated by carrier)
  // Multi-part messages often have UDH prefixes, but Twilio handles this automatically
  const isMultiPart = body.length > 160;

  return {
    body,
    hasMedia: numMedia > 0,
    mediaCount: numMedia,
    mediaUrls,
    quickReply: detectQuickReply(body),
    isMultiPart,
  };
}

// ============================================================================
// TwiML Response Generation
// ============================================================================

/**
 * Generates a TwiML response for SMS acknowledgment.
 *
 * @param message - The message to send back
 * @returns TwiML XML string
 */
export function generateTwiMLResponse(message: string): string {
  // Escape XML special characters
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escaped}</Message>
</Response>`;
}

/**
 * Generates an empty TwiML response (no reply).
 * Use this when you want to accept the message but not send an immediate reply.
 *
 * @returns Empty TwiML XML string
 */
export function generateEmptyTwiMLResponse(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;
}

// ============================================================================
// Type Definitions for Twilio Webhook
// ============================================================================

export interface TwilioSMSWebhookParams {
  /** Unique message identifier */
  MessageSid: string;
  /** Twilio account SID */
  AccountSid: string;
  /** Sender phone number in E.164 format */
  From: string;
  /** Recipient phone number (your Twilio number) */
  To: string;
  /** Message body text */
  Body: string;
  /** Number of media attachments as string */
  NumMedia: string;
  /** SMS message SID (same as MessageSid for SMS) */
  SmsSid?: string;
  /** Sender's messaging service SID if applicable */
  MessagingServiceSid?: string;
  /** Sender's city (if available) */
  FromCity?: string;
  /** Sender's state (if available) */
  FromState?: string;
  /** Sender's ZIP code (if available) */
  FromZip?: string;
  /** Sender's country */
  FromCountry?: string;
  /** Recipient's city (if available) */
  ToCity?: string;
  /** Recipient's state (if available) */
  ToState?: string;
  /** Recipient's ZIP code (if available) */
  ToZip?: string;
  /** Recipient's country */
  ToCountry?: string;
  /** Media URLs (MediaUrl0, MediaUrl1, etc.) */
  [key: `MediaUrl${number}`]: string;
  /** Media content types (MediaContentType0, etc.) */
  [key: `MediaContentType${number}`]: string;
}

/**
 * Validates that the required Twilio webhook parameters are present.
 *
 * @param params - The parameters from the webhook
 * @returns true if all required parameters are present
 */
export function validateTwilioWebhookParams(
  params: Record<string, string>
): boolean {
  const required = ["MessageSid", "AccountSid", "From", "To", "Body"];
  return required.every((key) => typeof params[key] === "string");
}
