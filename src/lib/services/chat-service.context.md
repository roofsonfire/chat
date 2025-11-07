# ChatService Context

> **Purpose:** This context file provides AI assistants (GitHub Copilot, etc.) with deep understanding of the ChatService implementation for better code suggestions and modifications.

---

## Service Overview

**File:** `src/lib/services/chat-service.ts`  
**Purpose:** Manages all interactions with Google Vertex AI for chat functionality  
**Dependencies:** `@google-cloud/vertexai`, Zod validation, custom error classes

### Responsibilities

1. **Streaming Chat:** Real-time message streaming from Gemini models
2. **Multimodal Support:** Handle text + image inputs
3. **Model Management:** Dynamic model selection and configuration
4. **Error Handling:** Transform Vertex AI errors to application errors
5. **Validation:** Input validation before API calls

---

## Architecture

```
ChatService
├── constructor(config)          # Initialize Vertex AI client
├── streamChat(messages)         # Main streaming endpoint
│   ├── validateMessages()       # Input validation
│   ├── formatMessages()         # Transform to Vertex AI format
│   ├── getModel()              # Get configured model
│   └── transformStream()       # Convert Vertex AI stream to SSE
├── getAvailableModels()        # Fetch model catalog
└── handleVertexError()         # Error transformation
```

---

## Key Implementation Details

### Message Format

**Input (Application Format):**

```typescript
{
  role: "user" | "assistant",
  content: string,
  imageData?: string  // Base64-encoded
}
```

**Output (Vertex AI Format):**

```typescript
{
  role: "user" | "model",  // Note: "assistant" → "model"
  parts: [
    { text: string },
    { inlineData?: { mimeType: string, data: string } }
  ]
}
```

### Streaming Protocol

1. **Client → API Route:** POST /api/chat with messages array
2. **API Route → ChatService:** Call `streamChat(messages)`
3. **ChatService → Vertex AI:** Generate content stream
4. **Vertex AI → ChatService:** Async generator of chunks
5. **ChatService → API Route:** ReadableStream (SSE format)
6. **API Route → Client:** `text/event-stream` response

**Stream Format:**

```
data: {"text":"Hello"}\n\n
data: {"text":" world"}\n\n
data: {"text":"!"}\n\n
```

---

## Error Handling Strategy

### Error Types

```typescript
ValidationError     # Invalid input (empty messages, bad format)
  ↓
VertexAIError      # Vertex AI API failures
  ├── Rate limit (429)
  ├── Auth error (401/403)
  ├── Server error (500+)
  └── Safety filter (SAFETY finish reason)
  ↓
ServiceError       # Unexpected errors
```

### Error Transformation

```typescript
// Vertex AI error → Application error
if (code === 429) → RateLimitError
if (code === 401/403) → VertexAIError (auth)
if (code >= 500) → VertexAIError (unavailable)
if (finishReason === "SAFETY") → VertexAIError (content blocked)
else → VertexAIError (generic)
```

---

## Configuration

### Environment Variables

```typescript
GOOGLE_PROJECT_ID           # GCP project ID
GOOGLE_LOCATION            # us-central1 (default)
GOOGLE_VERTEX_AI_MODEL_ID  # gemini-2.5-flash-image (default)
```

### Model Configuration

```typescript
{
  model: string,              # Model ID (e.g., "gemini-2.5-flash-image")
  generationConfig: {
    maxOutputTokens: 8192,   # Max response length
    temperature: 0.7,        # Creativity (0-2)
    topP: 0.95,             # Nucleus sampling
  }
}
```

---

## Common Modifications

### Adding a New Method

**Pattern:** Follow existing method structure

```typescript
async newMethod(input: InputType): Promise<OutputType> {
  // 1. Validate input
  this.validateInput(input);

  try {
    // 2. Log operation start
    logger.info("Operation started", { operation: "newMethod" });

    // 3. Call Vertex AI
    const model = this.getModel();
    const result = await model.someMethod(input);

    // 4. Transform result
    const transformed = this.transformResult(result);

    // 5. Log success
    logger.info("Operation completed", { operation: "newMethod" });

    return transformed;
  } catch (error) {
    // 6. Handle errors
    logger.error("Operation failed", { error, input });
    throw this.handleVertexError(error);
  }
}
```

### Adding Image Support to Existing Method

**Pattern:** Check for imageData and add inline_data part

```typescript
const parts: Part[] = [{ text: message.content }];

if (message.imageData) {
  parts.push({
    inlineData: {
      mimeType: "image/jpeg", // Or detect from data URL
      data: message.imageData,
    },
  });
}
```

### Changing Model Parameters

**Location:** `streamChat()` method, `generationConfig` object

```typescript
generationConfig: {
  maxOutputTokens: 8192,    # Increase for longer responses
  temperature: 0.7,         # Lower for more deterministic
  topP: 0.95,              # Adjust sampling
  topK: 40,                # Add for additional control
}
```

---

## Testing Considerations

### Mock Strategy

**Unit Tests:** Mock Vertex AI client entirely

```typescript
vi.mock("@google-cloud/vertexai", () => ({
  VertexAI: vi.fn(() => ({
    getGenerativeModel: mockGenerativeModel,
  })),
}));
```

**Integration Tests:** Use real Vertex AI with test project

### Test Coverage

**Required:**

- ✅ Empty message validation
- ✅ Message format transformation
- ✅ Streaming functionality
- ✅ Error handling (all error types)
- ✅ Multimodal (text + image) support

**Current Coverage:** See `tests/unit/chat-service.test.ts`

---

## Performance Characteristics

### Streaming Performance

- **First token latency:** ~500ms-1s
- **Streaming rate:** ~20-50 tokens/second
- **Memory usage:** Minimal (streaming, not buffered)

### Rate Limits

**Vertex AI (default quotas):**

- Requests per minute: 60
- Tokens per minute: 120,000
- Concurrent requests: 10

**Application rate limit:** 5 requests / 10 seconds per IP (see middleware)

---

## Dependencies

### Direct Dependencies

```typescript
@google-cloud/vertexai  # Vertex AI SDK
@/lib/logger           # Structured logging
@/lib/errors           # Custom error classes
@/lib/env              # Environment validation
```

### Related Services

- **API Route:** `src/app/api/chat/route.ts` - Consumes ChatService
- **Middleware:** `src/middleware.ts` - Rate limiting before ChatService
- **Types:** `src/lib/types/chat.ts` - Message type definitions

---

## Future Enhancements

### Planned Features

1. **Conversation History:** Store and retrieve past conversations
2. **Function Calling:** Enable Gemini to call external functions
3. **Multi-turn Context:** Maintain context across multiple exchanges
4. **Model Switching:** Allow runtime model selection
5. **Token Counting:** Track and limit token usage

### Extension Points

**Add new model capability:**

```typescript
// Add to getModel() method
const model = this.vertexAI.getGenerativeModel({
  model: this.config.modelId,
  tools: [
    /* function declarations */
  ], // NEW
  toolConfig: {
    /* config */
  }, // NEW
});
```

**Add conversation memory:**

```typescript
// Store in database or Redis
interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Debugging Tips

### Enable Verbose Logging

Set in `.env.local`:

```env
LOG_LEVEL=debug
```

### Test Vertex AI Connection

```bash
node tests/manual/test-vertex-ai.js
```

### Check API Credentials

```bash
gcloud auth application-default print-access-token
```

### Monitor Streaming

Add debug logs in `transformStream()`:

```typescript
for await (const chunk of result.stream) {
  console.log("Chunk:", chunk); // Debug
  // ... rest of code
}
```

---

## Common Issues

### "PERMISSION_DENIED" Error

**Cause:** Service account lacks Vertex AI permissions  
**Solution:** Grant `roles/aiplatform.user` role

### "RESOURCE_EXHAUSTED" Error

**Cause:** Rate limit exceeded  
**Solution:** Implement exponential backoff or request quota increase

### "INVALID_ARGUMENT" Error

**Cause:** Malformed message format  
**Solution:** Check message validation in `validateMessages()`

### Empty Streaming Response

**Cause:** Safety filters blocking content  
**Solution:** Check `finishReason === "SAFETY"` in error handling

---

## Related Documentation

- **[API Route Pattern](../../.github/patterns/api-route-pattern.md)** - How API routes use this service
- **[Service Layer Pattern](../../.github/patterns/service-layer-pattern.md)** - General service architecture
- **[Error Handling Pattern](../../.github/patterns/error-handling-pattern.md)** - Error management strategy
- **[Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)** - Official Google documentation

---

**Last Updated:** November 2025  
**Maintainer:** Core Development Team  
**File Location:** `src/lib/services/chat-service.ts`
