# Client Component Pattern

## Purpose

React Client Components in Next.js 15 for interactive UI elements that require React hooks, browser APIs, or event handlers.

## When to Use

- Need React hooks (useState, useEffect, useReducer, etc.)
- Need browser APIs (window, localStorage, geolocation, etc.)
- Need event handlers (onClick, onChange, onSubmit, etc.)
- Need real-time interactivity or animations
- Need third-party libraries that require client-side rendering

## When NOT to Use

- Fetching data that doesn't require interactivity
- Static content rendering
- SEO-critical content without interactivity
- When Server Component would suffice

## Structure

### Basic Client Component

```typescript
"use client" // REQUIRED directive at top of file

import { useState, useEffect } from "react"

interface ComponentProps {
  initialValue: string
  onValueChange?: (value: string) => void
}

export function InteractiveComponent({
  initialValue,
  onValueChange,
}: ComponentProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    // Side effects, subscriptions, etc.
    return () => {
      // Cleanup
    }
  }, [])

  const handleChange = (newValue: string) => {
    setValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div>
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  )
}
```

### Client Component with Hooks

```typescript
"use client"

import { useState, useCallback, useEffect } from "react"
import { logger } from "@/lib/logger"

export function DataFetcher() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/data")
      if (!response.ok) throw new Error("Failed to fetch")

      const result = await response.json()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      logger.error("Data fetch failed", { error: err })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay message={error} />
  if (!data) return null

  return <DataDisplay data={data} />
}
```

## Real Example: Chat Input Component

**File:** `src/components/chat/chat-input.tsx`

```typescript
"use client"

import { useState, useCallback, useRef, KeyboardEvent } from "react"
import { Send, Paperclip } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(async () => {
    if (!message.trim() && !image) return
    if (sending) return

    setSending(true)

    try {
      await onSendMessage(message, image || undefined)
      setMessage("")
      setImage(null)
      textareaRef.current?.focus()
    } catch (error) {
      logger.error("Failed to send message", { error })
    } finally {
      setSending(false)
    }
  }, [message, image, sending, onSendMessage])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        logger.warn("Invalid file type selected", { type: file.type })
        return
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        logger.warn("File too large", { size: file.size })
        return
      }

      setImage(file)
    },
    []
  )

  return (
    <div className="flex items-end gap-2 p-4 border-t">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || sending}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || sending}
        className={cn(
          "min-h-[60px] resize-none",
          image && "border-blue-500"
        )}
      />

      {image && (
        <div className="text-sm text-muted-foreground">
          {image.name}
        </div>
      )}

      <Button
        onClick={handleSend}
        disabled={disabled || sending || (!message.trim() && !image)}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
```

## Browser API Usage

### LocalStorage

```typescript
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing localStorage", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

### Window Events

```typescript
"use client";

import { useState, useEffect } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

### Intersection Observer

```typescript
"use client"

import { useEffect, useRef, useState } from "react"

export function usein ViewPort<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [isInViewport, setIsInViewport] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, isInViewport }
}
```

## Form Handling

### Controlled Form

```typescript
"use client"

import { useState, FormEvent } from "react"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Validate
      const validated = formSchema.parse({ email, password })

      // Submit
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      })

      if (!response.ok) throw new Error("Login failed")

      // Handle success
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  )
}
```

## Composition with Server Components

### Passing Server Data to Client

```typescript
// Server Component (page.tsx)
export default async function Page() {
  const serverData = await fetchDataOnServer()

  return (
    <div>
      <h1>Page Title</h1>
      {/* Pass serializable data to client component */}
      <ClientComponent data={serverData} />
    </div>
  )
}

// Client Component
"use client"

interface Props {
  data: SerializableData // Must be JSON-serializable
}

export function ClientComponent({ data }: Props) {
  const [localState, setLocalState] = useState(data)
  // Use state and interactivity
  return <div>{/* Interactive UI */}</div>
}
```

### Children Pattern

```typescript
// Server Component
export default async function Layout({ children }: { children: React.ReactNode }) {
  const serverData = await fetchData()

  return (
    <div>
      <ServerHeader data={serverData} />
      {/* Client component wraps children */}
      <ClientWrapper>{children}</ClientWrapper>
      <ServerFooter />
    </div>
  )
}

// Client Component
"use client"

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  // Add client-side interactivity without affecting children
  return <div className="interactive-wrapper">{children}</div>
}
```

## Anti-Patterns

❌ **Don't: Use "use client" unnecessarily**

```typescript
// BAD - No interactivity needed
"use client"

export function StaticContent() {
  return <div>Static text</div> // ❌ Doesn't need client
}
```

✅ **Do: Use Server Component for static content**

```typescript
// GOOD - Server Component by default
export function StaticContent() {
  return <div>Static text</div> // ✅ Server-rendered
}
```

❌ **Don't: Fetch data in useEffect when Server Component works**

```typescript
// BAD - Unnecessary client-side fetching
"use client"

export function DataComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch("/api/data").then(/* ... */) // ❌ Could be server-side
  }, [])

  return <div>{data}</div>
}
```

✅ **Do: Fetch in Server Component**

```typescript
// GOOD - Server-side fetching
export default async function DataComponent() {
  const data = await fetch("/api/data") // ✅ Server-side
  return <div>{data}</div>
}
```

❌ **Don't: Pass non-serializable props**

```typescript
// BAD
export default async function Page() {
  const handler = () => console.log("click") // ❌ Function

  return <ClientComponent onClick={handler} /> // ❌ Can't serialize
}
```

✅ **Do: Define handlers in client component**

```typescript
// GOOD
export default async function Page() {
  return <ClientComponent /> // ✅ Handler defined in client
}

"use client"
export function ClientComponent() {
  const handleClick = () => console.log("click") // ✅ In client
  return <button onClick={handleClick}>Click</button>
}
```

## Performance Optimization

### Memoization

```typescript
"use client"

import { useMemo, useCallback } from "react"

export function ExpensiveComponent({ data }: { data: Data[] }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map((item) => expensiveOperation(item))
  }, [data])

  // Memoize callbacks
  const handleClick = useCallback(() => {
    // Handler logic
  }, [])

  return <div>{/* Use processedData */}</div>
}
```

### Code Splitting

```typescript
"use client"

import { lazy, Suspense } from "react"

// Lazy load heavy component
const HeavyComponent = lazy(() => import("./heavy-component"))

export function Parent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## Testing Client Components

```typescript
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ChatInput } from "./chat-input"

describe("ChatInput", () => {
  it("should send message on Enter key", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<ChatInput onSendMessage={onSend} />)

    const input = screen.getByPlaceholderText(/type a message/i)
    await user.type(input, "Hello{Enter}")

    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith("Hello", undefined)
    })
  })

  it("should disable send when message is empty", () => {
    render(<ChatInput onSendMessage={vi.fn()} />)

    const button = screen.getByRole("button", { name: /send/i })
    expect(button).toBeDisabled()
  })
})
```

## Related Patterns

- [Server Component Pattern](server-component-pattern.md) - When to use server vs client
- [API Route Pattern](api-route-pattern.md) - Fetching data from client
- [Validation Pattern](validation-pattern.md) - Form validation

## External References

- [React Client Components](https://react.dev/reference/rsc/use-client)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

**Last Updated:** November 2025
