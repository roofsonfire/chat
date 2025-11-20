# Open Source AI Chat Assistant

> 🤖 Production-ready multimodal AI chat application built with Next.js 15, TypeScript, and Google Vertex AI

[![Deploy to Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-blue?logo=googlecloud)](https://cloud.google.com/run)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)

## 🌟 Why Fork This Project?

This is a **community-driven**, **open-source** AI chat application that you can:

- **Deploy yourself** to any cloud platform
- **Customize** for your specific needs
- **Contribute to** and improve for everyone
- **Learn from** - comprehensive documentation and code patterns
- **Use commercially** under MIT license

## ✨ Key Features

### 🚀 Ready-to-Deploy

- **One-click Cloud Run deployment** with Docker
- **Comprehensive setup guides** for all skill levels
- **Production-grade security** with authentication and rate limiting
- **Scalable architecture** from 0 to thousands of users

### 🤖 Advanced AI Capabilities

- **Multimodal chat** - Text and image inputs with latest Gemini models
- **Real-time streaming** responses for instant feedback
- **Multiple AI models** support (Gemini 1.5 Flash, Pro, 2.0 Flash)
- **Context-aware conversations** with memory

### 🛠️ Developer Experience

- **TypeScript strict mode** - Full type safety
- **Modern tech stack** - Next.js 15, React 19, Tailwind CSS 4
- **Comprehensive testing** - Unit, integration, and Storybook
- **Detailed documentation** - API docs, patterns, and guides

### 🔐 Enterprise-Ready Security

- **OAuth integration** with Google and custom allowlists
- **Rate limiting** and DDoS protection
- **Security headers** and CSRF protection
- **Audit trail** and logging

## 🚀 Quick Start

### Option 1: One-Click Deploy to Cloud Run

[![Deploy to Cloud Run](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

### Option 2: Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-chat-assistant.git
cd ai-chat-assistant

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

**Complete setup guide:** [📖 Development Guide](docs/DEVELOPMENT.md)

## 📖 Documentation

| Guide                                       | Description                     |
| ------------------------------------------- | ------------------------------- |
| [🚀 Quick Start](docs/guides/QUICKSTART.md) | 5-minute setup guide            |
| [⚙️ Development](docs/DEVELOPMENT.md)       | Comprehensive development setup |
| [🚀 Deployment](docs/deployment/DEPLOY.md)  | Production deployment guide     |
| [🔐 Security](docs/SECURITY.md)             | Security configuration          |
| [🤝 Contributing](docs/CONTRIBUTING.md)     | How to contribute               |
| [📚 API Reference](docs/API.md)             | API endpoints and usage         |

## 🏗️ Architecture

```text
┌─────────────────────────────────────┐
│           Frontend (React)          │
│  • Next.js 15 App Router           │
│  • TypeScript + Tailwind CSS       │
│  • Real-time streaming UI          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Backend (Next.js API)       │
│  • Authentication (NextAuth.js)     │
│  • Rate limiting & security         │
│  • Streaming API endpoints          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        AI Service (Vertex AI)       │
│  • Google Gemini models            │
│  • Multimodal processing           │
│  • Real-time streaming             │
└─────────────────────────────────────┘
```

## 🎯 Use Cases

### Personal & Educational

- **Learning tool** for AI/ML students
- **Personal AI assistant** with custom deployment
- **Research projects** requiring multimodal AI

### Business & Enterprise

- **Customer support** chatbots with company knowledge
- **Internal tools** for document analysis
- **Prototype development** for AI-powered products

### Development & Integration

- **API backend** for mobile apps
- **Microservice** in larger systems
- **Reference implementation** for Vertex AI integration

## 🛠️ Tech Stack

| Category       | Technology                       | Purpose                             |
| -------------- | -------------------------------- | ----------------------------------- |
| **Frontend**   | Next.js 15, React 19, TypeScript | Modern web framework with SSR       |
| **Styling**    | Tailwind CSS 4, shadcn/ui        | Utility-first CSS with components   |
| **Backend**    | Next.js API Routes               | Serverless API endpoints            |
| **AI/ML**      | Google Vertex AI, Gemini models  | Multimodal AI processing            |
| **Auth**       | NextAuth.js, Google OAuth        | Secure authentication               |
| **Database**   | None (stateless)                 | Can be extended with your DB        |
| **Deployment** | Docker, Google Cloud Run         | Containerized serverless deployment |
| **Testing**    | Vitest, React Testing Library    | Comprehensive testing suite         |

## 🌍 Community

### 🤝 Contributing

We welcome contributions! See our [Contributing Guide](docs/CONTRIBUTING.md) for:

- **Code contributions** - Features, bug fixes, optimizations
- **Documentation** - Guides, API docs, examples
- **Testing** - Test cases, bug reports, QA
- **Design** - UI/UX improvements, accessibility

### 💬 Getting Help

- **📖 Documentation** - Check our comprehensive [docs](docs/README.md)
- **🐛 Issues** - Report bugs or request features via GitHub Issues
- **💬 Discussions** - Ask questions in GitHub Discussions
- **🔒 Security** - Report vulnerabilities via our [Security Policy](docs/SECURITY.md)

### 🌟 Recognition

Contributors are recognized in our:

- **README Hall of Fame** (coming soon)
- **Release notes** for significant contributions
- **Documentation credits** for docs improvements

## 📊 Project Status

| Aspect            | Status              | Details                                |
| ----------------- | ------------------- | -------------------------------------- |
| **Stability**     | ✅ Production Ready | Used in production deployments         |
| **Testing**       | ✅ 295+ Tests       | Unit, integration, and Storybook tests |
| **Security**      | ✅ Audited          | Security assessment completed          |
| **Documentation** | ✅ Comprehensive    | 95+ documentation files                |
| **Community**     | 🚀 Growing          | Active development and contributions   |

## 📈 Roadmap

### 🎯 Short Term (1-3 months)

- [ ] **Plugin system** for custom integrations
- [ ] **Conversation history** with database support
- [ ] **Multi-language support** i18n
- [ ] **Mobile app** React Native version

### 🚀 Medium Term (3-6 months)

- [ ] **Self-hosted models** support (Ollama, LocalAI)
- [ ] **Advanced RAG** with document upload
- [ ] **Team collaboration** features
- [ ] **API marketplace** for third-party integrations

### 🌟 Long Term (6+ months)

- [ ] **Multi-tenant SaaS** template
- [ ] **Enterprise features** (SSO, audit logs)
- [ ] **AI agent workflows** with function calling
- [ ] **Marketplace ecosystem** for plugins

## 🏆 Why Choose This Project?

### ✅ **Production Proven**

- Battle-tested in real deployments
- Security-audited and hardened
- Scalable architecture patterns

### ✅ **Developer Friendly**

- Comprehensive documentation
- Clear code patterns and examples
- Active community support

### ✅ **Business Ready**

- MIT license - use commercially
- Professional support available
- Enterprise deployment guides

### ✅ **Future Proof**

- Latest technology stack
- Modular, extensible architecture
- Active maintenance and updates

## 🔧 Deployment Options

| Platform             | Difficulty | Cost        | Best For               |
| -------------------- | ---------- | ----------- | ---------------------- |
| **Google Cloud Run** | Easy       | $5-50/month | Production deployments |
| **Vercel**           | Very Easy  | $0-20/month | Hobby projects, demos  |
| **Docker Compose**   | Medium     | Self-hosted | On-premise deployments |
| **Kubernetes**       | Hard       | Variable    | Enterprise, high-scale |

## 💰 Cost Estimation

### Google Cloud Run

- **Hobby use**: $2-5/month
- **Small business**: $10-30/month
- **Medium traffic**: $30-100/month

### Vertex AI API

- **Text chat**: ~$0.0001 per message
- **Image processing**: ~$0.001 per image
- **Monthly estimate**: $1-10 for typical usage

## 📜 License

**MIT License** - Use freely for personal and commercial projects.

See [LICENSE](LICENSE) file for full details.

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [Next.js](https://nextjs.org/) - The React Framework
- [Google Vertex AI](https://cloud.google.com/vertex-ai) - AI/ML Platform
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-First CSS
- [NextAuth.js](https://next-auth.js.org/) - Authentication

## 🌟 Star History

⭐ **Star this project** if you find it helpful!

---

<div align="center">

**Ready to build something amazing?**

[🚀 Deploy Now](https://deploy.cloud.run) • [📖 Read Docs](docs/README.md) • [💬 Get Support](https://github.com/YOUR_USERNAME/ai-chat-assistant/discussions)

Made with ❤️ by the community

</div>
