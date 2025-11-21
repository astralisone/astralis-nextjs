import OpenAI from 'openai';

/**
 * GPT-4 Vision Service
 *
 * Handles structured data extraction from document images using GPT-4 Vision.
 *
 * Features:
 * - Extract structured data from invoices, receipts, forms
 * - Parse document fields with AI understanding
 * - Support for multiple document types
 * - Configurable extraction schemas
 */

/**
 * Document type enum for structured extraction
 */
export enum DocumentType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  FORM = 'form',
  CONTRACT = 'contract',
  IDENTITY = 'identity',
  BUSINESS_CARD = 'business_card',
  GENERIC = 'generic',
}

/**
 * Extraction result interface
 */
export interface ExtractionResult {
  type: DocumentType;
  data: Record<string, any>;
  confidence: number;
  model: string;
  processingTime: number;
}

/**
 * Extraction schema for different document types
 */
interface ExtractionSchema {
  type: DocumentType;
  fields: string[];
  prompt: string;
}

/**
 * GPT-4 Vision Service class
 */
export class VisionService {
  private openai: OpenAI;
  private model: string = 'gpt-4-vision-preview';

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }

  /**
   * Get extraction schema for document type
   *
   * @param documentType - Type of document to extract
   * @returns Extraction schema with fields and prompt
   */
  private getExtractionSchema(documentType: DocumentType): ExtractionSchema {
    const schemas: Record<DocumentType, ExtractionSchema> = {
      [DocumentType.INVOICE]: {
        type: DocumentType.INVOICE,
        fields: [
          'invoice_number',
          'invoice_date',
          'due_date',
          'vendor_name',
          'vendor_address',
          'customer_name',
          'customer_address',
          'items',
          'subtotal',
          'tax',
          'total',
          'currency',
          'payment_terms',
        ],
        prompt: `Extract structured data from this invoice image. Return a JSON object with the following fields:
- invoice_number: Invoice number
- invoice_date: Invoice date (ISO format)
- due_date: Payment due date (ISO format)
- vendor_name: Vendor/supplier name
- vendor_address: Vendor address
- customer_name: Customer name
- customer_address: Customer address
- items: Array of line items with {description, quantity, unit_price, total}
- subtotal: Subtotal amount
- tax: Tax amount
- total: Total amount
- currency: Currency code (e.g., USD, EUR)
- payment_terms: Payment terms description

Return ONLY valid JSON, no additional text.`,
      },
      [DocumentType.RECEIPT]: {
        type: DocumentType.RECEIPT,
        fields: [
          'merchant_name',
          'merchant_address',
          'date',
          'time',
          'items',
          'subtotal',
          'tax',
          'tip',
          'total',
          'payment_method',
          'transaction_id',
        ],
        prompt: `Extract structured data from this receipt image. Return a JSON object with the following fields:
- merchant_name: Store/restaurant name
- merchant_address: Store address
- date: Transaction date (ISO format)
- time: Transaction time
- items: Array of purchased items with {description, quantity, price}
- subtotal: Subtotal amount
- tax: Tax amount
- tip: Tip amount (if applicable)
- total: Total amount
- payment_method: Payment method (e.g., Credit Card, Cash)
- transaction_id: Transaction ID or receipt number

Return ONLY valid JSON, no additional text.`,
      },
      [DocumentType.FORM]: {
        type: DocumentType.FORM,
        fields: ['form_type', 'form_fields', 'date', 'signature_present'],
        prompt: `Extract structured data from this form image. Return a JSON object with the following fields:
- form_type: Type of form (e.g., Application, Registration, Survey)
- form_fields: Object with all visible form fields and their values
- date: Date on form (ISO format)
- signature_present: Boolean indicating if signature is present

Return ONLY valid JSON, no additional text.`,
      },
      [DocumentType.CONTRACT]: {
        type: DocumentType.CONTRACT,
        fields: [
          'contract_type',
          'parties',
          'effective_date',
          'expiration_date',
          'terms',
          'signatures',
        ],
        prompt: `Extract structured data from this contract image. Return a JSON object with the following fields:
- contract_type: Type of contract
- parties: Array of parties involved with {name, role}
- effective_date: Contract effective date (ISO format)
- expiration_date: Contract expiration date (ISO format)
- terms: Key terms and conditions (array of strings)
- signatures: Array of signatures present with {party, signed, date}

Return ONLY valid JSON, no additional text.`,
      },
      [DocumentType.IDENTITY]: {
        type: DocumentType.IDENTITY,
        fields: [
          'document_type',
          'full_name',
          'date_of_birth',
          'id_number',
          'expiration_date',
          'issuing_authority',
        ],
        prompt: `Extract structured data from this identity document image. Return a JSON object with the following fields:
- document_type: Type (e.g., Passport, Driver License, ID Card)
- full_name: Full name
- date_of_birth: Date of birth (ISO format)
- id_number: ID/document number
- expiration_date: Expiration date (ISO format)
- issuing_authority: Issuing authority/country

Return ONLY valid JSON, no additional text.`,
      },
      [DocumentType.BUSINESS_CARD]: {
        type: DocumentType.BUSINESS_CARD,
        fields: ['name', 'title', 'company', 'email', 'phone', 'address', 'website'],
        prompt: `Extract structured data from this business card image. Return a JSON object with the following fields:
- name: Person's name
- title: Job title
- company: Company name
- email: Email address
- phone: Phone number
- address: Business address
- website: Website URL

Return ONLY valid JSON, no additional text.`,
      },
      [DocumentType.GENERIC]: {
        type: DocumentType.GENERIC,
        fields: ['document_type', 'key_information', 'dates', 'amounts'],
        prompt: `Extract structured data from this document image. Return a JSON object with the following fields:
- document_type: Best guess of document type
- key_information: Object with all relevant fields and values
- dates: Array of dates found in the document
- amounts: Array of monetary amounts found

Return ONLY valid JSON, no additional text.`,
      },
    };

    return schemas[documentType];
  }

  /**
   * Convert image buffer to base64 data URL
   *
   * @param imageBuffer - Image buffer
   * @param mimeType - MIME type
   * @returns Base64 data URL
   */
  private bufferToDataUrl(imageBuffer: Buffer, mimeType: string): string {
    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Extract structured data from document image using GPT-4 Vision
   *
   * @param imageBuffer - Image buffer
   * @param mimeType - MIME type
   * @param documentType - Type of document to extract
   * @returns Extraction result with structured data
   */
  async extractStructuredData(
    imageBuffer: Buffer,
    mimeType: string,
    documentType: DocumentType = DocumentType.GENERIC
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      // Get extraction schema
      const schema = this.getExtractionSchema(documentType);

      // Convert image to base64 data URL
      const imageUrl = this.bufferToDataUrl(imageBuffer, mimeType);

      // Call GPT-4 Vision API
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: schema.prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.2, // Low temperature for consistent extraction
      });

      const processingTime = Date.now() - startTime;

      // Extract JSON from response
      const content = response.choices[0]?.message?.content || '{}';
      const extractedData = this.parseExtractionResponse(content);

      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(extractedData, schema.fields);

      return {
        type: documentType,
        data: extractedData,
        confidence,
        model: this.model,
        processingTime,
      };
    } catch (error) {
      console.error('Vision extraction error:', error);
      throw new Error(`Failed to extract structured data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse extraction response from GPT-4 Vision
   *
   * @param content - Response content
   * @returns Parsed JSON data
   */
  private parseExtractionResponse(content: string): Record<string, any> {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      // Parse JSON
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      return { raw_response: content };
    }
  }

  /**
   * Calculate confidence score for extraction result
   *
   * @param data - Extracted data
   * @param expectedFields - Expected fields for document type
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(data: Record<string, any>, expectedFields: string[]): number {
    if (!data || Object.keys(data).length === 0) {
      return 0;
    }

    // Count how many expected fields are present and non-empty
    const presentFields = expectedFields.filter(field => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '';
    });

    // Base confidence on field coverage
    const fieldCoverage = presentFields.length / expectedFields.length;

    // Adjust confidence based on data quality
    let qualityScore = 1.0;

    // Check for common issues
    if (data.raw_response) {
      // Failed to parse as JSON
      qualityScore *= 0.3;
    }

    // Check for placeholder values
    const hasPlaceholders = Object.values(data).some(value =>
      typeof value === 'string' && (
        value.toLowerCase().includes('not found') ||
        value.toLowerCase().includes('n/a') ||
        value === 'null'
      )
    );

    if (hasPlaceholders) {
      qualityScore *= 0.8;
    }

    return Math.min(fieldCoverage * qualityScore, 1.0);
  }

  /**
   * Detect document type from image
   *
   * @param imageBuffer - Image buffer
   * @param mimeType - MIME type
   * @returns Detected document type
   */
  async detectDocumentType(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<DocumentType> {
    try {
      const imageUrl = this.bufferToDataUrl(imageBuffer, mimeType);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this document image and classify it into one of these categories:
- invoice
- receipt
- form
- contract
- identity
- business_card
- generic

Return ONLY the category name, nothing else.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content?.trim().toLowerCase() || 'generic';

      // Map response to DocumentType enum
      const typeMap: Record<string, DocumentType> = {
        'invoice': DocumentType.INVOICE,
        'receipt': DocumentType.RECEIPT,
        'form': DocumentType.FORM,
        'contract': DocumentType.CONTRACT,
        'identity': DocumentType.IDENTITY,
        'business_card': DocumentType.BUSINESS_CARD,
        'generic': DocumentType.GENERIC,
      };

      return typeMap[content] || DocumentType.GENERIC;
    } catch (error) {
      console.error('Document type detection error:', error);
      return DocumentType.GENERIC;
    }
  }

  /**
   * Extract and validate specific field from document
   *
   * @param imageBuffer - Image buffer
   * @param mimeType - MIME type
   * @param fieldName - Field to extract
   * @param fieldDescription - Description of field to extract
   * @returns Extracted field value
   */
  async extractField(
    imageBuffer: Buffer,
    mimeType: string,
    fieldName: string,
    fieldDescription: string
  ): Promise<any> {
    try {
      const imageUrl = this.bufferToDataUrl(imageBuffer, mimeType);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the following field from this document:
Field: ${fieldName}
Description: ${fieldDescription}

Return ONLY the field value, nothing else. If not found, return "NOT_FOUND".`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 100,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content?.trim() || 'NOT_FOUND';
      return content === 'NOT_FOUND' ? null : content;
    } catch (error) {
      console.error('Field extraction error:', error);
      return null;
    }
  }
}

// Singleton instance
let visionServiceInstance: VisionService | null = null;

/**
 * Get singleton instance of VisionService
 *
 * @returns VisionService instance
 */
export function getVisionService(): VisionService {
  if (!visionServiceInstance) {
    visionServiceInstance = new VisionService();
  }
  return visionServiceInstance;
}
