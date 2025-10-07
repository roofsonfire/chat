# Feature Flags System

A comprehensive, type-safe feature flag system for controlled feature rollouts, A/B testing, and environment-specific features.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Client Components](#client-components)
  - [Server Components](#server-components)
  - [API Routes](#api-routes)
- [Flag Types](#flag-types)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Examples](#examples)

## Overview

The feature flags system provides a simple yet powerful way to control feature availability across your application. It supports multiple flag types and evaluation contexts, making it suitable for everything from simple on/off toggles to complex percentage-based rollouts.

## Features

- **Type-Safe**: Full TypeScript support with typed flag keys
- **Environment-Based**: Enable features for specific environments (dev, prod, test)
- **User-Based**: Target specific users by ID or role
- **Percentage Rollouts**: Gradually roll out features to a percentage of users
- **Segment Targeting**: Target specific user segments (e.g., premium, beta)
- **React Hooks**: Easy integration with React components
- **Server-Side**: Full support for server components and API routes
- **Consistent Hashing**: Users always see the same experience for percentage rollouts
- **Zero Dependencies**: Built with just TypeScript and React

## Installation

The feature flags system is already included in the project. No additional installation required.

## Usage

### Client Components

Use the `useFeature` hook in client components:

```tsx
"use client";

import { useFeature } from "@/lib/hooks/use-feature";

export function MyComponent() {
  const newUIEnabled = useFeature("new-chat-ui");

  if (!newUIEnabled) {
    return <OldUI />;
  }

  return <NewUI />;
}
```

Get all enabled features:

```tsx
"use client";

import { useFeatures } from "@/lib/hooks/use-feature";

export function FeatureList() {
  const features = useFeatures();

  return (
    <ul>
      {features.map((key) => (
        <li key={key}>{key}</li>
      ))}
    </ul>
  );
}
```

### Server Components

Use `isFeatureEnabled` in server components:

```tsx
import { isFeatureEnabled } from "@/lib/features";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/provider";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const enabled = isFeatureEnabled("new-chat-ui", {
    userId: session?.user?.email || undefined,
  });

  return enabled ? <NewUI /> : <OldUI />;
}
```

### API Routes

Use server-side utilities in API routes:

```ts
import { isFeatureEnabledServer } from "@/lib/features";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/provider";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!isFeatureEnabledServer("admin-panel", session)) {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }

  // Return admin data
  return Response.json({ data: "..." });
}
```

## Flag Types

### Simple Boolean Flags

Enable/disable features globally:

```typescript
{
  key: "dark-mode",
  name: "Dark Mode",
  description: "Dark theme support",
  enabled: true, // Simply on or off
}
```

### Environment-Based Flags

Enable features only in specific environments:

```typescript
{
  key: "new-chat-ui",
  name: "New Chat UI",
  description: "New redesigned chat interface",
  enabled: true,
  environments: ["development"], // Only in development
}
```

### User-Based Flags

Enable features for specific users:

```typescript
{
  key: "beta-feature",
  name: "Beta Feature",
  description: "Early access feature",
  enabled: true,
  allowedUsers: ["user@example.com", "admin@example.com"],
}
```

### Role-Based Flags

Enable features for specific user roles:

```typescript
{
  key: "admin-panel",
  name: "Admin Panel",
  description: "Administrative dashboard",
  enabled: true,
  allowedRoles: ["admin", "moderator"],
}
```

### Percentage Rollouts

Gradually roll out features to a percentage of users:

```typescript
{
  key: "new-feature",
  name: "New Feature",
  description: "Experimental new feature",
  enabled: true,
  rolloutPercentage: 25, // 25% of users
}
```

### Segment-Based Flags

Target specific user segments:

```typescript
{
  key: "premium-feature",
  name: "Premium Feature",
  description: "Feature for premium users",
  enabled: true,
  segment: "premium",
}
```

## Configuration

### Adding New Flags

Add new flags to `src/lib/features/flags.ts`:

```typescript
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // ... existing flags

  "my-new-feature": {
    key: "my-new-feature",
    name: "My New Feature",
    description: "Description of the feature",
    enabled: false,
    environments: ["development"],
    rolloutPercentage: 0,
  },
};
```

### Modifying Flags

Simply update the flag configuration:

```typescript
{
  key: "my-feature",
  enabled: true, // Changed from false
  rolloutPercentage: 50, // Increased from 25%
}
```

### Removing Flags

1. Remove the flag from `FEATURE_FLAGS`
2. Remove all code that checks the flag
3. Deploy the changes

## Best Practices

### 1. Start Small, Scale Gradually

Begin with a small percentage rollout and increase gradually:

```typescript
// Week 1: 5% rollout
rolloutPercentage: 5,

// Week 2: If stable, increase to 25%
rolloutPercentage: 25,

// Week 3: If stable, increase to 100%
rolloutPercentage: 100,

// Week 4: Remove flag and ship to everyone
```

### 2. Use Descriptive Names

Choose clear, descriptive flag names:

```typescript
// ✅ Good
"streaming-responses";
"new-chat-ui";
"admin-panel";

// ❌ Bad
"feature1";
"test";
"new-stuff";
```

### 3. Document Each Flag

Always include name and description:

```typescript
{
  key: "advanced-ai-model",
  name: "Advanced AI Model", // Clear name
  description: "Use more advanced AI model (higher cost)", // Explain what it does
  enabled: false,
}
```

### 4. Clean Up Old Flags

Remove flags after features are fully rolled out:

```typescript
// Don't keep this forever:
if (isFeatureEnabled("my-feature")) {
  // New code
} else {
  // Old code - remove once feature is stable
}

// Instead, after rollout:
// Just use the new code, remove the flag check
```

### 5. Use Environment Flags for Testing

Test features in development before production:

```typescript
{
  key: "experimental-feature",
  enabled: true,
  environments: ["development"], // Test in dev first
}
```

### 6. Monitor Rollout Impact

When rolling out with percentages, monitor key metrics:

- Error rates
- Performance metrics
- User engagement
- Support tickets

### 7. Combine Conditions Carefully

Be cautious when combining multiple conditions:

```typescript
{
  key: "complex-feature",
  enabled: true,
  environments: ["production"],
  rolloutPercentage: 50,
  segment: "premium",
  // Users must be:
  // - In production environment
  // - In the 50% rollout group
  // - In the premium segment
}
```

## Testing

### Unit Tests

Test feature flag logic:

```typescript
import { isFeatureEnabled } from "@/lib/features";

describe("MyFeature", () => {
  it("should show new UI when flag is enabled", () => {
    const enabled = isFeatureEnabled("new-chat-ui", {
      environment: "development",
    });
    expect(enabled).toBe(true);
  });
});
```

### Integration Tests

Test components with different flag states:

```typescript
import { render } from "@testing-library/react";
import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("should render new UI when flag is enabled", () => {
    // Mock useFeature to return true
    vi.mock("@/lib/hooks/use-feature", () => ({
      useFeature: () => true,
    }));

    const { getByText } = render(<MyComponent />);
    expect(getByText("New UI")).toBeInTheDocument();
  });
});
```

## Examples

### Example 1: Simple Feature Toggle

```tsx
"use client";

import { useFeature } from "@/lib/hooks/use-feature";

export function ChatInput() {
  const voiceInputEnabled = useFeature("voice-input");

  return (
    <div>
      <textarea />
      {voiceInputEnabled && <VoiceInputButton />}
    </div>
  );
}
```

### Example 2: Percentage Rollout

```tsx
import { isFeatureEnabled } from "@/lib/features";
import { getServerSession } from "next-auth";

export default async function ChatPage() {
  const session = await getServerSession();

  // 25% of users will see the new chat history export feature
  const exportEnabled = isFeatureEnabled("chat-history-export", {
    userId: session?.user?.email || undefined,
  });

  return (
    <div>
      <ChatInterface />
      {exportEnabled && <ExportButton />}
    </div>
  );
}
```

### Example 3: Role-Based Access

```tsx
import { isFeatureEnabledServer } from "@/lib/features";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();

  // Only admins can access this endpoint
  if (!isFeatureEnabledServer("admin-panel", session)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Return admin data
  const data = await getAdminData();
  return Response.json({ data });
}
```

### Example 4: Environment-Specific Features

```tsx
import { isFeatureEnabled } from "@/lib/features";

export function DebugPanel() {
  // Only show debug panel in development
  const debugEnabled = isFeatureEnabled("debug-panel", {
    environment: process.env.NODE_ENV as "development" | "production",
  });

  if (!debugEnabled) {
    return null;
  }

  return <DebugInfo />;
}
```

### Example 5: Segment-Based Features

```tsx
import { isFeatureEnabled } from "@/lib/features";

export default async function ChatPage() {
  const session = await getServerSession();

  // Only premium users get advanced AI model
  const advancedAI = isFeatureEnabled("advanced-ai-model", {
    userId: session?.user?.email || undefined,
    userSegment: session?.user?.tier || "free", // Assuming tier in session
  });

  return <ChatInterface useAdvancedModel={advancedAI} />;
}
```

### Example 6: Multiple Conditions

```tsx
import { isFeatureEnabled } from "@/lib/features";

async function canAccessFeature(userId: string, userRole: string) {
  // Check multiple conditions
  const enabled = isFeatureEnabled("beta-feature", {
    userId,
    userRole,
    environment: "production",
  });

  return enabled;
}
```

## Current Feature Flags

The system includes several pre-configured flags:

### UI Features

- `new-chat-ui`: New redesigned chat interface (dev only)
- `dark-mode`: Dark theme support (enabled everywhere)

### Performance Features

- `performance-monitoring`: Core Web Vitals tracking (prod only)
- `lazy-loading`: Lazy load components (enabled)

### AI Features

- `streaming-responses`: Token-by-token streaming (enabled)
- `multimodal-input`: Image upload support (enabled)
- `advanced-ai-model`: Advanced AI model, 10% rollout (premium segment)

### Experimental Features

- `voice-input`: Voice-to-text input (dev only)
- `chat-history-export`: Export conversations, 25% rollout

### Admin Features

- `admin-panel`: Admin dashboard (admin role only)
- `user-analytics`: Usage tracking (prod only)

## Troubleshooting

### Flag Not Working

1. Check flag is enabled: `getFeatureFlag('your-flag')`
2. Verify environment matches
3. Check user context is correct
4. Review rollout percentage

### Percentage Rollout Not Consistent

The system uses consistent hashing based on `userId` + `featureKey`. Ensure:

1. User ID is stable (e.g., email)
2. Feature key hasn't changed
3. User is logged in (userId is available)

### Type Errors

Ensure you're using the correct types:

```typescript
import type { FeatureFlagKey } from "@/lib/features";

const key: FeatureFlagKey = "new-chat-ui"; // Type-safe
```

## Support

For questions or issues with the feature flags system:

1. Check this documentation
2. Review the test suite in `tests/unit/feature-flags.test.ts`
3. Examine the implementation in `src/lib/features/`
