/**
 * Webhook Utilities Module
 *
 * Exports utilities for webhook signature verification and processing.
 *
 * @module agent/webhooks
 */

export {
  // Types
  type WebhookProvider,
  type SignatureVerificationResult,
  type SignatureVerificationOptions,
  // Functions
  verifyHmacSignature,
  verifySendGridSignature,
  verifyMailgunSignature,
  verifyStripeSignature,
  generateWebhookSignature,
  extractWebhookHeaders,
  generateCorrelationId,
  createWebhookResponse,
  // Constants
  DEFAULT_SIGNATURE_VALIDITY_WINDOW_MS,
} from './utils';

// Re-export default
export { default as webhookUtils } from './utils';
