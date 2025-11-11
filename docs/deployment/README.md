# Deployment Documentation

Complete deployment guides, CI/CD configuration, and production deployment procedures.

## Quick Start

- **New to deployment?** Start with [Deployment Overview](DEPLOY.md)
- **Deploying to Cloud Run?** See [Cloud Run Deployment](CLOUD-RUN-DEPLOYMENT.md)
- **Manual deployment?** Check [Manual Deploy Commands](MANUAL-DEPLOY-COMMANDS.md)

## Deployment Guides

### Getting Started

- [Deployment Overview](DEPLOY.md) - Prerequisites and deployment options
- [Cloud Run Deployment](CLOUD-RUN-DEPLOYMENT.md) - Step-by-step Cloud Run setup
- [Manual Deploy Commands](MANUAL-DEPLOY-COMMANDS.md) - CLI reference for manual releases

### CI/CD & Automation

- [CI/CD Overview](CI-CD.md) - Pipeline architecture and automation
- [GitHub Actions Setup](GITHUB-ACTIONS-SETUP.md) - Workflow configuration
- [GitHub Actions Deployment](GITHUB-ACTIONS-DEPLOYMENT.md) - Automated deployment details
- [GitHub Actions Status](GITHUB-ACTIONS-STATUS.md) - Current automation status
- [Workflows Explained](WORKFLOWS-EXPLAINED.md) - Deep dive into workflow files

### Production Deployment

- [Production Deployment Guide](PRODUCTION-DEPLOYMENT-GUIDE.md) - Production best practices
- [Production Deployment Summary](PRODUCTION-DEPLOYMENT-SUMMARY.md) - Deployment outcomes
- [Deployment Transition Plan](DEPLOYMENT-TRANSITION-PLAN.md) - Staging to production checklist
- [Deployment Checklist](DEPLOYMENT-CHECKLIST.md) - Pre-deployment verification

### Troubleshooting

- [OAuth Redirect URI Fix](OAUTH-REDIRECT-URI-FIX.md) - OAuth configuration issues

## Deployment Architecture

```
GitHub Repository → GitHub Actions → Build Docker Image →
Google Artifact Registry → Cloud Run (us-central1) → Production
```

### Environments

- **Production:** https://chat.daza.ar (Cloud Run, us-central1)
- **Branch Strategy:** `develop` (testing) → `main` (production)

### Infrastructure

- **Platform:** Google Cloud Run (serverless)
- **Region:** us-central1
- **Scaling:** 0-10 instances (auto)
- **Memory:** 512MB per instance
- **CPU:** 1 vCPU per instance

## Common Tasks

### Deploy to Production

```bash
# Via GitHub Actions (recommended)
git push origin main

# Manual deployment
npm run build
gcloud run deploy chat-app --source .
```

### Check Deployment Status

```bash
# View Cloud Run service
gcloud run services describe chat-app --region us-central1

# View recent deployments
gcloud run revisions list --service chat-app --region us-central1
```

### Rollback Deployment

```bash
# Rollback to previous revision
gcloud run services update-traffic chat-app \
  --to-revisions PREVIOUS_REVISION=100 \
  --region us-central1
```

## Security Considerations

- **Secrets:** Managed via Google Cloud Secret Manager
- **Authentication:** Google OAuth + invite-only allowlist
- **HTTPS Only:** All traffic encrypted (Cloud Run default)
- **Security Headers:** CSP, HSTS, X-Frame-Options configured

## Related Documentation

- [Development Setup](../DEVELOPMENT.md) - Local development
- [Security Documentation](../security/) - Security policies and procedures
- [Project Status](../PROJECT-STATUS.md) - Current release status

---

**Last Updated:** November 2025
**Production URL:** https://chat.daza.ar
