
import { 
  generateAuthorizationUrlWithCredentials, 
  generateOAuthState,
  getOAuthConfig 
} from '../src/lib/integrations/oauth-config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testUrl() {
  const provider = 'QUICKBOOKS';
  const orgId = 'cmitadsf60001145vegngyzcb'; // The one with documents
  const userId = 'debug-user';
  
  // Mock production origin
  const origin = 'https://astralisone.com';
  const callbackUrl = `${origin}/api/integrations/quickbooks/oauth/callback`;
  
  const credentials = {
    clientId: 'ABbqjvkfa0iBfUeTvznSrtcBMWCwgVlXTPYD7VSOE1NyPMsiau',
    clientSecret: 'sSWcUBihem5FBn3RRnbcGFdAtQ8CZkaC1rgDbHPI',
  };

  const state = generateOAuthState({
    provider: 'QUICKBOOKS',
    returnUrl: '/integrations',
    userId,
    orgId,
  });

  const authUrl = generateAuthorizationUrlWithCredentials(
    'QUICKBOOKS',
    callbackUrl,
    state,
    credentials
  );

  console.log('--- QuickBooks Auth URL Debug ---');
  console.log('Env Client ID:', process.env.QUICKBOOKS_CLIENT_ID);
  console.log('Redirect URI being sent:', callbackUrl);
  console.log('Full Auth URL:', authUrl);
}

testUrl();
