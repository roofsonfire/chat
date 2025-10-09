# API Documentation

This document describes the API endpoints available in the chat application.

## Authentication

All API endpoints (except `/api/auth/*`) require authentication via NextAuth.js session tokens.

## Rate Limiting

All requests are rate-limited to **5 requests per 10 seconds** per IP address.

Rate limit headers are included in all responses:

- `X-RateLimit-Limit`: Maximum number of requests allowed
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Endpoints

### POST /api/chat

Stream AI responses for chat messages.

**Request Body:**

```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    image?: string; // Optional base64-encoded image data URL
  }>;
  modelId?: string; // Optional Vertex AI model ID (e.g., "gemini-1.5-flash-002")
}
```

**Available Models:**

- `gemini-1.5-flash-002` (default) - Fast and efficient
- `gemini-1.5-pro-002` - Most capable for complex reasoning
- `gemini-1.0-pro` - Previous generation
- `gemini-1.0-pro-vision` - Multimodal with vision capabilities

**Validation Rules:**

- Minimum 1 message, maximum 100 messages
- Message content: 1-10,000 characters
- Images: Base64-encoded data URLs
- Model ID must be one of the available models (optional)

**Response:**

Streams text content as `text/plain; charset=utf-8`.

**Headers:**

- `Content-Type: text/plain; charset=utf-8`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

**Error Responses:**

```typescript
// 400 Bad Request
{
  error: "Invalid request body";
}

// 500 Internal Server Error
{
  error: "Internal server error";
}
```

**Example:**

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello, how are you?" }],
    modelId: "gemini-1.5-pro-002", // Optional: specify which model to use
  }),
});

if (!response.ok) {
  const error = await response.json();
  console.error(error);
  return;
}

// Stream the response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

### POST /api/auth/[...nextauth]

NextAuth.js authentication endpoints. See [NextAuth.js documentation](https://next-auth.js.org/) for details.

**Available routes:**

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/credentials` - Credentials sign in (available only when `ENABLE_TEST_CREDENTIALS=true`)
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token

## Error Handling

All API endpoints follow a consistent error format:

```typescript
{
  error: string; // Human-readable error message
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `400 Bad Request` - Invalid request body or parameters
- `401 Unauthorized` - Authentication required
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Security

### Authentication

Authentication is handled by NextAuth.js using Google OAuth. Access is restricted to emails defined in the invite allowlist. A credentials provider is conditionally enabled for automated testing when the `ENABLE_TEST_CREDENTIALS` flag is set.

### Rate Limiting

Implemented using Upstash Redis with sliding window algorithm:

- 5 requests per 10 seconds per IP
- Returns 429 status with retry information when exceeded

### CORS

CORS is not enabled. The API is designed to be consumed by the same-origin frontend only.

### Input Validation

All inputs are validated using Zod schemas:

- Message content length limits
- Message array size limits
- Image format validation (client-side)

### Security Headers

The application includes comprehensive security headers:

- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Referrer-Policy

## Client-Side Usage

The application provides a custom `useChat` hook for easy integration:

```typescript
import { useChat } from "@/lib/hooks/use-chat";

function ChatComponent() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setImage,
  } = useChat();

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button type="submit" disabled={isLoading}>
        Send
      </button>
    </form>
  );
}
```
