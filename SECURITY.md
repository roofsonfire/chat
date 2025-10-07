# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version  | Supported |
| -------- | --------- |
| Latest   | ✅ Yes    |
| < Latest | ❌ No     |

## Reporting a Vulnerability

The security of our users is extremely important to us. If you discover a security vulnerability, please follow these steps:

### 🚨 **Do NOT** create a public issue for security vulnerabilities

Instead, please report security issues privately using one of these methods:

### Option 1: GitHub Security Advisories (Recommended)

1. Go to the [Security Advisories page](https://github.com/roofsonfire/chat/security/advisories)
2. Click "Report a vulnerability"
3. Fill out the form with detailed information

### Option 2: Email (Alternative)

Send an email to [INSERT_SECURITY_EMAIL_HERE] with:

- Subject: "Security Vulnerability Report - Chat Application"
- Detailed description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact assessment
- Any suggested fixes or mitigations

## What to Include in Your Report

Please provide as much information as possible:

- **Description**: Clear description of the vulnerability
- **Impact**: What could an attacker accomplish?
- **Reproduction**: Step-by-step instructions to reproduce
- **Environment**: Browser, OS, Node.js version, etc.
- **Screenshots**: If applicable
- **Suggested Fix**: If you have ideas for remediation

## Response Timeline

- **Initial Response**: Within 24-48 hours
- **Status Update**: Within 7 days
- **Resolution**: We aim to resolve critical issues within 30 days

## Security Measures Already in Place

Our application includes comprehensive security measures:

### Authentication & Authorization

- NextAuth.js with secure session management
- Bcrypt password hashing with salt rounds
- Environment-based user configuration
- JWT token-based authentication

### Rate Limiting

- IP-based rate limiting (5 requests per 10 seconds)
- In-memory rate limiting with sliding window
- Automatic request throttling

### Security Headers

- **HSTS** (Strict-Transport-Security)
- **CSP** (Content-Security-Policy)
- **X-Frame-Options** (Clickjacking protection)
- **X-Content-Type-Options** (MIME sniffing protection)
- **X-XSS-Protection**
- **Referrer-Policy**
- **Permissions-Policy**

### Input Validation

- Zod schema validation for all inputs
- Image format and size validation
- Message content length limits
- Runtime type checking

### CSRF Protection

- Origin validation for state-changing requests
- Same-origin policy enforcement
- Secure cookie configuration

### Infrastructure Security

- HTTPS enforcement in production
- Environment variable validation
- Secure Docker configuration
- Google Cloud Run deployment with IAM

## Scope

This security policy covers:

- ✅ The main chat application
- ✅ API endpoints and authentication
- ✅ Client-side security issues
- ✅ Infrastructure misconfigurations
- ✅ Dependency vulnerabilities

This policy does **NOT** cover:

- ❌ Issues in third-party services (Google Vertex AI, etc.)
- ❌ Social engineering attacks
- ❌ Physical security
- ❌ Issues requiring physical access to servers

## Disclosure Policy

- We follow **responsible disclosure** practices
- We will acknowledge your contribution in our security acknowledgments
- We request that you do not publicly disclose the vulnerability until we have had a chance to address it
- We commit to keeping you informed throughout the remediation process

## Security Acknowledgments

We would like to thank the following individuals for responsibly disclosing security vulnerabilities:

_No vulnerabilities have been reported yet._

## Contact Information

For security-related questions that are not vulnerabilities, you can:

- Open a regular GitHub issue with the "security" label
- Start a discussion in [GitHub Discussions](https://github.com/roofsonfire/chat/discussions)

---

**Last Updated**: January 2025  
**Next Review**: Quarterly
