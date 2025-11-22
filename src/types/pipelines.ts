// Intake Request Types - defined first for use in Pipeline interface
export enum IntakeSource {
  FORM = 'FORM',
  EMAIL = 'EMAIL',
  CHAT = 'CHAT',
  API = 'API',
}

export enum IntakeStatus {
  NEW = 'NEW',
  ROUTING = 'ROUTING',
  ASSIGNED = 'ASSIGNED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface IntakeRequest {
  id: string;
  source: IntakeSource;
  status: IntakeStatus;
  title: string;
  description?: string | null;
  requestData: Record<string, unknown>;
  priority: number;
  orgId: string;
  assignedPipeline?: string | null;
  aiRoutingMeta?: {
    confidence: number;
    reasoning: string;
    suggestedPipelines: string[];
    routedAt: string;
  } | null;
  pipeline?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// Pipeline Priority and Status enums
export enum PipelinePriority {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
}

export enum PipelineItemStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

// Pipeline domain types
export interface Pipeline {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  orgId: string;
  stages: PipelineStage[];
  intakeRequests?: IntakeRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string | null;
  order: number;
  color?: string | null;
  pipelineId: string;
  items: PipelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineItem {
  id: string;
  title: string;
  description?: string | null;
  data: Record<string, any>;
  stageId: string;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  priority: PipelinePriority;
  status: PipelineItemStatus;
  dueDate?: string | null;
  progress: number; // 0-100
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineFilters {
  search?: string;
  assigneeIds?: string[];
  priorities?: PipelinePriority[];
  statuses?: PipelineItemStatus[];
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PipelineView {
  type: 'kanban' | 'list' | 'grid';
}

// API request/response types
export interface CreatePipelineRequest {
  name: string;
  description?: string;
  orgId: string;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateStageRequest {
  name: string;
  description?: string;
  color?: string;
  order: number;
}

export interface UpdateStageRequest {
  name?: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface CreatePipelineItemRequest {
  title: string;
  description?: string;
  data?: Record<string, any>;
  stageId: string;
  assignedToId?: string;
  priority?: PipelinePriority;
  status?: PipelineItemStatus;
  dueDate?: string;
  tags?: string[];
}

export interface UpdatePipelineItemRequest {
  title?: string;
  description?: string;
  data?: Record<string, any>;
  assignedToId?: string;
  priority?: PipelinePriority;
  status?: PipelineItemStatus;
  dueDate?: string;
  progress?: number;
  tags?: string[];
}

export interface MovePipelineItemRequest {
  targetStageId: string;
}

export interface PipelineListResponse {
  pipelines: Pipeline[];
  total: number;
}

export interface PipelineDetailResponse {
  id: string;
  name: string;
  description?: string | null;
  stages: PipelineStage[];
}

export interface IntakeRequestsResponse {
  intakeRequests: IntakeRequest[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Pipeline with intake requests
export interface PipelineWithIntake extends Pipeline {
  intakeRequests: IntakeRequest[];
}
