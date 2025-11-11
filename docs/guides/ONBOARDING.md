# Onboarding Checklist

Welcome to the chat project! This guide will help you get from zero to productive in **~30 minutes**.

## ✅ Quick Setup Checklist

Use this interactive checklist to track your progress:

### Prerequisites (5 minutes)

- [ ] **Node.js 20.x or higher** installed
  - Verify: `node --version` (should show v20.0.0 or higher)
  - Install: [nodejs.org](https://nodejs.org/)
- [ ] **npm 9.x or higher** installed
  - Verify: `npm --version` (should show 9.0.0 or higher)
  - Usually comes with Node.js
- [ ] **Git 2.x or higher** installed
  - Verify: `git --version`
  - Install: [git-scm.com](https://git-scm.com/)
- [ ] **Google Cloud account** created
  - Sign up: [cloud.google.com](https://cloud.google.com/)
  - Free tier available ($300 credit)
- [ ] **Text editor** installed (VS Code recommended)
  - Download: [code.visualstudio.com](https://code.visualstudio.com/)
  - See [EDITOR-SETUP.md](../EDITOR-SETUP.md) for configuration

### Repository Setup (3 minutes)

- [ ] **Clone repository**
  ```bash
  git clone https://github.com/roofsonfire/chat.git
  cd chat
  ```
- [ ] **Install dependencies**
  ```bash
  npm install
  ```
  - **Expected**: ~2000 packages installed, ~30 seconds
  - **If fails**: Delete `node_modules/` and `package-lock.json`, try again

### Environment Configuration (10 minutes)

- [ ] **Create environment file**
  ```bash
  cp .env.example .env.local
  ```
- [ ] **Generate NextAuth secret**
  ```bash
  openssl rand -base64 32
  ```
  - Copy output to `NEXTAUTH_SECRET` in `.env.local`
- [ ] **Set NextAuth URL**
  ```env
  NEXTAUTH_URL=http://localhost:3000
  ```
- [ ] **Set authorized user email**
  ```env
  AUTH_USER_EMAIL=your-email@example.com
  ```
  - Use the email you'll sign in with (must be in allowlist)
- [ ] **Generate password hash**
  ```bash
  npm run hash-password
  ```
  - Enter your password when prompted
  - Copy hash to `AUTH_USER_PASSWORD_HASH` in `.env.local`

### Google Cloud Setup (8 minutes)

- [ ] **Create GCP project**
  - Go to [console.cloud.google.com](https://console.cloud.google.com/)
  - Create new project or select existing
  - Note project ID (e.g., `my-chat-project-123`)
- [ ] **Enable Vertex AI API**
  ```bash
  gcloud services enable aiplatform.googleapis.com
  ```
  - Or enable in Cloud Console: APIs & Services → Enable APIs
- [ ] **Set up authentication** (choose one):
  
  **Option A - Application Default Credentials (recommended for dev):**
  ```bash
  gcloud auth application-default login
  ```
  
  **Option B - Service Account:**
  ```bash
  # Create service account
  gcloud iam service-accounts create chat-dev \
    --display-name="Chat Development"
  
  # Grant Vertex AI User role
  gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:chat-dev@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
  
  # Create key
  gcloud iam service-accounts keys create ~/chat-key.json \
    --iam-account=chat-dev@YOUR_PROJECT_ID.iam.gserviceaccount.com
  
  # Set environment variable
  export GOOGLE_APPLICATION_CREDENTIALS=~/chat-key.json
  ```
- [ ] **Configure environment variables**
  ```env
  GOOGLE_PROJECT_ID=your-project-id
  GOOGLE_LOCATION=us-central1
  GOOGLE_VERTEX_AI_MODEL_ID=gemini-2.5-flash-image
  ```

### OAuth Setup (Optional - 5 minutes)

Only needed if using Google OAuth (production feature):

- [ ] **Create OAuth credentials**
  - Go to: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
  - Create OAuth 2.0 Client ID
  - Application type: Web application
  - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
- [ ] **Add credentials to environment**
  ```env
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret
  ```
- [ ] **Enable test credentials** (for local dev)
  ```env
  ENABLE_TEST_CREDENTIALS=true
  ```

### Verification (4 minutes)

- [ ] **Run development server**
  ```bash
  npm run dev
  ```
  - **Expected**: Server starts on http://localhost:3000
  - **Expected output**:
    ```text
    ▲ Next.js 15.0.4
    - Local:        http://localhost:3000
    - Environments: .env.local
    
    ✓ Starting...
    ✓ Ready in 2.1s
    ```
- [ ] **Test in browser**
  - Open http://localhost:3000
  - Should see login page or chat interface
- [ ] **Run linters**
  ```bash
  npm run lint
  npm run type-check
  ```
  - **Expected**: No errors (warnings are OK)
- [ ] **Run tests**
  ```bash
  npm run test
  ```
  - **Expected**: All tests pass

### Final Checks (2 minutes)

- [ ] **Verify chat functionality**
  - Send a test message: "Hello!"
  - Should receive AI response within 5 seconds
  - Check browser console for errors (F12)
- [ ] **Check environment validation**
  ```bash
  npm run validate-env
  ```
  - If this script doesn't exist, all required vars are validated at runtime
- [ ] **Review documentation**
  - Read: [DEVELOPMENT.md](../DEVELOPMENT.md)
  - Skim: [PROJECT-NAVIGATION.md](../PROJECT-NAVIGATION.md)
  - Bookmark: [API.md](../API.md)

## 🚀 Next Steps

Now that you're set up:

1. **Explore the codebase**
   - Start with `src/app/page.tsx` (homepage)
   - Check `src/app/api/chat/route.ts` (chat API)
   - Review `src/lib/services/chat-service.ts` (AI logic)

2. **Try making a change**
   - Modify `src/app/page.tsx` heading text
   - Save and see hot reload in action
   - Test that change appears in browser

3. **Run a full dev cycle**
   ```bash
   # Make changes to code
   npm run lint        # Check code style
   npm run type-check  # Verify TypeScript
   npm run test        # Run tests
   npm run build       # Build for production
   ```

4. **Join the team**
   - Read [CONTRIBUTING.md](../CONTRIBUTING.md)
   - Check [PROJECT-STATUS.md](../PROJECT-STATUS.md)
   - Review open issues on GitHub

## ⚠️ Common Pitfalls

### Issue: "Authentication failed" when starting dev server

**Symptoms:**
```
Error: Could not load the default credentials
```

**Solution:**
```bash
# Re-authenticate with Google Cloud
gcloud auth application-default login

# Or verify service account key path
echo $GOOGLE_APPLICATION_CREDENTIALS
```

---

### Issue: npm install fails with ERESOLVE

**Symptoms:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Delete existing files
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

---

### Issue: Port 3000 already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

---

### Issue: "Invalid environment variables" error

**Symptoms:**
```
❌ Environment validation failed:
  - NEXTAUTH_SECRET: String must contain at least 32 character(s)
```

**Solution:**
```bash
# Regenerate secret
openssl rand -base64 32

# Copy to .env.local
# Ensure no extra spaces or quotes
```

---

### Issue: Vertex AI quota exceeded

**Symptoms:**
```
Error 429: Quota exceeded for quota metric 'Gemini API requests'
```

**Solution:**
- Wait a few minutes (rate limit resets)
- Request quota increase: [console.cloud.google.com/iam-admin/quotas](https://console.cloud.google.com/iam-admin/quotas)
- Use different model (e.g., `gemini-1.5-flash-002` instead of `gemini-1.5-pro-002`)

---

### Issue: Hot reload not working

**Symptoms:**
- Make code changes but browser doesn't update
- Have to manually refresh

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev

# If using VS Code, check file watcher limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### Issue: TypeScript errors in editor but code runs

**Symptoms:**
- Red squiggly lines in VS Code
- Code compiles and runs fine

**Solution:**
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or rebuild TypeScript
npm run type-check
```

---

### Issue: "Module not found" after installing package

**Symptoms:**
```
Error: Cannot find module '@new/package'
```

**Solution:**
```bash
# Restart dev server
# Ctrl+C, then npm run dev

# Verify package is in package.json
cat package.json | grep "@new/package"

# Reinstall if needed
npm install @new/package
```

---

### Issue: Pre-commit hooks fail

**Symptoms:**
```
✖ eslint --fix [FAILED]
✖ lint-staged failed
```

**Solution:**
```bash
# Run linters manually to see details
npm run lint
npm run format

# Fix issues automatically
npm run lint:fix
npm run format:fix

# If urgent, bypass hooks (not recommended)
git commit --no-verify -m "message"
```

---

### Issue: Can't sign in with Google OAuth

**Symptoms:**
- Redirect to Google, then error page
- "Error: Configuration error"

**Solution:**
1. Verify redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
2. Check OAuth credentials in `.env.local`
3. Ensure email is in allowlist (check `src/lib/auth/config.ts`)
4. Use test credentials instead:
   ```
   ENABLE_TEST_CREDENTIALS=true
   ```
   Then sign in with email/password

---

## 🔍 Environment Validation Script

Create this script to validate your setup:

**File:** `scripts/validate-setup.sh`

```bash
#!/bin/bash

echo "🔍 Validating development environment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    if [[ "$NODE_VERSION" > "v20" ]]; then
        echo -e "${GREEN}✓${NC} $NODE_VERSION"
    else
        echo -e "${RED}✗${NC} $NODE_VERSION (need v20+)"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Not installed"
    exit 1
fi

# Check npm
echo -n "Checking npm version... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} Not installed"
    exit 1
fi

# Check Git
echo -n "Checking Git... "
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} v$GIT_VERSION"
else
    echo -e "${RED}✗${NC} Not installed"
    exit 1
fi

# Check gcloud
echo -n "Checking Google Cloud CLI... "
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud --version | head -n 1 | awk '{print $4}')
    echo -e "${GREEN}✓${NC} v$GCLOUD_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Not installed (optional for local dev)"
fi

# Check .env.local
echo -n "Checking environment file... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check required variables
    REQUIRED_VARS=(
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "AUTH_USER_EMAIL"
        "AUTH_USER_PASSWORD_HASH"
        "GOOGLE_PROJECT_ID"
        "GOOGLE_LOCATION"
        "GOOGLE_VERTEX_AI_MODEL_ID"
    )
    
    for VAR in "${REQUIRED_VARS[@]}"; do
        echo -n "  - $VAR... "
        if grep -q "^$VAR=" .env.local && ! grep -q "^$VAR=$" .env.local; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC} Missing or empty"
        fi
    done
else
    echo -e "${RED}✗${NC} Not found"
    echo "  Run: cp .env.example .env.local"
fi

# Check node_modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    PACKAGE_COUNT=$(ls -1 node_modules | wc -l)
    echo -e "${GREEN}✓${NC} $PACKAGE_COUNT packages"
else
    echo -e "${RED}✗${NC} Not installed"
    echo "  Run: npm install"
fi

# Check Google Cloud authentication
echo -n "Checking Google Cloud auth... "
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo -e "${GREEN}✓${NC} Service account key found"
    else
        echo -e "${RED}✗${NC} Key file not found: $GOOGLE_APPLICATION_CREDENTIALS"
    fi
elif gcloud auth application-default print-access-token &> /dev/null; then
    echo -e "${GREEN}✓${NC} Application default credentials"
else
    echo -e "${YELLOW}⚠${NC} Not configured"
    echo "  Run: gcloud auth application-default login"
fi

echo ""
echo "✅ Validation complete!"
echo ""
echo "Next steps:"
echo "  1. npm run dev          # Start development server"
echo "  2. npm run lint         # Check code style"
echo "  3. npm run test         # Run tests"
```

**Usage:**

```bash
# Make executable
chmod +x scripts/validate-setup.sh

# Run validation
./scripts/validate-setup.sh
```

---

## 📊 Time Estimates

Based on typical developer experience:

| Task | First Time | Experienced Developer |
|------|------------|----------------------|
| Prerequisites | 5-10 min | 0 min (already installed) |
| Repository setup | 3-5 min | 1-2 min |
| Environment config | 10-15 min | 5 min |
| Google Cloud setup | 10-20 min | 5 min |
| OAuth setup (optional) | 5-10 min | 3 min |
| Verification | 5 min | 2 min |
| **Total** | **38-65 min** | **16-19 min** |

## 📖 Additional Resources

### Documentation
- [Development Guide](../DEVELOPMENT.md) - Comprehensive development workflows
- [API Reference](../API.md) - All API endpoints and contracts
- [Project Navigation](../PROJECT-NAVIGATION.md) - Finding your way around the codebase
- [Editor Setup](../EDITOR-SETUP.md) - VS Code and Zed configuration

### Architecture
- [Architecture Diagrams](ARCHITECTURE-DIAGRAMS.md) - Visual system overview
- [Architecture Decisions](../adr/README.md) - ADRs explaining key choices
- [Code Patterns](.github/patterns/) - Reusable code patterns

### Deployment
- [Deployment Guide](../deployment/DEPLOY.md) - Deploying to Cloud Run
- [CI/CD Pipeline](../deployment/CI-CD.md) - Automated deployment workflows

### Community
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community standards
- [Project Status](../PROJECT-STATUS.md) - Current release state

---

## 🎯 Success Criteria

You're successfully onboarded when you can:

1. ✅ Start the development server without errors
2. ✅ Send a chat message and receive AI response
3. ✅ Make a code change and see it hot reload
4. ✅ Run linters and tests successfully
5. ✅ Build the project for production
6. ✅ Understand where to find key files (components, API routes, services)
7. ✅ Know how to get help (documentation, issues, team)

**Congratulations! You're ready to contribute! 🎉**

---

**Questions or issues?** Open a GitHub issue or check existing documentation.

**Last updated:** November 2025  
**Maintained by:** Core Development Team
