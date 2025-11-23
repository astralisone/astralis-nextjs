# Phase 1: Authentication & RBAC - Comprehensive Test Plan

**Version**: 1.0  
**Phase**: 1 - Authentication & RBAC  
**Created**: 2025-11-20  
**Target Environment**: Development & Staging  
**Testing Duration**: 2-3 days  

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Manual Testing Checklist](#manual-testing-checklist)
4. [Edge Cases & Error Scenarios](#edge-cases--error-scenarios)
5. [Security Testing](#security-testing)
6. [RBAC Testing Scenarios](#rbac-testing-scenarios)
7. [Database Verification Queries](#database-verification-queries)
8. [Integration Testing](#integration-testing)
9. [Acceptance Criteria Validation](#acceptance-criteria-validation)
10. [Test Data Requirements](#test-data-requirements)
11. [Known Issues & Limitations](#known-issues--limitations)
12. [Sign-Off Checklist](#sign-off-checklist)

---

## Testing Overview

### Scope

This test plan validates the complete authentication and authorization system for AstralisOps, including:

- User registration with email/password
- Email verification workflow
- Sign-in with credentials and Google OAuth
- Password reset workflow
- Protected route middleware
- Role-based access control (RBAC)
- Activity logging and audit trail
- Session management and security

### Success Criteria

Phase 1 is considered production-ready when:

- ✅ All manual test cases pass
- ✅ All edge cases are handled gracefully
- ✅ Security tests pass with no vulnerabilities
- ✅ RBAC correctly enforces permissions
- ✅ Database integrity is maintained
- ✅ All acceptance criteria are validated
- ✅ Performance metrics are acceptable (< 500ms avg response time)

### Testing Approach

- **Manual Testing**: 80% (UI flows, user interactions)
- **Database Verification**: 15% (data integrity checks)
- **Security Testing**: 5% (vulnerability scanning)

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Verify database is running
docker ps | grep postgres

# 2. Check environment variables
cat .env.local | grep -E "NEXTAUTH|SMTP|DATABASE"

# 3. Apply database migrations
npx prisma migrate deploy
npx prisma generate

# 4. Start development server
npm run dev

# 5. Verify server is accessible
curl http://localhost:3001/api/auth/providers
```

### Test User Accounts

Create these test accounts before beginning:

| Email | Password | Role | Organization | Status |
|-------|----------|------|-------------|---------|
| admin@test.astralis.com | Admin123! | ADMIN | Test Org Alpha | Active |
| operator@test.astralis.com | Operator123! | OPERATOR | Test Org Alpha | Active |
| client@test.astralis.com | Client123! | CLIENT | Test Org Alpha | Active |
| inactive@test.astralis.com | Inactive123! | OPERATOR | Test Org Beta | Inactive |

### Database Reset (Between Test Runs)

```sql
-- WARNING: Development/Staging only - clears all auth data
TRUNCATE TABLE "Account", "Session", "VerificationToken", "ActivityLog" CASCADE;
DELETE FROM "User";
DELETE FROM "Organization";
```

---

## Manual Testing Checklist

### 1. Sign-Up Flow (Email/Password)

#### Test Case 1.1: Successful Sign-Up

**Steps**:
1. Navigate to `http://localhost:3001/auth/signup`
2. Fill in the form:
   - Full Name: "John Doe"
   - Email: "john.doe@testastralis.com"
   - Password: "SecurePass123!"
   - Organization Name: "Acme Corporation"
3. Click "Create Account" button
4. Observe success message

**Expected Results**:
- ✅ Success message appears: "Account created. Please check your email..."
- ✅ User is NOT automatically signed in
- ✅ Link to sign-in page is displayed
- ✅ No errors in browser console
- ✅ Email sent to john.doe@testastralis.com (check SMTP logs)

**Database Verification**:
```sql
-- Should return 1 user record
SELECT id, email, name, role, "orgId", "emailVerified", "isActive" 
FROM "User" 
WHERE email = 'john.doe@testastralis.com';

-- Should return 1 organization
SELECT id, name FROM "Organization" WHERE name = 'Acme Corporation';

-- Should return 1 verification token
SELECT identifier, expires FROM "VerificationToken" 
WHERE identifier = 'john.doe@testastralis.com';

-- Should return 1 activity log entry
SELECT action, entity, "entityId" FROM "ActivityLog" 
WHERE "userId" IN (
  SELECT id FROM "User" WHERE email = 'john.doe@testastralis.com'
) 
AND action = 'CREATE' AND entity = 'USER';
```

**Pass Criteria**: All checkboxes checked, database queries return expected data

---

#### Test Case 1.2: Sign-Up Validation Errors

**Steps**:
1. Navigate to `http://localhost:3001/auth/signup`
2. Test each validation error individually:

**Test 1.2a: Invalid Email Format**
- Email: "notanemail"
- Expected: "Invalid email address" error below email field

**Test 1.2b: Password Too Short**
- Password: "Short1!"
- Expected: "Password must be at least 8 characters" error

**Test 1.2c: Password Missing Uppercase**
- Password: "lowercase123!"
- Expected: "Password must contain uppercase letter" error

**Test 1.2d: Password Missing Number**
- Password: "NoNumbers!"
- Expected: "Password must contain number" error

**Test 1.2e: Name Too Short**
- Name: "A"
- Expected: "Name must be at least 2 characters" error

**Test 1.2f: Organization Name Missing**
- Organization Name: "" (empty)
- Expected: "Organization name required" error

**Expected Results**:
- ✅ Each validation error displays immediately (client-side)
- ✅ Submit button remains enabled but form doesn't submit
- ✅ Error messages are clear and actionable
- ✅ No server requests made until validation passes

**Pass Criteria**: All 6 validation errors trigger correctly

---

#### Test Case 1.3: Duplicate Email Error

**Steps**:
1. Sign up with email "duplicate@testastralis.com"
2. Wait for success message
3. Navigate to sign-up page again
4. Try to sign up with same email "duplicate@testastralis.com"

**Expected Results**:
- ✅ Error message: "User with this email already exists"
- ✅ Error is displayed in Alert component (red)
- ✅ Form fields retain entered values
- ✅ No verification email sent for duplicate

**Database Verification**:
```sql
-- Should return only 1 user (original)
SELECT COUNT(*) FROM "User" WHERE email = 'duplicate@testastralis.com';
```

**Pass Criteria**: Duplicate prevented, clear error message, 1 user in DB

---

### 2. Email Verification Flow

#### Test Case 2.1: Successful Email Verification

**Steps**:
1. Sign up with "verify@testastralis.com"
2. Check SMTP logs or email inbox for verification email
3. Copy verification link from email (format: `/auth/verify-email?token=...`)
4. Open link in browser
5. Observe verification page

**Expected Results**:
- ✅ Loading spinner appears briefly
- ✅ Success message: "Email verified successfully"
- ✅ Green checkmark icon displayed
- ✅ "Sign In" button is visible
- ✅ Clicking "Sign In" navigates to `/auth/signin`

**Email Verification**:
- ✅ Email subject: "Verify Your Email - AstralisOps"
- ✅ Email body contains clickable button "Verify Email Address"
- ✅ Email contains text link as backup
- ✅ Email uses Astralis brand colors (Navy/Blue)
- ✅ Email displays sender as "Astralis <support@astralisone.com>"

**Database Verification**:
```sql
-- emailVerified should be set to current timestamp
SELECT email, "emailVerified" FROM "User" 
WHERE email = 'verify@testastralis.com';

-- Verification token should be deleted
SELECT COUNT(*) FROM "VerificationToken" 
WHERE identifier = 'verify@testastralis.com';
-- Expected: 0
```

**Pass Criteria**: Email verified, token deleted, timestamps correct

---

#### Test Case 2.2: Expired Verification Token

**Steps**:
1. Sign up with "expired@testastralis.com"
2. Manually update token expiry in database:
   ```sql
   UPDATE "VerificationToken" 
   SET expires = NOW() - INTERVAL '1 hour'
   WHERE identifier = 'expired@testastralis.com';
   ```
3. Attempt to verify email with expired token
4. Observe error message

**Expected Results**:
- ✅ Error message: "Verification token has expired"
- ✅ Red error alert displayed
- ✅ "Sign Up Again" button visible
- ✅ emailVerified remains NULL in database

**Pass Criteria**: Expired token rejected, user cannot verify

---

#### Test Case 2.3: Invalid Verification Token

**Steps**:
1. Navigate to `/auth/verify-email?token=invalid-token-12345`
2. Observe error message

**Expected Results**:
- ✅ Error message: "Invalid or expired verification token"
- ✅ Red error alert displayed
- ✅ No database changes

**Pass Criteria**: Invalid token rejected gracefully

---

### 3. Sign-In Flow (Credentials)

#### Test Case 3.1: Successful Sign-In

**Steps**:
1. Sign up and verify email for "signin@testastralis.com"
2. Navigate to `http://localhost:3001/auth/signin`
3. Enter credentials:
   - Email: "signin@testastralis.com"
   - Password: (correct password)
4. Click "Sign In" button
5. Observe redirect

**Expected Results**:
- ✅ Redirect to `/astralisops/dashboard` (if exists, or shows 404 until Phase 2)
- ✅ No error messages
- ✅ Session cookie set (check DevTools → Application → Cookies)
- ✅ Cookie name: `next-auth.session-token` or `__Secure-next-auth.session-token`
- ✅ Cookie has HttpOnly flag
- ✅ Cookie has Secure flag (in production)

**Database Verification**:
```sql
-- Session record created
SELECT "sessionToken", "userId", expires FROM "Session" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'signin@testastralis.com');

-- lastLoginAt updated
SELECT "lastLoginAt" FROM "User" WHERE email = 'signin@testastralis.com';
-- Should be within last 5 seconds

-- Activity log entry
SELECT action, entity, "createdAt" FROM "ActivityLog" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'signin@testastralis.com')
AND action = 'LOGIN'
ORDER BY "createdAt" DESC LIMIT 1;
```

**Pass Criteria**: Successful sign-in, session created, activity logged

---

#### Test Case 3.2: Invalid Credentials

**Steps**:
1. Navigate to `/auth/signin`
2. Test each invalid scenario:

**Test 3.2a: Wrong Password**
- Email: "signin@testastralis.com" (valid)
- Password: "WrongPassword123!"
- Expected: "Invalid email or password"

**Test 3.2b: Non-Existent Email**
- Email: "nonexistent@testastralis.com"
- Password: "AnyPassword123!"
- Expected: "Invalid email or password"

**Test 3.2c: Empty Fields**
- Email: ""
- Password: ""
- Expected: Validation errors for both fields

**Expected Results**:
- ✅ Generic error message (don't reveal which field is wrong)
- ✅ No session created
- ✅ Form fields retain email (but clear password)
- ✅ No redirect occurs

**Database Verification**:
```sql
-- No new sessions created
SELECT COUNT(*) FROM "Session" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'signin@testastralis.com')
AND "createdAt" > NOW() - INTERVAL '5 minutes';
-- Should be 0 for failed attempts
```

**Pass Criteria**: Invalid credentials rejected, no session created

---

#### Test Case 3.3: Sign-In With Unverified Email

**Steps**:
1. Sign up with "unverified@testastralis.com"
2. DO NOT verify email
3. Attempt to sign in with correct credentials

**Expected Results**:
- ✅ Sign-in succeeds (email verification not required for sign-in)
- ✅ OR sign-in fails with "Please verify your email first" (if implemented)
- ✅ Document actual behavior in test results

**Note**: Confirm expected behavior with product owner

---

#### Test Case 3.4: Sign-In With Inactive Account

**Steps**:
1. Create user "inactive@testastralis.com"
2. Set `isActive = false` in database:
   ```sql
   UPDATE "User" SET "isActive" = false 
   WHERE email = 'inactive@testastralis.com';
   ```
3. Attempt to sign in with correct credentials

**Expected Results**:
- ✅ Error message: "Account is disabled"
- ✅ No session created
- ✅ No redirect occurs

**Pass Criteria**: Inactive accounts cannot sign in

---

#### Test Case 3.5: Callback URL Redirect

**Steps**:
1. Sign out if signed in
2. Navigate to protected route: `http://localhost:3001/astralisops/dashboard`
3. Observe redirect to sign-in page
4. Check URL for callback parameter: `/auth/signin?callbackUrl=/astralisops/dashboard`
5. Sign in with valid credentials
6. Observe final redirect

**Expected Results**:
- ✅ Redirect to `/auth/signin` includes `callbackUrl` parameter
- ✅ After sign-in, redirects back to `/astralisops/dashboard`
- ✅ Callback URL is preserved through sign-in flow

**Pass Criteria**: Callback URL works correctly

---

### 4. Sign-In Flow (Google OAuth)

#### Test Case 4.1: Successful Google OAuth Sign-In (New User)

**Prerequisites**:
- Valid Google OAuth credentials configured
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set in `.env.local`

**Steps**:
1. Navigate to `/auth/signin`
2. Click "Sign in with Google" button
3. Complete Google OAuth flow in popup/redirect
4. Grant permissions to AstralisOps
5. Observe redirect back to app

**Expected Results**:
- ✅ Redirect to Google OAuth consent screen
- ✅ App name "AstralisOps" displayed
- ✅ Permissions requested clearly listed
- ✅ After consent, redirect to `/astralisops/dashboard`
- ✅ User automatically created in database
- ✅ Organization created with user's name
- ✅ User assigned ADMIN role (first user in org)

**Database Verification**:
```sql
-- User created with OAuth data
SELECT id, email, name, "emailVerified", image, "orgId", role 
FROM "User" 
WHERE email = '<google-email>';

-- Account record created
SELECT provider, "providerAccountId", type FROM "Account" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = '<google-email>');

-- Organization created
SELECT name FROM "Organization" 
WHERE id = (SELECT "orgId" FROM "User" WHERE email = '<google-email>');
```

**Pass Criteria**: OAuth succeeds, user/org created, session established

---

#### Test Case 4.2: Google OAuth Sign-In (Existing User)

**Prerequisites**:
- User previously signed up with email/password
- Same email as Google account

**Steps**:
1. Sign up with "oauth@testastralis.com" using email/password
2. Sign out
3. Sign in with Google using same email "oauth@testastralis.com"
4. Observe result

**Expected Results**:
- ✅ Sign-in succeeds (accounts linked)
- ✅ No duplicate user created
- ✅ Account record created linking Google provider
- ✅ User's existing organization preserved

**Database Verification**:
```sql
-- Only 1 user with this email
SELECT COUNT(*) FROM "User" WHERE email = 'oauth@testastralis.com';
-- Expected: 1

-- Multiple accounts for same user
SELECT provider, type FROM "Account" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'oauth@testastralis.com');
-- Expected: 2 rows (credentials + google)
```

**Pass Criteria**: OAuth links to existing account, no duplicates

---

#### Test Case 4.3: Google OAuth Error Handling

**Steps**:
1. Click "Sign in with Google"
2. Close OAuth popup/cancel flow
3. Observe behavior

**Expected Results**:
- ✅ User returns to sign-in page
- ✅ No error message (user cancelled)
- ✅ No partial data created in database

**Alternative Test**:
1. Temporarily set invalid `GOOGLE_CLIENT_ID`
2. Click "Sign in with Google"
3. Observe error

**Expected Results**:
- ✅ Error page displayed with clear message
- ✅ Link to go back to sign-in page

**Pass Criteria**: OAuth errors handled gracefully

---

### 5. Password Reset Flow

#### Test Case 5.1: Successful Password Reset Request

**Steps**:
1. Navigate to `/auth/signin`
2. Click "Forgot password?" link
3. Enter email: "reset@testastralis.com"
4. Submit form
5. Observe success message

**Expected Results**:
- ✅ Success message: "If an account exists, a password reset link has been sent"
- ✅ Generic message (don't reveal if email exists)
- ✅ Email sent to reset@testastralis.com

**Email Verification**:
- ✅ Email subject: "Reset Your Password - AstralisOps"
- ✅ Email body contains "Reset Password" button
- ✅ Email contains backup text link
- ✅ Email uses Astralis brand colors

**Database Verification**:
```sql
-- Verification token created
SELECT identifier, expires FROM "VerificationToken" 
WHERE identifier = 'reset@testastralis.com'
ORDER BY expires DESC LIMIT 1;
-- expires should be ~1 hour in future
```

**Pass Criteria**: Reset email sent, token created

---

#### Test Case 5.2: Complete Password Reset

**Steps**:
1. Request password reset for "reset@testastralis.com"
2. Copy reset link from email
3. Open reset link in browser
4. Enter new password: "NewSecurePass123!"
5. Confirm new password: "NewSecurePass123!"
6. Submit form
7. Observe success message

**Expected Results**:
- ✅ Success message: "Password reset successfully"
- ✅ Link to sign-in page displayed
- ✅ Old password no longer works
- ✅ New password works for sign-in

**Database Verification**:
```sql
-- Password hash changed
SELECT password FROM "User" WHERE email = 'reset@testastralis.com';
-- Hash should be different from original

-- Token deleted
SELECT COUNT(*) FROM "VerificationToken" 
WHERE identifier = 'reset@testastralis.com';
-- Expected: 0
```

**Pass Criteria**: Password updated, old password invalid, new password works

---

#### Test Case 5.3: Expired Reset Token

**Steps**:
1. Request password reset
2. Update token expiry:
   ```sql
   UPDATE "VerificationToken" 
   SET expires = NOW() - INTERVAL '30 minutes'
   WHERE identifier = 'expired-reset@testastralis.com';
   ```
3. Attempt to use reset link
4. Observe error

**Expected Results**:
- ✅ Error: "Reset token has expired"
- ✅ Password remains unchanged
- ✅ User must request new reset link

**Pass Criteria**: Expired tokens rejected

---

#### Test Case 5.4: Password Reset for Non-Existent Email

**Steps**:
1. Navigate to `/auth/forgot-password`
2. Enter non-existent email: "nonexistent@testastralis.com"
3. Submit form
4. Observe message

**Expected Results**:
- ✅ Same message as successful reset: "If an account exists, a password reset link has been sent"
- ✅ No email sent (check SMTP logs)
- ✅ No token created in database

**Security Note**: Generic message prevents email enumeration attack

**Pass Criteria**: Generic message shown, no email sent

---

### 6. Protected Routes & Middleware

#### Test Case 6.1: Access Protected Route Without Auth

**Steps**:
1. Ensure you're signed out (clear cookies)
2. Navigate directly to each protected route:
   - `/astralisops/dashboard`
   - `/astralisops/pipelines`
   - `/astralisops/intake`
   - `/astralisops/documents`
   - `/astralisops/scheduling`
   - `/astralisops/automations`
   - `/astralisops/settings`

**Expected Results**:
- ✅ Immediately redirects to `/auth/signin`
- ✅ `callbackUrl` parameter includes original route
- ✅ No flash of protected content
- ✅ No API calls made to protected endpoints

**Pass Criteria**: All protected routes redirect unauthenticated users

---

#### Test Case 6.2: Access Auth Routes While Authenticated

**Steps**:
1. Sign in with valid credentials
2. Navigate to each auth route:
   - `/auth/signin`
   - `/auth/signup`

**Expected Results**:
- ✅ Immediately redirects to `/astralisops/dashboard`
- ✅ No flash of auth forms
- ✅ Session remains intact

**Pass Criteria**: Auth routes redirect authenticated users

---

#### Test Case 6.3: Session Persistence Across Page Refreshes

**Steps**:
1. Sign in with valid credentials
2. Navigate to `/astralisops/dashboard`
3. Refresh page (F5)
4. Observe behavior

**Expected Results**:
- ✅ User remains signed in
- ✅ No redirect to sign-in page
- ✅ Session cookie still present
- ✅ User data still available

**Pass Criteria**: Session persists across refreshes

---

#### Test Case 6.4: Session Expiry

**Steps**:
1. Sign in with valid credentials
2. Manually set session expiry to past:
   ```sql
   UPDATE "Session" 
   SET expires = NOW() - INTERVAL '1 hour'
   WHERE "userId" = (SELECT id FROM "User" WHERE email = '<test-email>');
   ```
3. Refresh page or navigate to protected route
4. Observe behavior

**Expected Results**:
- ✅ Session is invalid
- ✅ Redirects to `/auth/signin`
- ✅ Session record deleted from database

**Pass Criteria**: Expired sessions are invalidated

---

### 7. Sign-Out Flow

#### Test Case 7.1: Successful Sign-Out

**Steps**:
1. Sign in with valid credentials
2. Navigate to protected route
3. Click "Sign Out" button (when implemented in navigation)
4. OR manually navigate to sign-out endpoint
5. Observe behavior

**Expected Results**:
- ✅ Redirects to homepage or sign-in page
- ✅ Session cookie cleared
- ✅ Session record deleted from database
- ✅ Accessing protected route redirects to sign-in

**Database Verification**:
```sql
-- Session should be deleted
SELECT COUNT(*) FROM "Session" WHERE "userId" = '<user-id>';
-- Expected: 0
```

**Pass Criteria**: Sign-out clears session completely

---

## Edge Cases & Error Scenarios

### Edge Case 1: Concurrent Sign-Up Attempts

**Scenario**: Two users attempt to sign up with same email simultaneously

**Steps**:
1. Open 2 browser tabs
2. Fill sign-up form in both tabs with same email
3. Click submit in both tabs within 1 second

**Expected Results**:
- ✅ One request succeeds, creates user
- ✅ Other request fails with "User already exists" error
- ✅ Only 1 user record in database
- ✅ No race condition or duplicate users

**Pass Criteria**: Database constraint prevents duplicates

---

### Edge Case 2: Special Characters in Name/Organization

**Scenario**: User enters special characters in fields

**Test Data**:
- Name: "O'Brien-Smith"
- Organization: "Acme & Co. (UK) Ltd."
- Name: "José García"
- Organization: "Société Générale"

**Expected Results**:
- ✅ Special characters accepted
- ✅ Data stored correctly in database
- ✅ Data displayed correctly in UI
- ✅ No encoding issues

**Pass Criteria**: Special characters handled correctly

---

### Edge Case 3: Very Long Input Values

**Test Data**:
- Name: 100 characters (at limit)
- Name: 101 characters (over limit)
- Organization: 100 characters (at limit)
- Organization: 101 characters (over limit)

**Expected Results**:
- ✅ Values at limit accepted
- ✅ Values over limit rejected with validation error
- ✅ Error message: "Name/Organization must be at most 100 characters"

**Pass Criteria**: Max length enforced

---

### Edge Case 4: Email Verification Token Reuse

**Scenario**: User attempts to verify email twice with same token

**Steps**:
1. Sign up and verify email successfully
2. Save verification link
3. Attempt to use same link again

**Expected Results**:
- ✅ Error: "Invalid or expired verification token"
- ✅ Token already deleted from database
- ✅ emailVerified timestamp unchanged

**Pass Criteria**: Tokens cannot be reused

---

### Edge Case 5: Multiple Password Reset Requests

**Scenario**: User requests password reset multiple times

**Steps**:
1. Request password reset for "test@testastralis.com"
2. Wait 1 minute
3. Request password reset again for same email
4. Check database for tokens

**Expected Results**:
- ✅ Multiple tokens created (old ones not deleted)
- ✅ Most recent token is valid
- ✅ Older tokens expire naturally
- ✅ Any token can be used (first-wins)

**Alternative Behavior** (if implemented):
- ✅ New request invalidates previous tokens
- ✅ Only latest token is valid

**Pass Criteria**: Document actual behavior, ensure security

---

### Edge Case 6: Session Cookie Tampering

**Scenario**: Attacker attempts to modify session cookie

**Steps**:
1. Sign in and obtain valid session cookie
2. Open DevTools → Application → Cookies
3. Modify session token value
4. Refresh page

**Expected Results**:
- ✅ Invalid session detected
- ✅ User signed out automatically
- ✅ Redirects to sign-in page
- ✅ Error logged (optional)

**Pass Criteria**: Cookie tampering invalidates session

---

### Edge Case 7: CSRF Protection

**Scenario**: Attacker attempts CSRF attack on sign-in endpoint

**Steps**:
1. Create malicious HTML page with form:
   ```html
   <form action="http://localhost:3001/api/auth/signin" method="POST">
     <input name="email" value="victim@test.com" />
     <input name="password" value="password" />
     <button type="submit">Click me!</button>
   </form>
   ```
2. Victim clicks button while signed out
3. Observe behavior

**Expected Results**:
- ✅ Request blocked by CSRF protection
- ✅ Error: "CSRF token missing or invalid"
- ✅ User not signed in

**Pass Criteria**: NextAuth CSRF protection works

---

### Edge Case 8: XSS Prevention in User Inputs

**Scenario**: Attacker enters malicious script in name field

**Test Data**:
- Name: `<script>alert('XSS')</script>`
- Name: `<img src=x onerror="alert('XSS')">`
- Organization: `<iframe src="http://evil.com"></iframe>`

**Expected Results**:
- ✅ Script tags escaped in database
- ✅ Script tags not executed in UI
- ✅ Name displayed as plain text
- ✅ No alert boxes appear

**Pass Criteria**: XSS attacks prevented

---

### Edge Case 9: SQL Injection in Email Field

**Scenario**: Attacker enters SQL injection payload

**Test Data**:
- Email: `admin@test.com' OR '1'='1`
- Email: `'; DROP TABLE "User"; --`

**Expected Results**:
- ✅ Invalid email format error
- ✅ Query parameterization prevents injection
- ✅ Database remains intact

**Pass Criteria**: SQL injection prevented by Prisma

---

### Edge Case 10: Rapid Sign-In Attempts (Brute Force)

**Scenario**: Attacker attempts multiple sign-ins quickly

**Steps**:
1. Attempt 10 sign-ins with wrong password within 10 seconds
2. Observe behavior

**Expected Behavior** (if rate limiting implemented):
- ✅ After N attempts, account locked temporarily
- ✅ Error: "Too many attempts, try again in X minutes"
- ✅ Activity logged

**Current Behavior** (if NOT implemented):
- ⚠️ Document: No rate limiting, recommend adding in future

**Pass Criteria**: Document behavior, file enhancement ticket if needed

---

## Security Testing

### Security Test 1: Password Hashing

**Objective**: Verify passwords are never stored in plain text

**Steps**:
1. Sign up with known password: "TestPassword123!"
2. Query database for password hash:
   ```sql
   SELECT password FROM "User" WHERE email = '<test-email>';
   ```
3. Verify hash format

**Expected Results**:
- ✅ Password value is bcrypt hash (starts with `$2b$` or `$2a$`)
- ✅ Hash is 60 characters long
- ✅ Hash does NOT contain plain text password
- ✅ Same password produces different hash (due to salt)

**Pass Criteria**: Passwords properly hashed with bcrypt

---

### Security Test 2: Session Cookie Security

**Objective**: Verify session cookies are secure

**Steps**:
1. Sign in with valid credentials
2. Open DevTools → Application → Cookies
3. Inspect session cookie properties

**Expected Results**:
- ✅ Cookie has `HttpOnly` flag (not accessible via JavaScript)
- ✅ Cookie has `Secure` flag in production (HTTPS only)
- ✅ Cookie has `SameSite=Lax` or `SameSite=Strict`
- ✅ Cookie has appropriate `Path` (e.g., `/`)
- ✅ Cookie has `Max-Age` or `Expires` set

**Pass Criteria**: All security flags present

---

### Security Test 3: HTTPS Enforcement (Production)

**Objective**: Verify HTTPS is enforced in production

**Note**: This test applies to staging/production, not local development

**Steps**:
1. Navigate to `http://app.astralisone.com` (HTTP)
2. Observe redirect

**Expected Results**:
- ✅ Automatically redirects to `https://app.astralisone.com`
- ✅ All resources loaded over HTTPS
- ✅ No mixed content warnings

**Pass Criteria**: HTTPS enforced

---

### Security Test 4: Authentication Token Expiry

**Objective**: Verify tokens have appropriate expiry

**Steps**:
1. Query verification tokens:
   ```sql
   SELECT identifier, expires, 
          (expires - NOW()) as "time_until_expiry"
   FROM "VerificationToken";
   ```

**Expected Results**:
- ✅ Email verification tokens: 24 hours expiry
- ✅ Password reset tokens: 1 hour expiry
- ✅ Session tokens: 30 days expiry

**Pass Criteria**: Token expiry times appropriate

---

### Security Test 5: Organization Isolation

**Objective**: Verify users can only access their organization's data

**Steps**:
1. Create 2 users in different organizations:
   - User A: org-a@test.com (Organization Alpha)
   - User B: org-b@test.com (Organization Beta)
2. Sign in as User A
3. Attempt to access Organization Beta's data via API

**Test API Calls**:
```bash
# Get Organization Beta's ID
curl -X GET http://localhost:3001/api/organizations \
  -H "Cookie: <user-a-session-cookie>"

# Expected: Only Organization Alpha returned

# Attempt to access User B's data
curl -X GET http://localhost:3001/api/users/<user-b-id> \
  -H "Cookie: <user-a-session-cookie>"

# Expected: 403 Forbidden
```

**Expected Results**:
- ✅ User A cannot see Organization Beta's data
- ✅ API returns 403 Forbidden for cross-org access
- ✅ RBAC middleware enforces organization isolation

**Pass Criteria**: Organizations properly isolated

---

### Security Test 6: Activity Logging Completeness

**Objective**: Verify all security-relevant actions are logged

**Steps**:
1. Perform these actions:
   - Sign up
   - Sign in
   - Failed sign-in attempt
   - Password reset request
   - Password reset completion
   - Sign out

2. Query activity logs:
   ```sql
   SELECT action, entity, "entityId", "metadata", "createdAt"
   FROM "ActivityLog"
   WHERE "userId" = '<test-user-id>'
   ORDER BY "createdAt" DESC;
   ```

**Expected Results**:
- ✅ CREATE action logged for sign-up
- ✅ LOGIN action logged for successful sign-in
- ✅ Failed attempts logged (optional, but recommended)
- ✅ Password changes logged
- ✅ All logs include timestamps
- ✅ All logs include user ID and org ID

**Pass Criteria**: Critical actions logged

---

### Security Test 7: Sensitive Data Exposure

**Objective**: Verify API responses don't expose sensitive data

**Steps**:
1. Sign in and make API calls
2. Inspect response payloads

**Check These Endpoints**:
- `GET /api/auth/session`
- `GET /api/users/me`

**Expected Results**:
- ✅ Password hashes NEVER returned
- ✅ Session tokens NEVER returned in response body
- ✅ Verification tokens NEVER exposed
- ✅ Only necessary user data returned

**Pass Criteria**: No sensitive data in API responses

---

### Security Test 8: Authorization Header Validation

**Objective**: Verify API endpoints validate authentication

**Steps**:
1. Make API calls without session cookie:
   ```bash
   curl -X GET http://localhost:3001/api/users/me
   # Expected: 401 Unauthorized
   
   curl -X POST http://localhost:3001/api/pipelines \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Pipeline"}'
   # Expected: 401 Unauthorized
   ```

**Expected Results**:
- ✅ All protected endpoints return 401 without auth
- ✅ Error message: "Unauthorized"
- ✅ No data leakage in error responses

**Pass Criteria**: Auth required for protected endpoints

---

## RBAC Testing Scenarios

### RBAC Test 1: ADMIN Role Permissions

**Objective**: Verify ADMIN users have full access

**Setup**:
1. Create user with ADMIN role: admin@test-rbac.com
2. Sign in as ADMIN

**Test Cases**:

| Action | Endpoint | Expected |
|--------|----------|----------|
| View users | GET /api/users | ✅ 200 OK |
| Create user | POST /api/users | ✅ 201 Created |
| Update user | PUT /api/users/:id | ✅ 200 OK |
| Delete user | DELETE /api/users/:id | ✅ 200 OK |
| View pipelines | GET /api/pipelines | ✅ 200 OK |
| Create pipeline | POST /api/pipelines | ✅ 201 Created |
| Delete pipeline | DELETE /api/pipelines/:id | ✅ 200 OK |
| View org settings | GET /api/organizations/:id/settings | ✅ 200 OK |
| Update org settings | PUT /api/organizations/:id/settings | ✅ 200 OK |

**Pass Criteria**: ADMIN has access to all endpoints

---

### RBAC Test 2: OPERATOR Role Permissions

**Objective**: Verify OPERATOR users have limited access

**Setup**:
1. Create user with OPERATOR role: operator@test-rbac.com
2. Sign in as OPERATOR

**Test Cases**:

| Action | Endpoint | Expected |
|--------|----------|----------|
| View users | GET /api/users | ✅ 200 OK (read-only) |
| Create user | POST /api/users | ❌ 403 Forbidden |
| Update user | PUT /api/users/:id | ❌ 403 Forbidden |
| Delete user | DELETE /api/users/:id | ❌ 403 Forbidden |
| View pipelines | GET /api/pipelines | ✅ 200 OK |
| Update pipeline item | PUT /api/pipelines/:id/items/:itemId | ✅ 200 OK |
| Delete pipeline | DELETE /api/pipelines/:id | ❌ 403 Forbidden |
| View org settings | GET /api/organizations/:id/settings | ❌ 403 Forbidden |

**Pass Criteria**: OPERATOR has correct limited access

---

### RBAC Test 3: CLIENT Role Permissions

**Objective**: Verify CLIENT users have minimal access

**Setup**:
1. Create user with CLIENT role: client@test-rbac.com
2. Sign in as CLIENT

**Test Cases**:

| Action | Endpoint | Expected |
|--------|----------|----------|
| View users | GET /api/users | ❌ 403 Forbidden |
| View own profile | GET /api/users/me | ✅ 200 OK |
| View pipelines | GET /api/pipelines | ❌ 403 Forbidden |
| Create intake request | POST /api/intake | ✅ 201 Created |
| View own intake requests | GET /api/intake?userId=<own-id> | ✅ 200 OK |
| View other's intake | GET /api/intake?userId=<other-id> | ❌ 403 Forbidden |
| Upload document | POST /api/documents | ✅ 201 Created |
| View own documents | GET /api/documents?userId=<own-id> | ✅ 200 OK |

**Pass Criteria**: CLIENT has minimal access, own data only

---

### RBAC Test 4: Role Escalation Prevention

**Objective**: Verify users cannot escalate their own role

**Setup**:
1. Sign in as OPERATOR

**Test Cases**:
```bash
# Attempt to update own role to ADMIN
curl -X PUT http://localhost:3001/api/users/me \
  -H "Cookie: <operator-session>" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'

# Expected: 403 Forbidden or role field ignored
```

**Expected Results**:
- ✅ Role update rejected with 403 Forbidden
- ✅ OR role field silently ignored (not updated)
- ✅ User remains OPERATOR role

**Pass Criteria**: Role escalation prevented

---

### RBAC Test 5: Permission Inheritance

**Objective**: Verify permission matrix is correctly implemented

**Test Permission Checks**:
```typescript
// In code: hasPermission() function

// Test ADMIN permissions
await hasPermission('user:create') // ✅ true
await hasPermission('user:delete') // ✅ true
await hasPermission('org:settings') // ✅ true

// Test OPERATOR permissions  
await hasPermission('user:create') // ❌ false
await hasPermission('pipeline:update') // ✅ true
await hasPermission('org:settings') // ❌ false

// Test CLIENT permissions
await hasPermission('user:view') // ❌ false
await hasPermission('intake:create') // ✅ true
await hasPermission('document:upload') // ✅ true
```

**Pass Criteria**: Permission matrix enforced correctly

---

### RBAC Test 6: Multi-Organization Access Control

**Objective**: Verify RBAC works across organizations

**Setup**:
1. Create Organization A and Organization B
2. Create ADMIN user in Organization A
3. Create ADMIN user in Organization B

**Test Cases**:
- Admin A signs in
- Admin A attempts to access Organization B's data
- Expected: 403 Forbidden (organization isolation)

**Pass Criteria**: Organization boundaries respected

---

## Database Verification Queries

### Query 1: Verify User Creation

```sql
-- Check user was created with correct data
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u."orgId",
  u."emailVerified",
  u."isActive",
  u."createdAt",
  o.name as "organizationName"
FROM "User" u
JOIN "Organization" o ON u."orgId" = o.id
WHERE u.email = '<test-email>'
ORDER BY u."createdAt" DESC
LIMIT 1;

-- Expected: 1 row with correct values
```

### Query 2: Verify Organization Creation

```sql
-- Check organization was created
SELECT 
  o.id,
  o.name,
  o."createdAt",
  COUNT(u.id) as "userCount"
FROM "Organization" o
LEFT JOIN "User" u ON u."orgId" = o.id
WHERE o.name = '<test-org-name>'
GROUP BY o.id, o.name, o."createdAt";

-- Expected: 1 row with userCount = 1 (first user)
```

### Query 3: Verify Password Hashing

```sql
-- Check password is hashed
SELECT 
  email,
  password,
  LENGTH(password) as "passwordLength",
  SUBSTRING(password, 1, 4) as "hashPrefix"
FROM "User"
WHERE email = '<test-email>';

-- Expected: 
-- - password starts with $2b$ or $2a$
-- - passwordLength = 60
```

### Query 4: Verify Email Verification Token

```sql
-- Check verification token created
SELECT 
  identifier,
  token,
  expires,
  (expires > NOW()) as "isValid",
  (expires - NOW()) as "timeRemaining"
FROM "VerificationToken"
WHERE identifier = '<test-email>'
ORDER BY expires DESC
LIMIT 1;

-- Expected: 
-- - isValid = true
-- - timeRemaining ~ 24 hours
```

### Query 5: Verify Session Creation

```sql
-- Check session was created on sign-in
SELECT 
  s.id,
  s."sessionToken",
  s."userId",
  s.expires,
  u.email,
  (s.expires > NOW()) as "isValid"
FROM "Session" s
JOIN "User" u ON s."userId" = u.id
WHERE u.email = '<test-email>'
ORDER BY s."createdAt" DESC
LIMIT 1;

-- Expected: 1 row with isValid = true
```

### Query 6: Verify Activity Logging

```sql
-- Check all activity logs for user
SELECT 
  a.id,
  a.action,
  a.entity,
  a."entityId",
  a.metadata,
  a."ipAddress",
  a."userAgent",
  a."createdAt"
FROM "ActivityLog" a
WHERE a."userId" = '<test-user-id>'
ORDER BY a."createdAt" DESC;

-- Expected: Multiple rows showing CREATE, LOGIN, etc.
```

### Query 7: Verify OAuth Account Linking

```sql
-- Check OAuth account was linked
SELECT 
  a.provider,
  a."providerAccountId",
  a.type,
  u.email,
  u.name
FROM "Account" a
JOIN "User" u ON a."userId" = u.id
WHERE u.email = '<test-email>';

-- Expected: 1+ rows (credentials, google, etc.)
```

### Query 8: Verify Token Cleanup

```sql
-- Check tokens are deleted after use
SELECT 
  identifier,
  token,
  expires
FROM "VerificationToken"
WHERE identifier = '<verified-email>';

-- Expected: 0 rows (tokens deleted after verification)
```

### Query 9: Verify Role Assignment

```sql
-- Check roles are correctly assigned
SELECT 
  u.email,
  u.role,
  o.name as "organizationName",
  COUNT(u2.id) as "totalUsersInOrg"
FROM "User" u
JOIN "Organization" o ON u."orgId" = o.id
LEFT JOIN "User" u2 ON u2."orgId" = o.id
WHERE u.email IN (
  'admin@test.com', 
  'operator@test.com', 
  'client@test.com'
)
GROUP BY u.email, u.role, o.name;

-- Expected: 3 rows with correct roles
```

### Query 10: Verify lastLoginAt Updates

```sql
-- Check lastLoginAt is updated on sign-in
SELECT 
  email,
  "lastLoginAt",
  (NOW() - "lastLoginAt") as "timeSinceLogin"
FROM "User"
WHERE email = '<test-email>';

-- Expected: lastLoginAt within last few minutes
```

### Query 11: Database Integrity Checks

```sql
-- Check referential integrity
SELECT 
  'Users without organization' as check_type,
  COUNT(*) as count
FROM "User" u
LEFT JOIN "Organization" o ON u."orgId" = o.id
WHERE o.id IS NULL

UNION ALL

SELECT 
  'Sessions without user',
  COUNT(*)
FROM "Session" s
LEFT JOIN "User" u ON s."userId" = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'Accounts without user',
  COUNT(*)
FROM "Account" a
LEFT JOIN "User" u ON a."userId" = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'ActivityLogs without user (system logs excluded)',
  COUNT(*)
FROM "ActivityLog" a
LEFT JOIN "User" u ON a."userId" = u.id
WHERE a."userId" IS NOT NULL AND u.id IS NULL;

-- Expected: All counts = 0
```

---

## Integration Testing

### Integration Test 1: Complete Registration → Verification → Sign-In Flow

**Objective**: End-to-end test of new user onboarding

**Steps**:
1. Sign up with "integration1@test.com"
2. Verify email using verification link
3. Sign in with credentials
4. Access protected route
5. Sign out

**Expected Results**:
- ✅ All steps complete without errors
- ✅ User record created and verified
- ✅ Organization created
- ✅ Activity log shows complete history
- ✅ Session cleaned up on sign-out

**Database Final State**:
```sql
-- User exists and verified
SELECT email, "emailVerified", "isActive" 
FROM "User" WHERE email = 'integration1@test.com';
-- Expected: emailVerified IS NOT NULL, isActive = true

-- No active sessions
SELECT COUNT(*) FROM "Session" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'integration1@test.com');
-- Expected: 0

-- Activity log complete
SELECT action, entity FROM "ActivityLog" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'integration1@test.com')
ORDER BY "createdAt";
-- Expected: CREATE (user), LOGIN, [other actions], LOGOUT
```

**Pass Criteria**: Complete flow works end-to-end

---

### Integration Test 2: Password Reset → Sign-In Flow

**Objective**: Test password recovery flow

**Steps**:
1. Sign up with "integration2@test.com", password "OldPass123!"
2. Verify email
3. Sign in once to confirm password works
4. Sign out
5. Request password reset
6. Complete password reset with new password "NewPass123!"
7. Attempt sign-in with old password (should fail)
8. Sign in with new password (should succeed)

**Expected Results**:
- ✅ Old password no longer works
- ✅ New password works
- ✅ Password hash changed in database
- ✅ All tokens cleaned up

**Pass Criteria**: Password reset flow works correctly

---

### Integration Test 3: OAuth → Credentials Linking

**Objective**: Test account linking between OAuth and credentials

**Steps**:
1. Sign in with Google using "oauth-link@gmail.com"
2. Sign out
3. Sign up with email/password using same email "oauth-link@gmail.com"
4. Verify email
5. Sign in with Google
6. Sign out
7. Sign in with email/password

**Expected Results**:
- ✅ Both sign-in methods work
- ✅ Only 1 user record exists
- ✅ 2 Account records exist (google + credentials)
- ✅ Both methods authenticate to same user

**Pass Criteria**: Account linking works

---

### Integration Test 4: Multi-Role API Access

**Objective**: Test RBAC enforcement across API

**Steps**:
1. Create 3 users: ADMIN, OPERATOR, CLIENT
2. Sign in as each user
3. Make API calls to various endpoints
4. Verify access control works

**Test Matrix**:
| Role | Endpoint | Expected |
|------|----------|----------|
| ADMIN | POST /api/users | 201 Created |
| OPERATOR | POST /api/users | 403 Forbidden |
| CLIENT | POST /api/users | 403 Forbidden |
| ADMIN | DELETE /api/pipelines/:id | 200 OK |
| OPERATOR | DELETE /api/pipelines/:id | 403 Forbidden |
| CLIENT | POST /api/intake | 201 Created |

**Pass Criteria**: All access controls enforced

---

### Integration Test 5: Session Expiry and Refresh

**Objective**: Test session expiry behavior

**Steps**:
1. Sign in with valid credentials
2. Wait until session expires (or manually expire in DB)
3. Attempt to access protected route
4. Observe re-authentication

**Expected Results**:
- ✅ Expired session invalidated
- ✅ User redirected to sign-in
- ✅ After sign-in, new session created
- ✅ Old session removed from database

**Pass Criteria**: Session expiry handled correctly

---

### Integration Test 6: Email Delivery Integration

**Objective**: Test SMTP integration for all email types

**Steps**:
1. Configure SMTP settings (use test SMTP service like Mailhog or Mailtrap)
2. Trigger each email type:
   - Verification email (sign-up)
   - Password reset email
3. Check inbox for emails
4. Verify email content

**Expected Results**:
- ✅ All emails delivered
- ✅ Emails contain correct links
- ✅ Emails use Astralis branding
- ✅ Both HTML and plain text versions present

**Pass Criteria**: All emails delivered correctly

---

## Acceptance Criteria Validation

### Acceptance Criterion 1: Users can register with email/password

**Validation**:
- [x] Sign-up form exists at `/auth/signup`
- [x] Form validates email format
- [x] Form validates password strength (8+ chars, uppercase, number)
- [x] Form validates name and organization name
- [x] Successful registration creates user and organization
- [x] User assigned ADMIN role (first user in org)
- [x] Verification email sent
- [x] Success message displayed

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 2: Users can sign in with email/password

**Validation**:
- [x] Sign-in form exists at `/auth/signin`
- [x] Form accepts email and password
- [x] Valid credentials authenticate successfully
- [x] Invalid credentials show error message
- [x] Session created on successful sign-in
- [x] User redirected to dashboard after sign-in
- [x] lastLoginAt timestamp updated
- [x] LOGIN activity logged

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 3: Users can sign in with Google OAuth

**Validation**:
- [x] "Sign in with Google" button exists
- [x] Button triggers Google OAuth flow
- [x] New users created automatically
- [x] Existing users authenticated (account linking)
- [x] Organization created for new OAuth users
- [x] Account record created linking provider
- [x] Session created
- [x] User redirected to dashboard

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 4: Email verification workflow works

**Validation**:
- [x] Verification email sent on sign-up
- [x] Email contains clickable verification link
- [x] Link includes unique token
- [x] Verification page loads when link clicked
- [x] Token validated correctly
- [x] emailVerified timestamp set on success
- [x] Token deleted after successful verification
- [x] Expired tokens rejected
- [x] Invalid tokens rejected
- [x] Success message displayed

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 5: Password reset workflow works

**Validation**:
- [x] Forgot password link exists on sign-in page
- [x] Password reset request page exists
- [x] Reset email sent with reset link
- [x] Reset link contains unique token
- [x] Reset password page loads
- [x] New password validated for strength
- [x] Password updated in database (hash changed)
- [x] Token deleted after successful reset
- [x] Old password no longer works
- [x] New password works for sign-in
- [x] Expired tokens rejected

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 6: Protected routes require authentication

**Validation**:
- [x] Middleware intercepts protected routes
- [x] Unauthenticated users redirected to sign-in
- [x] callbackUrl parameter preserved
- [x] Authenticated users can access protected routes
- [x] Session validated on each request
- [x] Expired sessions invalidate access
- [x] No protected content visible without auth

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 7: Role-based access control enforces permissions

**Validation**:
- [x] ADMIN role has full access
- [x] OPERATOR role has limited access (no user management)
- [x] CLIENT role has minimal access (own data only)
- [x] Permission matrix implemented
- [x] API endpoints check roles
- [x] Forbidden actions return 403 error
- [x] Users cannot escalate own role
- [x] Organization isolation enforced

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 8: Activity logging captures all critical actions

**Validation**:
- [x] User creation logged
- [x] Sign-in logged (LOGIN action)
- [x] Password changes logged
- [x] Logs include userId and orgId
- [x] Logs include timestamps
- [x] Logs include IP address and user agent (optional)
- [x] Logs include metadata (context)
- [x] Logs queryable for audit trail

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 9: Database migrations applied successfully

**Validation**:
- [x] Migration files exist in `prisma/migrations/`
- [x] Migration applied without errors
- [x] Account table exists
- [x] Session table exists
- [x] VerificationToken table exists
- [x] ActivityLog table exists
- [x] User table updated with new fields
- [x] All indexes created
- [x] Prisma client regenerated

**Verification Command**:
```bash
npx prisma migrate status
# Expected: All migrations applied
```

**Status**: ✅ PASS / ❌ FAIL

---

### Acceptance Criterion 10: All tests pass

**Validation**:
- [x] Manual testing checklist complete
- [x] Edge cases handled
- [x] Security tests pass
- [x] RBAC tests pass
- [x] Database verification queries pass
- [x] Integration tests pass
- [x] Performance acceptable (< 500ms avg)

**Status**: ✅ PASS / ❌ FAIL

---

## Test Data Requirements

### Required Test Emails

Create test email accounts for these scenarios:

1. **Standard Sign-Up**: test1@testastralis.com
2. **OAuth Testing**: (use personal Google account)
3. **Password Reset**: reset@testastralis.com
4. **Duplicate Email**: duplicate@testastralis.com
5. **Inactive Account**: inactive@testastralis.com
6. **RBAC Testing**:
   - admin@rbac.test
   - operator@rbac.test
   - client@rbac.test
7. **Multi-Org Testing**:
   - org-a@test.com (Organization Alpha)
   - org-b@test.com (Organization Beta)

### Test Organization Data

| Organization Name | User Count | Purpose |
|-------------------|------------|---------|
| Test Org Alpha | 3 | Multi-role testing |
| Test Org Beta | 1 | Multi-org testing |
| Acme Corporation | 1 | Standard sign-up |

### Test Password

Use this standard test password (meets all requirements):
```
TestPassword123!
```

---

## Known Issues & Limitations

### Known Issue 1: Email Verification Not Required for Sign-In

**Description**: Users can sign in without verifying email

**Severity**: Medium

**Impact**: Users may create accounts with fake emails

**Workaround**: Require email verification before accessing protected routes

**Recommendation**: Add check in sign-in flow:
```typescript
if (!user.emailVerified) {
  throw new Error('Please verify your email before signing in');
}
```

---

### Known Issue 2: No Rate Limiting on Sign-In

**Description**: No limit on sign-in attempts (brute force possible)

**Severity**: High (Security)

**Impact**: Attackers can attempt unlimited passwords

**Workaround**: None (requires implementation)

**Recommendation**: Add rate limiting middleware (Phase 7)

---

### Known Issue 3: Session Tokens Not Rotated

**Description**: Session tokens remain same for entire session

**Severity**: Low

**Impact**: Session fixation attack possible (mitigated by other controls)

**Workaround**: None

**Recommendation**: Implement token rotation on sensitive actions

---

### Limitation 1: Single Organization Per User

**Description**: Users can only belong to one organization

**Design Decision**: By design for Phase 1

**Future Enhancement**: Multi-org support in future phase

---

### Limitation 2: No Multi-Factor Authentication (MFA)

**Description**: Only single-factor authentication supported

**Design Decision**: Phase 1 scope limitation

**Future Enhancement**: Add MFA in Phase 7 (security hardening)

---

### Limitation 3: No Account Recovery Options

**Description**: If user loses access to email, cannot recover account

**Design Decision**: Phase 1 scope limitation

**Future Enhancement**: Add security questions or admin recovery flow

---

## Sign-Off Checklist

### QA Sign-Off

- [ ] All manual test cases executed
- [ ] All edge cases tested
- [ ] All security tests passed
- [ ] All RBAC tests passed
- [ ] Database integrity verified
- [ ] Integration tests completed
- [ ] Acceptance criteria validated
- [ ] Known issues documented
- [ ] Test report created
- [ ] Defects filed in tracking system

**QA Engineer**: ________________  
**Date**: ________________  
**Signature**: ________________

---

### Developer Sign-Off

- [ ] All code reviewed and merged
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Documentation updated
- [ ] Unit tests written (if applicable)
- [ ] Code follows style guide
- [ ] No security vulnerabilities
- [ ] Performance acceptable

**Developer**: ________________  
**Date**: ________________  
**Signature**: ________________

---

### Product Owner Sign-Off

- [ ] All acceptance criteria met
- [ ] User experience acceptable
- [ ] Email templates approved
- [ ] Error messages clear
- [ ] Branding consistent
- [ ] Ready for production deployment

**Product Owner**: ________________  
**Date**: ________________  
**Signature**: ________________

---

## Test Execution Summary

### Test Statistics

| Category | Total Tests | Passed | Failed | Blocked | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| Manual Tests | 35 | __ | __ | __ | __% |
| Edge Cases | 10 | __ | __ | __ | __% |
| Security Tests | 8 | __ | __ | __ | __% |
| RBAC Tests | 6 | __ | __ | __ | __% |
| Integration Tests | 6 | __ | __ | __ | __% |
| **TOTAL** | **65** | **__** | **__** | **__** | **__%** |

### Defects Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | __ | __ |
| High | __ | __ |
| Medium | __ | __ |
| Low | __ | __ |
| **Total** | **__** | **__** |

### Recommendation

Based on test results:
- ✅ **APPROVED FOR PRODUCTION**: All tests pass, no critical defects
- ⚠️ **APPROVED WITH CONDITIONS**: Minor issues, deploy with monitoring
- ❌ **NOT APPROVED**: Critical failures, must fix before deployment

**Overall Assessment**: ______________________________

**Signed**: ________________  
**Date**: ________________

---

## Appendix: Quick Reference Commands

### Database Queries

```bash
# Connect to database
psql $DATABASE_URL

# Check user count
SELECT COUNT(*) FROM "User";

# Check recent sign-ups
SELECT email, "createdAt" FROM "User" 
ORDER BY "createdAt" DESC LIMIT 10;

# Check active sessions
SELECT COUNT(*) FROM "Session" WHERE expires > NOW();

# Check activity logs
SELECT action, COUNT(*) FROM "ActivityLog" 
GROUP BY action ORDER BY COUNT(*) DESC;
```

### Testing Commands

```bash
# Start dev server
npm run dev

# Check environment
env | grep -E "NEXTAUTH|SMTP|DATABASE"

# Reset database (dev only)
npx prisma migrate reset

# View migrations
npx prisma migrate status

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### Email Testing (Mailhog)

```bash
# Start Mailhog (if using)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# View emails at http://localhost:8025
```

---

**END OF TEST PLAN**

This test plan is comprehensive and ready for execution. Report all issues found during testing with steps to reproduce, expected vs actual results, and severity assessment.
