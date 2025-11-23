/*
  Warnings:

  - The values [IN_PROGRESS,CANCELLED] on the enum `IntakeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "IntakeStatus_new" AS ENUM ('NEW', 'ROUTING', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'REJECTED');
ALTER TABLE "intakeRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "intakeRequest" ALTER COLUMN "status" TYPE "IntakeStatus_new" USING ("status"::text::"IntakeStatus_new");
ALTER TYPE "IntakeStatus" RENAME TO "IntakeStatus_old";
ALTER TYPE "IntakeStatus_new" RENAME TO "IntakeStatus";
DROP TYPE "IntakeStatus_old";
ALTER TABLE "intakeRequest" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "pipelineItem" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "data" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pipelineStage" ADD COLUMN     "color" TEXT;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "cdnUrl" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedById" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "ocrText" TEXT,
    "ocrConfidence" DOUBLE PRECISION,
    "extractedData" JSONB,
    "processingError" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_orgId_idx" ON "Document"("orgId");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE INDEX "Document_mimeType_idx" ON "Document"("mimeType");

-- CreateIndex
CREATE INDEX "pipelineItem_assignedToId_idx" ON "pipelineItem"("assignedToId");

-- CreateIndex
CREATE INDEX "pipelineItem_priority_idx" ON "pipelineItem"("priority");

-- CreateIndex
CREATE INDEX "pipelineItem_status_idx" ON "pipelineItem"("status");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
