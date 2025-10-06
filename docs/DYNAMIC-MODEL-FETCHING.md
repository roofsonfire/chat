# Dynamic Model Fetching

## Overview

The application now dynamically fetches available Vertex AI models from the Google Cloud API instead of using a hardcoded list. This ensures the model selector always displays the latest available models without requiring code updates.

## Architecture

### Components

#### 1. ModelRegistryService (`src/lib/services/model-registry-service.ts`)

A service class that communicates with the Vertex AI API to fetch available models:

```typescript
class ModelRegistryService {
  async fetchAvailableModels(): Promise<VertexAIModel[]>;
  async getModelsWithFallback(): Promise<VertexAIModel[]>;
}
```

**Features:**

- Authenticates using `google-auth-library`
- Fetches models from Vertex AI Publishers API
- Filters for Gemini models only
- Extracts model IDs from full resource names
- Provides fallback models if API is unavailable

#### 2. API Route (`src/app/api/models/route.ts`)

Server-side endpoint that proxies requests to the ModelRegistryService:

```typescript
GET / api / models;
```

**Features:**

- Returns JSON array of available models
- Implements HTTP caching (1 hour cache, 2 hour stale-while-revalidate)
- Handles errors gracefully with fallback
- Secured by Next.js middleware authentication

#### 3. useAvailableModels Hook (`src/lib/hooks/use-available-models.ts`)

Client-side React hook that fetches and caches models:

```typescript
const { models, isLoading, error } = useAvailableModels();
```

**Features:**

- Fetches models on component mount
- Caches results in component state
- Provides loading and error states
- Falls back to hardcoded models on error

#### 4. Updated ModelSelector Component

Now uses the hook to display dynamically fetched models:

```typescript
<ModelSelector
  selectedModel={selectedModel}
  onModelChange={setSelectedModel}
  disabled={isLoading}
/>
```

## Data Flow

1. User opens chat interface
2. `ModelSelector` renders and calls `useAvailableModels()` hook
3. Hook makes GET request to `/api/models`
4. API route instantiates `ModelRegistryService`
5. Service calls Vertex AI API: `GET https://{location}-aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models`
6. Service filters for Gemini models and extracts model IDs
7. API route returns models with HTTP caching headers
8. Hook transforms data and updates state
9. `ModelSelector` displays models in dropdown

## Fallback Strategy

The implementation has multiple fallback layers:

### Layer 1: API Fallback

```typescript
async getModelsWithFallback() {
  try {
    return await this.fetchAvailableModels();
  } catch (error) {
    logger.warn("Using fallback model list");
    return HARDCODED_MODELS;
  }
}
```

### Layer 2: Hook Fallback

```typescript
catch (err) {
  logger.error("Error fetching models", { error: err });
  setModels(FALLBACK_MODELS);
}
```

### Layer 3: Constants Fallback

The hardcoded models in `src/lib/constants/vertex-ai-models.ts` serve as the ultimate fallback.

## Caching Strategy

### Server-Side Caching

```typescript
headers: {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
}
```

- **s-maxage=3600**: Cache for 1 hour on CDN/edge
- **stale-while-revalidate=7200**: Serve stale content for 2 hours while revalidating

### Client-Side Caching

- Models fetched once per page load
- Stored in component state
- No refetching unless page is refreshed

## Authentication

The service uses Application Default Credentials (ADC) via `google-auth-library`:

```typescript
this.auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
```

**Required Permissions:**

- `aiplatform.models.list`
- Or broader: `aiplatform.models.*`

## API Response Format

### Vertex AI API Response

```json
{
  "models": [
    {
      "name": "projects/{project}/locations/{location}/publishers/google/models/gemini-1.5-flash-002",
      "displayName": "Gemini 1.5 Flash",
      "description": "Fast and efficient model for most tasks",
      "supportedGenerationMethods": [
        "generateContent",
        "streamGenerateContent"
      ],
      "inputTokenLimit": 1000000,
      "outputTokenLimit": 8192
    }
  ]
}
```

### Our API Response

```json
{
  "models": [
    {
      "name": "gemini-1.5-flash-002",
      "displayName": "Gemini 1.5 Flash",
      "description": "Fast and efficient model for most tasks"
    }
  ]
}
```

## Error Handling

### API Errors

- **Network failures**: Falls back to hardcoded models
- **Authentication errors**: Logs error and uses fallback
- **Invalid responses**: Validates and falls back if needed

### Client Errors

- **Fetch failures**: Displays fallback models
- **Parse errors**: Logs and shows defaults
- **Timeout**: Uses cached/fallback models

## Configuration

### Environment Variables

No new environment variables required. Uses existing:

- `GOOGLE_PROJECT_ID`
- `GOOGLE_LOCATION`
- `GOOGLE_VERTEX_AI_MODEL_ID` (fallback default)

### Google Cloud Setup

Ensure the service account has:

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## Benefits

1. **Always Up-to-Date**: New models appear automatically
2. **No Code Changes**: No need to update constants when models change
3. **Resilient**: Multiple fallback layers ensure functionality
4. **Performant**: HTTP caching reduces API calls
5. **Flexible**: Easy to filter or modify model list server-side

## Limitations

1. **API Dependency**: Requires network access to Google Cloud
2. **Authentication**: Needs proper service account permissions
3. **Rate Limits**: Subject to Vertex AI API quotas
4. **Regional**: Models may vary by region

## Testing

### Unit Tests (`tests/unit/model-registry-service.test.ts`)

- Service instantiation
- Fallback model retrieval
- Model data formatting
- Error handling

### Integration Testing

```bash
# Test the API endpoint
curl http://localhost:3000/api/models

# Should return:
# {"models":[{"name":"gemini-1.5-flash-002",...}]}
```

### Manual Testing

1. Open the app
2. Check browser Network tab for `/api/models` request
3. Verify models appear in dropdown
4. Test with network disabled (should show fallback)

## Performance Considerations

### Initial Load

- First request: ~200-500ms (API call)
- Subsequent requests: <10ms (HTTP cache)
- Fallback: <1ms (in-memory)

### Memory

- Minimal: ~1KB per model × number of models
- Client state: ~4KB total

### Network

- Request size: <1KB
- Response size: ~2-5KB (depending on model count)
- Cached: 1 hour (reduces API calls)

## Migration from Hardcoded Models

### Before

```typescript
import { AVAILABLE_MODELS } from "@/lib/constants/vertex-ai-models";
```

### After

```typescript
const { models } = useAvailableModels();
```

### Backward Compatibility

- Hardcoded models still exist as fallback
- Model ID format unchanged
- Existing code continues to work

## Future Enhancements

1. **Model Capabilities**: Display supported features (vision, function calling, etc.)
2. **Token Limits**: Show input/output token limits
3. **Model Versioning**: Display version info and release dates
4. **Filtering**: Allow filtering by capability or performance tier
5. **Sorting**: Sort by popularity, performance, or recency
6. **Favorites**: Remember user's preferred models
7. **Recommendations**: Suggest models based on query type

## Troubleshooting

### Models Not Loading

1. Check browser console for errors
2. Verify `/api/models` endpoint returns 200
3. Check server logs for authentication errors
4. Verify service account permissions

### Wrong Models Displayed

1. Check `GOOGLE_LOCATION` environment variable
2. Verify model availability in your region
3. Clear browser cache and reload

### Slow Loading

1. Check HTTP cache headers in response
2. Verify edge/CDN caching is working
3. Consider reducing cache duration if models change frequently

## References

- [Vertex AI Model Garden](https://cloud.google.com/vertex-ai/docs/model-garden/explore-models)
- [Vertex AI API Reference](https://cloud.google.com/vertex-ai/docs/reference)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)
