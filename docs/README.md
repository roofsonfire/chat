# Documentation Index

This directory holds everything that expands on the main `README.md`. Use the sections below to jump straight to the guide you need.

## 🎯 Quick Links

| For...                     | Start Here                                                                  |
| -------------------------- | --------------------------------------------------------------------------- |
| **New developers**         | [Orientation](#orientation) → [Getting Started](#getting-started)           |
| **GitHub Copilot context** | [.github/copilot-quick-reference.md](../.github/copilot-quick-reference.md) |
| **Code patterns**          | [.github/patterns/](../.github/patterns/)                                   |
| **Daily development**      | [DEVELOPMENT.md](DEVELOPMENT.md)                                            |
| **Deployment guide**       | [deployment/DEPLOY.md](deployment/DEPLOY.md)                                |
| **API reference**          | [API.md](API.md)                                                            |

## 📚 Documentation Optimization

We're currently optimizing our documentation for the AI-assisted development era:

- **[DOCUMENTATION-OPTIMIZATION-PLAN.md](DOCUMENTATION-OPTIMIZATION-PLAN.md)** – Full strategic plan
- **[DOCUMENTATION-OPTIMIZATION-SUMMARY.md](DOCUMENTATION-OPTIMIZATION-SUMMARY.md)** – Current progress and status

## Orientation

- [README.md](../README.md) – Product overview, quick start, and architecture snapshot.
- [PROJECT-STATUS.md](PROJECT-STATUS.md) – Release health, live environment state, and roadmap.
- [CONTRIBUTING.md](CONTRIBUTING.md) – Contribution guidelines for code and docs.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) – Community expectations.

## Getting Started

- [DEVELOPMENT.md](DEVELOPMENT.md) – Initial setup, environment configuration, and local workflows.
- [EDITOR-SETUP.md](EDITOR-SETUP.md) – VS Code and Zed configuration for a productive dev setup.
- [PROJECT-NAVIGATION.md](PROJECT-NAVIGATION.md) – Tips for finding files, commands, and patterns quickly.

## Build & Architecture

- [API.md](API.md) – HTTP and streaming endpoints with request/response contracts.
- [PERFORMANCE.md](PERFORMANCE.md) – Runtime metrics, optimizations, and monitoring hooks.
- [USER-MANAGEMENT.md](USER-MANAGEMENT.md) – Authentication model, session flow, and account policies.
- [features/FEATURE-FLAGS.md](features/FEATURE-FLAGS.md) – Flag inventory and rollout guidance.
- [features/DATABASE-INTEGRATION.md](features/DATABASE-INTEGRATION.md) – Data layer decisions and roadmap.
- [migration/DYNAMIC-MODEL-IMPLEMENTATION-SUMMARY.md](migration/DYNAMIC-MODEL-IMPLEMENTATION-SUMMARY.md) – Architectural summary of the dynamic model selector.

## AI & Data Products

- [features/MODEL-SELECTION.md](features/MODEL-SELECTION.md) – How models are chosen at runtime.
- [migration/DYNAMIC-MODEL-FETCHING.md](migration/DYNAMIC-MODEL-FETCHING.md) – Fetching logic for Vertex AI catalogs.
- [migration/GEMINI-2.0-MIGRATION.md](migration/GEMINI-2.0-MIGRATION.md) – Previous upgrade notes.
- [migration/GEMINI-2.5-IMPLEMENTATION.md](migration/GEMINI-2.5-IMPLEMENTATION.md) – Current Gemini deployment details.
- [features/image-generation/](features/image-generation/) – Image pipeline documentation and assets.

## Security & Compliance

- [SECURITY.md](SECURITY.md) – Vulnerability disclosure and security practices.
- [features/MIDDLEWARE-SECURITY-SUMMARY.md](features/MIDDLEWARE-SECURITY-SUMMARY.md) – Middleware protections and threat model.
- [OAUTH-SETUP.md](OAUTH-SETUP.md) – OAuth configuration, secrets, and troubleshooting.
- [USER-MANAGEMENT.md](USER-MANAGEMENT.md) – Identity and access controls (also linked under Build & Architecture).
- [SECURITY-AUDIT.md](SECURITY-AUDIT.md) – Recent external audit findings and remediation status.
- [SECURITY-CLEARANCE-REPORT.md](SECURITY-CLEARANCE-REPORT.md) – Vendor access and clearance tracking.

## Testing & Quality

- [tests/README.md](../tests/manual/README.md) – Manual smoke scripts for Vertex AI and auth validation.
- [tests](../tests/) – Source of unit, integration, and Storybook Vitest projects (see individual files for specs).
- [vitest.config.ts](../vitest.config.ts) – Root testing configuration.

## Operations & Deployment

- [deployment/DEPLOY.md](deployment/DEPLOY.md) – Deployment overview and prerequisites.
- [deployment/CLOUD-RUN-DEPLOYMENT.md](deployment/CLOUD-RUN-DEPLOYMENT.md) – Step-by-step Cloud Run deployment.
- [deployment/MANUAL-DEPLOY-COMMANDS.md](deployment/MANUAL-DEPLOY-COMMANDS.md) – CLI reference for manual releases.
- [deployment/CI-CD.md](deployment/CI-CD.md) – CI/CD pipeline architecture.
- [deployment/GITHUB-ACTIONS-SETUP.md](deployment/GITHUB-ACTIONS-SETUP.md) – Workflow configuration.
- [deployment/GITHUB-ACTIONS-DEPLOYMENT.md](deployment/GITHUB-ACTIONS-DEPLOYMENT.md) – Automated deployment job details.
- [deployment/GITHUB-ACTIONS-STATUS.md](deployment/GITHUB-ACTIONS-STATUS.md) – Current automation status and troubleshooting.
- [deployment/WORKFLOWS-EXPLAINED.md](deployment/WORKFLOWS-EXPLAINED.md) – Deep dive into each workflow file.
- [DEPLOYMENT-TRANSITION-PLAN.md](DEPLOYMENT-TRANSITION-PLAN.md) – Checklist for promoting staging to production.

## Migration History & Archive

- [archive/README.md](archive/README.md) – Archive policy and historical documentation index.
- [migration/DYNAMIC-MODEL-IMPLEMENTATION-SUMMARY.md](migration/DYNAMIC-MODEL-IMPLEMENTATION-SUMMARY.md) – Current model selection architecture.
- [migration/GEMINI-2.5-IMPLEMENTATION.md](migration/GEMINI-2.5-IMPLEMENTATION.md) – Active Gemini 2.5 implementation.
- [migration/DYNAMIC-MODEL-FETCHING.md](migration/DYNAMIC-MODEL-FETCHING.md) – Active model fetching logic.

**Historical migrations** (completed):

- See [archive/README.md](archive/README.md) for older migration guides that have been completed and archived.

## Tooling & Utilities

- [../scripts/README.md](../scripts/README.md) – Overview of available scripts.
- [../scripts/utils/hash-password.js](../scripts/utils/hash-password.js) – Password hashing helper.
- [../scripts/utils/diagnose-vertex-ai.sh](../scripts/utils/diagnose-vertex-ai.sh) – Vertex AI diagnostics.

## Maintaining This Index

- [CONTRIBUTING-DOCS.md](CONTRIBUTING-DOCS.md) – Rules for adding or moving documentation, naming conventions, and index updates.
- Orphan check: if you add a file under `docs/`, make sure it is linked here or in a clearly referenced subindex.

---

- Repository: [github.com/roofsonfire/chat](https://github.com/roofsonfire/chat)
- Production: [chat.daza.ar](https://chat.daza.ar)
- Platform: Google Cloud Run (us-central1)
- Maintainers: Core development team

_Last reviewed: November 2025_
