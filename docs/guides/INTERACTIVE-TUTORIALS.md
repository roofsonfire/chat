# Interactive Tutorials

Step-by-step guides with runnable code examples for common development tasks.

## Table of Contents

1. [Building Your First Chat Interface](#tutorial-1-building-your-first-chat-interface)
2. [Adding Image Upload Support](#tutorial-2-adding-image-upload-support)
3. [Implementing Model Selection](#tutorial-3-implementing-model-selection)
4. [Error Handling Patterns](#tutorial-4-error-handling-patterns)
5. [Streaming Responses](#tutorial-5-streaming-responses)
6. [Custom AI Service Integration](#tutorial-6-custom-ai-service-integration)

---

## Tutorial 1: Building Your First Chat Interface

**Time:** 15 minutes  
**Difficulty:** Beginner  
**Prerequisites:** Completed [onboarding](ONBOARDING.md)

### Goal

Create a simple chat interface that sends messages to the Gemini API and displays responses.

### Step 1: Create the Chat Component

Create a new file: `src/components/my-chat.tsx`

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function MyChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    // Add user message to chat
    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      // Read streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantMessage += chunk

          // Update assistant message in real-time
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage?.role === "assistant") {
              lastMessage.content = assistantMessage
            } else {
              newMessages.push({ role: "assistant", content: assistantMessage })
            }
            
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Card key={index} className={message.role === "user" ? "ml-auto max-w-md" : "mr-auto max-w-md"}>
            <CardContent className="p-3">
              <p className="text-sm font-semibold mb-1">
                {message.role === "user" ? "You" : "AI"}
              </p>
              <p className="text-sm">{message.content}</p>
            </CardContent>
          </Card>
        ))}
        {isLoading && (
          <Card className="mr-auto max-w-md">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  )
}
```

### Step 2: Add to a Page

Create or edit `src/app/my-chat/page.tsx`:

```typescript
import { MyChat } from "@/components/my-chat"

export default function MyChatPage() {
  return (
    <main className="container mx-auto">
      <h1 className="text-2xl font-bold p-4">My Chat Interface</h1>
      <MyChat />
    </main>
  )
}
```

### Step 3: Test Your Chat

```bash
npm run dev
```

Visit: http://localhost:3000/my-chat

Try sending: "Hello, how are you?"

### ✅ Success Criteria

- [ ] Chat interface renders without errors
- [ ] Can type and send messages
- [ ] Receives AI responses in real-time
- [ ] Messages display in correct order
- [ ] Loading state shows while waiting

### 🎓 What You Learned

- Using React hooks (`useState`) for state management
- Handling form submissions
- Making API calls with `fetch`
- Reading streaming responses
- Updating UI in real-time

### 🚀 Next Steps

- Add message timestamps
- Implement message persistence
- Add typing indicators
- Try [Tutorial 2: Image Upload](#tutorial-2-adding-image-upload-support)

---

## Tutorial 2: Adding Image Upload Support

**Time:** 20 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** [Tutorial 1](#tutorial-1-building-your-first-chat-interface)

### Goal

Extend your chat interface to support image uploads for multimodal AI interactions.

### Step 1: Update Message Type

Update your `Message` interface in `src/components/my-chat.tsx`:

```typescript
interface Message {
  role: "user" | "assistant"
  content: string
  image?: string // Base64 data URL
}
```

### Step 2: Add Image Upload Component

Add this to your component:

```typescript
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"

export function MyChatWithImages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB")
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!input.trim() && !selectedImage) || isLoading) return

    // Add user message with optional image
    const userMessage: Message = {
      role: "user",
      content: input || "What's in this image?",
      image: selectedImage || undefined,
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantMessage += chunk

          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage?.role === "assistant") {
              lastMessage.content = assistantMessage
            } else {
              newMessages.push({ role: "assistant", content: assistantMessage })
            }
            
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Card key={index} className={message.role === "user" ? "ml-auto max-w-md" : "mr-auto max-w-md"}>
            <CardContent className="p-3">
              <p className="text-sm font-semibold mb-1">
                {message.role === "user" ? "You" : "AI"}
              </p>
              
              {message.image && (
                <div className="relative mb-2">
                  <Image
                    src={message.image}
                    alt="Uploaded image"
                    width={300}
                    height={200}
                    className="rounded"
                  />
                </div>
              )}
              
              <p className="text-sm">{message.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image preview */}
      {selectedImage && (
        <div className="border-t p-4">
          <div className="relative inline-block">
            <Image
              src={selectedImage}
              alt="Selected image"
              width={200}
              height={150}
              className="rounded"
            />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message or upload an image..."
          disabled={isLoading}
          className="flex-1"
        />
        
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  )
}
```

### Step 3: Test Image Upload

```bash
npm run dev
```

Try:
1. Click the image icon
2. Select an image
3. Send a message: "What's in this image?"

### ✅ Success Criteria

- [ ] Can select images from file system
- [ ] Image preview displays before sending
- [ ] Can remove selected image
- [ ] AI responds with image description
- [ ] File validation works (type, size)

### 🎓 What You Learned

- File input handling in React
- Converting files to base64
- Image validation (type, size)
- Using `useRef` for DOM access
- Multimodal AI interactions

### 🚀 Next Steps

- Add drag-and-drop support
- Support multiple images
- Add image compression
- Try [Tutorial 3: Model Selection](#tutorial-3-implementing-model-selection)

---

## Tutorial 3: Implementing Model Selection

**Time:** 15 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** [Tutorial 1](#tutorial-1-building-your-first-chat-interface)

### Goal

Allow users to choose between different Gemini models at runtime.

### Step 1: Fetch Available Models

Create a hook to fetch models: `src/hooks/use-models.ts`

```typescript
"use client"

import { useState, useEffect } from "react"

interface Model {
  id: string
  displayName: string
  description: string
}

export function useModels() {
  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models")
        
        if (!response.ok) {
          throw new Error("Failed to fetch models")
        }

        const data = await response.json()
        setModels(data.models)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  return { models, isLoading, error }
}
```

### Step 2: Add Model Selector Component

Update your chat component to include model selection:

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useModels } from "@/hooks/use-models"

export function MyChatWithModelSelection() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-image")
  const [isLoading, setIsLoading] = useState(false)
  const { models, isLoading: modelsLoading } = useModels()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          modelId: selectedModel, // Pass selected model
        }),
      })

      // ... rest of streaming logic
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Model selector header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Model:</label>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            disabled={modelsLoading || isLoading}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div>
                    <div className="font-medium">{model.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {model.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ... rest of chat UI */}
    </div>
  )
}
```

### Step 3: Test Model Selection

```bash
npm run dev
```

Try:
1. Select "Gemini 2.5 Flash" (fast)
2. Send a simple question
3. Switch to "Gemini 1.5 Pro" (powerful)
4. Send a complex question

### ✅ Success Criteria

- [ ] Model dropdown populates from API
- [ ] Can switch between models
- [ ] Selected model is used for requests
- [ ] Model info displays correctly

### 🎓 What You Learned

- Creating custom React hooks
- Fetching data with `useEffect`
- Using shadcn/ui Select component
- Passing dynamic parameters to API

### 🚀 Next Steps

- Display model capabilities
- Add model comparison table
- Show token usage per model
- Try [Tutorial 4: Error Handling](#tutorial-4-error-handling-patterns)

---

## Tutorial 4: Error Handling Patterns

**Time:** 20 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** [Tutorial 1](#tutorial-1-building-your-first-chat-interface)

### Goal

Implement robust error handling with user-friendly messages and retry logic.

### Step 1: Create Error Types

Create `src/lib/errors/chat-errors.ts`:

```typescript
export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = "ChatError"
  }
}

export class RateLimitError extends ChatError {
  constructor() {
    super(
      "Too many requests. Please wait a moment before trying again.",
      "RATE_LIMIT",
      429
    )
  }
}

export class AuthError extends ChatError {
  constructor() {
    super(
      "Authentication failed. Please sign in again.",
      "AUTH_ERROR",
      401
    )
  }
}

export class NetworkError extends ChatError {
  constructor() {
    super(
      "Network error. Please check your connection and try again.",
      "NETWORK_ERROR",
      0
    )
  }
}

export class APIError extends ChatError {
  constructor(message: string = "API request failed") {
    super(message, "API_ERROR", 500)
  }
}
```

### Step 2: Add Error Handling Hook

Create `src/hooks/use-chat-with-errors.ts`:

```typescript
"use client"

import { useState } from "react"
import { ChatError, RateLimitError, AuthError, NetworkError, APIError } from "@/lib/errors/chat-errors"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ErrorState {
  message: string
  code: string
  canRetry: boolean
}

export function useChatWithErrors() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleError = (err: unknown): ErrorState => {
    if (err instanceof RateLimitError) {
      return {
        message: err.message,
        code: err.code,
        canRetry: true,
      }
    }

    if (err instanceof AuthError) {
      return {
        message: err.message,
        code: err.code,
        canRetry: false,
      }
    }

    if (err instanceof NetworkError) {
      return {
        message: err.message,
        code: err.code,
        canRetry: true,
      }
    }

    if (err instanceof ChatError) {
      return {
        message: err.message,
        code: err.code,
        canRetry: err.statusCode >= 500,
      }
    }

    // Unknown error
    return {
      message: "An unexpected error occurred. Please try again.",
      code: "UNKNOWN",
      canRetry: true,
    }
  }

  const sendMessage = async (messageToSend?: string) => {
    const content = messageToSend || input
    
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: "user", content }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      // Handle different error status codes
      if (response.status === 429) {
        throw new RateLimitError()
      }

      if (response.status === 401 || response.status === 403) {
        throw new AuthError()
      }

      if (response.status >= 500) {
        const data = await response.json().catch(() => ({}))
        throw new APIError(data.error || "Server error")
      }

      if (!response.ok) {
        throw new APIError("Request failed")
      }

      // Reset retry count on success
      setRetryCount(0)

      // Read streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          assistantMessage += chunk

          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage?.role === "assistant") {
              lastMessage.content = assistantMessage
            } else {
              newMessages.push({ role: "assistant", content: assistantMessage })
            }
            
            return newMessages
          })
        }
      }
    } catch (err) {
      console.error("Chat error:", err)
      
      // Handle network errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(handleError(new NetworkError()))
      } else {
        setError(handleError(err))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const retry = () => {
    if (!error?.canRetry) return
    
    setRetryCount((prev) => prev + 1)
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m) => m.role === "user")
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    retryCount,
    sendMessage,
    retry,
    clearError,
  }
}
```

### Step 3: Use Error Handling in Component

```typescript
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useChatWithErrors } from "@/hooks/use-chat-with-errors"

export function RobustChat() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    retryCount,
    sendMessage,
    retry,
    clearError,
  } = useChatWithErrors()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Error banner */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <div className="flex gap-2">
              {error.canRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={retry}
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry {retryCount > 0 && `(${retryCount}/3)`}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ... rest of chat UI */}
    </div>
  )
}
```

### ✅ Success Criteria

- [ ] Errors display with user-friendly messages
- [ ] Can retry failed requests (max 3 times)
- [ ] Non-retryable errors handled appropriately
- [ ] Network errors detected and shown
- [ ] Error banner can be dismissed

### 🎓 What You Learned

- Creating custom error classes
- Error handling best practices
- Retry logic implementation
- User-friendly error messages
- Error state management

---

## Tutorial 5: Streaming Responses

**Time:** 25 minutes  
**Difficulty:** Advanced  
**Prerequisites:** [Tutorial 1](#tutorial-1-building-your-first-chat-interface)

### Goal

Implement efficient streaming with chunk buffering, token counting, and cancel support.

### Step 1: Create Streaming Utilities

Create `src/lib/streaming/stream-utils.ts`:

```typescript
/**
 * Parse Server-Sent Events (SSE) stream
 */
export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    
    if (done) {
      // Process any remaining data in buffer
      if (buffer.trim()) {
        yield buffer
      }
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    
    // Keep the last incomplete line in buffer
    buffer = lines.pop() || ""

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6)
        if (data === "[DONE]") {
          return
        }
        yield data
      }
    }
  }
}

/**
 * Count tokens in text (rough estimate)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

/**
 * Create cancellable fetch request
 */
export function createCancellableRequest(
  url: string,
  options: RequestInit = {}
) {
  const controller = new AbortController()
  
  const request = fetch(url, {
    ...options,
    signal: controller.signal,
  })

  return {
    request,
    cancel: () => controller.abort(),
  }
}
```

### Step 2: Implement Advanced Streaming Hook

Create `src/hooks/use-advanced-streaming.ts`:

```typescript
"use client"

import { useState, useRef, useCallback } from "react"
import { parseSSEStream, estimateTokens, createCancellableRequest } from "@/lib/streaming/stream-utils"

interface Message {
  role: "user" | "assistant"
  content: string
  tokens?: number
}

interface StreamingMetrics {
  chunkCount: number
  totalTokens: number
  streamingTime: number
  cancelled: boolean
}

export function useAdvancedStreaming() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [metrics, setMetrics] = useState<StreamingMetrics>({
    chunkCount: 0,
    totalTokens: 0,
    streamingTime: 0,
    cancelled: false,
  })
  
  const cancelRef = useRef<(() => void) | null>(null)
  const startTimeRef = useRef<number>(0)

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      role: "user",
      content: input,
      tokens: estimateTokens(input),
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsStreaming(true)
    setMetrics({
      chunkCount: 0,
      totalTokens: 0,
      streamingTime: 0,
      cancelled: false,
    })
    
    startTimeRef.current = Date.now()

    try {
      const { request, cancel } = createCancellableRequest("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      cancelRef.current = cancel

      const response = await request

      if (!response.ok) {
        throw new Error("Request failed")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No reader available")
      }

      let assistantMessage = ""
      let chunkCount = 0

      for await (const chunk of parseSSEStream(reader)) {
        assistantMessage += chunk
        chunkCount++

        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          
          if (lastMessage?.role === "assistant") {
            lastMessage.content = assistantMessage
            lastMessage.tokens = estimateTokens(assistantMessage)
          } else {
            newMessages.push({
              role: "assistant",
              content: assistantMessage,
              tokens: estimateTokens(assistantMessage),
            })
          }
          
          return newMessages
        })

        setMetrics((prev) => ({
          ...prev,
          chunkCount,
          totalTokens: estimateTokens(assistantMessage),
          streamingTime: Date.now() - startTimeRef.current,
        }))
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMetrics((prev) => ({
          ...prev,
          cancelled: true,
          streamingTime: Date.now() - startTimeRef.current,
        }))
      } else {
        console.error("Streaming error:", error)
        throw error
      }
    } finally {
      setIsStreaming(false)
      cancelRef.current = null
    }
  }, [input, isStreaming, messages])

  const cancelStream = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current()
      cancelRef.current = null
    }
  }, [])

  return {
    messages,
    input,
    setInput,
    isStreaming,
    metrics,
    sendMessage,
    cancelStream,
  }
}
```

### Step 3: Build Streaming UI

```typescript
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StopCircle } from "lucide-react"
import { useAdvancedStreaming } from "@/hooks/use-advanced-streaming"

export function AdvancedStreamingChat() {
  const {
    messages,
    input,
    setInput,
    isStreaming,
    metrics,
    sendMessage,
    cancelStream,
  } = useAdvancedStreaming()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="flex h-screen">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <Card key={index} className={message.role === "user" ? "ml-auto max-w-md" : "mr-auto max-w-md"}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">
                    {message.role === "user" ? "You" : "AI"}
                  </p>
                  {message.tokens && (
                    <Badge variant="outline" className="text-xs">
                      ~{message.tokens} tokens
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{message.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isStreaming}
            className="flex-1"
          />
          {isStreaming ? (
            <Button type="button" variant="destructive" onClick={cancelStream}>
              <StopCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button type="submit">Send</Button>
          )}
        </form>
      </div>

      {/* Metrics sidebar */}
      <Card className="w-64 m-4">
        <CardHeader>
          <CardTitle className="text-sm">Streaming Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={isStreaming ? "default" : "secondary"}>
              {isStreaming ? "Streaming" : "Idle"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chunks:</span>
            <span className="font-mono">{metrics.chunkCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tokens:</span>
            <span className="font-mono">{metrics.totalTokens}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-mono">{(metrics.streamingTime / 1000).toFixed(2)}s</span>
          </div>
          {metrics.cancelled && (
            <Badge variant="outline" className="w-full justify-center">
              Cancelled
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### ✅ Success Criteria

- [ ] Messages stream in real-time
- [ ] Can cancel streaming mid-response
- [ ] Token counts display accurately
- [ ] Streaming metrics update live
- [ ] Handles SSE format correctly

### 🎓 What You Learned

- Server-Sent Events (SSE) parsing
- Stream cancellation with AbortController
- Token estimation algorithms
- Real-time metrics tracking
- Advanced state management

---

## Tutorial 6: Custom AI Service Integration

**Time:** 30 minutes  
**Difficulty:** Advanced  
**Prerequisites:** Understanding of [Service Layer Pattern](../.github/patterns/service-layer-pattern.md)

### Goal

Create a custom AI service wrapper with caching, fallbacks, and custom prompts.

Coming soon! This tutorial will cover:
- Creating custom service classes
- Implementing response caching
- Adding fallback models
- Custom system prompts
- Performance optimization

---

## 📚 Additional Resources

- [Code Patterns](../.github/patterns/) - Reusable patterns
- [API Reference](../API.md) - Endpoint documentation
- [Development Guide](../DEVELOPMENT.md) - Setup and workflows

## 🆘 Need Help?

- Check [Common Mistakes](COMMON-MISTAKES.md)
- Review [Troubleshooting](ONBOARDING.md#common-pitfalls)
- Open a GitHub issue

---

**Last Updated:** November 2025  
**Maintained by:** Core Development Team
