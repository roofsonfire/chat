# 🧭 Project Navigation Guide

Smart navigation patterns and file organization for efficient development in VS Code and Zed.

## 📋 Quick Reference

### 🎯 Essential Locations

| Purpose           | Location            | Description                |
| ----------------- | ------------------- | -------------------------- |
| **Main App**      | `src/app/page.tsx`  | Home page (chat interface) |
| **API Routes**    | `src/app/api/`      | REST endpoints             |
| **Components**    | `src/components/`   | Reusable React components  |
| **Services**      | `src/lib/services/` | Business logic layer       |
| **Types**         | `src/lib/types/`    | TypeScript definitions     |
| **Utilities**     | `src/lib/utils/`    | Helper functions           |
| **Tests**         | `tests/`            | All test files             |
| **Documentation** | `docs/`             | Project documentation      |
| **Configuration** | Root directory      | Config files               |

### ⚡ Quick Navigation Shortcuts

#### VS Code

- **`Ctrl+P`** - Quick file finder
- **`Ctrl+Shift+F`** - Global search
- **`Ctrl+T`** - Go to symbol
- **`F12`** - Go to definition
- **`Shift+F12`** - Find references
- **`Ctrl+Click`** - Navigate to definition

#### Zed

- **`Cmd+P`** - File finder
- **`Cmd+Shift+F`** - Project search
- **`Cmd+T`** - Symbol search
- **`F12`** - Go to definition
- **`Shift+F12`** - Find references

---

## 🗂️ Directory Structure Deep Dive

```
chat/
├── 📁 .github/              # GitHub workflows & templates
│   ├── copilot-instructions.md    # AI pair programming context
│   ├── workflows/                 # CI/CD automation
│   └── ISSUE_TEMPLATE/           # Issue templates
│
├── 📁 .vscode/              # VS Code workspace configuration
│   ├── settings.json             # Editor settings
│   ├── extensions.json           # Recommended extensions
│   ├── tasks.json               # Automated tasks
│   └── launch.json              # Debug configurations
│
├── 📁 .zed/                 # Zed editor configuration
│   └── settings.json             # Project-specific settings
│
├── 📁 docs/                 # 📚 Documentation Hub
│   ├── README.md                 # Documentation index
│   ├── DEVELOPMENT.md            # Setup & workflows
│   ├── EDITOR-SETUP.md          # VS Code/Zed optimization
│   ├── API.md                   # API documentation
│   ├── PROJECT-STATUS.md        # Current project state
│   ├── PROJECT-NAVIGATION.md    # This file
│   ├── 📁 deployment/           # Deployment guides
│   ├── 📁 testing/              # Testing documentation
│   ├── 📁 features/             # Feature documentation
│   └── 📁 migration/            # Upgrade guides
│
├── 📁 scripts/              # 🔧 Utility Scripts
│   ├── 📁 deployment/           # Deployment automation
│   │   ├── deploy-staging.sh    # Cloud Run deployment
│   │   └── setup-secrets.sh     # GCP secrets management
│   ├── 📁 utils/                # Development utilities
│   │   └── hash-password.js     # Password hashing tool
│   └── 📁 mcp/                  # MCP integration scripts
│
├── 📁 src/                  # 💻 Source Code
│   ├── 📁 app/                  # Next.js App Router
│   │   ├── 📁 api/              # 🚀 API Routes
│   │   │   ├── 📁 auth/         # Authentication endpoints
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── 📁 chat/         # Chat endpoints
│   │   │   │   └── route.ts     # Main chat API
│   │   │   └── 📁 models/       # AI model endpoints
│   │   │       └── route.ts     # Model selection API
│   │   ├── 📁 login/            # Authentication pages
│   │   │   └── page.tsx         # Login interface
│   │   ├── layout.tsx           # Root layout component
│   │   ├── page.tsx            # 🏠 Main chat interface
│   │   ├── globals.css         # Global styles
│   │   ├── loading.tsx         # Loading UI
│   │   └── error.tsx           # Error boundary
│   │
│   ├── 📁 components/           # 🧩 React Components
│   │   ├── 📁 ui/               # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx       # Button component
│   │   │   ├── input.tsx        # Input component
│   │   │   ├── select.tsx       # Select component
│   │   │   └── ...              # Other base components
│   │   ├── 📁 chat/             # Chat-specific components
│   │   │   ├── chat-interface.tsx    # Main chat UI
│   │   │   ├── message-list.tsx      # Message display
│   │   │   ├── message-input.tsx     # Message input
│   │   │   └── model-selector.tsx    # AI model selection
│   │   ├── 📁 auth/             # Authentication components
│   │   │   ├── login-form.tsx        # Login form
│   │   │   └── auth-provider.tsx     # Auth context
│   │   └── performance-monitor.tsx   # Web Vitals tracking
│   │
│   ├── 📁 lib/                  # 🛠️ Core Libraries
│   │   ├── 📁 auth/             # Authentication logic
│   │   │   ├── config.ts        # NextAuth configuration
│   │   │   └── password.ts      # Password utilities
│   │   ├── 📁 services/         # Business logic layer
│   │   │   ├── chat-service.ts  # 🤖 Vertex AI integration
│   │   │   └── auth-service.ts  # Authentication service
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   │   ├── use-chat.ts      # Chat functionality
│   │   │   └── use-auth.ts      # Authentication state
│   │   ├── 📁 utils/            # Utility functions
│   │   │   ├── cn.ts           # Class name utility
│   │   │   └── format.ts       # Data formatting
│   │   ├── 📁 types/            # TypeScript definitions
│   │   │   ├── auth.ts         # Auth types
│   │   │   ├── chat.ts         # Chat types
│   │   │   └── api.ts          # API types
│   │   ├── 📁 validation/       # Zod schemas
│   │   │   ├── auth.ts         # Auth validation
│   │   │   └── chat.ts         # Chat validation
│   │   ├── 📁 streaming/        # Streaming utilities
│   │   ├── 📁 features/         # Feature flags
│   │   ├── env.ts              # 🔐 Environment validation
│   │   ├── logger.ts           # Centralized logging
│   │   ├── errors.ts           # Custom error classes
│   │   └── performance.ts      # Performance monitoring
│   │
│   └── middleware.ts            # 🛡️ Next.js middleware (auth, security, rate limiting)
│
├── 📁 tests/                # 🧪 Test Suite
│   ├── 📁 unit/                 # Unit tests
│   │   ├── 📁 components/       # Component tests
│   │   ├── 📁 lib/              # Library tests
│   │   └── 📁 utils/            # Utility tests
│   ├── 📁 integration/          # Integration tests
│   │   └── 📁 api/              # API integration tests
│   └── 📁 e2e/                  # End-to-end tests
│       ├── auth.spec.ts         # Authentication tests
│       ├── chat.spec.ts         # Chat functionality tests
│       └── fixtures/            # Test data
│
├── 📁 .storybook/           # 📖 Component Documentation
├── 📁 .husky/               # Git hooks
├── 📁 .next/                # Next.js build output (auto-generated)
├── 📁 node_modules/         # Dependencies (auto-generated)
│
└── 🗂️ Configuration Files
    ├── package.json             # Dependencies & scripts
    ├── next.config.ts          # Next.js configuration
    ├── tailwind.config.js      # Tailwind CSS setup
    ├── tsconfig.json          # TypeScript configuration
    ├── eslint.config.mjs      # ESLint rules
    ├── prettier.config.js     # Code formatting
    ├── vitest.config.ts       # Unit test configuration
    ├── playwright.config.ts   # E2E test configuration
    └── Dockerfile             # Container configuration
```

---

## 🎯 Navigation Patterns

### 🔍 Finding Files Efficiently

#### By Feature/Functionality

**Authentication:**

```
src/app/api/auth/[...nextauth]/route.ts  # NextAuth API route
src/app/login/page.tsx                   # Login page
src/components/auth/                     # Auth components
src/lib/auth/                           # Auth utilities
```

**Chat System:**

```
src/app/page.tsx                        # Main chat interface
src/app/api/chat/route.ts               # Chat API endpoint
src/components/chat/                    # Chat components
src/lib/services/chat-service.ts        # AI integration
src/lib/hooks/use-chat.ts              # Chat hooks
```

**API Layer:**

```
src/app/api/                           # All API routes
src/lib/services/                      # Business logic
src/lib/validation/                    # Request/response schemas
src/lib/types/                         # Type definitions
```

#### By File Type

**React Components:**

```bash
# Quick find pattern: "*.tsx" in src/components/
# VS Code: Ctrl+P → "@*.tsx"
# Zed: Cmd+P → "*.tsx"
```

**API Routes:**

```bash
# Pattern: "**/api/**/route.ts"
# Quick navigation to specific API
```

**Type Definitions:**

```bash
# Pattern: "**/types/*.ts"
# Find all type files
```

**Test Files:**

```bash
# Pattern: "**/*.{test,spec}.{ts,tsx}"
# Find all test files
```

### 🧩 Component Architecture Navigation

#### Finding Related Files

**For any React component:**

1. **Component file**: `src/components/*/component-name.tsx`
2. **Test file**: `tests/unit/components/component-name.test.tsx`
3. **Storybook story**: `src/components/*/component-name.stories.tsx`
4. **Type definitions**: `src/lib/types/` (if complex)

**For API routes:**

1. **Route handler**: `src/app/api/*/route.ts`
2. **Service layer**: `src/lib/services/*-service.ts`
3. **Validation**: `src/lib/validation/*.ts`
4. **Types**: `src/lib/types/*.ts`
5. **Test**: `tests/integration/api/*.test.ts`

---

## 🔎 Search Patterns & Tips

### 🎯 Effective Search Strategies

#### Global Search Patterns

**Find all components:**

```bash
# VS Code/Zed: Search for
export.*function.*\w+\(.*\).*{    # Function components
export.*const.*=.*\(.*\).*=>      # Arrow function components
```

**Find API endpoints:**

```bash
# Search in: src/app/api/
export.*async.*function.*(GET|POST|PUT|DELETE)
```

**Find all hooks:**

```bash
# Search in: src/lib/hooks/
export.*function.*use\w+
export.*const.*use\w+.*=
```

**Find error handling:**

```bash
# Search for error patterns
throw.*new.*Error
catch.*\(.*error.*\)
```

#### File-Specific Patterns

**TypeScript types:**

```bash
interface.*\w+.*{        # Interface definitions
type.*\w+.*=            # Type aliases
enum.*\w+.*{            # Enum definitions
```

**React patterns:**

```bash
useState.*\(            # State hooks
useEffect.*\(           # Effect hooks
props\.\w+              # Props usage
```

### 🏷️ Naming Conventions for Search

#### File Naming Patterns

- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Components**: `kebab-case.tsx` (e.g., `chat-interface.tsx`)
- **Hooks**: `use-feature-name.ts` (e.g., `use-chat.ts`)
- **Services**: `feature-service.ts` (e.g., `chat-service.ts`)
- **Types**: `feature.ts` (e.g., `chat.ts`, `auth.ts`)
- **Utils**: `feature.ts` (e.g., `format.ts`, `validation.ts`)

#### Search by Convention

**Find all custom hooks:**

```bash
# File pattern: "**/use-*.ts"
# Content pattern: "export.*function.*use\w+"
```

**Find all service files:**

```bash
# File pattern: "**/*-service.ts"
# Content pattern: "class.*Service"
```

---

## 🚀 IDE-Specific Navigation Features

### VS Code Advanced Navigation

#### Workspace Symbols

- **`Ctrl+T`** - Search all symbols across workspace
- **`Ctrl+Shift+O`** - Search symbols in current file
- **`Ctrl+Shift+.`** - Navigate to symbol by category

#### Go to Definition & References

- **`F12`** - Go to definition
- **`Alt+F12`** - Peek definition
- **`Shift+F12`** - Find all references
- **`Shift+Alt+F12`** - Peek references

#### Breadcrumb Navigation

- **`Ctrl+Shift+;`** - Navigate breadcrumbs
- **Click breadcrumb items** - Quick navigation to parent directories

#### Explorer Integration

- **`Ctrl+Shift+E`** - Focus file explorer
- **Right-click → "Reveal in File Explorer"** - Open in system file manager
- **File nesting** - Grouped related files (configured in workspace)

#### Multi-root Workspace

```json
{
  "folders": [{ "path": "./src" }, { "path": "./docs" }, { "path": "./tests" }]
}
```

### Zed Navigation Features

#### Project-Wide Search

- **`Cmd+Shift+F`** - Global search with context
- **Search filters** - By file type, directory, etc.

#### Symbol Navigation

- **`Cmd+T`** - Fuzzy symbol search
- **Go to definition** - Built-in LSP support
- **Hover documentation** - Inline type information

#### File Tree

- **Optimized exclusions** - Faster navigation
- **Git status integration** - Visual diff indicators
- **Folder collapsing** - Clean project view

---

## 📚 Context-Aware Navigation

### 🧠 Understanding File Relationships

#### Data Flow Navigation

**User Request → Response:**

```
1. src/app/page.tsx                    # User interface
2. src/components/chat/chat-interface.tsx  # Chat component
3. src/lib/hooks/use-chat.ts          # Chat logic
4. src/app/api/chat/route.ts          # API endpoint
5. src/lib/services/chat-service.ts   # Vertex AI integration
6. src/lib/validation/chat.ts         # Request validation
7. src/lib/types/chat.ts              # Type definitions
```

#### Configuration Chain:

```
1. package.json                       # Dependencies
2. next.config.ts                     # Next.js setup
3. src/lib/env.ts                     # Environment validation
4. src/middleware.ts                  # Request processing
5. src/app/layout.tsx                 # App structure
6. src/app/page.tsx                   # Main interface
```

### 🔄 Development Workflow Navigation

#### Feature Development Path:

1. **Plan**: `docs/` - Check existing documentation
2. **Types**: `src/lib/types/` - Define/update types
3. **Services**: `src/lib/services/` - Business logic
4. **API**: `src/app/api/` - Create/update endpoints
5. **Components**: `src/components/` - UI implementation
6. **Pages**: `src/app/` - Integration
7. **Tests**: `tests/` - Validation
8. **Documentation**: `docs/` - Update guides

#### Bug Investigation Path:

1. **Logs**: Check console/terminal for errors
2. **Network**: Dev tools for API issues
3. **Components**: React DevTools for UI issues
4. **Services**: Debug business logic
5. **Types**: Verify type definitions
6. **Tests**: Add test cases
7. **Configuration**: Check setup files

---

## 🎨 Visual Navigation Aids

### 📁 File Icons & Visual Cues

#### VS Code File Icons (Material Icon Theme)

- **📄 TypeScript**: Blue TS icon
- **⚛️ React/TSX**: Blue React icon
- **🎨 CSS**: Green CSS icon
- **📝 Markdown**: Blue MD icon
- **⚙️ JSON**: Yellow gear icon
- **🔧 Config files**: Orange/gray icons

#### File Explorer Organization

```
📁 src/
├── 📁 app/           # Pages and API routes
├── 📁 components/    # React components
├── 📁 lib/          # Utilities and services
└── middleware.ts     # Request processing

📁 docs/              # Documentation
📁 tests/             # Test files
📁 scripts/           # Utility scripts
📁 .vscode/          # Editor configuration
```

### 🎯 Quick Access Patterns

#### Bookmarks & Shortcuts

**VS Code Bookmarks Extension:**

- **`Ctrl+Alt+K`** - Toggle bookmark
- **`Ctrl+Alt+L`** - List bookmarks
- **`Ctrl+Alt+J/Q`** - Navigate bookmarks

**Commonly Bookmarked Files:**

- `src/app/page.tsx` - Main interface
- `src/lib/env.ts` - Environment config
- `src/lib/services/chat-service.ts` - AI service
- `src/app/api/chat/route.ts` - Chat API
- `docs/README.md` - Documentation hub

---

## 🔧 Customization Tips

### ⚙️ Personal Navigation Setup

#### VS Code User Settings

```json
{
  "workbench.editor.enablePreview": false,
  "explorer.sortOrder": "type",
  "explorer.compactFolders": false,
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/coverage": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Zed User Settings

```json
{
  "base_keymap": "VSCode",
  "theme": "One Dark",
  "project_panel": {
    "git_status": true,
    "auto_fold_dirs": true
  },
  "outline_panel": {
    "button": true
  }
}
```

### 📋 Custom Tasks for Navigation

#### VS Code Tasks for File Generation

```json
{
  "label": "Create New Component",
  "type": "shell",
  "command": "mkdir -p src/components/${input:componentName} && touch src/components/${input:componentName}/${input:componentName}.tsx",
  "group": "build"
}
```

---

## 🚀 Pro Tips

### ⚡ Speed Navigation Techniques

1. **Multi-cursor editing** - `Ctrl+D` to select next occurrence
2. **Column selection** - `Shift+Alt+Drag` for block selection
3. **Quick replace** - `Ctrl+H` for find and replace
4. **File switching** - `Ctrl+Tab` for recent files
5. **Split editors** - `Ctrl+\` for side-by-side editing

### 🔍 Advanced Search Techniques

#### Regular Expressions in Search

```bash
# Find all React components
export.*function.*[A-Z]\w+.*\(

# Find all API route handlers
export.*async.*function.*(GET|POST|PUT|DELETE)

# Find all TypeScript interfaces
interface\s+[A-Z]\w+.*\{
```

#### Search Scopes

- **Current file**: `Ctrl+F`
- **Current folder**: Right-click folder → "Find in Folder"
- **Specific file types**: Use file patterns like `*.tsx,*.ts`

### 📊 Productivity Metrics

**Measure your navigation efficiency:**

- Time to find specific file: < 5 seconds
- Time to locate function/component: < 10 seconds
- Context switching between related files: < 3 seconds

---

## 🛠️ Troubleshooting Navigation Issues

### 🚨 Common Problems

#### IntelliSense Not Working

1. **VS Code**: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. **Zed**: Restart LSP via command palette
3. Check `tsconfig.json` paths configuration

#### File Search Not Finding Files

1. Check `.gitignore` and search exclusions
2. Verify file indexing is complete
3. Clear editor cache/restart

#### Go to Definition Broken

1. Ensure TypeScript server is running
2. Check import paths are correct
3. Verify type definitions are available

### 🔧 Performance Optimization

#### Large Project Navigation

1. **Exclude unnecessary directories** from search
2. **Use specific file patterns** instead of global search
3. **Split workspace** into smaller logical units
4. **Close unused tabs** regularly

#### Memory Usage

1. **Limit concurrent files** open in editor
2. **Use lightweight extensions** only
3. **Configure file watching** exclusions
4. **Restart editor** periodically

---

## 📈 Navigation Metrics & Analytics

### 📊 Track Your Efficiency

**Key Metrics:**

- **Files opened per session** - Monitor tab management
- **Search queries** - Track most common searches
- **Navigation patterns** - Identify frequently accessed paths
- **Time in directories** - Optimize workspace layout

**Optimization Goals:**

- Reduce time to find any file to < 5 seconds
- Minimize context switching between related files
- Maintain clean workspace with < 10 open tabs
- Use keyboard shortcuts for 80% of navigation

---

**🎯 Happy navigating! This guide will help you move through the codebase like a pro.**

_Keep this guide bookmarked and refer to it when exploring new areas of the project._
