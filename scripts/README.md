# 🛠️ Scripts Directory

This directory contains utility and deployment scripts for the Next.js Chat Application.

## 📁 Directory Structure

### `deployment/` - Deployment Automation

Scripts for automated deployment and Cloud Run management:

| Script              | Purpose                            | Usage                            |
| ------------------- | ---------------------------------- | -------------------------------- |
| `deploy-staging.sh` | Automated staging deployment       | `./deployment/deploy-staging.sh` |
| `setup-secrets.sh`  | First-time Cloud Run secrets setup | `./deployment/setup-secrets.sh`  |

### `utils/` - Development Utilities

Helper scripts for development, debugging, and maintenance:

| Script                  | Purpose                             | Usage                           |
| ----------------------- | ----------------------------------- | ------------------------------- |
| `diagnose-vertex-ai.sh` | Vertex AI configuration diagnostics | `./utils/diagnose-vertex-ai.sh` |
| `hash-password.js`      | Generate bcrypt password hashes     | `node utils/hash-password.js`   |

## 🚀 Quick Usage Guide

### 1. Password Generation

Generate a secure bcrypt hash for user authentication:

```bash
# Interactive password hashing
node utils/hash-password.js

# Or use npm script
npm run hash-password
```

### 2. Vertex AI Diagnostics

Troubleshoot Google Cloud Vertex AI configuration:

```bash
# Run diagnostic checks
./scripts/utils/diagnose-vertex-ai.sh

# Check output for configuration issues
# Script validates: credentials, project access, API status
```

### 3. Deployment Scripts

Automated Cloud Run deployment:

```bash
# First-time setup (run once)
./scripts/deployment/setup-secrets.sh

# Deploy to staging environment
./scripts/deployment/deploy-staging.sh
```

## 📋 Prerequisites

### For Deployment Scripts

- **Google Cloud CLI** (`gcloud`) installed and authenticated
- **Docker** installed and running
- **Environment variables** configured (see `.env.example`)
- **Google Cloud Project** with required APIs enabled:
  - Vertex AI API
  - Cloud Run API
  - Artifact Registry API

### For Utility Scripts

- **Node.js 20+** installed
- **Project dependencies** installed (`npm install`)
- **Environment file** configured (`.env.local`)

## 🔧 Script Details

### `deployment/deploy-staging.sh`

**Purpose**: Automated deployment to Google Cloud Run staging environment

**Features**:

- Builds Docker image locally
- Pushes to Google Artifact Registry
- Deploys to Cloud Run with proper configuration
- Maps custom domain (if configured)
- Performs health checks

**Environment Variables Required**:

```bash
PROJECT_ID=your-google-project-id
REGION=us-central1
SERVICE_NAME=chat-staging
DOCKER_IMAGE_NAME=chat-app
```

### `deployment/setup-secrets.sh`

**Purpose**: One-time setup of Cloud Run secrets and environment variables

**Features**:

- Creates Cloud Run secrets from environment variables
- Sets up proper IAM permissions
- Configures service with secrets
- Validates secret access

### `utils/diagnose-vertex-ai.sh`

**Purpose**: Comprehensive Vertex AI configuration diagnostics

**Checks**:

- Google Cloud authentication status
- Project ID and permissions
- Vertex AI API enablement
- Model availability and access
- Network connectivity

**Output**: Detailed diagnostic report with actionable recommendations

### `utils/hash-password.js`

**Purpose**: Generate secure bcrypt password hashes for authentication

**Features**:

- Interactive password input (hidden)
- Configurable salt rounds (default: 10)
- Validates password strength
- Outputs hash for environment configuration

## 🚨 Troubleshooting

### Common Issues

#### "Permission denied" errors

```bash
# Make scripts executable
chmod +x scripts/deployment/*.sh
chmod +x scripts/utils/*.sh
```

#### "gcloud not found"

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

#### "Docker not running"

```bash
# Start Docker service
sudo systemctl start docker
# Or use Docker Desktop
```

## 🔐 Security Notes

- **Never commit** Google Cloud service account keys
- **Rotate secrets** regularly using `setup-secrets.sh`
- **Use least-privilege** IAM roles for service accounts
- **Review logs** regularly for suspicious activity

## 📚 Related Documentation

- [Deployment Guide](../docs/deployment/DEPLOY.md)
- [GitHub Actions Setup](../docs/deployment/GITHUB-ACTIONS-SETUP.md)
- [Development Guide](../docs/DEVELOPMENT.md)
- [Environment Configuration](../docs/DEVELOPMENT.md#environment-configuration)

---

**Last Updated**: January 2025  
**Maintained by**: DevOps Team

### Utility Scripts

```bash
# Diagnose Vertex AI issues
./scripts/utils/diagnose-vertex-ai.sh

# Generate password hash
node scripts/utils/hash-password.js
```

## Notes

- Make sure scripts are executable: `chmod +x script-name.sh`
- Some scripts require environment variables to be set
- Deployment scripts require Google Cloud CLI to be installed and authenticated
