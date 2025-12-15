/**
 * QuickBooks Online Integration Service
 *
 * Provides methods for interacting with QuickBooks Online API.
 * Supports invoices, customers, payments, and company info.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  QuickBooksInvoice,
  QuickBooksCustomer,
  QuickBooksPayment,
  QuickBooksCompanyInfo,
} from '@/types/integrations';

/**
 * QuickBooks-specific credential data
 */
interface QuickBooksCredentialData extends OAuthCredentialData {
  realmId: string; // Company ID
}

/**
 * QuickBooks query response wrapper
 */
interface QueryResponse<T> {
  QueryResponse: {
    [key: string]: T[];
    startPosition: number;
    maxResults: number;
    totalCount?: number;
  };
  time: string;
}

/**
 * Create invoice input
 */
export interface CreateInvoiceInput {
  customerRef: { value: string };
  line: Array<{
    description?: string;
    amount: number;
    detailType: 'SalesItemLineDetail';
    salesItemLineDetail?: {
      itemRef?: { value: string };
      qty?: number;
      unitPrice?: number;
    };
  }>;
  dueDate?: string;
  docNumber?: string;
  privateNote?: string;
  customerMemo?: { value: string };
}

/**
 * Create customer input
 */
export interface CreateCustomerInput {
  displayName: string;
  companyName?: string;
  primaryEmailAddr?: { address: string };
  primaryPhone?: { freeFormNumber: string };
  billAddr?: {
    line1?: string;
    city?: string;
    countrySubDivisionCode?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * QuickBooks Online Service
 */
export class QuickBooksService extends BaseIntegrationService<QuickBooksCredentialData> {
  constructor() {
    super({
      provider: 'QUICKBOOKS',
      baseUrl: 'https://quickbooks.api.intuit.com/v3/company',
      rateLimitPerMinute: 500,
    });
  }

  /**
   * Get the base URL with realm ID
   */
  private getBaseUrl(): string {
    const data = this.getCredentialData();
    return `${this.config.baseUrl}/${data.realmId}`;
  }

  /**
   * Make a QuickBooks API request
   */
  private async qbRequest<T>(
    endpoint: string,
    options: { method?: string; body?: Record<string, unknown> } = {}
  ): Promise<IntegrationApiResponse<T>> {
    const url = `${this.getBaseUrl()}${endpoint}`;

    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Accept': 'application/json',
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
   * Test connection to QuickBooks
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return this.standardTestConnection();
  }

  /**
   * Get account/company info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.getCompanyInfo();
  }

  /**
   * Get company information
   */
  async getCompanyInfo(): Promise<IntegrationApiResponse<QuickBooksCompanyInfo>> {
    const response = await this.qbRequest<{ CompanyInfo: Record<string, unknown> }>(
      '/companyinfo/' + this.getCredentialData().realmId
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksCompanyInfo>;

    const info = response.data?.CompanyInfo;
    return {
      success: true,
      data: {
        companyName: info?.CompanyName as string,
        companyId: this.getCredentialData().realmId,
        legalName: info?.LegalName as string,
        country: info?.Country as string,
        email: (info?.Email as Record<string, string>)?.Address,
        phone: (info?.PrimaryPhone as Record<string, string>)?.FreeFormNumber,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Invoices
  // -------------------------------------------------------------------------

  /**
   * List invoices with optional filtering
   */
  async listInvoices(params?: {
    maxResults?: number;
    startPosition?: number;
    status?: string;
  }): Promise<IntegrationApiResponse<QuickBooksInvoice[]>> {
    let query = "SELECT * FROM Invoice";

    if (params?.status) {
      query += ` WHERE Balance > 0`; // Filter for unpaid invoices
    }

    query += ` ORDERBY TxnDate DESC`;
    query += ` MAXRESULTS ${params?.maxResults || 100}`;
    query += ` STARTPOSITION ${params?.startPosition || 1}`;

    const response = await this.qbRequest<QueryResponse<Record<string, unknown>>>(
      `/query?query=${encodeURIComponent(query)}`
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksInvoice[]>;

    const invoices = response.data?.QueryResponse?.Invoice || [];

    return {
      success: true,
      data: invoices.map((inv) => this.mapInvoice(inv)),
      pagination: {
        hasMore: invoices.length === (params?.maxResults || 100),
      },
    };
  }

  /**
   * Get a single invoice
   */
  async getInvoice(invoiceId: string): Promise<IntegrationApiResponse<QuickBooksInvoice>> {
    const response = await this.qbRequest<{ Invoice: Record<string, unknown> }>(
      `/invoice/${invoiceId}`
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksInvoice>;

    return {
      success: true,
      data: this.mapInvoice(response.data?.Invoice || {}),
    };
  }

  /**
   * Create a new invoice
   */
  async createInvoice(input: CreateInvoiceInput): Promise<IntegrationApiResponse<QuickBooksInvoice>> {
    const response = await this.qbRequest<{ Invoice: Record<string, unknown> }>(
      '/invoice',
      { method: 'POST', body: input as unknown as Record<string, unknown> }
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksInvoice>;

    return {
      success: true,
      data: this.mapInvoice(response.data?.Invoice || {}),
    };
  }

  /**
   * Send an invoice via email
   */
  async sendInvoice(invoiceId: string, email?: string): Promise<IntegrationApiResponse<QuickBooksInvoice>> {
    let endpoint = `/invoice/${invoiceId}/send`;
    if (email) {
      endpoint += `?sendTo=${encodeURIComponent(email)}`;
    }

    const response = await this.qbRequest<{ Invoice: Record<string, unknown> }>(
      endpoint,
      { method: 'POST' }
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksInvoice>;

    return {
      success: true,
      data: this.mapInvoice(response.data?.Invoice || {}),
    };
  }

  // -------------------------------------------------------------------------
  // Customers
  // -------------------------------------------------------------------------

  /**
   * List customers
   */
  async listCustomers(params?: {
    maxResults?: number;
    startPosition?: number;
  }): Promise<IntegrationApiResponse<QuickBooksCustomer[]>> {
    let query = "SELECT * FROM Customer";
    query += ` ORDERBY DisplayName`;
    query += ` MAXRESULTS ${params?.maxResults || 100}`;
    query += ` STARTPOSITION ${params?.startPosition || 1}`;

    const response = await this.qbRequest<QueryResponse<Record<string, unknown>>>(
      `/query?query=${encodeURIComponent(query)}`
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksCustomer[]>;

    const customers = response.data?.QueryResponse?.Customer || [];

    return {
      success: true,
      data: customers.map((c) => this.mapCustomer(c)),
      pagination: {
        hasMore: customers.length === (params?.maxResults || 100),
      },
    };
  }

  /**
   * Get a single customer
   */
  async getCustomer(customerId: string): Promise<IntegrationApiResponse<QuickBooksCustomer>> {
    const response = await this.qbRequest<{ Customer: Record<string, unknown> }>(
      `/customer/${customerId}`
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksCustomer>;

    return {
      success: true,
      data: this.mapCustomer(response.data?.Customer || {}),
    };
  }

  /**
   * Create a new customer
   */
  async createCustomer(input: CreateCustomerInput): Promise<IntegrationApiResponse<QuickBooksCustomer>> {
    const response = await this.qbRequest<{ Customer: Record<string, unknown> }>(
      '/customer',
      { method: 'POST', body: input as unknown as Record<string, unknown> }
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksCustomer>;

    return {
      success: true,
      data: this.mapCustomer(response.data?.Customer || {}),
    };
  }

  // -------------------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------------------

  /**
   * List payments
   */
  async listPayments(params?: {
    maxResults?: number;
    startPosition?: number;
  }): Promise<IntegrationApiResponse<QuickBooksPayment[]>> {
    let query = "SELECT * FROM Payment";
    query += ` ORDERBY TxnDate DESC`;
    query += ` MAXRESULTS ${params?.maxResults || 100}`;
    query += ` STARTPOSITION ${params?.startPosition || 1}`;

    const response = await this.qbRequest<QueryResponse<Record<string, unknown>>>(
      `/query?query=${encodeURIComponent(query)}`
    );

    if (!response.success) return response as IntegrationApiResponse<QuickBooksPayment[]>;

    const payments = response.data?.QueryResponse?.Payment || [];

    return {
      success: true,
      data: payments.map((p) => ({
        id: p.Id as string,
        totalAmt: p.TotalAmt as number,
        txnDate: p.TxnDate as string,
        customerRef: p.CustomerRef as { value: string; name: string },
        paymentMethodRef: p.PaymentMethodRef as { value: string; name: string } | undefined,
      })),
      pagination: {
        hasMore: payments.length === (params?.maxResults || 100),
      },
    };
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  private mapInvoice(inv: Record<string, unknown>): QuickBooksInvoice {
    const balance = inv.Balance as number;
    const totalAmt = inv.TotalAmt as number;

    let status: QuickBooksInvoice['status'] = 'Draft';
    if (inv.EmailStatus === 'Sent' || inv.EmailStatus === 'EmailSent') {
      status = balance === 0 ? 'Paid' : 'Sent';
    }
    if (balance === 0) {
      status = 'Paid';
    }

    return {
      id: inv.Id as string,
      docNumber: inv.DocNumber as string,
      customerRef: inv.CustomerRef as { value: string; name: string },
      totalAmt,
      balance,
      dueDate: inv.DueDate as string,
      txnDate: inv.TxnDate as string,
      status,
      line: ((inv.Line as unknown[]) || []).map((l: Record<string, unknown>) => ({
        id: l.Id as string,
        description: l.Description as string,
        amount: l.Amount as number,
        detailType: l.DetailType as string,
      })),
    };
  }

  private mapCustomer(c: Record<string, unknown>): QuickBooksCustomer {
    return {
      id: c.Id as string,
      displayName: c.DisplayName as string,
      companyName: c.CompanyName as string,
      primaryEmailAddr: c.PrimaryEmailAddr as { address: string } | undefined,
      primaryPhone: c.PrimaryPhone as { freeFormNumber: string } | undefined,
      balance: c.Balance as number,
      active: c.Active as boolean,
    };
  }
}

export const quickBooksService = new QuickBooksService();
