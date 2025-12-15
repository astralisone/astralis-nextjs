-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'BILL', 'CONTRACT', 'POLICY', 'CERTIFICATE', 'PACKING_SLIP', 'BOL', 'RECEIVING_REPORT', 'PURCHASE_ORDER', 'QUOTE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OperationalAgentType" AS ENUM ('AP_CLERK', 'COMPLIANCE_SENTINEL', 'LOGISTICS_COORDINATOR');

-- AlterTable: Add missing columns to Document table
-- Add columns with explicit checks to ensure they exist
DO $$
BEGIN
    -- Add originalName column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Document' AND column_name = 'originalName') THEN
        ALTER TABLE "Document" ADD COLUMN "originalName" TEXT;
    END IF;

    -- Add documentType column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Document' AND column_name = 'documentType') THEN
        ALTER TABLE "Document" ADD COLUMN "documentType" "DocumentType";
    END IF;

    -- Add classificationConfidence column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Document' AND column_name = 'classificationConfidence') THEN
        ALTER TABLE "Document" ADD COLUMN "classificationConfidence" DOUBLE PRECISION;
    END IF;

    -- Add agentProcessed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Document' AND column_name = 'agentProcessed') THEN
        ALTER TABLE "Document" ADD COLUMN "agentProcessed" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add agentProcessedAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Document' AND column_name = 'agentProcessedAt') THEN
        ALTER TABLE "Document" ADD COLUMN "agentProcessedAt" TIMESTAMP(3);
    END IF;
END $$;

-- Update originalName for existing rows to use fileName if null
UPDATE "Document" SET "originalName" = "fileName" WHERE "originalName" IS NULL;

-- Make originalName required (if there are existing rows, they now have a value)
ALTER TABLE "Document" ALTER COLUMN "originalName" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Document_documentType_idx" ON "Document"("documentType");
