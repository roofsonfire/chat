# 🤝 Contributing to the Next.js Chat Application

First off, thank you for considering contributing to this project! Your help is greatly appreciated. This guide will help you get started and ensure a smooth contribution process.

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior through our [Security Policy](SECURITY.md) or by creating a private security advisory.

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Found a bug? Great! Before creating a bug report:

1. **Search existing issues** to avoid duplicates
2. **Use our bug report template** at [Issues → New Issue → Bug Report](https://github.com/roofsonfire/chat/issues/new/choose)
3. **Include comprehensive details**:
   - Clear, descriptive title
   - Step-by-step reproduction steps
   - Expected vs. actual behavior
   - Environment details (OS, browser, Node.js version)
   - Console logs or error messages
   - Screenshots if applicable

### ✨ Suggesting Features

Have an idea for improvement?

1. **Check existing feature requests** in issues and discussions
2. **Use our feature request template** at [Issues → New Issue → Feature Request](https://github.com/roofsonfire/chat/issues/new/choose)
3. **Start a discussion** for complex features to gather community feedback
4. **Provide detailed use cases** and examples

### 📚 Improving Documentation

Documentation improvements are always welcome:

1. **Use our documentation template** at [Issues → New Issue → Documentation](https://github.com/roofsonfire/chat/issues/new/choose)
2. **Fix typos, improve clarity, or add missing information**
3. **Update code examples** to match current implementation
4. **Help with translations** (if applicable)

### 🔧 Contributing Code

Ready to contribute code? Follow these steps:

1. **Fork the repository** and create your branch from `main`
2. **Create a descriptive branch name**: `feature/user-avatars`, `fix/login-redirect`, `docs/api-examples`
3. **Follow our coding standards** (detailed below)
4. **Add comprehensive tests** for new functionality
5. **Update documentation** as needed
6. **Use our PR template** to describe your changes
7. **Ensure all checks pass** before requesting review

## Local Development

To get started with local development, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/roofsonfire/chat.git
    cd chat
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    ```bash
    cp .env.example .env.local
    # Edit .env.local with your configuration
    # See docs/DEVELOPMENT.md for detailed setup instructions
    ```

4.  **Generate password hash (for authentication):**

    ```bash
    npm run hash-password
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

6.  **Verify setup with tests:**
    ```bash
    npm run test          # Unit tests
    npm run lint          # Code quality checks
    ```

## 📏 Development Standards

### 🎯 Code Quality Requirements

We maintain high code quality standards. All contributions must:

- ✅ **Pass all tests** (`npm run test`)
- ✅ **Follow TypeScript strict mode** (no `any` types)
- ✅ **Pass ESLint checks** (`npm run lint`)
- ✅ **Follow Prettier formatting** (`npm run format:check`)
- ✅ **Include comprehensive tests** for new functionality
- ✅ **Update documentation** for API changes
- ✅ **Follow SOLID principles** and Clean Code practices

### 🏗️ Architecture Guidelines

#### TypeScript Best Practices

```typescript
// ✅ Good: Explicit types and proper imports
import type { NextRequest } from "next/server";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function createUser(
  data: z.infer<typeof userSchema>
): Promise<User> {
  const validatedData = userSchema.parse(data);
  // Implementation...
}

// ❌ Avoid: Any types and unclear interfaces
function processData(data: any): any {
  return data.someProperty;
}
```

#### React Component Structure

```typescript
// ✅ Good: Server Component with proper typing
import type { Message } from "@/lib/types";

interface ChatHistoryProps {
  messages: Message[];
  userId: string;
}

export default async function ChatHistory({ messages, userId }: ChatHistoryProps) {
  // Server Component logic
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}
```

#### API Route Standards

```typescript
// ✅ Good: Comprehensive error handling and validation
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = requestSchema.parse(body);

    // Business logic...

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error("API Error", { error, path: req.nextUrl.pathname });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 📝 Git Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: <type>[optional scope]: <description>

# Types:
feat: add user avatar upload functionality
fix: resolve login redirect loop issue
docs: update API documentation for chat endpoints
style: format code with prettier
refactor: extract chat service into separate module
chore: update dependencies to latest versions
perf: optimize image loading with next/image

# Examples with scope:
feat(chat): implement message reactions
fix(auth): handle expired JWT tokens
docs(api): add OpenAPI schema
```

### 📦 Versioning and Releases

This project follows [Semantic Versioning](https://semver.org/) (SemVer) and uses automated changelog generation based on [Conventional Commits](https://www.conventionalcommits.org/).

#### Version Format: MAJOR.MINOR.PATCH

- **MAJOR** (1.0.0 → 2.0.0): Incompatible API changes or breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features added in a backward-compatible manner
- **PATCH** (1.0.0 → 1.0.1): Backward-compatible bug fixes

#### Commit Types and Version Bumps

Your commit type determines which version number changes:

| Commit Type                                       | Version Impact | Example                                       |
| ------------------------------------------------- | -------------- | --------------------------------------------- |
| `feat:`                                           | MINOR bump     | `feat(chat): add voice input` → 0.1.0 → 0.2.0 |
| `fix:`                                            | PATCH bump     | `fix(auth): resolve timeout` → 0.1.0 → 0.1.1  |
| `BREAKING CHANGE:`                                | MAJOR bump     | `feat!: redesign API` → 0.1.0 → 1.0.0         |
| `docs:`, `style:`, `refactor:`, `test:`, `chore:` | No bump        | No version change                             |

#### Breaking Changes

Indicate breaking changes in two ways:

**Method 1: Commit footer**

```bash
feat(api): redesign chat endpoint

BREAKING CHANGE: The /api/chat endpoint now requires authentication
and uses a different request format. Clients must update to the new
format documented in docs/API.md.
```

**Method 2: ! in commit type**

```bash
feat(api)!: redesign chat endpoint for improved performance
```

#### Release Workflow

**For Maintainers:**

1. **Ensure all changes are merged to `main`**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Generate new version and changelog**

   ```bash
   # Automatic version bump based on commits:
   npm run version

   # Or specify version explicitly:
   npm run release -- --release-as patch   # 0.1.0 → 0.1.1
   npm run release -- --release-as minor   # 0.1.0 → 0.2.0
   npm run release -- --release-as major   # 0.1.0 → 1.0.0
   ```

3. **Review the updated CHANGELOG.md**
   - Verify all commits are categorized correctly
   - Edit manually if needed (add/remove entries)
   - Ensure breaking changes are clearly documented

4. **Commit and push the release**

   ```bash
   # Commit is created automatically by standard-version
   git push --follow-tags origin main
   ```

5. **GitHub Actions will deploy automatically**
   - CI/CD pipeline triggers on new tag
   - Runs tests, builds Docker image
   - Deploys to Google Cloud Run (production)

#### Dry Run (Test Before Release)

Always test the release process first:

```bash
# Preview what will happen without making changes:
npm run release -- --dry-run --release-as patch

# Review output:
# ✔ bumping version in package.json from 0.1.0 to 0.1.1
# ✔ outputting changes to CHANGELOG.md
# ✔ committing package.json and CHANGELOG.md
# ✔ tagging release v0.1.1
```

#### Manual Changelog Updates

You can also manually update `CHANGELOG.md`:

```bash
# Regenerate from all commits:
npm run changelog

# Then review and commit:
git add CHANGELOG.md
git commit -m "docs: update changelog"
```

#### Pre-release Versions

For beta/alpha releases:

```bash
# Create pre-release version
npm run release -- --prerelease alpha   # 0.1.0 → 0.1.1-alpha.0
npm run release -- --prerelease beta    # 0.1.0 → 0.1.1-beta.0

# Promote pre-release to stable
npm run release -- --release-as patch   # 0.1.1-beta.0 → 0.1.1
```

#### Version History

See [CHANGELOG.md](../CHANGELOG.md) for complete version history and release notes.

### 🧪 Testing Requirements

#### Unit Tests (Required for new features)

```typescript
// tests/unit/chat-service.test.ts
import { describe, it, expect, vi } from "vitest";
import { ChatService } from "@/lib/services/chat-service";

describe("ChatService", () => {
  it("should validate message input", () => {
    const chatService = new ChatService();
    expect(() => chatService.validateMessage("")).toThrow(
      "Message cannot be empty"
    );
  });

  it("should handle API errors gracefully", async () => {
    // Test error handling...
  });
});
```

## 🔄 Pull Request Process

### 1. Pre-PR Checklist

Before opening a pull request:

- [ ] Branch is up to date with `main`
- [ ] All tests pass locally (`npm run test`)
- [ ] Code follows style guidelines (`npm run lint` and `npm run format:check`)
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow conventional format
- [ ] Changes are covered by tests

### 2. PR Description

Use our [PR template](../.github/PULL_REQUEST_TEMPLATE.md) and include:

- **Clear description** of what changed and why
- **Related issues** (use `Fixes #123` to auto-close)
- **Testing instructions** for reviewers
- **Screenshots/demos** for UI changes
- **Breaking changes** (if any)

### 3. Review Process

- **Automated checks** must pass (CI/CD pipeline)
- **Manual review** by maintainers
- **Address feedback** promptly and professionally
- **Squash and merge** once approved

## 🎯 Contribution Areas

We welcome contributions in these areas:

### 🔥 High Priority

- **Bug fixes** and stability improvements
- **Performance optimizations**
- **Security enhancements**
- **Accessibility improvements**
- **Test coverage expansion**

### 📈 Medium Priority

- **New chat features** (reactions, threads, etc.)
- **UI/UX improvements**
- **Documentation enhancements**
- **Developer experience tools**

### 💡 Ideas Welcome

- **AI model integrations** (new providers)
- **Advanced authentication** (OAuth, SSO)
- **Real-time features** (WebSockets)
- **Mobile optimizations**

## 🆘 Getting Help

### 💬 Community Support

- **[GitHub Discussions](https://github.com/roofsonfire/chat/discussions)** - Ask questions, share ideas
- **[Issue Templates](https://github.com/roofsonfire/chat/issues/new/choose)** - Report bugs or request features

### 📚 Resources

- **[Development Guide](DEVELOPMENT.md)** - Comprehensive setup and workflows
- **[API Documentation](API.md)** - REST API reference
- **[GitHub Copilot Instructions](../.github/copilot-instructions.md)** - AI context and patterns
- **[Documentation Index](README.md)** - System design and structure

### 🤖 AI-Assisted Development

This project is optimized for GitHub Copilot! Review our [Copilot instructions](../.github/copilot-instructions.md) to understand:

- Code patterns and conventions
- Architecture decisions
- Security considerations
- Testing strategies

## 🏆 Recognition

Contributors are recognized in several ways:

- **GitHub contributor graph**
- **Release notes** for significant contributions
- **Security acknowledgments** for vulnerability reports
- **Documentation credits** for major doc improvements

---

**Thank you for contributing to making this project better! 🚀**
