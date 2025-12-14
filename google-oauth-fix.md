# Google OAuth App Configuration Fix

## Problem
You're getting a "redirect_uri_mismatch" error because the redirect URI in your Google OAuth app doesn't match what your application is sending.

## Solution
Update your Google OAuth app's redirect URI in Google Cloud Console.

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (the one with Client ID: `439437086701-be8bb5emklhd470jmc23p1hs19frkct0.apps.googleusercontent.com`)

### Step 2: Update Authorized Redirect URIs
In the OAuth 2.0 Client ID settings, update the "Authorized redirect URIs" to:

```
https://astralisone.com/api/auth/callback/google
```

### Step 3: Save Changes
Click "Save" to apply the changes.

### Step 4: Test
Try signing in with Google again.

## Why This Happens
- Your NEXTAUTH_URL is set to `https://astralisone.com`
- NextAuth automatically constructs the callback URL as: `{NEXTAUTH_URL}/api/auth/callback/google`
- Google requires this exact URL to be pre-approved in your OAuth app

## Alternative: If You Need a Different Domain
If you're testing on a different domain (like localhost), update your NEXTAUTH_URL environment variable in Vercel:

```
NEXTAUTH_URL=https://your-test-domain.com
```

Then update the Google redirect URI accordingly.