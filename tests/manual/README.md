# Manual Test Scripts

This directory contains manual test scripts for various components of the chat application.

## Scripts

### Authentication Testing

- `test-auth.mjs` - Test authentication logic and password hashing

### Vertex AI Testing

- `test-vertex-ai.js` - Basic Vertex AI configuration and connectivity test
- `test-available-models.mjs` - Test available Vertex AI models
- `test-gemini-2.5-flash.mjs` - Test Gemini 2.5 Flash model specifically
- `test-gemini-image-gen.mjs` - Test Gemini image generation capabilities
- `test-image-generation.mjs` - General image generation testing

## Usage

Most scripts require environment variables to be set. Run them with:

```bash
# For Node.js scripts
node --env-file=.env.local tests/manual/script-name.js

# For ES modules
node --env-file=.env.local tests/manual/script-name.mjs
```

## Fixtures

The `../fixtures/` directory contains test assets:

- `test-gemini-2.5-flash-image-1759721390928.png` - Test image for multimodal testing

## Notes

- These are manual testing scripts, not automated tests
- They require valid Google Cloud credentials and project setup
- Some scripts may output sensitive information - be careful when sharing logs
