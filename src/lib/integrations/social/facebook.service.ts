/**
 * Facebook Integration Service
 *
 */
import {
  BaseIntegrationService,
  type OAuthCredentialData,
} from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';

export interface FacebookCredentialData extends OAuthCredentialData {
  // Facebook-specific fields can be added here
}

export class FacebookService extends BaseIntegrationService<FacebookCredentialData> {
  constructor() {
    super({
      provider: 'FACEBOOK',
      baseUrl: 'https://graph.facebook.com/v19.0',
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getAccountInfo();
      return response.success;
    } catch (error) {
      console.error('[Facebook] Test connection failed:', error);
      return false;
    }
  }

  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.apiRequest('/me', {
        params: { fields: 'id,name,email' },
    });
  }
}

export const facebookService = new FacebookService();
