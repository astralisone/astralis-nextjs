-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('SCHEDULING_UPDATE', 'CONFIRMATION', 'CLARIFICATION', 'CANCELLATION', 'ERROR', 'INFO');

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "taskId" TEXT,
    "type" "ChatMessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_messages_userId_createdAt_idx" ON "chat_messages"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_taskId_idx" ON "chat_messages"("taskId");

-- CreateIndex
CREATE INDEX "chat_messages_read_idx" ON "chat_messages"("read");
