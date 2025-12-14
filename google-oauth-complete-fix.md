# Google OAuth App - Complete Redirect URI Configuration

## Problem
Your Google OAuth app needs multiple redirect URIs for different integrations.

## Required Redirect URIs for Google Cloud Console

Add these to your OAuth 2.0 Client ID "Authorized redirect URIs":

### Authentication (NextAuth)
```
https://astralisone.com/api/auth/callback/google
```

### Gmail Integration
```
https://astralisone.com/api/integrations/gmail/oauth/callback
```

### Google Drive Integration
```
https://astralisone.com/api/integrations/google-drive/oauth/callback
```

### Google Docs Integration
```
https://astralisone.com/api/integrations/google-docs/oauth/callback
```

## Step-by-Step Instructions

1. **Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)**

2. **Find your OAuth 2.0 Client ID**: `439437086701-be8bb5emklhd470jmc23p1hs19frkct0.apps.googleusercontent.com`

3. **Click "Edit"** on the OAuth 2.0 Client ID

4. **Add all redirect URIs** under "Authorized redirect URIs":
   - `https://astralisone.com/api/auth/callback/google`
   - `https://astralisone.com/api/integrations/gmail/oauth/callback`
   - `https://astralisone.com/api/integrations/google-drive/oauth/callback`
   - `https://astralisone.com/api/integrations/google-docs/oauth/callback`

5. **Save** the changes

## Why Multiple URIs?

- **Authentication**: Used when users sign in with Google
- **Integrations**: Used when connecting Google services (Gmail, Drive, Docs)
- Each integration has its own OAuth flow and callback endpoint

## Testing

After adding all URIs:
- ✅ Google sign-in should work
- ✅ Gmail integration connection should work
- ✅ Google Drive/Docs integrations should work

## For Local Development

If testing locally, also add:
```
http://localhost:3001/api/auth/callback/google
http://localhost:3001/api/integrations/gmail/oauth/callback
http://localhost:3001/api/integrations/google-drive/oauth/callback
http://localhost:3001/api/integrations/google-docs/oauth/callback
```