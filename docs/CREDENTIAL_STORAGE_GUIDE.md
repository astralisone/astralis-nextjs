# Credential Storage System Guide

## Quick Start

### Save a Credential

```typescript
import { integrationService } from '@/lib/services/integration.service';

// Save OAuth tokens
await integrationService.saveCredential(userId, orgId, {
  provider: 'GOOGLE_SHEETS',
  credentialName: 'Production Sheets Access',
  credentialData: {
    accessToken: 'ya29.a0...',
    refreshToken: '1//0g...',
    clientId: '123.apps.googleusercontent.com',
    clientSecret: 'GOCSPX-...'
  },
  scope: 'https://www.googleapis.com/auth/spreadsheets',
  expiresAt: new Date(Date.now() + 3600000) // 1 hour
});
```

### List Credentials (Safe for API)

```typescript
// Returns metadata only (no sensitive data)
const credentials = await integrationService.listCredentials(userId, orgId);

// Filter by provider
const slackCreds = await integrationService.listCredentials(
  userId,
  orgId,
  'SLACK'
);
```

### Get Credential with Data (Internal Use Only)

```typescript
// ⚠️ NEVER expose in API responses!
const credential = await integrationService.getCredentialWithData(
  credentialId,
  userId,
  orgId
);

if (credential) {
  const { accessToken, refreshToken } = credential.credentialData;
  // Use for API calls
}
```

### Refresh OAuth Token

```typescript
await integrationService.refreshToken(
  credentialId,
  userId,
  orgId,
  newAccessToken,
  newRefreshToken, // optional
  new Date(Date.now() + 3600000) // new expiry
);
```

### Delete Credential

```typescript
// Soft delete - marks as inactive
await integrationService.deleteCredential(credentialId, userId, orgId);
```

## Security Best Practices

### DO ✅

- Use `listCredentials()` for API responses
- Use `getCredentialWithData()` only in backend workflows
- Always validate userId and orgId before operations
- Let the service handle encryption/decryption
- Use environment variables for encryption keys

### DON'T ❌

- Never return `getCredentialWithData()` result in API
- Don't store plain text credentials anywhere
- Don't bypass the service layer
- Don't hard-code encryption keys
- Don't skip activity logging

## Supported Providers

All providers from the `IntegrationProvider` enum:

- GMAIL
- GOOGLE_SHEETS
- GOOGLE_DRIVE
- GOOGLE_CALENDAR
- SLACK
- MICROSOFT_TEAMS
- OUTLOOK
- HUBSPOT
- SALESFORCE
- STRIPE
- PAYPAL
- MAILCHIMP
- SENDGRID
- TWILIO
- ZOOM
- DROPBOX
- TRELLO
- ASANA
- NOTION
- AIRTABLE
- WEBHOOK
- HTTP_REQUEST
- DATABASE
- OPENAI
- ANTHROPIC
- OTHER

## Credential Data Structure

### OAuth 2.0 Credentials

```typescript
{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
  tokenType: 'Bearer';
}
```

### API Key Credentials

```typescript
{
  apiKey: string;
  apiSecret?: string;
}
```

### Basic Auth Credentials

```typescript
{
  username: string;
  password: string;
}
```

### Custom Credentials

```typescript
{
  // Any custom fields needed
  [key: string]: any;
}
```

## Activity Log Events

All operations are logged in `ActivityLog`:

| Action | Entity | Description |
|--------|--------|-------------|
| CREATE | INTEGRATION_CREDENTIAL | New credential saved |
| UPDATE | INTEGRATION_CREDENTIAL | Token refreshed |
| DELETE | INTEGRATION_CREDENTIAL | Credential deactivated |

## Error Handling

```typescript
try {
  await integrationService.saveCredential(userId, orgId, data);
} catch (error) {
  if (error.message.includes('duplicate')) {
    // Credential with same name exists
  } else if (error.message.includes('Encryption key not found')) {
    // Missing environment variable
  } else {
    // Other error
  }
}
```

## Environment Setup

Required in `.env.local`:

```bash
# Primary encryption key (preferred)
N8N_ENCRYPTION_KEY=your-64-character-hex-encryption-key-change-this-immediately

# Fallback encryption key
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
```

Generate a secure key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Schema

```prisma
model IntegrationCredential {
  id             String   @id @default(cuid())
  userId         String
  orgId          String
  provider       IntegrationProvider
  credentialName String
  credentialData String   // Encrypted!
  scope          String?
  expiresAt      DateTime?
  isActive       Boolean  @default(true)
  lastUsedAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([userId, provider, credentialName])
  @@index([orgId])
  @@index([userId, isActive])
}
```

## Common Patterns

### OAuth Flow Integration

```typescript
// 1. User initiates OAuth
const authUrl = buildOAuthUrl(provider);
res.redirect(authUrl);

// 2. OAuth callback
app.get('/api/oauth/callback', async (req, res) => {
  const { code } = req.query;
  const tokens = await exchangeCodeForTokens(code);

  // 3. Save credentials
  await integrationService.saveCredential(userId, orgId, {
    provider: 'GOOGLE_SHEETS',
    credentialName: 'Default',
    credentialData: tokens,
    scope: tokens.scope,
    expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
  });

  res.redirect('/integrations?success=true');
});
```

### Token Refresh Strategy

```typescript
async function getValidToken(credentialId: string) {
  const credential = await integrationService.getCredentialWithData(
    credentialId,
    userId,
    orgId
  );

  if (!credential) {
    throw new Error('Credential not found');
  }

  // Check if expired
  if (credential.expiresAt && credential.expiresAt < new Date()) {
    // Refresh token
    const refreshed = await refreshOAuthToken(
      credential.credentialData.refreshToken
    );

    await integrationService.refreshToken(
      credentialId,
      userId,
      orgId,
      refreshed.access_token,
      refreshed.refresh_token,
      new Date(Date.now() + refreshed.expires_in * 1000)
    );

    return refreshed.access_token;
  }

  return credential.credentialData.accessToken;
}
```

### n8n Workflow Integration

```typescript
// In n8n custom node
const credential = await integrationService.getCredentialWithData(
  credentialId,
  userId,
  orgId
);

const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${credential.credentialData.accessToken}`
  }
});
```

## Troubleshooting

### "Encryption key not found"

**Solution**: Set `N8N_ENCRYPTION_KEY` or `NEXTAUTH_SECRET` in `.env.local`

### "Credential not found or inactive"

**Solution**: Check if credential was soft-deleted or belongs to different user/org

### "Failed to decrypt data"

**Possible Causes**:
- Encryption key changed after credential was created
- Data corruption
- Wrong key being used

**Solution**: Re-create the credential with current key

### "duplicate key value violates unique constraint"

**Solution**: Credential with same userId + provider + credentialName already exists

## Migration from Legacy System

If migrating from a system that stores plain text credentials:

```typescript
// Read existing credentials
const legacyCredentials = await getLegacyCredentials();

// Re-save with encryption
for (const cred of legacyCredentials) {
  await integrationService.saveCredential(cred.userId, cred.orgId, {
    provider: cred.provider,
    credentialName: cred.name,
    credentialData: JSON.parse(cred.data), // Parse legacy JSON
    scope: cred.scope,
    expiresAt: cred.expiresAt
  });
}

// Delete legacy table
await deleteLegacyTable();
```

## Performance Considerations

- Decryption happens on-demand (not cached)
- List operations exclude encrypted data (fast)
- Use indexes on orgId and userId for filtering
- Soft delete allows quick recovery without re-encryption

## Support

For issues or questions:
- Check logs: `[Integration Service]` prefix
- Review ActivityLog table for audit trail
- Verify environment variables are set
- Ensure Prisma client is generated
