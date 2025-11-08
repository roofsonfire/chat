# ✅ GitHub Actions Status (Nov 2025)

Our automation stack now covers linting, testing, and production deployments with supply-chain safeguards.

---

## 📊 Workflows in Production

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

- **Triggers**: Push/PR against `main` or `develop`.
- **Jobs** (in order):
  1. `Workflow Lint` – Runs `actionlint` v1.7.6 downloaded from a pinned release URL.
  2. `Lint and Type Check` – ESLint (no autofix), Prettier check, TypeScript `--noEmit`.
  3. `Unit Tests` – Vitest unit suite + coverage uploaded to Codecov.
  4. `Build Check` – `next build` with dummy secrets to ensure production builds work.
- **Guardrails**:
  - All third-party actions pinned to commit SHAs.
  - Test secrets pulled from repo-level secrets (`TEST_*`).
  - Rate limiting and Vertex model validation disabled for CI via env flags.

### 2. Deploy to Cloud Run (Production) (`.github/workflows/deploy-production.yml`)

- **Triggers**: Automatic after a successful CI run on `main` (`workflow_run`) or manual dispatch.
- **Authentication**: Workload Identity Federation via secrets `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT_EMAIL` (JSON key removed).
- **Key Steps**:
  - Checkout exact commit from CI run.
  - Build & push Docker image (base image pinned to digest).
  - Deploy to Cloud Run with secret bindings, domain mapping, and health verification.
  - Rollback job available if deployment fails.
- **Outputs**: Deployment URL, custom domain confirmation, optional PR comment when triggered by PR.

---

## 🔐 Required Secrets & Variables

| Name                             | Scope      | Purpose                               |
| -------------------------------- | ---------- | ------------------------------------- |
| `TEST_*` secrets                 | Repository | Dummy values for lint/test/build jobs |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Repository | WIF provider resource string          |
| `GCP_SERVICE_ACCOUNT_EMAIL`      | Repository | Service account used by WIF           |
| `CODECOV_TOKEN` (optional)       | Repository | Coverage uploads                      |

> ✅ `GCP_SA_KEY` is deprecated and no longer read by any workflow.

---

## 🚀 Deployment Snapshot

- **Service**: `chat-production`
- **Region**: `us-central1`
- **Domain**: `https://chat.daza.ar`
- **Latest flow**: CI → production deploy via WIF
- **Validation**: `curl` health check accepts 200/302/307/401 responses.

---

## 🧪 How to Interact with Workflows

```bash
# Trigger production deploy manually
gh workflow run deploy-production.yml

# Run actionlint locally (mirrors CI)
ACTIONLINT_VERSION=1.7.6
TMP_DIR=$(mktemp -d)
curl -sSL "https://github.com/rhysd/actionlint/releases/download/v${ACTIONLINT_VERSION}/actionlint_${ACTIONLINT_VERSION}_linux_amd64.tar.gz" \
  | tar -xz --directory "$TMP_DIR"
"$TMP_DIR/actionlint"

# Inspect recent workflow runs
gh run list --limit 5
```

---

## ✅ Current State

- [x] All workflows pin external actions to SHAs.
- [x] CI enforces workflow linting before other jobs.
- [x] Production deploy uses Workload Identity Federation (no long-lived keys).
- [x] Docker base image locked to digest.
- [x] Documentation updated (this file + deployment guide).

---

## 🎯 Next Enhancements

1. Cache npm dependencies to shave CI runtime.
2. Add Slack/Discord notifications for deployment outcomes.
3. Introduce preview environments for PRs.
4. Gate production deploy with required reviewers via GitHub environments.
5. Instrument log retention & alerting policies (ties into security Task 6).

---

**Last Updated**: November 7, 2025  
**Related Docs**: [`GITHUB-ACTIONS-DEPLOYMENT.md`](GITHUB-ACTIONS-DEPLOYMENT.md), [`MANUAL-DEPLOY-COMMANDS.md`](MANUAL-DEPLOY-COMMANDS.md), [`SECURITY-AUDIT.md`](../SECURITY-AUDIT.md)
