/**
 * BambooHR Integration Service
 *
 */
import {
  BaseIntegrationService,
  type OAuthCredentialData,
} from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';

export interface BambooHRCredentialData extends OAuthCredentialData {
  subdomain: string;
}

export class BambooHRService extends BaseIntegrationService<BambooHRCredentialData> {
  constructor(subdomain?: string) {
    super({
      provider: 'BAMBOOHR',
      baseUrl: `https://api.bamboohr.com/api/gateway.php/{subdomain}/v1`, // URL is subdomain-specific
    });
    if (subdomain) {
      this.config.baseUrl = `https://api.bamboohr.com/api/gateway.php/${subdomain}/v1`;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getAccountInfo();
      return response.success;
    } catch (error) {
      console.error('[BambooHR] Test connection failed:', error);
      return false;
    }
  }

  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.apiRequest('/employees/directory');
  }
}
