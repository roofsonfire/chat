# AI Chat Assistant

A production-grade multimodal chat application built with Next.js 15, TypeScript, and Google Vertex AI. Features real-time streaming responses, image generation capabilities, and secure authentication.

[![Deploy to Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-blue?logo=googlecloud)](https://staging.chat.daza.ar)
[![GitHub](https://img.shields.io/badge/GitHub-roofsonfire%2Fchat-black?logo=github)](https://github.com/roofsonfire/chat)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)

## 🌐 Live Demo

**Staging**: [https://staging.chat.daza.ar](https://staging.chat.daza.ar)

## ✨ Features

### 🤖 AI-Powered Chat

- **Multimodal conversations** with text and image support
- **Real-time streaming responses** for better UX
- **Dynamic model selection** - Automatically fetches available Gemini models
- **Image generation** capabilities with Vertex AI
- **Context-aware responses** with conversation memory

### 🔒 Security & Authentication

- **NextAuth.js integration** with Google OAuth
- **Invite-only access** with allowlist enforcement
- **Rate limiting** (5 requests per 10 seconds per IP)
- **bcrypt password hashing** for test credentials
- **Comprehensive security headers** via middleware

### 🏗️ Production-Ready Architecture

- **Next.js 15** with App Router and Turbopack
- **React 19** with Server and Client Components
- **TypeScript 5** with strict mode enabled
- **Serverless deployment** on Google Cloud Run
- **Automatic scaling** (0-10 instances)

### 🧪 Testing & Quality

- **Vitest projects** for unit, integration, and Storybook-driven component tests
- **Manual smoke scripts** validating Vertex AI endpoints and auth flows
- **Code quality** with ESLint, Prettier, Husky, and lint-staged
- **Playwright E2E suite** currently retired while journeys are rebuilt
- **Storybook** for interactive documentation and visual checks

### 🎨 Modern UI/UX

- **Tailwind CSS 4** for styling
- **shadcn/ui** components with Radix UI
- **Responsive design** (mobile-first)
- **Dark mode support**
- **Accessible components** with ARIA labels

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22.x (matches production image)
- **npm** or **yarn**
- **Google Cloud Platform** account with Vertex AI enabled
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/roofsonfire/chat.git
cd chat
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure your `.env.local` with these required variables:

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Authentication
AUTH_USER_EMAIL="your-email@example.com"
AUTH_USER_PASSWORD_HASH="your-bcrypt-hash-here"

# Google Cloud / Vertex AI
GOOGLE_PROJECT_ID="your-gcp-project-id"
GOOGLE_LOCATION="us-central1"
GOOGLE_VERTEX_AI_MODEL_ID="gemini-2.5-flash-image"

# Google OAuth (Required for Google Sign-In)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Development/Testing (optional)
ENABLE_TEST_CREDENTIALS="true"
```

### 3. Generate Password Hash

```bash
npm run hash-password
# Follow prompts to generate bcrypt hash for AUTH_USER_PASSWORD_HASH
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking

### Code Quality

- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:check` - Check linting without fixing
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Generate test coverage report (HTML/JSON under `coverage/`)
- `npm run storybook` - Launch Storybook-driven component tests

### Utilities

- `npm run hash-password` - Generate bcrypt password hash
- `npm run storybook` - Start Storybook component docs
- `npm run build-storybook` - Build Storybook for production

## 🛠️ Editor Setup

### VS Code (Recommended)

This project includes comprehensive **VS Code workspace configuration**:

#### 📦 Auto-Install Extensions

- **TypeScript & React**: Full IntelliSense and refactoring
- **Code Quality**: ESLint, Prettier, Error Lens
- **Testing**: Vitest Explorer
- **AI Tools**: GitHub Copilot integration
- **Styling**: Tailwind CSS IntelliSense

#### 🎯 One-Click Actions

- **`F5`** - Debug Next.js (full-stack debugging)
- **`Ctrl+Shift+P`** → **`Tasks: Run Task`**:
  - 🚀 Start Development Server
  - 🧪 Run Unit Tests (Watch Mode)
  - 🔧 Fix Code Issues (Format + Lint)
  - 🚀 Deploy to Staging

#### 🐛 Debugging Features

- **Server-side**: Debug API routes and Server Components
- **Client-side**: Chrome DevTools integration with source maps
- **Testing**: Debug unit tests with breakpoints
- **Compound configs**: Full-stack debugging sessions

### Zed Editor

**Fast, modern alternative** with built-in configuration:

#### 🚀 Features

- **Native performance** with Rust-based architecture
- **Built-in LSP** for TypeScript, React, Tailwind CSS
- **AI integration** with GitHub Copilot
- **Project tasks** pre-configured for common workflows
- **Collaborative editing** features

#### ⚡ Quick Setup

```bash
# Project settings automatically loaded from .zed/settings.json
# Includes formatting, linting, and task configuration
```

### 📚 Complete Setup Guide

See **[Editor Setup Guide](docs/EDITOR-SETUP.md)** for detailed configuration, debugging setup, and performance optimization tips.

## 🏗️ Project Structure

```
chat/
├── 📁 src/
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── 📁 api/              # API routes (chat, auth, models)
│   │   ├── 📁 login/            # Authentication pages
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Home page (chat interface)
│   │   └── globals.css          # Global styles
│   ├── 📁 components/           # React components
│   │   ├── 📁 ui/               # shadcn/ui base components
│   │   ├── 📁 chat/             # Chat-specific components
│   │   ├── 📁 auth/             # Authentication components
│   │   └── performance-monitor.tsx
│   ├── 📁 lib/                  # Core utilities and services
│   │   ├── 📁 auth/             # Authentication logic
│   │   ├── 📁 services/         # Service layer (ChatService, etc.)
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 utils/            # Utility functions
│   │   ├── 📁 types/            # TypeScript type definitions
│   │   ├── 📁 validation/       # Zod schemas
│   │   ├── 📁 streaming/        # Streaming utilities
│   │   ├── 📁 features/         # Feature flags
│   │   ├── env.ts               # Environment validation
│   │   ├── logger.ts            # Centralized logging
│   │   ├── errors.ts            # Custom error classes
│   │   └── performance.ts       # Performance monitoring
│   └── middleware.ts            # Next.js middleware
├── 📁 scripts/                  # Utility scripts
│   ├── 📁 deployment/           # Deployment automation
│   ├── 📁 utils/                # Shared script helpers
│   ├── diagnose-oauth.sh       # OAuth troubleshooting helper
│   ├── interactive-oauth-setup.sh
│   └── setup-oauth-secrets.sh
├── 📁 tests/                    # Test files
│   ├── 📁 unit/                 # Unit tests
│   ├── 📁 integration/          # Integration tests
│   ├── 📁 manual/               # Manual smoke scripts
│   └── 📁 e2e/                  # Placeholder for future Playwright suite
├── 📁 docs/                     # Documentation
├── 📁 .github/                  # GitHub workflows & templates
├── 📁 .husky/                   # Git hooks
├── 📁 .storybook/               # Storybook configuration
├── Dockerfile                   # Container configuration
├── next.config.ts               # Next.js configuration
└── package.json                 # Dependencies & scripts
```

## 🌐 Deployment

### Production Hosting

- **Platform**: Google Cloud Run
- **Region**: us-central1 (Iowa)
- **Domain**: [staging.chat.daza.ar](https://staging.chat.daza.ar)
- **Scaling**: 0-10 instances (serverless)

### Deploy to Cloud Run

1. **Setup Google Cloud SDK**:

   ```bash
   gcloud auth login
   gcloud config set project norse-breaker-474323-n8
   ```

2. **Create secrets** (first-time only):

   ```bash
   echo -n "your-email@example.com" | gcloud secrets create auth-email --data-file=-
   node scripts/utils/hash-password.js "your-password"
   echo -n "PASTE_BCRYPT_HASH" | gcloud secrets create auth-password-hash --data-file=-
   ```

3. **Deploy**:

   ```bash
   chmod +x scripts/deployment/deploy-staging.sh
   ./scripts/deployment/deploy-staging.sh
   ```

4. **Configure DNS** (for custom domain):
   ```
   Type: CNAME
   Name: staging.chat
   Value: ghs.googlehosted.com
   TTL: 3600
   ```

For detailed deployment instructions, see [Cloud Run Deployment Guide](docs/deployment/CLOUD-RUN-DEPLOYMENT.md).

## 🧪 Testing

### Unit Tests

```bash
npm run test
npm run test:coverage  # With coverage report
```

### Test Structure

- **Unit/Integration**: `tests/unit/` and `tests/integration/`
- **Storybook Vitest Project**: `.storybook/` + linked stories for visual assertions
- **Manual Scripts**: `tests/manual/` for Vertex AI and auth smoke tests (run via `node tests/manual/<script>.mjs`)
- **E2E Automation**: `tests/e2e/` retained as placeholder while Playwright suite is rebuilt
- **Coverage**: Aim for >80% on critical paths (reports in `coverage/`)

## 🔐 Authentication

### Google OAuth (Primary)

- Invite-only access with allowlist
- Configured via Google Cloud Console
- Users must be pre-approved

### Test Credentials (Development)

- Enabled with `ENABLE_TEST_CREDENTIALS=true`
- Uses email/password with bcrypt hashing
- Only for testing and local development (set to `false` in staging/production)

### Rate Limiting

- 5 requests per 10 seconds per IP
- Applied to all API endpoints
- Implemented via middleware

## 🤖 AI Integration

### Vertex AI Models

- **Default**: `gemini-2.5-flash-image` (multimodal text + image support)
- **Dynamic Selection**: Fetches available models at runtime based on Vertex AI catalog

### Features

- Text and image input support
- Real-time streaming responses
- Context-aware conversations
- Image generation capabilities

### Configuration

```env
GOOGLE_PROJECT_ID="your-gcp-project"
GOOGLE_LOCATION="us-central1"
GOOGLE_VERTEX_AI_MODEL_ID="gemini-2.5-flash-image"
```

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS:

```bash
# Add new components
npx shadcn@latest add button
npx shadcn@latest add input
```

Components are customizable and accessible out of the box.

### 📚 Documentation

- [**Documentation Index**](docs/README.md) - Complete guides and navigation
- [**Project Status Summary**](docs/PROJECT-STATUS.md) - Deployment snapshot and roadmap
- [**Development Guide**](docs/DEVELOPMENT.md) - Local setup, workflows, and tooling
- [**Cloud Run Deployment**](docs/deployment/CLOUD-RUN-DEPLOYMENT.md) - Production rollout steps
- [**OAuth Setup**](docs/OAUTH-SETUP.md) - Google OAuth configuration & troubleshooting
- [**GitHub Copilot Instructions**](.github/copilot-instructions.md) - AI pairing guidance
- [**Model Selection**](docs/features/MODEL-SELECTION.md) - Dynamic Vertex AI configuration

## 🛡️ Security

### Security Measures

- **Authentication**: NextAuth.js with OAuth
- **Rate Limiting**: 5 req/10sec per IP
- **Input Validation**: Zod schemas for all inputs
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Password Security**: bcrypt with 10 salt rounds
- **Secrets Management**: Google Cloud Secret Manager

### Security Policy

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our [coding standards](.github/copilot-instructions.md)
4. **Run tests**: `npm run test`
5. **Submit a pull request** using our [PR template](.github/PULL_REQUEST_TEMPLATE.md)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📊 Tech Stack

### Core Technologies

- **Next.js 15** - React framework with App Router
- **React 19** - Server and Client Components
- **TypeScript 5** - Type safety with strict mode
- **Tailwind CSS 4** - Utility-first styling
- **Google Vertex AI** - Multimodal AI capabilities

### Key Dependencies

- **NextAuth.js** - Authentication
- **Zod** - Runtime validation
- **bcrypt** - Password hashing
- **rate-limiter-flexible** - Rate limiting
- **shadcn/ui** - UI components
- **Radix UI** - Accessible primitives
- **Lucide React** - Icon library

### Development Tools

- **Vitest** - Unit testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Storybook** - Component documentation

## 📈 Performance

- **Server Components** for better performance
- **Streaming responses** for AI chat
- **Web Vitals monitoring** with built-in metrics
- **Automatic code splitting** with Next.js
- **Image optimization** with Next.js Image
- **Turbopack** for faster builds

## 🌍 Environment Support

- **Development**: `npm run dev` with hot reload
- **Staging**: [staging.chat.daza.ar](https://staging.chat.daza.ar)
- **Production**: Ready for Cloud Run deployment

## 💰 Cost Estimation

### Google Cloud Run (Monthly)

- **Low usage** (~1K requests): $2-5
- **Medium usage** (~10K requests): $10-20
- **High usage** (~50K requests): $30-50

### Vertex AI

- **Text generation**: ~$0.0001 per request
- **Image generation**: ~$0.001 per request

## 🆘 Support & Community

- **🐛 [Report Issues](https://github.com/roofsonfire/chat/issues/new/choose)** - Bug reports & feature requests
- **💬 [Discussions](https://github.com/roofsonfire/chat/discussions)** - Questions & ideas
- **📚 [Documentation](docs/README.md)** - Comprehensive guides
- **🛡️ [Security](SECURITY.md)** - Security policy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Vercel** - Development tools and inspiration
- **Google Cloud** - Vertex AI and Cloud Run platform
- **shadcn** - Beautiful UI components
- **Contributors** - Everyone who helped build this

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Google Vertex AI**

[🏠 Repository](https://github.com/roofsonfire/chat) • [📚 Documentation](docs/README.md) • [🌐 Live Demo](https://staging.chat.daza.ar)

⭐ **Star us on GitHub** if you find this project helpful!

</div>
