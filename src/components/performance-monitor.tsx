"use client";

import { useEffect } from "react";
import { initPerformanceMonitoring } from "@/lib/performance";

/**
 * Performance monitoring component that initializes Web Vitals tracking.
 * Should be included once in the root layout.
 */
export function PerformanceMonitor() {
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return null;
}
