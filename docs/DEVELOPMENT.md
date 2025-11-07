# Development Guide

This guide provides detailed information for developers working on this project.

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **Git** 2.x or higher
- **Google Cloud Platform** account with Vertex AI API enabled

## Initial Setup

### 1. Clone and Install

```bash
git clone https://github.com/roofsonfire/chat.git
cd chat
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in the required values:

#### NextAuth Configuration

Generate a secret:

```bash
openssl rand -base64 32
```

Set in `.env.local`:

```
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
```

#### User Credentials

Set the authorized user email:

```
AUTH_USER_EMAIL=your-email@example.com
```

Generate a password hash:

```bash
npm run hash-password
# Enter your password when prompted
```

Copy the hash and set:

```
AUTH_USER_PASSWORD_HASH=<generated-hash>
```

#### Google Cloud Vertex AI

1. Create a Google Cloud project
2. Enable Vertex AI API
3. Set up application default credentials or service account

```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_VERTEX_AI_MODEL_ID=gemini-1.5-flash-002
```

#### Rate Limiting (In-Memory)

The application now uses **in-memory rate limiting** via `rate-limiter-flexible`. No additional configuration is needed!

- **Rate Limit**: 5 requests per 10 seconds per IP address
- **Persistence**: Rate limits reset when the server restarts
- **Scaling**: For production with multiple servers, consider migrating to Upstash Redis or another distributed store

No environment variables needed for rate limiting! 🎉

### 3. Google Cloud Authentication

For local development, authenticate with Google Cloud:

```bash
gcloud auth application-default login
```

Or use a service account:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Code Quality Checks

```bash
# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format

# Type checking
npm run type-check
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that automatically:

- Run ESLint with auto-fix
- Format code with Prettier
- Only for staged files

This ensures code quality before committing.

## Architecture Principles

This project follows **SOLID principles** and **Clean Code** practices:

### Single Responsibility Principle (SRP)

- Each module has one reason to change
- Components are focused and composable
- Services handle specific domains (e.g., ChatService for AI interactions)

### Open/Closed Principle (OCP)

- Code is open for extension, closed for modification
- Use composition over inheritance
- Leverage TypeScript interfaces for contracts

### Liskov Substitution Principle (LSP)

- Subtypes are substitutable for base types
- Error classes extend base AppError consistently

### Interface Segregation Principle (ISP)

- Small, focused interfaces
- Components receive only props they need

### Dependency Inversion Principle (DIP)

- Depend on abstractions, not concretions
- Services injected where needed
- Environment configuration centralized

### Clean Code Practices

- **Meaningful names**: Variables, functions, and classes have descriptive names
- **Small functions**: Each function does one thing well
- **Comments**: Code is self-documenting; comments explain "why" not "what"
- **Error handling**: Proper error boundaries and user-friendly messages
- **DRY**: Don't Repeat Yourself - shared logic is extracted
- **KISS**: Keep It Simple, Stupid - avoid over-engineering

## Common Tasks

### Adding a New UI Component

Use shadcn/ui CLI:

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add dialog
```

### Creating a New API Endpoint

1. Create file in `src/app/api/<endpoint>/route.ts`
2. Export named functions for HTTP methods (GET, POST, etc.)
3. Add validation with Zod
4. Add error handling
5. Update API documentation in `docs/API.md`

Example:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  // your validation schema
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Your logic here

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Adding a New Service

1. Create file in `src/lib/services/<service-name>.ts`
2. Export a class with clear methods
3. Add JSDoc comments
4. Handle errors with custom error classes
5. Add logging for debugging

Example:

```typescript
import { logger } from "@/lib/logger";
import { AppError } from "@/lib/errors";

export class MyService {
  constructor() {
    // Initialize
  }

  /**
   * Does something useful
   * @param input - The input parameter
   * @returns The result
   * @throws {AppError} When something goes wrong
   */
  async doSomething(input: string): Promise<string> {
    try {
      // Your logic
      return "result";
    } catch (error) {
      logger.error("Error in doSomething", { error, input });
      throw new AppError("Failed to do something", 500);
    }
  }
}
```

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging

Use the logger utility for consistent logging:

```typescript
import { logger } from "@/lib/logger";

logger.info("Something happened", { context: "value" });
logger.warn("Warning message", { context: "value" });
logger.error("Error occurred", { error, context: "value" });
logger.debug("Debug info", { context: "value" }); // Only in development
```

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

### Authentication Issues

1. Verify environment variables are set correctly
2. Regenerate NEXTAUTH_SECRET
3. Check password hash matches
4. Clear browser cookies

### Vertex AI Errors

1. Verify Google Cloud credentials
2. Check project ID and location
3. Ensure Vertex AI API is enabled
4. Check API quotas

### Rate Limiting Issues

**In-Memory Rate Limiting**: The app now uses `rate-limiter-flexible` with in-memory storage.

1. Rate limits reset on server restart (expected behavior)
2. Adjust limits in `src/middleware.ts` (RATE_LIMIT_REQUESTS and RATE_LIMIT_WINDOW_SECONDS)
3. For production, consider upgrading to a distributed store (Redis, etc.)
4. Check middleware logs for rate limit violations

## Git Workflow

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(chat): add image upload support
fix(auth): resolve login redirect issue
docs(api): update chat endpoint documentation
```

### Branch Strategy

- `main`: Production-ready code
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

## Performance Optimization

### Bundle Analysis

Analyze bundle size:

```bash
npm run build
```

Check the build output for bundle sizes.

### Image Optimization

- Use Next.js Image component
- Use modern formats (WebP, AVIF)
- Provide appropriate sizes

### Caching

- Static assets are cached automatically
- API responses include appropriate cache headers
- Redis used for rate limiting (in-memory caching)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm run start
```

Environment variables must be set on the server.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Support

For issues and questions:

- Check existing documentation
- Review closed issues on GitHub
- Open a new issue with detailed information
