# OAuth Allowlist Runtime Fix

**Date**: November 9, 2025  
**Issue**: OAuthCallback error preventing login  
**Status**: ✅ FIXED & DEPLOYED

## Problem

Users authenticated successfully with Google OAuth but were immediately redirected back to login with `error=OAuthCallback`.

**Root Cause**: The allowlist was being loaded at **build time** instead of **runtime**, meaning the Docker image had stale/empty allowlist values instead of reading from Cloud Run secrets.

## Code Issue

**File**: `src/lib/auth/logic.ts`

**Before** (Line 6):

```typescript
import { allowlist } from "@/lib/auth/allowlist"; // ❌ Static import - build time
```

**Before** (Line 50):

```typescript
const isAllowed = allowlist.includes(user.email); // ❌ Uses build-time value
```

This caused the allowlist to be frozen at Docker build time, not reading the `ALLOWED_EMAILS` secret from Cloud Run at runtime.

## Solution

**After** (Line 6):

```typescript
import { getAllowlist } from "@/lib/auth/allowlist"; // ✅ Import function
```

**After** (Line 50):

```typescript
const isAllowed = getAllowlist().includes(user.email); // ✅ Calls function at runtime
```

Now the allowlist is evaluated **at runtime** when the user logs in, correctly reading the `ALLOWED_EMAILS` environment variable from Cloud Run secrets.

## Fix Details

**Commit**: `751a25f` - "fix(auth): use runtime allowlist evaluation for OAuth callbacks"

**Changed Files**:

- `src/lib/auth/logic.ts` - Updated to use `getAllowlist()` function
- `tests/unit/auth-logic.test.ts` - Updated import for consistency

**Tests**: ✅ All 158 tests passing

**Deployment**:

- Run ID: 19211866493
- Status: ✅ Success
- Production: https://chat.daza.ar

## How It Works Now

```typescript
// src/lib/auth/allowlist.ts
export function getAllowlist(): string[] {
  return env.ALLOWED_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}
```

**Flow**:

1. User authenticates with Google OAuth
2. NextAuth callback receives user email
3. Calls `getAllowlist()` which reads `env.ALLOWED_EMAILS`
4. `env.ALLOWED_EMAILS` is populated from Cloud Run secret at container startup
5. Email is checked against runtime allowlist
6. If allowed, session is created; otherwise, access denied

## Environment Configuration

**Cloud Run Secret**: `allowed-emails`

- Contains: Comma-separated list of authorized emails
- Example: `user1@example.com,user2@example.com`

**Environment Variable**: `ALLOWED_EMAILS`

- Source: Secret Manager secret `allowed-emails:latest`
- Loaded at: Container startup (runtime)
- Accessed by: `env.ALLOWED_EMAILS` (validated via Zod)

## Verification

Test login at https://chat.daza.ar:

1. ✅ Click "Sign in with Google"
2. ✅ Authenticate with Google account
3. ✅ Email checked against runtime allowlist
4. ✅ If email in `allowed-emails` secret → Session created → Redirect to chat
5. ✅ If email NOT in secret → Access denied → Redirect to login

## Related Issues

This fix resolves the OAuth callback error that appeared after:

- ✅ Rate limit fix deployment (Run #19205409709)
- ✅ Workload Identity Federation setup
- ✅ Production deployment with secrets

## Key Lesson

**Always use functions for runtime configuration**, not static imports:

❌ **Bad**: `import { config } from "./config"`  
✅ **Good**: `import { getConfig } from "./config"`

Static imports are evaluated once at module load (build time), while function calls evaluate at runtime and can access environment variables properly.

---

**Production Status**: ✅ LIVE  
**All Systems**: ✅ OPERATIONAL  
**OAuth Login**: ✅ WORKING
