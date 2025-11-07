# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for this project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences.

## Format

Each ADR follows this structure:

```markdown
# [Number]. [Title]

**Status:** [Proposed | Accepted | Deprecated | Superseded]  
**Date:** YYYY-MM-DD  
**Deciders:** [Names/Roles]

## Context

What is the issue we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- Benefit 1
- Benefit 2

### Negative

- Drawback 1
- Drawback 2

## Alternatives Considered

What other options did we consider?

## References

- Links to related docs, issues, PRs
```

## Index of ADRs

| #                                         | Title                       | Status   | Date    |
| ----------------------------------------- | --------------------------- | -------- | ------- |
| [001](001-use-nextjs-app-router.md)       | Use Next.js App Router      | Accepted | 2024-10 |
| [002](002-google-vertex-ai-selection.md)  | Select Google Vertex AI     | Accepted | 2024-10 |
| [005](005-in-memory-rate-limiting.md)     | Use In-Memory Rate Limiting | Accepted | 2024-11 |
| [006](006-environment-based-allowlist.md) | Environment-Based Allowlist | Accepted | 2024-11 |

## Creating a New ADR

1. Copy the template from an existing ADR
2. Increment the number
3. Fill in all sections
4. Update this README index
5. Submit as part of your PR

## Guidelines

- **Keep it concise**: ADRs should be readable in 5 minutes
- **Include context**: Explain why the decision matters
- **Document alternatives**: Show what else was considered
- **Update status**: Mark as Deprecated/Superseded when replaced
- **Link to code**: Reference implementations when helpful

## When to Create an ADR

Create an ADR for decisions that:

- Have long-term impact on the architecture
- Are difficult or expensive to reverse
- Affect multiple components or teams
- Introduce new technologies or patterns
- Change fundamental assumptions

## When NOT to Create an ADR

Skip ADRs for:

- Routine implementation details
- Temporary workarounds
- Minor refactorings
- Obvious best practices

---

**Last Updated:** November 2025  
**Maintainers:** Core Development Team
