/**
 * Configuration exports for Astralis One
 *
 * This module provides centralized access to all configuration files
 * used throughout the application.
 */

import extractionSchemas from './extraction-schemas.json';
import taskTemplates from './task-templates.json';

export { extractionSchemas, taskTemplates };

/**
 * Type definitions for extraction schemas
 */
export type FieldType = 'string' | 'number' | 'currency' | 'date' | 'boolean' | 'array';

export interface FieldSchema {
  name: string;
  type: FieldType;
  required: boolean;
  aliases?: string[];
  description: string;
  itemSchema?: Record<string, string>;
}

export interface DocumentTypeSchema {
  name: string;
  description: string;
  fields: FieldSchema[];
}

export type ExtractionSchemas = Record<string, DocumentTypeSchema>;

/**
 * Typed extraction schemas
 */
export const typedExtractionSchemas = extractionSchemas as ExtractionSchemas;

/**
 * Helper function to get schema for a specific document type
 */
export function getSchemaForDocumentType(documentType: string): DocumentTypeSchema | null {
  return typedExtractionSchemas[documentType] || null;
}

/**
 * Helper function to get all field names for a document type (including aliases)
 */
export function getAllFieldNamesForType(documentType: string): string[] {
  const schema = getSchemaForDocumentType(documentType);
  if (!schema) return [];

  const fieldNames: string[] = [];
  schema.fields.forEach(field => {
    fieldNames.push(field.name);
    if (field.aliases) {
      fieldNames.push(...field.aliases);
    }
  });

  return fieldNames;
}

/**
 * Helper function to get required fields for a document type
 */
export function getRequiredFieldsForType(documentType: string): FieldSchema[] {
  const schema = getSchemaForDocumentType(documentType);
  if (!schema) return [];

  return schema.fields.filter(field => field.required);
}

/**
 * Helper function to validate extracted data against schema
 */
export function validateExtractedData(
  documentType: string,
  extractedData: Record<string, any>
): { valid: boolean; missingFields: string[]; extraFields: string[] } {
  const schema = getSchemaForDocumentType(documentType);

  if (!schema) {
    return { valid: false, missingFields: [], extraFields: [] };
  }

  const requiredFields = getRequiredFieldsForType(documentType);
  const allValidFieldNames = getAllFieldNamesForType(documentType);

  const missingFields = requiredFields
    .filter(field => !(field.name in extractedData))
    .map(field => field.name);

  const extraFields = Object.keys(extractedData)
    .filter(key => !allValidFieldNames.includes(key));

  return {
    valid: missingFields.length === 0,
    missingFields,
    extraFields
  };
}
