# 🎯 Deployment Checklist for staging.chat.daza.ar

## ✅ Pre-Deployment Steps

### 1. Verify Prerequisites

- [ ] Google Cloud SDK installed (`gcloud --version`)
- [ ] Authenticated with Google Cloud (`gcloud auth list`)
- [ ] Project set to `norse-breaker-474323-n8`
- [ ] Node.js and npm installed
- [ ] Repository up to date (`git pull`)

### 2. Domain Verification (Do This First!)

- [ ] Go to https://console.cloud.google.com/run
- [ ] Click "Manage Custom Domains" (or go to https://console.cloud.google.com/run/domains)
- [ ] Click "Add Mapping" button
- [ ] Enter domain: `staging.chat.daza.ar`
- [ ] Follow verification prompts if domain not verified
- [ ] For first-time domains, verify ownership via:
  - **Search Console**: https://search.google.com/search-console
  - Add TXT record to DNS as instructed
- [ ] Wait for verification (5-10 minutes)
- [ ] Confirm verification status is "Verified"

### 3. Create Secrets

```bash
./setup-secrets.sh
```

- [ ] Enter your login email
- [ ] Enter your password (will be hashed automatically)
- [ ] Confirm all secrets created successfully

## 🚀 Deployment

### 4. Run Deployment Script

```bash
./deploy-staging.sh
```

- [ ] Wait for build to complete (~3-5 minutes)
- [ ] Note the Cloud Run URL (e.g., https://chat-staging-xxxxx-uc.a.run.app)
- [ ] Confirm domain mapping prompt

### 5. Configure DNS

Add this CNAME record to your DNS provider for `daza.ar`:

**If using Cloudflare, Namecheap, GoDaddy, etc:**

```
Type: CNAME
Name: staging.chat
Value: ghs.googlehosted.com
TTL: 3600 (or Auto)
```

**Example for different providers:**

**Cloudflare:**

- Type: CNAME
- Name: `staging.chat`
- Target: `ghs.googlehosted.com.` (with trailing dot)
- Proxy status: DNS only (⚠️ IMPORTANT: gray cloud, NOT proxied)
- TTL: Auto

**Namecheap:**

- Type: CNAME Record
- Host: `staging.chat`
- Value: `ghs.googlehosted.com`
- TTL: Automatic

- [ ] DNS record added
- [ ] Wait for propagation (5-30 minutes)
- [ ] Test DNS: `dig staging.chat.daza.ar` or `nslookup staging.chat.daza.ar`

## ✅ Post-Deployment Verification

### 6. Wait for SSL Certificate

- [ ] Wait 15-60 minutes after DNS propagation
- [ ] Google automatically provisions SSL certificate
- [ ] Check status: `gcloud run domain-mappings describe --domain=staging.chat.daza.ar --region=us-central1`

### 7. Test the Deployment

- [ ] Visit https://staging.chat.daza.ar
- [ ] Login with your credentials
- [ ] Test chat functionality (text-only)
- [ ] Test image generation: "Generate a red heart"
- [ ] Verify image displays and can be downloaded
- [ ] Check browser console for errors (F12)

### 8. Monitor Logs

```bash
# Real-time logs
gcloud run logs tail chat-staging --region=us-central1

# Check for errors
gcloud run logs read chat-staging --region=us-central1 --log-filter='severity>=ERROR' --limit=50
```

- [ ] No critical errors in logs
- [ ] Image generation working (`totalImages: 1` in logs)
- [ ] Authentication working

## 🔍 Troubleshooting

### DNS Not Resolving

```bash
# Check DNS
dig staging.chat.daza.ar

# Should return something like:
# staging.chat.daza.ar. 300 IN CNAME ghs.googlehosted.com.
```

- [ ] If no result, DNS not propagated yet (wait longer)
- [ ] If wrong result, check DNS record configuration

### SSL Certificate Issues

```bash
# Check domain mapping status
gcloud run domain-mappings describe --domain=staging.chat.daza.ar --region=us-central1 --format=yaml
```

Look for:

- `certificateStatus: READY` (good)
- `certificateStatus: PENDING` (wait longer)

### Service Not Responding

```bash
# Check service status
gcloud run services describe chat-staging --region=us-central1

# Check recent deployments
gcloud run revisions list --service=chat-staging --region=us-central1
```

### Image Generation Not Working

```bash
# Check Vertex AI API is enabled
gcloud services list --enabled | grep aiplatform

# If not enabled:
gcloud services enable aiplatform.googleapis.com
```

## 📊 Success Indicators

### Deployment Successful When:

- ✅ `gcloud run services describe chat-staging` shows `status: READY`
- ✅ `https://staging.chat.daza.ar` loads without SSL errors
- ✅ Can login successfully
- ✅ Text chat works
- ✅ Image generation works (see images in response)
- ✅ No errors in logs

### Expected Performance:

- **First load**: 2-5 seconds (cold start)
- **Subsequent requests**: <1 second
- **Image generation**: 3-8 seconds
- **Memory usage**: ~200-400MB
- **CPU usage**: Low when idle

## 🎉 Post-Launch Tasks

### After Successful Deployment:

- [ ] Add staging URL to README.md
- [ ] Test all features thoroughly
- [ ] Set up monitoring alerts (optional)
- [ ] Document any issues or improvements
- [ ] Plan production deployment

### Optional Enhancements:

- [ ] Set up custom error pages
- [ ] Configure Cloud Monitoring alerts
- [ ] Set up uptime monitoring
- [ ] Create backup deployment in another region
- [ ] Set up CI/CD with GitHub Actions

## 📞 Support Commands

```bash
# View service details
gcloud run services describe chat-staging --region=us-central1

# View domain mapping
gcloud run domain-mappings list --region=us-central1

# View secrets
gcloud secrets list

# View recent logs
gcloud run logs read chat-staging --region=us-central1 --limit=100

# Get service URL
gcloud run services describe chat-staging --region=us-central1 --format='value(status.url)'
```

## 💰 Cost Monitoring

First week estimated cost: **$1-5**

Check costs at:

- https://console.cloud.google.com/billing

Monitor usage:

- **Cloud Run**: https://console.cloud.google.com/run
- **Vertex AI**: https://console.cloud.google.com/vertex-ai

---

## 📝 Quick Reference

**Project**: norse-breaker-474323-n8  
**Region**: us-central1  
**Service**: chat-staging  
**Domain**: staging.chat.daza.ar  
**Model**: gemini-2.5-flash-image

**Scripts**:

- Setup: `./setup-secrets.sh`
- Deploy: `./deploy-staging.sh`
- Logs: `gcloud run logs tail chat-staging --region=us-central1`

---

**Ready to deploy?** Start with Step 2 (Domain Verification)! 🚀
