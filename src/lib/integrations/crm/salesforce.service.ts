/**
 * Salesforce Integration Service
 *
 * Provides methods for interacting with Salesforce REST API.
 * Supports contacts, accounts, opportunities, and leads.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  SalesforceContact,
  SalesforceAccount,
  SalesforceOpportunity,
  SalesforceLead,
} from '@/types/integrations';

/**
 * Salesforce-specific credential data
 */
interface SalesforceCredentialData extends OAuthCredentialData {
  instanceUrl: string;
}

/**
 * Salesforce query response
 */
interface SalesforceQueryResponse<T> {
  totalSize: number;
  done: boolean;
  nextRecordsUrl?: string;
  records: T[];
}

/**
 * Create contact input
 */
export interface CreateSalesforceContactInput {
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  AccountId?: string;
  Title?: string;
  Department?: string;
}

/**
 * Create account input
 */
export interface CreateSalesforceAccountInput {
  Name: string;
  Type?: string;
  Industry?: string;
  Phone?: string;
  Website?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingCountry?: string;
}

/**
 * Create opportunity input
 */
export interface CreateSalesforceOpportunityInput {
  Name: string;
  Amount?: number;
  StageName: string;
  CloseDate: string;
  AccountId?: string;
  Description?: string;
  Probability?: number;
}

/**
 * Create lead input
 */
export interface CreateSalesforceLeadInput {
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Company: string;
  Status: string;
  LeadSource?: string;
}

/**
 * Salesforce Service
 */
export class SalesforceService extends BaseIntegrationService<SalesforceCredentialData> {
  private apiVersion = 'v59.0';

  constructor() {
    super({
      provider: 'SALESFORCE',
      baseUrl: '', // Will be set from instanceUrl
      rateLimitPerMinute: 100,
    });
  }

  /**
   * Get the instance URL
   */
  private getInstanceUrl(): string {
    return this.getCredentialData().instanceUrl;
  }

  /**
   * Make a Salesforce API request
   */
  private async sfRequest<T>(
    endpoint: string,
    options: { method?: string; body?: Record<string, unknown> } = {}
  ): Promise<IntegrationApiResponse<T>> {
    const url = `${this.getInstanceUrl()}/services/data/${this.apiVersion}${endpoint}`;

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
        const errorData = await response.json().catch(() => []);
        const errorMessage = Array.isArray(errorData)
          ? errorData[0]?.message
          : errorData.message || response.statusText;

        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorMessage,
            details: { errors: errorData },
          },
        };
      }

      // Handle 204 No Content
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
   * Execute a SOQL query
   */
  private async query<T>(soql: string): Promise<IntegrationApiResponse<T[]>> {
    const response = await this.sfRequest<SalesforceQueryResponse<T>>(
      `/query?q=${encodeURIComponent(soql)}`
    );

    if (!response.success) return response as IntegrationApiResponse<T[]>;

    return {
      success: true,
      data: response.data?.records || [],
      pagination: {
        hasMore: !response.data?.done,
        cursor: response.data?.nextRecordsUrl,
        total: response.data?.totalSize,
      },
    };
  }

  /**
   * Test connection to Salesforce
   */
  async testConnection(): Promise<boolean> {
    const result = await this.getAccountInfo();
    return result.success;
  }

  /**
   * Get account/user info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    const response = await this.sfRequest<Record<string, unknown>>('/sobjects/User/me');
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
  }): Promise<IntegrationApiResponse<SalesforceContact[]>> {
    const limit = params?.limit || 100;
    const soql = `SELECT Id, FirstName, LastName, Email, Phone, AccountId, Title, Department
                  FROM Contact
                  ORDER BY LastModifiedDate DESC
                  LIMIT ${limit}`;

    return this.query<SalesforceContact>(soql);
  }

  /**
   * Get a single contact
   */
  async getContact(contactId: string): Promise<IntegrationApiResponse<SalesforceContact>> {
    const response = await this.sfRequest<SalesforceContact>(
      `/sobjects/Contact/${contactId}`
    );
    return response;
  }

  /**
   * Create a contact
   */
  async createContact(input: CreateSalesforceContactInput): Promise<IntegrationApiResponse<{ id: string }>> {
    const response = await this.sfRequest<{ id: string; success: boolean; errors: unknown[] }>(
      '/sobjects/Contact',
      { method: 'POST', body: input }
    );

    if (!response.success) return response as IntegrationApiResponse<{ id: string }>;

    return {
      success: true,
      data: { id: response.data!.id },
    };
  }

  /**
   * Update a contact
   */
  async updateContact(
    contactId: string,
    input: Partial<CreateSalesforceContactInput>
  ): Promise<IntegrationApiResponse<void>> {
    const response = await this.sfRequest<void>(
      `/sobjects/Contact/${contactId}`,
      { method: 'PATCH', body: input }
    );
    return response;
  }

  /**
   * Search contacts
   */
  async searchContacts(searchTerm: string): Promise<IntegrationApiResponse<SalesforceContact[]>> {
    const sosl = `FIND {${searchTerm}} IN ALL FIELDS RETURNING Contact(Id, FirstName, LastName, Email, Phone, AccountId)`;

    const response = await this.sfRequest<{ searchRecords: Record<string, unknown>[] }>(
      `/search?q=${encodeURIComponent(sosl)}`
    );

    if (!response.success) return response as IntegrationApiResponse<SalesforceContact[]>;

    return {
      success: true,
      data: (response.data?.searchRecords || []) as SalesforceContact[],
    };
  }

  // -------------------------------------------------------------------------
  // Accounts
  // -------------------------------------------------------------------------

  /**
   * List accounts
   */
  async listAccounts(params?: {
    limit?: number;
  }): Promise<IntegrationApiResponse<SalesforceAccount[]>> {
    const limit = params?.limit || 100;
    const soql = `SELECT Id, Name, Type, Industry, Phone, Website, BillingCity, BillingState, BillingCountry
                  FROM Account
                  ORDER BY LastModifiedDate DESC
                  LIMIT ${limit}`;

    return this.query<SalesforceAccount>(soql);
  }

  /**
   * Get a single account
   */
  async getAccount(accountId: string): Promise<IntegrationApiResponse<SalesforceAccount>> {
    const response = await this.sfRequest<SalesforceAccount>(
      `/sobjects/Account/${accountId}`
    );
    return response;
  }

  /**
   * Create an account
   */
  async createAccount(input: CreateSalesforceAccountInput): Promise<IntegrationApiResponse<{ id: string }>> {
    const response = await this.sfRequest<{ id: string; success: boolean }>(
      '/sobjects/Account',
      { method: 'POST', body: input }
    );

    if (!response.success) return response as IntegrationApiResponse<{ id: string }>;

    return {
      success: true,
      data: { id: response.data!.id },
    };
  }

  // -------------------------------------------------------------------------
  // Opportunities
  // -------------------------------------------------------------------------

  /**
   * List opportunities
   */
  async listOpportunities(params?: {
    limit?: number;
    accountId?: string;
  }): Promise<IntegrationApiResponse<SalesforceOpportunity[]>> {
    const limit = params?.limit || 100;
    let soql = `SELECT Id, Name, Amount, StageName, CloseDate, Probability, AccountId, Description
                FROM Opportunity`;

    if (params?.accountId) {
      soql += ` WHERE AccountId = '${params.accountId}'`;
    }

    soql += ` ORDER BY CloseDate DESC LIMIT ${limit}`;

    return this.query<SalesforceOpportunity>(soql);
  }

  /**
   * Get a single opportunity
   */
  async getOpportunity(opportunityId: string): Promise<IntegrationApiResponse<SalesforceOpportunity>> {
    const response = await this.sfRequest<SalesforceOpportunity>(
      `/sobjects/Opportunity/${opportunityId}`
    );
    return response;
  }

  /**
   * Create an opportunity
   */
  async createOpportunity(input: CreateSalesforceOpportunityInput): Promise<IntegrationApiResponse<{ id: string }>> {
    const response = await this.sfRequest<{ id: string; success: boolean }>(
      '/sobjects/Opportunity',
      { method: 'POST', body: input }
    );

    if (!response.success) return response as IntegrationApiResponse<{ id: string }>;

    return {
      success: true,
      data: { id: response.data!.id },
    };
  }

  /**
   * Update an opportunity
   */
  async updateOpportunity(
    opportunityId: string,
    input: Partial<CreateSalesforceOpportunityInput>
  ): Promise<IntegrationApiResponse<void>> {
    const response = await this.sfRequest<void>(
      `/sobjects/Opportunity/${opportunityId}`,
      { method: 'PATCH', body: input }
    );
    return response;
  }

  // -------------------------------------------------------------------------
  // Leads
  // -------------------------------------------------------------------------

  /**
   * List leads
   */
  async listLeads(params?: {
    limit?: number;
    status?: string;
  }): Promise<IntegrationApiResponse<SalesforceLead[]>> {
    const limit = params?.limit || 100;
    let soql = `SELECT Id, FirstName, LastName, Email, Phone, Company, Status, LeadSource
                FROM Lead`;

    if (params?.status) {
      soql += ` WHERE Status = '${params.status}'`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    return this.query<SalesforceLead>(soql);
  }

  /**
   * Create a lead
   */
  async createLead(input: CreateSalesforceLeadInput): Promise<IntegrationApiResponse<{ id: string }>> {
    const response = await this.sfRequest<{ id: string; success: boolean }>(
      '/sobjects/Lead',
      { method: 'POST', body: input }
    );

    if (!response.success) return response as IntegrationApiResponse<{ id: string }>;

    return {
      success: true,
      data: { id: response.data!.id },
    };
  }

  /**
   * Convert a lead to account/contact
   */
  async convertLead(
    leadId: string,
    options?: {
      convertedStatus: string;
      accountId?: string;
      opportunityName?: string;
      doNotCreateOpportunity?: boolean;
    }
  ): Promise<IntegrationApiResponse<{ accountId: string; contactId: string; opportunityId?: string }>> {
    const body = {
      leadId,
      convertedStatus: options?.convertedStatus || 'Closed - Converted',
      accountId: options?.accountId,
      opportunityName: options?.opportunityName,
      doNotCreateOpportunity: options?.doNotCreateOpportunity || false,
    };

    const response = await this.sfRequest<{ accountId: string; contactId: string; opportunityId?: string }>(
      '/sobjects/Lead/convert',
      { method: 'POST', body }
    );

    return response;
  }

  // -------------------------------------------------------------------------
  // Describe (Metadata)
  // -------------------------------------------------------------------------

  /**
   * Describe an object (get metadata)
   */
  async describeObject(objectName: string): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    const response = await this.sfRequest<Record<string, unknown>>(
      `/sobjects/${objectName}/describe`
    );
    return response;
  }

  /**
   * Get picklist values for a field
   */
  async getPicklistValues(
    objectName: string,
    fieldName: string
  ): Promise<IntegrationApiResponse<Array<{ label: string; value: string }>>> {
    const describe = await this.describeObject(objectName);

    if (!describe.success) return describe as IntegrationApiResponse<Array<{ label: string; value: string }>>;

    const fields = describe.data?.fields as Record<string, unknown>[];
    const field = fields?.find((f) => f.name === fieldName);

    if (!field) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Field ${fieldName} not found` },
      };
    }

    const picklistValues = (field.picklistValues as Array<{ label: string; value: string }>) || [];

    return {
      success: true,
      data: picklistValues.filter((v) => v.value), // Filter out inactive values
    };
  }
}

export const salesforceService = new SalesforceService();
