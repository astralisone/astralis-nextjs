# E2E Testing with Playwright

## Overview

This directory contains end-to-end (E2E) tests for Astralis One using Playwright. The test suite covers Phase 1 Authentication & RBAC functionality.

## Installation

Playwright and dependencies are already installed. To reinstall browsers:

```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth/signin.spec.ts
```

### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
tests/
├── e2e/
│   ├── auth/                    # Authentication tests
│   │   ├── signup.spec.ts
│   │   ├── signin.spec.ts
│   │   ├── email-verification.spec.ts
│   │   ├── password-reset.spec.ts
│   │   └── protected-routes.spec.ts
│   ├── fixtures/                # Test fixtures
│   │   ├── auth.ts             # Auth-related fixtures
│   │   └── database.ts         # Database utilities
│   └── utils/                   # Test utilities
│       ├── test-helpers.ts     # Common test functions
│       └── db-helpers.ts       # Database helper functions
└── README.md
```

## Test Files

### Authentication Tests (`auth/`)

- **signup.spec.ts**: User registration flow
  - Display sign up form
  - Register new user successfully
  - Validate email format
  - Validate password strength
  - Check for duplicate emails

- **signin.spec.ts**: User authentication flow
  - Display sign in form
  - Sign in with valid credentials
  - Handle invalid email
  - Handle invalid password
  - Forgot password link
  - Sign up link

- **email-verification.spec.ts**: Email verification flow
  - Display verification page
  - Verify email with valid token
  - Handle invalid token
  - Resend verification email

- **password-reset.spec.ts**: Password reset flow
  - Display forgot password form
  - Send password reset email
  - Handle non-existent email
  - Display reset password form
  - Reset password with valid token
  - Handle invalid reset token
  - Validate password requirements

- **protected-routes.spec.ts**: Route protection & RBAC
  - Redirect unauthenticated users
  - Allow authenticated users to access dashboard
  - Block admin routes for non-admin users
  - Preserve redirect path after authentication
  - Allow public routes without authentication

## Fixtures

### Auth Fixtures (`fixtures/auth.ts`)

Provides authenticated user contexts for testing:
- `prisma`: Prisma client instance
- `authenticatedPage`: Pre-authenticated page
- `adminUser`: Admin user fixture
- `operatorUser`: Operator user fixture
- `clientUser`: Client user fixture

### Database Fixtures (`fixtures/database.ts`)

Database utilities for test setup and teardown:
- `cleanup()`: Remove test data
- `createTestOrganization()`: Create test org
- `createTestUser()`: Create test user
- `findUserByEmail()`: Find user by email
- `deleteUserByEmail()`: Delete user by email

## Test Utilities

### Test Helpers (`utils/test-helpers.ts`)

Common test functions:
- `navigateToPage()`: Navigate and wait for load
- `fillFormField()`: Fill form input by label
- `clickButton()`: Click button by text
- `waitForToast()`: Wait for toast notification
- `waitForError()`: Wait for error message
- `isAuthenticated()`: Check auth status
- `signIn()`: Sign in helper
- `signOut()`: Sign out helper
- `generateTestEmail()`: Generate random test email
- `generateTestPassword()`: Generate random test password

### Database Helpers (`utils/db-helpers.ts`)

Database operations for tests:
- `createTestUser()`: Create user with hashed password
- `deleteTestUser()`: Delete user by email
- `cleanupTestData()`: Remove all test data
- `getUserByEmail()`: Get user by email
- `closeDatabase()`: Close DB connection

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL**: `http://localhost:3001`
- **Test Directory**: `tests/e2e/`
- **Timeout**: 30 seconds per test
- **Retries**: 2 for CI, 0 for local
- **Workers**: 3 parallel workers (1 for CI)
- **Screenshot**: On failure
- **Video**: On first retry
- **Trace**: On first retry
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

### Web Server

Tests automatically start the Next.js dev server before running:
- Command: `npm run dev`
- URL: `http://localhost:3001`
- Reuses existing server if available

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { navigateToPage, fillFormField, clickButton } from '../utils/test-helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await navigateToPage(page, '/path');
    await fillFormField(page, 'Email', 'test@example.com');
    await clickButton(page, 'Submit');
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Using Database Fixtures

```typescript
import { createTestUser, cleanupTestData } from '../utils/db-helpers';

test.beforeEach(async () => {
  await createTestUser({
    email: 'test@test.com',
    password: 'TestPass123!',
    name: 'Test User',
    role: 'CLIENT',
  });
});

test.afterEach(async () => {
  await cleanupTestData();
});
```

## Best Practices

1. **Use helper functions** from `test-helpers.ts` for common operations
2. **Clean up test data** after each test with `cleanupTestData()`
3. **Use descriptive test names** that explain what is being tested
4. **Test user flows**, not implementation details
5. **Use data-testid** attributes for stable selectors when needed
6. **Keep tests independent** - each test should work in isolation
7. **Mock external services** when appropriate
8. **Use meaningful assertions** with clear error messages

## Debugging

### Visual Debugging with UI Mode
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### View Test Traces
After a test failure, open the HTML report:
```bash
npm run test:e2e:report
```

### Screenshots
Screenshots are automatically captured on failure in `test-results/`

### Console Logs
Add console logs to your tests:
```typescript
console.log('Debug info:', await page.content());
```

## CI/CD Integration

Tests are configured for CI environments:
- Retries: 2 attempts on CI
- Workers: 1 parallel worker on CI
- `forbidOnly`: true (prevents accidental test.only)

Set `CI=true` environment variable in your CI pipeline.

## Troubleshooting

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify network connectivity

### Database connection errors
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Run `npx prisma generate`

### Browser not found
```bash
npx playwright install chromium
```

### Flaky tests
- Use `waitForLoadState('networkidle')`
- Increase action timeouts
- Use `test.retry(2)` for specific tests

## Next Steps

- Add integration tests for Phase 2 features
- Add API tests using Playwright's request API
- Set up visual regression testing
- Configure CI/CD pipeline for automated testing

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)
