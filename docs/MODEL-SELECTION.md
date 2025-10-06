# Model Selection Feature

## Overview

The chat application now supports switching between different Google Vertex AI models in real-time through a UI selector. This allows users to choose the most appropriate model for their use case without modifying configuration files.

## Available Models

The following Vertex AI models are currently supported:

1. **Gemini 1.5 Flash** (`gemini-1.5-flash-002`) - _Default_
   - Fast and efficient model for most tasks
   - Best for: Quick responses, high throughput scenarios

2. **Gemini 1.5 Pro** (`gemini-1.5-pro-002`)
   - Most capable model for complex reasoning
   - Best for: Complex analysis, detailed explanations

3. **Gemini 1.0 Pro** (`gemini-1.0-pro`)
   - Previous generation model
   - Best for: Stable, tested use cases

4. **Gemini 1.0 Pro Vision** (`gemini-1.0-pro-vision`)
   - Multimodal model with vision capabilities
   - Best for: Image analysis and multimodal interactions

## Architecture

### Components

#### 1. Model Constants (`src/lib/constants/vertex-ai-models.ts`)

Defines all available models with their metadata:

```typescript
export const VERTEX_AI_MODELS = {
  "gemini-1.5-flash-002": {
    id: "gemini-1.5-flash-002",
    name: "Gemini 1.5 Flash",
    description: "Fast and efficient model for most tasks",
  },
  // ... other models
};
```

#### 2. ModelSelector Component (`src/components/chat/model-selector.tsx`)

A client component that provides the UI for model selection:

- Uses shadcn/ui Select component (Radix UI)
- Displays model names and descriptions
- Disables during active chat requests
- Follows accessibility best practices

#### 3. Updated ChatService (`src/lib/services/chat-service.ts`)

Now accepts an optional `modelId` parameter:

```typescript
async stream(messages: Message[], modelId?: VertexAIModelId)
```

#### 4. Updated API Route (`src/app/api/chat/route.ts`)

Validates and passes the selected model to the ChatService:

```typescript
const { messages, modelId } = parsedBody.data;
const stream = await chatService.stream(messages, modelId);
```

#### 5. Updated useChat Hook (`src/lib/hooks/use-chat.ts`)

Manages the selected model state and includes it in API requests:

```typescript
const [selectedModel, setSelectedModel] =
  useState<VertexAIModelId>(DEFAULT_MODEL_ID);
```

### Data Flow

1. User selects a model from the dropdown
2. `setSelectedModel` updates the state in `useChat` hook
3. On message submission, the selected model is sent to `/api/chat`
4. API validates the model ID against the schema
5. ChatService uses the specified model for the Vertex AI API call
6. Response streams back to the user

## Type Safety

The implementation uses TypeScript's type system to ensure type safety:

```typescript
export type VertexAIModelId = keyof typeof VERTEX_AI_MODELS;
```

This ensures that only valid model IDs can be used throughout the application.

## Validation

The chat request schema validates the model ID:

```typescript
export const chatRequestSchema = z.object({
  messages: z.array(/* ... */),
  modelId: z.enum(Object.keys(VERTEX_AI_MODELS)).optional(),
});
```

## UI/UX Considerations

1. **Placement**: The model selector is placed at the top of the chat interface, above the message history
2. **Disabled State**: The selector is disabled during active requests to prevent mid-conversation model changes
3. **Visual Feedback**: Each model shows both a name and description to help users make informed choices
4. **Default Selection**: The default model (Gemini 1.5 Flash) is pre-selected on first load

## Testing

### Unit Tests

1. **Model Constants** (`tests/unit/vertex-ai-models.test.ts`)
   - Validates model structure
   - Ensures default model exists
   - Verifies model metadata

2. **ModelSelector Component** (`tests/unit/model-selector.test.tsx`)
   - Tests rendering with selected model
   - Tests model change callback
   - Tests disabled state
   - Tests accessibility features

3. **ChatService** (`tests/unit/chat-service.test.ts`)
   - Tests custom model ID usage
   - Tests fallback to default model
   - Tests model parameter passing

### Integration Testing

The E2E tests (`tests/e2e/chat.spec.ts`) should be updated to test:

- Model selector visibility
- Model switching functionality
- Message sending with different models

### Storybook

The ModelSelector component has Storybook stories for:

- Default state
- Different model selections
- Disabled state

## Configuration

### Environment Variables

The `GOOGLE_VERTEX_AI_MODEL_ID` environment variable is still used as a fallback:

- If a model ID is provided via the UI, it takes precedence
- If no model ID is provided, the environment variable is used
- If neither is available, `DEFAULT_MODEL_ID` is used

### Adding New Models

To add a new model:

1. Update `VERTEX_AI_MODELS` in `src/lib/constants/vertex-ai-models.ts`:

```typescript
export const VERTEX_AI_MODELS = {
  // ... existing models
  "new-model-id": {
    id: "new-model-id",
    name: "Model Name",
    description: "Model description",
  },
} as const;
```

2. Update tests to include the new model
3. Update documentation

The model will automatically appear in the dropdown.

## Security Considerations

1. **Validation**: All model IDs are validated against the whitelist
2. **Type Safety**: TypeScript ensures only valid model IDs can be used
3. **No User Input**: Model IDs come from predefined constants, not user input

## Performance

- Model selection is instant (no API calls required)
- State is managed locally in React
- No additional network requests for model switching

## Accessibility

- Proper ARIA labels on the select component
- Keyboard navigation support
- Screen reader friendly descriptions
- Disabled state clearly indicated

## Future Enhancements

Potential improvements:

1. Persist selected model in localStorage or user preferences
2. Show model capabilities/limitations in the UI
3. Add model cost information
4. Support for model-specific parameters (temperature, top-k, etc.)
5. Model performance metrics and comparisons
6. Auto-select best model based on query type

## References

- [Vertex AI Gemini API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Radix UI Select Component](https://www.radix-ui.com/docs/primitives/components/select)
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select)
