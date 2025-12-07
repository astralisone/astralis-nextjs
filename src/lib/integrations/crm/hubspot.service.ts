/**
 * HubSpot Integration Service
 *
 * Provides methods for interacting with HubSpot CRM API.
 * Supports contacts, companies, deals, and pipelines.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  HubSpotContact,
  HubSpotCompany,
  HubSpotDeal,
} from '@/types/integrations';

/**
 * HubSpot API response wrapper
 */
interface HubSpotListResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

/**
 * Create contact input
 */
export interface CreateHubSpotContactInput {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  lifecyclestage?: string;
}

/**
 * Create company input
 */
export interface CreateHubSpotCompanyInput {
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Create deal input
 */
export interface CreateHubSpotDealInput {
  dealname: string;
  amount?: number;
  dealstage: string;
  pipeline: string;
  closedate?: string;
  hubspot_owner_id?: string;
}

/**
 * HubSpot Service
 */
export class HubSpotService extends BaseIntegrationService<OAuthCredentialData> {
  constructor() {
    super({
      provider: 'HUBSPOT',
      baseUrl: 'https://api.hubapi.com',
      rateLimitPerMinute: 100,
    });
  }

  /**
   * Make a HubSpot API request
   */
  private async hubspotRequest<T>(
    endpoint: string,
    options: { method?: string; body?: Record<string, unknown> } = {}
  ): Promise<IntegrationApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json',
    };

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (body) {
      requestInit.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData.message || response.statusText,
            details: errorData,
          },
        };
      }

      // Some endpoints return no content
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as T };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Request failed',
        },
      };
    }
  }

  /**
   * Test connection to HubSpot
   */
  async testConnection(): Promise<boolean> {
    const result = await this.getAccountInfo();
    return result.success;
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    // Get access token info
    const response = await this.hubspotRequest<Record<string, unknown>>(
      `/oauth/v1/access-tokens/${this.getAccessToken()}`
    );
    return response;
  }

  // -------------------------------------------------------------------------
  // Contacts
  // -------------------------------------------------------------------------

  /**
   * List contacts
   */
  async listContacts(params?: {
    limit?: number;
    after?: string;
    properties?: string[];
  }): Promise<IntegrationApiResponse<HubSpotContact[]>> {
    const properties = params?.properties || [
      'email',
      'firstname',
      'lastname',
      'phone',
      'company',
      'lifecyclestage',
    ];

    let endpoint = '/crm/v3/objects/contacts';
    const queryParams: string[] = [
      `limit=${params?.limit || 100}`,
      ...properties.map((p) => `properties=${p}`),
    ];

    if (params?.after) {
      queryParams.push(`after=${params.after}`);
    }

    endpoint += '?' + queryParams.join('&');

    const response = await this.hubspotRequest<HubSpotListResponse<Record<string, unknown>>>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<HubSpotContact[]>;

    const contacts = response.data?.results || [];

    return {
      success: true,
      data: contacts.map((c) => this.mapContact(c)),
      pagination: {
        cursor: response.data?.paging?.next?.after,
        hasMore: !!response.data?.paging?.next,
      },
    };
  }

  /**
   * Get a single contact
   */
  async getContact(contactId: string): Promise<IntegrationApiResponse<HubSpotContact>> {
    const properties = [
      'email',
      'firstname',
      'lastname',
      'phone',
      'company',
      'lifecyclestage',
    ];

    const endpoint = `/crm/v3/objects/contacts/${contactId}?` +
      properties.map((p) => `properties=${p}`).join('&');

    const response = await this.hubspotRequest<Record<string, unknown>>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<HubSpotContact>;

    return {
      success: true,
      data: this.mapContact(response.data!),
    };
  }

  /**
   * Create a contact
   */
  async createContact(input: CreateHubSpotContactInput): Promise<IntegrationApiResponse<HubSpotContact>> {
    const response = await this.hubspotRequest<Record<string, unknown>>(
      '/crm/v3/objects/contacts',
      {
        method: 'POST',
        body: { properties: input },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<HubSpotContact>;

    return {
      success: true,
      data: this.mapContact(response.data!),
    };
  }

  /**
   * Update a contact
   */
  async updateContact(
    contactId: string,
    properties: Partial<CreateHubSpotContactInput>
  ): Promise<IntegrationApiResponse<HubSpotContact>> {
    const response = await this.hubspotRequest<Record<string, unknown>>(
      `/crm/v3/objects/contacts/${contactId}`,
      {
        method: 'PATCH',
        body: { properties },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<HubSpotContact>;

    return {
      success: true,
      data: this.mapContact(response.data!),
    };
  }

  /**
   * Search contacts
   */
  async searchContacts(query: string): Promise<IntegrationApiResponse<HubSpotContact[]>> {
    const response = await this.hubspotRequest<HubSpotListResponse<Record<string, unknown>>>(
      '/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        body: {
          query,
          limit: 100,
          properties: ['email', 'firstname', 'lastname', 'phone', 'company'],
        },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<HubSpotContact[]>;

    const contacts = response.data?.results || [];

    return {
      success: true,
      data: contacts.map((c) => this.mapContact(c)),
    };
  }

  // -------------------------------------------------------------------------
  // Companies
  // -------------------------------------------------------------------------

  /**
   * List companies
   */
  async listCompanies(params?: {
    limit?: number;
    after?: string;
  }): Promise<IntegrationApiResponse<HubSpotCompany[]>> {
    const properties = ['name', 'domain', 'industry', 'phone', 'city', 'state', 'country'];

    let endpoint = '/crm/v3/objects/companies';
    const queryParams: string[] = [
      `limit=${params?.limit || 100}`,
      ...properties.map((p) => `properties=${p}`),
    ];

    if (params?.after) {
      queryParams.push(`after=${params.after}`);
    }

    endpoint += '?' + queryParams.join('&');

    const response = await this.hubspotRequest<HubSpotListResponse<Record<string, unknown>>>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<HubSpotCompany[]>;

    const companies = response.data?.results || [];

    return {
      success: true,
      data: companies.map((c) => this.mapCompany(c)),
      pagination: {
        cursor: response.data?.paging?.next?.after,
        hasMore: !!response.data?.paging?.next,
      },
    };
  }

  /**
   * Create a company
   */
  async createCompany(input: CreateHubSpotCompanyInput): Promise<IntegrationApiResponse<HubSpotCompany>> {
    const response = await this.hubspotRequest<Record<string, unknown>>(
      '/crm/v3/objects/companies',
      {
        method: 'POST',
        body: { properties: input },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<HubSpotCompany>;

    return {
      success: true,
      data: this.mapCompany(response.data!),
    };
  }

  // -------------------------------------------------------------------------
  // Deals
  // -------------------------------------------------------------------------

  /**
   * List deals
   */
  async listDeals(params?: {
    limit?: number;
    after?: string;
  }): Promise<IntegrationApiResponse<HubSpotDeal[]>> {
    const properties = ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline'];

    let endpoint = '/crm/v3/objects/deals';
    const queryParams: string[] = [
      `limit=${params?.limit || 100}`,
      ...properties.map((p) => `properties=${p}`),
    ];

    if (params?.after) {
      queryParams.push(`after=${params.after}`);
    }

    endpoint += '?' + queryParams.join('&');

    const response = await this.hubspotRequest<HubSpotListResponse<Record<string, unknown>>>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<HubSpotDeal[]>;

    const deals = response.data?.results || [];

    return {
      success: true,
      data: deals.map((d) => this.mapDeal(d)),
      pagination: {
        cursor: response.data?.paging?.next?.after,
        hasMore: !!response.data?.paging?.next,
      },
    };
  }

  /**
   * Create a deal
   */
  async createDeal(input: CreateHubSpotDealInput): Promise<IntegrationApiResponse<HubSpotDeal>> {
    const response = await this.hubspotRequest<Record<string, unknown>>(
      '/crm/v3/objects/deals',
      {
        method: 'POST',
        body: {
          properties: {
            ...input,
            amount: input.amount?.toString(),
          },
        },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<HubSpotDeal>;

    return {
      success: true,
      data: this.mapDeal(response.data!),
    };
  }

  /**
   * Get deal pipelines
   */
  async getPipelines(): Promise<IntegrationApiResponse<Record<string, unknown>[]>> {
    const response = await this.hubspotRequest<{ results: Record<string, unknown>[] }>(
      '/crm/v3/pipelines/deals'
    );

    if (!response.success) return response as IntegrationApiResponse<Record<string, unknown>[]>;

    return {
      success: true,
      data: response.data?.results || [],
    };
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  private mapContact(c: Record<string, unknown>): HubSpotContact {
    const props = c.properties as Record<string, string>;
    return {
      id: c.id as string,
      properties: {
        email: props?.email || '',
        firstname: props?.firstname,
        lastname: props?.lastname,
        phone: props?.phone,
        company: props?.company,
        lifecyclestage: props?.lifecyclestage,
      },
      createdAt: c.createdAt as string,
      updatedAt: c.updatedAt as string,
    };
  }

  private mapCompany(c: Record<string, unknown>): HubSpotCompany {
    const props = c.properties as Record<string, string>;
    return {
      id: c.id as string,
      properties: {
        name: props?.name || '',
        domain: props?.domain,
        industry: props?.industry,
        phone: props?.phone,
        city: props?.city,
        state: props?.state,
        country: props?.country,
      },
      createdAt: c.createdAt as string,
      updatedAt: c.updatedAt as string,
    };
  }

  private mapDeal(d: Record<string, unknown>): HubSpotDeal {
    const props = d.properties as Record<string, string>;
    return {
      id: d.id as string,
      properties: {
        dealname: props?.dealname || '',
        amount: props?.amount,
        dealstage: props?.dealstage || '',
        closedate: props?.closedate,
        pipeline: props?.pipeline || '',
      },
      createdAt: d.createdAt as string,
      updatedAt: d.updatedAt as string,
    };
  }
}

export const hubSpotService = new HubSpotService();
