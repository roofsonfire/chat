# Logging Retention & Alerting Runbook

**Last Updated:** November 7, 2025  
**Owners:** Platform / Security Engineering  
**Scope:** Cloud Run production service `chat-production`

---

## 🎯 Objectives

- Retain security-relevant logs for **365 days** in a dedicated bucket with strict access controls.
- Detect and alert on suspicious authentication activity, rate-limit anomalies, and deployment failures within **5 minutes**.
- Provide auditable configuration-as-code (Terraform or CLI scripts) and verification procedures.

---

## 1. Create Dedicated Log Buckets

Use Google Cloud Logging Buckets to isolate production logs and set custom retention.

```bash
PROJECT_ID="norse-breaker-474323-n8"
LOG_BUCKET="chat-prod-logs"
REGION="global"
RETENTION_DAYS=365

# Create bucket with 1-year retention
gcloud logging buckets create "$LOG_BUCKET" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --retention-days="$RETENTION_DAYS" \
  --description="Production application logs with 1y retention"

# Restrict access to Security + Platform groups
SECURITY_GROUP="group:security-team@daza.ar"
PLATFORM_GROUP="group:platform-team@daza.ar"

gcloud logging buckets update "$LOG_BUCKET" \
  --project="$PROJECT_ID" \
  --location="$REGION" \
  --add-role="roles/logging.viewer" \
  --add-member="$SECURITY_GROUP" \
  --add-member="$PLATFORM_GROUP"
```

> **Note:** The default bucket retains logs for 30 days. Once the dedicated bucket is active and sinks are configured, restrict the default bucket to 30 days or less.

---

## 2. Route Service Logs to the Bucket

Create a log sink that forwards Cloud Run logs to the dedicated bucket.

```bash
SINK_NAME="chat-prod-logs-sink"
LOG_FILTER="resource.type=cloud_run_revision AND resource.labels.service_name=\"chat-production\""

# Create sink
gcloud logging sinks create "$SINK_NAME" \
  "logging.googleapis.com/projects/$PROJECT_ID/locations/global/buckets/$LOG_BUCKET" \
  --log-filter="$LOG_FILTER"

# Grant sink writer permissions
WRITER_SERVICE_ACCOUNT="$(gcloud logging sinks describe "$SINK_NAME" --format='value(writerIdentity)')"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$WRITER_SERVICE_ACCOUNT" \
  --role="roles/logging.bucketWriter"
```

After creating the sink, wait a few minutes and verify that new entries appear in the bucket via the Cloud Logging Explorer.

---

## 3. Logs-Based Metrics

Define metrics to surface risky behavior. Store Terraform equivalents in `infra/` when available.

### 3.1 Authentication Failures

```bash
METRIC_NAME="auth_failures_count"
METRIC_FILTER="resource.type=cloud_run_revision AND jsonPayload.level=\"warn\" AND jsonPayload.message:\"Authentication failed\""

gcloud logging metrics create "$METRIC_NAME" \
  --description="Count of authentication failures (NextAuth)" \
  --log-filter="$METRIC_FILTER"
```

### 3.2 Rate Limit Bypass Attempts

```bash
METRIC_NAME="rate_limit_burst"
METRIC_FILTER="resource.type=cloud_run_revision AND jsonPayload.level=\"warn\" AND jsonPayload.message:\"Rate limit\""

gcloud logging metrics create "$METRIC_NAME" \
  --description="Requests triggering rate-limit warnings" \
  --log-filter="$METRIC_FILTER"
```

### 3.3 Deployment Failures

```bash
METRIC_NAME="deploy_failures"
METRIC_FILTER="resource.type=cloud_run_revision AND jsonPayload.level=\"error\" AND jsonPayload.message:\"Deployment failed\""

gcloud logging metrics create "$METRIC_NAME" \
  --description="Cloud Run deployment failures" \
  --log-filter="$METRIC_FILTER"
```

Document metric IDs in `infra/variables.tf` if using Terraform.

---

## 4. Alerting Policies

Create Cloud Monitoring alerting policies with a 5-minute alignment period and email/Slack notifications.

```bash
NOTIFICATION_CHANNEL_EMAIL="projects/$PROJECT_ID/notificationChannels/1234567890"
NOTIFICATION_CHANNEL_SLACK="projects/$PROJECT_ID/notificationChannels/0987654321"

# Authentication failure spike (>25 in 5 minutes)
gcloud alpha monitoring policies create \
  --display-name="Auth Failure Spike" \
  --combiner="OR" \
  --condition-display-name="Auth failures (>25 in 5m)" \
  --condition-filter="metric.type=\"logging.googleapis.com/user/auth_failures_count\"" \
  --condition-aggregation-alignment-period="300s" \
  --condition-aggregation-per-series-aligner="ALIGN_RATE" \
  --condition-threshold-value="5" \
  --condition-duration="0s" \
  --notification-channels="$NOTIFICATION_CHANNEL_EMAIL,$NOTIFICATION_CHANNEL_SLACK"

# Rate limit anomaly (>50 warnings in 5 minutes)
gcloud alpha monitoring policies create \
  --display-name="Rate Limit Anomaly" \
  --combiner="OR" \
  --condition-display-name="Rate limit burst" \
  --condition-filter="metric.type=\"logging.googleapis.com/user/rate_limit_burst\"" \
  --condition-aggregation-alignment-period="300s" \
  --condition-aggregation-per-series-aligner="ALIGN_RATE" \
  --condition-threshold-value="10" \
  --condition-duration="0s" \
  --notification-channels="$NOTIFICATION_CHANNEL_EMAIL,$NOTIFICATION_CHANNEL_SLACK"
```

> Replace `threshold-value` with values that reflect real traffic once baseline metrics are available.

---

## 5. Verification Checklist

1. **Retention:** Confirm bucket retention is 365 days via `gcloud logging buckets describe`.
2. **Access:** Attempt to view the bucket as an unauthorized user — access should be denied.
3. **Routing:** Generate test logs (`logger.warn` with authentication failure) and verify they appear in the bucket.
4. **Metrics:** Check Cloud Monitoring → Metrics Explorer for the custom metrics responding to test logs.
5. **Alerts:** Trigger alerts by generating synthetic failures (e.g., repeated bad logins in staging) and verify channel delivery.
6. **Documentation:** Capture screenshots/CLI output and store them in the security wiki for audit evidence.

---

## 6. Operational Guidance

- **Rotation:** Review alert thresholds quarterly and adjust for traffic changes.
- **Drills:** Run an incident-response tabletop annually using the metrics as entry points.
- **Compliance:** Retain audit proof for SOC2/ISO artifacts in `docs/security/evidence/` (create if missing).
- **Runbooks:** Update this document when the logging pipeline or service names change.

---

## 7. Infra-as-Code Backlog

- [ ] Terraform module for Logging bucket + sink + IAM.
- [ ] Terraform module for logs-based metrics and alerting policies.
- [ ] GitHub Actions step to validate logging configuration via `gcloud logging settings describe`.

Track implementation progress in Jira ticket `SEC-124` or the equivalent issue tracker.
