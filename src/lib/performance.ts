import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

/**
 * Performance monitoring utility for tracking Core Web Vitals.
 * Sends metrics to the configured endpoint or logs them in development.
 *
 * Core Web Vitals tracked:
 * - CLS: Cumulative Layout Shift (visual stability)
 * - FCP: First Contentful Paint (loading)
 * - INP: Interaction to Next Paint (interactivity, replaces FID)
 * - LCP: Largest Contentful Paint (loading)
 * - TTFB: Time to First Byte (server response)
 *
 * @see https://web.dev/vitals/
 */

type Metric = {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
};

interface PerformanceData {
  metric: Metric;
  url: string;
  userAgent: string;
  timestamp: number;
}

/**
 * Send metric to analytics endpoint.
 * In production, this should be replaced with your analytics service
 * (e.g., Google Analytics, Vercel Analytics, custom endpoint).
 */
function sendToAnalytics(data: PerformanceData): void {
  // Development: Log to console
  if (process.env.NODE_ENV === "development") {
    console.log("[Performance]", {
      name: data.metric.name,
      value: Math.round(data.metric.value),
      rating: data.metric.rating,
      delta: Math.round(data.metric.delta),
    });
    return;
  }

  // Production: Send to analytics endpoint
  // Example: Google Analytics 4
  // if (window.gtag) {
  //   window.gtag('event', data.metric.name, {
  //     value: Math.round(data.metric.value),
  //     metric_rating: data.metric.rating,
  //     metric_delta: Math.round(data.metric.delta),
  //   });
  // }

  // Example: Vercel Analytics
  // if (window.va) {
  //   window.va('track', data.metric.name, {
  //     value: Math.round(data.metric.value),
  //     rating: data.metric.rating,
  //   });
  // }

  // Example: Custom endpoint
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (endpoint) {
    navigator.sendBeacon(
      endpoint,
      JSON.stringify({
        ...data,
        metric: {
          ...data.metric,
          value: Math.round(data.metric.value),
          delta: Math.round(data.metric.delta),
        },
      })
    );
  }
}

/**
 * Report Core Web Vitals metric.
 */
function reportMetric(metric: Metric): void {
  const data: PerformanceData = {
    metric,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  sendToAnalytics(data);
}

/**
 * Initialize performance monitoring.
 * Call this once when your application loads.
 *
 * @example
 * // In your root layout or _app.tsx
 * import { initPerformanceMonitoring } from '@/lib/performance';
 *
 * useEffect(() => {
 *   initPerformanceMonitoring();
 * }, []);
 */
export function initPerformanceMonitoring(): void {
  try {
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  } catch (error) {
    console.error("Failed to initialize performance monitoring:", error);
  }
}

/**
 * Custom performance mark for timing specific operations.
 *
 * @example
 * performanceMark('api-call-start');
 * await fetchData();
 * performanceMeasure('api-call', 'api-call-start');
 */
export function performanceMark(name: string): void {
  if (typeof performance !== "undefined" && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure time between two performance marks.
 *
 * @returns Duration in milliseconds, or null if measurement failed
 */
export function performanceMeasure(
  name: string,
  startMark: string,
  endMark?: string
): number | null {
  if (typeof performance === "undefined" || !performance.measure) {
    return null;
  }

  try {
    const measure = performance.measure(name, startMark, endMark);
    const duration = Math.round(measure.duration);

    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}: ${duration}ms`);
    }

    return duration;
  } catch (error) {
    console.error(`Failed to measure ${name}:`, error);
    return null;
  }
}

/**
 * Track custom events for performance analysis.
 *
 * @example
 * trackEvent('chat-message-sent', { messageLength: 150 });
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Event]", eventName, properties);
    return;
  }

  // Production: Send to analytics
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (endpoint) {
    navigator.sendBeacon(
      endpoint,
      JSON.stringify({
        type: "event",
        name: eventName,
        properties,
        url: window.location.href,
        timestamp: Date.now(),
      })
    );
  }
}
