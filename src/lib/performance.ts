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
