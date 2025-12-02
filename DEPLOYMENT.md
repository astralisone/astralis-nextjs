# Deployment Guide - Astralis One

Complete deployment guide for the Astralis One multi-app platform using Docker and Caddy.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Caddy Reverse Proxy                       │
│                   (Automatic HTTPS/TLS)                      │
└─────────────────────────────────────────────────────────────┘
         │                    │                   │
         ▼                    ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Marketing  │    │   Platform   │    │     n8n      │
│   (Static)   │    │   (Next.js)  │    │ (Automation) │
│   :80        │    │   :3001      │    │   :5678      │
└──────────────┘    └──────────────┘    └──────────────┘
                            │                    │
                            ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │  PostgreSQL  │    │    Redis     │
                    │   :5432      │    │   :6379      │
                    └──────────────┘    └──────────────┘
```

## Services

| Service    | Container Name      | External Port | Internal Port | URL                          |
|------------|---------------------|---------------|---------------|------------------------------|
| Caddy      | astralis_caddy      | 80, 443       | -             | All domains                  |
| Platform   | astralis_platform   | 3001          | 3001          | app.astralisone.com          |
| Marketing  | astralis_marketing  | 3000          | 80            | www.astralisone.com          |
| Worker     | astralis_worker     | -             | -             | Background jobs              |
| PostgreSQL | astralis_postgres   | 5432          | 5432          | Internal only                |
| Redis      | astralis_redis      | 6379          | 6379          | Internal only                |
| n8n        | astralis_n8n        | 5678          | 5678          | automation.astralisone.com   |

## Prerequisites

### Server Requirements
- Ubuntu 22.04 LTS
- 4GB RAM minimum (8GB recommended)
- 50GB disk space
- Docker & Docker Compose installed

### DNS Configuration
Before deployment, configure these DNS A records:

```
astralisone.com         → 137.184.31.207
www.astralisone.com     → 137.184.31.207
app.astralisone.com     → 137.184.31.207
automation.astralisone.com → 137.184.31.207
```

### Required Secrets

Create `.env.production` file with these variables:

```bash
# Database
DATABASE_URL="postgresql://astralis:STRONG_PASSWORD@postgres:5432/astralis_one"
POSTGRES_USER="astralis"
POSTGRES_PASSWORD="STRONG_PASSWORD"
POSTGRES_DB="astralis_one"

# Authentication
NEXTAUTH_URL="https://app.astralisone.com"
NEXTAUTH_SECRET="GENERATE_WITH_openssl_rand_-base64_32"

# Redis
REDIS_URL="redis://redis:6379"

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Email/SMTP
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG...."
SMTP_FROM_EMAIL="support@astralisone.com"

# n8n
N8N_HOST="automation.astralisone.com"
N8N_ENCRYPTION_KEY="GENERATE_WITH_openssl_rand_-hex_32"

# DigitalOcean Spaces
SPACES_ACCESS_KEY="DO..."
SPACES_SECRET_KEY="..."
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_BUCKET="astralis-documents"

# Monitoring
ACME_EMAIL="admin@astralisone.com"
```

## Initial Server Setup

### 1. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 3. Setup Project Directory

```bash
# Create deployment directory
sudo mkdir -p /home/deploy
sudo chown $USER:$USER /home/deploy
cd /home/deploy

# Clone repository
git clone https://github.com/yourusername/astralis-nextjs.git
cd astralis-nextjs

# Copy environment template
cp .env.local.template .env.production

# Edit environment variables
nano .env.production  # Add all production secrets
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

Use the deployment script for zero-downtime deployments:

```bash
# From local machine
./scripts/deploy-docker.sh production
```

The script will:
1. Run pre-deployment checks
2. Test Docker builds locally
3. Create database backup
4. Pull latest code on server
5. Build Docker images
6. Run database migrations
7. Stop old containers
8. Start new containers
9. Run health checks
10. Clean up old images

### Method 2: Manual Deployment

#### Initial Deployment

```bash
# SSH into server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Navigate to project
cd /home/deploy/astralis-nextjs

# Build and start services
docker compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker compose -f docker-compose.prod.yml exec platform sh -c "npx prisma migrate deploy"

# Start Caddy (separate compose file)
docker compose -f docker-compose.caddy.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.caddy.yml ps
```

#### Subsequent Deployments

```bash
# Pull latest code
git pull origin prod

# Rebuild and restart services
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Run migrations
docker compose -f docker-compose.prod.yml exec platform sh -c "npx prisma migrate deploy"

# Check logs
docker compose -f docker-compose.prod.yml logs -f platform
```

### Method 3: CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow for automated deployments.

#### Setup GitHub Secrets

In your repository settings, add these secrets:

```
DIGITALOCEAN_TOKEN       # DigitalOcean API token
SSH_PRIVATE_KEY          # SSH key for server access
SERVER_USER              # root
SERVER_HOST              # 137.184.31.207
```

#### Trigger Deployment

Push to `main` or `prod` branch:

```bash
git push origin prod
```

Or manually trigger via GitHub Actions UI.

## Database Management

### Backup Database

```bash
# Create backup
docker exec astralis_postgres pg_dump -U astralis astralis_one > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip backup_*.sql
```

### Restore Database

```bash
# Restore from backup
gunzip -c backup_20231201_120000.sql.gz | docker exec -i astralis_postgres psql -U astralis astralis_one
```

### Run Migrations

```bash
# Apply migrations
docker compose -f docker-compose.prod.yml exec platform sh -c "npx prisma migrate deploy"

# Generate Prisma client (if needed)
docker compose -f docker-compose.prod.yml exec platform sh -c "npx prisma generate"
```

## Monitoring & Logs

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f platform

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 platform

# Caddy logs
docker compose -f docker-compose.caddy.yml logs -f caddy
```

### Check Container Status

```bash
# Container list
docker compose -f docker-compose.prod.yml ps

# Container stats (CPU/Memory)
docker stats

# Health checks
docker inspect --format='{{.State.Health.Status}}' astralis_platform
```

### Access Container Shell

```bash
# Platform container
docker exec -it astralis_platform sh

# PostgreSQL container
docker exec -it astralis_postgres psql -U astralis astralis_one

# Redis container
docker exec -it astralis_redis redis-cli
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs platform

# Inspect container
docker inspect astralis_platform

# Remove and recreate
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker exec astralis_postgres pg_isready -U astralis

# Check network
docker network inspect astralis-network

# Verify DATABASE_URL in .env.production
```

### SSL Certificate Issues

```bash
# Check Caddy logs
docker compose -f docker-compose.caddy.yml logs caddy

# Verify DNS records
dig app.astralisone.com

# Restart Caddy
docker compose -f docker-compose.caddy.yml restart caddy
```

### Out of Memory Errors

```bash
# Increase Docker memory limit in /etc/docker/daemon.json
{
  "default-ulimits": {
    "memlock": {
      "Hard": -1,
      "Name": "memlock",
      "Soft": -1
    }
  }
}

# Restart Docker
sudo systemctl restart docker
```

## Rollback Procedure

### Emergency Rollback

```bash
# 1. SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
cd /home/deploy/astralis-nextjs

# 2. Checkout previous commit
git log --oneline  # Find commit hash
git checkout <previous-commit-hash>

# 3. Restore database
gunzip -c /home/deploy/backups/astralis_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i astralis_postgres psql -U astralis astralis_one

# 4. Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# 5. Verify
curl -f https://app.astralisone.com/api/health
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env.production` to git
- Use strong, unique passwords (32+ characters)
- Rotate secrets quarterly

### 2. Database Security
- Use strong PostgreSQL password
- Restrict network access to internal only
- Enable SSL for database connections (future)

### 3. Container Security
- Run containers as non-root users
- Use official images from trusted sources
- Keep images updated regularly

### 4. Network Security
- Use UFW firewall
- Enable fail2ban for SSH protection
- Use HTTPS only (enforced by Caddy)

### 5. Backup Strategy
- Automated daily backups
- Keep 7 days of backups on server
- Weekly backups to DigitalOcean Spaces

## Performance Optimization

### Docker Optimizations

```bash
# Clean up unused resources
docker system prune -a --volumes -f

# Limit container memory
# Add to docker-compose.prod.yml:
services:
  platform:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### Database Optimizations

```sql
-- Run in PostgreSQL
-- Create indexes for frequently queried fields
CREATE INDEX idx_users_email ON "User"(email);
CREATE INDEX idx_organizations_slug ON "Organization"(slug);

-- Analyze tables
ANALYZE;
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor logs for errors
- Check container health status
- Verify backup creation

**Weekly:**
- Review disk space usage
- Update Docker images
- Security patches

**Monthly:**
- Rotate secrets
- Review SSL certificates
- Performance audit

### Update Docker Images

```bash
# Pull latest base images
docker compose -f docker-compose.prod.yml pull

# Rebuild with latest base
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

## Support & Resources

- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues
- **Logs**: `/var/log/caddy/`, Docker logs
- **Backups**: `/home/deploy/backups/`

---

**Last Updated**: 2025-12-02
**Deployment Version**: 1.0.0
