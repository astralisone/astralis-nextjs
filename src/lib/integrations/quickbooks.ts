
const OAuthClient = require('intuit-oauth');

/**
 * QuickBooks OAuth2 Client Configuration
 * 
 * Uses current environment variables and explicitly sets the redirect URI
 * to ensure consistency across the platform.
 */

export const getQuickBooksClient = (redirectUri?: string) => {
  return new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID || 'ABbqjvkfa0iBfUeTvznSrtcBMWCwgVlXTPYD7VSOE1NyPMsiau',
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || 'sSWcUBihem5FBn3RRnbcGFdAtQ8CZkaC1rgDbHPI',
    environment: process.env.QUICKBOOKS_ENVIRONMENT || 'production', // 'sandbox' or 'production'
    redirectUri: redirectUri || 'https://astralisone.com/api/integrations/quickbooks/oauth/callback',
    logging: process.env.NODE_ENV !== 'production'
  });
};

/**
 * Generate QuickBooks Authorization URI
 */
export const getQuickBooksAuthUri = (state: string, redirectUri?: string) => {
  const client = getQuickBooksClient(redirectUri);
  return client.authorizeUri({
    scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId, OAuthClient.scopes.Profile, OAuthClient.scopes.Email],
    state: state
  });
};

/**
 * QuickBooks Scopes
 */
export const QuickBooksScopes = {
  Accounting: OAuthClient.scopes.Accounting,
  Payment: OAuthClient.scopes.Payment,
  OpenId: OAuthClient.scopes.OpenId,
  Profile: OAuthClient.scopes.Profile,
  Email: OAuthClient.scopes.Email,
};
