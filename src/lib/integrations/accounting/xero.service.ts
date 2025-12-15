/**
 * Xero Integration Service
 *
 * Provides methods for interacting with Xero Accounting API.
 * Supports invoices, contacts, organizations, and payments.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  XeroInvoice,
  XeroContact,
  XeroOrganization,
} from '@/types/integrations';

/**
 * Xero-specific credential data
 */
interface XeroCredentialData extends OAuthCredentialData {
  tenantId: string;
  tenantName?: string;
}

/**
 * Create invoice input
 */
export interface CreateXeroInvoiceInput {
  type: 'ACCREC' | 'ACCPAY'; // Accounts Receivable or Payable
  contact: { contactID: string };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode?: string;
    taxType?: string;
  }>;
  date?: string;
  dueDate?: string;
  reference?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED';
}

/**
 * Create contact input
 */
export interface CreateXeroContactInput {
  name: string;
  emailAddress?: string;
  phones?: Array<{
    phoneType: 'DEFAULT' | 'DDI' | 'MOBILE' | 'FAX';
    phoneNumber: string;
  }>;
  addresses?: Array<{
    addressType: 'POBOX' | 'STREET' | 'DELIVERY';
    addressLine1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }>;
}

/**
 * Xero Service
 */
export class XeroService extends BaseIntegrationService<XeroCredentialData> {
  constructor() {
    super({
      provider: 'XERO',
      baseUrl: 'https://api.xero.com/api.xro/2.0',
      rateLimitPerMinute: 60, // Xero has strict rate limits
    });
  }

  /**
   * Get tenant ID header
   */
  private getTenantHeaders(): Record<string, string> {
    const data = this.getCredentialData();
    return {
      'Xero-tenant-id': data.tenantId,
    };
  }

  /**
   * Make a Xero API request
   */
  private async xeroRequest<T>(
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
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...this.getTenantHeaders(),
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
        const errorText = await response.text();
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: response.statusText,
            details: { body: errorText },
          },
        };
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
   * Test connection to Xero
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return this.standardTestConnection();
  }

  /**
   * Get account/company info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.getOrganization();
  }

  /**
   * Get organization info
   */
  async getOrganization(): Promise<IntegrationApiResponse<XeroOrganization>> {
    const response = await this.xeroRequest<{ Organisations: Record<string, unknown>[] }>(
      '/Organisation'
    );

    if (!response.success) return response as IntegrationApiResponse<XeroOrganization>;

    const org = response.data?.Organisations?.[0];
    if (!org) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Organization not found' },
      };
    }

    return {
      success: true,
      data: {
        organisationID: org.OrganisationID as string,
        name: org.Name as string,
        legalName: org.LegalName as string,
        countryCode: org.CountryCode as string,
        baseCurrency: org.BaseCurrency as string,
        organisationType: org.OrganisationType as string,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Invoices
  // -------------------------------------------------------------------------

  /**
   * List invoices
   */
  async listInvoices(params?: {
    page?: number;
    where?: string;
    statuses?: string[];
  }): Promise<IntegrationApiResponse<XeroInvoice[]>> {
    let endpoint = '/Invoices';
    const queryParams: string[] = [];

    if (params?.page) {
      queryParams.push(`page=${params.page}`);
    }

    if (params?.where) {
      queryParams.push(`where=${encodeURIComponent(params.where)}`);
    }

    if (params?.statuses) {
      queryParams.push(`Statuses=${params.statuses.join(',')}`);
    }

    if (queryParams.length > 0) {
      endpoint += '?' + queryParams.join('&');
    }

    const response = await this.xeroRequest<{ Invoices: Record<string, unknown>[] }>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<XeroInvoice[]>;

    const invoices = response.data?.Invoices || [];

    return {
      success: true,
      data: invoices.map((inv) => this.mapInvoice(inv)),
      pagination: {
        hasMore: invoices.length === 100, // Xero's default page size
      },
    };
  }

  /**
   * Get a single invoice
   */
  async getInvoice(invoiceId: string): Promise<IntegrationApiResponse<XeroInvoice>> {
    const response = await this.xeroRequest<{ Invoices: Record<string, unknown>[] }>(
      `/Invoices/${invoiceId}`
    );

    if (!response.success) return response as IntegrationApiResponse<XeroInvoice>;

    const invoice = response.data?.Invoices?.[0];
    if (!invoice) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invoice not found' },
      };
    }

    return {
      success: true,
      data: this.mapInvoice(invoice),
    };
  }

  /**
   * Create a new invoice
   */
  async createInvoice(input: CreateXeroInvoiceInput): Promise<IntegrationApiResponse<XeroInvoice>> {
    const response = await this.xeroRequest<{ Invoices: Record<string, unknown>[] }>(
      '/Invoices',
      {
        method: 'PUT',
        body: { Invoices: [this.formatInvoiceInput(input)] },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<XeroInvoice>;

    const invoice = response.data?.Invoices?.[0];
    if (!invoice) {
      return {
        success: false,
        error: { code: 'CREATE_FAILED', message: 'Failed to create invoice' },
      };
    }

    return {
      success: true,
      data: this.mapInvoice(invoice),
    };
  }

  /**
   * Email an invoice
   */
  async emailInvoice(invoiceId: string): Promise<IntegrationApiResponse<void>> {
    const response = await this.xeroRequest<void>(
      `/Invoices/${invoiceId}/Email`,
      { method: 'POST' }
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
    page?: number;
    where?: string;
  }): Promise<IntegrationApiResponse<XeroContact[]>> {
    let endpoint = '/Contacts';
    const queryParams: string[] = [];

    if (params?.page) {
      queryParams.push(`page=${params.page}`);
    }

    if (params?.where) {
      queryParams.push(`where=${encodeURIComponent(params.where)}`);
    }

    if (queryParams.length > 0) {
      endpoint += '?' + queryParams.join('&');
    }

    const response = await this.xeroRequest<{ Contacts: Record<string, unknown>[] }>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<XeroContact[]>;

    const contacts = response.data?.Contacts || [];

    return {
      success: true,
      data: contacts.map((c) => this.mapContact(c)),
      pagination: {
        hasMore: contacts.length === 100,
      },
    };
  }

  /**
   * Get a single contact
   */
  async getContact(contactId: string): Promise<IntegrationApiResponse<XeroContact>> {
    const response = await this.xeroRequest<{ Contacts: Record<string, unknown>[] }>(
      `/Contacts/${contactId}`
    );

    if (!response.success) return response as IntegrationApiResponse<XeroContact>;

    const contact = response.data?.Contacts?.[0];
    if (!contact) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' },
      };
    }

    return {
      success: true,
      data: this.mapContact(contact),
    };
  }

  /**
   * Create a new contact
   */
  async createContact(input: CreateXeroContactInput): Promise<IntegrationApiResponse<XeroContact>> {
    const response = await this.xeroRequest<{ Contacts: Record<string, unknown>[] }>(
      '/Contacts',
      {
        method: 'PUT',
        body: { Contacts: [this.formatContactInput(input)] },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<XeroContact>;

    const contact = response.data?.Contacts?.[0];
    if (!contact) {
      return {
        success: false,
        error: { code: 'CREATE_FAILED', message: 'Failed to create contact' },
      };
    }

    return {
      success: true,
      data: this.mapContact(contact),
    };
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  private mapInvoice(inv: Record<string, unknown>): XeroInvoice {
    const lineItems = (inv.LineItems as Record<string, unknown>[]) || [];

    return {
      invoiceID: inv.InvoiceID as string,
      invoiceNumber: inv.InvoiceNumber as string,
      contact: {
        contactID: (inv.Contact as Record<string, unknown>)?.ContactID as string,
        name: (inv.Contact as Record<string, unknown>)?.Name as string,
      },
      total: inv.Total as number,
      amountDue: inv.AmountDue as number,
      dueDate: inv.DueDate as string,
      date: inv.Date as string,
      status: inv.Status as XeroInvoice['status'],
      lineItems: lineItems.map((l) => ({
        lineItemID: l.LineItemID as string,
        description: l.Description as string,
        lineAmount: l.LineAmount as number,
        quantity: l.Quantity as number,
        unitAmount: l.UnitAmount as number,
      })),
    };
  }

  private mapContact(c: Record<string, unknown>): XeroContact {
    const phones = (c.Phones as Record<string, unknown>[]) || [];

    return {
      contactID: c.ContactID as string,
      name: c.Name as string,
      emailAddress: c.EmailAddress as string,
      phones: phones.map((p) => ({
        phoneNumber: p.PhoneNumber as string,
        phoneType: p.PhoneType as string,
      })),
      accountsReceivableTaxType: c.AccountsReceivableTaxType as string,
      accountsPayableTaxType: c.AccountsPayableTaxType as string,
    };
  }

  private formatInvoiceInput(input: CreateXeroInvoiceInput): Record<string, unknown> {
    return {
      Type: input.type,
      Contact: { ContactID: input.contact.contactID },
      LineItems: input.lineItems.map((l) => ({
        Description: l.description,
        Quantity: l.quantity,
        UnitAmount: l.unitAmount,
        AccountCode: l.accountCode,
        TaxType: l.taxType,
      })),
      Date: input.date,
      DueDate: input.dueDate,
      Reference: input.reference,
      Status: input.status || 'DRAFT',
    };
  }

  private formatContactInput(input: CreateXeroContactInput): Record<string, unknown> {
    const contact: Record<string, unknown> = {
      Name: input.name,
    };

    if (input.emailAddress) {
      contact.EmailAddress = input.emailAddress;
    }

    if (input.phones) {
      contact.Phones = input.phones.map((p) => ({
        PhoneType: p.phoneType,
        PhoneNumber: p.phoneNumber,
      }));
    }

    if (input.addresses) {
      contact.Addresses = input.addresses.map((a) => ({
        AddressType: a.addressType,
        AddressLine1: a.addressLine1,
        City: a.city,
        Region: a.region,
        PostalCode: a.postalCode,
        Country: a.country,
      }));
    }

    return contact;
  }
}

export const xeroService = new XeroService();
