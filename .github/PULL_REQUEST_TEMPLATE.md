## Description

<!-- Please include a summary of the change and which issue is fixed. Include relevant motivation and context. -->

### What this PR does

<!-- Provide a clear and concise description of what your changes do -->

### Related Issues

<!-- Link to related issues using keywords: Fixes #123, Closes #456, Resolves #789 -->

- Fixes # (issue)

### Screenshots/Demo

<!-- If applicable, add screenshots or a demo to help explain your changes -->

## Type of Change

<!-- Please check one that applies to this PR -->

- [ ] 🐛 **Bug fix** (non-breaking change which fixes an issue)
- [ ] ✨ **New feature** (non-breaking change which adds functionality)
- [ ] 💥 **Breaking change** (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 **Documentation** (changes to documentation only)
- [ ] 🔧 **Chore** (changes to build process, CI, or tools)
- [ ] ♻️ **Refactor** (code change that neither fixes a bug nor adds a feature)
- [ ] ⚡ **Performance** (code change that improves performance)
- [ ] 🎨 **Style** (changes that do not affect the meaning of the code)

## Testing

<!-- Describe the tests that you ran to verify your changes -->

### Test Cases

- [ ] Unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)

### Manual Testing

<!-- Describe how you manually verified your changes -->

- [ ] Tested in development environment
- [ ] Tested authentication flow (if applicable)
- [ ] Tested chat functionality (if applicable)
- [ ] Tested with different browsers/devices (if applicable)

### Test Configuration

<!-- Provide any relevant details for your test configuration -->

- Node.js version:
- Browser(s) tested:
- Operating System:

## Code Quality Checklist

### SOLID Principles & Clean Code

- [ ] **Single Responsibility**: Each function/class has one clear purpose
- [ ] **Open/Closed**: Code is open for extension but closed for modification
- [ ] **Liskov Substitution**: Derived classes are substitutable for base classes
- [ ] **Interface Segregation**: Interfaces are client-specific and focused
- [ ] **Dependency Inversion**: High-level modules don't depend on low-level modules

### Code Standards

- [ ] My code follows the TypeScript/Next.js style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have used meaningful variable and function names
- [ ] I have avoided code duplication (DRY principle)
- [ ] I have kept functions small and focused (KISS principle)

### Security & Performance

- [ ] Input validation is implemented where needed
- [ ] No sensitive information is logged or exposed
- [ ] Security headers are preserved/enhanced
- [ ] Performance impact has been considered
- [ ] Error handling is comprehensive

### Documentation & Testing

- [ ] I have made corresponding changes to the documentation
- [ ] I have added JSDoc comments for new functions/classes
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] Test coverage is maintained or improved
- [ ] README.md is updated if needed

### Dependencies & Compatibility

- [ ] New dependencies are justified and secure
- [ ] No unused dependencies were added
- [ ] Changes are compatible with existing functionality
- [ ] Environment variables are properly documented (if added)

## GitHub Copilot Optimization

<!-- Help GitHub Copilot understand your changes better -->

### Context for AI

<!-- Describe the business logic or domain concepts that Copilot should understand -->

### Code Patterns Used

<!-- List any specific patterns, conventions, or architectural decisions -->

### Related Components

<!-- List components, services, or modules that are related to your changes -->

## Deployment Notes

<!-- Any special instructions for deployment -->

- [ ] This change requires environment variable updates
- [ ] This change requires database migrations
- [ ] This change requires cache clearing
- [ ] This change requires service restart
- [ ] No special deployment requirements

### Environment Variables

<!-- List any new or changed environment variables -->

### Migration Steps

<!-- If applicable, provide step-by-step migration instructions -->

## Review Focus Areas

<!-- Help reviewers focus on the most important aspects -->

Please pay special attention to:

- [ ] Security implications
- [ ] Performance impact
- [ ] Error handling
- [ ] Test coverage
- [ ] Documentation accuracy
- [ ] Code maintainability

## Additional Notes

<!-- Any additional information that reviewers should know -->

---

<!--
Reviewer Guidelines:
- Check that all automated tests pass
- Verify security considerations are addressed
- Ensure code follows project conventions
- Test the changes in a local environment if needed
- Check that documentation is updated appropriately
-->
