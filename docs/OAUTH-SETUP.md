# Google OAuth Setup Guide for Chat Application

## Step 1: Create OAuth 2.0 Client ID in Google Cloud Console

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Make sure you're in the correct project: `norse-breaker-474323-n8`

2. **Enable required APIs (if not already enabled):**

   ```bash
   gcloud services enable iamcredentials.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. **Create OAuth 2.0 Client ID:**
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Chat Application - Staging"
4. **Configure Authorized URIs:**
   - Authorized JavaScript origins:
     - `https://staging.chat.daza.ar`
     - `http://localhost:3000` (for local development)
   - Authorized redirect URIs:
     - `https://staging.chat.daza.ar/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (for local development)

5. **Save and get credentials:**
   - Click "Create"
   - Copy the Client ID and Client Secret

## Step 2: Create Secrets in Google Secret Manager

After getting your OAuth credentials, run:

```bash
# Set your OAuth credentials
export GOOGLE_CLIENT_ID="your-client-id-here"
export GOOGLE_CLIENT_SECRET="your-client-secret-here"

# Run the setup script
./scripts/setup-oauth-secrets.sh
```

## Step 3: Verify Secret Access

```bash
# Check secrets exist
gcloud secrets list --filter='name~google-client'

# Test secret access
gcloud secrets versions access latest --secret=google-client-id
gcloud secrets versions access latest --secret=google-client-secret
```

## Step 4: Update Deployment Workflow

Uncomment the OAuth secrets in `.github/workflows/deploy-staging.yml`:

```yaml
env_vars: |
  ENABLE_TEST_CREDENTIALS=false
secrets: |
  NEXTAUTH_SECRET=nextauth-secret:latest
  AUTH_USER_EMAIL=auth-user-email:latest
  AUTH_USER_PASSWORD_HASH=auth-user-password-hash:latest
  GOOGLE_PROJECT_ID=google-project-id:latest
  GOOGLE_LOCATION=google-location:latest
  GOOGLE_VERTEX_AI_MODEL_ID=google-vertex-ai-model-id:latest
  GOOGLE_CLIENT_ID=google-client-id:latest          # Uncomment this
  GOOGLE_CLIENT_SECRET=google-client-secret:latest  # Uncomment this
```

## Step 5: Deploy and Test

1. Commit and push the changes
2. Wait for deployment to complete
3. Test OAuth login at https://staging.chat.daza.ar

## Troubleshooting

If you encounter permission errors:

1. Make sure the Cloud Run service account has the "Secret Manager Secret Accessor" role
2. The service account is: `1025958277405-compute@developer.gserviceaccount.com`

To grant permissions manually:

```bash
for secret in google-client-id google-client-secret; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:1025958277405-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```
