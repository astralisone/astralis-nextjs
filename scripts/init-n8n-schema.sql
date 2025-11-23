-- ============================================================================
-- N8N Database Schema Initialization Script
-- ============================================================================
-- Purpose: Create dedicated n8n schema in shared PostgreSQL database
-- Usage: Run after PostgreSQL container is initialized
-- Docker: docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql
-- ============================================================================

-- Create n8n schema for workflow storage
-- This keeps n8n tables separate from application tables
CREATE SCHEMA IF NOT EXISTS n8n;

-- Grant full permissions to application user
GRANT ALL ON SCHEMA n8n TO astralis;
GRANT ALL ON ALL TABLES IN SCHEMA n8n TO astralis;
GRANT ALL ON ALL SEQUENCES IN SCHEMA n8n TO astralis;

-- Set default privileges for future tables created in n8n schema
-- This ensures n8n can create and manage its own tables
ALTER DEFAULT PRIVILEGES IN SCHEMA n8n
  GRANT ALL ON TABLES TO astralis;

ALTER DEFAULT PRIVILEGES IN SCHEMA n8n
  GRANT ALL ON SEQUENCES TO astralis;

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'N8N schema initialized successfully';
  RAISE NOTICE 'Schema: n8n';
  RAISE NOTICE 'User: astralis';
  RAISE NOTICE 'Database: astralis_one';
  RAISE NOTICE '================================================';
END
$$;

-- Verify schema creation
SELECT
  schema_name,
  schema_owner
FROM information_schema.schemata
WHERE schema_name = 'n8n';
