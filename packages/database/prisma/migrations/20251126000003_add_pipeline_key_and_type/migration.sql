-- AlterTable: Add missing fields to pipeline table
-- Add key column (unique identifier for TaskTemplate references)
ALTER TABLE "pipeline" ADD COLUMN "key" TEXT;

-- Add type column with default value
ALTER TABLE "pipeline" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'GENERIC';

-- Create unique constraint on key
CREATE UNIQUE INDEX "pipeline_key_key" ON "pipeline"("key");

-- Create index on key for performance
CREATE INDEX "pipeline_key_idx" ON "pipeline"("key");

-- Create index on type for filtering
CREATE INDEX "pipeline_type_idx" ON "pipeline"("type");

-- Generate unique keys for existing pipelines (using id as fallback)
UPDATE "pipeline" SET "key" = 'pipeline_' || id WHERE "key" IS NULL;

-- Make key column NOT NULL after setting values
ALTER TABLE "pipeline" ALTER COLUMN "key" SET NOT NULL;

-- AlterTable: Add key column to pipelineStage
ALTER TABLE "pipelineStage" ADD COLUMN "key" TEXT;

-- Add isTerminal column
ALTER TABLE "pipelineStage" ADD COLUMN "isTerminal" BOOLEAN NOT NULL DEFAULT false;

-- Update keys for existing stages
UPDATE "pipelineStage" SET "key" = 'stage_' || id WHERE "key" IS NULL;

-- Make key column NOT NULL
ALTER TABLE "pipelineStage" ALTER COLUMN "key" SET NOT NULL;

-- Create unique constraint on pipelineId + key
CREATE UNIQUE INDEX "pipelineStage_pipelineId_key_key" ON "pipelineStage"("pipelineId", "key");
