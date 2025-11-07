# Error Handling Pattern

## Purpose

Standardized error handling across the application with custom error types, proper logging, and user-friendly messages.

## When to Use

- In all service layer methods
- In all API routes
- In all async operations
- When interacting with external services
- When validating user input

## Error Hierarchy

```typescript
Error (built-in)
  ├── AppError (base custom error)
  │   ├── ValidationError (400)
  │   ├── AuthenticationError (401)
  │   ├── AuthorizationError (403)
  │   ├── NotFoundError (404)
  │   ├── RateLimitError (429)
  │   └── ServiceError (500+)
  │       ├── VertexAIError (503)
  │       ├── DatabaseError (503)
  │       └── ExternalServiceError (503)
```

## Structure

### 1. Custom Error Classes

**File:** `src/lib/errors.ts`

```typescript
/**
 * Base application error class
 * All custom errors should extend this
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 * Use when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context);
  }
}

/**
 * Authentication error (401)
 * Use when user is not authenticated
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true);
  }
}

/**
 * Authorization error (403)
 * Use when user lacks permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, true);
  }
}

/**
 * Not found error (404)
 * Use when resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, true);
  }
}

/**
 * Rate limit error (429)
 * Use when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, true);
  }
}

/**
 * Service error (500+)
 * Use for external service failures
 */
export class ServiceError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message, statusCode, true, context);
  }
}

/**
 * Vertex AI specific error
 */
export class VertexAIError extends ServiceError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`Vertex AI error: ${message}`, 503, context);
  }
}
```

### 2. Service Layer Error Handling

```typescript
import { logger } from "@/lib/logger";
import { ServiceError, ValidationError } from "@/lib/errors";

export class ChatService {
  async streamChat(messages: Message[]): Promise<ReadableStream> {
    try {
      // Validate input
      if (!messages.length) {
        throw new ValidationError("Messages array cannot be empty");
      }

      // Call external service
      const response = await this.vertexAI.generateContent();

      logger.info("Chat stream initiated", {
        messageCount: messages.length,
      });

      return response.stream;
    } catch (error) {
      // Handle known errors
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors
      }

      // Handle external service errors
      if (error instanceof Error && error.message.includes("API")) {
        logger.error("Vertex AI error", { error });
        throw new VertexAIError("Failed to generate response", {
          originalError: error.message,
        });
      }

      // Handle unknown errors
      logger.error("Unexpected error in streamChat", { error });
      throw new ServiceError("Failed to process chat request");
    }
  }
}
```

### 3. API Route Error Handling

```typescript
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { AppError, ValidationError, AuthenticationError } from "@/lib/errors";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    // Your logic here
    const result = await service.doSomething();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error, req);
  }
}

/**
 * Centralized API error handler
 */
function handleApiError(error: unknown, req: NextRequest): NextResponse {
  const endpoint = req.nextUrl.pathname;

  // Zod validation errors
  if (error instanceof z.ZodError) {
    logger.warn("Validation error", {
      endpoint,
      errors: error.errors,
    });
    return NextResponse.json(
      {
        error: "Invalid request data",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Custom application errors
  if (error instanceof AppError) {
    const logLevel = error.statusCode >= 500 ? "error" : "warn";
    logger[logLevel]("Application error", {
      endpoint,
      error: error.message,
      statusCode: error.statusCode,
      context: error.context,
    });

    return NextResponse.json(
      {
        error: error.message,
        ...(error.context && { details: error.context }),
      },
      { status: error.statusCode }
    );
  }

  // Unknown errors - don't expose details
  logger.error("Unexpected error", {
    endpoint,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    {
      error: "An unexpected error occurred",
    },
    { status: 500 }
  );
}
```

### 4. Client-Side Error Handling

```typescript
"use client"

import { useState } from "react"
import { logger } from "@/lib/logger"

export function ChatComponent() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(message: string) {
    try {
      setError(null)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Request failed")
      }

      // Handle success
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred"

      logger.error("Chat error", { error })
      setError(message)

      // Show user-friendly error
      if (message.includes("rate limit")) {
        setError("Please wait a moment before sending another message")
      } else if (message.includes("auth")) {
        setError("Please sign in to continue")
      } else {
        setError("Failed to send message. Please try again.")
      }
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      {/* Component UI */}
    </div>
  )
}
```

## Real Example: ChatService Error Handling

```typescript
import { logger } from "@/lib/logger";
import { VertexAIError, ValidationError } from "@/lib/errors";
import { VertexAI, GenerateContentStreamResult } from "@google-cloud/vertexai";

export class ChatService {
  private vertexAI: VertexAI;

  constructor(config: ChatConfig) {
    try {
      this.vertexAI = new VertexAI({
        project: config.projectId,
        location: config.location,
      });
    } catch (error) {
      logger.error("Failed to initialize Vertex AI", { error });
      throw new VertexAIError("Service initialization failed");
    }
  }

  async streamChat(messages: Message[]): Promise<ReadableStream> {
    // Validation
    if (!messages || messages.length === 0) {
      throw new ValidationError("Messages array cannot be empty");
    }

    if (messages.some((m) => !m.content?.trim())) {
      throw new ValidationError("Message content cannot be empty");
    }

    try {
      const model = this.vertexAI.getGenerativeModel({
        model: this.config.modelId,
      });

      const result = await model.generateContentStream({
        contents: this.formatMessages(messages),
      });

      logger.info("Chat stream started", {
        model: this.config.modelId,
        messageCount: messages.length,
      });

      return this.transformStream(result);
    } catch (error) {
      // Google API errors
      if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code: number }).code;

        if (code === 429) {
          throw new RateLimitError("AI service rate limit exceeded");
        }

        if (code === 401 || code === 403) {
          logger.error("Vertex AI authentication error", { error });
          throw new VertexAIError("Authentication failed");
        }

        if (code >= 500) {
          logger.error("Vertex AI service error", { error });
          throw new VertexAIError("AI service temporarily unavailable");
        }
      }

      // Network errors
      if (error instanceof Error && error.message.includes("network")) {
        logger.error("Network error calling Vertex AI", { error });
        throw new VertexAIError("Network error");
      }

      // Unknown error
      logger.error("Unexpected error in streamChat", {
        error,
        modelId: this.config.modelId,
      });

      throw new VertexAIError("Failed to generate response", {
        modelId: this.config.modelId,
      });
    }
  }
}
```

## Anti-Patterns

❌ **Don't: Swallow errors silently**

```typescript
// BAD
try {
  await doSomething();
} catch (error) {
  // Silent failure - no logging, no user feedback
}
```

✅ **Do: Log and handle appropriately**

```typescript
// GOOD
try {
  await doSomething();
} catch (error) {
  logger.error("Operation failed", { error });
  throw new ServiceError("Failed to complete operation");
}
```

❌ **Don't: Expose internal details**

```typescript
// BAD - Exposes stack traces and internals
catch (error) {
  return { error: error.stack }
}
```

✅ **Do: Return user-friendly messages**

```typescript
// GOOD - Generic message, detailed logging
catch (error) {
  logger.error("Internal error", { error })
  return { error: "Operation failed. Please try again." }
}
```

❌ **Don't: Use generic Error class**

```typescript
// BAD
throw new Error("Something went wrong");
```

✅ **Do: Use specific error types**

```typescript
// GOOD
throw new ValidationError("Email format is invalid");
```

## Related Patterns

- [API Route Pattern](api-route-pattern.md) - Error handling in API routes
- [Service Layer Pattern](service-layer-pattern.md) - Service error handling
- [Validation Pattern](validation-pattern.md) - Input validation errors

## Testing

```typescript
import { describe, it, expect } from "vitest";
import { ChatService } from "./chat-service";
import { ValidationError, VertexAIError } from "@/lib/errors";

describe("ChatService error handling", () => {
  it("should throw ValidationError for empty messages", async () => {
    const service = new ChatService(config);

    await expect(service.streamChat([])).rejects.toThrow(ValidationError);
  });

  it("should throw VertexAIError on API failure", async () => {
    // Mock Vertex AI to fail
    vi.mocked(vertexAI.generateContentStream).mockRejectedValue(
      new Error("API Error")
    );

    const service = new ChatService(config);

    await expect(
      service.streamChat([{ role: "user", content: "test" }])
    ).rejects.toThrow(VertexAIError);
  });
});
```

## External References

- [Node.js Error Handling Best Practices](https://nodejs.org/en/docs/guides/error-handling/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

**Last Updated:** November 2025
