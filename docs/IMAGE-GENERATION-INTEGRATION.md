# Image Generation Integration with Gemini 2.5 Flash Image (Nano Banana 🍌)

## Overview

This document outlines the implementation plan for integrating Gemini 2.5 Flash Image generation capabilities into the chat application.

## Model Information

### gemini-2.5-flash-image ("Nano Banana")

**Official Name**: Gemini 2.5 Flash with Image Generation  
**Nickname**: Nano Banana 🍌  
**Model ID**: `gemini-2.5-flash-image`

### Capabilities

1. **Text-to-Image**: Generate high-quality images from text descriptions
2. **Image + Text-to-Image (Editing)**: Provide an image and use text prompts to modify elements
3. **Multi-Image Composition**: Use multiple input images to compose a new scene or transfer styles
4. **Iterative Refinement**: Engage in conversation to progressively refine images over multiple turns
5. **High-Fidelity Text Rendering**: Generate images with legible and well-placed text

### Response Format

Unlike standard Gemini models that only return text, `gemini-2.5-flash-image` returns **multi-part responses**:

```typescript
{
  candidates: [
    {
      content: {
        parts: [
          {
            text: "Here's the image you requested:",
          },
          {
            inline_data: {
              mimeType: "image/png",
              data: "base64_encoded_image_data...",
            },
          },
        ],
      },
    },
  ];
}
```

### Configuration Options

```typescript
config: {
  response_modalities: ['Text', 'Image'], // or just ['Image']
  image_config: {
    aspect_ratio: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9"
  }
}
```

## Architecture Changes

### 1. Model Registry Update

**File**: `src/lib/constants/vertex-ai-models.ts`

```typescript
export const VERTEX_AI_MODELS = {
  // ... existing models
  "gemini-2.5-flash-image": {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash (Image Gen)",
    description: "Nano Banana 🍌 - Generate and edit images",
    capabilities: ["text", "image-input", "image-output"],
  },
} as const;
```

### 2. Message Type Extension

**File**: `src/lib/types/index.ts`

Current:

```typescript
export interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 encoded image INPUT
}
```

Proposed:

```typescript
export interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 encoded image INPUT
  generatedImages?: GeneratedImage[]; // NEW: Generated image OUTPUTS
}

export interface GeneratedImage {
  mimeType: string;
  data: string; // base64
  aspectRatio?: string;
}
```

### 3. Stream Processing Update

**File**: `src/lib/streaming/stream-utils.ts`

Current behavior: Only extracts `text` from response parts  
New behavior: Extract **both** `text` and `inline_data` parts

```typescript
export function toReadableStream(
  stream: AsyncGenerator<GenerateContentResponse>
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const parts = chunk.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
          // Handle text parts
          if (part.text) {
            controller.enqueue(
              JSON.stringify({
                type: "text",
                content: part.text,
              }) + "\n"
            );
          }

          // Handle image parts
          if (part.inline_data) {
            controller.enqueue(
              JSON.stringify({
                type: "image",
                mimeType: part.inline_data.mimeType,
                data: part.inline_data.data,
              }) + "\n"
            );
          }
        }
      }
      controller.close();
    },
  });
}
```

### 4. API Route Update

**File**: `src/app/api/chat/route.ts`

The API route needs to handle the new streaming format with mixed text and image chunks.

### 5. Client Hook Update

**File**: `src/lib/hooks/use-chat.ts`

The `useChat` hook needs to:

- Parse both text and image chunks from the stream
- Accumulate text and images separately
- Update the UI with both text and images

### 6. UI Component Updates

**File**: `src/components/chat/chat-history.tsx`

Update to display generated images:

```tsx
export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div>
      {messages.map((message, i) => (
        <div key={i}>
          <p>{message.content}</p>

          {/* Display UPLOADED images (input) */}
          {message.image && <img src={message.image} alt="Uploaded" />}

          {/* Display GENERATED images (output) */}
          {message.generatedImages?.map((img, j) => (
            <img
              key={j}
              src={`data:${img.mimeType};base64,${img.data}`}
              alt="Generated"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Implementation Steps

### Phase 1: Backend Foundation ✅

1. ✅ Add `gemini-2.5-flash-image` to model registry
2. ⬜ Update TypeScript types for multi-part responses
3. ⬜ Modify stream processing to handle image parts
4. ⬜ Update API route to stream mixed content

### Phase 2: Frontend Integration

5. ⬜ Update `useChat` hook to parse image chunks
6. ⬜ Update `ChatHistory` component to display images
7. ⬜ Add loading indicators for image generation
8. ⬜ Add download button for generated images

### Phase 3: Configuration & UX

9. ⬜ Add aspect ratio selector
10. ⬜ Add "image-only" vs "text + image" mode toggle
11. ⬜ Update model selector to show capabilities
12. ⬜ Add help text explaining image generation

### Phase 4: Testing

13. ⬜ Test text-to-image generation
14. ⬜ Test image editing (upload + modify)
15. ⬜ Test multi-turn conversational editing
16. ⬜ Test error handling for safety blocks
17. ⬜ Test different aspect ratios

## Example Usage

### Text-to-Image

```
User: "Generate the image of a red flower"
Model: "Here's a vibrant red flower for you:"
        [Generated image appears]
```

### Image Editing

```
User: [uploads image of blue car] "Change this car to red"
Model: "Here's your car in red:"
        [Modified image appears]
```

### Iterative Refinement

```
User: "Generate a sunset over mountains"
Model: [generates image]
User: "Add a lake in the foreground"
Model: [generates updated image with lake]
User: "Make it more vibrant"
Model: [generates final vibrant version]
```

## API Pricing

**Image Generation Tokens**: 1290 tokens per image (flat rate, up to 1024x1024px)  
**Cost**: $30 per 1 million tokens  
**Per Image**: ~$0.04 per generated image

Compare to:

- **Imagen 4**: $0.02-$0.12 per image (faster, specialized)
- **Gemini Image Gen**: More flexible, conversational editing

## Limitations

- Works best with up to 3 images as input
- Supported languages: EN, es-MX, ja-JP, zh-CN, hi-IN
- No audio or video inputs for image generation
- EEA, CH, UK: No images of children
- All generated images include SynthID watermark

## Example Prompts

### Photorealistic

```
A photorealistic close-up of a red rose with water droplets,
soft morning light, shallow depth of field, shot with 85mm lens
```

### Logo Design

```
Create a modern, minimalist logo for a tech startup called "NeuralFlow"
in a clean sans-serif font with a gradient blue-purple color scheme
```

### Product Mockup

```
A high-resolution studio photograph of a white ceramic mug on a wooden
table, dramatic side lighting, 4:3 aspect ratio
```

## References

- [Official Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [Prompting Guide](https://ai.google.dev/gemini-api/docs/image-generation#prompting_guide_and_strategies)
- [Vertex AI Node.js SDK](https://github.com/googleapis/nodejs-vertexai)

---

**Status**: 🚧 In Progress  
**Next Step**: Implement multi-part stream processing
