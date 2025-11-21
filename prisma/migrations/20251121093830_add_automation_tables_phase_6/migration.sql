/*
  Warnings:

  - You are about to drop the `automation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `originalName` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('WEBHOOK', 'SCHEDULE', 'EVENT', 'MANUAL', 'API');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('WEBHOOK', 'SCHEDULE', 'INTAKE_CREATED', 'INTAKE_ASSIGNED', 'DOCUMENT_UPLOADED', 'DOCUMENT_PROCESSED', 'PIPELINE_STAGE_CHANGED', 'FORM_SUBMITTED', 'EMAIL_RECEIVED', 'API_CALL');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('LEAD_MANAGEMENT', 'CUSTOMER_ONBOARDING', 'REPORTING', 'NOTIFICATIONS', 'DATA_SYNC', 'CONTENT_PUBLISHING', 'INVOICING', 'SUPPORT_AUTOMATION', 'SALES_PIPELINE', 'MARKETING', 'HR_OPERATIONS', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GMAIL', 'GOOGLE_SHEETS', 'GOOGLE_DRIVE', 'GOOGLE_CALENDAR', 'SLACK', 'MICROSOFT_TEAMS', 'OUTLOOK', 'HUBSPOT', 'SALESFORCE', 'STRIPE', 'PAYPAL', 'MAILCHIMP', 'SENDGRID', 'TWILIO', 'ZOOM', 'DROPBOX', 'TRELLO', 'ASANA', 'NOTION', 'AIRTABLE', 'WEBHOOK', 'HTTP_REQUEST', 'DATABASE', 'OPENAI', 'ANTHROPIC', 'OTHER');

-- AlterEnum
ALTER TYPE "CalendarProvider" ADD VALUE 'MICROSOFT';

-- DropForeignKey
ALTER TABLE "automation" DROP CONSTRAINT "automation_orgId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "originalName" TEXT NOT NULL;

-- DropTable
DROP TABLE "automation";

-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "n8nWorkflowId" TEXT,
    "webhookUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerType" "AutomationTrigger" NOT NULL,
    "triggerConfig" JSONB NOT NULL,
    "lastExecutedAt" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "avgExecutionTime" DOUBLE PRECISION,
    "orgId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "n8nExecutionId" TEXT,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "executionTime" INTEGER,
    "triggerData" JSONB NOT NULL,
    "outputData" JSONB,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_triggers" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "cronSchedule" TEXT,
    "eventFilters" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "n8nWorkflowJson" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "demoVideoUrl" TEXT,
    "requiredIntegrations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "publishedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "credentialName" TEXT NOT NULL,
    "credentialData" TEXT NOT NULL,
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentEmbedding" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChat" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "syncErrorCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "location" TEXT,
    "meetingLink" TEXT,
    "participantEmails" TEXT[],
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "aiSuggestionMeta" JSONB,
    "calendarIntegrationData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduling_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_reminders" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automations_orgId_isActive_idx" ON "automations"("orgId", "isActive");

-- CreateIndex
CREATE INDEX "automations_triggerType_idx" ON "automations"("triggerType");

-- CreateIndex
CREATE INDEX "automations_createdById_idx" ON "automations"("createdById");

-- CreateIndex
CREATE INDEX "automations_createdAt_idx" ON "automations"("createdAt");

-- CreateIndex
CREATE INDEX "workflow_executions_automationId_status_idx" ON "workflow_executions"("automationId", "status");

-- CreateIndex
CREATE INDEX "workflow_executions_orgId_startedAt_idx" ON "workflow_executions"("orgId", "startedAt");

-- CreateIndex
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");

-- CreateIndex
CREATE INDEX "workflow_executions_createdAt_idx" ON "workflow_executions"("createdAt");

-- CreateIndex
CREATE INDEX "workflow_triggers_automationId_isActive_idx" ON "workflow_triggers"("automationId", "isActive");

-- CreateIndex
CREATE INDEX "workflow_triggers_orgId_idx" ON "workflow_triggers"("orgId");

-- CreateIndex
CREATE INDEX "workflow_triggers_triggerType_idx" ON "workflow_triggers"("triggerType");

-- CreateIndex
CREATE INDEX "automation_templates_category_idx" ON "automation_templates"("category");

-- CreateIndex
CREATE INDEX "automation_templates_useCount_idx" ON "automation_templates"("useCount");

-- CreateIndex
CREATE INDEX "automation_templates_rating_idx" ON "automation_templates"("rating");

-- CreateIndex
CREATE INDEX "automation_templates_isOfficial_idx" ON "automation_templates"("isOfficial");

-- CreateIndex
CREATE INDEX "integration_credentials_orgId_idx" ON "integration_credentials"("orgId");

-- CreateIndex
CREATE INDEX "integration_credentials_userId_isActive_idx" ON "integration_credentials"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "integration_credentials_userId_provider_credentialName_key" ON "integration_credentials"("userId", "provider", "credentialName");

-- CreateIndex
CREATE INDEX "DocumentEmbedding_documentId_idx" ON "DocumentEmbedding"("documentId");

-- CreateIndex
CREATE INDEX "DocumentEmbedding_orgId_idx" ON "DocumentEmbedding"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentEmbedding_documentId_chunkIndex_key" ON "DocumentEmbedding"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "DocumentChat_documentId_idx" ON "DocumentChat"("documentId");

-- CreateIndex
CREATE INDEX "DocumentChat_userId_idx" ON "DocumentChat"("userId");

-- CreateIndex
CREATE INDEX "DocumentChat_orgId_idx" ON "DocumentChat"("orgId");

-- CreateIndex
CREATE INDEX "DocumentChat_lastMessageAt_idx" ON "DocumentChat"("lastMessageAt");

-- CreateIndex
CREATE INDEX "calendar_connections_userId_isActive_idx" ON "calendar_connections"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_connections_userId_provider_providerAccountId_key" ON "calendar_connections"("userId", "provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "availability_rules_userId_isActive_dayOfWeek_idx" ON "availability_rules"("userId", "isActive", "dayOfWeek");

-- CreateIndex
CREATE INDEX "scheduling_events_userId_startTime_idx" ON "scheduling_events"("userId", "startTime");

-- CreateIndex
CREATE INDEX "scheduling_events_orgId_startTime_idx" ON "scheduling_events"("orgId", "startTime");

-- CreateIndex
CREATE INDEX "scheduling_events_status_idx" ON "scheduling_events"("status");

-- CreateIndex
CREATE INDEX "event_reminders_status_reminderTime_idx" ON "event_reminders"("status", "reminderTime");

-- CreateIndex
CREATE INDEX "event_reminders_eventId_idx" ON "event_reminders"("eventId");

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_triggers" ADD CONSTRAINT "workflow_triggers_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_triggers" ADD CONSTRAINT "workflow_triggers_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentEmbedding" ADD CONSTRAINT "DocumentEmbedding_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChat" ADD CONSTRAINT "DocumentChat_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChat" ADD CONSTRAINT "DocumentChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChat" ADD CONSTRAINT "DocumentChat_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_events" ADD CONSTRAINT "scheduling_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_events" ADD CONSTRAINT "scheduling_events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reminders" ADD CONSTRAINT "event_reminders_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "scheduling_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
