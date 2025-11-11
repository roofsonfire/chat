# 🚀 Production Deployment Quick Reference

**Target**: https://chat.daza.ar
**Service**: chat-production
**Region**: us-central1
**Project**: norse-breaker-474323-n8

---

## Option 1: Automated Deployment Script (Recommended)

The easiest way to deploy:

```bash
./scripts/deployment/deploy-to-production.sh
```

This script will:

- ✅ Verify prerequisites (gcloud, Docker)
- ✅ Check OAuth configuration
- ✅ Verify all secrets exist
- ✅ Build Docker image
- ✅ Push to Google Container Registry
- ✅ Deploy to Cloud Run
- ✅ Set up domain mapping
- ✅ Test deployment

---

## Option 2: Manual Step-by-Step Commands

### 1. Prerequisites Check

```bash
# Verify project
gcloud config get-value project
# Should be: norse-breaker-474323-n8

# Verify region
gcloud config get-value compute/region
# Should be: us-central1

# List existing services
gcloud run services list --region us-central1
```

### 2. Verify Secrets

```bash
# List all secrets
gcloud secrets list

# Check specific secret value (optional)
gcloud secrets versions access latest --secret="google-client-id"
```

### 3. Build and Push Docker Image

```bash
# Set variables
export PROJECT_ID="norse-breaker-474323-n8"
export SERVICE_NAME="chat-production"
export IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Build image
docker build -t $IMAGE_NAME:latest \
  --build-arg NEXT_PUBLIC_APP_URL=https://chat.daza.ar \
  .

# Push to GCR
docker push $IMAGE_NAME:latest
```

### 4. Deploy to Cloud Run

```bash
gcloud run deploy chat-production \
  --image gcr.io/norse-breaker-474323-n8/chat-production:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-secrets="NEXTAUTH_SECRET=nextauth-secret:latest,AUTH_USER_EMAIL=auth-email:latest,AUTH_USER_PASSWORD_HASH=auth-password-hash:latest,GOOGLE_PROJECT_ID=google-project-id:latest,GOOGLE_LOCATION=google-location:latest,GOOGLE_VERTEX_AI_MODEL_ID=google-vertex-ai-model-id:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest" \
  --set-env-vars="NEXTAUTH_URL=https://chat.daza.ar,ENABLE_TEST_CREDENTIALS=false" \
  --tag latest
```

### 5. Domain Mapping

```bash
# Create domain mapping
gcloud run domain-mappings create \
  --service=chat-production \
  --domain=chat.daza.ar \
  --region=us-central1

# Check status
gcloud run domain-mappings describe \
  --domain=chat.daza.ar \
  --region=us-central1
```

### 6. DNS Configuration

Go to your DNS provider and add:

```
Type: CNAME
Host: chat
Value: ghs.googlehosted.com
TTL: 1800
```

---

## Useful Management Commands

### View Logs

```bash
# Recent logs
gcloud run services logs read chat-production \
  --region us-central1 \
  --limit 50

# Follow logs in real-time
gcloud run services logs tail chat-production \
  --region us-central1
```

### Service Management

```bash
# Get service details
gcloud run services describe chat-production \
  --region us-central1

# List revisions
gcloud run revisions list \
  --service chat-production \
  --region us-central1

# Update environment variable
gcloud run services update chat-production \
  --region us-central1 \
  --set-env-vars="NEW_VAR=value"

# Update secret
echo -n "new-secret-value" | gcloud secrets versions add secret-name --data-file=-
```

### Domain Management

```bash
# List domain mappings
gcloud run domain-mappings list --region us-central1

# Delete domain mapping
gcloud run domain-mappings delete \
  --domain=chat.daza.ar \
  --region=us-central1
```

### Traffic Management

```bash
# Split traffic between revisions
gcloud run services update-traffic chat-production \
  --region us-central1 \
  --to-revisions=REVISION-1=50,REVISION-2=50

# Route all traffic to latest
gcloud run services update-traffic chat-production \
  --region us-central1 \
  --to-latest
```

### Rollback

```bash
# List revisions
gcloud run revisions list \
  --service chat-production \
  --region us-central1

# Rollback to specific revision
gcloud run services update-traffic chat-production \
  --region us-central1 \
  --to-revisions=REVISION-NAME=100
```

---

## Monitoring & Debugging

### Check Service Health

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe chat-production \
  --region us-central1 \
  --format 'value(status.url)')

# Test endpoint
curl -I $SERVICE_URL

# Test with custom domain
curl -I https://chat.daza.ar
```

### View Metrics

```bash
# Open metrics dashboard
gcloud run services describe chat-production \
  --region us-central1 \
  --format='value(status.url)' | \
  sed 's|https://||' | \
  xargs -I {} open "https://console.cloud.google.com/run/detail/us-central1/chat-production/metrics?project=norse-breaker-474323-n8"
```

### Debug Issues

```bash
# Get recent errors
gcloud run services logs read chat-production \
  --region us-central1 \
  --limit 100 | grep ERROR

# Check service events
gcloud run services describe chat-production \
  --region us-central1 \
  --format='table(status.conditions)'
```

---

## OAuth Configuration Check

### Verify OAuth Client

1. Go to: https://console.cloud.google.com/apis/credentials?project=norse-breaker-474323-n8
2. Check OAuth 2.0 Client IDs for:
   - Authorized JavaScript origins: `https://chat.daza.ar`
   - Authorized redirect URIs: `https://chat.daza.ar/api/auth/callback/google`

### Update OAuth Secrets

```bash
# Update Client ID
echo -n "YOUR_CLIENT_ID" | gcloud secrets versions add google-client-id --data-file=-

# Update Client Secret
echo -n "YOUR_CLIENT_SECRET" | gcloud secrets versions add google-client-secret --data-file=-

# Verify update
gcloud secrets versions list google-client-id
```

---

## DNS Verification

```bash
# Check DNS resolution
nslookup chat.daza.ar

# Check CNAME record
dig chat.daza.ar CNAME

# Check SSL certificate
openssl s_client -connect chat.daza.ar:443 -servername chat.daza.ar < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## Troubleshooting

### Issue: Domain not working after DNS setup

```bash
# 1. Check domain mapping status
gcloud run domain-mappings describe --domain=chat.daza.ar --region=us-central1

# 2. Verify DNS propagation
dig chat.daza.ar

# 3. Wait 10-15 minutes for DNS propagation
```

### Issue: OAuth errors

```bash
# 1. Verify secrets are set
gcloud secrets versions access latest --secret="google-client-id"
gcloud secrets versions access latest --secret="google-client-secret"

# 2. Check service logs for auth errors
gcloud run services logs read chat-production --region us-central1 --limit 50 | grep -i "oauth\|auth"
```

### Issue: Service not starting

```bash
# 1. Check recent logs
gcloud run services logs read chat-production --region us-central1 --limit 20

# 2. Check service status
gcloud run services describe chat-production --region us-central1 --format='table(status.conditions)'

# 3. Verify all secrets exist
gcloud secrets list
```

---

## Cost Management

```bash
# Check current resource usage
gcloud run services describe chat-production \
  --region us-central1 \
  --format='value(spec.template.spec.containers[0].resources)'

# Update resource limits to save costs
gcloud run services update chat-production \
  --region us-central1 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5
```

---

## Links

- **Service Console**: https://console.cloud.google.com/run/detail/us-central1/chat-production?project=norse-breaker-474323-n8
- **Logs**: https://console.cloud.google.com/logs/query?project=norse-breaker-474323-n8
- **Secrets**: https://console.cloud.google.com/security/secret-manager?project=norse-breaker-474323-n8
- **OAuth**: https://console.cloud.google.com/apis/credentials?project=norse-breaker-474323-n8
- **Domain Mappings**: https://console.cloud.google.com/run/domains?project=norse-breaker-474323-n8

---

**Last Updated**: November 7, 2025
