/**
 * Shopify Integration Service
 *
 */
import {
  BaseIntegrationService,
  type OAuthCredentialData,
} from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';

export interface ShopifyCredentialData extends OAuthCredentialData {
  shop: string;
}

export class ShopifyService extends BaseIntegrationService<ShopifyCredentialData> {
  constructor(shop?: string) {
    super({
      provider: 'SHOPIFY',
      baseUrl: `https://{shop}.myshopify.com/admin/api/2023-01`, // URL is shop-specific
    });
    if (shop) {
      this.config.baseUrl = `https://${shop}.myshopify.com/admin/api/2023-01`;
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return this.standardTestConnection();
  }

  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.apiRequest('/shop.json');
  }
}
