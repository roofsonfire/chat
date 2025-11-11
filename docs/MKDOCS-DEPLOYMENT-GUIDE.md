# MkDocs Deployment Guide

This guide explains how to deploy the documentation site to GitHub Pages using MkDocs.

## Prerequisites

### 1. Install Python 3.8+

```bash
# Check Python version
python3 --version

# If not installed, install Python
# Ubuntu/Debian:
sudo apt update && sudo apt install python3 python3-pip

# macOS (with Homebrew):
brew install python3
```

### 2. Install MkDocs and Dependencies

```bash
pip install mkdocs mkdocs-material pymdown-extensions mkdocs-mermaid2-plugin
```

Or use requirements file if you create one:

```bash
# Create requirements.txt
cat > requirements-docs.txt << EOF
mkdocs>=1.5.0
mkdocs-material>=9.4.0
pymdown-extensions>=10.3.0
mkdocs-mermaid2-plugin>=1.1.0
EOF

# Install
pip install -r requirements-docs.txt
```

## Local Development

### Build the Site

```bash
npm run docs:build
```

This creates a `site/` directory with the static HTML files.

### Serve Locally

```bash
npm run docs:serve
```

Visit http://127.0.0.1:8000 to preview the site.

Changes to markdown files will auto-reload.

## Deployment to GitHub Pages

### One-Command Deployment

```bash
npm run docs:deploy
```

This will:

1. Build the documentation site
2. Push to the `gh-pages` branch
3. GitHub Pages will automatically serve it

### Manual Deployment Steps

If `npm run docs:deploy` doesn't work:

```bash
# Build the site
mkdocs build

# Deploy to gh-pages branch
mkdocs gh-deploy --force
```

## Configuration

### GitHub Pages Settings

1. Go to repository settings: https://github.com/roofsonfire/chat/settings/pages
2. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / `root`
3. Save

### Site URL

Once deployed, the site will be available at:
**https://roofsonfire.github.io/chat/**

### Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file to `docs/` directory:

   ```
   docs.yourdo main.com
   ```

2. Configure DNS:

   ```
   Type: CNAME
   Name: docs
   Value: roofsonfire.github.io
   ```

3. Update `mkdocs.yml`:
   ```yaml
   site_url: https://docs.yourdomain.com/
   ```

## Features Enabled

### Search

Search is enabled in `mkdocs.yml`:

```yaml
plugins:
  - search:
      lang: en
      separator: '[\s\-\.]+'
```

Search bar appears in the site header automatically.

### Code Syntax Highlighting

Enabled via pymdownx.highlight:

```yaml
markdown_extensions:
  - pymdownx.highlight:
      anchor_linenums: true
      line_spans: __span
      pygments_lang_class: true
  - pymdownx.inlinehilite
  - pymdownx.superfences
```

### Mermaid Diagrams

Supported via mkdocs-mermaid2-plugin:

```yaml
plugins:
  - mermaid2:
      version: 10.6.1
```

### Dark Mode

Material theme includes automatic dark mode:

```yaml
theme:
  palette:
    # Light mode
    - media: "(prefers-color-scheme: light)"
      scheme: default
      primary: indigo
    # Dark mode
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      primary: indigo
```

## Troubleshooting

### MkDocs Not Found

```bash
# Ensure pip packages are in PATH
export PATH="$HOME/.local/bin:$PATH"

# Or reinstall with --user flag
pip install --user mkdocs mkdocs-material
```

### Permission Denied on Deployment

```bash
# Ensure you're authenticated with GitHub
gh auth login

# Or use SSH key authentication
git remote set-url origin git@github.com:roofsonfire/chat.git
```

### Build Fails

```bash
# Clean build directory
rm -rf site/

# Rebuild
mkdocs build --clean
```

### Broken Links in Built Site

Check the links in development:

```bash
# Serve locally
mkdocs serve

# Check browser console for 404 errors
```

## CI/CD Integration (Future)

To auto-deploy on push to main:

```yaml
# .github/workflows/docs.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths:
      - "docs/**"
      - "mkdocs.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: 3.x
      - run: pip install mkdocs mkdocs-material pymdown-extensions mkdocs-mermaid2-plugin
      - run: mkdocs gh-deploy --force
```

## Maintenance

### Updating Dependencies

```bash
# Update all packages
pip install --upgrade mkdocs mkdocs-material pymdown-extensions mkdocs-mermaid2-plugin

# Check versions
pip list | grep mkdocs
```

### Monitoring

After deployment, monitor:

- **Accessibility:** Check https://roofsonfire.github.io/chat/ works
- **Search:** Test search functionality
- **Navigation:** Verify all links work
- **Mobile:** Check mobile responsiveness

### Analytics (Optional)

Update Google Analytics ID in `mkdocs.yml`:

```yaml
extra:
  analytics:
    provider: google
    property: G-XXXXXXXXXX # Replace with your GA4 ID
```

## Quick Reference

```bash
# Development
npm run docs:serve          # Local preview
npm run docs:build          # Build static site

# Deployment
npm run docs:deploy         # Deploy to GitHub Pages

# Testing
npm run docs:test           # Run documentation tests
npm run docs:lint           # Lint markdown files
```

## Support

- **MkDocs Documentation:** https://www.mkdocs.org/
- **Material Theme:** https://squidfunk.github.io/mkdocs-material/
- **GitHub Pages:** https://docs.github.com/en/pages

---

**Last Updated:** November 2025
**Site URL:** https://roofsonfire.github.io/chat/ (when deployed)
