-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'BILL', 'CONTRACT', 'POLICY', 'CERTIFICATE', 'PACKING_SLIP', 'BOL', 'RECEIVING_REPORT', 'PURCHASE_ORDER', 'QUOTE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OperationalAgentType" AS ENUM ('AP_CLERK', 'COMPLIANCE_SENTINEL', 'LOGISTICS_COORDINATOR');

-- AlterTable: Add missing columns to Document table
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "originalName" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "documentType" "DocumentType";
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "classificationConfidence" DOUBLE PRECISION;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "agentProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "agentProcessedAt" TIMESTAMP(3);

-- Update originalName for existing rows to use fileName if null
UPDATE "Document" SET "originalName" = "fileName" WHERE "originalName" IS NULL;

-- Make originalName required (if there are existing rows, they now have a value)
ALTER TABLE "Document" ALTER COLUMN "originalName" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Document_documentType_idx" ON "Document"("documentType");
