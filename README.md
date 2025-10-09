# Chat Application

A modern, production-grade chat application built with Next.js 15, TypeScript, and Google Vertex AI. This project follows SOLID principles, Clean Code practices, and implements comprehensive tooling for quality assurance.

## 🚀 Features

- **Next.js 15** with App Router and Turbopack
- **TypeScript** with strict mode enabled
- **Vertex AI Integration** for multimodal chat capabilities
- **Dynamic Model Selection** - Automatically fetches and displays available Gemini models from Vertex AI API
- **Authentication** with NextAuth.js
- **Modern UI** built with shadcn/ui and Tailwind CSS
- **E2E Testing** with Playwright
- **Code Quality** enforced with ESLint, Prettier, and Husky

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Google Cloud Platform account with Vertex AI enabled
- Git

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/roofsonfire/chat.git
cd chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory based on `.env.example`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration values.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📜 Available Scripts

### 🔨 Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking

### 🎨 Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### 🧪 Testing

- `npm run test` - Run unit tests with Vitest
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI mode

### 🛠️ Utilities

- `npm run hash-password` - Generate bcrypt password hash
- `npm run storybook` - Start Storybook component documentation

## 🏗️ Project Structure

```
chat/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── login/             # Login page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── chat/              # Chat-specific components
│   │   └── auth/              # Authentication components
│   ├── lib/                   # Utility functions and configurations
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # Service layer (AI, auth, etc.)
│   │   ├── utils/             # Utility functions
│   │   └── types/             # TypeScript type definitions
│   └── styles/                # Global styles
├── scripts/                   # Utility scripts
├── tests/                     # E2E tests (Playwright)
├── .husky/                    # Git hooks
└── public/                    # Static assets
```

## 🧪 Testing

### E2E Tests with Playwright

```bash
npm run test:e2e
```

## 🔐 Authentication

This application uses NextAuth.js with Google OAuth as the primary login path. Only users on the invite allowlist can access the app. A credentials provider remains available **only** when `ENABLE_TEST_CREDENTIALS=true` (used for automated tests and local debugging).

## 🎨 UI Components

UI components are built with [shadcn/ui](https://ui.shadcn.com/), a collection of re-usable components built with Radix UI and Tailwind CSS.

To add new components:

```bash
npx shadcn@latest add button
```

## 🤖 AI Integration

The application integrates with Google Vertex AI for multimodal chat capabilities supporting both text and image inputs.

## 📦 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js
- **AI**: Google Vertex AI
- **Validation**: Zod
- **Testing**: Playwright
- **Code Quality**: ESLint, Prettier, Husky

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our [code standards](.github/copilot-instructions.md)
4. Run tests (`npm run test` and `npm run test:e2e`)
5. Submit a pull request using our [PR template](.github/PULL_REQUEST_TEMPLATE.md)

## 📚 Documentation

- **📖 [Complete Documentation](docs/README.md)** - Comprehensive documentation index
- **🚀 [Development Guide](docs/DEVELOPMENT.md)** - Detailed setup and development workflow
- **📡 [API Documentation](docs/API.md)** - REST API reference
- **🧪 [Testing Guide](docs/testing/E2E-TESTING-GUIDE.md)** - Testing strategies and setup
- **🚀 [Deployment Guide](docs/deployment/DEPLOY.md)** - Production deployment instructions
- **🤖 [GitHub Copilot Instructions](.github/copilot-instructions.md)** - AI pair programming context

## 🛡️ Security

Security is a top priority. Please review our [Security Policy](SECURITY.md) for:

- Vulnerability reporting procedures
- Security measures already in place
- Security best practices

## 🆘 Support & Community

- **🐛 [Report Issues](https://github.com/roofsonfire/chat/issues/new/choose)** - Use our issue templates
- **💬 [Discussions](https://github.com/roofsonfire/chat/discussions)** - Ask questions and share ideas
- **📚 [Documentation](docs/README.md)** - Comprehensive guides and references

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Google Vertex AI**

[🏠 Home](https://github.com/roofsonfire/chat) • [📚 Docs](docs/README.md) • [🐛 Issues](https://github.com/roofsonfire/chat/issues) • [💬 Discussions](https://github.com/roofsonfire/chat/discussions)

</div>

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Google Vertex AI](https://cloud.google.com/vertex-ai)
