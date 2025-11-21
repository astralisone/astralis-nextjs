# AstralisOps Scripts Directory

This directory contains utility scripts for development, deployment, and maintenance.

## Available Scripts

### Phase 6: n8n Automation Setup

#### `setup-phase6.sh`
Automated setup script for n8n workflow automation engine.

**Purpose**: Complete Phase 6 setup including Docker, database, and n8n configuration

**Usage**:
```bash
chmod +x scripts/setup-phase6.sh
./scripts/setup-phase6.sh
```

**What it does**:
- Verifies prerequisites (Docker, .env.local)
- Generates N8N encryption key (if missing)
- Generates internal API key (if missing)
- Pulls n8n Docker image
- Initializes PostgreSQL n8n schema
- Starts n8n container
- Performs health checks
- Displays access credentials and next steps

**Requirements**:
- Docker and Docker Compose installed
- `.env.local` file exists
- PostgreSQL container running (or will start with docker-compose)

**Output**: Setup status, n8n editor URL, credentials, next steps

---

#### `init-n8n-schema.sql`
PostgreSQL initialization script for n8n database schema.

**Purpose**: Create dedicated n8n schema in shared PostgreSQL database

**Usage**:
```bash
# Automatic (via setup-phase6.sh)
./scripts/setup-phase6.sh

# Manual execution
docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql
```

**What it does**:
- Creates `n8n` schema
- Grants permissions to application user
- Sets default privileges for future tables
- Creates UUID extension if needed
- Verifies schema creation

**Requirements**:
- PostgreSQL container running
- Database `astralis_one` exists
- User `astralis` has necessary permissions

**Idempotent**: Safe to run multiple times (uses `IF NOT EXISTS`)

---

### Development & Testing

#### `create-test-user.js`
Creates test user account for development.

**Usage**:
```bash
node scripts/create-test-user.js
```

---

#### `test-password.js`
Tests password hashing and verification.

**Usage**:
```bash
node scripts/test-password.js
```

---

#### `fix-test-user-orgid.ts`
Fixes organization ID for test users.

**Usage**:
```bash
npx tsx scripts/fix-test-user-orgid.ts
```

---

#### `verify-session-fix.ts`
Verifies NextAuth session configuration.

**Usage**:
```bash
npx tsx scripts/verify-session-fix.ts
```

---

#### `update-openai-key.sh`
Updates OpenAI API key in environment files.

**Usage**:
```bash
./scripts/update-openai-key.sh YOUR_NEW_API_KEY
```

---

## Common Use Cases

### Initial Project Setup

```bash
# 1. Setup environment
cp .env.local.template .env.local
# Edit .env.local with your values

# 2. Setup Phase 6 (n8n automation)
./scripts/setup-phase6.sh

# 3. Run database migrations
npx prisma migrate dev

# 4. Create test user (optional)
node scripts/create-test-user.js
```

### Troubleshooting n8n

```bash
# Reinitialize n8n schema
docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql

# Restart n8n
docker-compose restart n8n

# Check n8n logs
docker logs -f astralis_n8n
```

### Production Deployment

```bash
# On server (SSH to 137.184.31.207)
cd /home/deploy/astralis-nextjs

# Pull latest changes
git pull origin main

# Run Phase 6 setup
./scripts/setup-phase6.sh

# Verify health
curl http://localhost:5678/healthz
```

---

## Creating New Scripts

### Naming Convention

- Use kebab-case: `script-name.sh` or `script-name.ts`
- Prefix with purpose: `setup-`, `test-`, `fix-`, `update-`
- Use appropriate extension: `.sh` (bash), `.ts` (TypeScript), `.js` (Node.js)

### Bash Script Template

```bash
#!/bin/bash
set -e  # Exit on error

# Script description
# Usage: ./scripts/script-name.sh [args]

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main logic here
print_info "Starting script..."

# Your code here

print_success "Script completed!"
```

### TypeScript Script Template

```typescript
#!/usr/bin/env node
/**
 * Script description
 * Usage: npx tsx scripts/script-name.ts [args]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting script...');

  // Your code here

  console.log('Script completed!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Best Practices

1. **Make executable**: `chmod +x scripts/script-name.sh`
2. **Add shebang**: `#!/bin/bash` or `#!/usr/bin/env node`
3. **Error handling**: Use `set -e` in bash, try/catch in TypeScript
4. **Documentation**: Add comments explaining purpose and usage
5. **Idempotent**: Safe to run multiple times
6. **Logging**: Use colored output for clarity
7. **Validation**: Check prerequisites before running
8. **Exit codes**: Return 0 on success, non-zero on error

---

## Environment Variables

Scripts that need environment variables should:

1. Source from `.env.local`:
   ```bash
   export $(grep -v '^#' .env.local | xargs)
   ```

2. Validate required variables:
   ```bash
   if [ -z "$REQUIRED_VAR" ]; then
     print_error "REQUIRED_VAR not set in .env.local"
     exit 1
   fi
   ```

3. Use defaults when appropriate:
   ```bash
   PORT=${PORT:-3001}
   ```

---

## Troubleshooting Scripts

### Permission Denied

```bash
chmod +x scripts/script-name.sh
```

### Command Not Found

```bash
# Install Node.js dependencies
npm install

# Install tsx for TypeScript execution
npm install -D tsx
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check DATABASE_URL in .env.local
grep DATABASE_URL .env.local

# Test connection
docker exec astralis_postgres psql -U astralis -d astralis_one -c "SELECT 1;"
```

---

## Maintenance

### Regular Tasks

- Review and update outdated scripts
- Add new scripts for common maintenance tasks
- Update this README when adding new scripts
- Test scripts in development before production use
- Keep scripts version controlled

### Deprecation

When deprecating a script:
1. Add `DEPRECATED` to filename: `script-name.DEPRECATED.sh`
2. Add deprecation notice at top of file
3. Update this README
4. Remove after 2 release cycles

---

**Last Updated**: November 2024
**Directory**: `/Users/gregorystarr/projects/astralis-nextjs/scripts/`
