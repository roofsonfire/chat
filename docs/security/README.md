# Security Documentation

Comprehensive security documentation including audits, assessments, remediation plans, and operational runbooks.

## Overview

This directory contains all security-related documentation for the chat application, covering threat modeling, security assessments, remediation tracking, and operational procedures.

## Key Documents

### Assessments & Audits

- [Security Assessment Report](SECURITY-ASSESSMENT-REPORT.md) - Comprehensive security assessment
- [Security Assessment Validation](SECURITY-ASSESSMENT-VALIDATION.md) - Validation of assessment findings
- [Security Audit](SECURITY-AUDIT.md) - External security audit results
- [Security Clearance Report](SECURITY-CLEARANCE-REPORT.md) - Vendor access and clearance tracking

### Planning & Remediation

- [Security Remediation Plan](SECURITY-REMEDIATION-PLAN.md) - Action plan for security improvements
- [Security Findings Remediation Status](SECURITY-FINDINGS-REMEDIATION-STATUS.md) - Tracking remediation progress

### Operational Procedures

- [Logging Runbook](LOGGING-RUNBOOK.md) - Log retention, sinks, metrics, and alerting
- [Logging Runbook Execution](LOGGING-RUNBOOK-EXECUTION.md) - Evidence of production execution
- [Threat Model](THREAT-MODEL.md) - Assets, trust boundaries, and threats
- [Tabletop Report](TABLETOP-REPORT.md) - Incident response exercise outcomes

## Security Architecture

The application employs defense-in-depth security:

```
Request → Security Headers → Rate Limit → Auth → Validation → Business Logic
```

### Key Security Controls

1. **Authentication** - Google OAuth + invite-only allowlist
2. **Rate Limiting** - 5 requests/10s per IP (in-memory)
3. **Input Validation** - Zod schemas for all external data
4. **Security Headers** - CSP, HSTS, X-Frame-Options, etc.
5. **Secrets Management** - Google Cloud Secret Manager
6. **Logging & Monitoring** - Structured logging with Cloud Logging

## Related Documentation

- [Main Security Doc](../SECURITY.md) - Security policy and vulnerability disclosure
- [Middleware Security](../features/MIDDLEWARE-SECURITY-SUMMARY.md) - Middleware protections
- [User Management](../USER-MANAGEMENT.md) - Authentication and access controls

## Quick Links

- **Report Security Issues:** See [SECURITY.md](../SECURITY.md)
- **Security Findings:** [Remediation Status](SECURITY-FINDINGS-REMEDIATION-STATUS.md)
- **Logging Setup:** [Logging Runbook](LOGGING-RUNBOOK.md)
- **Threat Model:** [THREAT-MODEL.md](THREAT-MODEL.md)

---

**Last Updated:** November 2025
**Security Contact:** See [SECURITY.md](../SECURITY.md)
