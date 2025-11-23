# Phase 4 Testing - Quick Reference

**Document**: Companion to PHASE_4_TEST_PLAN.md  
**Purpose**: Quick reference for test execution

---

## Test Statistics

| Category | Test Count | Coverage Target |
|----------|------------|-----------------|
| Unit Tests | 30+ | 80% code coverage |
| Integration Tests | 10+ | All critical paths |
| API Tests | 20+ | 100% endpoints |
| UI Tests | 15+ | Core journeys |
| Performance Tests | 6 | Baseline metrics |
| Security Tests | 15+ | 100% validation |
| **Total** | **~100 tests** | **Comprehensive** |

---

## Critical Test Priorities

### P0 - Must Pass (Blocking)

1. **TC-UNIT-001**: Spaces upload success
2. **TC-UNIT-101**: File validation - valid files accepted
3. **TC-UNIT-102**: File validation - size limits enforced
4. **TC-INT-001**: Complete upload flow - image
5. **TC-API-001**: POST /api/documents/upload - success
6. **TC-API-002**: POST /api/documents/upload - unauthorized
7. **TC-SEC-001**: Cross-org access prevention
8. **TC-SEC-103**: MIME type spoofing detection

### P1 - High Priority

9. **TC-UNIT-201**: OCR extraction from PNG
10. **TC-INT-003**: GPT-4 Vision extraction
11. **TC-API-101**: GET /api/documents - pagination
12. **TC-UI-001**: Drag and drop upload
13. **TC-PERF-001**: Concurrent uploads (10 users)
14. **TC-SEC-101**: Malicious file blocking

### P2 - Medium Priority

15. All remaining unit tests
16. All remaining API tests
17. UI component tests
18. Performance benchmarks

---

## Quick Test Commands

```bash
# Run priority tests only
npm test -- --testNamePattern="TC-(UNIT-001|UNIT-101|INT-001|API-001|SEC-001)"

# Run by category
npm test -- --testPathPattern=__tests__         # Unit tests
npm test -- --testPathPattern=integration       # Integration
npm test -- --testPathPattern=api              # API tests
npm test -- --testPathPattern=ui               # UI tests
npm test -- --testPathPattern=performance      # Performance
npm test -- --testPathPattern=security         # Security

# Run with coverage
npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'

# Watch mode during development
npm test -- --watch --testPathPattern=spaces.service

# Run specific test file
npm test -- spaces.service.test.ts
npm test -- document-upload.test.ts
```

---

## Test Data Setup

### Required Fixtures

```bash
tests/fixtures/
├── images/
│   ├── invoice-clear.png        # 500KB, clear OCR text
│   ├── receipt-blurry.jpg       # 300KB, lower confidence
│   └── blank.png                # 10KB, no text
├── pdfs/
│   ├── sample-document.pdf      # 200KB, text-based
│   └── scanned-form.pdf         # 2MB, requires OCR
├── invalid/
│   ├── malware.exe              # 50KB, should reject
│   ├── large-file.pdf           # 51MB, exceeds limit
│   ├── tiny-file.txt            # 100 bytes, too small
│   └── corrupted.png            # 50KB, corrupted
└── office/
    └── sample.docx              # 50KB, Word doc
```

### Generate Test Files

```bash
# Create test fixtures directory
mkdir -p tests/fixtures/{images,pdfs,invalid,office}

# Generate blank image (requires ImageMagick)
convert -size 1000x1000 xc:white tests/fixtures/images/blank.png

# Generate large file
dd if=/dev/zero of=tests/fixtures/invalid/large-file.pdf bs=1M count=51

# Generate tiny file
echo "test" > tests/fixtures/invalid/tiny-file.txt
```

---

## Environment Setup for Testing

### Test Environment Variables

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/astralis_test
REDIS_URL=redis://localhost:6379/1

# Test Spaces bucket
SPACES_ACCESS_KEY=test-key
SPACES_SECRET_KEY=test-secret
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_REGION=nyc3
SPACES_BUCKET=astralis-test-documents
SPACES_CDN_URL=https://astralis-test-documents.nyc3.cdn.digitaloceanspaces.com

# File limits
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/*,application/pdf

# OpenAI (mock in tests)
OPENAI_API_KEY=sk-test-key
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

## Test Execution Workflow

### Local Development

```bash
# 1. Run unit tests while coding
npm test -- --watch

# 2. Before committing - run affected tests
npm test -- --onlyChanged

# 3. Pre-commit hook runs
npm test -- --bail --findRelatedTests
npm run lint
```

### Pull Request

```bash
# Automated via GitHub Actions
# 1. Unit tests with coverage
# 2. Integration tests
# 3. API tests
# 4. Coverage report to Codecov
```

### Pre-Deployment

```bash
# Full test suite
npm test -- --coverage --maxWorkers=4

# Performance benchmarks
npm run test:performance

# Security scan
npm run test:security
npm audit
```

---

## Common Test Patterns

### Unit Test Pattern

```typescript
import { spacesService } from '@/lib/services/spaces.service';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');

describe('SpacesService', () => {
  let service: SpacesService;
  let mockS3Send: jest.Mock;

  beforeEach(() => {
    mockS3Send = jest.fn();
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: mockS3Send,
    }));
    service = new SpacesService();
  });

  it('TC-UNIT-001: uploads file successfully', async () => {
    mockS3Send.mockResolvedValueOnce({});
    
    const buffer = Buffer.from('test content');
    const result = await service.uploadFile(buffer, 'test.png', 'image/png', 'org-123');
    
    expect(result.fileName).toMatch(/^test-\d+-[a-f0-9]{16}\.png$/);
    expect(mockS3Send).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Pattern

```typescript
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

describe('Document Upload Integration', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "Document" CASCADE`;
  });

  it('TC-INT-001: completes full upload pipeline', async () => {
    const token = await generateTestToken({ role: 'ADMIN', orgId: 'org-a' });
    
    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', 'tests/fixtures/images/invoice-clear.png');
    
    expect(res.status).toBe(201);
    
    const doc = await prisma.document.findUnique({ where: { id: res.body.document.id } });
    expect(doc.status).toBe('PENDING');
    
    // Wait for worker processing
    await waitFor(() => doc.status === 'COMPLETED', { timeout: 30000 });
  });
});
```

### API Test Pattern

```typescript
describe('POST /api/documents/upload', () => {
  it('TC-API-002: rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .attach('file', 'tests/fixtures/images/test.png');
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});
```

### UI Test Pattern

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUploader } from '@/components/dashboard/DocumentUploader';

describe('DocumentUploader', () => {
  it('TC-UI-001: uploads file via drag and drop', async () => {
    render(<DocumentUploader />);
    
    const dropzone = screen.getByTestId('document-dropzone');
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Upload successful/i)).toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Spaces credentials not configured"  
**Solution**: Set test environment variables in .env.test

**Issue**: OCR tests timeout  
**Solution**: Increase timeout for OCR tests to 30 seconds
```typescript
it('extracts text', async () => {
  // ...
}, 30000); // 30 second timeout
```

**Issue**: Integration tests fail - "Cannot connect to database"  
**Solution**: Ensure test database is running and migrations applied

**Issue**: UI tests fail - "Element not found"  
**Solution**: Add `await waitFor()` for async operations

**Issue**: Performance tests inconsistent results  
**Solution**: Run on dedicated test environment, not local dev machine

---

## Coverage Reports

### Generate Coverage Report

```bash
npm test -- --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Thresholds

```json
{
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "functions": 80,
      "branches": 75,
      "statements": 80
    },
    "./src/lib/services/": {
      "lines": 90,
      "functions": 90
    }
  }
}
```

---

## Next Steps After Testing

1. Review test coverage report
2. Address any gaps in coverage
3. Fix failing tests
4. Optimize slow tests
5. Document any test-specific setup requirements
6. Update CI/CD pipeline with new tests
7. Create test data generator scripts
8. Schedule regular performance regression tests

---

## Resources

- Full Test Plan: `/docs/PHASE_4_TEST_PLAN.md`
- Phase 4 Spec: `/docs/phases/phase-4-document-processing-ocr.md`
- Jest Documentation: https://jestjs.io/
- Testing Library: https://testing-library.com/
- Supertest: https://github.com/ladjs/supertest

---

**Last Updated**: 2025-11-20  
**Version**: 1.0
