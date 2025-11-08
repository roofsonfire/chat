# Session 1 Manual Testing Guide

**Finding #1 Cookie Security Implementation**  
**Date:** November 8, 2025  
**Tester:** Developer  
**Duration:** 30-45 minutes

---

## Prerequisites

✅ Code committed: `7a9c8cb`  
✅ Unit tests passing: 22/22  
✅ Branch: `security-remediation`

---

## Test Environment Setup

### 1. Start Development Server

```bash
npm run dev
```

Wait for: `✓ Ready in Xms`  
URL: http://localhost:3000

### 2. Open Browser DevTools

**Chrome/Edge:**

- Press `F12` or `Ctrl+Shift+I` (Linux/Windows)
- Navigate to: **Application** tab → **Cookies** → `http://localhost:3000`

**Firefox:**

- Press `F12`
- Navigate to: **Storage** tab → **Cookies** → `http://localhost:3000`

---

## Test Cases

### Test 1: Verify No Cookies Before Login ✅

**Steps:**

1. Open http://localhost:3000
2. Check DevTools → Cookies
3. Verify no `next-auth.*` cookies present

**Expected Result:**  
❌ No cookies (clean state)

**Actual Result:**  
[ ] Pass [ ] Fail

---

### Test 2: Login and Verify Cookie Attributes ✅

**Steps:**

1. Click "Sign In" button
2. Select Google OAuth or use credentials (if enabled)
3. Complete authentication flow
4. Return to app
5. Open DevTools → Cookies → `http://localhost:3000`

**Expected Cookies (Development Mode):**

| Cookie Name               | Value            |
| ------------------------- | ---------------- |
| `next-auth.session-token` | JWT token (long) |
| `next-auth.callback-url`  | URL (optional)   |
| `next-auth.csrf-token`    | Hash value       |

**Expected Attributes (Development - NODE_ENV=development):**

For **each cookie**, verify these attributes:

| Attribute    | Expected Value          | Session Token | Callback URL | CSRF Token |
| ------------ | ----------------------- | ------------- | ------------ | ---------- |
| **HttpOnly** | ✅ (checked/true)       | [ ]           | [ ]          | [ ]        |
| **Secure**   | ❌ (unchecked/false)    | [ ]           | [ ]          | [ ]        |
| **SameSite** | Lax                     | [ ]           | [ ]          | [ ]        |
| **Path**     | `/`                     | [ ]           | [ ]          | [ ]        |
| **Domain**   | (empty/localhost)       | [ ]           | [ ]          | [ ]        |
| **Expires**  | Session or 24h from now | [ ]           | [ ]          | [ ]        |

**Cookie Name Prefixes (Development):**

- [ ] NO `__Secure-` prefix (secure disabled in dev)
- [ ] NO `__Host-` prefix on CSRF (secure disabled in dev)

**Actual Result:**  
[ ] Pass [ ] Fail

**Notes:**

---

### Test 3: Verify HttpOnly Protection (XSS Prevention) ✅

**Steps:**

1. Stay on logged-in page
2. Open DevTools → **Console** tab
3. Try to read cookies with JavaScript:

```javascript
document.cookie;
```

**Expected Result:**  
Empty string `""` or cookies WITHOUT `next-auth.*` tokens

**Why:** httpOnly cookies cannot be accessed by JavaScript, preventing XSS attacks.

**Actual Result:**  
[ ] Pass - Cannot read next-auth cookies  
[ ] Fail - Can read next-auth cookies

**Console Output:**

```
[paste output here]
```

---

### Test 4: Logout and Verify Cookie Deletion ✅

**Steps:**

1. Click "Sign Out" button
2. Confirm sign out
3. Check DevTools → Cookies

**Expected Result:**  
❌ All `next-auth.*` cookies deleted

**Actual Result:**  
[ ] Pass [ ] Fail

---

### Test 5: Production Cookie Behavior (Optional - Docker Build)

**Note:** This test requires building and running production Docker container.

**Steps:**

1. Stop dev server
2. Build production image:

```bash
docker build -t chat-app:test .
```

3. Run with production env:

```bash
docker run -p 3000:3000 --env-file .env.local \
  -e NODE_ENV=production \
  chat-app:test
```

4. Login at http://localhost:3000
5. Inspect cookies in DevTools

**Expected Attributes (Production - NODE_ENV=production):**

| Attribute    | Expected Value    |
| ------------ | ----------------- |
| **HttpOnly** | ✅ (checked/true) |
| **Secure**   | ✅ (checked/true) |
| **SameSite** | Lax               |
| **Path**     | `/`               |
| **Domain**   | `.daza.ar`        |

**Cookie Name Prefixes (Production):**

- [ ] `__Secure-next-auth.session-token` (Secure prefix present)
- [ ] `__Secure-next-auth.callback-url` (Secure prefix present)
- [ ] `__Host-next-auth.csrf-token` (Host prefix present)

**Note:** `__Host-` prefix requires:

- Secure flag = true
- Domain = empty (set by browser)
- Path = /

**Actual Result:**  
[ ] Pass [ ] Fail [ ] Skipped

---

## Test Summary

| Test Case                  | Status      | Notes |
| -------------------------- | ----------- | ----- |
| 1. No cookies before login | [ ] P [ ] F |       |
| 2. Cookie attributes (dev) | [ ] P [ ] F |       |
| 3. HttpOnly protection     | [ ] P [ ] F |       |
| 4. Cookie deletion         | [ ] P [ ] F |       |
| 5. Production behavior     | [ ] P [ ] F |       |

**Overall Result:** [ ] PASS [ ] FAIL

---

## Validation Checklist

After testing, verify:

- [ ] All critical tests pass (Test 1-4)
- [ ] HttpOnly prevents JavaScript access (Test 3)
- [ ] Cookies deleted on logout (Test 4)
- [ ] No TypeScript errors: `npm run type-check`
- [ ] All unit tests pass: `npm run test`
- [ ] Ready to merge to develop

---

## Issues & Resolutions

**Issue:**

**Resolution:**

---

## Sign-off

**Tested By:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Status:** [ ] APPROVED [ ] NEEDS WORK

---

## Next Steps

### If All Tests Pass ✅

1. Commit manual test results (this file)
2. Update SECURITY-ASSESSMENT-REPORT.md:
   - Mark Finding #1 as REMEDIATED
   - Add remediation date
3. Merge to develop:

```bash
git checkout develop
git merge security-remediation
git push origin develop
```

4. **🎉 Session 1 Complete!**
5. Schedule Session 2 (MEDIUM priority)

### If Any Tests Fail ❌

1. Document failures in this file
2. Debug issues
3. Fix code
4. Re-run unit tests: `npm run test`
5. Re-run manual tests
6. Iterate until all pass

---

## Reference

- **Remediation Plan:** `SECURITY-REMEDIATION-PLAN.md`
- **Security Report:** `SECURITY-ASSESSMENT-REPORT.md` (Finding #1)
- **Implementation:** `src/lib/auth/logic.ts` (lines 173-202)
- **Unit Tests:** `tests/unit/auth-cookies.test.ts` (22 tests)
