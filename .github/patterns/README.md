# Code Patterns Library

This directory contains reusable code patterns and architectural guidelines for GitHub Copilot and developers.

## 📚 Available Patterns

| Pattern                                                    | Description                  | Use When                        |
| ---------------------------------------------------------- | ---------------------------- | ------------------------------- |
| [architecture-summary.md](architecture-summary.md)         | High-level system design     | Understanding overall structure |
| [api-route-pattern.md](api-route-pattern.md)               | Standard API route structure | Creating new API endpoints      |
| [server-component-pattern.md](server-component-pattern.md) | React Server Components      | Building pages and layouts      |
| [client-component-pattern.md](client-component-pattern.md) | Client-side React components | Adding interactivity            |
| [service-layer-pattern.md](service-layer-pattern.md)       | Business logic services      | Implementing core logic         |
| [error-handling-pattern.md](error-handling-pattern.md)     | Error handling conventions   | Managing errors gracefully      |
| [testing-pattern.md](testing-pattern.md)                   | Test structure and mocks     | Writing tests                   |
| [validation-pattern.md](validation-pattern.md)             | Input validation with Zod    | Validating user input           |

## 🎯 How to Use This Library

### For Developers

1. Browse patterns before implementing new features
2. Copy-paste and adapt to your specific needs
3. Submit PRs to improve or add patterns

### For GitHub Copilot

These patterns are automatically included in Copilot's context when:

- Creating new files in the relevant directory
- Requesting code generation
- Asking for architectural guidance

## ✍️ Pattern Template

When adding new patterns, use this structure:

```markdown
# [Pattern Name]

## Purpose

[One sentence describing what this pattern solves]

## When to Use

- [Scenario 1]
- [Scenario 2]

## Structure

[Code skeleton with comments]

## Example

[Real-world example from codebase]

## Anti-Patterns

[Common mistakes to avoid]

## Related Patterns

- [Link to related pattern]

## References

- [Internal docs]
- [External resources]
```

## 🔄 Maintenance

- **Review Schedule:** Quarterly
- **Owner:** Core Development Team
- **Last Updated:** November 2025

---

**Contributing a new pattern?**  
See [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for guidelines.
