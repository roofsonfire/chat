# Documentation Images

This directory contains screenshots and images for the documentation.

## Required Screenshots

### Chat Interface

- [ ] **chat-interface-overview.png** - Full chat interface showing header, chat history, and input area
- [ ] **chat-message-user.png** - User message with avatar
- [ ] **chat-message-assistant.png** - AI assistant message with markdown rendering
- [ ] **chat-image-upload.png** - Image upload preview with file size indicator
- [ ] **chat-streaming.png** - Streaming response in action
- [ ] **chat-command-palette.png** - Command palette (⌘K) interface

### Model Selection

- [ ] **model-selector-dropdown.png** - Model selection dropdown showing available Gemini models
- [ ] **model-info-tooltip.png** - Model information tooltip with token limits

### Deployment

- [ ] **cloud-run-dashboard.png** - Google Cloud Run service dashboard
- [ ] **github-actions-workflow.png** - GitHub Actions workflow run
- [ ] **deployment-success.png** - Successful deployment notification

### Error States

- [ ] **error-rate-limit.png** - Rate limit exceeded message
- [ ] **error-auth.png** - Authentication required message
- [ ] **error-validation.png** - Input validation error

## Screenshot Guidelines

1. **Resolution**: Minimum 1920x1080 for desktop screenshots
2. **Format**: PNG with transparency where applicable
3. **Annotations**: Use red boxes/arrows for important elements
4. **Privacy**: Blur any sensitive information (emails, API keys)
5. **Theme**: Both light and dark mode screenshots where applicable

## Tools for Screenshots

- **macOS**: Cmd+Shift+4 (region), Cmd+Shift+5 (full screen)
- **Linux**: Flameshot, GNOME Screenshot
- **Windows**: Snipping Tool, Win+Shift+S
- **Browser**: DevTools device toolbar for responsive screenshots

## Image Optimization

Before committing, optimize images:

```bash
# Install imagemin-cli
npm install -g imagemin-cli

# Optimize PNG files
imagemin docs/images/*.png --out-dir=docs/images

# Or use online tools:
# - https://tinypng.com/
# - https://squoosh.app/
```

## Usage in Documentation

Reference images in markdown:

```markdown
<!-- Examples will be added when actual screenshots are captured -->
![Alt text](../images/filename.png)
_Figure caption describing the image_
```

---

**Note**: Screenshots will be captured in a future session when the application is running.
For now, diagrams in [ARCHITECTURE-DIAGRAMS.md](ARCHITECTURE-DIAGRAMS.md) provide visual documentation.
