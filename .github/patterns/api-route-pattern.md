# API Route Pattern

## Purpose

Standard structure for Next.js 15 App Router API routes with type safety, validation, authentication, and error handling.

## When to Use

- Creating new REST API endpoints
- Handling form submissions
- Processing webhooks
- Streaming responses
- File uploads/downloads

## Structure

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/config";
import { logger } from "@/lib/logger";
import { ServiceError, ValidationError } from "@/lib/errors";

// 1. Define request/response schemas
const requestSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
  optionalField: z.string().optional(),
});

const responseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: z.string().optional(),
});

type RequestBody = z.infer<typeof requestSchema>;
type ResponseBody = z.infer<typeof responseSchema>;

// 2. Export HTTP method handlers
export async function GET(req: NextRequest) {
  try {
    // Optional: Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Business logic here
    const data = await fetchData(id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // 3. Log the operation
    logger.info("API operation started", {
      endpoint: req.nextUrl.pathname,
      user: session.user?.email,
    });

    // 4. Execute business logic
    const result = await performOperation(validated);

    // 5. Log success
    logger.info("API operation completed", {
      endpoint: req.nextUrl.pathname,
    });

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleError(error);
  }
}

// 3. Centralized error handler
function handleError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    logger.warn("Validation error", { error: error.errors });
    return NextResponse.json(
      {
        error: "Invalid request data",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof ValidationError) {
    logger.warn("Business validation error", { error });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof ServiceError) {
    logger.error("Service error", { error });
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  // Unknown error
  logger.error("Unexpected error in API route", { error });
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// Helper functions (business logic)
async function fetchData(id: string | null) {
  // Implementation
}

async function performOperation(data: RequestBody) {
  // Implementation
}
```

## Real Example: Chat API Route

**File:** `src/app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/config";
import { ChatService } from "@/lib/services/chat-service";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  model: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate request
    const body = await req.json();
    const { messages, model } = chatRequestSchema.parse(body);

    // 3. Initialize service
    const chatService = new ChatService({
      projectId: env.GOOGLE_PROJECT_ID,
      location: env.GOOGLE_LOCATION,
      modelId: model || env.GOOGLE_VERTEX_AI_MODEL_ID,
    });

    // 4. Stream response
    const stream = await chatService.streamChat(messages);

    // 5. Return streaming response
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid chat request", { error: error.errors });
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    logger.error("Chat API error", { error });
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
```

## Streaming Response Pattern

For streaming AI responses:

```typescript
export async function POST(req: NextRequest) {
  // ... auth and validation ...

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of dataSource) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## File Upload Pattern

For handling file uploads:

```typescript
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Process file
    const buffer = await file.arrayBuffer();
    const result = await processFile(Buffer.from(buffer));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error("File upload error", { error });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

## Anti-Patterns

❌ **Don't: Skip validation**

```typescript
// BAD - No validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await doSomething(body.field); // Unsafe!
  return NextResponse.json(result);
}
```

✅ **Do: Always validate**

```typescript
// GOOD - Validate with Zod
const schema = z.object({ field: z.string() });
const validated = schema.parse(body);
```

❌ **Don't: Return sensitive errors**

```typescript
// BAD - Exposes internal details
catch (error) {
  return NextResponse.json({ error: error.message })
}
```

✅ **Do: Sanitize errors**

```typescript
// GOOD - Generic user-facing message
catch (error) {
  logger.error("Internal error", { error })
  return NextResponse.json({ error: "Operation failed" })
}
```

❌ **Don't: Skip logging**

```typescript
// BAD - No visibility
catch (error) {
  return NextResponse.json({ error: "Failed" }, { status: 500 })
}
```

✅ **Do: Always log**

```typescript
// GOOD - Detailed logging
catch (error) {
  logger.error("API error", {
    error,
    endpoint: req.nextUrl.pathname,
    method: req.method
  })
  return NextResponse.json({ error: "Failed" }, { status: 500 })
}
```

## Related Patterns

- [Service Layer Pattern](service-layer-pattern.md) - Where to put business logic
- [Error Handling Pattern](error-handling-pattern.md) - Comprehensive error management
- [Validation Pattern](validation-pattern.md) - Zod schema patterns

## Testing

```typescript
import { POST } from "./route";

describe("API Route", () => {
  it("should return 401 without auth", async () => {
    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it("should validate request body", async () => {
    const req = new NextRequest("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ invalid: "data" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
```

## External References

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextAuth.js](https://next-auth.js.org/)
- [Zod Documentation](https://zod.dev/)

---

**Last Updated:** November 2025
