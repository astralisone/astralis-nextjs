-- Migration: add_document_chat_rag
-- Date: 2025-11-20
-- Description: Add DocumentEmbedding and DocumentChat models for RAG chat feature

-- Create DocumentEmbedding table for vector search
CREATE TABLE "DocumentEmbedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentEmbedding_documentId_fkey" FOREIGN KEY ("documentId")
        REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index for document chunk combination
CREATE UNIQUE INDEX "DocumentEmbedding_documentId_chunkIndex_key"
    ON "DocumentEmbedding"("documentId", "chunkIndex");

-- Create indexes for performance
CREATE INDEX "DocumentEmbedding_documentId_idx" ON "DocumentEmbedding"("documentId");
CREATE INDEX "DocumentEmbedding_orgId_idx" ON "DocumentEmbedding"("orgId");

-- Create DocumentChat table for conversation persistence
CREATE TABLE "DocumentChat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChat_documentId_fkey" FOREIGN KEY ("documentId")
        REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentChat_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentChat_orgId_fkey" FOREIGN KEY ("orgId")
        REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for DocumentChat
CREATE INDEX "DocumentChat_documentId_idx" ON "DocumentChat"("documentId");
CREATE INDEX "DocumentChat_userId_idx" ON "DocumentChat"("userId");
CREATE INDEX "DocumentChat_orgId_idx" ON "DocumentChat"("orgId");
CREATE INDEX "DocumentChat_lastMessageAt_idx" ON "DocumentChat"("lastMessageAt");

-- Migration complete
