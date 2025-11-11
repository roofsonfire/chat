# ADR 006: Move Allowlist to Environment Variables

**Status:** Accepted
**Date:** 2025-11-07
**Deciders:** Core Development Team
**Tags:** security, privacy, authentication

## Context

The initial implementation stored allowed email addresses as a hardcoded array in source code (`src/lib/auth/allowlist.ts`). This created several security and privacy concerns:

1. **Privacy Exposure**: Personal email addresses committed to git history
2. **Spam/Phishing Risk**: Emails visible in public repository could be scraped
3. **No Flexibility**: Adding users required code changes and redeployment
4. **Best Practice Violation**: Sensitive data should not be in source code
5. **Scalability Issues**: Not suitable for production use

**Original Implementation:**

```typescript
export const allowlist = [
  "user1@example.com",
  "user2@example.com",
  "user3@example.com",
];
```

## Decision

Move the allowlist to environment variables using a comma-separated string format.

**Implementation:**

```typescript
// src/lib/auth/allowlist.ts
import { env } from "@/lib/env";

export function getAllowlist(): string[] {
  return env.ALLOWED_EMAILS.split(",").map((email) => email.trim());
}

export const allowlist = getAllowlist();
```

**Environment Configuration:**

```bash
# .env.local
ALLOWED_EMAILS=user1@example.com,user2@example.com,user3@example.com
```

## Consequences

### Positive

✅ **Privacy Protection**: Email addresses no longer in source code
✅ **Security**: Emails stored in Google Cloud Secret Manager for production
✅ **Flexibility**: Can update allowlist without code changes (restart required)
✅ **Best Practices**: Follows security standards for sensitive data
✅ **Git History Cleanup**: Combined with history rewrite to remove exposed emails
✅ **Validation**: Zod schema validates all emails are properly formatted

### Negative

⚠️ **Restart Required**: Changes to allowlist require application restart
⚠️ **Configuration Complexity**: One more environment variable to manage
⚠️ **Migration Needed**: Existing deployments must add new env var

### Neutral

- Maintains same authentication logic
- No performance impact
- Backward compatible (allowlist constant still exported)

## Alternatives Considered

### 1. Keep Hardcoded (Rejected)

**Pros:**

- Simplest implementation
- No configuration needed

**Cons:**

- ❌ Privacy violation
- ❌ Security risk
- ❌ Violates best practices

**Decision:** Rejected due to security concerns

### 2. Database Storage (Future Option)

**Pros:**

- Dynamic updates (no restart)
- Audit trail of changes
- Can add metadata (added date, role, etc.)
- Scalable for many users

**Cons:**

- Requires database infrastructure
- More complex implementation
- Database dependency for auth

**Decision:** Deferred until database is implemented (planned for Phase 2)

### 3. Google Cloud Firestore (Not Chosen)

**Pros:**

- Managed service
- Real-time updates
- No server restarts

**Cons:**

- Additional GCP service dependency
- Overkill for small allowlist
- More complex than env vars

**Decision:** Too complex for current needs

## Implementation Details

### Environment Variable Format

```bash
ALLOWED_EMAILS="email1@example.com,email2@example.com,email3@example.com"
```

### Validation

Added to `src/lib/env.ts`:

```typescript
ALLOWED_EMAILS: z
  .string()
  .min(1, "At least one email must be in the allowlist")
  .refine(
    (emails) => {
      const emailList = emails.split(",").map((e) => e.trim());
      return emailList.every((email) =>
        z.string().email().safeParse(email).success
      );
    },
    { message: "All emails must be valid email addresses" }
  ),
```

### Production Deployment

Stored in Google Cloud Secret Manager:

```bash
# Create secret
gcloud secrets create allowed-emails \
  --data-file=- <<< "user1@example.com,user2@example.com"

# Reference in Cloud Run
--set-secrets="ALLOWED_EMAILS=allowed-emails:latest"
```

### Migration Steps

1. ✅ Update `src/lib/env.ts` to include `ALLOWED_EMAILS`
2. ✅ Modify `src/lib/auth/allowlist.ts` to use environment variable
3. ✅ Update `.env.example` with new variable
4. ✅ Clean git history to remove exposed emails
5. ⏳ Create secret in Google Cloud Secret Manager
6. ⏳ Update production deployment
7. ⏳ Update staging deployment
8. ⏳ Update local development documentation

## Monitoring & Validation

### Health Checks

- Validate `ALLOWED_EMAILS` on application startup
- Log allowlist size (not contents) for debugging
- Fail fast if environment variable is invalid

### Testing

```typescript
// Test environment validation
it("should validate ALLOWED_EMAILS format", () => {
  process.env.ALLOWED_EMAILS = "user@example.com,test@example.com";
  expect(() => parseEnv()).not.toThrow();
});

it("should reject invalid email format", () => {
  process.env.ALLOWED_EMAILS = "invalid-email,user@example.com";
  expect(() => parseEnv()).toThrow();
});
```

## Future Considerations

### When to Move to Database

Consider migrating to database-based allowlist when:

- User count exceeds 50
- Need dynamic updates without restart
- Require audit trail of allowlist changes
- Need role-based access control
- Implementing user management UI

### Database Schema (Future)

```sql
CREATE TABLE allowlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  added_by VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  active BOOLEAN DEFAULT true
);

CREATE INDEX idx_allowlist_email ON allowlist(email);
```

## References

- [OWASP: Storing Secrets](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Google Cloud Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)
- [Environment Variable Security](https://12factor.net/config)

## Related ADRs

- [ADR 005: In-Memory Rate Limiting](005-in-memory-rate-limiting.md) - Similar environment-based configuration approach

## Changelog

- **2025-11-07**: Decision made and implemented
- **2025-11-07**: Git history cleanup performed
- **Future**: Plan migration to database when user count increases

---

**Status:** ✅ Implemented
**Next Review:** When database integration is ready
