# Docker Optimization - Validation Checklist

Use this checklist to verify the optimizations are working correctly.

---

## Pre-Flight Checks

### Environment Verification

- [ ] **Node.js Version**: `node -v` shows v20.x or higher
- [ ] **Yarn Installed**: `yarn --version` shows v1.22.x or higher
- [ ] **Docker Installed**: `docker --version` shows v20.x or higher
- [ ] **Docker Running**: `docker ps` executes without error
- [ ] **Git Repository**: `git status` shows clean or staged changes
- [ ] **SSH Access**: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207 'echo connected'` succeeds

### File Verification

- [ ] **Dockerfile.prod exists**: `ls Dockerfile.prod`
- [ ] **Dockerfile.build exists**: `ls Dockerfile.build`
- [ ] **Build script exists**: `ls scripts/build-for-docker.sh`
- [ ] **Deploy script exists**: `ls scripts/deploy-prebuilt.sh`
- [ ] **Scripts executable**: `ls -l scripts/*.sh` shows `-rwxr-xr-x`

**If not executable, run**:
```bash
chmod +x scripts/build-for-docker.sh scripts/deploy-prebuilt.sh
```

---

## Configuration Validation

### next.config.mjs

- [ ] **Standalone output enabled**:
  ```bash
  grep "output: 'standalone'" next.config.mjs
  ```
  **Expected**: `output: 'standalone',`

- [ ] **Source maps disabled**:
  ```bash
  grep "productionBrowserSourceMaps" next.config.mjs
  ```
  **Expected**: `productionBrowserSourceMaps: false,`

- [ ] **SWC minifier enabled**:
  ```bash
  grep "swcMinify" next.config.mjs
  ```
  **Expected**: `swcMinify: true,`

- [ ] **Parallelism controlled**:
  ```bash
  grep "parallelism" next.config.mjs
  ```
  **Expected**: `config.parallelism = process.env.DOCKER_BUILD === 'true' ? 2 : 4;`

### .dockerignore

- [ ] **Comprehensive exclusions**:
  ```bash
  wc -l .dockerignore
  ```
  **Expected**: 86 lines or more

- [ ] **Test files excluded**:
  ```bash
  grep "test-results" .dockerignore
  ```
  **Expected**: `test-results`

- [ ] **Storybook excluded**:
  ```bash
  grep "storybook-static" .dockerignore
  ```
  **Expected**: `storybook-static`

### package.json

- [ ] **Build script optimized**:
  ```bash
  grep '"build":' package.json
  ```
  **Expected**: `"build": "NODE_OPTIONS='--max-old-space-size=4096' next build",`

---

## Local Build Test (Option A)

### Step 1: Clean Build

```bash
# Clean previous artifacts
rm -rf .next

# Run build script
time ./scripts/build-for-docker.sh
```

**Validation Checkpoints**:

- [ ] **Dependencies installed**: `node_modules` folder exists
- [ ] **Prisma generated**: `node_modules/.prisma/client` exists
- [ ] **Build completes**: No OOM errors
- [ ] **Standalone output**: `.next/standalone` folder exists
- [ ] **Build time**: <10 minutes (expect 3-5 minutes)

**Expected Output**:
```
✓ Clean complete
✓ Dependencies installed
✓ Prisma Client generated
✓ Build complete at: [timestamp]
✓ Standalone build verified
✓ Docker image built
```

### Step 2: Verify Standalone Output

```bash
# Check standalone structure
ls -lh .next/standalone/

# Expected files:
# - server.js (entry point)
# - .next/ (bundled application)
# - package.json
# - node_modules/ (minimal dependencies)
```

**Validation**:

- [ ] **server.js exists**: `ls .next/standalone/server.js`
- [ ] **Minimal node_modules**: `du -sh .next/standalone/node_modules` shows <50MB
- [ ] **Static folder**: `ls .next/static` contains build ID folder

### Step 3: Verify Docker Image

```bash
# Check image was built
docker images astralis-nextjs:latest
```

**Validation**:

- [ ] **Image exists**: Shows in `docker images` output
- [ ] **Image size**: <300MB (expect ~200MB)
- [ ] **Recent timestamp**: Created within last hour

**Expected Output**:
```
REPOSITORY          TAG       SIZE      CREATED
astralis-nextjs     latest    200MB     2 minutes ago
```

### Step 4: Test Image Locally

```bash
# Run container locally
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="test-secret" \
  -e NEXTAUTH_URL="http://localhost:3001" \
  astralis-nextjs:latest
```

**Validation**:

- [ ] **Container starts**: No immediate crashes
- [ ] **Migrations run**: See "Running database migrations..." in logs
- [ ] **Server starts**: See "Starting Next.js server..." in logs
- [ ] **Port listening**: `curl http://localhost:3001/api/health` returns 200

**Expected Logs**:
```
Running database migrations...
Starting Next.js server...
▲ Next.js 15.5.6
- Local:        http://0.0.0.0:3001
✓ Ready in 2.3s
```

### Step 5: Memory Usage Test

```bash
# Check container memory usage
docker stats astralis-nextjs --no-stream
```

**Validation**:

- [ ] **Memory usage**: <300MB (expect 150-250MB)
- [ ] **CPU usage**: <50% after startup

**Expected Output**:
```
CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %
astralis-nextjs     1.5%      180MB / 2GB           9%
```

---

## In-Container Build Test (Option B)

### Step 1: Build with Optimized Dockerfile

```bash
# Build with optimized Dockerfile
time docker build -f Dockerfile.build -t astralis-nextjs:latest .
```

**Validation Checkpoints**:

- [ ] **Stage 1 completes**: Production deps installed
- [ ] **Stage 2 completes**: Build succeeds
- [ ] **Stage 3 completes**: Runtime image created
- [ ] **No OOM errors**: Build doesn't crash
- [ ] **Build time**: <15 minutes (expect 8-12 minutes)

**Expected Output** (abbreviated):
```
[Stage 1/3] Installing production dependencies...
✓ Stage 1 complete (1m 30s)

[Stage 2/3] Building application...
✓ Stage 2 complete (7m 45s)

[Stage 3/3] Creating runtime image...
✓ Stage 3 complete (45s)

Successfully built [image-id]
Successfully tagged astralis-nextjs:latest
```

### Step 2: Verify Multi-Stage Efficiency

```bash
# Check intermediate images were discarded
docker images | grep -E "(astralis|<none>)"
```

**Validation**:

- [ ] **Only final image tagged**: `astralis-nextjs:latest`
- [ ] **No dangling images**: No `<none>` tags (or run `docker image prune`)
- [ ] **Final size**: <300MB

### Step 3: Test Runtime Image

```bash
# Same as Option A Step 4
docker run -p 3001:3001 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="..." \
  astralis-nextjs:latest
```

**Validation**: Same as Option A Step 4 above

---

## Production Deployment Test

### Step 1: Deploy to Server

```bash
# Deploy pre-built image
time ./scripts/deploy-prebuilt.sh -y
```

**Validation Checkpoints**:

- [ ] **Image exported**: `/tmp/astralis-nextjs.tar` created
- [ ] **SSH connection**: Server reachable
- [ ] **Image transferred**: SCP completes
- [ ] **Image loaded**: `docker load` succeeds on server
- [ ] **Containers restarted**: `docker-compose up -d` succeeds
- [ ] **Application responds**: HTTP 200 from health check

**Expected Output**:
```
▶ Verifying Docker image...
✓ Image found
▶ Exporting Docker image to tar file...
✓ Image exported (195MB)
▶ Testing server connection...
✓ Server reachable
▶ Transferring image to server...
✓ Transfer complete
▶ Loading image on server...
✓ Image loaded
▶ Restarting containers...
✓ Containers restarted
▶ Testing application...
✓ Application responding (HTTP 200)
✓ Deployment completed!
```

### Step 2: Verify Production Deployment

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Check containers
docker ps | grep astralis

# Check logs
docker logs astralis-nextjs --tail 50
```

**Validation**:

- [ ] **Container running**: Shows in `docker ps`
- [ ] **Uptime**: >30 seconds
- [ ] **No errors in logs**: No FATAL or ERROR messages
- [ ] **Health check passing**: `/api/health` returns 200

### Step 3: End-to-End Test

```bash
# Test from local machine
curl http://137.184.31.207/api/health
curl http://137.184.31.207/
```

**Validation**:

- [ ] **Health endpoint**: Returns `{"status":"ok"}`
- [ ] **Homepage**: Returns HTML (200 status)
- [ ] **Response time**: <2 seconds

### Step 4: Monitor Performance

```bash
# SSH to server and monitor
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207 'docker stats --no-stream'
```

**Validation**:

- [ ] **Memory usage**: <500MB per container
- [ ] **CPU usage**: <25% average
- [ ] **No restarts**: Restart count = 0

**Expected Output**:
```
CONTAINER           CPU %     MEM USAGE / LIMIT     MEM %
astralis-nextjs     2.5%      220MB / 2GB           11%
astralis-postgres   1.2%      150MB / 2GB           7.5%
```

---

## Rollback Test (Optional)

### Test Rollback Procedure

```bash
# On production server
cd /home/deploy/astralis-nextjs

# Save current image
docker tag astralis-nextjs:latest astralis-nextjs:rollback

# Simulate failed deployment
docker-compose down

# Restore previous image
docker tag astralis-nextjs:rollback astralis-nextjs:latest
docker-compose up -d
```

**Validation**:

- [ ] **Containers restart**: Successfully come back up
- [ ] **Application works**: Health check passes
- [ ] **Data intact**: Database connections work

---

## Performance Benchmarks

### Build Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Local Build Time** | <10 min | _______ | ☐ |
| **Docker Image Build Time** | <5 min | _______ | ☐ |
| **Total Workflow Time** | <15 min | _______ | ☐ |
| **Image Size** | <300MB | _______ | ☐ |
| **Build Success Rate** | 100% | _______ | ☐ |

### Runtime Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Container Memory** | <300MB | _______ | ☐ |
| **Container CPU** | <25% | _______ | ☐ |
| **Health Check Response** | <500ms | _______ | ☐ |
| **Homepage Load Time** | <2s | _______ | ☐ |
| **Uptime After Deployment** | >24h | _______ | ☐ |

### Deployment Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Image Transfer Time** | <5 min | _______ | ☐ |
| **Container Restart Time** | <30s | _______ | ☐ |
| **Total Deployment Time** | <10 min | _______ | ☐ |
| **Deployment Success Rate** | 100% | _______ | ☐ |

---

## Troubleshooting Validation

### Issue: Build script permission denied

**Symptom**:
```
bash: ./scripts/build-for-docker.sh: Permission denied
```

**Fix**:
```bash
chmod +x scripts/build-for-docker.sh scripts/deploy-prebuilt.sh
```

**Validation**: Re-run build script successfully ☐

---

### Issue: Standalone output missing

**Symptom**:
```
✗ Standalone output not found
```

**Check**:
```bash
grep "output: 'standalone'" next.config.mjs
```

**Fix**: Ensure `output: 'standalone'` is in next.config.mjs

**Validation**: `.next/standalone` folder exists after build ☐

---

### Issue: Docker image too large

**Symptom**:
```
astralis-nextjs:latest   1.2GB
```

**Check**:
```bash
# Verify using Dockerfile.prod (not Dockerfile.nextjs)
docker images --filter "reference=astralis-nextjs" --format "{{.Repository}}:{{.Tag}} {{.Size}}"
```

**Fix**: Rebuild with correct Dockerfile
```bash
docker build -f Dockerfile.prod -t astralis-nextjs:latest .
```

**Validation**: Image size <300MB ☐

---

### Issue: Container crashes on startup

**Symptom**:
```
Error: Cannot find module '@prisma/client'
```

**Check**:
```bash
# Verify Prisma files copied in Dockerfile
docker run astralis-nextjs:latest ls -la node_modules/.prisma
```

**Fix**: Ensure Dockerfile.prod copies Prisma client
```dockerfile
COPY node_modules/.prisma ./node_modules/.prisma
```

**Validation**: Container starts without errors ☐

---

### Issue: Deployment fails with SSH timeout

**Symptom**:
```
ssh: connect to host 137.184.31.207 port 22: Operation timed out
```

**Check**:
```bash
# Test SSH connectivity
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207 'echo connected'
```

**Fix**: Verify SSH key and firewall rules

**Validation**: SSH connection succeeds ☐

---

## Final Validation Summary

### Critical Success Criteria

- [ ] **Build completes without OOM**: No memory allocation errors
- [ ] **Image size <300MB**: Optimized standalone output
- [ ] **Build time <10 minutes**: Acceptable performance
- [ ] **Container starts successfully**: No runtime errors
- [ ] **Application responds**: Health check passes
- [ ] **Memory usage <300MB**: Efficient runtime
- [ ] **Deployment succeeds**: Production deployment works

### Sign-Off

**Date**: _______________

**Tested By**: _______________

**Environment**:
- [ ] Local development
- [ ] Production server (137.184.31.207)

**Deployment Method**:
- [ ] Option A: Local build (Dockerfile.prod)
- [ ] Option B: In-container build (Dockerfile.build)

**Results**:
- Build Time: _______ minutes
- Image Size: _______ MB
- Memory Usage: _______ MB
- Deployment Time: _______ minutes

**Status**:
- [ ] PASSED - All checks successful
- [ ] FAILED - See issues below

**Issues** (if any):
_____________________________________________
_____________________________________________
_____________________________________________

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________

---

## Continuous Monitoring

### Daily Checks

```bash
# Check container health
ssh root@137.184.31.207 'docker ps | grep astralis'

# Check memory usage
ssh root@137.184.31.207 'docker stats --no-stream'

# Check logs for errors
ssh root@137.184.31.207 'docker logs astralis-nextjs --since 24h | grep ERROR'
```

### Weekly Checks

```bash
# Update base image
docker pull node:20-alpine

# Rebuild image
./scripts/build-for-docker.sh

# Redeploy
./scripts/deploy-prebuilt.sh -y
```

---

**Next Steps**: After validation passes, update `README.md` and team documentation with new deployment workflow.
