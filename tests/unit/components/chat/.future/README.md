# Future Component Tests

These tests are for components that will be created in the SOLID refactoring PRs (#115-118).

## Action Required

Once PRs #115-118 are merged, move these test files back to the parent directory:

```bash
mv tests/unit/components/chat/.future/*.test.tsx tests/unit/components/chat/
rm tests/unit/components/chat/.future/README.md
rmdir tests/unit/components/chat/.future
```

## Test Files

- `empty-state.test.tsx` - Tests for EmptyState component (created in PR #116)
- `error-state.test.tsx` - Tests for ErrorState component (created in PR #116)
- `inline-error.test.tsx` - Tests for InlineError component (created in PR #116)
- `loading-skeleton.test.tsx` - Tests for LoadingSkeleton component (created in PR #116)

These components implement the Single Responsibility Principle (SRP) by extracting common patterns from the main chat interface.
