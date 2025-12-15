/**
 * Google Docs Integration Service
 *
 */
import {
  BaseIntegrationService,
  type OAuthCredentialData,
} from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';

export interface GoogleDocsCredentialData extends OAuthCredentialData {
  // Google Docs-specific fields can be added here
}

export class GoogleDocsService extends BaseIntegrationService<GoogleDocsCredentialData> {
  constructor() {
    super({
      provider: 'GOOGLE_DOCS',
      baseUrl: 'https://docs.googleapis.com/v1',
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return this.standardTestConnection();
  }

  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    // Google Docs doesn't have a simple /user endpoint, 
    // so we'll use the token info endpoint as a proxy for account info.
    const tokenInfoUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
    const accessToken = this.getAccessToken();
    
    const response = await fetch(`${tokenInfoUrl}?access_token=${accessToken}`);
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_INFO_FAILED',
          message: 'Failed to fetch account info from Google.',
        },
      };
    }

    const data = await response.json();
    return { success: true, data };
  }
  
  // Add other Google Docs-specific methods here
}

export const googleDocsService = new GoogleDocsService();
