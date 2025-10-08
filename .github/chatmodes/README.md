# 🤖 GitHub Copilot Chat Modes

This directory contains specialized chat mode configurations for GitHub Copilot to provide enhanced, context-aware assistance for specific development scenarios.

## 🛡️ Available Chat Modes

### Security Scout (`security-scout.chatmode.md`)

**Purpose**: Security-focused code review and vulnerability scanning

**Capabilities**:

- Scan code for security vulnerabilities and misconfigurations
- Apply OWASP Top 10 and security best practices
- Analyze authentication and session logic
- Review input validation and sanitization
- Check secrets management practices
- Suggest secure alternatives and mitigations

**When to Use**:

- Before deploying security-sensitive features
- When implementing authentication or authorization
- During security audits or vulnerability assessments
- When handling user input or file operations
- For API endpoint security reviews

**Example Usage**:

```
@security-scout Review this authentication middleware for security issues
@security-scout Check this API route for OWASP vulnerabilities
@security-scout Analyze the password hashing implementation
```

## 🔧 How Chat Modes Work

Chat modes are specialized configurations that:

1. **Set Context**: Provide specific focus and expertise
2. **Use Tools**: Leverage specialized analysis tools
3. **Apply Standards**: Follow industry-specific best practices
4. **Give Guidance**: Provide actionable, practical recommendations

## 📚 Integration with Project Documentation

These chat modes are designed to work seamlessly with our existing documentation:

- **[Security Policy](../SECURITY.md)** - Comprehensive security guidelines
- **[GitHub Copilot Instructions](copilot-instructions.md)** - General AI context
- **[Middleware Security](../docs/features/MIDDLEWARE-SECURITY-SUMMARY.md)** - Implementation details
- **[Contributing Guide](../CONTRIBUTING.md)** - Development standards

## 🎯 Usage Guidelines

### For Security Reviews

```bash
# Use security scout for any security-sensitive changes
git diff main...feature-branch | @security-scout "Review these changes for security issues"

# Get recommendations for secure implementation
@security-scout "How should I securely implement user file uploads?"
```

### For Code Reviews

```bash
# Get security-focused feedback during PR reviews
@security-scout "Analyze this PR for potential security vulnerabilities"
```

## 🔮 Future Chat Modes (Planned)

We may add additional specialized modes:

- **Performance Scout** - Performance optimization and monitoring
- **API Designer** - REST API design best practices
- **Testing Assistant** - Test strategy and implementation
- **Accessibility Guide** - WCAG compliance and a11y best practices

## 📖 Related Documentation

- **[GitHub Copilot Documentation](https://docs.github.com/en/copilot)**
- **[Chat Mode Best Practices](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)**
- **[Project Security Policy](../SECURITY.md)**
- **[Development Guidelines](../docs/DEVELOPMENT.md)**

---

**Last Updated**: January 2025  
**Maintained by**: Security Team & AI Integration Team
