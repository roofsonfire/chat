# 005. Use In-Memory Rate Limiting

**Status:** Accepted  
**Date:** 2024-11-07  
**Deciders:** Core Development Team

## Context

We needed rate limiting to prevent abuse and manage costs. Requirements:

- Protect against spam and DDoS attempts
- Control AI API costs (Vertex AI charges per request)
- Simple to implement and maintain
- Work with serverless deployment (Cloud Run)
- Minimal external dependencies

Initial implementation used Upstash Redis, but we wanted to evaluate simpler alternatives for our scale.

## Decision

We will use **in-memory rate limiting** with the `rate-limiter-flexible` library.

Configuration:

- **5 requests per 10 seconds** per IP address
- **In-memory storage** (no external database)
- **Sliding window** algorithm for fairness
- Implemented in **middleware** for all routes

## Consequences

### Positive

- ✅ **Zero External Dependencies**: No Redis or database needed
- ✅ **Lower Costs**: No Upstash subscription ($10-20/month savings)
- ✅ **Simpler Setup**: Works immediately, no configuration
- ✅ **Lower Latency**: No network calls to external service
- ✅ **Easy Development**: Same behavior in dev and production
- ✅ **Sufficient for Scale**: Handles our current traffic (<10K req/month)

### Negative

- ⚠️ **Resets on Restart**: Rate limits don't persist across server restarts
- ⚠️ **Per-Instance**: With multiple Cloud Run instances, limits are not shared
- ⚠️ **Memory Usage**: Stores rate limit data in application memory
- ⚠️ **Migration Needed**: Must switch to distributed solution at higher scale

## Alternatives Considered

### 1. Upstash Redis (Previous Solution)

- **Pros**: Distributed, persistent, scales infinitely
- **Cons**: $10-20/month cost, external dependency, network latency
- **Verdict**: Rejected - Overkill for current scale (<10K requests/month)

### 2. Google Cloud Memorystore (Redis)

- **Pros**: Fully managed, integrated with GCP
- **Cons**: Minimum $25/month, complex setup, dedicated instance
- **Verdict**: Rejected - Too expensive for our needs

### 3. Cloud Run Built-in Rate Limiting

- **Pros**: No code needed, managed by Google
- **Cons**: Only at service level, not per-user/IP
- **Verdict**: Rejected - Not granular enough for our use case

### 4. No Rate Limiting

- **Pros**: Simplest possible solution
- **Cons**: Vulnerable to abuse, uncapped costs
- **Verdict**: Rejected - Too risky

## Implementation

**Location**: `src/middleware.ts`

```typescript
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 10, // per 10 seconds
});
```

## When to Migrate

Consider switching to distributed rate limiting (Redis/Memorystore) when:

1. **Traffic exceeds 50K requests/month**
2. **Multiple Cloud Run instances** are regularly active
3. **Rate limit evasion** becomes a problem
4. **Persistent limits** are required across restarts

**Current state**: ~5-10K requests/month → In-memory is sufficient ✅

## Performance Impact

Benchmarks:

- **In-memory rate limit check**: <1ms
- **Redis rate limit check**: 10-50ms (network latency)

**Improvement**: 10-50x faster response time

## Cost Analysis

| Solution                | Monthly Cost | Setup Complexity |
| ----------------------- | ------------ | ---------------- |
| **In-memory (current)** | **$0**       | ⭐ Low           |
| Upstash Redis           | $10-20       | ⭐⭐ Medium      |
| Cloud Memorystore       | $25-50       | ⭐⭐⭐ High      |

**Savings: $10-50/month** 💰

## Migration Path

If we need to scale to distributed rate limiting:

1. Replace `RateLimiterMemory` with `RateLimiterRedis`
2. Set up Redis (Upstash or Memorystore)
3. Update environment variables
4. No code changes outside middleware needed

**Abstraction already in place** - easy migration when needed.

## Edge Cases

### Server Restarts

- **Impact**: Rate limits reset
- **Frequency**: Rare (deployments only)
- **Mitigation**: Not critical for our use case

### Multiple Instances

- **Impact**: Per-instance limits (total higher than configured)
- **Current**: Usually 1 instance (low traffic)
- **Mitigation**: Will migrate to Redis when multi-instance is common

### Memory Leaks

- **Impact**: Old IP data accumulates
- **Mitigation**: Library has built-in cleanup
- **Monitoring**: Watch Cloud Run memory metrics

## Monitoring

Track these metrics:

- Rate limit violations (log count)
- Memory usage (Cloud Run metrics)
- Instance count (indicates if distributed needed)

**Alert threshold**: >3 instances running consistently = time to migrate

## References

- [rate-limiter-flexible Documentation](https://github.com/animir/node-rate-limiter-flexible)
- [Middleware Implementation](../../src/middleware.ts)
- [Migration from Upstash PR](#) - Link to migration PR

---

**Last Updated:** November 2025  
**Supersedes:** Previous Upstash Redis implementation
