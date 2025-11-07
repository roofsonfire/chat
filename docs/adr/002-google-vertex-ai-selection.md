# 002. Select Google Vertex AI for AI Capabilities

**Status:** Accepted  
**Date:** 2024-10-20  
**Deciders:** Core Development Team

## Context

We needed to choose an AI/LLM provider for our chat application. Requirements:

- Multimodal support (text + images)
- Streaming responses for better UX
- Production-ready with reliable uptime
- Reasonable pricing for our use case
- Good TypeScript SDK
- Image generation capabilities

## Decision

We will use **Google Vertex AI with Gemini models** as our AI provider.

Primary models:

- **gemini-2.5-flash-image**: Main chat model (multimodal, fast)
- **gemini-1.5-pro-002**: For complex reasoning tasks
- **imagen-3.0-generate-001**: For image generation

## Consequences

### Positive

- ✅ **Multimodal by Design**: Native text + image support
- ✅ **Streaming**: Built-in streaming for real-time responses
- ✅ **Reliability**: Google's infrastructure and uptime
- ✅ **Integration**: Works seamlessly with Google Cloud Run deployment
- ✅ **Pricing**: Competitive pricing, especially for Gemini Flash
- ✅ **SDK Quality**: Official Node.js SDK with TypeScript support
- ✅ **Image Generation**: Imagen 3.0 for high-quality images
- ✅ **Dynamic Model Selection**: Can fetch and use latest models automatically

### Negative

- ⚠️ **Vendor Lock-in**: Switching to another provider requires significant changes
- ⚠️ **GCP Dependency**: Requires Google Cloud account and billing
- ⚠️ **Regional Availability**: Limited to specific GCP regions
- ⚠️ **Rate Limits**: Default quotas may need adjustment for scale
- ⚠️ **Cost Variability**: Pricing can change with new model versions

## Alternatives Considered

### 1. OpenAI GPT-4

- **Pros**: Industry leader, excellent quality, strong ecosystem
- **Cons**: More expensive, separate API for image generation, no direct GCP integration
- **Verdict**: Rejected - Higher cost, less integrated with our GCP deployment

### 2. Anthropic Claude

- **Pros**: Strong reasoning, good context window
- **Cons**: No native image generation, separate infrastructure needed
- **Verdict**: Rejected - Missing image generation capability

### 3. Azure OpenAI

- **Pros**: Enterprise features, Microsoft ecosystem
- **Cons**: Different deployment target (Azure vs GCP), similar pricing to OpenAI
- **Verdict**: Rejected - We're already on GCP for deployment

### 4. Self-hosted LLM (Llama 2/3)

- **Pros**: Full control, no per-request costs
- **Cons**: Infrastructure overhead, scaling complexity, quality gap
- **Verdict**: Rejected - Not production-ready for our use case

### 5. Cohere

- **Pros**: Good embeddings, enterprise features
- **Cons**: Less mature multimodal support, smaller model ecosystem
- **Verdict**: Rejected - Gemini has better multimodal capabilities

## Implementation

- **SDK**: `@google-cloud/vertexai` npm package
- **Service**: `src/lib/services/chat-service.ts`
- **Authentication**: Application Default Credentials or service account
- **Configuration**: Environment variables in `.env.local`

## Cost Analysis

Based on estimated usage of 10,000 requests/month:

**Gemini Flash (our choice):**

- Text: ~$0.10-0.20/month
- Images: ~$1-2/month
- **Total: ~$2-3/month**

**GPT-4 (for comparison):**

- Text: ~$30-50/month
- Images: ~$10-20/month
- **Total: ~$40-70/month**

**Savings: ~95% cost reduction** 💰

## Migration Strategy

If we need to switch providers in the future:

1. Create abstraction layer (`ChatProvider` interface)
2. Implement Vertex AI as one provider
3. Add other providers (OpenAI, Anthropic, etc.)
4. Use environment variable to switch providers
5. Maintain consistent message format across providers

## Performance Metrics

Initial benchmarks (Gemini Flash):

- First token latency: ~500ms
- Streaming rate: ~30 tokens/second
- Image processing: ~1-2 seconds

## References

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini)
- [ChatService Implementation](../../src/lib/services/chat-service.ts)
- [Model Selection Guide](../features/MODEL-SELECTION.md)

---

**Last Updated:** November 2025
