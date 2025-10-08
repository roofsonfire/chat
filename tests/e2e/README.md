# Chat E2E Test Suite

Comprehensive Playwright end-to-end tests for the chat application, covering the complete user journey from authentication to multimodal interactions.

## Overview

This test suite validates the core journeys of the chat application:

- **Authentication**: unauthenticated redirect and successful login
- **Primary chat flow**: user sends a message and sees the streamed reply
- **Image attachment**: attach an image and send it with a prompt
- **API resilience**: surface failures gracefully to the user
- **Accessibility smoke**: role-based login checks and keyboard-only chat input

## Test Structure

```
tests/
├── e2e/
│   ├── accessibility.spec.ts   # Accessibility smoke checks
│   ├── auth.spec.ts            # Authentication journeys
│   ├── chat.spec.ts            # Core chat flows
│   └── home.spec.ts            # Home page smoke test
├── helpers/
│   ├── auth.ts                 # Authentication utilities
│   ├── chat-mocks.ts           # API mocking utilities
│   └── README.md               # Helper documentation
└── fixtures/
  └── test-image.png          # Test image for upload tests
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

### Coverage summary

- **Authentication**: redirect enforcement and happy-path login
- **Chat messaging**: user sends a prompt and receives the assistant response
- **Image messaging**: prompt with image attachment
- **Error path**: simulated API failure surfaces fallback message
- **Accessibility smoke**: role-based login inputs and keyboard-only chat interaction
- **Home page**: single smoke assertion for the primary heading and title

## Test Architecture

### API Mocking

Tests intercept `POST /api/chat` with `mockChatAPI` to simulate streamed responses or failures. The helper accepts plain text responses or error metadata to keep each scenario deterministic.

### Authentication

All tests run in an authenticated context using `setupAuthenticatedPage()`:

- Logs in before each test
- Ensures consistent starting state
- Prevents authentication flakiness

### Test Isolation

- Each test logs in via `setupAuthenticatedPage` and tears down mocks in `afterEach`
- Chat API routes are intercepted per-test to avoid hitting real services
- Critical flows are covered individually to keep failures focused

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

- Target user journeys end-to-end instead of micro-interactions
- Use `data-testid` locators and `waitForMessage()` for deterministic waits
- Mock API calls for reliability and speed in CI
- Keep the suite fast so retries remain effective

### DON'T ❌

- Assert implementation details such as placeholder text or aria attributes
- Duplicate coverage already handled by unit/integration tests
- Depend on real external services or timing assumptions

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

- Ensure Playwright intercepted `/api/chat`
- Verify the helper returned a response (stream text or error)
- Keep messages short to avoid long processing times

### Element not found

- Confirm authentication completed successfully
- Check that the message was sent via `waitForMessage()`
- Validate fixtures (e.g., the test image path) still exist

### Flaky tests

- Use the provided helpers instead of manual `waitForTimeout()` calls
- Keep each scenario focused on a single outcome
- Prefer unit/integration tests for edge cases or UI detail changes

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
