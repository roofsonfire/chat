# User Management System

Comprehensive guide for implementing a complete user management system with profiles, roles, quotas, and administration.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [User Profiles](#user-profiles)
- [Quotas & Limits](#quotas--limits)
- [Admin Panel](#admin-panel)
- [Implementation](#implementation)
- [Security](#security)
- [Testing](#testing)

## Overview

The User Management System provides:

- **User Profiles**: Personalized user information and preferences
- **Role-Based Access Control (RBAC)**: Different permission levels
- **Usage Quotas**: Rate limiting and usage tracking per user/tier
- **Admin Dashboard**: User administration and analytics
- **Audit Logging**: Track important user actions
- **Account Management**: Self-service profile updates

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 User Management System              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Profiles   │  │     Roles    │  │  Quotas  │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│         │                  │                │      │
│         └──────────────────┼────────────────┘      │
│                           │                        │
│              ┌────────────▼────────────┐           │
│              │    Authorization        │           │
│              │    Middleware           │           │
│              └────────────┬────────────┘           │
│                           │                        │
│         ┌─────────────────┼─────────────────┐     │
│         │                 │                 │     │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼────┐│
│  │   API       │  │   Admin     │  │   Audit   ││
│  │   Routes    │  │   Panel     │  │   Logs    ││
│  └─────────────┘  └─────────────┘  └───────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

## User Roles & Permissions

### Role Hierarchy

```
┌──────────────┐
│    Admin     │  Full system access
└──────┬───────┘
       │
┌──────▼───────┐
│  Moderator   │  User management, content moderation
└──────┬───────┘
       │
┌──────▼───────┐
│   Premium    │  Enhanced features, higher quotas
└──────┬───────┘
       │
┌──────▼───────┐
│     User     │  Standard access
└──────────────┘
```

### Permission Matrix

| Feature             | User | Premium | Moderator | Admin |
| ------------------- | ---- | ------- | --------- | ----- |
| Send Messages       | ✓    | ✓       | ✓         | ✓     |
| Upload Images       | ✓    | ✓       | ✓         | ✓     |
| Advanced AI Model   | ✗    | ✓       | ✓         | ✓     |
| Export Chat History | ✗    | ✓       | ✓         | ✓     |
| View User List      | ✗    | ✗       | ✓         | ✓     |
| Manage Users        | ✗    | ✗       | ✓         | ✓     |
| View Analytics      | ✗    | ✗       | ✗         | ✓     |
| System Settings     | ✗    | ✗       | ✗         | ✓     |

### Role Type Definition

```typescript
// src/lib/types/roles.ts
export type UserRole = "user" | "premium" | "moderator" | "admin";

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  quotas: Quotas;
}

export type Permission =
  | "chat.send"
  | "chat.history.view"
  | "chat.history.export"
  | "image.upload"
  | "ai.advanced"
  | "users.view"
  | "users.manage"
  | "analytics.view"
  | "system.settings";

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    role: "user",
    permissions: ["chat.send", "chat.history.view", "image.upload"],
    quotas: {
      messagesPerDay: 100,
      imagesPerDay: 10,
      chatsMax: 10,
    },
  },
  premium: {
    role: "premium",
    permissions: [
      "chat.send",
      "chat.history.view",
      "chat.history.export",
      "image.upload",
      "ai.advanced",
    ],
    quotas: {
      messagesPerDay: 1000,
      imagesPerDay: 100,
      chatsMax: 100,
    },
  },
  moderator: {
    role: "moderator",
    permissions: [
      "chat.send",
      "chat.history.view",
      "chat.history.export",
      "image.upload",
      "ai.advanced",
      "users.view",
      "users.manage",
    ],
    quotas: {
      messagesPerDay: -1, // unlimited
      imagesPerDay: -1,
      chatsMax: -1,
    },
  },
  admin: {
    role: "admin",
    permissions: [
      "chat.send",
      "chat.history.view",
      "chat.history.export",
      "image.upload",
      "ai.advanced",
      "users.view",
      "users.manage",
      "analytics.view",
      "system.settings",
    ],
    quotas: {
      messagesPerDay: -1, // unlimited
      imagesPerDay: -1,
      chatsMax: -1,
    },
  },
};
```

## User Profiles

### Profile Schema

```typescript
// src/lib/types/user.ts
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferences: UserPreferences;
  tier: "free" | "premium" | "enterprise";
  usage: UsageStats;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  emailNotifications: boolean;
  aiModel: "standard" | "advanced";
  streamingEnabled: boolean;
}

export interface UsageStats {
  messagesToday: number;
  imagesToday: number;
  totalChats: number;
  totalMessages: number;
  lastResetAt: string;
}
```

### Profile Service

```typescript
// src/lib/services/user-service.ts
import type { UserProfile } from "@/lib/types/user";
import type { SupabaseClient } from "@supabase/supabase-js";

export class UserService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get user profile by email
   */
  async getProfile(email: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Create user profile
   */
  async createProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .insert({
        email: profile.email!,
        role: "user",
        tier: "free",
        preferences: {
          theme: "system",
          language: "en",
          emailNotifications: true,
          aiModel: "standard",
          streamingEnabled: true,
        },
        usage: {
          messagesToday: 0,
          imagesToday: 0,
          totalChats: 0,
          totalMessages: 0,
          lastResetAt: new Date().toISOString(),
        },
        ...profile,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    email: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(updates)
      .eq("email", email)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update usage stats
   */
  async incrementUsage(
    email: string,
    field: "messagesToday" | "imagesToday" | "totalMessages" | "totalChats"
  ): Promise<void> {
    const profile = await this.getProfile(email);
    if (!profile) throw new Error("Profile not found");

    // Reset daily counters if needed
    const lastReset = new Date(profile.usage.lastResetAt);
    const now = new Date();
    const hoursSinceReset =
      (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    let usage = profile.usage;
    if (hoursSinceReset >= 24) {
      usage = {
        ...usage,
        messagesToday: 0,
        imagesToday: 0,
        lastResetAt: now.toISOString(),
      };
    }

    // Increment counter
    usage[field] = (usage[field] || 0) + 1;

    await this.updateProfile(email, { usage });
  }
}
```

## Quotas & Limits

### Quota Enforcement

```typescript
// src/lib/middleware/quota-check.ts
import { UserService } from "@/lib/services/user-service";
import { ROLE_PERMISSIONS } from "@/lib/types/roles";

export async function checkQuota(
  email: string,
  quotaType: "messagesPerDay" | "imagesPerDay" | "chatsMax"
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const userService = new UserService(supabase);
  const profile = await userService.getProfile(email);

  if (!profile) {
    throw new Error("User profile not found");
  }

  const rolePermissions = ROLE_PERMISSIONS[profile.role];
  const limit = rolePermissions.quotas[quotaType];

  // Unlimited quota
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  // Check current usage
  let current = 0;
  switch (quotaType) {
    case "messagesPerDay":
      current = profile.usage.messagesToday;
      break;
    case "imagesPerDay":
      current = profile.usage.imagesToday;
      break;
    case "chatsMax":
      current = profile.usage.totalChats;
      break;
  }

  const remaining = Math.max(0, limit - current);
  const allowed = current < limit;

  return { allowed, remaining, limit };
}

/**
 * API Route middleware for quota enforcement
 */
export async function withQuotaCheck(
  email: string,
  quotaType: "messagesPerDay" | "imagesPerDay"
) {
  const { allowed, remaining, limit } = await checkQuota(email, quotaType);

  if (!allowed) {
    return {
      error: "Quota exceeded",
      quotaType,
      limit,
      remaining: 0,
    };
  }

  return { allowed: true, remaining, limit };
}
```

### Usage in API Routes

```typescript
// src/app/api/chat/route.ts
import { withQuotaCheck } from "@/lib/middleware/quota-check";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check quota
  const quotaCheck = await withQuotaCheck(session.user.email, "messagesPerDay");
  if (!quotaCheck.allowed) {
    return Response.json(
      {
        error: "Daily message quota exceeded",
        limit: quotaCheck.limit,
        remaining: 0,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(quotaCheck.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Process request...
  const response = await processChat(request);

  // Increment usage
  await incrementUsage(session.user.email, "messagesToday");

  return Response.json(response, {
    headers: {
      "X-RateLimit-Limit": String(quotaCheck.limit),
      "X-RateLimit-Remaining": String(quotaCheck.remaining - 1),
    },
  });
}
```

## Admin Panel

### Dashboard Layout

```typescript
// src/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user-service";
import { hasPermission } from "@/lib/auth/permissions";

export default async function AdminDashboard() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const userService = new UserService(supabase);
  const profile = await userService.getProfile(session.user.email);

  if (!profile || !hasPermission(profile.role, "analytics.view")) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Active Today" value={stats.activeToday} />
        <StatCard title="Messages Today" value={stats.messagesToday} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserList />
        <RecentActivity />
      </div>
    </div>
  );
}
```

### User Management Component

```typescript
// src/components/admin/user-list.tsx
"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/lib/types/user";

export function UserList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    }
    loadUsers();
  }, []);

  async function updateUserRole(userId: string, newRole: UserRole) {
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    // Refresh list
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Tier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      updateUserRole(user.id, e.target.value as UserRole)
                    }
                  >
                    <option value="user">User</option>
                    <option value="premium">Premium</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{user.tier}</td>
                <td>
                  <button onClick={() => viewUser(user.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## Security

### Permission Checking

```typescript
// src/lib/auth/permissions.ts
import {
  ROLE_PERMISSIONS,
  type UserRole,
  type Permission,
} from "@/lib/types/roles";

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  return rolePerms.permissions.includes(permission);
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission> = {
    "/admin": "analytics.view",
    "/admin/users": "users.manage",
    "/admin/settings": "system.settings",
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true; // Public route

  return hasPermission(role, requiredPermission);
}
```

### Middleware Protection

```typescript
// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check role
    const userRole = token.role as UserRole;
    if (!canAccessRoute(userRole, request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

## Testing

### Unit Tests

```typescript
// tests/unit/user-service.test.ts
import { describe, it, expect, vi } from "vitest";
import { UserService } from "@/lib/services/user-service";

describe("UserService", () => {
  describe("getProfile", () => {
    it("should return user profile", async () => {
      const mockSupabase = createMockSupabase();
      const service = new UserService(mockSupabase);

      const profile = await service.getProfile("test@example.com");

      expect(profile).toBeDefined();
      expect(profile?.email).toBe("test@example.com");
    });
  });

  describe("checkQuota", () => {
    it("should allow within quota", async () => {
      const result = await checkQuota("user@example.com", "messagesPerDay");

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it("should deny when quota exceeded", async () => {
      // Mock user with exceeded quota
      const result = await checkQuota("user@example.com", "messagesPerDay");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });
});
```

## Implementation Checklist

### Phase 1: Core Setup

- [ ] Create user profile schema in database
- [ ] Implement UserService class
- [ ] Add role definitions and permissions
- [ ] Create quota checking middleware
- [ ] Write unit tests for services

### Phase 2: Profile Management

- [ ] Create profile page UI
- [ ] Add profile edit functionality
- [ ] Implement avatar upload
- [ ] Add preference settings
- [ ] Create usage statistics display

### Phase 3: Admin Panel

- [ ] Build admin dashboard layout
- [ ] Implement user list component
- [ ] Add user role management
- [ ] Create analytics views
- [ ] Add audit logging

### Phase 4: Integration

- [ ] Integrate with feature flags
- [ ] Add quota checks to API routes
- [ ] Implement permission-based UI
- [ ] Add usage tracking
- [ ] Create admin middleware

### Phase 5: Testing & Launch

- [ ] Write comprehensive tests
- [ ] Perform security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Staged rollout

## Resources

- [NextAuth Role-Based Access](https://next-auth.js.org/configuration/callbacks)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [RBAC Best Practices](https://auth0.com/docs/manage-users/access-control/rbac)
