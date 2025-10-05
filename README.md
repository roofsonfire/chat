# Chat Application

A modern, production-grade chat application built with Next.js 15, TypeScript, and Google Vertex AI. This project follows SOLID principles, Clean Code practices, and implements comprehensive tooling for quality assurance.

## 🚀 Features

- **Next.js 15** with App Router and Turbopack
- **TypeScript** with strict mode enabled
- **Vertex AI Integration** for multimodal chat capabilities
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

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

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

This application uses NextAuth.js with a credentials provider. Users are authenticated via environment variables (invite-only system).

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

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Google Vertex AI](https://cloud.google.com/vertex-ai)
