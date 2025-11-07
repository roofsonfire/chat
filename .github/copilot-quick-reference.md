# GitHub Copilot Quick Reference

> **Fast context for AI-assisted development**  
> This reference provides the most common patterns, commands, and conventions for GitHub Copilot to assist you effectively.

---

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build with Turbopack
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
npm run type-check       # TypeScript validation

# Testing
npm run test             # Run all Vitest tests
npm run test:ui          # Interactive test UI
npm run test:coverage    # Generate coverage report

# Utilities
npm run hash-password    # Generate bcrypt hash
npm run storybook        # Launch Storybook
```

---

## 📂 File Location Patterns

| Type              | Path Pattern               | Example                              |
| ----------------- | -------------------------- | ------------------------------------ |
| **Pages**         | `src/app/**/page.tsx`      | `src/app/login/page.tsx`             |
| **API Routes**    | `src/app/api/**/route.ts`  | `src/app/api/chat/route.ts`          |
| **Components**    | `src/components/**/*.tsx`  | `src/components/chat/chat-input.tsx` |
| **UI Components** | `src/components/ui/*.tsx`  | `src/components/ui/button.tsx`       |
| **Services**      | `src/lib/services/**/*.ts` | `src/lib/services/chat-service.ts`   |
| **Hooks**         | `src/lib/hooks/**/*.ts`    | `src/lib/hooks/use-chat.ts`          |
| **Utils**         | `src/lib/utils/**/*.ts`    | `src/lib/utils/format.ts`            |
| **Types**         | `src/lib/types/**/*.ts`    | `src/lib/types/chat.ts`              |
| **Tests**         | `tests/**/*.test.ts`       | `tests/unit/chat-service.test.ts`    |

---

## 🎯 Tech Stack Snapshot

### Core Framework

- **Next.js 15** - App Router, Server Components, Turbopack
- **React 19** - Server Components by default, Client Components with `"use client"`
- **TypeScript 5** - Strict mode enabled

### Styling

- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui v4** - Component library with `data-slot` attributes
- **Radix UI** - Accessible primitives

### AI & Backend

- **Google Vertex AI** - Gemini 2.5 models (multimodal)
- **NextAuth.js** - Google OAuth + credentials
- **Zod** - Runtime validation

### Testing

- **Vitest** - Unit, integration, and Storybook tests
- **React Testing Library** - Component testing
- **Storybook** - Component documentation

---

## 📦 Common Import Patterns

```typescript
// Utility functions
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

// UI Components (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Next.js
import { NextRequest, NextResponse } from "next/server";
import Image from "next/image";
import Link from "next/link";

// React
import { useState, useEffect, useCallback } from "react";

// Validation
import { z } from "zod";

// Types (always import as type)
import type { Message } from "@/lib/types";
```

---

## 🏗️ Standard Code Patterns

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

const requestSchema = z.object({
  // Schema definition
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Business logic

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

### Server Component Pattern

```typescript
// No "use client" - server component by default
import { Suspense } from "react"

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | undefined }
}

export default async function Page({ params }: PageProps) {
  const data = await fetchData(params.id)

  return (
    <Suspense fallback={<LoadingState />}>
      <Content data={data} />
    </Suspense>
  )
}
```

### Client Component Pattern

```typescript
"use client" // Required for hooks, events, browser APIs

import { useState, useCallback } from "react"

interface ComponentProps {
  initialValue: string
}

export function Component({ initialValue }: ComponentProps) {
  const [value, setValue] = useState(initialValue)

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue)
  }, [])

  return <div>{/* JSX */}</div>
}
```

### Custom Hook Pattern

```typescript
"use client";

import { useState, useCallback } from "react";

export function useCustomHook() {
  const [state, setState] = useState(null);

  const action = useCallback(() => {
    // Logic
  }, []);

  return { state, action };
}
```

### Service Class Pattern

```typescript
import { logger } from "@/lib/logger";
import { CustomError } from "@/lib/errors";

export class ServiceName {
  constructor(private config: Config) {}

  async doSomething(input: string): Promise<Result> {
    try {
      // Business logic
      logger.info("Operation completed", { input });
      return result;
    } catch (error) {
      logger.error("Operation failed", { error, input });
      throw new CustomError("Detailed message", { cause: error });
    }
  }
}
```

---

## 🎨 Component Styling Conventions

### Using Tailwind + cn Utility

```typescript
import { cn } from "@/lib/utils"

function Component({ className }: { className?: string }) {
  return (
    <div className={cn(
      "base-classes here",
      "conditional-class",
      className // Allow parent override
    )}>
      {/* Content */}
    </div>
  )
}
```

### shadcn/ui v4 Components

```typescript
// All shadcn components use data-slot attributes
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">
  Click me
</Button>

// Available variants (check specific component for all options)
// Button: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

---

## 🔒 Security Conventions

### Input Validation

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validated = schema.parse(input); // Throws on invalid
// or
const result = schema.safeParse(input); // Returns success/error
```

### Error Handling

```typescript
import { logger } from "@/lib/logger";
import { ValidationError, ServiceError } from "@/lib/errors";

try {
  // Code
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn("Validation failed", { error });
    return { error: "Invalid input" };
  }

  logger.error("Unexpected error", { error });
  throw new ServiceError("Operation failed");
}
```

---

## 🧪 Testing Patterns

### Unit Test Structure

```typescript
import { describe, it, expect, vi } from "vitest";

describe("ComponentOrFunction", () => {
  it("should do something specific", () => {
    // Arrange
    const input = "test";

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### Component Test

```typescript
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe("MyComponent", () => {
  it("renders and responds to interaction", async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    const button = screen.getByRole("button")
    await user.click(button)

    expect(screen.getByText("Expected text")).toBeInTheDocument()
  })
})
```

---

## 🌳 Environment Variables

```env
# Required - Always set these
NEXTAUTH_SECRET=              # Random secret (openssl rand -base64 32)
NEXTAUTH_URL=                 # http://localhost:3000 (dev) or production URL
GOOGLE_PROJECT_ID=            # GCP project ID
GOOGLE_LOCATION=              # us-central1
GOOGLE_VERTEX_AI_MODEL_ID=    # gemini-2.5-flash-image
GOOGLE_CLIENT_ID=             # OAuth client ID
GOOGLE_CLIENT_SECRET=         # OAuth client secret
AUTH_USER_EMAIL=              # Authorized email
AUTH_USER_PASSWORD_HASH=      # bcrypt hash (use npm run hash-password)

# Optional - Development only
ENABLE_TEST_CREDENTIALS=true  # Enable test login (local only)
```

Access in code:

```typescript
import { env } from "@/lib/env"; // Validated environment variables

const projectId = env.GOOGLE_PROJECT_ID;
```

---

## 🔗 Key Documentation Links

**For detailed patterns, see:**

- Architecture: `.github/patterns/architecture-summary.md`
- API Patterns: `.github/patterns/api-route-pattern.md`
- Error Handling: `.github/patterns/error-handling-pattern.md`
- Testing: `.github/patterns/testing-pattern.md`

**For comprehensive guides, see:**

- [Documentation Index](../docs/README.md)
- [Development Guide](../docs/guides/development.md)
- [API Reference](../docs/reference/api.md)

---

## 🎓 When Suggesting Code

1. **Use TypeScript strict mode** - No `any` types
2. **Server Components by default** - Add `"use client"` only when needed
3. **Validate external inputs** - Use Zod schemas
4. **Add error handling** - Try-catch with proper logging
5. **Use existing patterns** - Check `.github/patterns/` first
6. **Follow naming conventions** - kebab-case files, PascalCase components
7. **Add proper types** - Explicit return types for functions
8. **Use shadcn/ui components** - Don't reinvent UI components
9. **Log important operations** - Use `@/lib/logger`
10. **Write tests** - Add tests for new functionality

---

**Last Updated:** November 2025  
**Maintained by:** Core Development Team  
**Questions?** See [.github/copilot-instructions.md](copilot-instructions.md) for comprehensive context.
