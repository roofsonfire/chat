# Performance Monitoring

This application includes comprehensive performance monitoring to track Core Web Vitals and custom metrics.

## Overview

Performance monitoring helps identify:

- **Loading Performance**: How fast pages load (LCP, FCP, TTFB)
- **Interactivity**: How quickly users can interact (INP)
- **Visual Stability**: Layout shift prevention (CLS)
- **Custom Metrics**: API calls, user actions, business events

## Core Web Vitals Tracked

### 1. Largest Contentful Paint (LCP)

- **Target**: < 2.5s (Good), < 4s (Needs Improvement), > 4s (Poor)
- **Measures**: Loading performance of main content
- **Impact**: User perception of page load speed

### 2. Interaction to Next Paint (INP)

- **Target**: < 200ms (Good), < 500ms (Needs Improvement), > 500ms (Poor)
- **Measures**: Page responsiveness to user interactions
- **Impact**: User experience during interactions
- **Note**: Replaces First Input Delay (FID)

### 3. Cumulative Layout Shift (CLS)

- **Target**: < 0.1 (Good), < 0.25 (Needs Improvement), > 0.25 (Poor)
- **Measures**: Visual stability during page load
- **Impact**: Prevents unexpected layout shifts

### 4. First Contentful Paint (FCP)

- **Target**: < 1.8s (Good), < 3s (Needs Improvement), > 3s (Poor)
- **Measures**: Time until first content is rendered
- **Impact**: User perception of loading start

### 5. Time to First Byte (TTFB)

- **Target**: < 800ms (Good), < 1800ms (Needs Improvement), > 1800ms (Poor)
- **Measures**: Server response time
- **Impact**: Backend and network performance

## Implementation

### Automatic Tracking

Performance monitoring is automatically initialized in the root layout:

```typescript
// src/app/layout.tsx
import { PerformanceMonitor } from "@/components/performance-monitor";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PerformanceMonitor />
        {children}
      </body>
    </html>
  );
}
```

### Manual Performance Marks

Track custom operations:

```typescript
import { performanceMark, performanceMeasure } from "@/lib/performance";

// Mark the start of an operation
performanceMark("api-call-start");

// Perform operation
await fetchData();

// Measure duration
const duration = performanceMeasure("api-call", "api-call-start");
console.log(`API call took ${duration}ms`);
```

### Custom Event Tracking

Track user actions and business events:

```typescript
import { trackEvent } from "@/lib/performance";

// Track a user action
trackEvent("button-clicked", {
  buttonName: "submit",
  location: "chat-form",
});

// Track a business metric
trackEvent("chat-message-sent", {
  messageLength: message.length,
  hasImage: !!message.image,
});
```

## Configuration

### Development Mode

In development, all metrics are logged to the console:

```
[Performance] LCP: 1234ms
[Performance] INP: 42ms
[Performance] api-call: 156ms
[Event] chat-message-sent { messageLength: 150 }
```

### Production Mode

#### Option 1: Google Analytics 4

Uncomment in `src/lib/performance.ts`:

```typescript
if (window.gtag) {
  window.gtag("event", data.metric.name, {
    value: Math.round(data.metric.value),
    metric_rating: data.metric.rating,
  });
}
```

Add Google Analytics to `src/app/layout.tsx`:

```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

#### Option 2: Vercel Analytics

Install Vercel Analytics:

```bash
npm install @vercel/analytics
```

Add to root layout:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

Vercel automatically tracks Web Vitals.

#### Option 3: Custom Endpoint

Set environment variable:

```bash
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/metrics
```

Metrics will be sent via `navigator.sendBeacon()` to this endpoint.

Example payload:

```json
{
  "metric": {
    "id": "v3-1234567890",
    "name": "LCP",
    "value": 1234,
    "rating": "good",
    "delta": 1234,
    "navigationType": "navigate"
  },
  "url": "https://your-app.com/page",
  "userAgent": "Mozilla/5.0...",
  "timestamp": 1633024800000
}
```

#### Option 4: Sentry

For error tracking and performance monitoring:

```bash
npm install @sentry/nextjs
```

Run configuration wizard:

```bash
npx @sentry/wizard@latest -i nextjs
```

## Best Practices

### 1. Optimize Images

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={isAboveFold}  // For LCP images
  loading="lazy"           // For below-fold images
/>
```

### 2. Code Splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,  // Optional: disable SSR
});
```

### 3. Reduce Layout Shift

- Set explicit dimensions for images and embeds
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS transforms instead of properties that trigger layout

### 4. Optimize Fonts

```typescript
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  display: "swap", // Prevents invisible text during loading
  preload: true,
});
```

### 5. Monitor API Performance

```typescript
export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    // Process request
    const result = await processRequest(req);

    const duration = performance.now() - startTime;
    if (duration > 1000) {
      logger.warn("Slow API request", { duration, endpoint: "/api/chat" });
    }

    return NextResponse.json(result);
  } catch (error) {
    // Handle error
  }
}
```

## Monitoring Dashboard

### View Metrics

#### In Development

- Open browser DevTools Console
- Look for `[Performance]` and `[Event]` logs
- Use Chrome DevTools Performance panel (Ctrl+Shift+I → Performance)

#### In Production (with analytics)

- **Google Analytics**: Behavior → Site Speed → Overview
- **Vercel Analytics**: Dashboard → Analytics tab
- **Custom**: Build your own dashboard using the metrics endpoint

### Alerting

Set up alerts for performance degradation:

```typescript
// Example: Alert if LCP > 4s
function reportMetric(metric) {
  if (metric.name === "LCP" && metric.value > 4000) {
    // Send alert
    fetch("/api/alerts", {
      method: "POST",
      body: JSON.stringify({
        type: "performance",
        severity: "high",
        metric: metric.name,
        value: metric.value,
      }),
    });
  }
}
```

## Troubleshooting

### Metrics Not Appearing

1. **Check console for errors**:

   ```bash
   # Open browser DevTools Console
   # Look for initialization errors
   ```

2. **Verify web-vitals is installed**:

   ```bash
   npm ls web-vitals
   ```

3. **Check NODE_ENV**:
   - Development: Logs to console
   - Production: Sends to endpoint

### Poor Performance Scores

1. **Analyze with Lighthouse**:
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run audit

2. **Check Network**:
   - Large assets not optimized
   - Too many requests
   - Slow server responses

3. **Optimize Bundle**:

   ```bash
   npm run build
   # Check .next/build-manifest.json for bundle sizes
   ```

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Next.js Performance Guide](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
