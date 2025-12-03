/**
 * Custom Hooks Export
 *
 * Centralized export for all custom React hooks.
 * Organized by domain for easy discovery.
 */

// Analytics
export { useAnalytics } from './useAnalytics';

// Animation hooks
export * from './animations';

// Pipeline hooks - Data fetching
export { usePipelines, usePipeline, useMovePipelineItem, useUpdateItemAssignee } from './usePipelines';

// Pipeline hooks - Mutations
export {
  useCreatePipeline,
  useUpdatePipeline,
  useDeletePipeline,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
} from './usePipelineMutations';

// Intake hooks - Data fetching
export { useIntake } from './useIntake';

// Intake hooks - Mutations
export {
  useCreateIntake,
  useUpdateIntake,
  useAssignToPipeline,
  useUpdateIntakeStatus,
  useDeleteIntake,
} from './useIntakeMutations';

// Organization hooks
export { useOrganization } from './useOrganization';
export { useOrgMembers } from './useOrgMembers';

// Document hooks
export {
  useDocuments,
  useDocument,
  useDocumentStats,
  useUploadDocument,
  useDeleteDocument,
  useRetryDocument,
  documentKeys,
} from './useDocuments';

// Notifications
export { useToast } from './useToast';
