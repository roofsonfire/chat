/**
 * Utility functions for handling retries and backoff
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

/**
 * Exponential backoff delay calculation
 */
export function calculateDelay(attempt: number, options: RetryOptions): number {
  const delay = options.baseDelay * Math.pow(options.backoffFactor, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (
        lastError.message.includes("403") || // Permission denied
        lastError.message.includes("404") || // Not found
        lastError.message.includes("400") // Bad request
      ) {
        throw lastError;
      }

      // If it's the last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Check if an error is retryable (rate limit or temporary failure)
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return (
    error.message.includes("429") || // Rate limit
    error.message.includes("503") || // Service unavailable
    error.message.includes("502") || // Bad gateway
    error.message.includes("Network error")
  );
}
