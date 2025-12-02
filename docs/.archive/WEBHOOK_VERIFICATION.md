# Webhook Signature Verification

## Overview

The Astralis platform implements HMAC-SHA256 signature verification for all incoming webhooks to ensure authenticity and prevent tampering. This document describes the implementation, usage, and security considerations.

## Implementation Details

### Core Components

1. **Verification Utility** (`src/lib/utils/webhook-verification.ts`)
   - HMAC-SHA256 signature computation and verification
   - Timing-safe comparison to prevent timing attacks
   - Support for multiple signature formats
   - Helper functions for header extraction and signature computation

2. **Webhook Input Handler** (`src/lib/agent/inputs/WebhookInputHandler.ts`)
   - Integrates signature verification into webhook processing pipeline
   - Configurable signature requirements (optional or required)
   - Comprehensive logging of verification attempts

### Signature Format

Webhooks can include signatures in two formats:

1. **Prefixed format (recommended)**: `sha256=<hex_signature>`
2. **Unprefixed format**: `<hex_signature>`

The prefixed format is recommended as it explicitly declares the hash algorithm used.

### Supported Headers

The system checks for signatures in the following headers (in order of priority):

1. `X-Astralis-Signature` - Astralis internal webhooks
2. `X-Webhook-Signature` - Generic webhook signature
3. `X-Hub-Signature-256` - GitHub-compatible format

## Security Features

### 1. Timing-Safe Comparison

The implementation uses Node.js `crypto.timingSafeEqual()` to prevent timing attacks:

```typescript
function timingSafeCompare(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'hex');
  const actualBuffer = Buffer.from(actual, 'hex');

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
```

**Why this matters**: Simple string comparison (`===`) can leak timing information that attackers could use to gradually reconstruct a valid signature through repeated attempts.

### 2. Length Verification

Signatures of different lengths are rejected before comparison to prevent:
- Buffer overflow attacks
- Partial signature attacks
- Algorithm confusion attacks

### 3. Algorithm Specification

Signatures can specify the algorithm used (`sha256` or `sha512`), preventing:
- Algorithm downgrade attacks
- Cross-algorithm signature reuse

### 4. Comprehensive Logging

All verification attempts are logged with appropriate severity:

- **Debug**: Successful verifications, skipped verifications
- **Warning**: Failed verification attempts (potential security events)
- **Error**: Unexpected errors during verification

## Usage Guide

### Basic Usage in API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  extractSignatureFromHeaders
} from '@/lib/utils/webhook-verification';

export async function POST(req: NextRequest) {
  // Extract signature from headers
  const headers = Object.fromEntries(req.headers.entries());
  const signature = extractSignatureFromHeaders(headers);

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing webhook signature' },
      { status: 401 }
    );
  }

  // Get raw body for verification
  const body = await req.text();

  // Verify signature
  const result = verifyWebhookSignature({
    secret: process.env.WEBHOOK_SECRET!,
    signature,
    payload: body,
  });

  if (!result.isValid) {
    return NextResponse.json(
      { error: result.error },
      { status: 401 }
    );
  }

  // Parse and process webhook
  const data = JSON.parse(body);
  // ... handle webhook

  return NextResponse.json({ success: true });
}
```

### Using WebhookInputHandler

The `WebhookInputHandler` automatically verifies signatures when configured:

```typescript
import { WebhookInputHandler } from '@/lib/agent/inputs/WebhookInputHandler';

const handler = new WebhookInputHandler({
  orgId: 'org-123',
  webhookSecret: process.env.WEBHOOK_SECRET,
  requireSignature: true, // Reject webhooks without signatures
  allowedSources: ['contact_form', 'booking_form'],
});

// Signature is automatically verified
const result = await handler.handleInput({
  source: 'contact_form',
  signature: req.headers['x-astralis-signature'],
  data: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});
```

### Sending Signed Webhooks

When sending webhooks to external systems:

```typescript
import { computeWebhookSignature } from '@/lib/utils/webhook-verification';

const payload = { event: 'order.created', orderId: '123' };
const payloadString = JSON.stringify(payload);

const signature = computeWebhookSignature(
  process.env.OUTBOUND_WEBHOOK_SECRET!,
  payloadString,
  { includePrefix: true }
);

await fetch('https://partner.example.com/webhooks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Astralis-Signature': signature,
  },
  body: payloadString,
});
```

## Configuration

### Environment Variables

```bash
# Required for webhook verification
WEBHOOK_SECRET=your-secret-key-here

# Optional: Require signatures on all webhooks
WEBHOOK_REQUIRE_SIGNATURE=true

# Optional: For outbound webhooks
OUTBOUND_WEBHOOK_SECRET=different-secret-for-outbound
```

### Secret Key Requirements

- **Minimum length**: 32 characters
- **Recommended**: 64+ characters
- **Format**: Random alphanumeric string
- **Storage**: Environment variables (never commit to version control)

Generate a secure secret:

```bash
# Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Testing

### Unit Tests

Run the comprehensive test suite:

```bash
npm test src/lib/utils/__tests__/webhook-verification.test.ts
```

The test suite covers:
- Valid signature verification (prefixed and unprefixed)
- Invalid signature rejection
- Algorithm support (SHA256, SHA512)
- Header extraction
- Signature computation
- Timing attack prevention
- Payload tampering detection
- Edge cases and error handling

### Testing Webhooks Locally

Use the test helper to generate valid webhook requests:

```typescript
import { createTestWebhookRequest } from '@/lib/utils/webhook-verification.example';

const testSecret = 'test-secret-123';
const payload = { event: 'test', data: { id: 1 } };

const { body, headers, signature } = createTestWebhookRequest(payload, testSecret);

// Send to local endpoint
const response = await fetch('http://localhost:3001/api/webhooks/test', {
  method: 'POST',
  headers,
  body,
});
```

## Security Best Practices

### 1. Always Require Signatures in Production

```typescript
const requireSignature = process.env.NODE_ENV === 'production';
```

### 2. Use Different Secrets for Different Environments

```bash
# Development
WEBHOOK_SECRET=dev-secret-xxx

# Staging
WEBHOOK_SECRET=staging-secret-yyy

# Production
WEBHOOK_SECRET=prod-secret-zzz
```

### 3. Rotate Secrets Periodically

Support multiple secrets during rotation:

```typescript
const secrets = [
  process.env.WEBHOOK_SECRET_CURRENT,
  process.env.WEBHOOK_SECRET_PREVIOUS,
].filter(Boolean);

let verified = false;
for (const secret of secrets) {
  const result = verifyWebhookSignature({ secret, signature, payload });
  if (result.isValid) {
    verified = true;
    break;
  }
}
```

### 4. Log All Verification Failures

Monitor for potential attacks:

```typescript
if (!result.isValid) {
  logger.warn('Webhook verification failed', {
    error: result.error,
    source: req.headers['x-forwarded-for'],
    timestamp: new Date().toISOString(),
  });
}
```

### 5. Rate Limit Webhook Endpoints

Prevent brute-force attacks on signatures:

```typescript
// Use rate limiting middleware
import rateLimit from '@/lib/middleware/rate-limit';

export const POST = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
})(webhookHandler);
```

### 6. Validate Payload After Verification

Even with valid signatures, validate the payload structure:

```typescript
const result = verifyWebhookSignature({ ... });
if (!result.isValid) {
  return error;
}

// Verify signature succeeded, now validate payload
const schema = z.object({
  event: z.string(),
  data: z.record(z.unknown()),
});

const validation = schema.safeParse(JSON.parse(body));
if (!validation.success) {
  return NextResponse.json(
    { error: 'Invalid payload structure' },
    { status: 400 }
  );
}
```

## Troubleshooting

### Signature Verification Fails

**Problem**: Valid webhooks are rejected with "Signature verification failed"

**Possible causes**:

1. **Payload mismatch**: Ensure the payload used for verification exactly matches what was signed
   ```typescript
   // ❌ Wrong - don't parse before verification
   const data = await req.json();
   verify({ payload: JSON.stringify(data) });

   // ✅ Correct - use raw body
   const body = await req.text();
   verify({ payload: body });
   ```

2. **Secret mismatch**: Verify the webhook secret matches on both sides
   ```bash
   # Check your environment variable
   echo $WEBHOOK_SECRET
   ```

3. **Signature format**: Check if the signature includes the prefix
   ```typescript
   // Both formats should work
   'sha256=abc123...'  // ✅ Prefixed
   'abc123...'         // ✅ Unprefixed (if allowUnprefixed: true)
   ```

4. **Character encoding**: Ensure UTF-8 encoding is used consistently
   ```typescript
   const signature = createHmac('sha256', secret)
     .update(payload, 'utf-8')  // Explicit UTF-8
     .digest('hex');
   ```

### No Signature Header Found

**Problem**: `extractSignatureFromHeaders()` returns `undefined`

**Solution**: Check header name and casing
```typescript
// Headers are case-insensitive
const headers = {
  'X-Astralis-Signature': 'sha256=...',  // ✅ Works
  'x-astralis-signature': 'sha256=...',  // ✅ Works
  'X-ASTRALIS-SIGNATURE': 'sha256=...',  // ✅ Works
};
```

### Timing Attacks Detected

**Problem**: Security scanners flag timing vulnerabilities

**Solution**: Ensure you're using the built-in verification utility (which uses `timingSafeEqual`), not manual comparison:

```typescript
// ❌ Vulnerable to timing attacks
if (expectedSignature === actualSignature) { ... }

// ✅ Safe - uses timing-safe comparison
const result = verifyWebhookSignature({ ... });
if (result.isValid) { ... }
```

## Related Documentation

- [Webhook Input Handler Documentation](../src/lib/agent/inputs/WebhookInputHandler.ts)
- [Usage Examples](../src/lib/utils/webhook-verification.example.ts)
- [Test Suite](../src/lib/utils/__tests__/webhook-verification.test.ts)
- [Security Best Practices](./SECURITY.md)

## References

- [HMAC-SHA256 Specification (RFC 2104)](https://datatracker.ietf.org/doc/html/rfc2104)
- [Timing Attack Prevention](https://en.wikipedia.org/wiki/Timing_attack)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [GitHub Webhook Security](https://docs.github.com/en/webhooks-and-events/webhooks/securing-your-webhooks)
