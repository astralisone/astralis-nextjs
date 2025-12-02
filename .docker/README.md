# Docker Deployment - Astralis One

This directory contains Docker configuration files for deploying the Astralis One platform.

## Quick Start

### Development
```bash
docker compose up -d
```

### Production
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.caddy.yml up -d
```

## Documentation

- **Quick Reference**: `/DOCKER-QUICKSTART.md`
- **Full Guide**: `/DEPLOYMENT.md`

## File Structure

```
/
├── apps/
│   ├── platform/
│   │   └── Dockerfile              # Platform app (Next.js SSR)
│   └── marketing/
│       ├── Dockerfile              # Marketing site (Static)
│       └── nginx.conf              # Nginx config for marketing
├── docker-compose.yml              # Development compose
├── docker-compose.prod.yml         # Production compose
├── docker-compose.caddy.yml        # Caddy reverse proxy
├── Caddyfile                       # Caddy configuration
├── .dockerignore                   # Docker ignore rules
├── .github/
│   └── workflows/
│       └── deploy-production.yml   # GitHub Actions CI/CD
└── scripts/
    └── deploy-docker.sh            # Automated deployment script
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| platform | 3001 | Next.js platform app |
| marketing | 3000 | Static marketing site |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache/queue |
| worker | - | Background worker |
| n8n | 5678 | Workflow automation |
| caddy | 80, 443 | Reverse proxy |

## Environment Setup

1. Copy environment template:
   ```bash
   cp .env.local.template .env.production
   ```

2. Generate secrets:
   ```bash
   # NEXTAUTH_SECRET
   openssl rand -base64 32

   # N8N_ENCRYPTION_KEY
   openssl rand -hex 32
   ```

3. Update `.env.production` with production values

## Deployment

See `DEPLOYMENT.md` for complete deployment instructions.

### Quick Deploy
```bash
./scripts/deploy-docker.sh production
```

### Manual Deploy
```bash
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
cd /home/deploy/astralis-nextjs
git pull origin prod
docker compose -f docker-compose.prod.yml up -d --build
```

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check status
docker compose -f docker-compose.prod.yml ps

# Restart service
docker compose -f docker-compose.prod.yml restart platform

# Database backup
docker exec astralis_postgres pg_dump -U astralis astralis_one > backup.sql

# Run migrations
docker compose -f docker-compose.prod.yml exec platform sh -c "npx prisma migrate deploy"

# Access shell
docker exec -it astralis_platform sh
```

## Troubleshooting

See `DOCKER-QUICKSTART.md` for troubleshooting guide.

### Quick Fixes

**Container won't start:**
```bash
docker logs astralis_platform
docker compose -f docker-compose.prod.yml up -d --force-recreate platform
```

**Database connection error:**
```bash
docker exec astralis_postgres pg_isready -U astralis
```

**Check health:**
```bash
curl http://localhost:3001/api/health
```

## Support

- Issues: GitHub Issues
- Documentation: `/docs`
- Logs: `docker compose logs`

---

**Last Updated**: 2025-12-02
