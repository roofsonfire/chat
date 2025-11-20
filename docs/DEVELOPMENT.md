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
git clone https://github.com/YOUR_USERNAME/ai-chat-assistant.git
cd ai-chat-assistant
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

```bash
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
```

#### User Credentials

Set the authorized user email:

```bash
AUTH_USER_EMAIL=your-email@example.com
```

Generate a password hash:

```bash
npm run hash-password
# Enter your password when prompted
```

Copy the hash and set:

```bash
AUTH_USER_PASSWORD_HASH=<generated-hash>
```

#### Google Cloud Vertex AI

1. Create a Google Cloud project
2. Enable Vertex AI API
3. Set up application default credentials or service account

```bash
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

### 4. Gemini CLI Integration

The [Gemini CLI](https://github.com/google/generative-ai-docs/tree/main/demos/gemini-cli) provides a powerful command-line interface for interacting with Google's Gemini models directly from your terminal. This is useful for quick testing, prototyping prompts, and debugging AI responses.

#### Installation

Install the Gemini CLI globally via npm:

```bash
npm install -g @google/generative-ai-cli
```

Or use it directly with npx (no installation required):

```bash
npx @google/generative-ai-cli --help
```

#### Setup and Authentication

The Gemini CLI uses the same authentication as your application. Ensure you're authenticated with Google Cloud:

```bash
# Application Default Credentials (recommended for development)
gcloud auth application-default login

# Verify authentication
gcloud auth application-default print-access-token
```

Set required environment variables:

```bash
export GOOGLE_PROJECT_ID=your-project-id
export GOOGLE_LOCATION=us-central1
```

#### Basic Usage

**Test a simple prompt:**

```bash
gemini "What is the capital of France?"
```

**Use a specific model:**

```bash
gemini --model gemini-2.5-flash "Explain quantum computing in simple terms"
```

**Multi-line prompts with stdin:**

```bash
echo "Write a haiku about coding" | gemini
```

**Save output to file:**

```bash
gemini "Generate a list of 10 creative project names" > project-names.txt
```

#### Model Management

**List available models:**

```bash
gemini models list
```

**Get model details:**

```bash
gemini models describe gemini-2.5-flash
```

**Compare models:**

```bash
# Test the same prompt on different models
for model in gemini-1.5-flash gemini-1.5-pro gemini-2.5-flash; do
  echo "=== $model ==="
  gemini --model $model "Summarize the concept of machine learning"
  echo
done
```

#### Multimodal Queries (Text + Images)

**Analyze an image:**

```bash
gemini --image path/to/image.jpg "What objects do you see in this image?"
```

**Multiple images:**

```bash
gemini \
  --image screenshot1.png \
  --image screenshot2.png \
  "Compare these two screenshots and highlight the differences"
```

**Image from URL:**

```bash
gemini \
  --image-url "https://example.com/diagram.png" \
  "Explain what this diagram represents"
```

#### Advanced Options

**Set temperature (0.0 - 2.0):**

```bash
gemini --temperature 0.9 "Write a creative story about a robot"
```

**Limit output tokens:**

```bash
gemini --max-tokens 100 "Explain TypeScript in detail"
```

**JSON output format:**

```bash
gemini --format json "List the planets in our solar system"
```

**Verbose mode (see API details):**

```bash
gemini --verbose "Hello, Gemini!"
```

#### Integration with This Workspace

**Test chat prompts before implementing:**

```bash
# Test a system prompt
gemini --system-instruction "You are a helpful coding assistant" \
  "How do I use React hooks?"

# Test message formatting
gemini "User: How do I deploy to Cloud Run?
Assistant: I'll help you with that. First, ensure you have..."
```

**Validate image inputs:**

```bash
# Test image upload flow
gemini --image public/test-image.jpg \
  "Describe this image in detail" \
  --max-tokens 200
```

**Prototype new features:**

```bash
# Test code generation
gemini "Generate a TypeScript interface for a chat message with role, content, and timestamp fields"

# Test function calling
gemini --function-declarations functions.json \
  "What's the weather in New York?"
```

#### Troubleshooting

**Issue: `Error: Could not load the default credentials`**

**Solution:**

```bash
# Re-authenticate
gcloud auth application-default login

# Or set explicit service account
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

**Issue: `Error: Permission denied`**

**Solution:**

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Verify IAM permissions
gcloud projects get-iam-policy $GOOGLE_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:$(gcloud config get-value account)"
```

**Issue: `Error: Model not found`**

**Solution:**

```bash
# List available models in your region
gemini models list --location us-central1

# Use exact model name from the list
gemini --model gemini-2.5-flash-001 "Your prompt here"
```

**Issue: `Error: Quota exceeded`**

**Solution:**

```bash
# Check quota usage
gcloud alpha services api-keys lookup-key \
  --display-name "Vertex AI API" \
  --location global

# Request quota increase in Cloud Console:
# https://console.cloud.google.com/iam-admin/quotas
```

**Issue: `Rate limit exceeded`**

**Solution:**

```bash
# Add delay between requests
for prompt in "prompt1" "prompt2" "prompt3"; do
  gemini "$prompt"
  sleep 2  # Wait 2 seconds between calls
done
```

#### Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# Quick Gemini access
alias gai='gemini --model gemini-2.5-flash'

# Gemini with verbose output
alias gaiv='gemini --model gemini-2.5-flash --verbose'

# Analyze images
alias gimg='gemini --model gemini-2.5-flash --image'

# Code review helper
alias greview='gemini --model gemini-1.5-pro --system-instruction "You are a code reviewer focusing on best practices and security"'
```

Usage with aliases:

```bash
gai "Quick question about React hooks"
gimg screenshot.png "What's wrong with this UI?"
greview < src/components/chat.tsx
```

#### Tips for Effective Prompting

1. **Be specific:** Instead of "Explain React", use "Explain React hooks with 3 examples"
2. **Provide context:** "As a Next.js 15 developer, how do I..."
3. **Request format:** "List 5 bullet points..." or "Provide a JSON object..."
4. **Set constraints:** "In 100 words or less..." or "Using only TypeScript..."
5. **Iterate:** Test prompts in CLI before adding to application code

#### Documentation

- [Gemini CLI GitHub](https://github.com/google/generative-ai-docs/tree/main/demos/gemini-cli)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Reference](https://ai.google.dev/api/rest/v1/models)

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

```text
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

```text
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

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Support

For issues and questions:

- Check existing documentation
- Review closed issues on GitHub
- Open a new issue with detailed information
