# Database Integration Guide

This document provides a comprehensive guide for integrating database persistence with the chat application using Supabase.

## Table of Contents

- [Overview](#overview)
- [Why Supabase?](#why-supabase)
- [Setup](#setup)
- [Schema Design](#schema-design)
- [Implementation](#implementation)
- [Security](#security)
- [Testing](#testing)
- [Migration Strategy](#migration-strategy)

## Overview

The chat application currently stores conversation data in memory, which means data is lost on page refresh. Adding database integration enables:

- **Persistent Chat History**: Save conversations for later access
- **Multi-Device Sync**: Access chats from any device
- **User Profiles**: Store user preferences and settings
- **Analytics**: Track usage patterns and metrics
- **Scalability**: Handle multiple concurrent users

## Why Supabase?

Supabase is recommended for this integration because:

1. **PostgreSQL-Based**: Full SQL database with relational data
2. **Real-time Subscriptions**: Listen to database changes in real-time
3. **Built-in Auth**: Integrates with NextAuth or standalone
4. **Row Level Security**: Database-level authorization
5. **TypeScript Support**: Generate types from schema
6. **Free Tier**: Generous free tier for development
7. **Edge Functions**: Serverless functions when needed
8. **Storage**: Built-in file storage for images

## Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Fill in project details:
   - **Name**: `chat-app` (or your choice)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) key**: `eyJhb...` (starts with eyJ)

### 3. Add Environment Variables

Add to `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
```

Add to `.env.example`:

```bash
# Supabase Configuration
# Get these from your Supabase project dashboard: https://app.supabase.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4. Install Dependencies

```bash
npm install --save @supabase/supabase-js
```

## Schema Design

### Tables

#### 1. `user_profiles`

Stores user information and preferences.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 2. `chats`

Stores chat conversations.

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);

-- Auto-update updated_at
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3. `messages`

Stores individual messages within chats.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### Row Level Security (RLS)

Enable RLS on all tables for security:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.email() = email);

-- chats policies
CREATE POLICY "Users can view own chats"
  ON chats FOR SELECT
  USING (user_id IN (SELECT id FROM user_profiles WHERE email = auth.email()));

CREATE POLICY "Users can create own chats"
  ON chats FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE email = auth.email()));

CREATE POLICY "Users can update own chats"
  ON chats FOR UPDATE
  USING (user_id IN (SELECT id FROM user_profiles WHERE email = auth.email()));

CREATE POLICY "Users can delete own chats"
  ON chats FOR DELETE
  USING (user_id IN (SELECT id FROM user_profiles WHERE email = auth.email()));

-- messages policies
CREATE POLICY "Users can view messages from own chats"
  ON messages FOR SELECT
  USING (chat_id IN (
    SELECT id FROM chats WHERE user_id IN (
      SELECT id FROM user_profiles WHERE email = auth.email()
    )
  ));

CREATE POLICY "Users can create messages in own chats"
  ON messages FOR INSERT
  WITH CHECK (chat_id IN (
    SELECT id FROM chats WHERE user_id IN (
      SELECT id FROM user_profiles WHERE email = auth.email()
    )
  ));
```

### Run Schema Setup

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Paste the complete schema SQL from above
4. Click "Run"

## Implementation

### 1. Create Supabase Client

Create `src/lib/db/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
```

### 2. Generate TypeScript Types

Generate types from your schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/database.ts
```

Replace `YOUR_PROJECT_ID` with your Supabase project ID (found in Project Settings → General).

### 3. Create Database Service

Create `src/lib/db/chat-service.ts`:

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Chat = Database["public"]["Tables"]["chats"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];

export class ChatDatabaseService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async createChat(userId: string, title?: string) {
    const { data, error } = await this.supabase
      .from("chats")
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserChats(userId: string) {
    const { data, error } = await this.supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getChatMessages(chatId: string) {
    const { data, error } = await this.supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  async addMessage(
    chatId: string,
    role: "user" | "assistant",
    content: string
  ) {
    const { data, error } = await this.supabase
      .from("messages")
      .insert({ chat_id: chatId, role, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

### 4. Use in Components

```typescript
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/db/client";
import { ChatDatabaseService } from "@/lib/db/chat-service";

export function ChatHistory() {
  const [chats, setChats] = useState([]);
  const supabase = createBrowserClient();
  const service = new ChatDatabaseService(supabase);

  useEffect(() => {
    async function loadChats() {
      const userChats = await service.getUserChats(userId);
      setChats(userChats);
    }
    loadChats();
  }, []);

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat.id}>{chat.title}</div>
      ))}
    </div>
  );
}
```

## Security

### Environment Variables

- **NEVER** commit Supabase credentials to git
- Use `.env.local` for development
- Use environment variables in production (Vercel, Railway, etc.)

### Row Level Security

- Always enable RLS on all tables
- Write specific policies for each operation
- Test policies thoroughly
- Never use service role key in client code

### API Keys

- **Anon Key**: Safe for client use (public)
- **Service Role Key**: NEVER use in client code (keep secret)

## Testing

### Manual Testing

1. Create a chat:

```bash
# In Supabase SQL Editor
SELECT * FROM chats;
```

2. Verify RLS:

```bash
# Try to access another user's data - should fail
SELECT * FROM chats WHERE user_id != (SELECT id FROM user_profiles WHERE email = auth.email());
```

### Automated Testing

Use Supabase local development:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db push

# Run tests against local database
npm test
```

## Migration Strategy

### Phase 1: Setup Infrastructure

1. Create Supabase project ✓
2. Set up schema ✓
3. Configure RLS ✓
4. Add environment variables ✓

### Phase 2: Implement Services

1. Create database clients
2. Implement ChatDatabaseService
3. Add error handling
4. Write unit tests

### Phase 3: Integrate with UI

1. Update chat components to use database
2. Add loading states
3. Handle errors gracefully
4. Add optimistic updates

### Phase 4: Migration & Testing

1. Test with development data
2. Verify RLS policies
3. Performance testing
4. Deploy to production

### Phase 5: Launch

1. Deploy schema to production
2. Migrate any existing data
3. Monitor for errors
4. Gradual rollout with feature flags

## Common Issues

### Issue: "relation does not exist"

**Solution**: Run the schema SQL in Supabase SQL Editor

### Issue: "permission denied for table"

**Solution**: Enable RLS and create policies

### Issue: "Cannot read property of undefined"

**Solution**: Check environment variables are set

### Issue: Type errors with Supabase client

**Solution**: Regenerate types from schema

## Next Steps

After completing database integration:

1. **Real-time Updates**: Add real-time subscriptions
2. **File Storage**: Integrate Supabase Storage for images
3. **Analytics**: Track user engagement
4. **Backups**: Set up automated backups
5. **Monitoring**: Add database monitoring

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Types](https://supabase.com/docs/guides/api/generating-types)
