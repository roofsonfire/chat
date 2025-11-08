# 001. Use Next.js App Router

**Status:** Accepted  
**Date:** 2024-10-15  
**Deciders:** Core Development Team

## Context

We needed to choose a React framework for building a production-grade AI chat application. The framework needed to support:

- Server-side rendering for better performance and SEO
- API routes for backend functionality
- Modern React patterns (Server Components, Streaming)
- TypeScript with strict type checking
- Easy deployment to serverless platforms

## Decision

We will use **Next.js 15 with the App Router** as our primary framework.

Key features we're leveraging:

- **React Server Components** for reduced JavaScript bundle size
- **Server Actions** for mutations without API routes
- **Streaming** for real-time AI responses
- **Turbopack** for faster development builds
- **Built-in API routes** for backend logic

## Consequences

### Positive

- ✅ **Better Performance**: Server Components reduce client-side JavaScript
- ✅ **Improved SEO**: Server-side rendering by default
- ✅ **Modern Patterns**: Built-in support for latest React features
- ✅ **TypeScript Support**: First-class TypeScript integration
- ✅ **Deployment**: Easy deployment to Vercel, Cloud Run, and other platforms
- ✅ **Developer Experience**: Fast refresh, excellent error messages
- ✅ **Community**: Large ecosystem and active community

### Negative

- ⚠️ **Learning Curve**: App Router is newer than Pages Router
- ⚠️ **Breaking Changes**: App Router still evolving (though stable as of v15)
- ⚠️ **Migration Path**: Cannot easily switch frameworks later
- ⚠️ **Bundle Size**: Next.js adds ~90KB to initial bundle

## Alternatives Considered

### 1. Next.js Pages Router

- **Pros**: More mature, larger ecosystem of examples
- **Cons**: Older pattern, no Server Components support
- **Verdict**: Rejected - App Router is the future

### 2. Remix

- **Pros**: Excellent data loading, nested routing
- **Cons**: Smaller ecosystem, less mature deployment options
- **Verdict**: Rejected - Next.js has better Vertex AI integration examples

### 3. Create React App + Express

- **Pros**: Full control, simple mental model
- **Cons**: Manual setup for SSR, no built-in optimizations
- **Verdict**: Rejected - Too much boilerplate for our needs

### 4. Vite + React Router

- **Pros**: Fast builds, flexible
- **Cons**: No SSR out of the box, manual API setup
- **Verdict**: Rejected - Need built-in SSR and API routes

## Implementation

- **Location**: All pages in `src/app/`
- **API Routes**: `src/app/api/`
- **Server Components**: Default for all components
- **Client Components**: Only when hooks/interactivity needed

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- Initial Setup PR - _Historical reference, predates current repository_

---

**Last Updated:** November 2025
