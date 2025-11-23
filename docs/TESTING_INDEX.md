# Astralis One - Testing Documentation Index

**Last Updated**: 2025-11-20  
**Project**: AstralisOps - AI Operations Automation Platform

---

## Overview

This index provides quick access to all testing documentation for the Astralis One project.

---

## Test Documentation by Phase

### Phase 1: Authentication & RBAC

**Status**: Complete  
**Documentation**: See QA Agent instructions in `.claude/agents/qa.md`

**Key Test Areas**:
- User Registration & Email Verification
- Sign-In (Credentials + OAuth)
- Password Reset Flow
- RBAC (ADMIN, OPERATOR, CLIENT roles)
- Session Management
- Activity Logging
- Protected Routes

**Test Cases**: 15 critical test cases documented in QA agent

---

### Phase 4: Document Processing & OCR

**Status**: Test Plan Ready  
**Documentation**:
- **Comprehensive Plan**: `/docs/PHASE_4_TEST_PLAN.md` (1,739 lines, 49KB)
- **Quick Reference**: `/docs/PHASE_4_TEST_SUMMARY.md` (9.3KB)

**Test Coverage**:
| Category | Test Count | Files |
|----------|------------|-------|
| Unit Tests | 30+ | `src/lib/services/__tests__/`, `src/lib/utils/__tests__/` |
| Integration Tests | 10+ | `tests/integration/` |
| API Tests | 20+ | `tests/api/` |
| UI Tests | 15+ | `tests/ui/` |
| Performance Tests | 6 | `tests/performance/` |
| Security Tests | 15+ | `tests/security/` |
| **Total** | **~100 tests** | |

**Key Test Areas**:
1. Spaces Service (DigitalOcean Spaces S3-compatible storage)
2. File Validation (type, size, MIME detection)
3. OCR Service (Tesseract.js for images, pdf-parse for PDFs)
4. Document Service (CRUD operations)
5. API Endpoints (upload, list, detail, delete, download)
6. UI Components (drag-and-drop uploader, document queue, viewer)
7. Performance (concurrent uploads, OCR throughput, CDN caching)
8. Security (access control, MIME spoofing, malicious files)

---

## Quick Access Links

### Test Plans

- [Phase 4 Complete Test Plan](/Users/gregorystarr/projects/astralis-nextjs/docs/PHASE_4_TEST_PLAN.md)
- [Phase 4 Test Summary](/Users/gregorystarr/projects/astralis-nextjs/docs/PHASE_4_TEST_SUMMARY.md)
- [QA Agent Instructions](/Users/gregorystarr/projects/astralis-nextjs/.claude/agents/qa.md)

### Phase Specifications

- [Phase 1: Authentication & RBAC](/Users/gregorystarr/projects/astralis-nextjs/docs/phases/phase-1-authentication-rbac.md)
- [Phase 4: Document Processing](/Users/gregorystarr/projects/astralis-nextjs/docs/phases/phase-4-document-processing-ocr.md)

### Code Locations

```
src/
├── lib/
│   ├── services/
│   │   ├── __tests__/              # Unit tests for services
│   │   ├── spaces.service.ts       # DigitalOcean Spaces integration
│   │   ├── ocr.service.ts          # OCR processing
│   │   └── document.service.ts     # Document management
│   └── utils/
│       ├── __tests__/              # Utility unit tests
│       └── file-validation.ts      # File validation logic

tests/
├── integration/                    # End-to-end flow tests
├── api/                           # API endpoint tests
├── ui/                            # UI component tests
├── performance/                   # Load and stress tests
├── security/                      # Security validation tests
├── fixtures/                      # Test data and mock files
└── mocks/                         # Mock services and utilities
```

---

## Test Execution Commands

### Run All Tests
```bash
npm test
```

### Run by Category
```bash
npm test -- --testPathPattern=__tests__         # Unit tests
npm test -- --testPathPattern=integration       # Integration tests
npm test -- --testPathPattern=api              # API tests
npm test -- --testPathPattern=ui               # UI tests
npm test -- --testPathPattern=performance      # Performance tests
npm test -- --testPathPattern=security         # Security tests
```

### Run with Coverage
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

---

## Test Priorities

### P0 - Critical (Must Pass Before Deployment)

**Phase 1 (Authentication)**:
- TC-AUTH-001: User Registration
- TC-AUTH-003: Sign-In with Credentials
- TC-RBAC-001: ADMIN Access
- TC-SECURITY-001: Organization Data Isolation

**Phase 4 (Document Processing)**:
- TC-UNIT-001: Spaces upload success
- TC-UNIT-101: File validation - valid files accepted
- TC-UNIT-102: File size limits enforced
- TC-INT-001: Complete upload flow
- TC-API-001: POST /api/documents/upload - success
- TC-SEC-001: Cross-org access prevention
- TC-SEC-103: MIME type spoofing detection

### P1 - High Priority
- All remaining unit tests
- All API endpoint tests
- Core UI component tests
- Organization isolation tests
- RBAC enforcement tests

### P2 - Medium Priority
- Performance benchmarks
- Edge case handling
- Error recovery tests
- UI accessibility tests

---

## Coverage Targets

| Component | Target | Actual |
|-----------|--------|--------|
| Services | 90% | TBD |
| Utilities | 85% | TBD |
| API Routes | 100% | TBD |
| UI Components | 80% | TBD |
| **Overall** | **80%** | **TBD** |

---

## CI/CD Integration

### GitHub Actions Workflows

**File**: `.github/workflows/test.yml`

**Jobs**:
1. **unit-tests**: Run all unit tests with coverage
2. **integration-tests**: Run integration tests with live DB
3. **api-tests**: Test all API endpoints
4. **ui-tests**: Component and E2E UI tests
5. **security-tests**: Security validation suite

**Triggers**:
- Push to any branch
- Pull request creation/update
- Nightly scheduled run

---

## Test Data & Fixtures

### Required Test Files

```
tests/fixtures/
├── images/
│   ├── invoice-clear.png        # 500KB, clear OCR (confidence > 0.9)
│   ├── receipt-blurry.jpg       # 300KB, lower quality (confidence 0.5-0.8)
│   └── blank.png                # 10KB, no text
├── pdfs/
│   ├── sample-document.pdf      # 200KB, text-based PDF
│   └── scanned-form.pdf         # 2MB, image-based PDF (requires OCR)
├── invalid/
│   ├── malware.exe              # 50KB, should be rejected
│   ├── large-file.pdf           # 51MB, exceeds limit
│   ├── tiny-file.txt            # 100 bytes, below minimum
│   └── corrupted.png            # 50KB, corrupted header
└── office/
    └── sample.docx              # 50KB, Word document
```

### Database Fixtures

- Test organizations (org-a, org-b)
- Test users (admin, operator, client roles)
- Test documents (various statuses)
- Test sessions and activity logs

---

## Environment Setup

### Test Environment Variables

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/astralis_test
REDIS_URL=redis://localhost:6379/1

# Test Spaces bucket
SPACES_ACCESS_KEY=test-key
SPACES_SECRET_KEY=test-secret
SPACES_BUCKET=astralis-test-documents

# File limits
MAX_FILE_SIZE=52428800  # 50MB
```

### Database Setup

```bash
# Create test database
createdb astralis_test

# Run migrations
DATABASE_URL=postgresql://test:test@localhost:5432/astralis_test npx prisma migrate deploy

# Seed test data
npm run test:seed
```

---

## Performance Benchmarks

### Phase 4 Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Upload time (p95) | < 5 seconds | Load test with 10 concurrent users |
| OCR processing | < 10 seconds/doc | Average processing time |
| Database queries | < 100ms | List documents query |
| CDN cache hit rate | > 90% | After initial warming |
| Concurrent upload capacity | 50+ users | Stress test breaking point |

---

## Security Testing

### Critical Security Tests

1. **Authentication & Authorization**
   - Unauthenticated access blocked
   - Cross-organization data isolation
   - Role-based access control enforcement

2. **File Upload Security**
   - Malicious file rejection (.exe, scripts)
   - MIME type spoofing detection
   - File size limits enforced
   - Path traversal prevention
   - XSS payload sanitization

3. **API Security**
   - SQL injection prevention
   - CORS configuration
   - Input validation
   - Rate limiting

---

## Troubleshooting

### Common Test Failures

**Issue**: "Spaces credentials not configured"  
**Fix**: Set environment variables in `.env.test`

**Issue**: OCR tests timeout  
**Fix**: Increase timeout to 30 seconds for OCR operations

**Issue**: Integration tests fail - database connection  
**Fix**: Ensure test database running and migrations applied

**Issue**: UI tests - element not found  
**Fix**: Add `waitFor()` for async operations

---

## Future Phases

### Phase 2: Dashboard UI & Pipelines
- TBD: Dashboard component tests
- TBD: Kanban board interaction tests
- TBD: Pipeline CRUD tests

### Phase 3: AI Routing & Background Jobs
- TBD: AI routing accuracy tests
- TBD: BullMQ job processing tests
- TBD: Email notification tests

### Phase 5: Scheduling & Calendar
- TBD: Calendar integration tests
- TBD: Conflict detection tests
- TBD: Event CRUD tests

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/ladjs/supertest)
- [Playwright](https://playwright.dev/)

### Internal Docs
- [CLAUDE.md](/Users/gregorystarr/projects/astralis-nextjs/CLAUDE.md) - Project overview
- [Multi-Agent System](/Users/gregorystarr/projects/astralis-nextjs/docs/MULTI_AGENT_SYSTEM.md)
- [Phase Progress](/Users/gregorystarr/projects/astralis-nextjs/docs/phases/PROGRESS.md)

---

## Contact & Support

**QA Agent**: Responsible for test strategy, test cases, and quality assurance  
**Location**: `.claude/agents/qa.md`

**Test Issues**: Create GitHub issue with label `testing`  
**Coverage Reports**: Available in CI/CD artifacts and Codecov

---

**End of Testing Index**
