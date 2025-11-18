# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (November 2025)

- **Repository Structure Cleanup**
  - Removed duplicate .md files from root directory
  - Consolidated all documentation under docs/ structure
  - Improved project organization and navigation

### Fixed (November 2025)

- **UI/UX Improvements** (PR #127)
  - Fixed image aspect ratio issues (natural proportions vs forced ratios)
  - Simplified loading states (single AI thinking dots vs multiple skeletons)
  - Improved image preview responsiveness in message input
  - Enhanced development CSP rules for hot reloading

- **Workflow Stability** (PR #127)
  - Resolved GitHub Actions test failures
  - Fixed security headers tests with proper NODE_ENV mocking
  - Updated rate limit tests to match actual API limits (3 req/30s)
  - All 237 tests now pass successfully

### Security (November 2025)

- **Comprehensive Security Hardening**
  - Remediated 9 security findings from professional audit
  - Enhanced cookie security (httpOnly, secure, sameSite attributes)
  - Strengthened CSRF protection (Origin/Referer validation)
  - Increased bcrypt rounds to 12 (NIST compliance)
  - Implemented automatic PII sanitization in logs
  - Added 57 new security tests (295 total tests)

## [0.1.0] - November 2025

_Initial production-ready release with comprehensive security, AI capabilities, and modern web architecture._

### Added

### Added

- **Core Features**
  - AI chat interface with Google Vertex AI (Gemini 2.5 Flash)
  - Real-time streaming responses with Server-Sent Events
  - Multimodal support (text + image inputs)
  - Dynamic model selection (Gemini 1.5 Flash, Pro, Vision)
  - Image generation capabilities
- **Authentication & Security**
  - NextAuth.js integration with Google OAuth
  - Invite-only allowlist system (environment-based)
  - Test credentials provider for development
  - Comprehensive security middleware (CSP, HSTS, rate limiting)
  - In-memory rate limiting (5 req/10s per IP)
- **Documentation**
  - Comprehensive documentation suite (200+ markdown files)
  - Architecture Decision Records (ADRs)
  - GitHub Copilot integration with detailed instructions
  - API documentation with request/response examples
  - Deployment guides for Google Cloud Run
  - Security audit reports and threat model
  - Development and contribution guidelines
- **Developer Experience**
  - TypeScript strict mode with comprehensive type definitions
  - shadcn/ui v4 component library
  - Tailwind CSS 4 for styling
  - Vitest for unit and integration testing
  - Storybook for component development
  - ESLint + Prettier with pre-commit hooks
  - VS Code and Zed Editor configurations

- **Infrastructure**
  - Google Cloud Run deployment
  - Workload Identity Federation (keyless authentication)
  - Secret Manager integration
  - GitHub Actions CI/CD pipeline
  - Docker containerization
  - Automated deployment workflows

### Changed

- Migrated from Pages Router to Next.js 15 App Router
- Upgraded to React 19 with Server Components
- Switched from Upstash Redis to in-memory rate limiting
- Consolidated documentation structure (root → docs/)

### Fixed

- OAuth redirect URI configuration for production
- Allowlist email validation
- Environment variable validation with Zod
- Git history cleanup (removed accidental .env files)

### Security

- Implemented comprehensive security headers
- Added rate limiting to prevent abuse
- Configured Content Security Policy
- Set up secure session management
- Enabled HTTPS-only cookies
- Implemented input validation for all API endpoints

---

## Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version when making incompatible API changes
- **MINOR** version when adding functionality in a backward compatible manner
- **PATCH** version when making backward compatible bug fixes

### Release Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes following [Conventional Commits](https://www.conventionalcommits.org/)
3. Run tests: `npm test`
4. Create pull request
5. After merge, run: `npm run version` (auto-generates changelog)
6. Push tags: `git push --follow-tags origin main`

### Commit Types

- `feat`: New feature → MINOR version bump
- `fix`: Bug fix → PATCH version bump
- `docs`: Documentation only → No version bump (unless published docs)
- `style`: Code style changes → No version bump
- `refactor`: Code refactoring → No version bump (unless breaking)
- `test`: Adding tests → No version bump
- `chore`: Maintenance → No version bump
- `BREAKING CHANGE`: → MAJOR version bump (in commit footer)

### Example Commits

```bash
# Minor version bump (0.1.0 → 0.2.0)
feat(chat): add voice input support

# Patch version bump (0.1.0 → 0.1.1)
fix(auth): resolve session timeout issue

# Major version bump (0.1.0 → 1.0.0)
feat(api): redesign chat endpoint

BREAKING CHANGE: The /api/chat endpoint now requires authentication
and uses a different request format. See migration guide in docs/
```

---

## Links

- **Repository**: [github.com/roofsonfire/chat](https://github.com/roofsonfire/chat)
- **Production**: [chat.daza.ar](https://chat.daza.ar)
- **Documentation**: [docs/README.md](docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/roofsonfire/chat/issues)

[Unreleased]: https://github.com/roofsonfire/chat/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/roofsonfire/chat/releases/tag/v0.1.0
