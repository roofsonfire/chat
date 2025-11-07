# Validation Pattern

## Purpose

Runtime validation of external data using Zod schemas to ensure type safety and data integrity throughout the application.

## When to Use

- API request/response validation
- Form data validation
- Environment variable validation
- External API responses
- User input validation
- Configuration validation

## Structure

### Basic Zod Schema

```typescript
import { z } from "zod";

// Define schema
const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100),
  age: z.number().int().positive().optional(),
  role: z.enum(["user", "admin", "moderator"]),
  settings: z
    .object({
      notifications: z.boolean().default(true),
      theme: z.enum(["light", "dark"]).default("light"),
    })
    .optional(),
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;

// Validate data
function validateUser(data: unknown): User {
  return userSchema.parse(data); // Throws on invalid
}

// Safe validation (no throw)
function safeValidateUser(data: unknown) {
  const result = userSchema.safeParse(data);

  if (result.success) {
    return { data: result.data, error: null };
  }

  return { data: null, error: result.error };
}
```

## Real Example: Chat Request Validation

**File:** `src/lib/validation/chat.ts`

```typescript
import { z } from "zod";

/**
 * Message schema - validates individual messages
 */
export const messageSchema = z.object({
  role: z.enum(["user", "assistant"], {
    errorMap: () => ({ message: "Role must be 'user' or 'assistant'" }),
  }),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(10000, "Content too long"),
  imageData: z
    .string()
    .base64("Invalid image data")
    .optional()
    .refine(
      (data) => {
        if (!data) return true;
        // Check if base64 data is not too large (10MB)
        const sizeInBytes = (data.length * 3) / 4;
        return sizeInBytes <= 10 * 1024 * 1024;
      },
      { message: "Image size must be less than 10MB" }
    ),
  timestamp: z.date().or(z.string().datetime()).optional(),
});

/**
 * Chat request schema - validates complete request
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(messageSchema)
    .min(1, "At least one message required")
    .max(50, "Too many messages in conversation"),
  model: z
    .string()
    .regex(/^gemini-/, "Invalid model format")
    .optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(8192).optional(),
});

/**
 * Chat response schema - validates AI response
 */
export const chatResponseSchema = z.object({
  text: z.string(),
  model: z.string(),
  finishReason: z.enum(["STOP", "MAX_TOKENS", "SAFETY"]),
  usage: z
    .object({
      promptTokens: z.number().int().nonnegative(),
      completionTokens: z.number().int().nonnegative(),
      totalTokens: z.number().int().nonnegative(),
    })
    .optional(),
});

// Export inferred types
export type Message = z.infer<typeof messageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
```

## API Route Validation

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatRequestSchema } from "@/lib/validation/chat";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate with Zod
    const validated = chatRequestSchema.parse(body);

    // validated is now fully typed!
    const { messages, model, temperature } = validated;

    // Process request with validated data
    const result = await processChat(validated);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      logger.warn("Validation error", {
        errors: error.errors,
        path: req.nextUrl.pathname,
      });

      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    logger.error("Request processing error", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Environment Variable Validation

**File:** `src/lib/env.ts`

```typescript
import { z } from "zod";

/**
 * Environment schema - validates all required env vars
 */
const envSchema = z.object({
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, "Secret must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("Invalid URL format"),

  // Authentication
  AUTH_USER_EMAIL: z.string().email("Invalid email format"),
  AUTH_USER_PASSWORD_HASH: z.string().min(1, "Password hash required"),

  // Google Cloud
  GOOGLE_PROJECT_ID: z.string().min(1, "Project ID required"),
  GOOGLE_LOCATION: z.string().default("us-central1"),
  GOOGLE_VERTEX_AI_MODEL_ID: z.string().default("gemini-2.5-flash-image"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "Client ID required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Client secret required"),

  // Optional
  ENABLE_TEST_CREDENTIALS: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default("false"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Validate and export environment variables
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();

// Now use env throughout app with full type safety
// env.GOOGLE_PROJECT_ID is typed as string
// env.ENABLE_TEST_CREDENTIALS is typed as boolean
```

## Form Validation

```typescript
import { z } from "zod";

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

/**
 * Profile form schema
 */
export const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  website: z.string().url("Invalid URL").or(z.literal("")).optional(),
  avatar: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File must be less than 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    )
    .optional(),
});

// Use in form handler
async function handleSubmit(formData: FormData) {
  const data = Object.fromEntries(formData);
  const validated = profileFormSchema.parse(data);
  // validated is fully typed
}
```

## Complex Validation Patterns

### Conditional Validation

```typescript
const conditionalSchema = z
  .object({
    type: z.enum(["email", "phone"]),
    value: z.string(),
  })
  .refine(
    (data) => {
      if (data.type === "email") {
        return z.string().email().safeParse(data.value).success;
      }
      if (data.type === "phone") {
        return /^\+?[1-9]\d{1,14}$/.test(data.value);
      }
      return false;
    },
    {
      message: "Invalid format for selected type",
      path: ["value"],
    }
  );
```

### Dependent Fields

```typescript
const dependentSchema = z
  .object({
    hasAddress: z.boolean(),
    address: z
      .object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string(),
      })
      .optional(),
  })
  .refine((data) => !data.hasAddress || data.address !== undefined, {
    message: "Address is required when hasAddress is true",
    path: ["address"],
  });
```

### Transform and Validate

```typescript
const dateSchema = z
  .string()
  .datetime()
  .transform((str) => new Date(str))
  .refine((date) => date > new Date(), {
    message: "Date must be in the future",
  });

const priceSchema = z
  .string()
  .regex(/^\d+(\.\d{2})?$/)
  .transform((str) => parseFloat(str))
  .refine((num) => num > 0, {
    message: "Price must be positive",
  });
```

## Custom Error Messages

```typescript
const customSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Please provide a valid email address",
    }),
  age: z
    .number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number",
    })
    .int({
      message: "Age must be a whole number",
    })
    .positive({
      message: "Age must be positive",
    })
    .max(120, {
      message: "Age seems unrealistic",
    }),
});
```

## Anti-Patterns

❌ **Don't: Skip validation for "trusted" data**

```typescript
// BAD - No validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  // ❌ Assuming data is valid
  const result = await service.process(body.data);
  return NextResponse.json(result);
}
```

✅ **Do: Always validate external data**

```typescript
// GOOD - Validate everything
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = requestSchema.parse(body); // ✅ Validated
  const result = await service.process(validated.data);
  return NextResponse.json(result);
}
```

❌ **Don't: Use TypeScript types alone**

```typescript
// BAD - TypeScript doesn't validate at runtime
interface User {
  email: string;
  age: number;
}

// This will not catch invalid data at runtime!
const user: User = await req.json(); // ❌ No runtime validation
```

✅ **Do: Use Zod for runtime validation**

```typescript
// GOOD - Runtime validation with Zod
const userSchema = z.object({
  email: z.string().email(),
  age: z.number(),
});

const user = userSchema.parse(await req.json()); // ✅ Runtime check
```

❌ **Don't: Create validation logic manually**

```typescript
// BAD - Manual validation
function validateUser(data: any) {
  if (!data.email || !data.email.includes("@")) {
    throw new Error("Invalid email");
  }
  if (typeof data.age !== "number" || data.age < 0) {
    throw new Error("Invalid age");
  }
  // ... more manual checks
}
```

✅ **Do: Use Zod schemas**

```typescript
// GOOD - Declarative validation
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().nonnegative(),
});

const user = userSchema.parse(data); // ✅ Clean and clear
```

## Testing Validation

```typescript
import { describe, it, expect } from "vitest";
import { chatRequestSchema } from "./chat";

describe("chatRequestSchema", () => {
  it("should validate valid chat request", () => {
    const validData = {
      messages: [{ role: "user", content: "Hello" }],
      model: "gemini-2.5-flash",
    };

    expect(() => chatRequestSchema.parse(validData)).not.toThrow();
  });

  it("should reject empty messages array", () => {
    const invalidData = {
      messages: [],
    };

    expect(() => chatRequestSchema.parse(invalidData)).toThrow();
  });

  it("should reject invalid role", () => {
    const invalidData = {
      messages: [{ role: "invalid", content: "Hello" }],
    };

    expect(() => chatRequestSchema.parse(invalidData)).toThrow();
  });

  it("should provide detailed error messages", () => {
    const invalidData = {
      messages: [{ role: "user", content: "" }],
    };

    try {
      chatRequestSchema.parse(invalidData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        expect(error.errors[0].message).toContain("empty");
      }
    }
  });
});
```

## Related Patterns

- [API Route Pattern](api-route-pattern.md) - Using validation in routes
- [Error Handling Pattern](error-handling-pattern.md) - Handling validation errors
- [Service Layer Pattern](service-layer-pattern.md) - Validation in services

## External References

- [Zod Documentation](https://zod.dev/)
- [TypeScript Runtime Validation](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

**Last Updated:** November 2025
