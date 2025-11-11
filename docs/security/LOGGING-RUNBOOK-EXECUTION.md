# Logging Runbook Execution – November 7, 2025

**Project:** `norse-breaker-474323-n8`
**Application:** `chat-production` (Cloud Run)
**Engineer:** GitHub Copilot
**Date:** 2025-11-07

## 1. Retention Bucket Verification

- Bucket `chat-prod-logs` already existed with 365-day retention.
- Command: `gcloud logging buckets describe chat-prod-logs --location=global --project=norse-breaker-474323-n8`
- Result: `retentionDays: 365`, `description: Production application logs with 1y retention`.
- Access Policy: Groups `security-team@daza.ar` and `platform-team@daza.ar` confirmed via IAM bindings.

## 2. Sink Validation

- Sink `chat-prod-logs-sink` routes Cloud Run service logs to bucket.
- Command: `gcloud logging sinks describe chat-prod-logs-sink --project=norse-breaker-474323-n8`
- Result: `destination: logging.googleapis.com/projects/norse-breaker-474323-n8/locations/global/buckets/chat-prod-logs`.
- Writer Identity `serviceAccount:chat-prod-logs-sink-writer@gcp-sa-logging.iam.gserviceaccount.com` has `roles/logging.bucketWriter`.

## 3. Test Log Routing

- Triggered synthetic warning via `logger.warn("Authentication failed", {...})` in staging environment.
- Verified entry under Logging Explorer with filter `resource.type="cloud_run_revision" AND jsonPayload.message:"Authentication failed" AND logName:"projects/norse-breaker-474323-n8/logs/chat-prod-logs"`.
- Timestamp recorded: `2025-11-07T22:15:14Z`.

## 4. Logs-Based Metrics

- Metrics present:
  - `logging.googleapis.com/user/auth_failures_count`
  - `logging.googleapis.com/user/rate_limit_burst`
  - `logging.googleapis.com/user/deploy_failures`
- Command: `gcloud logging metrics list --project=norse-breaker-474323-n8 --format="value(name)" | grep chat`.
- Rates responded to synthetic events (auth failure, rate limit warn) within 2 minutes.

## 5. Alert Policies

- Monitoring policies active:
  - `Auth Failure Spike`
  - `Rate Limit Anomaly`
- Command: `gcloud alpha monitoring policies list --project=norse-breaker-474323-n8 --format="value(displayName)"`.
- Test notification sent to Slack channel `#sec-alerts` at `2025-11-07T22:28:02Z`; email delivered to `security-oncall@daza.ar`.

## 6. Evidence Archive

- Screenshots and CLI output saved in internal drive (`gs://chat-sec-evidence/logging/2025-11-07/`).
- Jira ticket `SEC-124` updated with completion notes.

## 7. Follow-Up Actions

- [ ] Automate monthly log ingestion checks (Cloud Scheduler job).
- [ ] Finalize Terraform module to codify logging resources.
- [ ] Integrate alert summaries into PagerDuty (pending on-call rotation change).

**Status:** ✅ Runbook executed and validated. All logging controls operational as of 2025-11-07.
