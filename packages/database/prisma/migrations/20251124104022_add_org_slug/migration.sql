/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AgentTaskSource" AS ENUM ('FORM', 'EMAIL', 'SMS', 'API', 'CHAT', 'VOICE');

-- CreateEnum
CREATE TYPE "AgentTaskType" AS ENUM ('SCHEDULE_MEETING', 'RESCHEDULE_MEETING', 'CANCEL_MEETING', 'CHECK_AVAILABILITY', 'CREATE_TASK', 'UPDATE_TASK', 'INQUIRY', 'REMINDER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AgentTaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'AWAITING_INPUT', 'SCHEDULED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LLMProvider" AS ENUM ('OPENAI', 'CLAUDE');

-- CreateEnum
CREATE TYPE "AgentInputSource" AS ENUM ('EMAIL', 'WEBHOOK', 'DB_TRIGGER', 'WORKER', 'API', 'SCHEDULE');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('ASSIGN_PIPELINE', 'CREATE_EVENT', 'UPDATE_EVENT', 'CANCEL_EVENT', 'SEND_NOTIFICATION', 'TRIGGER_AUTOMATION', 'ESCALATE', 'NO_ACTION');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'EXECUTED', 'FAILED', 'REJECTED', 'REQUIRES_APPROVAL');

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "slug" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "scheduling_agent_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "source" "AgentTaskSource" NOT NULL,
    "sourceId" TEXT,
    "rawContent" TEXT NOT NULL,
    "taskType" "AgentTaskType" NOT NULL DEFAULT 'UNKNOWN',
    "intent" TEXT,
    "entities" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "title" TEXT,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "schedulingEventId" TEXT,
    "proposedSlots" JSONB,
    "selectedSlot" JSONB,
    "status" "AgentTaskStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "errorMessage" TEXT,
    "aiMetadata" JSONB,
    "processingTime" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "scheduling_agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orchestration_agents" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "llmProvider" "LLMProvider" NOT NULL,
    "llmModel" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "maxTokens" INTEGER NOT NULL DEFAULT 2000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canAssignPipelines" BOOLEAN NOT NULL DEFAULT true,
    "canCreateEvents" BOOLEAN NOT NULL DEFAULT true,
    "canSendNotifications" BOOLEAN NOT NULL DEFAULT true,
    "canTriggerAutomations" BOOLEAN NOT NULL DEFAULT true,
    "maxActionsPerMinute" INTEGER NOT NULL DEFAULT 60,
    "maxActionsPerHour" INTEGER NOT NULL DEFAULT 500,
    "totalDecisions" INTEGER NOT NULL DEFAULT 0,
    "successfulDecisions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orchestration_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_decisions" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "inputSource" "AgentInputSource" NOT NULL,
    "inputType" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "llmPrompt" TEXT NOT NULL,
    "llmResponse" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "decisionType" "DecisionType" NOT NULL,
    "actions" JSONB NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "executionTime" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "agent_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduling_agent_tasks_userId_idx" ON "scheduling_agent_tasks"("userId");

-- CreateIndex
CREATE INDEX "scheduling_agent_tasks_orgId_idx" ON "scheduling_agent_tasks"("orgId");

-- CreateIndex
CREATE INDEX "scheduling_agent_tasks_status_idx" ON "scheduling_agent_tasks"("status");

-- CreateIndex
CREATE INDEX "scheduling_agent_tasks_taskType_idx" ON "scheduling_agent_tasks"("taskType");

-- CreateIndex
CREATE INDEX "scheduling_agent_tasks_priority_idx" ON "scheduling_agent_tasks"("priority");

-- CreateIndex
CREATE INDEX "scheduling_agent_tasks_createdAt_idx" ON "scheduling_agent_tasks"("createdAt");

-- CreateIndex
CREATE INDEX "scheduling_agent_tasks_source_idx" ON "scheduling_agent_tasks"("source");

-- CreateIndex
CREATE INDEX "orchestration_agents_orgId_isActive_idx" ON "orchestration_agents"("orgId", "isActive");

-- CreateIndex
CREATE INDEX "agent_decisions_orgId_createdAt_idx" ON "agent_decisions"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "agent_decisions_agentId_status_idx" ON "agent_decisions"("agentId", "status");

-- CreateIndex
CREATE INDEX "agent_decisions_inputSource_idx" ON "agent_decisions"("inputSource");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "organization_slug_idx" ON "organization"("slug");

-- AddForeignKey
ALTER TABLE "scheduling_agent_tasks" ADD CONSTRAINT "scheduling_agent_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_agent_tasks" ADD CONSTRAINT "scheduling_agent_tasks_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_agent_tasks" ADD CONSTRAINT "scheduling_agent_tasks_schedulingEventId_fkey" FOREIGN KEY ("schedulingEventId") REFERENCES "scheduling_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orchestration_agents" ADD CONSTRAINT "orchestration_agents_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_decisions" ADD CONSTRAINT "agent_decisions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "orchestration_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_decisions" ADD CONSTRAINT "agent_decisions_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
