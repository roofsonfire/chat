# Quickstart Guide

> Get the chat application running locally in **5 minutes** ⚡

This guide gets you from zero to a running application as fast as possible. For comprehensive setup, see [DEVELOPMENT.md](../DEVELOPMENT.md).

---

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js 22.x** or higher ([download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Git** ([download](https://git-scm.com/))
- ✅ **Google Cloud account** with billing enabled ([sign up](https://console.cloud.google.com/))

**Time estimate:** 5 minutes (assuming prerequisites are met)

---

## Step 1: Clone and Install (1 min)

```bash
# Clone repository
git clone https://github.com/roofsonfire/chat.git
cd chat

# Install dependencies
npm install
```

**Expected output:** Package installation completes successfully.

---

## Step 2: Environment Setup (2 min)

### Copy environment template

```bash
cp .env.example .env.local
```

### Generate required secrets

```bash
# 1. Generate NextAuth secret
openssl rand -base64 32
# Copy output and set as NEXTAUTH_SECRET in .env.local

# 2. Generate password hash
npm run hash-password
# Enter a password when prompted
# Copy output and set as AUTH_USER_PASSWORD_HASH in .env.local
```

### Edit `.env.local`

Open `.env.local` and configure these **required** variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET="<paste-generated-secret-here>"
NEXTAUTH_URL="http://localhost:3000"

# Authentication
AUTH_USER_EMAIL="your-email@example.com"
AUTH_USER_PASSWORD_HASH="<paste-generated-hash-here>"

# Google Cloud (get from Google Cloud Console)
GOOGLE_PROJECT_ID="your-gcp-project-id"
GOOGLE_LOCATION="us-central1"
GOOGLE_VERTEX_AI_MODEL_ID="gemini-2.5-flash-image"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Development only (enables test login)
ENABLE_TEST_CREDENTIALS="true"
```

---

## Step 3: Google Cloud Setup (1.5 min)

### Enable Vertex AI API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create your project
3. Navigate to **APIs & Services > Library**
4. Search for "Vertex AI API"
5. Click **Enable**

### Setup Application Default Credentials

**Option A: Application Default Credentials** (recommended for local dev)

```bash
gcloud auth application-default login
```

**Option B: Service Account** (for CI/CD)

```bash
# Create service account
gcloud iam service-accounts create chat-dev \
  --display-name="Chat Development"

# Grant Vertex AI permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:chat-dev@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Download key
gcloud iam service-accounts keys create key.json \
  --iam-account=chat-dev@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/key.json"
```

---

## Step 4: OAuth Configuration (0.5 min)

### Create OAuth Credentials

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. Set **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Copy **Client ID** and **Client Secret** to `.env.local`

**Detailed guide:** [docs/OAUTH-SETUP.md](../OAUTH-SETUP.md)

---

## Step 5: Start Development Server (0.5 min)

```bash
npm run dev
```

**Expected output:**

```
> chat@0.1.0 dev
> next dev --turbopack

  ▲ Next.js 15.5.0 (Turbopack)
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

---

## Step 6: Test the Application

### Access the app

1. Open browser to [http://localhost:3000](http://localhost:3000)
2. You should see the chat interface

### Sign in (Development Mode)

Since `ENABLE_TEST_CREDENTIALS=true`, you can sign in with:

- **Email:** The email you set in `AUTH_USER_EMAIL`
- **Password:** The password you used to generate the hash

### Send your first message

1. Type "Hello!" in the chat input
2. Press Enter or click Send
3. You should see a streaming response from Gemini AI

---

## ✅ Success Checklist

If everything worked, you should:

- ✅ See the chat interface at http://localhost:3000
- ✅ Be able to sign in with test credentials
- ✅ Send messages and receive AI responses
- ✅ See streaming text appear in real-time

---

## 🐛 Troubleshooting

### "Authentication failed"

**Problem:** Can't sign in with test credentials.

**Solution:**

1. Verify `ENABLE_TEST_CREDENTIALS=true` in `.env.local`
2. Verify password hash matches the password you're using
3. Regenerate hash: `npm run hash-password`

---

### "Vertex AI error"

**Problem:** AI responses fail with Vertex AI error.

**Solution:**

1. Verify Vertex AI API is enabled in Google Cloud Console
2. Check authentication: `gcloud auth application-default print-access-token` should return a token
3. Verify `GOOGLE_PROJECT_ID` matches your actual project ID
4. Ensure your Google Cloud account has billing enabled

---

### "Rate limit exceeded"

**Problem:** Getting 429 errors.

**Solution:**
Rate limiting is 5 requests per 10 seconds. Wait a moment between requests in development.

To adjust for local dev, edit `src/middleware.ts`:

```typescript
const RATE_LIMIT_REQUESTS = 100; // Increase for development
const RATE_LIMIT_WINDOW_SECONDS = 10;
```

---

### "Module not found" or build errors

**Problem:** Import errors or build failures.

**Solution:**

1. Clear cache and reinstall:
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   ```
2. Verify Node.js version: `node --version` (should be 22.x)
3. Run type check: `npm run type-check`

---

### OAuth redirect issues

**Problem:** OAuth redirect fails or shows error.

**Solution:**

1. Verify redirect URI in Google Cloud Console matches exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
2. Check `NEXTAUTH_URL=http://localhost:3000` (no trailing slash)
3. Clear browser cookies and try again

**Full OAuth guide:** [docs/OAUTH-SETUP.md](../OAUTH-SETUP.md)

---

## 📚 Next Steps

### 1. Explore the Documentation

- **[Development Guide](../DEVELOPMENT.md)** - Comprehensive local development
- **[API Reference](../API.md)** - Endpoint documentation
- **[Pattern Library](../../.github/patterns/)** - Code patterns and best practices
- **[Project Navigation](../PROJECT-NAVIGATION.md)** - Find files and features

### 2. Run Tests

```bash
# All tests
npm run test

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### 3. Code Quality

```bash
# Lint and auto-fix
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### 4. Customize the Application

- **Add UI components:** `npx shadcn@latest add [component]`
- **Modify chat behavior:** Edit `src/lib/services/chat-service.ts`
- **Change styling:** Update Tailwind config in `tailwind.config.ts`
- **Add new pages:** Create files in `src/app/`

### 5. Deploy to Production

When ready to deploy:

1. **Review:** [Cloud Run Deployment Guide](../deployment/CLOUD-RUN-DEPLOYMENT.md)
2. **Setup:** Google Cloud project and secrets
3. **Deploy:** Run deployment script or use GitHub Actions

---

## 💡 Tips for Effective Development

### Hot Reload

Changes to files in `src/` trigger automatic reloading. No need to restart the dev server.

### Debug Logging

The application uses a structured logger. Add logs anywhere:

```typescript
import { logger } from "@/lib/logger";

logger.info("Something happened", { context: "value" });
logger.error("Error occurred", { error });
```

### VS Code Setup

For the best development experience:

1. Install recommended extensions (prompt appears on open)
2. Review [docs/EDITOR-SETUP.md](../EDITOR-SETUP.md)
3. Use GitHub Copilot with [.github/copilot-instructions.md](../../.github/copilot-instructions.md)

### Git Workflow

Pre-commit hooks automatically:

- Run ESLint with auto-fix
- Format code with Prettier
- Only check staged files

Just commit normally, and hooks handle the rest.

---

## 🆘 Still Stuck?

### Get Help

- 🐛 **[Report an Issue](https://github.com/roofsonfire/chat/issues/new/choose)** - Bug reports
- 💬 **[Start a Discussion](https://github.com/roofsonfire/chat/discussions)** - Questions
- 📚 **[Read Full Docs](../README.md)** - Comprehensive guides

### Common Resources

- [Development Guide](../DEVELOPMENT.md) - Detailed setup instructions
- [OAuth Setup](../OAUTH-SETUP.md) - Authentication configuration
- [API Documentation](../API.md) - Endpoint reference

---

## 🎉 You're Ready!

Congratulations! You now have a fully functional local development environment.

**Next:** Start exploring the codebase using [Project Navigation](../PROJECT-NAVIGATION.md) or dive into building features with our [Pattern Library](../../.github/patterns/).

**Happy coding! 🚀**

---

**Last Updated:** November 2025  
**Maintainers:** Core Development Team
