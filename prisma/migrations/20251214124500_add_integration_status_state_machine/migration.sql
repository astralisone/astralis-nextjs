-- Add status state machine to integration credentials
-- This provides better tracking of integration health and error states

-- Create enum for integration status
CREATE TYPE "IntegrationStatus" AS ENUM (
  'DISCONNECTED',
  'CONNECTING',
  'CONNECTED_ACTIVE',
  'CONNECTED_ERROR',
  'NEEDS_REAUTH',
  'DISABLED',
  'SUSPENDED'
);

-- Add status columns to integration_credentials table
ALTER TABLE "integration_credentials"
ADD COLUMN "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
ADD COLUMN "lastError" TEXT,
ADD COLUMN "errorCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastErrorAt" TIMESTAMP(3),
ADD COLUMN "lastHealthCheck" TIMESTAMP(3),
ADD COLUMN "healthCheckInterval" INTEGER DEFAULT 300000; -- 5 minutes in milliseconds

-- Update existing records to have proper status
UPDATE "integration_credentials"
SET "status" = CASE
  WHEN "isActive" = true THEN 'CONNECTED_ACTIVE'::"IntegrationStatus"
  ELSE 'DISCONNECTED'::"IntegrationStatus"
END;

-- Add index for status queries
CREATE INDEX "integration_credentials_status_idx" ON "integration_credentials"("status");
CREATE INDEX "integration_credentials_lastErrorAt_idx" ON "integration_credentials"("lastErrorAt");