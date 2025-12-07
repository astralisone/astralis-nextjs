/**
 * CRM Integrations Index
 *
 * Exports all CRM integration services.
 */

export { HubSpotService, hubSpotService } from './hubspot.service';
export type {
  CreateHubSpotContactInput,
  CreateHubSpotCompanyInput,
  CreateHubSpotDealInput,
} from './hubspot.service';

export { SalesforceService, salesforceService } from './salesforce.service';
export type {
  CreateSalesforceContactInput,
  CreateSalesforceAccountInput,
  CreateSalesforceOpportunityInput,
  CreateSalesforceLeadInput,
} from './salesforce.service';
