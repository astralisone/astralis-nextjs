/**
 * Pipeline Template Types
 *
 * Defines the structure for pipeline presets/templates that can be used
 * to quickly create new pipelines from predefined configurations.
 */

import { PipelineType } from '@prisma/client';

/**
 * Template stage definition
 * Contains all metadata needed to create a stage from a template
 */
export interface PipelineTemplateStage {
  /** Unique key for the stage within the template (e.g., 'new_lead', 'qualified') */
  key: string;

  /** Display name of the stage */
  name: string;

  /** Detailed description of what this stage represents */
  description: string;

  /** Order/position of the stage in the pipeline (0-indexed) */
  order: number;

  /** Hex color code for visual identification (e.g., '#3B82F6') */
  color: string;

  /** Whether this is a terminal/final stage (no further progression) */
  isTerminal: boolean;
}

/**
 * Complete pipeline template definition
 * Includes both pipeline metadata and all associated stages
 */
export interface PipelineTemplate {
  /** Unique template identifier (e.g., 'sales', 'support', 'billing') */
  key: string;

  /** Display name of the pipeline template */
  name: string;

  /** PipelineType enum value (SALES, SUPPORT, BILLING, INTERNAL, GENERIC, CUSTOM) */
  type: PipelineType;

  /** Detailed description of the template's purpose and use case */
  description: string;

  /** Whether this is the default template for new organizations */
  isDefault: boolean;

  /** Array of stage definitions in order */
  stages: PipelineTemplateStage[];

  /**
   * Metadata about the template
   * Includes information useful for UI display and selection
   */
  metadata: {
    /** Icon name or identifier (e.g., 'chart-line', 'headset', 'dollar-sign') */
    icon?: string;

    /** Category for grouping templates (e.g., 'sales', 'operations', 'customer_service') */
    category?: string;

    /** Tags for filtering and search (e.g., ['b2b', 'enterprise', 'crm']) */
    tags?: string[];

    /** Recommended use cases or industries */
    useCases?: string[];

    /** Estimated number of items per week for capacity planning */
    estimatedVolume?: 'low' | 'medium' | 'high';

    /** Whether this template supports automation workflows */
    supportsAutomation?: boolean;
  };
}

/**
 * Request payload for creating a pipeline from a template
 */
export interface CreatePipelineFromTemplateRequest {
  /** The template key to use (e.g., 'sales', 'support') */
  templateKey: string;

  /** Optional custom name (defaults to template name) */
  name?: string;

  /** Optional custom description (defaults to template description) */
  description?: string;

  /** Organization ID for the new pipeline */
  orgId: string;

  /** Optional: Customize stage colors */
  stageColorOverrides?: Record<string, string>;

  /** Optional: Include only specific stages by key */
  includeStages?: string[];
}

/**
 * API response for GET /api/pipelines/templates
 */
export interface PipelineTemplatesResponse {
  /** Array of available templates */
  templates: PipelineTemplate[];

  /** Total number of templates */
  total: number;

  /** The default template key */
  defaultTemplateKey: string;

  /** Templates grouped by category */
  categories: {
    [category: string]: PipelineTemplate[];
  };
}

/**
 * Response when creating a pipeline from a template
 */
export interface CreateFromTemplateResponse {
  /** The newly created pipeline ID */
  id: string;

  /** Pipeline name */
  name: string;

  /** Pipeline key */
  key: string;

  /** Pipeline type */
  type: PipelineType;

  /** Template key used */
  templateKey: string;

  /** Created stages */
  stages: Array<{
    id: string;
    key: string;
    name: string;
    order: number;
    color: string;
    isTerminal: boolean;
  }>;

  /** Creation timestamp */
  createdAt: string;
}

/**
 * Filter options for template selection
 */
export interface TemplateFilters {
  /** Filter by pipeline type */
  type?: PipelineType;

  /** Filter by category */
  category?: string;

  /** Filter by tags */
  tags?: string[];

  /** Search query for name/description */
  search?: string;

  /** Only show templates with automation support */
  automationOnly?: boolean;
}

/**
 * Template selection UI state
 */
export interface TemplateSelectionState {
  /** Currently selected template key */
  selectedTemplate: string | null;

  /** Active filters */
  filters: TemplateFilters;

  /** Filtered and sorted templates */
  displayedTemplates: PipelineTemplate[];

  /** Whether the user is customizing the template */
  isCustomizing: boolean;

  /** Customization data */
  customization: Partial<CreatePipelineFromTemplateRequest>;
}
