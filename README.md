# AI Chat Assistant

> Open-source multimodal chat application built with Next.js 15, TypeScript, and Google Vertex AI  
> **Community Project** • **MIT License** • **Contributions Welcome**

[![Deploy to Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-blue?logo=googlecloud)](https://cloud.google.com/run)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start

**5-minute setup:** [docs/guides/QUICKSTART.md](docs/guides/QUICKSTART.md)

```bash
git clone https://github.com/YOUR_USERNAME/ai-chat-assistant.git
cd ai-chat-assistant
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

**Full setup guide:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## ✨ Features

### Core Capabilities

- 🤖 **Multimodal AI Chat** - Text + image inputs with Gemini 2.5
- ⚡ **Real-time Streaming** - Instant response streaming
- 🎨 **Image Generation** - AI-powered image creation
- 🔐 **Secure Auth** - Google OAuth + invite-only access
- 🛡️ **Production-Ready** - Rate limiting, security headers, error handling

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: Next.js API Routes, Google Vertex AI, NextAuth.js
- **Infrastructure**: Google Cloud Run, Cloud Secret Manager
- **Testing**: Vitest, React Testing Library, Storybook

---

## 📂 Project Structure

```text
chat/
├── src/
│   ├── app/              # Next.js App Router (pages, API routes)
│   ├── components/       # React components (ui/, chat/, auth/)
│   ├── lib/             # Core utilities (services/, hooks/, types/)
│   └── middleware.ts    # Auth, rate limiting, security
├── tests/               # Unit, integration, manual tests
├── docs/                # Comprehensive documentation
└── .github/
    ├── copilot-instructions.md   # AI pairing context
    ├── copilot-quick-reference.md # Fast reference card
    └── patterns/                  # Code pattern library
```

**Full navigation:** [docs/PROJECT-NAVIGATION.md](docs/PROJECT-NAVIGATION.md)

---

## 📚 Documentation

### Getting Started

- **[Quickstart Guide](docs/guides/QUICKSTART.md)** - 5-minute setup ⚡
- **[Development Guide](docs/DEVELOPMENT.md)** - Local setup and workflows
- **[Project Navigation](docs/PROJECT-NAVIGATION.md)** - Find what you need fast

### Deployment

- **[Cloud Run Deployment](docs/deployment/CLOUD-RUN-DEPLOYMENT.md)** - Production setup
- **[CI/CD Pipeline](docs/deployment/CI-CD.md)** - GitHub Actions automation
- **[OAuth Setup](docs/OAUTH-SETUP.md)** - Google OAuth configuration

### Architecture & Code

- **[API Reference](docs/API.md)** - Endpoints and contracts
- **[Pattern Library](.github/patterns/)** - Reusable code patterns
- **[Model Selection](docs/features/MODEL-SELECTION.md)** - Dynamic AI models

### Operations

- **[Project Status](docs/PROJECT-STATUS.md)** - Current state and roadmap
- **[Security Policy](docs/SECURITY.md)** - Vulnerability reporting
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute

**Complete index:** [docs/README.md](docs/README.md)

---

## 🧪 Testing

```bash
npm run test              # Run all tests
npm run test:coverage     # With coverage report
npm run test:ui           # Interactive test UI
npm run lint              # ESLint check
npm run format            # Prettier format
```

**Test structure:** Unit tests • Integration tests • Storybook tests • Manual smoke tests  
**Coverage target:** >80% on critical paths

---

## 🔐 Security

- **Authentication**: NextAuth.js with Google OAuth (invite-only)
- **Rate Limiting**: 5 requests per 10 seconds per IP
- **Input Validation**: Zod schemas on all endpoints
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Secrets Management**: Google Cloud Secret Manager
- **Password Hashing**: bcrypt with 10 rounds

**Security policy:** [docs/SECURITY.md](docs/SECURITY.md)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow our patterns**: See [.github/patterns/](.github/patterns/)
4. **Write tests**: Maintain >80% coverage
5. **Submit a PR**: Use our [PR template](.github/PULL_REQUEST_TEMPLATE.md)

**Guidelines:** [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## 🛠️ Development

### Commands

```bash
npm run dev              # Development server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Lint code
npm run format           # Format code
npm run type-check       # TypeScript validation
npm run hash-password    # Generate password hash
```

### Environment Variables

Required variables (see `.env.example`):

```env
# NextAuth
NEXTAUTH_SECRET=          # openssl rand -base64 32
NEXTAUTH_URL=             # http://localhost:3000

# Google Cloud
GOOGLE_PROJECT_ID=        # Your GCP project ID
GOOGLE_CLIENT_ID=         # OAuth client ID
GOOGLE_CLIENT_SECRET=     # OAuth client secret

# Auth User
AUTH_USER_EMAIL=          # Authorized email
AUTH_USER_PASSWORD_HASH=  # bcrypt hash
```

**Complete setup:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## 📊 Performance

- **Server Components** by default for reduced JavaScript
- **Streaming responses** for real-time AI chat
- **Automatic code splitting** with Next.js
- **Image optimization** with next/image
- **Turbopack** for faster development builds
- **Edge middleware** for rate limiting

**Metrics:** [docs/PERFORMANCE.md](docs/PERFORMANCE.md)

---

## 🌍 Deployment

**Production**: [chat.daza.ar](https://chat.daza.ar) (Google Cloud Run, us-central1)  
**Branch strategy**: `develop` (testing) → `main` (production)

### Deploy to Cloud Run

```bash
# One-command deploy
./scripts/deployment/deploy-production.sh

# Or manual deploy
gcloud run deploy chat-production \
  --source . \
  --region us-central1 \
  --platform managed
```

**Full guide:** [docs/deployment/CLOUD-RUN-DEPLOYMENT.md](docs/deployment/CLOUD-RUN-DEPLOYMENT.md)

---

## 💰 Cost Estimation

### Google Cloud Run (Monthly)

- Low usage (~1K requests): **$2-5**
- Medium usage (~10K requests): **$10-20**
- High usage (~50K requests): **$30-50**

### Vertex AI

- Text generation: **~$0.0001** per request
- Image generation: **~$0.001** per request

---

## 🆘 Support

- 🐛 **Report Issues** - Bug reports & feature requests via GitHub Issues
- 💬 **Discussions** - Questions & ideas via GitHub Discussions
- 📚 **[Documentation](docs/README.md)** - Comprehensive guides
- 🛡️ **[Security](docs/SECURITY.md)** - Security policy & vulnerability reporting

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org/), [Google Vertex AI](https://cloud.google.com/vertex-ai), [shadcn/ui](https://ui.shadcn.com/), and ❤️ by the community.

---

<div align="center">

**⭐ Star this project if it helps you!**

[📚 Documentation](docs/README.md) • [🚀 Quick Start](docs/guides/QUICKSTART.md) • [🤝 Contributing](docs/CONTRIBUTING.md)

</div>
