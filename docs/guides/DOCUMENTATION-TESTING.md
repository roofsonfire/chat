# Documentation Testing Guide

Automated validation for documentation quality, accuracy, and consistency.

## 🎯 Overview

The documentation testing suite ensures:

- ✅ **Code Examples Work** - All code snippets are syntactically valid
- ✅ **Links Are Valid** - No broken internal or external links
- ✅ **Formatting Is Consistent** - Markdown follows style guidelines
- ✅ **Content Is Accurate** - API examples match actual endpoints
- ✅ **Versions Are Current** - Dependency versions are up-to-date

---

## 🚀 Quick Start

### Running Tests

```bash
# Test all documentation
npm run test:docs

# Or run directly
node scripts/test-docs.mjs

# Test specific file
node scripts/test-docs.mjs --file=docs/API.md

# Test only links
node scripts/test-docs.mjs --links

# Test only code examples
node scripts/test-docs.mjs --code

# Verbose output
node scripts/test-docs.mjs --verbose
```

### Adding to CI/CD

Add to `.github/workflows/test.yml`:

```yaml
- name: Test Documentation
  run: npm run test:docs
```

---

## 📋 What Gets Tested

### 1. Code Block Validation

**Checks:**

- Matching braces `{}`
- Matching parentheses `()`
- Complete import statements
- Placeholder warnings (`...`)
- Language-specific rules

**Example:**

```typescript
// ✅ Valid - Balanced braces
function example() {
  return { key: "value" }
}

// ❌ Invalid - Unmatched brace
function broken() {
  return { key: "value"
```

**Supported Languages:**

- TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- Bash/Shell (`.sh`, `.bash`)
- JSON (`.json`)
- YAML (`.yml`, `.yaml`)

### 2. Link Validation

**Internal Links:**

- File existence checks
- Relative path resolution
- Anchor validation (planned)

**External Links:**

- URL format validation
- HTTPS enforcement (warning for HTTP)
- Space detection

**Example:**

```markdown
✅ Valid internal link:
[API Reference](./API.md)

❌ Broken internal link:
[Missing](./nonexistent.md)

✅ Valid external link:
[Next.js](https://nextjs.org)

⚠️ Non-HTTPS link:
[Example](http://example.com)
```

### 3. Markdown Formatting

**Checks:**

- Trailing whitespace
- Tabs vs spaces
- Multiple blank lines
- Header spacing (`## Title` not `##Title`)
- List formatting
- Code block language tags

**Example:**

````markdown
✅ Correct header:

## Section Title

❌ Missing space:

## Section Title

✅ Code block with language:

```typescript
const x = 1;
```
````

⚠️ Code block without language:

```
const x = 1
```

```

### 4. API Endpoint Testing (Future)

**Planned Features:**
- Verify endpoint URLs match actual routes
- Test example requests/responses
- Validate status codes
- Check authentication requirements

---

## 🛠️ Test Script Reference

### Command-Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--links` | Test links only | `node scripts/test-docs.mjs --links` |
| `--code` | Test code blocks only | `node scripts/test-docs.mjs --code` |
| `--markdown` | Test markdown formatting only | `node scripts/test-docs.mjs --markdown` |
| `--file=<path>` | Test specific file | `node scripts/test-docs.mjs --file=docs/API.md` |
| `--verbose` | Detailed output | `node scripts/test-docs.mjs --verbose` |

### Exit Codes

- `0` - All tests passed (warnings allowed)
- `1` - Tests failed (errors found)

### Output Format

```

📚 Documentation Testing Suite

Configuration:
Test links: true
Test code: true
Test markdown: true
Specific file: None (testing all)

Testing 25 markdown file(s)...

Testing: docs/API.md
Testing: docs/DEVELOPMENT.md
...

============================================================
📊 Test Results
============================================================

Files tested: 25
Errors: 0
Warnings: 3

⚠️ Warnings:

docs/API.md:42
Code block contains '...' which may be placeholder text

docs/guides/QUICKSTART.md:15
Line has trailing spaces

docs/README.md:100
Non-HTTPS URL: http://example.com

✅ All tests passed!

````

---

## 🔧 Custom Validation Rules

### Adding New Code Validators

Edit `scripts/test-docs.mjs`:

```javascript
function testCodeBlock(block, file) {
  const errors = []

  // Add custom rule
  if (block.language === "typescript") {
    if (block.code.includes("any") && !block.code.includes("// @ts-ignore")) {
      errors.push({
        type: "warning",
        file,
        line: block.line,
        message: "TypeScript code uses 'any' type",
      })
    }
  }

  return errors
}
````

### Adding Custom Link Validators

```javascript
function testLink(link, file) {
  const errors = [];

  // Add custom rule - Check for deprecated URLs
  const deprecatedDomains = ["old-domain.com", "deprecated-api.io"];
  if (deprecatedDomains.some((domain) => link.url.includes(domain))) {
    errors.push({
      type: "warning",
      file,
      line: link.line,
      message: `Link uses deprecated domain: ${link.url}`,
    });
  }

  return errors;
}
```

---

## 🧪 Testing Best Practices

### 1. Write Testable Code Examples

````markdown
✅ Good - Complete, runnable example:

```typescript
import { useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```
````

❌ Bad - Incomplete snippet:

```typescript
const [count, setCount] = useState(0);
// ... more code
```

````

### 2. Use Relative Links

```markdown
✅ Good - Relative link:
[Development Guide](./DEVELOPMENT.md)

❌ Bad - Absolute GitHub URL:
[Development Guide](https://github.com/roofsonfire/chat/blob/main/docs/DEVELOPMENT.md)
````

**Why?** Relative links work locally and on any fork/deployment.

### 3. Specify Code Block Languages

````markdown
✅ Good - Language specified:

```bash
npm install
```
````

❌ Bad - No language:

```
npm install
```

````

**Why?** Enables syntax highlighting and language-specific validation.

### 4. Keep Examples Current

```markdown
✅ Good - Current API:
```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ messages: [...] })
})
````

❌ Bad - Old API:

```typescript
// This endpoint was removed in v2.0
const response = await fetch("/api/old-endpoint");
```

````

---

## 📊 Test Coverage

### Current Coverage

| Category | Files Tested | Coverage |
|----------|-------------|----------|
| **Guides** | 8 | 100% |
| **API Docs** | 1 | 100% |
| **Migration Docs** | 3 | 100% |
| **Architecture Docs** | 5 | 100% |
| **Reference Docs** | 8 | 100% |
| **Total** | **25** | **100%** |

### Excluded Files

- `.github/` - GitHub-specific configs
- `node_modules/` - Dependencies
- `archive/` - Historical docs (not maintained)

---

## 🐛 Common Issues

### Issue: "Unmatched braces in typescript code block"

**Cause:** Code example has syntax error

**Fix:**

```typescript
// Before (❌ broken)
function example() {
  return { key: "value"

// After (✅ fixed)
function example() {
  return { key: "value" }
}
````

### Issue: "Broken internal link: ./missing.md"

**Cause:** File doesn't exist or path is wrong

**Fix:**

```markdown
Before: [Guide](./missing.md)
After: [Guide](./guides/QUICKSTART.md)
```

### Issue: "Non-HTTPS URL: http://example.com"

**Cause:** Link uses HTTP instead of HTTPS

**Fix:**

```markdown
Before: http://example.com
After: https://example.com
```

### Issue: "Header missing space after #"

**Cause:** Markdown header has no space

**Fix:**

```markdown
Before: ##Title
After: ## Title
```

---

## 🚀 Advanced Features

### Pre-commit Hook Integration

Add to `.husky/pre-commit`:

```bash
# !/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Test docs if markdown files changed
if git diff --cached --name-only | grep -q '\.md$'; then
  echo "📚 Testing documentation..."
  npm run test:docs
fi
```

### Continuous Monitoring

Create `.github/workflows/docs-test.yml`:

```yaml
name: Documentation Tests

on:
  push:
    paths:
      - "docs/**"
      - "*.md"
  pull_request:
    paths:
      - "docs/**"
      - "*.md"

jobs:
  test-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Test documentation
        run: npm run test:docs
```

### Custom Reporters

Create JSON output for CI/CD:

```javascript
// Add to scripts/test-docs.mjs

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.totalErrors > 0 ? 1 : 0);
}
```

Usage:

```bash
node scripts/test-docs.mjs --json > test-results.json
```

---

## 📚 Related Documentation

- [Contributing to Documentation](../CONTRIBUTING-DOCS.md)
- [Documentation Style Guide](./STYLE-GUIDE.md) (Coming soon)
- [Writing Guide](./WRITING-GUIDE.md) (Coming soon)

---

## 🆘 Getting Help

### Testing Issues

1. **Run with verbose flag:**

   ```bash
   node scripts/test-docs.mjs --verbose
   ```

2. **Test specific file:**

   ```bash
   node scripts/test-docs.mjs --file=docs/problematic.md
   ```

3. **Check exit code:**

   ```bash
   node scripts/test-docs.mjs
   echo $?  # 0 = pass, 1 = fail
   ```

### Reporting Bugs

If the test script has issues:

1. Include command run and full output
2. Specify Node.js version (`node --version`)
3. Attach example file that causes the issue
4. Open issue: [github.com/roofsonfire/chat/issues](https://github.com/roofsonfire/chat/issues)

---

**Last Updated:** November 2025
**Maintained by:** Core Development Team
**Test Suite Version:** 1.0.0
