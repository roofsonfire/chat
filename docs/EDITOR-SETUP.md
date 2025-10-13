# 🛠️ Editor Setup Guide

Optimized development environment configuration for **VS Code** and **Zed** editors.

## 📋 Table of Contents

- [VS Code Setup](#-vs-code-setup)
- [Zed Setup](#-zed-setup)
- [Common Configuration](#-common-configuration)
- [Quick Actions & Tasks](#-quick-actions--tasks)
- [Debugging Setup](#-debugging-setup)
- [Performance Tips](#-performance-tips)
- [Troubleshooting](#-troubleshooting)

---

## 🆚 VS Code Setup

### 📦 Automatic Extension Installation

The workspace includes `.vscode/extensions.json` with recommended extensions. VS Code will prompt you to install them automatically.

**Essential Extensions (Auto-installed):**

- **TypeScript & React**: `ms-vscode.vscode-typescript-next`, `dsznajder.es7-react-js-snippets`
- **Code Quality**: `esbenp.prettier-vscode`, `dbaeumer.vscode-eslint`, `usernamehw.errorlens`
- **Testing**: `vitest.explorer`, `ms-playwright.playwright`
- **AI & Git**: `github.copilot`, `eamodio.gitlens`
- **Styling**: `bradlc.vscode-tailwindcss`

### ⚙️ Workspace Settings

Pre-configured settings in `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.quoteStyle": "double",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### 🎯 Quick Actions

**Command Palette (`Cmd/Ctrl + Shift + P`):**

- `Tasks: Run Task` - Access all project tasks
- `TypeScript: Restart TS Server` - Fix IntelliSense issues
- `Developer: Reload Window` - Refresh workspace
- `Preferences: Open Workspace Settings (JSON)` - Edit workspace config

**Task Shortcuts:**

- **`Ctrl+Shift+P` → `Tasks: Run Task`**
  - 🚀 Start Development Server
  - 🧪 Run Unit Tests (Watch Mode)
  - 🎭 E2E Tests (Interactive)
  - 🔧 Fix Code Issues (Format + Lint)
  - 🚀 Deploy to Staging

### 🐛 Debugging Configuration

Pre-configured launch configurations in `.vscode/launch.json`:

#### Available Debug Configurations:

1. **🚀 Debug Next.js (Dev Server)** - Full server debugging
2. **🌐 Debug Next.js (Chrome)** - Client-side debugging
3. **🔗 Attach to Next.js** - Attach to running process
4. **🧪 Debug Unit Tests (Vitest)** - Debug specific tests
5. **🎭 Debug E2E Tests (Playwright)** - Debug browser tests

#### Quick Debug Actions:

```bash
# Start debugging session
F5                    # Start debugging
Ctrl+Shift+F5        # Restart debugging
Shift+F5             # Stop debugging
F9                   # Toggle breakpoint
F10                  # Step over
F11                  # Step into
```

### 📁 File Explorer Enhancements

**File Nesting (Enabled):**

- `package.json` groups `package-lock.json`, `yarn.lock`
- `README.md` groups `CONTRIBUTING.md`, `LICENSE`
- `next.config.*` groups `next-env.d.ts`
- `tsconfig.json` groups `tsconfig.*.json`

**Explorer Context Menu:**

- Right-click folders → **"Open in Integrated Terminal"**
- Right-click `.test.ts` files → **"Debug Test File"**

### 🔧 Integrated Terminal

**Pre-configured terminals:**

- **Main**: Development server (`npm run dev`)
- **Test**: Test runner (`npm run test -- --watch`)
- **Build**: Build tasks (`npm run build`)

**Terminal Shortcuts:**

```bash
Ctrl+`               # Toggle terminal
Ctrl+Shift+`         # Create new terminal
Ctrl+Shift+5         # Split terminal
```

---

## ⚡ Zed Setup

### 🎨 Project Configuration

Zed uses `.zed/settings.json` for project-specific configuration:

```json
{
  "tab_size": 2,
  "format_on_save": "on",
  "code_actions_on_format": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "languages": {
    "TypeScript": {
      "formatter": "prettier"
    },
    "TSX": {
      "formatter": "prettier"
    }
  }
}
```

### 🚀 Built-in Tasks

Pre-configured tasks in `.zed/settings.json`:

**Available Tasks:**

- 🚀 **Start Development Server** (`npm run dev`)
- 🔨 **Build for Production** (`npm run build`)
- 🧪 **Run Tests** (`npm run test`)
- 🎭 **Run E2E Tests** (`npm run test:e2e`)
- 🔍 **Lint Code** (`npm run lint`)
- 💅 **Format Code** (`npm run format`)
- 📚 **Start Storybook** (`npm run storybook`)
- 🚀 **Deploy to Staging** (`./scripts/deployment/deploy-staging.sh`)

### ⌨️ Keyboard Shortcuts

**Task Execution:**

```bash
Cmd+Shift+P          # Command palette
Cmd+Shift+R          # Run task
Cmd+T                # File finder
Cmd+Shift+F          # Project-wide search
Cmd+J                # Toggle terminal
```

### 🤖 AI Assistant Integration

**Zed AI Features:**

- **Copilot Integration**: Built-in GitHub Copilot support
- **Assistant Panel**: Right-side AI chat (if configured)
- **Inline Suggestions**: Real-time code completions

### 🎯 Language Server Features

**TypeScript LSP:**

- Auto-imports with correct relative paths
- Real-time type checking
- Intelligent refactoring suggestions
- Go-to-definition across files

**Tailwind CSS LSP:**

- Class name completions
- Hover documentation
- CSS-in-JS support (cva, cx functions)

### 📊 Performance Optimizations

**File Scanning:**

- Excludes `node_modules`, `.next`, `coverage`
- Optimized for large projects
- Fast file search and navigation

---

## 🔧 Common Configuration

### 📝 EditorConfig

Project includes `.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### 🎨 Prettier Configuration

Consistent formatting via `prettier.config.js`:

```javascript
module.exports = {
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  plugins: ["prettier-plugin-tailwindcss"],
};
```

### 📋 ESLint Configuration

Type-safe linting via `eslint.config.mjs`:

```javascript
import { fixupConfigRules } from "@eslint/compat";
import nextConfig from "eslint-config-next";

export default [
  ...fixupConfigRules(nextConfig),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
```

---

## 🎮 Quick Actions & Tasks

### 🚀 Development Workflow

**Start Development:**

```bash
# VS Code: Ctrl+Shift+P → "Tasks: Run Task" → "🚀 Start Development Server"
# Zed: Cmd+Shift+P → "task: start development server"
# Terminal: npm run dev
```

**Run Tests:**

```bash
# Unit tests (watch mode)
npm run test -- --watch

# E2E tests (interactive)
npm run test:e2e:ui

# Coverage report
npm run test:coverage
```

**Code Quality:**

```bash
# Fix formatting and linting
# VS Code: Task "🔧 Fix Code Issues"
npm run format && npm run lint

# Type checking
npm run type-check

# Full quality check
# VS Code: Task "✅ Full Quality Check"
```

### 🔄 Git Workflow Integration

**Pre-commit Hooks (Husky):**

- Automatic linting and formatting
- Type checking before commits
- Test validation

**GitLens (VS Code) Features:**

- Inline blame annotations
- File history and comparisons
- Branch and stash management

### 🚀 Deployment

**Quick Deploy:**

```bash
# VS Code: Task "🚀 Deploy to Staging"
# Terminal:
cd scripts/deployment
./deploy-staging.sh
```

---

## 🐛 Debugging Setup

### 🔍 Debugging Next.js Applications

#### Server-Side Debugging

1. **Start Debug Session**:
   - VS Code: F5 → Select "🚀 Debug Next.js (Dev Server)"
   - Zed: Use integrated terminal with `--inspect` flag

2. **Set Breakpoints**:
   - API routes: `src/app/api/**/*.ts`
   - Server components: `src/app/**/*.tsx`
   - Services: `src/lib/services/**/*.ts`

3. **Debug Console**:
   - Inspect variables
   - Evaluate expressions
   - Call stack navigation

#### Client-Side Debugging

1. **Chrome DevTools Integration**:
   - VS Code: F5 → Select "🌐 Debug Next.js (Chrome)"
   - Automatic source map resolution
   - React DevTools extension

2. **Common Debug Points**:
   - React components: `src/components/**`
   - Custom hooks: `src/lib/hooks/**`
   - Client-side utilities: `src/lib/utils/**`

### 🧪 Testing & Debugging

#### Unit Test Debugging

**VS Code:**

1. Open test file
2. F5 → Select "🎯 Debug Current Test File"
3. Set breakpoints in test or source code

**Zed:**

1. Use terminal: `npm run test -- --inspect-brk <file>`
2. Attach debugger to process

#### E2E Test Debugging

**Playwright Debug Mode:**

```bash
# Interactive debugging
npm run test:e2e:debug

# VS Code launch config
F5 → Select "🎭 Debug E2E Tests (Playwright)"
```

---

## ⚡ Performance Tips

### 🚀 Editor Performance

#### VS Code Optimizations

1. **Disable Unused Extensions**:

   ```json
   {
     "extensions.autoUpdate": false,
     "extensions.ignoreRecommendations": true
   }
   ```

2. **Optimize TypeScript**:

   ```json
   {
     "typescript.disableAutomaticTypeAcquisition": true,
     "typescript.preferences.includePackageJsonAutoImports": "off"
   }
   ```

3. **File Watching**:
   ```json
   {
     "files.watcherExclude": {
       "**/.git/objects/**": true,
       "**/.git/subtree-cache/**": true,
       "**/node_modules/**": true,
       "**/.next/**": true
     }
   }
   ```

#### Zed Optimizations

1. **File Scanning**: Pre-configured exclusions
2. **LSP Settings**: Optimized for large projects
3. **UI Responsiveness**: Native performance benefits

### 🔧 Development Server Performance

**Turbopack Configuration:**

```bash
# Already enabled in package.json
npm run dev  # Uses --turbopack flag
npm run build  # Uses --turbopack flag
```

**Memory Usage:**

- VS Code: Monitor via Task Manager
- Zed: Generally lower memory footprint
- Node.js: Use `--max-old-space-size=4096` if needed

---

## 🔧 Troubleshooting

### 🚨 Common Issues

#### TypeScript Issues

**Problem**: IntelliSense not working

```bash
# VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Zed
Restart language server via command palette
```

**Problem**: Import suggestions not working

```json
// Add to settings.json
{
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

#### ESLint Issues

**Problem**: Linting not working on save

```json
{
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

#### Prettier Issues

**Problem**: Formatting not consistent

```bash
# Check configuration
npx prettier --check .

# Fix all files
npx prettier --write .
```

### 🧪 Test Issues

#### Vitest Issues

**Problem**: Tests not running in VS Code

1. Install Vitest extension
2. Configure test runner: `Cmd+Shift+P → "Test: Configure"`

#### Playwright Issues

**Problem**: E2E tests failing

```bash
# Install browsers
npx playwright install

# Check configuration
npx playwright test --list
```

### 🚀 Deployment Issues

**Problem**: Build failures

```bash
# Clean build
rm -rf .next
npm run build

# Check environment variables
npm run type-check
```

### 📱 Extension Conflicts

**VS Code Extension Issues:**

1. Disable all extensions
2. Enable one by one to identify conflicts
3. Check extension compatibility

**Recommended Extension Combination:**

- Keep core language extensions
- Use official Microsoft extensions
- Avoid duplicate functionality

---

## 🎯 Best Practices

### 📁 Workspace Organization

1. **Use Workspace Folders**: Organize large projects
2. **Configure File Nesting**: Reduce clutter
3. **Set Up Tasks**: Automate common operations
4. **Configure Debugging**: Set up launch configurations

### 🔄 Workflow Integration

1. **Git Integration**: Use built-in Git features
2. **Task Automation**: Leverage editor tasks
3. **Testing Integration**: Use test explorers
4. **AI Assistance**: Configure Copilot/Assistant

### 🎨 Code Quality

1. **Format on Save**: Consistent formatting
2. **Lint on Save**: Catch issues early
3. **Auto Imports**: Organize imports
4. **Type Checking**: Enable strict mode

---

## 📚 Additional Resources

### 📖 Documentation

- **VS Code**: [Official Documentation](https://code.visualstudio.com/docs)
- **Zed**: [Editor Guide](https://zed.dev/docs)
- **TypeScript**: [VS Code TypeScript](https://code.visualstudio.com/docs/languages/typescript)

### 🎓 Learning Resources

- **VS Code Tips**: [VS Code Can Do That](https://vscodecandothat.com/)
- **Zed Features**: [Zed Blog](https://zed.dev/blog)
- **Debugging Guide**: [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)

### 🤖 AI Integration

- **GitHub Copilot**: [Documentation](https://docs.github.com/en/copilot)
- **Zed Assistant**: [Configuration Guide](https://zed.dev/docs/assistant)

---

**Happy coding! 🚀**

_This guide is regularly updated to reflect the latest editor features and project requirements._
