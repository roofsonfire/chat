# GitHub Copilot Instructions

**Quick Start:** For fast context, see [copilot-quick-reference.md](copilot-quick-reference.md)  
**Code Patterns:** See [patterns/](patterns/) for detailed implementation guides

---

## 🎯 Project Context

### What This Is

Production-grade AI chat application built with Next.js 15, TypeScript, and Google Vertex AI. **Security-hardened** (November 2025) with comprehensive audit remediation and enhanced UI/UX.

### Repository Information

- **GitHub**: `roofsonfire/chat` - https://github.com/roofsonfire/chat
- **Production**: https://chat.daza.ar (Google Cloud Run, us-central1)
- **Branches**: `develop` (testing) → `main` (production)
- **Current Status**: v0.1.0 pre-release, security audit complete, PR #127 pending merge

### Core Stack

- **Next.js 15** - App Router, Turbopack, Server Components
- **React 19** - Server Components by default
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui v4** - Component library with data-slot attributes
- **Google Vertex AI** - Gemini 2.5 models (multimodal)
- **NextAuth.js** - Google OAuth + test credentials

### Recent Achievements (November 2025)

- ✅ **Security Hardening Complete** - 9 audit findings remediated, enhanced authentication
- ✅ **Repository Cleanup** - Organized documentation structure, removed duplicates
- ⏳ **UI/UX Improvements** - Image aspect ratios, loading states (PR #127 ready)
- ✅ **Test Stability** - All 295 tests passing, enhanced CI/CD workflows
- ✅ **Expert Refactorer Validation** - A+ grade (95/100) for code quality

---

## 📂 Project Structure

```text
src/
├── app/              # Next.js App Router (pages, API routes)
├── components/       # React components
│   ├── ui/          # shadcn/ui v4 component library
│   ├── chat/        # Chat-specific components
│   └── auth/        # Authentication components
├── lib/             # Core utilities and services
│   ├── services/    # ChatService, etc.
│   ├── hooks/       # Custom React hooks
│   ├── types/       # TypeScript definitions
│   ├── validation/  # Zod schemas
│   └── env.ts       # Environment validation
└── middleware.ts    # Auth, rate limiting, security headers
```

**See:** [patterns/architecture-summary.md](patterns/architecture-summary.md) for complete structure

---

## 🎨 Code Style Essentials

### TypeScript Rules

- ✅ **Strict mode** enabled - no `any` types
- ✅ **Explicit return types** for functions
- ✅ **Type imports**: `import type { Type } from "..."`
- ✅ **Runtime validation**: Use Zod for external data

### React & Next.js Rules

- ✅ **Server Components by default** - only add `"use client"` when needed
- ✅ **Async Server Components** for data fetching
- ✅ **App Router conventions** (not Pages Router)
- ✅ **Streaming responses** for AI chat

### Naming Conventions

- **Files**: kebab-case (`chat-service.ts`, `user-profile.tsx`)
- **Components**: PascalCase (`ChatMessage`, `UserProfile`)
- **Functions/Variables**: camelCase (`handleSubmit`, `userData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_TIMEOUT`)
- **Types/Interfaces**: PascalCase (`User`, `ChatMessage`)

### Import Order

```typescript
// 1. External libraries
import { useState } from "react";
import { NextResponse } from "next/server";

// 2. Internal absolute imports
import { ChatService } from "@/lib/services/chat-service";
import { logger } from "@/lib/logger";

// 3. Relative imports
import { LocalComponent } from "./local-component";

// 4. Type imports (at end)
import type { Message } from "@/lib/types";
```

---

## 🏗️ Architecture Patterns

### When to Use What

| Need             | Use                               | Pattern Reference                                                   |
| ---------------- | --------------------------------- | ------------------------------------------------------------------- |
| API endpoint     | Next.js route handler             | [api-route-pattern.md](patterns/api-route-pattern.md)               |
| Page/Layout      | React Server Component            | [server-component-pattern.md](patterns/server-component-pattern.md) |
| Interactivity    | Client Component (`"use client"`) | See Server Component pattern                                        |
| Business logic   | Service class                     | [service-layer-pattern.md](patterns/service-layer-pattern.md)       |
| Input validation | Zod schema                        | [validation-pattern.md](patterns/validation-pattern.md)             |
| Error handling   | Custom error classes              | [error-handling-pattern.md](patterns/error-handling-pattern.md)     |

### Key Principles

1. **Server-first** - Use Server Components by default
2. **Type-safe** - TypeScript strict mode, Zod validation
3. **Secure** - Authentication, rate limiting, input validation
4. **Clean** - Service layer for business logic
5. **Tested** - >80% coverage on critical paths

**See:** [patterns/architecture-summary.md](patterns/architecture-summary.md) for complete architecture

---

## 🔐 Security & Authentication

### Authentication Flow

- **Primary**: Google OAuth with invite-only allowlist
- **Dev/Test**: Credentials provider (gated by `ENABLE_TEST_CREDENTIALS`)
- **Session**: JWT tokens via NextAuth.js
- **Passwords**: bcrypt hashing (12 rounds) - **Enhanced November 2025**
- **Security**: CSRF protection, secure cookies, PII sanitization - **Audit remediated**

### Security Layers

```text
Request → Security Headers → Rate Limit (5/10s) → Auth → Validation → Business Logic
```

### Environment Variables

All validated via Zod in `src/lib/env.ts`:

```typescript
NEXTAUTH_SECRET          # Required
NEXTAUTH_URL            # Required
GOOGLE_PROJECT_ID       # Required
GOOGLE_CLIENT_ID        # Required
AUTH_USER_EMAIL         # Required
// ... see env.ts for complete list
```

---

## 🧪 Testing

### Test Structure

- **Unit**: `tests/unit/*.test.ts` - Services, utilities
- **Integration**: `tests/integration/*.spec.ts` - API flows
- **Storybook**: Component tests with visual assertions
- **Manual**: `tests/manual/*.mjs` - Vertex AI smoke tests

### Commands

```bash
npm run test              # All tests (295 total - November 2025)
npm run test:coverage     # With coverage report
npm run test:ui           # Interactive UI
```

**Current Status**: 295 tests passing (57 new security tests), >80% coverage achieved

---

## 💡 When Suggesting Code

### Always Do

1. ✅ Use TypeScript strict mode (no `any`)
2. ✅ Server Components by default (`"use client"` only when needed)
3. ✅ Validate inputs with Zod schemas
4. ✅ Add error handling (try-catch with logging)
5. ✅ Follow existing patterns (check `patterns/`)
6. ✅ Use shadcn/ui v4 components
7. ✅ Add proper types with explicit return types
8. ✅ Log important operations with `@/lib/logger`
9. ✅ **Security-first mindset** - sanitize PII, secure cookies, CSRF protection
10. ✅ **Follow audit standards** - bcrypt rounds ≥12, proper session handling

### Never Do

1. ❌ Use `any` types (use `unknown` or proper types)
2. ❌ Skip input validation for external data
3. ❌ Put business logic in API routes (use services)
4. ❌ Expose sensitive errors to users
5. ❌ Create custom UI components (use shadcn/ui)
6. ❌ Skip error logging
7. ❌ Use client components when server works

---

## 🎯 Feature-Specific Guidance

### AI/Chat Features

- Use `ChatService` from `@/lib/services/chat-service`
- Implement streaming for real-time responses
- Handle multimodal inputs (text + images)
- Validate image formats and sizes
- Add proper error handling for Vertex AI failures

**See:** [Service Layer Pattern](patterns/service-layer-pattern.md) for ChatService details

### API Routes

- Validate all inputs with Zod
- Check authentication with `getServerSession`
- Apply rate limiting
- Return consistent error format
- Log with context

**See:** [API Route Pattern](patterns/api-route-pattern.md) for complete structure

### UI Components

- Use shadcn/ui v4 as foundation
- All available: Button, Card, Input, Dialog, Tabs, etc.
- Ensure responsive design (mobile-first)
- Add loading and error states
- Follow accessibility standards

**Available components**: Button, Card, Input, Textarea, Label, Select, Dialog, Tabs, ScrollArea, Tooltip, DropdownMenu, Sheet

### Form Validation

- Define Zod schemas for all forms
- Infer TypeScript types from schemas
- Use `safeParse` for non-throwing validation
- Provide user-friendly error messages

**See:** [Validation Pattern](patterns/validation-pattern.md) for examples

---

## 📚 Documentation & Resources

### Internal Documentation

- **Full docs index**: [docs/README.md](../docs/README.md)
- **Development setup**: [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)
- **API reference**: [docs/API.md](../docs/API.md)
- **Deployment**: [docs/deployment/](../docs/deployment/)

### Pattern Library

All patterns include real examples from this codebase:

- [Architecture Summary](patterns/architecture-summary.md) - System design
- [API Route Pattern](patterns/api-route-pattern.md) - Endpoint structure
- [Server Component Pattern](patterns/server-component-pattern.md) - RSC usage
- [Service Layer Pattern](patterns/service-layer-pattern.md) - Business logic
- [Error Handling Pattern](patterns/error-handling-pattern.md) - Error management
- [Validation Pattern](patterns/validation-pattern.md) - Zod schemas

### External Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vertex AI SDK](https://cloud.google.com/vertex-ai/docs)
- [Zod Documentation](https://zod.dev/)

---

## 🚀 Quick Patterns Reference

### API Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  /* ... */
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = schema.parse(body);
    // Business logic via service
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleError(error);
  }
}
```

### Server Component

```typescript
// No "use client" - server by default
export default async function Page() {
  const data = await fetchData() // Direct data fetch
  return <div>{/* JSX */}</div>
}
```

### Service Class

```typescript
export class MyService {
  async doSomething(input: Input): Promise<Output> {
    try {
      // Validation
      this.validate(input);
      // Business logic
      const result = await this.execute(input);
      // Logging
      logger.info("Operation completed");
      return result;
    } catch (error) {
      logger.error("Operation failed", { error });
      throw this.handleError(error);
    }
  }
}
```

---

**This is a production-grade application with completed security hardening.**  
Prioritize: **Security-first development** • **Code quality** • **Performance** • **Maintainability**

**Current State (November 2025)**: v0.1.0 pre-release, all security findings remediated, UI improvements ready for merge.

**For detailed patterns and examples, always check the [patterns/](patterns/) directory.**
