# Community Deployment Guide: Google Cloud Run

This guide provides step-by-step instructions for deploying the application to Google Cloud Run using the provided GitHub Actions workflow.

## Prerequisites

1. **Google Cloud Platform (GCP) Project**: You need a GCP project with billing enabled.
2. **Required APIs Enabled**:
   - Cloud Run API (`run.googleapis.com`)
   - Artifact Registry API (`artifactregistry.googleapis.com`)
   - Secret Manager API (`secretmanager.googleapis.com`)
   - Cloud Build API (`cloudbuild.googleapis.com`)
3. **Google Cloud SDK**: Installed and configured on your local machine (`gcloud`).
4. **GitHub Repository**: A fork of this repository.

## Step 1: Configure GCP Secrets

The application requires several secrets to be stored in **Google Secret Manager**.

Create the following secrets in your GCP project. You can do this via the Cloud Console or the `gcloud` CLI.

```bash
# Example for creating a secret
gcloud secrets create "nextauth-secret" --replication-policy="automatic"
printf "YOUR_SECRET_VALUE" | gcloud secrets versions add "nextauth-secret" --data-file=-
```

**Required Secrets:**

| Secret Name                 | Description                                                                                  | Example Value                               |
| --------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `nextauth-secret`           | A random string for NextAuth.js session encryption. Generate with `openssl rand -base64 32`. | `your-super-secret-nextauth-string`         |
| `auth-user-email`           | The email address for the primary user login.                                                | `user@example.com`                          |
| `auth-user-password-hash`   | The bcrypt hash of the primary user's password. Generate with `npm run hash-password`.       | `$2b$12$....`                               |
| `google-project-id`         | Your GCP Project ID.                                                                         | `your-gcp-project-id`                       |
| `google-location`           | The GCP region for deployment.                                                               | `us-central1`                               |
| `google-vertex-ai-model-id` | The Vertex AI model to use.                                                                  | `gemini-1.5-flash-001`                      |
| `google-client-id`          | Your Google OAuth Client ID.                                                                 | `your-client-id.apps.googleusercontent.com` |
| `google-client-secret`      | Your Google OAuth Client Secret.                                                             | `GOCSPX-...`                                |

## Step 2: Configure Workload Identity Federation

To allow GitHub Actions to securely authenticate with Google Cloud, you need to set up Workload Identity Federation (WIF).

1. **Create a WIF Pool and Provider**:
   Follow the official Google Cloud documentation: [Configuring Workload Identity Federation](https://cloud.google.com/iam/docs/configuring-workload-identity-federation)

2. **Create a Service Account**:
   This service account will be used by GitHub Actions to deploy the application.

   ```bash
   gcloud iam service-accounts create github-actions-deployer \
     --display-name="GitHub Actions Deployer"
   ```

3. **Grant Permissions to the Service Account**:
   The service account needs permissions to manage Cloud Run, Artifact Registry, and Secret Manager.

   ```bash
   # Cloud Run Admin
   gcloud projects add-iam-policy-binding YOUR_GCP_PROJECT_ID \
     --member="serviceAccount:github-actions-deployer@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   # Artifact Registry Writer
   gcloud projects add-iam-policy-binding YOUR_GCP_PROJECT_ID \
     --member="serviceAccount:github-actions-deployer@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"

   # IAM Service Account User
   gcloud projects add-iam-policy-binding YOUR_GCP_PROJECT_ID \
     --member="serviceAccount:github-actions-deployer@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

4. **Allow the WIF Provider to Impersonate the Service Account**:

   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     github-actions-deployer@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com \
     --role=roles/iam.workloadIdentityUser \
     --member="principalSet://iam.googleapis.com/projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL_ID/attribute.repository/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"
   ```

## Step 3: Configure GitHub Repository Secrets

In your forked GitHub repository, go to `Settings` > `Secrets and variables` > `Actions` and create the following secrets:

| Secret Name                      | Description                                                                | Example Value                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | The full resource name of your Workload Identity Pool Provider.            | `projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL_ID/providers/YOUR_PROVIDER_ID` |
| `GCP_SERVICE_ACCOUNT_EMAIL`      | The email address of the service account you created in the previous step. | `github-actions-deployer@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com`                                         |

## Step 4: Customize and Enable the Deployment Workflow

1. **Rename the Workflow File**:
   In your repository, rename `.github/workflows/deploy-production.yml.template` to `.github/workflows/deploy-production.yml`.

2. **Customize the Workflow**:
   Open the newly renamed `deploy-production.yml` and update the `env` section with your specific GCP project details:

   ```yaml
   env:
     PROJECT_ID: "YOUR_GCP_PROJECT_ID"
     REGION: "YOUR_GCP_REGION" # e.g., us-central1
     SERVICE_NAME: "YOUR_CLOUDRUN_SERVICE_NAME" # e.g., ai-chat-prod
     DOMAIN: "YOUR_CUSTOM_DOMAIN" # (optional)
   ```

## Step 5: Trigger the Deployment

The workflow is configured to run automatically when:

1. Code is pushed to the `main` branch (and the `CI/CD Pipeline` workflow succeeds).
2. It is manually triggered from the GitHub Actions tab.

To deploy, either merge your changes into the `main` branch or go to the "Actions" tab in your repository, select "Deploy to Cloud Run (Production)", and click "Run workflow".

## Troubleshooting

- **Permission Denied Errors**:
  - Ensure the service account has the correct IAM roles.
  - Verify that the Workload Identity Federation is configured correctly and points to your repository.
- **Build Failures**:
  - Check the Cloud Build logs in your GCP project for detailed error messages.
- **Deployment Fails to Start**:
  - Check the Cloud Run service logs for container startup errors. This is often related to missing environment variables or secrets.
  - Ensure the secrets in Secret Manager have the correct values.
- **Domain Mapping Fails**:
  - Verify your domain in Google Search Console.
  - Ensure you have the "Cloud Run Admin" role.
