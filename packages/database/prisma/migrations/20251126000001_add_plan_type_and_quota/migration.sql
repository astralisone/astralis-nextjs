-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "organization" ADD COLUMN "plan" "PlanType" NOT NULL DEFAULT 'FREE';
ALTER TABLE "organization" ADD COLUMN "quotaResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "organization_plan_idx" ON "organization"("plan");
