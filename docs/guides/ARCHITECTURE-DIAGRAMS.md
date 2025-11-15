# Architecture Diagrams

Visual representation of the system architecture, flows, and components.

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser]
        Mobile[Mobile Device]
    end

    subgraph "Application Layer - Next.js 15"
        Router[App Router]
        Pages[Server Components]
        API[API Routes]
        Middleware[Middleware<br/>Auth, Rate Limit, Security]
    end

    subgraph "Service Layer"
        ChatService[ChatService]
        Logger[Logger]
        ErrorHandler[Error Handler]
    end

    subgraph "External Services"
        VertexAI[Google Vertex AI<br/>Gemini 2.5]
        OAuth[Google OAuth]
        SecretMgr[Secret Manager]
    end

    subgraph "Infrastructure - Cloud Run"
        Container[Docker Container]
        Secrets[Mounted Secrets]
    end

    Browser --> Router
    Mobile --> Router
    Router --> Middleware
    Middleware --> Pages
    Middleware --> API
    Pages --> ChatService
    API --> ChatService
    ChatService --> VertexAI
    API --> OAuth
    Container --> Secrets
    Secrets --> SecretMgr
    ChatService --> Logger
    API --> ErrorHandler

    style VertexAI fill:#4285f4,color:#fff
    style OAuth fill:#34a853,color:#fff
    style SecretMgr fill:#fbbc04,color:#000
    style Container fill:#ea4335,color:#fff
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant M as Middleware
    participant N as NextAuth
    participant G as Google OAuth
    participant A as Allowlist

    U->>B: Click "Sign in with Google"
    B->>N: Initiate OAuth
    N->>G: Redirect to Google
    G->>G: User authenticates
    G->>N: Return with tokens
    N->>A: Check email in allowlist

    alt Email in Allowlist
        A->>N: ✅ Authorized
        N->>B: Create session
        B->>U: Redirect to chat
    else Email NOT in Allowlist
        A->>N: ❌ Unauthorized
        N->>B: Access denied
        B->>U: Show error message
    end

    Note over M: All subsequent requests<br/>check session validity
```

## Chat Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat Component
    participant A as /api/chat
    participant R as Rate Limiter
    participant S as ChatService
    participant V as Vertex AI

    U->>C: Type message + upload image
    C->>C: Validate input<br/>(size, format)
    C->>A: POST /api/chat
    A->>R: Check rate limit

    alt Rate Limit Exceeded
        R->>A: ❌ 429 Too Many Requests
        A->>C: Error response
        C->>U: Show rate limit message
    else Within Limits
        R->>A: ✅ Continue
        A->>A: Validate with Zod schema
        A->>S: streamChat(messages, image)
        S->>V: generateContentStream()

        loop Stream chunks
            V-->>S: Text chunk
            S-->>A: Transform chunk
            A-->>C: Server-Sent Event
            C-->>U: Update UI incrementally
        end

        V->>S: Stream complete
        S->>A: Close stream
        A->>C: Done
        C->>U: Final message rendered
    end
```

## Error Handling Flow

```mermaid
graph TD
    Start[Request Initiated] --> Middleware{Middleware<br/>Checks}
    Middleware -->|Security Headers| RateLimit{Rate Limit<br/>Check}
    Middleware -->|Failed| Error1[Return 401/403]

    RateLimit -->|Exceeded| Error2[Return 429<br/>Too Many Requests]
    RateLimit -->|OK| Auth{Authentication<br/>Check}

    Auth -->|No Session| Error3[Redirect to Login]
    Auth -->|Valid Session| Validate{Input<br/>Validation}

    Validate -->|Invalid| Error4[Return 400<br/>Validation Error]
    Validate -->|Valid| Service[Service Layer<br/>Execution]

    Service -->|Success| Response[Return Success<br/>200 OK]
    Service -->|Validation Error| Error5[Return 400<br/>Business Logic Error]
    Service -->|Auth Error| Error6[Return 401<br/>Unauthorized]
    Service -->|Not Found| Error7[Return 404<br/>Not Found]
    Service -->|Service Error| Error8[Return 503<br/>Service Unavailable]
    Service -->|Unknown Error| Error9[Return 500<br/>Internal Server Error]

    Error1 --> Log1[Log Warning]
    Error2 --> Log2[Log Warning]
    Error3 --> Log3[Log Info]
    Error4 --> Log4[Log Warning]
    Error5 --> Log5[Log Warning]
    Error6 --> Log6[Log Warning]
    Error7 --> Log7[Log Info]
    Error8 --> Log8[Log Error]
    Error9 --> Log9[Log Error]

    Log8 --> Alert[Alert if Critical]
    Log9 --> Alert

    style Error1 fill:#ff6b6b
    style Error2 fill:#ff6b6b
    style Error3 fill:#ffd93d
    style Error4 fill:#ff6b6b
    style Error5 fill:#ff6b6b
    style Error6 fill:#ff6b6b
    style Error7 fill:#ffd93d
    style Error8 fill:#ff0000,color:#fff
    style Error9 fill:#ff0000,color:#fff
    style Response fill:#51cf66
```

## Deployment Pipeline

```mermaid
graph LR
    subgraph "Developer Workflow"
        Dev[Developer]
        Local[Local Development]
        Commit[Git Commit]
    end

    subgraph "GitHub"
        PR[Pull Request]
        Main[Main Branch]
        Actions[GitHub Actions]
    end

    subgraph "CI Pipeline"
        Lint[Lint & Type Check]
        Test[Unit Tests]
        Build[Build Check]
    end

    subgraph "CD Pipeline"
        Docker[Build Docker Image]
        Registry[Artifact Registry]
        Deploy[Deploy to Cloud Run]
        Verify[Health Check]
    end

    subgraph "Production"
        CloudRun[Cloud Run Service]
        Domain[chat.daza.ar]
        Monitoring[Cloud Monitoring]
    end

    Dev --> Local
    Local --> Commit
    Commit --> PR
    PR --> Actions
    Actions --> Lint
    Actions --> Test
    Actions --> Build

    Lint --> Merge{Tests Pass?}
    Test --> Merge
    Build --> Merge

    Merge -->|Yes| Main
    Merge -->|No| PR

    Main --> Actions
    Actions --> Docker
    Docker --> Registry
    Registry --> Deploy
    Deploy --> Verify

    Verify -->|Success| CloudRun
    Verify -->|Failure| Rollback[Rollback]

    CloudRun --> Domain
    CloudRun --> Monitoring
    Rollback --> CloudRun

    style Merge fill:#ffd93d
    style CloudRun fill:#4285f4,color:#fff
    style Rollback fill:#ff6b6b
```

## Data Flow Diagram

```mermaid
flowchart TD
    subgraph Client["Client-Side (React 19)"]
        UI[UI Components]
        State[Client State]
        Hooks[Custom Hooks]
    end

    subgraph Server["Server-Side (Next.js 15)"]
        RSC[React Server Components]
        APIRoutes[API Routes]
        Services[Service Layer]
    end

    subgraph External["External Services"]
        VertexAI[Vertex AI API]
        OAuth[Google OAuth]
        Secrets[Secret Manager]
    end

    UI -->|User Input| Hooks
    Hooks -->|API Call| APIRoutes
    APIRoutes -->|Validate| Zod[Zod Schema]
    Zod -->|Valid| Services
    Services -->|Chat Request| VertexAI
    Services -->|Auth Check| OAuth
    APIRoutes -->|Env Vars| Secrets
    VertexAI -->|Stream Response| Services
    Services -->|Transform| APIRoutes
    APIRoutes -->|SSE| Hooks
    Hooks -->|Update State| State
    State -->|Re-render| UI
    RSC -->|Initial Data| UI

    style Zod fill:#3b82f6,color:#fff
    style VertexAI fill:#4285f4,color:#fff
    style OAuth fill:#34a853,color:#fff
```

## Component Hierarchy

```mermaid
graph TD
    Root[RootLayout<br/>Server Component]
    Providers[Providers<br/>Client Component]
    Header[Header<br/>Server Component]
    Page[Chat Page<br/>Server Component]

    Chat[Chat Component<br/>Client Component]
    History[ChatHistory<br/>Client Component]
    Input[MessageInput<br/>Client Component]
    Messages[ChatMessages<br/>Client Component]

    Message[ChatMessage<br/>Client Component]
    ImageDisplay[ImageDisplay<br/>Client Component]
    Markdown[MarkdownRenderer<br/>Client Component]

    Root --> Header
    Root --> Providers
    Providers --> Page
    Page --> Chat
    Chat --> History
    Chat --> Input
    Chat --> Messages
    Messages --> Message
    Message --> ImageDisplay
    Message --> Markdown

    style Root fill:#22c55e,color:#fff
    style Page fill:#22c55e,color:#fff
    style Header fill:#22c55e,color:#fff
    style Chat fill:#3b82f6,color:#fff
    style History fill:#3b82f6,color:#fff
    style Input fill:#3b82f6,color:#fff
    style Messages fill:#3b82f6,color:#fff
    style Message fill:#3b82f6,color:#fff
```

## Rate Limiting Architecture

```mermaid
graph TB
    Request[Incoming Request]
    Middleware[Middleware]
    RateLimiter[Rate Limiter<br/>rate-limiter-flexible]
    Memory[(In-Memory Store)]

    Request --> Middleware
    Middleware --> RateLimiter
    RateLimiter --> Memory
    Memory --> Check{Within Limit?}

    Check -->|Yes| Increment[Increment Counter]
    Check -->|No| Block[Return 429]

    Increment --> Continue[Continue to Handler]
    Block --> Headers[Set Retry-After Header]
    Headers --> Response[Error Response]

    Continue --> Handler[Route Handler]
    Handler --> Success[Success Response]

    style Memory fill:#6366f1,color:#fff
    style Block fill:#ff6b6b
    style Success fill:#51cf66
```

## Security Layers

```mermaid
graph TD
    Internet[Internet] --> CDN[Cloud CDN]
    CDN --> CloudRun[Cloud Run]

    CloudRun --> SecurityHeaders[Security Headers<br/>CSP, HSTS, X-Frame-Options]
    SecurityHeaders --> RateLimit[Rate Limiting<br/>5 req / 10s per IP]
    RateLimit --> Auth[Authentication<br/>NextAuth Session]
    Auth --> AuthZ[Authorization<br/>Email Allowlist]
    AuthZ --> Validation[Input Validation<br/>Zod Schemas]
    Validation --> Sanitization[Output Sanitization<br/>XSS Prevention]
    Sanitization --> SecureSecrets[Secure Secrets<br/>Secret Manager]
    SecureSecrets --> App[Application Logic]

    App --> Response[Response]

    style SecurityHeaders fill:#3b82f6,color:#fff
    style RateLimit fill:#8b5cf6,color:#fff
    style Auth fill:#ec4899,color:#fff
    style AuthZ fill:#f59e0b,color:#fff
    style Validation fill:#10b981,color:#fff
    style SecureSecrets fill:#ef4444,color:#fff
```

## Model Selection Flow

```mermaid
stateDiagram-v2
    [*] --> InitialState: Page Load
    InitialState --> LoadingModels: Fetch Available Models
    LoadingModels --> ModelsLoaded: Success
    LoadingModels --> LoadingError: API Error

    LoadingError --> Retry: User Retry
    Retry --> LoadingModels

    ModelsLoaded --> ModelSelected: User Selects Model
    ModelSelected --> ChatReady: Model Configured

    ChatReady --> Streaming: User Sends Message
    Streaming --> Processing: Vertex AI Processing
    Processing --> Streaming: Chunk Received
    Processing --> Complete: Stream Complete

    Complete --> ChatReady: Ready for Next Message

    ChatReady --> ModelChanged: User Changes Model
    ModelChanged --> ModelSelected
```

## Image Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Component
    participant V as Validator
    participant C as Converter
    participant API as API Route
    participant S as ChatService
    participant VA as Vertex AI

    U->>UI: Select image file
    UI->>V: Validate file

    alt Invalid File
        V->>UI: ❌ Validation Error
        UI->>U: Show error message
    else Valid File
        V->>UI: ✅ Valid
        UI->>C: Convert to base64
        C->>UI: Return data URL
        UI->>UI: Show preview
        U->>UI: Click send
        UI->>API: POST with image data
        API->>S: streamChat(message, imageData)
        S->>VA: Send with inline_data
        VA-->>S: Stream response
        S-->>API: Forward stream
        API-->>UI: SSE chunks
        UI-->>U: Display response
    end

    Note over V: Max 10MB<br/>JPEG/PNG/WebP/GIF
```

---

## Diagram Legend

- **Green boxes**: Server Components (rendered on server)
- **Blue boxes**: Client Components (interactive, browser)
- **Red boxes**: Error states
- **Yellow boxes**: Decision points or warnings

## Related Documentation

- [Architecture Summary](../.github/patterns/architecture-summary.md) - Detailed text description
- [API Documentation](../API.md) - API endpoint specifications
- [Deployment Guide](../deployment/DEPLOY.md) - Deployment process details

---

**Last Updated:** November 2025
**Maintained by:** Core Development Team
