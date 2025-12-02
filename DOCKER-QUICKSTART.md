# Docker Quick Start Guide

Quick reference for Docker deployment of Astralis One.

## Quick Commands

### Local Development (Docker)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild specific service
docker compose up -d --build platform
```

### Production Deployment

```bash
# Deploy from local machine
./scripts/deploy-docker.sh production

# Or manually on server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
cd /home/deploy/astralis-nextjs
docker compose -f docker-compose.prod.yml up -d --build
```

### Check Status

```bash
# Container status
docker compose -f docker-compose.prod.yml ps

# Health checks
docker inspect --format='{{.State.Health.Status}}' astralis_platform

# Resource usage
docker stats
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Platform only
docker compose -f docker-compose.prod.yml logs -f platform

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Database Operations

```bash
# Backup
docker exec astralis_postgres pg_dump -U astralis astralis_one > backup.sql

# Restore
cat backup.sql | docker exec -i astralis_postgres psql -U astralis astralis_one

# Run migrations
docker compose -f docker-compose.prod.yml exec platform sh -c "npx prisma migrate deploy"

# Access PostgreSQL shell
docker exec -it astralis_postgres psql -U astralis astralis_one
```

### Debugging

```bash
# Access container shell
docker exec -it astralis_platform sh

# Check container logs for errors
docker logs astralis_platform --tail 50

# Inspect container
docker inspect astralis_platform

# Check network
docker network inspect astralis-network
```

### Cleanup

```bash
# Remove stopped containers
docker compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: deletes data!)
docker compose -f docker-compose.prod.yml down -v

# Clean up old images
docker image prune -f

# Full cleanup (WARNING: removes everything!)
docker system prune -a --volumes -f
```

## Service URLs

| Service | Local | Production |
|---------|-------|------------|
| Platform | http://localhost:3001 | https://app.astralisone.com |
| Marketing | http://localhost:3000 | https://www.astralisone.com |
| n8n | http://localhost:5678 | https://automation.astralisone.com |
| PostgreSQL | localhost:5432 | Internal only |
| Redis | localhost:6379 | Internal only |

## Environment Variables

Key environment variables for `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://astralis:PASSWORD@postgres:5432/astralis_one"
POSTGRES_PASSWORD="STRONG_PASSWORD"

# Auth
NEXTAUTH_URL="https://app.astralisone.com"
NEXTAUTH_SECRET="RANDOM_32_CHAR_STRING"

# Redis
REDIS_URL="redis://redis:6379"

# AI
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

Generate secrets:
```bash
# NEXTAUTH_SECRET (32 characters)
openssl rand -base64 32

# N8N_ENCRYPTION_KEY (64 hex characters)
openssl rand -hex 32
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs astralis_platform

# Remove and recreate
docker compose -f docker-compose.prod.yml up -d --force-recreate platform
```

### Database connection error
```bash
# Test connection
docker exec astralis_postgres pg_isready -U astralis

# Check DATABASE_URL in .env.production
cat .env.production | grep DATABASE_URL
```

### Out of memory
```bash
# Check memory usage
docker stats

# Increase swap space or upgrade server
```

### Port already in use
```bash
# Find process using port
sudo lsof -i :3001

# Kill process or change port in docker-compose
```

## Build Information

**Dockerfiles:**
- `/apps/platform/Dockerfile` - Next.js SSR platform (multi-stage build)
- `/apps/marketing/Dockerfile` - Static marketing site (Nginx)

**Compose Files:**
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production
- `docker-compose.caddy.yml` - Caddy reverse proxy

**Key Features:**
- Multi-stage builds for minimal image size
- Health checks for all services
- Named volumes for data persistence
- Bridge network for service communication
- Non-root users for security

## Next Steps

1. Read full deployment guide: `DEPLOYMENT.md`
2. Configure DNS records for your domain
3. Set up environment variables
4. Run initial deployment
5. Configure Caddy for HTTPS
6. Set up monitoring and backups

---

For detailed documentation, see `DEPLOYMENT.md`
