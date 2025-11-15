# Cloud Run Deployment Guide for Production

## 🌐 Project Information

**Repository**: [roofsonfire/chat](https://github.com/roofsonfire/chat)
**Live Demo**: [https://chat.daza.ar](https://chat.daza.ar)
**Platform**: Google Cloud Run
**Target URL**: https://chat.daza.ar

## 📋 Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Domain verification** in Google Cloud Console
3. **Secrets created** in Secret Manager
4. **DNS access** to daza.ar domain

## 🚀 Quick Deploy

### 1. Create Secrets (First-Time Setup)

```bash
# Clone the repository first
git clone https://github.com/roofsonfire/chat.git
cd chat

# Create auth email secret
echo -n "your-email@example.com" | gcloud secrets create auth-email --data-file=-

# Generate password hash using project script
npm run hash-password
# Follow the prompts to generate hash, then:
echo -n "PASTE_BCRYPT_HASH_HERE" | gcloud secrets create auth-password-hash --data-file=-

# NextAuth secret will be auto-generated during deployment
```

### 2. Run Deployment Script

```bash
# Navigate to deployment scripts
cd scripts/deployment

# Make executable
chmod +x deploy-production.sh

# Deploy
./deploy-production.sh
```

### 3. Configure DNS

Add this CNAME record to your DNS provider for `daza.ar`:

```
Type: CNAME
Name: chat
Value: ghs.googlehosted.com
TTL: 3600
```

### 4. Verify Domain (If Not Done)

1. Go to [Google Cloud Run - Custom Domains](https://console.cloud.google.com/run/domains)
2. Click "Add Mapping" button
3. Enter domain: `chat.daza.ar`
4. If domain not verified, you'll be redirected to Google Search Console
5. Add TXT record shown to your DNS provider
6. Wait for verification (5-10 minutes)

## 📝 Manual Deployment (Alternative)

If you prefer manual control:

```bash
# Set variables
PROJECT_ID="norse-breaker-474323-n8"
REGION="us-central1"
SERVICE_NAME="chat-production"

# Deploy from project root
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --concurrency 80 \
  --port 3000 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GOOGLE_PROJECT_ID=$PROJECT_ID" \
  --set-env-vars "GOOGLE_LOCATION=$REGION" \
  --set-env-vars "GOOGLE_VERTEX_AI_MODEL_ID=gemini-2.5-flash-image" \
  --set-env-vars "NEXTAUTH_URL=https://chat.daza.ar" \
  --update-secrets "NEXTAUTH_SECRET=nextauth-secret:latest" \
  --update-secrets "AUTH_USER_EMAIL=auth-email:latest" \
  --update-secrets "AUTH_USER_PASSWORD_HASH=auth-password-hash:latest"

# Map domain
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain chat.daza.ar \
  --region $REGION
```

## 🔧 Configuration Details

### Environment Variables

- `NODE_ENV`: production
- `GOOGLE_PROJECT_ID`: norse-breaker-474323-n8
- `GOOGLE_LOCATION`: us-central1
- `GOOGLE_VERTEX_AI_MODEL_ID`: gemini-2.5-flash-image
- `NEXTAUTH_URL`: https://chat.daza.ar

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
gcloud run services describe chat-production --region=us-central1

# Domain mapping status
gcloud run domain-mappings describe --domain=chat.daza.ar --region=us-central1
```

### Monitor in Console

- **Cloud Run Dashboard**: https://console.cloud.google.com/run
- **Logs Explorer**: https://console.cloud.google.com/logs
- **Error Reporting**: https://console.cloud.google.com/errors

## 🔄 Update Deployment

### Redeploy After Code Changes

```bash
# Navigate to deployment directory and run script
cd scripts/deployment
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

## � Common gcloud Errors & Solutions

This section provides diagnosis and solutions for the most common Google Cloud deployment errors.

### Error 1: Permission Denied

**Symptom:**

```bash
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: Permission 'run.services.create' denied on 'projects/PROJECT_ID/locations/REGION/services/SERVICE_NAME'
```

**Root Cause:**

Your Google Cloud user or service account lacks the necessary IAM permissions to deploy Cloud Run services.

**Diagnosis:**

```bash
# Check current user
gcloud auth list

# Check permissions for current user
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:$(gcloud config get-value account)"
```

**Solution:**

```bash
# Grant Cloud Run Admin role to your user
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:YOUR_EMAIL@example.com" \
  --role="roles/run.admin"

# If using Service Account, grant to service account instead
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.admin"

# Also grant required roles for Secret Manager
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:YOUR_EMAIL@example.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Prevention:**

- Use `gcloud iam roles describe roles/run.admin` to see all permissions
- Consider creating custom IAM role with minimal required permissions
- Document required roles in team onboarding

---

### Error 2: API Not Enabled

**Symptom:**

```bash
ERROR: (gcloud.run.deploy) FAILED_PRECONDITION: Cloud Run API has not been used in project PROJECT_ID before or it is disabled
```

**Root Cause:**

The Cloud Run API (or related APIs like Artifact Registry, Cloud Build) is not enabled for your project.

**Diagnosis:**

```bash
# List enabled APIs
gcloud services list --enabled --project=PROJECT_ID | grep -E "run|build|artifactregistry"

# Check specific API status
gcloud services list --available --project=PROJECT_ID | grep run.googleapis.com
```

**Solution:**

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com --project=PROJECT_ID

# Enable related required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com \
  --project=PROJECT_ID

# Verify all APIs are enabled
gcloud services list --enabled --project=PROJECT_ID
```

**Prevention:**

- Create a setup script that enables all required APIs
- Document required APIs in `README.md`
- Use Terraform/Infrastructure as Code to manage API enablement

---

### Error 3: Invalid Project ID

**Symptom:**

```bash
ERROR: (gcloud.run.deploy) NOT_FOUND: Project 'PROJECT_ID' not found or permission denied
```

**Root Cause:**

The specified project ID doesn't exist, or you don't have access to it.

**Diagnosis:**

```bash
# List all projects you have access to
gcloud projects list

# Check current configured project
gcloud config get-value project

# Verify project exists and you have access
gcloud projects describe PROJECT_ID
```

**Solution:**

```bash
# Set the correct project
gcloud config set project CORRECT_PROJECT_ID

# If you need to create a new project
gcloud projects create NEW_PROJECT_ID --name="Project Name"

# Link billing account (required for Cloud Run)
gcloud billing projects link NEW_PROJECT_ID \
  --billing-account=BILLING_ACCOUNT_ID

# List billing accounts if unknown
gcloud billing accounts list
```

**Prevention:**

- Always verify project ID with `gcloud config get-value project`
- Store project ID in `.env` file and reference it: `PROJECT_ID=$(grep GOOGLE_PROJECT_ID .env | cut -d'=' -f2)`
- Use project ID validation in deployment scripts

---

### Error 4: Quota Exceeded

**Symptom:**

```bash
ERROR: (gcloud.run.deploy) RESOURCE_EXHAUSTED: Quota exceeded for quota metric 'Cloud Run requests'
```

**Root Cause:**

You've exceeded Google Cloud quotas for Cloud Run requests, CPU allocation, or memory.

**Diagnosis:**

```bash
# Check current quotas
gcloud compute project-info describe --project=PROJECT_ID

# View quota usage in console
# https://console.cloud.google.com/iam-admin/quotas?project=PROJECT_ID

# Check Cloud Run service limits
gcloud run services describe SERVICE_NAME \
  --region=REGION \
  --format="value(spec.template.spec.containers[0].resources.limits)"
```

**Solution:**

```bash
# Request quota increase via Cloud Console:
# 1. Go to: https://console.cloud.google.com/iam-admin/quotas
# 2. Filter by "Cloud Run API"
# 3. Select the quota to increase
# 4. Click "EDIT QUOTAS" and submit request

# Temporarily reduce resource limits
gcloud run services update SERVICE_NAME \
  --region=REGION \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=5

# Monitor usage to avoid hitting limits
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'
```

**Prevention:**

- Set appropriate `--max-instances` to avoid runaway costs
- Monitor quota usage regularly
- Set up billing alerts in Cloud Console
- Use `--memory` and `--cpu` flags to optimize resource usage

---

### Error 5: Region Not Available

**Symptom:**

```bash
ERROR: (gcloud.run.deploy) INVALID_ARGUMENT: The region 'REGION' is not available for Cloud Run
```

**Root Cause:**

The specified region doesn't support Cloud Run or isn't available in your project.

**Diagnosis:**

```bash
# List all available Cloud Run regions
gcloud run regions list

# Check if specific region is available
gcloud run regions list | grep REGION_NAME
```

**Solution:**

```bash
# Use a supported region (recommended: us-central1)
gcloud run deploy SERVICE_NAME \
  --source . \
  --region=us-central1

# If you must use a specific region, verify it's available
REGIONS=("us-central1" "us-east1" "us-west1" "europe-west1")
for region in "${REGIONS[@]}"; do
  echo "Checking $region..."
  gcloud run services list --region=$region 2>/dev/null && echo "✅ $region available"
done
```

**Prevention:**

- Always use well-supported regions: `us-central1`, `us-east1`, `europe-west1`
- Store region in environment variable: `GOOGLE_LOCATION=us-central1`
- Document region choice in deployment guide
- Consider multi-region setup for production resilience

---

### Error 6: Docker Build Failures

**Symptom:**

```bash
ERROR: (gcloud.run.deploy) Cloud Build failed with status: FAILURE
Step #X - "builder": error building image: error building stage...
```

**Root Cause:**

Docker build process failed due to missing dependencies, incorrect Dockerfile syntax, or build errors.

**Diagnosis:**

```bash
# View recent build logs
gcloud builds list --limit=5 --project=PROJECT_ID

# Get detailed logs for specific build
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
gcloud builds log $BUILD_ID

# Test Docker build locally
docker build -t test-image .

# Check .gcloudignore
cat .gcloudignore
```

**Solution:**

```bash
# Ensure .gcloudignore exists with proper exclusions
cat > .gcloudignore << 'EOF'
node_modules/
.next/
.git/
.env*
*.md
tests/
.vscode/
EOF

# Verify Dockerfile is correct
cat Dockerfile

# Test build locally before deploying
docker build --platform linux/amd64 -t chat-test .
docker run -p 3000:3000 chat-test

# If build succeeds locally but fails on Cloud Build, check build config
gcloud builds submit --config=cloudbuild.yaml .

# Increase build timeout if needed
gcloud run deploy SERVICE_NAME \
  --source . \
  --timeout=600 \
  --region=REGION
```

**Prevention:**

- Test Docker builds locally before deploying
- Use `.gcloudignore` to exclude unnecessary files
- Leverage Docker build cache with multi-stage builds
- Monitor build times and optimize Dockerfile
- Pin dependency versions in `package.json`

---

### Error 7: Secret Not Found

**Symptom:**

```bash
ERROR: (gcloud.run.deploy) INVALID_ARGUMENT: Secret 'SECRET_NAME' not found in project 'PROJECT_ID'
```

**Root Cause:**

The referenced secret doesn't exist in Secret Manager or the service account lacks access.

**Diagnosis:**

```bash
# List all secrets
gcloud secrets list --project=PROJECT_ID

# Check specific secret exists
gcloud secrets describe SECRET_NAME --project=PROJECT_ID

# Verify latest version
gcloud secrets versions list SECRET_NAME --project=PROJECT_ID

# Check service account permissions
gcloud secrets get-iam-policy SECRET_NAME --project=PROJECT_ID
```

**Solution:**

```bash
# Create missing secret
echo -n "SECRET_VALUE" | gcloud secrets create SECRET_NAME --data-file=-

# Grant Cloud Run service account access to secret
SERVICE_ACCOUNT=$(gcloud run services describe SERVICE_NAME \
  --region=REGION \
  --format="value(spec.template.spec.serviceAccountName)")

gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Update secret value
echo -n "NEW_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-

# Deploy with correct secret reference
gcloud run deploy SERVICE_NAME \
  --source . \
  --region=REGION \
  --update-secrets "ENV_VAR_NAME=SECRET_NAME:latest"
```

**Prevention:**

- Create secrets before first deployment
- Use `scripts/create-secrets.sh` for consistent setup
- Document required secrets in `.env.example`
- Use `--update-secrets` flag instead of `--set-secrets`
- Verify secret access with `gcloud secrets versions access latest --secret=SECRET_NAME`

---

## �🐛 Troubleshooting

### Domain Not Working

1. Check DNS propagation: `dig chat.daza.ar`
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
3. Ensure model `gemini-2.0-flash-exp` is available in region
4. Check if image generation endpoint is properly configured

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

### Vertex AI Usage

- **Text generation (gemini-2.0-flash-exp)**: ~$0.0001 per request
- **Image generation**: ~$0.001 per request (when enabled)
- **Typical usage**: 1000-10000 requests/month = $0.10-$10.00

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

1. **Test the deployment**: Visit https://chat.daza.ar
2. **Test authentication**: Try logging in with configured credentials
3. **Test AI chat**: Send a text message to the AI assistant
4. **Test multimodal**: Upload an image and ask about it
5. **Check logs**: Monitor for any errors using `gcloud run logs`
6. **Set up monitoring**: Configure Cloud Monitoring alerts
7. **Review performance**: Monitor response times and usage

## 🔗 Additional Resources

- **Repository**: [github.com/roofsonfire/chat](https://github.com/roofsonfire/chat)
- **Issues**: [Report bugs or request features](https://github.com/roofsonfire/chat/issues)
- **Documentation**: [Complete documentation](../README.md)
- **Development Guide**: [Local development setup](../DEVELOPMENT.md)

---

**Need help?**

- Check the deployment logs: `gcloud run logs read chat-staging --region=us-central1 --limit=100`
- Review the [troubleshooting section](#-troubleshooting) above
- Create an issue in the [GitHub repository](https://github.com/roofsonfire/chat/issues)
