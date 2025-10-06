# Cloud Run Deployment Guide for Staging

## 🌐 Custom Domain Setup

**Target URL**: https://staging.chat.daza.ar

## 📋 Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Domain verification** in Google Cloud Console
3. **Secrets created** in Secret Manager
4. **DNS access** to daza.ar domain

## 🚀 Quick Deploy

### 1. Create Secrets (First-Time Setup)

```bash
# Create auth email secret
echo -n "your-email@example.com" | gcloud secrets create auth-email --data-file=-

# Generate password hash
node scripts/hash-password.js "your-password"

# Create password hash secret (use the hash from above)
echo -n "PASTE_BCRYPT_HASH_HERE" | gcloud secrets create auth-password-hash --data-file=-

# NextAuth secret will be auto-generated during deployment
```

### 2. Run Deployment Script

```bash
# Make executable
chmod +x deploy-staging.sh

# Deploy
./deploy-staging.sh
```

### 3. Configure DNS

Add this CNAME record to your DNS provider for `daza.ar`:

```
Type: CNAME
Name: staging.chat
Value: ghs.googlehosted.com
TTL: 3600
```

### 4. Verify Domain (If Not Done)

1. Go to [Google Cloud Run - Custom Domains](https://console.cloud.google.com/run/domains)
2. Click "Add Mapping" button
3. Enter domain: `staging.chat.daza.ar`
4. If domain not verified, you'll be redirected to Google Search Console
5. Add TXT record shown to your DNS provider
6. Wait for verification (5-10 minutes)

## 📝 Manual Deployment (Alternative)

If you prefer manual control:

```bash
# Set variables
PROJECT_ID="norse-breaker-474323-n8"
REGION="us-central1"
SERVICE_NAME="chat-staging"

# Deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --set-env-vars "GOOGLE_PROJECT_ID=$PROJECT_ID" \
  --set-env-vars "GOOGLE_LOCATION=$REGION" \
  --set-env-vars "GOOGLE_VERTEX_AI_MODEL_ID=gemini-2.5-flash-image" \
  --set-env-vars "NEXTAUTH_URL=https://staging.chat.daza.ar" \
  --update-secrets "NEXTAUTH_SECRET=nextauth-secret:latest" \
  --update-secrets "AUTH_USER_EMAIL=auth-email:latest" \
  --update-secrets "AUTH_USER_PASSWORD_HASH=auth-password-hash:latest"

# Map domain
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain staging.chat.daza.ar \
  --region $REGION
```

## 🔧 Configuration Details

### Environment Variables

- `NODE_ENV`: production
- `GOOGLE_PROJECT_ID`: norse-breaker-474323-n8
- `GOOGLE_LOCATION`: us-central1
- `GOOGLE_VERTEX_AI_MODEL_ID`: gemini-2.5-flash-image
- `NEXTAUTH_URL`: https://staging.chat.daza.ar

### Secrets (from Secret Manager)

- `NEXTAUTH_SECRET`: Auto-generated session encryption key
- `AUTH_USER_EMAIL`: Login email address
- `AUTH_USER_PASSWORD_HASH`: Bcrypt hashed password

### Resource Configuration

- **Memory**: 1GB
- **CPU**: 1 vCPU
- **Timeout**: 300 seconds (5 minutes)
- **Max Instances**: 10
- **Min Instances**: 0 (scales to zero)
- **Concurrency**: 80 requests per instance

## 📊 Monitoring & Logs

### View Logs

```bash
# Real-time logs
gcloud run logs tail chat-staging --region=us-central1

# Recent logs
gcloud run logs read chat-staging --region=us-central1 --limit=100

# Filter by severity
gcloud run logs read chat-staging --region=us-central1 --log-filter='severity>=ERROR'
```

### Check Service Status

```bash
# Service details
gcloud run services describe chat-staging --region=us-central1

# Domain mapping status
gcloud run domain-mappings describe --domain=staging.chat.daza.ar --region=us-central1
```

### Monitor in Console

- **Cloud Run Dashboard**: https://console.cloud.google.com/run
- **Logs Explorer**: https://console.cloud.google.com/logs
- **Error Reporting**: https://console.cloud.google.com/errors

## 🔄 Update Deployment

### Redeploy After Code Changes

```bash
# Simply run the script again
./deploy-staging.sh
```

### Update Environment Variables Only

```bash
gcloud run services update chat-staging \
  --region=us-central1 \
  --set-env-vars "NEW_VAR=value"
```

### Update Secrets

```bash
# Update secret value
echo -n "new-value" | gcloud secrets versions add secret-name --data-file=-

# Cloud Run will automatically use latest version
```

## 🐛 Troubleshooting

### Domain Not Working

1. Check DNS propagation: `dig staging.chat.daza.ar`
2. Verify domain mapping: `gcloud run domain-mappings list --region=us-central1`
3. Check SSL certificate status (can take 15-60 minutes)

### Build Fails

1. Check `.gcloudignore` is properly configured
2. Verify `package.json` has all dependencies
3. Check logs: `gcloud builds list --limit=5`

### Service Crashes

1. Check logs: `gcloud run logs read chat-staging --region=us-central1 --limit=100`
2. Verify secrets are accessible
3. Check memory/CPU limits

### Image Generation Not Working

1. Verify Vertex AI API is enabled
2. Check service account permissions
3. Ensure model `gemini-2.5-flash-image` is available in region

## 💰 Cost Estimation

### Cloud Run Pricing (us-central1)

- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests
- **Network egress**: $0.12 per GB (after 1GB free)

### Estimated Monthly Cost (Staging)

- **Low usage** (~1000 requests): ~$2-5
- **Medium usage** (~10000 requests): ~$10-20
- **High usage** (~50000 requests): ~$30-50

### Vertex AI Image Generation

- **gemini-2.5-flash-image**: ~$0.001 per request
- **Typical usage**: 100-1000 images/month = $0.10-$1.00

**Total estimated staging cost**: $5-25/month

## 🔐 Security Checklist

- [x] Secrets stored in Secret Manager (not in code)
- [x] HTTPS enforced via custom domain
- [x] Authentication required for chat access
- [x] Rate limiting enabled in middleware
- [x] CORS configured properly
- [x] Security headers set (CSP, HSTS, etc.)
- [x] Environment variables validated with Zod
- [x] No sensitive data in logs

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Custom Domains Guide](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)

## 🎯 Next Steps After Deployment

1. **Test the deployment**: Visit https://staging.chat.daza.ar
2. **Test image generation**: Try "Generate a red heart"
3. **Check logs**: Monitor for any errors
4. **Set up alerts**: Configure Cloud Monitoring
5. **Plan production**: Consider multi-region setup for prod

---

**Need help?** Check the logs or contact the team.
