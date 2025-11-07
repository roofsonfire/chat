# Service Layer Pattern

## Purpose

Encapsulate business logic in dedicated service classes, separating concerns from API routes and components for better testability and maintainability.

## When to Use

- Complex business logic
- External API integrations
- Data transformations
- Multi-step operations
- Reusable business operations
- When logic is used across multiple routes

## Structure

### Basic Service Class

```typescript
import { logger } from "@/lib/logger";
import { ServiceError } from "@/lib/errors";

/**
 * Configuration interface for the service
 */
interface ServiceConfig {
  apiKey: string;
  endpoint: string;
  timeout?: number;
}

/**
 * Service class with business logic
 */
export class MyService {
  private config: ServiceConfig;
  private client: ExternalClient;

  constructor(config: ServiceConfig) {
    this.config = {
      timeout: 30000, // Default 30 seconds
      ...config,
    };

    this.client = this.initializeClient();
  }

  /**
   * Initialize external client
   */
  private initializeClient(): ExternalClient {
    try {
      return new ExternalClient({
        apiKey: this.config.apiKey,
        endpoint: this.config.endpoint,
      });
    } catch (error) {
      logger.error("Failed to initialize service client", { error });
      throw new ServiceError("Service initialization failed");
    }
  }

  /**
   * Public method - business logic entry point
   */
  async performOperation(input: InputType): Promise<OutputType> {
    // Validation
    this.validateInput(input);

    try {
      // Log operation start
      logger.info("Operation started", { operation: "performOperation" });

      // Execute business logic
      const result = await this.executeOperation(input);

      // Log success
      logger.info("Operation completed", {
        operation: "performOperation",
        resultSize: result.length,
      });

      return result;
    } catch (error) {
      // Handle and log errors
      logger.error("Operation failed", { error, input });
      throw this.handleError(error);
    }
  }

  /**
   * Private validation method
   */
  private validateInput(input: InputType): void {
    if (!input.required) {
      throw new ValidationError("Required field missing");
    }
  }

  /**
   * Private execution method
   */
  private async executeOperation(input: InputType): Promise<OutputType> {
    const response = await this.client.call(input);
    return this.transformResponse(response);
  }

  /**
   * Private transformation method
   */
  private transformResponse(response: ExternalResponse): OutputType {
    return {
      // Transform external format to internal format
      id: response.externalId,
      data: response.payload,
    };
  }

  /**
   * Private error handler
   */
  private handleError(error: unknown): Error {
    if (error instanceof ExternalError) {
      return new ServiceError(`External service error: ${error.message}`);
    }

    return new ServiceError("Unexpected error occurred");
  }
}
```

## Real Example: ChatService

**File:** `src/lib/services/chat-service.ts`

```typescript
import { VertexAI, GenerativeModel, Content } from "@google-cloud/vertexai";

import { logger } from "@/lib/logger";
import { VertexAIError, ValidationError } from "@/lib/errors";
import { env } from "@/lib/env";

interface ChatConfig {
  projectId: string;
  location: string;
  modelId: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  imageData?: string;
}

export class ChatService {
  private vertexAI: VertexAI;
  private config: ChatConfig;

  constructor(config: ChatConfig) {
    this.config = config;

    try {
      this.vertexAI = new VertexAI({
        project: config.projectId,
        location: config.location,
      });

      logger.info("ChatService initialized", {
        projectId: config.projectId,
        modelId: config.modelId,
      });
    } catch (error) {
      logger.error("Failed to initialize Vertex AI", { error });
      throw new VertexAIError("Service initialization failed");
    }
  }

  /**
   * Stream chat responses from Vertex AI
   */
  async streamChat(messages: Message[]): Promise<ReadableStream> {
    this.validateMessages(messages);

    try {
      const model = this.getModel();
      const contents = this.formatMessages(messages);

      logger.info("Starting chat stream", {
        modelId: this.config.modelId,
        messageCount: messages.length,
        hasImages: messages.some((m) => m.imageData),
      });

      const result = await model.generateContentStream({
        contents,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
        },
      });

      return this.transformStream(result);
    } catch (error) {
      logger.error("Chat stream error", { error });
      throw this.handleVertexError(error);
    }
  }

  /**
   * Get available models from Vertex AI
   */
  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const models = await this.vertexAI.listModels();

      return models
        .filter((m) => m.name.includes("gemini"))
        .map((m) => ({
          id: m.name,
          displayName: m.displayName,
          description: m.description,
          inputTokenLimit: m.inputTokenLimit,
          outputTokenLimit: m.outputTokenLimit,
        }));
    } catch (error) {
      logger.error("Failed to fetch models", { error });
      throw new VertexAIError("Could not retrieve available models");
    }
  }

  /**
   * Validate message array
   */
  private validateMessages(messages: Message[]): void {
    if (!messages || messages.length === 0) {
      throw new ValidationError("Messages array cannot be empty");
    }

    if (messages.some((m) => !m.content?.trim() && !m.imageData)) {
      throw new ValidationError("Message must have content or image");
    }

    if (messages.some((m) => !["user", "assistant"].includes(m.role))) {
      throw new ValidationError("Invalid message role");
    }
  }

  /**
   * Get configured model
   */
  private getModel(): GenerativeModel {
    return this.vertexAI.getGenerativeModel({
      model: this.config.modelId,
    });
  }

  /**
   * Format messages for Vertex AI
   */
  private formatMessages(messages: Message[]): Content[] {
    return messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [
        { text: msg.content },
        ...(msg.imageData
          ? [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: msg.imageData,
                },
              },
            ]
          : []),
      ],
    }));
  }

  /**
   * Transform Vertex AI stream to standard ReadableStream
   */
  private transformStream(result: any): ReadableStream {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.candidates[0]?.content?.parts[0]?.text;
            if (text) {
              const data = JSON.stringify({ text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.close();
        } catch (error) {
          logger.error("Stream transformation error", { error });
          controller.error(error);
        }
      },
    });
  }

  /**
   * Handle Vertex AI specific errors
   */
  private handleVertexError(error: unknown): Error {
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: number }).code;

      if (code === 429) {
        return new RateLimitError("AI service rate limit exceeded");
      }

      if (code === 401 || code === 403) {
        return new VertexAIError("Authentication failed");
      }

      if (code >= 500) {
        return new VertexAIError("AI service temporarily unavailable");
      }
    }

    return new VertexAIError("Failed to generate response");
  }
}
```

## Service Usage in API Routes

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/services/chat-service";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Initialize service
    const chatService = new ChatService({
      projectId: env.GOOGLE_PROJECT_ID,
      location: env.GOOGLE_LOCATION,
      modelId: env.GOOGLE_VERTEX_AI_MODEL_ID,
    });

    // Use service
    const stream = await chatService.streamChat(messages);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Service with Dependency Injection

```typescript
interface Dependencies {
  logger: Logger;
  cache: CacheService;
  database: DatabaseService;
}

export class UserService {
  constructor(private deps: Dependencies) {}

  async getUser(id: string): Promise<User> {
    // Check cache first
    const cached = await this.deps.cache.get(`user:${id}`);
    if (cached) {
      this.deps.logger.info("User retrieved from cache", { id });
      return cached;
    }

    // Fetch from database
    const user = await this.deps.database.users.findById(id);

    // Cache for next time
    await this.deps.cache.set(`user:${id}`, user, { ttl: 3600 });

    this.deps.logger.info("User retrieved from database", { id });
    return user;
  }
}
```

## Anti-Patterns

❌ **Don't: Put business logic in API routes**

```typescript
// BAD - Business logic in route
export async function POST(req: NextRequest) {
  const body = await req.json();

  // ❌ Complex logic directly in route
  const client = new VertexAI({ project: "..." });
  const model = client.getGenerativeModel({ model: "..." });
  const result = await model.generateContent(body.prompt);
  // ... more complex logic

  return NextResponse.json(result);
}
```

✅ **Do: Use service layer**

```typescript
// GOOD - Logic in service
export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const service = new AIService(config);
  const result = await service.generate(prompt);

  return NextResponse.json(result);
}
```

❌ **Don't: Make services stateful**

```typescript
// BAD - Mutable state in service
export class BadService {
  private results: any[] = []; // ❌ Shared state

  async process(data: any) {
    this.results.push(data); // ❌ Mutating shared state
    return this.results;
  }
}
```

✅ **Do: Keep services stateless**

```typescript
// GOOD - Stateless service
export class GoodService {
  async process(data: any): Promise<Result> {
    // Pure function - no shared state
    return transformData(data);
  }
}
```

## Testing Services

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatService } from "./chat-service";
import { VertexAIError, ValidationError } from "@/lib/errors";

describe("ChatService", () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService({
      projectId: "test-project",
      location: "us-central1",
      modelId: "gemini-2.5-flash",
    });
  });

  describe("streamChat", () => {
    it("should throw ValidationError for empty messages", async () => {
      await expect(service.streamChat([])).rejects.toThrow(ValidationError);
    });

    it("should stream chat responses", async () => {
      const messages = [{ role: "user" as const, content: "Hello" }];

      const stream = await service.streamChat(messages);

      expect(stream).toBeInstanceOf(ReadableStream);
    });

    it("should handle Vertex AI errors", async () => {
      // Mock Vertex AI to fail
      vi.spyOn(service as any, "getModel").mockImplementation(() => {
        throw new Error("API Error");
      });

      const messages = [{ role: "user" as const, content: "Hello" }];

      await expect(service.streamChat(messages)).rejects.toThrow(VertexAIError);
    });
  });
});
```

## Related Patterns

- [API Route Pattern](api-route-pattern.md) - How routes use services
- [Error Handling Pattern](error-handling-pattern.md) - Error management
- [Testing Pattern](testing-pattern.md) - How to test services

## External References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)

---

**Last Updated:** November 2025
