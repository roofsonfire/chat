# Chat E2E Test Suite

Comprehensive Playwright end-to-end tests for the chat application, covering the complete user journey from authentication to multimodal interactions.

## Overview

This test suite validates:

- **Message sending and receiving** with streaming responses
- **Image upload functionality** with preview and validation
- **Error handling** for API failures and invalid inputs
- **Accessibility** features and keyboard navigation
- **Cross-browser compatibility** (Chromium, Firefox, WebKit)
- **Edge cases** and stress scenarios

## Test Structure

```
tests/
├── e2e/
│   └── chat.spec.ts          # Main chat flow tests
├── helpers/
│   ├── auth.ts               # Authentication utilities
│   ├── chat-mocks.ts         # API mocking utilities
│   └── README.md             # Helper documentation
└── fixtures/
    └── test-image.png        # Test image for upload tests
```

## Running Tests

### Prerequisites

Before running E2E tests, ensure you have a `.env.local` file with all required environment variables. Copy from `.env.example`:

```bash
cp .env.example .env.local
```

Then fill in the required values. For testing purposes, you can use minimal values:

```bash
# Generate a secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"

# Set test credentials
AUTH_USER_EMAIL=test@example.com
# Generate password hash: npm run hash-password
AUTH_USER_PASSWORD_HASH=your-hashed-password-here

# Google Cloud (use your actual values)
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_VERTEX_AI_MODEL_ID=gemini-1.5-flash-002

# Test credentials (must match AUTH_USER_EMAIL)
NEXT_PUBLIC_TEST_EMAIL=test@example.com
NEXT_PUBLIC_TEST_PASSWORD=test123
```

**Note**: The `NEXT_PUBLIC_TEST_EMAIL` should match `AUTH_USER_EMAIL`, and `NEXT_PUBLIC_TEST_PASSWORD` should be the unhashed version of `AUTH_USER_PASSWORD_HASH`. Rate limiting is now handled in-memory, so no external service configuration is needed.

### Run all E2E tests

```bash
npm run test:e2e
```

### Run with UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run with debugger

```bash
npm run test:e2e:debug
```

### Run specific test file

```bash
npx playwright test tests/e2e/chat.spec.ts
```

### Run specific test by name

```bash
npx playwright test -g "should send a message"
```

### Run in specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Coverage

### Basic Chat Functionality

- ✅ Empty chat state display
- ✅ Message input and send button visibility
- ✅ Message typing functionality

### Message Sending and Display

- ✅ Send and display user messages
- ✅ Receive and display assistant responses
- ✅ Loading indicator during API calls
- ✅ Input disabled state while processing
- ✅ Input clearing after submission

### Streaming Response

- ✅ Chunked response streaming
- ✅ Multiple sequential messages
- ✅ Real-time text updates

### Image Upload Functionality

- ✅ Image upload button availability
- ✅ Image preview after upload
- ✅ Image removal functionality
- ✅ Sending messages with images
- ✅ Preview clearing after send

### Error Handling

- ✅ API error graceful handling
- ✅ Invalid file type validation
- ✅ Empty message prevention

### Chat History Behavior

- ✅ Auto-scroll to latest message
- ✅ Message order preservation
- ✅ Multiple message history

### Accessibility

- ✅ Proper ARIA labels
- ✅ Role attributes for messages
- ✅ Keyboard navigation support

### Cross-browser Compatibility

- ✅ Consistent rendering across browsers
- ✅ Feature parity in all browsers

### Edge Cases

- ✅ Very long messages
- ✅ Special characters handling
- ✅ Rapid consecutive messages
- ✅ Empty streaming responses

## Test Architecture

### API Mocking

Tests use a sophisticated mocking system that simulates:

- **Streaming responses**: Chunked text delivery mimicking real AI responses
- **Network delays**: Configurable delays between chunks
- **Error scenarios**: Various HTTP error codes and messages

Example:

```typescript
await mockChatAPI(page, {
  response: "This is a streamed response",
  streamDelay: 50, // 50ms between chunks
  chunkSize: 10, // 10 characters per chunk
});
```

### Authentication

All tests run in an authenticated context using `setupAuthenticatedPage()`:

- Logs in before each test
- Ensures consistent starting state
- Prevents authentication flakiness

### Test Isolation

Each test:

- Starts with a clean authenticated session
- Uses isolated API mocks
- Cleans up after completion
- Does not depend on other tests

## Data Test IDs

Components use `data-testid` attributes for reliable element selection:

| Test ID                   | Component    | Description               |
| ------------------------- | ------------ | ------------------------- |
| `chat-container`          | Chat         | Main chat container       |
| `chat-history-container`  | Chat         | History scroll container  |
| `chat-messages`           | ChatHistory  | Message list container    |
| `empty-chat`              | ChatHistory  | Empty state message       |
| `loading-indicator`       | ChatHistory  | Loading spinner           |
| `message-user`            | ChatMessage  | User message wrapper      |
| `message-assistant`       | ChatMessage  | Assistant message wrapper |
| `message-content`         | ChatMessage  | Message content div       |
| `message-text`            | ChatMessage  | Message text paragraph    |
| `message-image`           | ChatMessage  | Message image element     |
| `message-input-form`      | MessageInput | Form element              |
| `message-input`           | MessageInput | Text input field          |
| `send-message-button`     | MessageInput | Send button               |
| `attach-image-button`     | MessageInput | Image upload button       |
| `image-upload-input`      | MessageInput | Hidden file input         |
| `image-preview-container` | MessageInput | Preview wrapper           |
| `image-preview`           | MessageInput | Preview image             |
| `remove-image-button`     | MessageInput | Remove preview button     |
| `image-error`             | MessageInput | Error message display     |

## Environment Variables

Set these for authentication tests:

```bash
NEXT_PUBLIC_TEST_EMAIL="test@example.com"
NEXT_PUBLIC_TEST_PASSWORD="test123"
```

## CI Integration

Tests are configured to run in CI with:

- **Parallel execution**: Disabled in CI for stability
- **Retries**: 2 automatic retries on failure
- **Screenshots**: Captured on failure
- **Traces**: Recorded on first retry
- **HTML report**: Generated after test run

## Best Practices

### DO ✅

- Use `data-testid` attributes for element selection
- Mock API calls for reliability and speed
- Wait for specific conditions using `waitForMessage()`
- Test accessibility features
- Verify both success and error paths
- Test across all configured browsers

### DON'T ❌

- Use CSS selectors that may change
- Make real API calls in tests
- Use arbitrary `setTimeout()` for waiting
- Skip error scenarios
- Assume timing will be consistent
- Test only in one browser

## Debugging

### View test report

```bash
npx playwright show-report
```

### Run single test with UI

```bash
npx playwright test --ui -g "test name"
```

### Debug mode with browser

```bash
npx playwright test --debug
```

### Generate test code

```bash
npx playwright codegen http://localhost:3000
```

## Troubleshooting

### Test timeout

- Increase timeout in test: `{ timeout: 30000 }`
- Check if API mocks are properly configured
- Verify network conditions in CI

### Element not found

- Ensure component has correct `data-testid`
- Check if authentication succeeded
- Verify element is rendered (not conditionally hidden)

### Flaky tests

- Add explicit waits using `waitForMessage()`
- Avoid using fixed `waitForTimeout()`
- Ensure proper test isolation with cleanup

### CI failures

- Check playwright report artifacts
- Review screenshots and traces
- Verify environment variables are set

## Contributing

When adding new tests:

1. Add `data-testid` attributes to new components
2. Create reusable helpers for common actions
3. Test both success and failure scenarios
4. Ensure tests run in all browsers
5. Update this documentation

## Performance

Test suite performance targets:

- **Total run time**: < 5 minutes (all browsers)
- **Single test**: < 10 seconds average
- **Setup time**: < 2 seconds per test
- **Mock response time**: < 100ms

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Mobile viewport testing
- [ ] Internationalization testing
- [ ] Real-time collaboration tests
- [ ] Webhook integration tests
- [ ] Database state verification
