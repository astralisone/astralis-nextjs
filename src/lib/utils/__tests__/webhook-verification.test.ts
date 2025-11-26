/**
 * Tests for webhook signature verification
 *
 * @jest-environment node
 */

import { createHmac } from 'crypto';
import {
  verifyWebhookSignature,
  extractSignatureFromHeaders,
  computeWebhookSignature,
  SIGNATURE_HEADERS,
} from '../webhook-verification';

describe('webhook-verification', () => {
  const TEST_SECRET = 'test-webhook-secret-key-12345';
  const TEST_PAYLOAD = JSON.stringify({
    event: 'test',
    data: { id: 123, name: 'Test' },
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid prefixed signature', () => {
      const signature = createHmac('sha256', TEST_SECRET)
        .update(TEST_PAYLOAD)
        .digest('hex');

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: `sha256=${signature}`,
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(true);
      expect(result.algorithm).toBe('sha256');
      expect(result.error).toBeUndefined();
    });

    it('should verify valid unprefixed signature', () => {
      const signature = createHmac('sha256', TEST_SECRET)
        .update(TEST_PAYLOAD)
        .digest('hex');

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature,
        payload: TEST_PAYLOAD,
        allowUnprefixed: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.algorithm).toBe('sha256');
    });

    it('should reject invalid signature', () => {
      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: 'sha256=invalid_signature_abc123',
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Signature verification failed');
    });

    it('should reject signature with wrong secret', () => {
      const signature = createHmac('sha256', 'wrong-secret')
        .update(TEST_PAYLOAD)
        .digest('hex');

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: `sha256=${signature}`,
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(false);
    });

    it('should reject signature for different payload', () => {
      const signature = createHmac('sha256', TEST_SECRET)
        .update('different payload')
        .digest('hex');

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: `sha256=${signature}`,
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(false);
    });

    it('should support sha512 algorithm', () => {
      const signature = createHmac('sha512', TEST_SECRET)
        .update(TEST_PAYLOAD)
        .digest('hex');

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: `sha512=${signature}`,
        payload: TEST_PAYLOAD,
        algorithm: 'sha512',
      });

      expect(result.isValid).toBe(true);
      expect(result.algorithm).toBe('sha512');
    });

    it('should reject unprefixed signature when not allowed', () => {
      const signature = createHmac('sha256', TEST_SECRET)
        .update(TEST_PAYLOAD)
        .digest('hex');

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature,
        payload: TEST_PAYLOAD,
        allowUnprefixed: false,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid signature format');
    });

    it('should handle buffer payloads', () => {
      const payloadBuffer = Buffer.from(TEST_PAYLOAD, 'utf-8');
      const signature = createHmac('sha256', TEST_SECRET)
        .update(payloadBuffer)
        .digest('hex');

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: `sha256=${signature}`,
        payload: payloadBuffer,
      });

      expect(result.isValid).toBe(true);
    });

    it('should return error when secret is missing', () => {
      const result = verifyWebhookSignature({
        secret: '',
        signature: 'sha256=abc123',
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Webhook secret is required');
    });

    it('should return error when signature is missing', () => {
      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: '',
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Webhook signature is required');
    });

    it('should return error when payload is missing', () => {
      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: 'sha256=abc123',
        payload: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Webhook payload is required');
    });

    it('should handle malformed signature gracefully', () => {
      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: 'not-a-valid-signature!!!',
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid signature format');
    });

    it('should prevent timing attacks with different length signatures', () => {
      const signature = createHmac('sha256', TEST_SECRET)
        .update(TEST_PAYLOAD)
        .digest('hex');

      // Try with truncated signature
      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: `sha256=${signature.substring(0, 32)}`,
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('extractSignatureFromHeaders', () => {
    it('should extract x-astralis-signature header', () => {
      const headers = {
        'x-astralis-signature': 'sha256=abc123',
        'content-type': 'application/json',
      };

      const signature = extractSignatureFromHeaders(headers);
      expect(signature).toBe('sha256=abc123');
    });

    it('should extract x-webhook-signature header', () => {
      const headers = {
        'x-webhook-signature': 'sha256=def456',
        'content-type': 'application/json',
      };

      const signature = extractSignatureFromHeaders(headers);
      expect(signature).toBe('sha256=def456');
    });

    it('should extract x-hub-signature-256 header (GitHub style)', () => {
      const headers = {
        'x-hub-signature-256': 'sha256=ghi789',
        'content-type': 'application/json',
      };

      const signature = extractSignatureFromHeaders(headers);
      expect(signature).toBe('sha256=ghi789');
    });

    it('should prioritize x-astralis-signature over others', () => {
      const headers = {
        'x-astralis-signature': 'sha256=astralis',
        'x-webhook-signature': 'sha256=webhook',
        'x-hub-signature-256': 'sha256=github',
      };

      const signature = extractSignatureFromHeaders(headers);
      expect(signature).toBe('sha256=astralis');
    });

    it('should handle case-insensitive headers', () => {
      const headers = {
        'X-ASTRALIS-SIGNATURE': 'sha256=abc123',
        'Content-Type': 'application/json',
      };

      const signature = extractSignatureFromHeaders(headers);
      expect(signature).toBe('sha256=abc123');
    });

    it('should return undefined when no signature header present', () => {
      const headers = {
        'content-type': 'application/json',
        'user-agent': 'test',
      };

      const signature = extractSignatureFromHeaders(headers);
      expect(signature).toBeUndefined();
    });

    it('should handle array header values', () => {
      const headers = {
        'x-astralis-signature': ['sha256=abc123', 'sha256=def456'],
        'content-type': 'application/json',
      };

      const signature = extractSignatureFromHeaders(headers);
      expect(signature).toBe('sha256=abc123');
    });
  });

  describe('computeWebhookSignature', () => {
    it('should compute signature with prefix by default', () => {
      const signature = computeWebhookSignature(TEST_SECRET, TEST_PAYLOAD);

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });

    it('should compute signature without prefix when requested', () => {
      const signature = computeWebhookSignature(TEST_SECRET, TEST_PAYLOAD, {
        includePrefix: false,
      });

      expect(signature).toMatch(/^[a-f0-9]{64}$/);
      expect(signature).not.toContain('sha256=');
    });

    it('should support sha512 algorithm', () => {
      const signature = computeWebhookSignature(TEST_SECRET, TEST_PAYLOAD, {
        algorithm: 'sha512',
      });

      expect(signature).toMatch(/^sha512=[a-f0-9]{128}$/);
    });

    it('should handle buffer payloads', () => {
      const payloadBuffer = Buffer.from(TEST_PAYLOAD, 'utf-8');
      const signature = computeWebhookSignature(TEST_SECRET, payloadBuffer);

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });

    it('should produce verifiable signatures', () => {
      const signature = computeWebhookSignature(TEST_SECRET, TEST_PAYLOAD);

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature,
        payload: TEST_PAYLOAD,
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('SIGNATURE_HEADERS constant', () => {
    it('should export supported header names', () => {
      expect(SIGNATURE_HEADERS).toContain('x-astralis-signature');
      expect(SIGNATURE_HEADERS).toContain('x-webhook-signature');
      expect(SIGNATURE_HEADERS).toContain('x-hub-signature-256');
    });
  });

  describe('Integration tests', () => {
    it('should verify end-to-end webhook flow', () => {
      // Simulate webhook sender
      const webhookPayload = {
        event: 'order.created',
        data: {
          orderId: 'order-123',
          amount: 99.99,
          customer: {
            id: 'cust-456',
            email: 'customer@example.com',
          },
        },
      };

      const payloadString = JSON.stringify(webhookPayload);
      const signature = computeWebhookSignature(TEST_SECRET, payloadString);

      // Simulate webhook receiver
      const headers = {
        'x-astralis-signature': signature,
        'content-type': 'application/json',
      };

      const extractedSignature = extractSignatureFromHeaders(headers);
      expect(extractedSignature).toBeDefined();

      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature: extractedSignature!,
        payload: payloadString,
      });

      expect(result.isValid).toBe(true);
    });

    it('should reject tampered payload', () => {
      // Sender computes signature
      const originalPayload = { event: 'test', amount: 100 };
      const payloadString = JSON.stringify(originalPayload);
      const signature = computeWebhookSignature(TEST_SECRET, payloadString);

      // Attacker modifies payload
      const tamperedPayload = { event: 'test', amount: 1000000 };
      const tamperedString = JSON.stringify(tamperedPayload);

      // Receiver verifies
      const result = verifyWebhookSignature({
        secret: TEST_SECRET,
        signature,
        payload: tamperedString,
      });

      expect(result.isValid).toBe(false);
    });
  });
});
