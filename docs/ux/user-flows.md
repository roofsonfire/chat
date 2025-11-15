# User Flows Documentation

This document defines and maps the core user flows for the AI Chat Assistant application.

## Overview

The application provides an AI-powered chat interface with multimodal support (text + images). Users can have conversations with Google's Gemini AI models through a clean, intuitive interface.

## Table of Contents

1. [Happy Path: Send Text Message](#1-happy-path-send-text-message)
2. [Happy Path: Send Message with Image](#2-happy-path-send-message-with-image)
3. [Error Handling: API Error Flow](#3-error-handling-api-error-flow)
4. [New Conversation Flow](#4-new-conversation-flow)

---

## 1. Happy Path: Send Text Message

### User Story

As a user, I want to send a text message to the AI assistant and receive a response.

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as Chat Interface
    participant Input as Message Input
    participant Hook as useChat Hook
    participant API as /api/chat
    participant AI as Vertex AI (Gemini)

    User->>UI: Opens chat application
    UI->>User: Shows empty state with suggested prompts

    User->>Input: Types message
    Input->>Input: Updates input state

    User->>Input: Presses Enter or clicks Send
    Input->>Hook: handleSubmit(e)

    Hook->>Hook: Validates input (not empty)
    Hook->>UI: Adds user message to chat
    Hook->>UI: Shows message in chat history
    Hook->>UI: Clears input field
    Hook->>UI: Shows loading skeleton

    Hook->>API: POST /api/chat<br/>{messages, modelId}
    API->>API: Validates auth session
    API->>API: Validates request body (Zod)
    API->>API: Checks rate limit (5/10s)

    API->>AI: generateContentStream()
    AI-->>API: Stream response chunks

    loop For each chunk
        API-->>Hook: SSE: data: {text}
        Hook->>Hook: Parse stream chunk
        Hook->>UI: Update assistant message
        UI->>User: Shows streaming response
    end

    AI-->>API: Stream complete (STOP)
    API-->>Hook: Close stream
    Hook->>UI: Hides loading skeleton
    Hook->>UI: Finalizes assistant message
    UI->>User: Shows complete response
```

### Steps

1. **Initial State**
   - User lands on chat interface
   - Empty state displayed with suggested prompts
   - Input field is focused and ready

2. **Message Input**
   - User types message in textarea
   - Character count updates (if implemented)
   - Send button becomes enabled

3. **Message Submission**
   - User presses `Ctrl+Enter` or clicks Send button
   - `handleSubmit()` is triggered
   - Input validation occurs (non-empty check)

4. **Optimistic UI Update**
   - User message immediately added to chat history
   - Input field cleared
   - Loading skeleton appears below last message
   - Input remains disabled during loading

5. **API Request**
   - `POST /api/chat` with messages array
   - Request includes selected model ID
   - Auth session verified
   - Rate limit checked

6. **Streaming Response**
   - Server-Sent Events (SSE) stream initiated
   - Each chunk parsed and text extracted
   - Assistant message updates in real-time
   - User sees response appear word-by-word

7. **Completion**
   - Stream closes when AI finishes
   - Loading skeleton removed
   - Complete message displayed
   - Input re-enabled for next message

### UI States

| State     | UI Elements                                 |
| --------- | ------------------------------------------- |
| Empty     | EmptyState component with suggested prompts |
| Ready     | Input enabled, Send button ready            |
| Typing    | Input updates, character count (optional)   |
| Sending   | Loading skeleton, input disabled            |
| Streaming | Text appears incrementally                  |
| Complete  | Full response visible, input re-enabled     |

---

## 2. Happy Path: Send Message with Image

### User Story

As a user, I want to send an image along with text to get visual analysis from the AI.

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as Chat Interface
    participant Input as Message Input
    participant Upload as Image Upload
    participant Hook as useChat Hook
    participant API as /api/chat
    participant AI as Vertex AI (Gemini)

    User->>Input: Types message
    User->>Upload: Clicks image upload button
    Upload->>Upload: Opens file picker

    User->>Upload: Selects image file
    Upload->>Upload: Validates file type<br/>(JPEG, PNG, WebP, GIF)
    Upload->>Upload: Validates file size (<10MB)

    alt Valid Image
        Upload->>Upload: Reads file as base64
        Upload->>Hook: setImage(base64DataURL)
        Hook->>UI: Shows image preview
        UI->>User: Displays thumbnail with remove button
    else Invalid Image
        Upload->>UI: Shows InlineError
        UI->>User: "Invalid file type/size"
    end

    User->>Input: Presses Enter or clicks Send
    Input->>Hook: handleSubmit(e)

    Hook->>Hook: Validates input || image
    Hook->>UI: Adds user message with image
    Hook->>UI: Shows message with image thumbnail
    Hook->>UI: Clears input and image
    Hook->>UI: Shows loading skeleton

    Hook->>API: POST /api/chat<br/>{messages: [{content, image}], modelId}
    API->>API: Validates auth & rate limit
    API->>API: Validates base64 image data

    API->>AI: generateContentStream()<br/>with image part
    AI-->>API: Stream response chunks

    loop For each chunk
        API-->>Hook: SSE: data: {text}
        Hook->>UI: Update assistant message
        UI->>User: Shows streaming response
    end

    AI-->>API: Stream complete
    API-->>Hook: Close stream
    Hook->>UI: Hides loading skeleton
    UI->>User: Shows visual analysis response
```

### Steps

1. **Image Selection**
   - User clicks image upload button (📎 icon)
   - File picker opens (accept: image/\*)
   - User selects image file

2. **Image Validation**
   - Client-side validation:
     - File type: JPEG, PNG, WebP, GIF
     - File size: < 10MB
   - If invalid, show InlineError with reason

3. **Image Preview**
   - Valid image converted to base64 data URL
   - Thumbnail preview shown in input area
   - Remove button (❌) available to clear image

4. **Message Submission**
   - User can send message with or without text
   - Validation: `input || image` must be truthy
   - Both text and image included in message object

5. **API Request**
   - Image sent as base64 in message object
   - Server validates image format
   - Vertex AI receives both text and image parts

6. **Response**
   - AI analyzes image content
   - Streams response with visual analysis
   - Same streaming UX as text-only messages

### Image Handling

```typescript
// Message structure with image
{
  role: "user",
  content: "What's in this image?",
  image: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  timestamp: new Date()
}
```

### UI States

| State          | UI Elements                       |
| -------------- | --------------------------------- |
| No Image       | Upload button visible, no preview |
| Image Selected | Thumbnail preview, remove button  |
| Uploading      | Loading indicator (if async)      |
| Invalid        | InlineError with reason           |
| Sent           | Image thumbnail in message bubble |

---

## 3. Error Handling: API Error Flow

### User Story

As a user, when an error occurs, I want clear feedback and options to recover.

### Flow Diagram

```mermaid
flowchart TD
    Start([User sends message]) --> Submit[handleSubmit triggered]
    Submit --> AddMsg[Add user message to UI]
    AddMsg --> Loading[Show loading skeleton]
    Loading --> API[POST /api/chat]

    API --> Check{Request Type}

    Check -->|Auth Error| Auth[401/403 Response]
    Check -->|Rate Limit| Rate[429 Response]
    Check -->|Network Error| Network[Fetch fails]
    Check -->|Timeout| Timeout[Request timeout]
    Check -->|AI Error| AIError[503 from Vertex AI]
    Check -->|Success| Success[Stream response]

    Auth --> ErrorHandler[useChatErrorHandler]
    Rate --> ErrorHandler
    Network --> ErrorHandler
    Timeout --> ErrorHandler
    AIError --> ErrorHandler

    ErrorHandler --> Classify{Classify Error}

    Classify -->|Auth| AuthMsg["'Authentication issue.<br/>Please refresh the page.'"]
    Classify -->|Rate Limit| RateMsg["'Too many requests.<br/>Please wait a moment.'"]
    Classify -->|Network| NetMsg["'Connection issue.<br/>Check your internet.'"]
    Classify -->|Timeout| TimeMsg["'Request timed out.<br/>Please try again.'"]
    Classify -->|Unknown| GenMsg["'An error occurred.<br/>Please try again.'"]

    AuthMsg --> AddError[Add error message to chat]
    RateMsg --> AddError
    NetMsg --> AddError
    TimeMsg --> AddError
    GenMsg --> AddError

    AddError --> ShowError[Display as assistant message]
    ShowError --> HideLoad[Hide loading skeleton]
    HideLoad --> Enable[Re-enable input]
    Enable --> End([User can retry])

    Success --> Stream[Stream response normally]
    Stream --> Complete[Show complete message]
    Complete --> End

    style Auth fill:#ffcccc
    style Rate fill:#ffcccc
    style Network fill:#ffcccc
    style Timeout fill:#ffcccc
    style AIError fill:#ffcccc
    style Success fill:#ccffcc
```

### Error Types and Messages

| Error Type         | HTTP Code         | User Message                                                                                 | Recovery Action           |
| ------------------ | ----------------- | -------------------------------------------------------------------------------------------- | ------------------------- |
| **Authentication** | 401, 403          | "There appears to be an authentication issue. Please refresh the page and try again."        | Refresh page, re-login    |
| **Rate Limit**     | 429               | "I'm receiving too many requests right now. Please wait a moment and try again."             | Wait 10 seconds, retry    |
| **Network**        | N/A (fetch fails) | "There seems to be a connection issue. Please check your internet connection and try again." | Check connection, retry   |
| **Timeout**        | N/A (timeout)     | "The request timed out. Please try again."                                                   | Retry immediately         |
| **AI Service**     | 503               | "The AI service is temporarily unavailable. Please try again in a moment."                   | Wait, retry               |
| **Unknown**        | 500, others       | "Sorry, I encountered an error processing your request. Please try again."                   | Retry, report if persists |

### Error Handling Code Flow

```typescript
// In use-chat-error-handler.ts
try {
  const response = await sendChatRequest(messages, selectedModel);
  await parseStream(response, setMessages);
} catch (error) {
  handleChatError(error, setMessages);
  // Error message added to chat as assistant message
  // User can see error and continue conversation
} finally {
  setIsLoading(false); // Always re-enable input
}
```

### UI Error States

1. **Inline Error** (validation)
   - Used for client-side validation
   - Example: "Message cannot be empty"
   - Shown below input field

2. **Error Message** (API errors)
   - Added to chat as assistant message
   - Clearly indicates it's an error
   - Maintains conversation context

3. **ErrorState Component** (critical failures)
   - Full-page error for unrecoverable issues
   - Provides retry and go home options
   - Used for auth failures, critical bugs

### Recovery Options

- **Automatic**: Error added to chat, input re-enabled
- **Manual Retry**: User can retype/resend message
- **Refresh**: For auth issues (preserved in error message)
- **Wait**: For rate limits (timer could be added)

---

## 4. New Conversation Flow

### User Story

As a user, I want to start a fresh conversation without previous context.

### Flow Diagram

```mermaid
flowchart TD
    Start([User opens app]) --> HasSession{Has valid<br/>session?}

    HasSession -->|No| Login[Redirect to /login]
    Login --> OAuth[Google OAuth flow]
    OAuth --> Allowlist{Email in<br/>allowlist?}
    Allowlist -->|No| Denied[Access denied]
    Allowlist -->|Yes| CreateSession[Create JWT session]
    CreateSession --> LoadApp

    HasSession -->|Yes| LoadApp[Load Chat Interface]

    LoadApp --> CheckHistory{Has message<br/>history?}

    CheckHistory -->|No| ShowEmpty[Show EmptyState]
    CheckHistory -->|Yes| ShowHistory[Show ChatHistory]

    ShowEmpty --> Welcome["Display:
    - Welcome message
    - Sparkles icon
    - Suggested prompts
    - Image upload tip"]

    Welcome --> UserAction{User Action}

    UserAction -->|Types message| FirstMsg[Send first message]
    UserAction -->|Clicks prompt| FillInput[Pre-fill input]
    UserAction -->|Uploads image| ShowPreview[Show image preview]

    FillInput --> FirstMsg
    ShowPreview --> FirstMsg

    FirstMsg --> AddToHistory[Message added to history]
    AddToHistory --> APICall[API call initiated]
    APICall --> Response[Receive AI response]
    Response --> ConvStarted[Conversation started]

    ShowHistory --> ExistingConv[Continue existing conversation]

    ExistingConv --> ClearOption{User wants<br/>fresh start?}

    ClearOption -->|Yes - Command Palette| CmdK["⌘K → New Conversation"]
    ClearOption -->|Yes - Sidebar| Sidebar[Settings → Clear History]
    ClearOption -->|No| Continue[Continue chatting]

    CmdK --> Confirm{Confirm<br/>clear?}
    Sidebar --> Confirm

    Confirm -->|Yes| ClearMessages[clearHistory called]
    Confirm -->|No| Cancel[Return to chat]

    ClearMessages --> EmptyMessages[messages = empty array]
    EmptyMessages --> ShowEmpty

    Continue --> AddMsg[Add new message]
    AddMsg --> ConvStarted

    ConvStarted --> End([Active conversation])
    Denied --> End
    Cancel --> End

    style ShowEmpty fill:#e1f5ff
    style Welcome fill:#e1f5ff
    style ConvStarted fill:#ccffcc
    style Denied fill:#ffcccc
```

### Scenarios

#### Scenario A: First-Time User (No History)

1. **Authentication**
   - User opens application
   - Redirected to `/login` if no session
   - Google OAuth flow initiated
   - Email checked against allowlist
   - Session created if authorized

2. **Initial Load**
   - Chat interface loads
   - No messages in history
   - EmptyState component displayed

3. **EmptyState Features**
   - Welcoming heading: "Start a Conversation"
   - Friendly description
   - 4 suggested prompts:
     - "Explain quantum computing in simple terms"
     - "Write a creative story about a robot"
     - "Help me debug this TypeScript code"
     - "Suggest ideas for a mobile app"
   - Tip about image uploads

4. **First Interaction**
   - User types message or clicks suggested prompt
   - If prompt clicked, input field pre-filled
   - User sends message (Enter or Send button)
   - Empty state replaced with chat history
   - Conversation begins

#### Scenario B: Returning User (Has History)

1. **Load Existing Conversation**
   - User returns to application
   - Session cookie validates automatically
   - ChatHistory component loads
   - Previous messages displayed
   - Scroll positioned at bottom

2. **Continue Conversation**
   - User can immediately add new messages
   - Context from previous messages maintained
   - No interruption to flow

#### Scenario C: Start Fresh (Clear History)

1. **User Triggers Clear**
   - **Option 1**: Command Palette (`⌘K` or `Ctrl+K`)
     - Opens command dialog
     - User types or selects "New Conversation"
     - Confirmation dialog appears
   - **Option 2**: Sidebar Menu
     - Opens sidebar (hamburger or trigger)
     - Navigates to Settings → Chat Settings
     - Clicks "Clear History"
     - Confirmation dialog appears

2. **Confirmation Dialog**
   - AlertDialog component shown
   - Title: "Clear Chat History"
   - Description: "This action cannot be undone. This will permanently delete all messages in this conversation."
   - Actions:
     - "Cancel" button (returns to chat)
     - "Clear History" button (destructive variant)

3. **Clear Execution**
   - User confirms clear
   - `clearHistory()` called in useChat hook
   - Messages array set to empty: `setMessages([])`
   - Session storage cleared (if implemented)

4. **Return to Empty State**
   - Chat interface transitions to EmptyState
   - Suggested prompts reappear
   - User can start fresh conversation

### State Management

```typescript
// In use-chat-state.ts
const [messages, setMessages] = useState<Message[]>([]);

const clearHistory = () => {
  setMessages([]); // Reset to empty array
  // Optional: Clear from session storage
  // sessionStorage.removeItem('chat-messages');
};
```

### UI Transitions

| From    | To      | Trigger       | Transition                    |
| ------- | ------- | ------------- | ----------------------------- |
| Empty   | History | First message | EmptyState → ChatHistory      |
| History | Empty   | Clear history | Fade out → EmptyState fade in |
| Login   | Empty   | Auth success  | Redirect → EmptyState         |
| Login   | Login   | Auth fail     | Error message display         |

---

## Additional UX Patterns

### Loading States

- **Page Load**: Skeleton for entire chat interface
- **Message Send**: LoadingSkeleton for AI response
- **Model Switch**: Brief loading indicator
- **Image Upload**: Spinner during file read

### Keyboard Shortcuts

| Shortcut                 | Action               |
| ------------------------ | -------------------- |
| `Enter`                  | New line in message  |
| `Ctrl+Enter` / `⌘+Enter` | Send message         |
| `⌘K` / `Ctrl+K`          | Open command palette |
| `Esc`                    | Close dialogs/modals |

### Accessibility

- **Focus Management**: Input auto-focused on load/clear
- **Keyboard Navigation**: All actions accessible via keyboard
- **Screen Readers**: Proper ARIA labels on components
- **Loading Indicators**: Announce when message is being generated

### Mobile Considerations

- **Touch Targets**: Minimum 44x44px for buttons
- **Responsive Layout**: Sidebar collapses on mobile
- **Input Behavior**: Virtual keyboard doesn't obscure input
- **Image Upload**: Native file picker on mobile

---

## Implementation Status

### Completed ✅

- [x] Core chat messaging flow
- [x] Image upload and preview
- [x] Error handling system
- [x] Loading states (Issue #107)
- [x] Empty states (Issue #107)
- [x] Command palette
- [x] Clear history confirmation
- [x] Authentication flow

### In Progress 🚧

- [ ] User flow documentation (this document)

### Future Enhancements 🔮

- [ ] Conversation history persistence (database)
- [ ] Multiple conversation threads
- [ ] Message export formats (PDF, Markdown)
- [ ] Voice input support
- [ ] Code syntax highlighting in responses
- [ ] Citation links for AI responses

---

## References

### Related Documentation

- [API Documentation](../API.md) - Endpoint specifications
- [Error Handling Pattern](../.github/patterns/error-handling-pattern.md) - Error architecture
- [Component Documentation](../components/) - UI component specs

### Related Issues

- [Epic #105](https://github.com/roofsonfire/chat/issues/105) - UI/UX Refinement
- [Issue #107](https://github.com/roofsonfire/chat/issues/107) - Loading/Empty/Error States
- [Issue #108](https://github.com/roofsonfire/chat/issues/108) - Design Token System
- [Issue #109](https://github.com/roofsonfire/chat/issues/109) - 8pt Grid System
- [Issue #111](https://github.com/roofsonfire/chat/issues/111) - Theme Customization

### Tools Used

- **Mermaid**: Flow diagrams and sequence diagrams
- **Markdown**: Documentation format
- **GitHub Issues**: Requirements tracking

---

**Document Version**: 1.0  
**Last Updated**: November 12, 2025  
**Maintained By**: Core Development Team
