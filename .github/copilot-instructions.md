# GitHub Copilot Instructions

This document provides context and guidelines for GitHub Copilot when working on this Next.js chat application.

## Project Overview

This is a production-grade chat application built with Next.js 15, TypeScript, and Google Vertex AI. The project emphasizes SOLID principles, Clean Code practices, comprehensive testing, and security best practices.

## Tech Stack

### Core Technologies

- **Next.js 15** with App Router and Turbopack
- **React 19** with Server and Client Components
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS 4** for styling
- **Google Vertex AI** for multimodal chat capabilities

### Key Libraries

- **NextAuth.js** for authentication
- **Zod** for runtime validation
- **bcrypt** for password hashing
- **rate-limiter-flexible** for rate limiting
- **shadcn/ui** with Radix UI components
- **lucide-react** for icons

### Testing & Quality

- **Vitest** for unit/integration tests
- **Playwright** for E2E testing
- **ESLint** with Next.js config
- **Prettier** with Tailwind plugin
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks
- **Storybook** for component documentation

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages and API routes)
│   ├── api/               # API route handlers
│   ├── login/             # Authentication pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   ├── chat/              # Chat-specific components
│   └── auth/              # Authentication components
├── lib/                   # Core utilities and services
│   ├── auth/              # Authentication logic (password, config)
│   ├── services/          # Service layer (ChatService, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── validation/        # Zod schemas
│   ├── streaming/         # Streaming utilities
│   ├── features/          # Feature flags
│   ├── env.ts             # Environment variable validation
│   ├── logger.ts          # Centralized logging
│   ├── errors.ts          # Custom error classes
│   └── performance.ts     # Performance monitoring
├── middleware.ts          # Next.js middleware (auth, rate limiting, security headers)
└── globals.d.ts           # Global TypeScript declarations
```

## Code Style & Conventions

### TypeScript

- Always use **strict mode** TypeScript
- Enable all strict compiler options: `noUncheckedIndexedAccess`, `noImplicitOverride`, `noUnusedLocals`, etc.
- Prefer explicit return types for functions
- Use proper type imports: `import type { Type } from "..."`
- Avoid `any` - use `unknown` or proper types
- Use Zod for runtime validation of external data

### React & Next.js

- Use **Server Components by default** - add `"use client"` only when needed (hooks, events, browser APIs)
- Prefer **async Server Components** for data fetching
- Use the App Router conventions (not Pages Router)
- Implement proper loading states with `loading.tsx`
- Implement error boundaries with `error.tsx`
- Use Next.js Image component for images
- Follow React 19 best practices

### Naming Conventions

- **Files**: Use kebab-case (e.g., `chat-service.ts`, `user-profile.tsx`)
- **Components**: Use PascalCase for component files and exports
- **Functions/Variables**: Use camelCase
- **Constants**: Use UPPER_SNAKE_CASE
- **Types/Interfaces**: Use PascalCase
- **Hooks**: Prefix with `use` (e.g., `useChat`, `useAuth`)

### Import Organization

Order imports as follows:

1. External libraries (React, Next.js, third-party)
2. Internal absolute imports with `@/` alias
3. Relative imports
4. Type imports at the end

Example:

```typescript
import { useState } from "react";
import { NextResponse } from "next/server";

import { ChatService } from "@/lib/services/chat-service";
import { logger } from "@/lib/logger";
import type { Message } from "@/lib/types";

import { LocalComponent } from "./local-component";
```

### Component Structure

- Use functional components with TypeScript
- Define props interface explicitly
- Extract complex logic into custom hooks
- Keep components focused and single-responsibility
- Use proper JSX formatting with Prettier

```typescript
interface ChatMessageProps {
  message: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatMessage({ message, role, timestamp }: ChatMessageProps) {
  // Component logic
  return (
    // JSX
  );
}
```

## Architecture Patterns

### Service Layer

- Business logic lives in `src/lib/services/`
- Services are classes with clear responsibilities
- Example: `ChatService` handles all Vertex AI interactions
- Services throw custom errors from `@/lib/errors`

### Error Handling

- Use custom error classes (e.g., `VertexAIError`, `ValidationError`)
- Implement error boundaries for React components
- Use try-catch blocks in API routes
- Log errors with the centralized logger

### Authentication

- NextAuth.js with Google OAuth as the primary provider (invite allowlist enforced)
- Credentials provider is gated behind `ENABLE_TEST_CREDENTIALS` for automated tests/local debugging
- Password hashing with bcrypt (10 rounds) for the test credential flow
- JWT tokens for session management
- Protected routes via middleware
- Rate limiting on auth endpoints

### API Routes

- Follow RESTful conventions
- Validate request bodies with Zod
- Use proper HTTP status codes
- Implement rate limiting
- Add comprehensive error handling
- Return consistent response structures

### Security

- **Middleware security headers**: X-Frame-Options, CSP, HSTS, etc.
- **Rate limiting**: 5 requests per 10 seconds per IP
- **Input validation**: Zod schemas for all external data
- **Password hashing**: bcrypt with salt rounds
- **Environment variables**: Validated with Zod on startup
- **No sensitive data in logs**: Sanitize before logging

## Testing Guidelines

### Unit Tests (Vitest)

- Test files: `*.test.ts` or `*.test.tsx`
- Location: `tests/unit/`
- Mock external dependencies
- Test edge cases and error conditions
- Use Testing Library for React components

### Integration Tests

- Location: `tests/integration/`
- Test interaction between modules
- Mock external services (Vertex AI, etc.)

### E2E Tests (Playwright)

- Location: `tests/e2e/`
- Test critical user journeys
- Test authentication flows
- Test accessibility with axe-core
- Use page objects pattern

### Test Coverage

- Run: `npm run test:coverage`
- Aim for >80% coverage on critical paths
- Focus on business logic and utilities

## Environment Variables

All environment variables are validated with Zod in `src/lib/env.ts`:

```typescript
// Required variables:
NEXTAUTH_SECRET; // NextAuth.js secret key
NEXTAUTH_URL; // Application URL
AUTH_USER_EMAIL; // Authorized user email
AUTH_USER_PASSWORD_HASH; // Bcrypt hashed password
GOOGLE_PROJECT_ID; // GCP project ID
GOOGLE_LOCATION; // Vertex AI region
GOOGLE_VERTEX_AI_MODEL_ID; // Model ID (e.g., gemini-1.5-flash-002)
```

## Performance Considerations

- Use React Server Components for better performance
- Implement streaming responses for AI chat
- Monitor Web Vitals with `web-vitals` package
- Use `PerformanceMonitor` component
- Lazy load heavy components
- Optimize images with Next.js Image
- Enable Turbopack for faster builds

## Accessibility

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with Playwright accessibility scanner
- Use shadcn/ui components (already accessible)
- Maintain color contrast ratios

## Git & Development Workflow

### Commit Messages

Follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or tooling changes

### Pre-commit Hooks

Husky runs automatically:

- ESLint with auto-fix
- Prettier formatting
- Type checking (implicitly via ESLint)

### Branch Strategy

- `main` - production-ready code
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`

## Common Patterns

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

const requestSchema = z.object({
  // Define schema
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = requestSchema.parse(body);

    // Process request

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error("Error in API route", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Custom Hook Pattern

```typescript
"use client";

import { useState, useCallback } from "react";

export function useCustomHook() {
  const [state, setState] = useState(initialState);

  const handler = useCallback(() => {
    // Logic
  }, [dependencies]);

  return { state, handler };
}
```

### Server Component with Data Fetching

```typescript
import { Suspense } from "react";
import { DataComponent } from "@/components/data-component";
import { LoadingState } from "@/components/loading-state";

export default async function Page() {
  // Fetch data directly in Server Component
  const data = await fetchData();

  return (
    <Suspense fallback={<LoadingState />}>
      <DataComponent data={data} />
    </Suspense>
  );
}
```

## Documentation

- **README.md** - Project overview and quick start
- **docs/** - Detailed documentation
  - `DEVELOPMENT.md` - Development setup and guidelines
  - `API.md` - API documentation
  - `USER-MANAGEMENT.md` - Authentication details
  - `PERFORMANCE.md` - Performance optimization
  - `E2E-TESTING-SUMMARY.md` - Testing strategies
  - `FEATURE-FLAGS.md` - Feature flag implementation

## Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vertex AI SDK](https://cloud.google.com/vertex-ai/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Zod](https://zod.dev/)

## When Suggesting Code

1. **Follow existing patterns** in the codebase
2. **Maintain type safety** - no `any` types
3. **Add proper error handling** with try-catch and custom errors
4. **Include logging** for important operations
5. **Validate inputs** with Zod schemas
6. **Write tests** for new functionality
7. **Update documentation** when adding features
8. **Consider security** implications
9. **Optimize for performance** (Server Components, streaming, etc.)
10. **Ensure accessibility** in UI components

## Specific Guidance

### When working with AI/Chat features:

- Use `ChatService` class from `@/lib/services/chat-service`
- Implement streaming responses for better UX
- Handle multimodal inputs (text + images)
- Validate image formats and sizes
- Add proper error handling for AI failures

### When working with Authentication:

- Never store passwords in plain text
- Use bcrypt for password hashing
- Implement rate limiting on auth endpoints
- Validate email formats with Zod
- Use NextAuth.js session management

### When working with UI Components:

- Use shadcn/ui components as base
- Extend with Tailwind CSS utilities
- Ensure responsive design (mobile-first)
- Add loading and error states
- Test accessibility with Playwright

### When working with API Routes:

- Validate all inputs with Zod
- Check authentication via NextAuth
- Apply rate limiting for public endpoints
- Return consistent error responses
- Log errors with context

---

**Remember**: This is a production-grade application. Prioritize code quality, security, performance, and maintainability in all suggestions.
