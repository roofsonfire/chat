# Server Component Pattern

## Purpose

React Server Components (RSC) in Next.js 15 for optimal performance, reduced JavaScript bundle size, and direct data fetching.

## When to Use

- Building pages and layouts (default)
- Fetching data from databases or APIs
- Accessing backend resources directly
- Rendering static content
- SEO-critical pages

## When NOT to Use

- Need React hooks (useState, useEffect, etc.)
- Need browser APIs (window, localStorage, etc.)
- Need event handlers (onClick, onChange, etc.)
- Need real-time interactivity

## Structure

### Basic Server Component

```typescript
// No "use client" directive - Server Component by default
import { Suspense } from "react"

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params, searchParams }: PageProps) {
  // Fetch data directly - no useEffect needed
  const data = await fetchData(params.id)

  return (
    <div>
      <h1>{data.title}</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <DataDisplay data={data} />
      </Suspense>
    </div>
  )
}

// Helper function - can be in same file for Server Components
async function fetchData(id: string) {
  // Direct database or API access
  const response = await fetch(`https://api.example.com/data/${id}`, {
    cache: "no-store", // or 'force-cache' for static
  })

  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }

  return response.json()
}
```

### Server Component with Error Boundary

```typescript
import { Suspense } from "react"
import { notFound } from "next/navigation"

interface PostPageProps {
  params: { slug: string }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound() // Triggers not-found.tsx
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      <Suspense fallback={<div>Loading comments...</div>}>
        <Comments postId={post.id} />
      </Suspense>
    </article>
  )
}

async function Comments({ postId }: { postId: string }) {
  const comments = await fetchComments(postId)

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  )
}
```

## Real Example: Chat Home Page

**File:** `src/app/page.tsx`

```typescript
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth/config"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatHistory } from "@/components/chat/chat-history"
import { LoadingSkeleton } from "@/components/chat/loading-skeleton"

export default async function HomePage() {
  // Server-side auth check
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with history */}
        <Suspense fallback={<div className="w-64 bg-gray-100" />}>
          <ChatHistory userId={session.user.id} />
        </Suspense>

        {/* Main chat interface */}
        <div className="flex-1">
          <ChatInterface user={session.user} />
        </div>
      </div>
    </main>
  )
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "AI Chat Assistant",
    description: "Chat with AI using Google Vertex AI",
  }
}
```

## Data Fetching Patterns

### Static Data (Build Time)

```typescript
// Cached at build time
export default async function StaticPage() {
  const data = await fetch("https://api.example.com/data", {
    cache: "force-cache", // Default - cached forever
  })

  return <div>{/* Use data */}</div>
}

// Revalidate every hour
export const revalidate = 3600
```

### Dynamic Data (Request Time)

```typescript
// Fresh data on every request
export default async function DynamicPage() {
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store", // Always fresh
  })

  return <div>{/* Use data */}</div>
}

// Or use dynamic functions to opt out of caching
export const dynamic = "force-dynamic"
```

### Incremental Static Regeneration (ISR)

```typescript
export default async function ISRPage() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  return <div>{/* Use data */}</div>
}
```

## Parallel Data Fetching

```typescript
export default async function ParallelPage() {
  // Fetch in parallel for better performance
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments(),
  ])

  return (
    <div>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </div>
  )
}
```

## Streaming with Suspense

```typescript
import { Suspense } from "react"

export default function StreamingPage() {
  return (
    <div>
      {/* Immediately rendered */}
      <Header />

      {/* Streamed as ready */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>

      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>

      {/* Immediately rendered */}
      <Footer />
    </div>
  )
}

async function Posts() {
  const posts = await fetchPosts() // Slow query
  return <div>{/* Render posts */}</div>
}

async function Comments() {
  const comments = await fetchComments() // Slow query
  return <div>{/* Render comments */}</div>
}
```

## Composition with Client Components

```typescript
// Server Component (default)
import { ClientInteractive } from "@/components/client-interactive"

export default async function Page() {
  const data = await fetchData()

  return (
    <div>
      {/* Server-rendered content */}
      <h1>{data.title}</h1>

      {/* Client component for interactivity */}
      <ClientInteractive initialData={data} />

      {/* More server-rendered content */}
      <Footer />
    </div>
  )
}
```

## Anti-Patterns

❌ **Don't: Use hooks in Server Components**

```typescript
// BAD - This will error
export default async function Page() {
  const [state, setState] = useState(null) // ❌ Can't use hooks
  useEffect(() => {}, []) // ❌ Can't use effects

  return <div>Content</div>
}
```

✅ **Do: Move interactivity to Client Components**

```typescript
// GOOD - Server Component
export default async function Page() {
  const data = await fetchData()

  return (
    <div>
      <h1>Server Content</h1>
      <InteractiveClient data={data} />
    </div>
  )
}

// Client Component in separate file
"use client"
function InteractiveClient({ data }) {
  const [state, setState] = useState(data)
  // Use hooks freely
}
```

❌ **Don't: Pass functions as props**

```typescript
// BAD - Functions can't be serialized
export default async function Page() {
  const handleClick = () => console.log("clicked")

  return <ClientComponent onClick={handleClick} /> // ❌ Error
}
```

✅ **Do: Define handlers in Client Components**

```typescript
// GOOD
export default async function Page() {
  return <ClientComponent /> // ✅ Handler defined in client
}

"use client"
function ClientComponent() {
  const handleClick = () => console.log("clicked")
  return <button onClick={handleClick}>Click</button>
}
```

❌ **Don't: Use browser APIs**

```typescript
// BAD
export default async function Page() {
  const data = localStorage.getItem("key") // ❌ No browser APIs
  return <div>{data}</div>
}
```

✅ **Do: Use Client Components for browser APIs**

```typescript
// GOOD
export default async function Page() {
  return <ClientWithStorage />
}

"use client"
function ClientWithStorage() {
  const data = localStorage.getItem("key") // ✅ OK in client
  return <div>{data}</div>
}
```

## Loading States

### Page-Level Loading

**File:** `app/page/loading.tsx`

```typescript
export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
    </div>
  )
}
```

### Component-Level Loading

```typescript
import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SlowComponent />
    </Suspense>
  )
}
```

## Error Handling

**File:** `app/page/error.tsx`

```typescript
"use client" // Error components must be Client Components

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

## Benefits of Server Components

1. **Reduced JavaScript** - Less code sent to client
2. **Better Performance** - No hydration cost for static content
3. **Direct Data Access** - Fetch from databases directly
4. **Better SEO** - Fully rendered HTML
5. **Automatic Code Splitting** - Only load what's needed
6. **Security** - Keep sensitive code on server

## Related Patterns

- [Client Component Pattern](client-component-pattern.md) - When to use client components
- [API Route Pattern](api-route-pattern.md) - Backend API endpoints
- [Error Handling Pattern](error-handling-pattern.md) - Error boundaries

## External References

- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Data Fetching in Next.js](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**Last Updated:** November 2025
