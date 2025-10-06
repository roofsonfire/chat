# 🚀 Deploy to Staging: Quick Start

Deploy your chat application to **https://staging.chat.daza.ar**

## ⚡ Quick Deploy (First Time)

### 1. Run Setup (One-Time)

```bash
# Create secrets in Google Cloud
./setup-secrets.sh
```

This will ask for:

- **Email**: Your login email
- **Password**: Your login password (will be hashed)

### 2. Verify Domain

Before deploying, verify domain ownership:

1. Go to: https://console.cloud.google.com/run/domains/verify
2. Add domain: `daza.ar`
3. Follow verification steps (add TXT record to DNS)
4. Wait for verification (~5-10 minutes)

### 3. Deploy

```bash
# Deploy to Cloud Run
./deploy-staging.sh
```

### 4. Configure DNS

Add this CNAME record to your DNS provider:

```
Type: CNAME
Name: staging.chat
Value: ghs.googlehosted.com
TTL: 3600
```

**For daza.ar domain**, this would typically be:

- Login to your DNS provider (Cloudflare, Namecheap, etc.)
- Add a CNAME record
- Point `staging.chat.daza.ar` to `ghs.googlehosted.com`

### 5. Wait & Test

- **DNS propagation**: 5-30 minutes
- **SSL certificate**: 15-60 minutes
- **Test**: https://staging.chat.daza.ar

## 🔄 Redeploy After Changes

```bash
# Just run deploy again
./deploy-staging.sh
```

## 📋 What Gets Deployed?

- **Service**: `chat-staging`
- **Region**: `us-central1`
- **URL**: https://staging.chat.daza.ar
- **Model**: `gemini-2.5-flash-image`
- **Resources**: 1GB RAM, 1 vCPU, 5min timeout

## 🐛 Troubleshooting

### Check if secrets exist

```bash
gcloud secrets list
```

### Check deployment status

```bash
gcloud run services describe chat-staging --region=us-central1
```

### View logs

```bash
gcloud run logs tail chat-staging --region=us-central1
```

### Check domain mapping

```bash
gcloud run domain-mappings list --region=us-central1
```

## 💡 Common Issues

### "Secret not found"

Run `./setup-secrets.sh` first

### "Domain not verified"

Verify domain at https://console.cloud.google.com/run/domains/verify

### "DNS not resolving"

- Check DNS record is correct
- Wait for propagation (up to 24 hours, usually 5-30 min)
- Test with: `dig staging.chat.daza.ar`

### "SSL certificate pending"

- Wait 15-60 minutes after DNS propagation
- Certificate is auto-issued by Google

## 📊 Monitor Your App

- **Dashboard**: https://console.cloud.google.com/run/detail/us-central1/chat-staging
- **Logs**: https://console.cloud.google.com/logs
- **Metrics**: CPU, Memory, Request count in Cloud Console

## 💰 Cost

Estimated monthly cost for staging:

- **Low usage**: $2-5
- **Medium usage**: $10-20
- **Image generation**: ~$0.001 per image

Free tier includes:

- 2 million requests
- 360,000 GB-seconds
- 180,000 vCPU-seconds

## 📚 Full Documentation

See `docs/CLOUD-RUN-DEPLOYMENT.md` for complete details.

---

**Ready to deploy?** Run `./setup-secrets.sh` to get started! 🚀
