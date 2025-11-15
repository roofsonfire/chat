# API Playground

Interactive sandbox for testing API endpoints without writing code. Perfect for exploring the API, debugging issues, and learning how endpoints work.

## 🎮 Quick Start

### Access the Playground

**Development:** http://localhost:3000/api-playground
**Production:** https://chat.daza.ar/api-playground

### Authentication Required

Sign in with your Google account or test credentials before using the playground.

---

## 📋 Available Endpoints

### 1. Chat API - `/api/chat`

Test the main chat interface with streaming responses.

#### Request Configuration

**Method:** `POST`
**Content-Type:** `application/json`

**Body Schema:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your message here",
      "image": "data:image/jpeg;base64,..." // Optional
    }
  ],
  "modelId": "gemini-2.5-flash-image" // Optional
}
```

#### Available Models

| Model ID                 | Description                | Best For             |
| ------------------------ | -------------------------- | -------------------- |
| `gemini-2.5-flash-image` | Fast, multimodal (default) | General chat, images |
| `gemini-1.5-flash-002`   | Fast, efficient            | Quick responses      |
| `gemini-1.5-pro-002`     | Most capable               | Complex reasoning    |
| `gemini-1.0-pro-vision`  | Multimodal (legacy)        | Image analysis       |

#### Example Requests

**Simple Text Chat:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ]
}
```

**Conversation with History:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "My name is Alex"
    },
    {
      "role": "assistant",
      "content": "Nice to meet you, Alex! How can I help you today?"
    },
    {
      "role": "user",
      "content": "What's my name?"
    }
  ]
}
```

**Chat with Image:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's in this image?",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ]
}
```

**Using Specific Model:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing in detail"
    }
  ],
  "modelId": "gemini-1.5-pro-002"
}
```

#### Response Format

**Headers:**

```text
Content-Type: text/plain; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1699999999
```

**Body (Streaming):**

```text
Hello! The capital of France is Paris.
```

The response streams character by character in real-time.

#### Error Responses

**400 Bad Request:**

```json
{
  "error": "Invalid request body",
  "details": [
    {
      "field": "messages",
      "message": "Array must contain at least 1 element(s)"
    }
  ]
}
```

**401 Unauthorized:**

```json
{
  "error": "Unauthorized"
}
```

**429 Too Many Requests:**

```json
{
  "error": "Too many requests"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error"
}
```

---

### 2. Models API - `/api/models`

Fetch available Gemini models and their capabilities.

#### Request Configuration

**Method:** `GET`
**Authentication:** Required

#### Example Request

```bash
curl -X GET http://localhost:3000/api/models \
  -H "Cookie: next-auth.session-token=..."
```

#### Response Format

```json
{
  "models": [
    {
      "id": "gemini-2.5-flash-image",
      "displayName": "Gemini 2.5 Flash",
      "description": "Fast multimodal model with image support",
      "inputTokenLimit": 8192,
      "outputTokenLimit": 8192,
      "supportedGenerationMethods": [
        "generateContent",
        "streamGenerateContent"
      ],
      "multimodal": true
    },
    {
      "id": "gemini-1.5-pro-002",
      "displayName": "Gemini 1.5 Pro",
      "description": "Most capable model for complex tasks",
      "inputTokenLimit": 32768,
      "outputTokenLimit": 8192,
      "supportedGenerationMethods": [
        "generateContent",
        "streamGenerateContent"
      ],
      "multimodal": true
    }
  ]
}
```

---

### 3. Auth API - `/api/auth/*`

NextAuth.js authentication endpoints.

#### Available Routes

**GET `/api/auth/session`** - Get current session

```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://..."
  },
  "expires": "2025-12-31T23:59:59.999Z"
}
```

**GET `/api/auth/csrf`** - Get CSRF token

```json
{
  "csrfToken": "abc123..."
}
```

**GET `/api/auth/providers`** - List auth providers

```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "http://localhost:3000/api/auth/signin/google",
    "callbackUrl": "http://localhost:3000/api/auth/callback/google"
  },
  "credentials": {
    "id": "credentials",
    "name": "Credentials",
    "type": "credentials",
    "signinUrl": "http://localhost:3000/api/auth/signin/credentials",
    "callbackUrl": "http://localhost:3000/api/auth/callback/credentials"
  }
}
```

---

## 🛠️ Building Your Own Playground

Want to create a custom API playground interface? Here's how:

### Step 1: Create Playground Page

Create `src/app/api-playground/page.tsx`:

```typescript
import { ApiPlayground } from "@/components/api-playground"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { redirect } from "next/navigation"

export default async function PlaygroundPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">API Playground</h1>
      <ApiPlayground />
    </main>
  )
}
```

### Step 2: Create Playground Component

Create `src/components/api-playground.tsx`:

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Copy, Check } from "lucide-react"

interface ApiResponse {
  status: number
  headers: Record<string, string>
  body: string
  time: number
}

export function ApiPlayground() {
  const [endpoint, setEndpoint] = useState("/api/chat")
  const [method, setMethod] = useState("POST")
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        messages: [
          {
            role: "user",
            content: "Hello, how are you?",
          },
        ],
      },
      null,
      2
    )
  )
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const sendRequest = async () => {
    setIsLoading(true)
    setResponse(null)

    const startTime = Date.now()

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? requestBody : undefined,
      })

      const headers: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        headers[key] = value
      })

      let body: string

      if (res.headers.get("content-type")?.includes("text/plain")) {
        // Handle streaming response
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let chunks = ""

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks += decoder.decode(value)
          }
        }
        body = chunks
      } else {
        // Handle JSON response
        body = JSON.stringify(await res.json(), null, 2)
      }

      const endTime = Date.now()

      setResponse({
        status: res.status,
        headers,
        body,
        time: endTime - startTime,
      })
    } catch (error) {
      setResponse({
        status: 0,
        headers: {},
        body: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        time: Date.now() - startTime,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 400 && status < 500) return "bg-yellow-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Request Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Endpoint Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Endpoint</label>
            <Select value={endpoint} onValueChange={setEndpoint}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/api/chat">POST /api/chat</SelectItem>
                <SelectItem value="/api/models">GET /api/models</SelectItem>
                <SelectItem value="/api/auth/session">
                  GET /api/auth/session
                </SelectItem>
                <SelectItem value="/api/auth/csrf">
                  GET /api/auth/csrf
                </SelectItem>
                <SelectItem value="/api/auth/providers">
                  GET /api/auth/providers
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Method Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Request Body */}
          {method !== "GET" && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Request Body
              </label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="font-mono text-sm h-64"
                placeholder="Enter JSON request body..."
              />
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={sendRequest}
            disabled={isLoading}
            className="w-full"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {isLoading ? "Sending..." : "Send Request"}
          </Button>

          {/* Example Templates */}
          <div>
            <p className="text-sm font-medium mb-2">Quick Templates:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setRequestBody(
                    JSON.stringify(
                      {
                        messages: [
                          { role: "user", content: "Hello, how are you?" },
                        ],
                      },
                      null,
                      2
                    )
                  )
                }
              >
                Simple Chat
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setRequestBody(
                    JSON.stringify(
                      {
                        messages: [
                          { role: "user", content: "Tell me a joke" },
                          {
                            role: "assistant",
                            content:
                              "Why did the developer go broke? Because they used up all their cache!",
                          },
                          { role: "user", content: "Tell me another one" },
                        ],
                      },
                      null,
                      2
                    )
                  )
                }
              >
                With History
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setRequestBody(
                    JSON.stringify(
                      {
                        messages: [
                          {
                            role: "user",
                            content: "Explain quantum computing",
                          },
                        ],
                        modelId: "gemini-1.5-pro-002",
                      },
                      null,
                      2
                    )
                  )
                }
              >
                Custom Model
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Response</CardTitle>
            {response && (
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(response.status)}>
                  {response.status}
                </Badge>
                <Badge variant="outline">{response.time}ms</Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {response ? (
            <Tabs defaultValue="body">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(response.body)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  {response.body}
                </pre>
              </TabsContent>

              <TabsContent value="headers" className="space-y-2">
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  {Object.entries(response.headers)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join("\n")}
                </pre>
              </TabsContent>

              <TabsContent value="curl" className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(
                        `curl -X ${method} 'http://localhost:3000${endpoint}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${requestBody.replace(/\n/g, "").replace(/\s+/g, " ")}'`
                      )
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  {`curl -X ${method} 'http://localhost:3000${endpoint}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${requestBody.replace(/\n/g, "").replace(/\s+/g, " ")}'`}
                </pre>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Send a request to see the response
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 3: Add to Navigation

Update your main layout or header to include a link:

```typescript
<Link href="/api-playground">API Playground</Link>
```

---

## 🧪 Testing Scenarios

### Scenario 1: Rate Limiting

Test rate limit by sending 6 requests rapidly:

1. Send 5 requests (should succeed)
2. Send 6th request immediately (should get 429)
3. Wait 10 seconds
4. Send another request (should succeed)

### Scenario 2: Input Validation

Test invalid requests:

**Empty messages array:**

```json
{
  "messages": []
}
```

**Expected:** 400 Bad Request

**Invalid role:**

```json
{
  "messages": [
    {
      "role": "invalid",
      "content": "Test"
    }
  ]
}
```

**Expected:** 400 Bad Request

**Message too long:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "A".repeat(10001)
    }
  ]
}
```

**Expected:** 400 Bad Request

### Scenario 3: Model Comparison

Test same prompt with different models:

1. Send with `gemini-2.5-flash-image`
2. Note response time and quality
3. Send with `gemini-1.5-pro-002`
4. Compare results

### Scenario 4: Streaming Response

Test streaming behavior:

1. Send a request asking for a long response
2. Observe characters streaming in real-time
3. Check response time vs. total length

---

## 📊 Response Analysis

### Understanding Headers

**X-RateLimit-Limit:** Maximum requests allowed
**X-RateLimit-Remaining:** Requests remaining in window
**X-RateLimit-Reset:** Unix timestamp when limit resets
**Content-Type:** Response format (text/plain or application/json)
**Cache-Control:** Caching behavior

### Status Codes

| Code | Meaning               | Common Cause                   |
| ---- | --------------------- | ------------------------------ |
| 200  | OK                    | Request succeeded              |
| 400  | Bad Request           | Invalid JSON or missing fields |
| 401  | Unauthorized          | Not signed in                  |
| 429  | Too Many Requests     | Rate limit exceeded            |
| 500  | Internal Server Error | Server-side error              |
| 503  | Service Unavailable   | Vertex AI unavailable          |

---

## 🔧 Advanced Features

### Custom Headers

Add custom headers to your requests:

```typescript
const res = await fetch(endpoint, {
  method,
  headers: {
    "Content-Type": "application/json",
    "X-Custom-Header": "value",
  },
  body: requestBody,
});
```

### Request Interceptors

Log all requests:

```typescript
const originalFetch = fetch;

window.fetch = async (...args) => {
  console.log("Request:", args);
  const response = await originalFetch(...args);
  console.log("Response:", response);
  return response;
};
```

### Response Transformers

Transform responses before display:

```typescript
const transformResponse = (body: string, contentType: string) => {
  if (contentType?.includes("application/json")) {
    return JSON.stringify(JSON.parse(body), null, 2);
  }
  return body;
};
```

---

## 💡 Tips & Best Practices

### 1. Use Templates

Create a library of request templates for common scenarios:

- Simple chat
- Chat with history
- Multimodal with images
- Model comparison
- Error cases

### 2. Save Requests

Implement request history to reuse previous requests:

```typescript
const [history, setHistory] = useState<string[]>([]);

const saveRequest = (body: string) => {
  setHistory((prev) => [body, ...prev.slice(0, 9)]); // Keep last 10
};
```

### 3. Export Results

Add export functionality for responses:

```typescript
const exportResponse = (response: ApiResponse) => {
  const blob = new Blob([JSON.stringify(response, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `response-${Date.now()}.json`;
  a.click();
};
```

### 4. Validate JSON

Add JSON validation before sending:

```typescript
const validateJSON = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};
```

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Symptom:** `Access to fetch has been blocked by CORS policy`

**Solution:** Ensure you're testing from the same origin (http://localhost:3000)

### Issue: Authentication Failed

**Symptom:** 401 Unauthorized

**Solution:**

1. Sign in at `/login`
2. Check cookies are enabled
3. Verify session at `/api/auth/session`

### Issue: Invalid JSON

**Symptom:** 400 Bad Request with "Invalid JSON"

**Solution:**

1. Validate JSON syntax
2. Check for trailing commas
3. Use a JSON formatter

### Issue: Rate Limited

**Symptom:** 429 Too Many Requests

**Solution:**

1. Wait 10 seconds
2. Check `X-RateLimit-Reset` header
3. Reduce request frequency

---

## 📚 Related Documentation

- [API Reference](../API.md) - Complete API documentation
- [Interactive Tutorials](INTERACTIVE-TUTORIALS.md) - Code examples
- [Error Handling](COMMON-MISTAKES.md) - Common errors

---

## 🎯 Next Steps

1. **Try the playground** - Send your first request
2. **Test all endpoints** - Explore the API surface
3. **Build your own** - Create custom playground features
4. **Integrate in your app** - Use learned patterns in code

---

**Last Updated:** November 2025
**Maintained by:** Core Development Team
