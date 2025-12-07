# Archived Documentation - DigitalOcean Era

This directory contains documentation from when Astralis One was deployed on DigitalOcean infrastructure with Caddy reverse proxy.

## Archived Date: December 2024

## Why Archived

The platform was migrated from a self-managed DigitalOcean Droplet to a serverless architecture:

### Old Architecture (DigitalOcean)
- **Hosting**: DigitalOcean Droplet (137.184.31.207)
- **Reverse Proxy**: Caddy with automatic HTTPS
- **Process Manager**: PM2 for Node.js processes
- **Database**: PostgreSQL on Droplet
- **Redis**: Local Redis server
- **Workers**: Local BullMQ workers via PM2

### New Architecture (Vercel + Fly.io)
- **Hosting**: Vercel (Next.js app and API routes)
- **Workers**: Fly.io (background job processing)
- **Database**: Prisma Postgres (db.prisma.io) - managed PostgreSQL
- **Redis**: Upstash Redis - managed Redis for BullMQ
- **File Storage**: Vercel Blob - serverless object storage

## Files in this Archive

- `CADDY_ARCHITECTURE.md` - Caddy reverse proxy configuration patterns
- `CADDY_QUICK_REFERENCE.md` - Quick commands for Caddy management
- `CADDY_SETUP.md` - Complete Caddy installation and setup guide
- `PHASE6_DEPLOYMENT.md` - Phase 6 deployment to DigitalOcean
- `PHASE_4_DEPLOYMENT.md` - Phase 4 deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-migration deployment checklist

## Restoration Notes

If you need to restore DigitalOcean deployment:

1. The Droplet may still exist at 137.184.31.207
2. SSH access: `ssh root@137.184.31.207`
3. Application was in `/home/deploy/astralis-nextjs`
4. Caddy config was at `/etc/caddy/Caddyfile`
5. PM2 ecosystem file: `ecosystem.config.js`

## See Current Documentation

For current deployment documentation, see:
- `../DEPLOYMENT.md` - Current Vercel + Fly.io deployment guide
- `../../README.md` - Main project README with architecture overview
- `../../CLAUDE.md` - Development guidelines and commands
