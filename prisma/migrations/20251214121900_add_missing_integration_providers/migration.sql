-- Add missing integration providers to IntegrationProvider enum
-- These providers were added to the schema but never migrated to the database

ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'SHOPIFY';
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'GOOGLE_DOCS';
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'FACEBOOK';
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'BAMBOOHR';
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'GITHUB';