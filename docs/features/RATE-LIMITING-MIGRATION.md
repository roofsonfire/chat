# Rate Limiting Migration Guide

**Status:** 📋 Future Migration (Not Currently Required)
**Current Implementation:** In-memory rate limiting
**Recommended Migration:** Upstash Redis (when scaling beyond 3 Cloud Run instances)
**Last Updated:** November 8, 2025

---

## Current Implementation

### Overview

The application currently uses **in-memory rate limiting** via `rate-limiter-flexible` with a memory store:

**File:** `src/middleware/rate-limit.ts`

```typescript
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 10, // per 10 seconds
});
```

### Current Behavior

- ✅ **Works perfectly** for single Cloud Run instance deployments
- ✅ **Simple** - no external dependencies
- ✅ **Fast** - in-process memory access
- ❌ **Resets on restart** - rate limits cleared when server restarts
- ❌ **Instance-isolated** - each Cloud Run instance has independent counters

### Limitations

**Scenario 1: Server Restart**

```
User makes 5 requests → Rate limit reached
Server restarts        → Counter resets to 0
User makes 5 more      → Rate limit bypassed
```

**Scenario 2: Multiple Cloud Run Instances**

```
Instance A: User makes 5 requests → Rate limited
Instance B: Same user makes 5 more → NOT rate limited (different counter)
Instance C: Same user makes 5 more → NOT rate limited (different counter)

Total: 15 requests from same IP (should be 5 max)
```

---

## When to Migrate

### Migration Triggers

Migrate to distributed rate limiting when **any** of the following occur:

1. **Scaling Beyond 3 Instances**
   - Current: Cloud Run scales 0-10 instances
   - Trigger: Regularly running 3+ instances during normal traffic
   - Check: `gcloud run services describe chat --region us-central1 --format="value(status.traffic)"`

2. **Rate Limit Bypass Detected**
   - Monitor logs for patterns suggesting distributed bypass
   - Multiple rapid requests from same IP across short timespan
   - User reports of inconsistent rate limiting behavior

3. **Account-Level Rate Limiting Needed**
   - Current: IP-based only
   - Future: Need to rate limit by user ID across all instances

4. **Compliance Requirements**
   - Security audit requires distributed rate limiting
   - Need guaranteed rate limit enforcement across all servers

### Current Status: ✅ **NOT REQUIRED**

- Single instance deployment is stable
- Rate limiting working effectively
- No bypass attempts detected
- Migration deferred until scaling need arises

---

## Migration Options

### Option 1: Upstash Redis (✅ Recommended)

**Pros:**

- ✅ Serverless Redis (no infrastructure management)
- ✅ Global edge caching for low latency
- ✅ Free tier: 10,000 requests/day
- ✅ REST API (no VPC required)
- ✅ Pay-as-you-go pricing
- ✅ Built-in dashboard and monitoring

**Cons:**

- ❌ Additional external dependency
- ❌ Slight latency increase (~10-50ms) vs in-memory
- ❌ Cost for high-volume production

**Pricing:**

- Free tier: 10K requests/day
- Pro plan: $0.20 per 100K requests
- Typical cost for this app: $10-20/month at scale

### Option 2: Google Cloud Memorystore (Redis)

**Pros:**

- ✅ Google-native solution
- ✅ High performance and reliability
- ✅ Managed backups and updates
- ✅ VPC security

**Cons:**

- ❌ Requires VPC connector (~$60/month minimum)
- ❌ More complex setup
- ❌ Higher cost ($45-$100/month minimum)
- ❌ Overkill for current scale

**Recommendation:** Use Upstash unless already using VPC/Memorystore for other services.

### Option 3: Google Cloud Firestore

**Pros:**

- ✅ Already available if using Firestore for data
- ✅ Serverless, no infrastructure
- ✅ Good integration with Cloud Run

**Cons:**

- ❌ Higher latency than Redis (~50-200ms)
- ❌ Less optimized for rate limiting use case
- ❌ Document write costs add up

**Recommendation:** Only if already heavily using Firestore.

---

## Migration Implementation (Upstash Redis)

### Step 1: Create Upstash Redis Instance

1. Sign up at [Upstash Console](https://console.upstash.com/)
2. Create new Redis database:
   - Name: `chat-rate-limiting`
   - Region: `us-central1` (same as Cloud Run)
   - Type: `Regional` (faster, cheaper)
   - TLS: Enabled
3. Copy credentials:
   - REST URL: `https://us1-YOUR-ID.upstash.io`
   - REST Token: `YOUR_TOKEN_HERE`

### Step 2: Add Environment Variables

Add to `.env.local` (development):

```env
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://us1-YOUR-ID.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_TOKEN_HERE
```

Add to Cloud Run secrets (production):

```bash
# Create secrets
echo -n "https://us1-YOUR-ID.upstash.io" | \
  gcloud secrets create UPSTASH_REDIS_REST_URL --data-file=-

echo -n "YOUR_TOKEN_HERE" | \
  gcloud secrets create UPSTASH_REDIS_REST_TOKEN --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding UPSTASH_REDIS_REST_URL \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding UPSTASH_REDIS_REST_TOKEN \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Update Environment Schema

**File:** `src/lib/env.ts`

```typescript
// Add to existing schema
export const envSchema = z.object({
  // ... existing vars ...

  // Rate Limiting (optional - fallback to memory if not set)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});
```

### Step 4: Install Upstash Redis SDK

```bash
npm install @upstash/redis
```

### Step 5: Update Rate Limit Middleware

**File:** `src/middleware/rate-limit.ts`

```typescript
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { NextRequest } from "next/server";

// Initialize rate limiter (Upstash or fallback to memory)
function createRateLimiter() {
  // Use Upstash Redis if configured
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    logger.info("Initializing Upstash Redis rate limiter");

    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    return new RateLimiterRedis({
      storeClient: redis,
      points: 5, // 5 requests
      duration: 10, // per 10 seconds
      blockDuration: 60, // Block for 60 seconds after exceeding
      keyPrefix: "rl:", // Redis key prefix
    });
  }

  // Fallback to in-memory for local development
  logger.warn("Using in-memory rate limiter (suitable for development only)");

  return new RateLimiterMemory({
    points: 5,
    duration: 10,
  });
}

const rateLimiter = createRateLimiter();

export async function rateLimitMiddleware(req: NextRequest) {
  const clientIp =
    (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0]?.trim() ??
    "127.0.0.1";

  try {
    const rateLimiterRes = await rateLimiter.consume(clientIp);

    logger.info("Rate limit check passed", {
      ip: clientIp,
      remaining: rateLimiterRes.remainingPoints,
      resetTime: new Date(Date.now() + rateLimiterRes.msBeforeNext),
    });

    return rateLimiterRes;
  } catch (error) {
    if (error && typeof error === "object" && "msBeforeNext" in error) {
      const msBeforeNext = (error as { msBeforeNext: number }).msBeforeNext;

      logger.warn("Rate limit exceeded", {
        ip: clientIp,
        retryAfter: Math.ceil(msBeforeNext / 1000),
      });

      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: Math.ceil(msBeforeNext / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(msBeforeNext / 1000).toString(),
          },
        }
      );
    }

    logger.error("Rate limiter error", { error });
    throw error;
  }
}
```

### Step 6: Update Tests

**File:** `tests/unit/rate-limit.test.ts` (create if not exists)

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Upstash Redis
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => ({
    // Mock methods
  })),
}));

describe("Rate Limit Middleware", () => {
  it("should use Upstash Redis when configured", () => {
    // Test implementation
  });

  it("should fallback to memory when Upstash not configured", () => {
    // Test implementation
  });

  it("should block requests after limit exceeded", async () => {
    // Test implementation
  });
});
```

### Step 7: Deploy and Verify

1. **Local Testing:**

```bash
npm run dev
# Make 6 rapid requests to /api/chat
# Verify 6th request returns 429
```

2. **Production Deployment:**

```bash
# Deploy with Upstash secrets
gcloud run deploy chat \
  --region us-central1 \
  --set-secrets="UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL:latest,UPSTASH_REDIS_REST_TOKEN=UPSTASH_REDIS_REST_TOKEN:latest"
```

3. **Monitoring:**

```bash
# Check Upstash dashboard for rate limit metrics
# Monitor Cloud Run logs for rate limit events
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"Rate limit\""
```

---

## Rollback Plan

If issues arise with Upstash:

1. **Remove environment variables** (rate limiter will fallback to memory)
2. **Redeploy** without Upstash secrets
3. **Investigate** issues in Upstash dashboard and Cloud Run logs
4. **Fix and retry** migration

---

## Performance Comparison

| Metric               | In-Memory    | Upstash Redis   |
| -------------------- | ------------ | --------------- |
| **Latency (median)** | <1ms         | ~10-30ms        |
| **Latency (p99)**    | ~1ms         | ~50-100ms       |
| **Consistency**      | Per-instance | Global          |
| **Restart Behavior** | Resets       | Persists        |
| **Scaling Behavior** | Isolated     | Shared          |
| **Cost**             | $0           | ~$10-20/month   |
| **Infrastructure**   | None         | Upstash account |

**Impact:** ~10-30ms additional latency per request is **acceptable** for the consistency benefits.

---

## Testing Checklist

Before deploying Redis-backed rate limiting:

- [ ] Upstash instance created and configured
- [ ] Environment variables set in Cloud Run
- [ ] Local development tested with fallback (memory)
- [ ] Production deployment tested with Upstash
- [ ] Rate limiting works across multiple instances
- [ ] Monitoring shows consistent rate limit enforcement
- [ ] Retry-After headers returned correctly
- [ ] Logs show Upstash initialization on startup
- [ ] No performance degradation detected
- [ ] Rollback plan documented and tested

---

## Monitoring

### Key Metrics

1. **Rate Limit Hit Rate**
   - Log every rate limit violation
   - Track IPs frequently hitting limits
   - Alert on unusual spike in rate limit violations

2. **Redis Performance**
   - Upstash dashboard: Latency, throughput
   - Cloud Run logs: Rate limiter response times
   - Alert on Redis errors or high latency (>100ms)

3. **Fallback Detection**
   - Log warning when fallback to memory occurs
   - Alert if production using memory store (config issue)

### Sample Monitoring Query (Cloud Logging)

```
resource.type="cloud_run_revision"
AND textPayload:"Rate limit"
AND severity>=WARNING
```

---

## Future Enhancements

### Account-Based Rate Limiting

Once user authentication is in place:

```typescript
// Rate limit by user ID instead of IP
const userId = req.session?.user?.id ?? clientIp;
const rateLimiterRes = await rateLimiter.consume(userId);
```

### Tiered Rate Limits

Different limits for different user types:

```typescript
const limits = {
  free: { points: 5, duration: 10 },
  pro: { points: 20, duration: 10 },
  enterprise: { points: 100, duration: 10 },
};

const userTier = getUserTier(req);
const rateLimiter = createRateLimiter(limits[userTier]);
```

### Dynamic Rate Limits

Adjust limits based on system load:

```typescript
const systemLoad = await getSystemLoad();
const multiplier = systemLoad < 0.7 ? 1.5 : 0.5;
const dynamicPoints = BASE_POINTS * multiplier;
```

---

## References

- [rate-limiter-flexible Documentation](https://github.com/animir/node-rate-limiter-flexible)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Upstash Pricing](https://upstash.com/pricing)
- [Google Cloud Memorystore](https://cloud.google.com/memorystore)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html#rate-limiting)

---

**Status:** ✅ Documentation complete. Migration ready when triggered by scaling needs.
