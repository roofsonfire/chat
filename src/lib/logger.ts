/**
 * Logger utility for consistent logging across the application.
 * This abstraction allows easy replacement with a proper logging service
 * (e.g., Sentry, LogRocket, Winston) in the future.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

const SENSITIVE_KEY_PATTERN =
  /(?:password|secret|token|session|auth|cookie|email|key)/i;
const SENSITIVE_VALUE_PATTERNS = [
  /bearer\s+[a-z0-9._-]+/i,
  /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/i,
  /-----BEGIN [A-Z ]+-----/,
  /xox[baprs]-[A-Za-z0-9-]+/i,
];
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const REDACTED_VALUE = "[REDACTED]";
const MAX_STRING_LENGTH = 256;
const MAX_STACK_LENGTH = 1024;

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(sanitizedContext && { context: sanitizedContext }),
    };

    if (process.env.NODE_ENV === "development") {
      const consoleMethod =
        level === "error" || level === "warn" ? level : "log";
      console[consoleMethod](
        `[${level.toUpperCase()}]`,
        message,
        sanitizedContext ?? ""
      );
    } else {
      console.log(JSON.stringify(logData));
    }
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) {
      return undefined;
    }

    const seen = new WeakSet<object>();

    const sanitizeValue = (value: unknown, key?: string): unknown => {
      if (value === null || value === undefined) {
        return value;
      }

      if (typeof value === "string") {
        return this.sanitizeString(value, key);
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return value;
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      if (value instanceof Error) {
        return this.serializeError(value);
      }

      if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item, key));
      }

      if (typeof value === "object") {
        if (seen.has(value as object)) {
          return "[Circular]";
        }

        seen.add(value as object);

        return Object.entries(value as Record<string, unknown>).reduce(
          (acc, [childKey, childValue]) => {
            acc[childKey] = sanitizeValue(childValue, childKey);
            return acc;
          },
          {} as Record<string, unknown>
        );
      }

      return value;
    };

    return sanitizeValue(context) as LogContext;
  }

  private sanitizeString(value: string, key?: string): string {
    if (key && SENSITIVE_KEY_PATTERN.test(key)) {
      return REDACTED_VALUE;
    }

    if (SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
      return REDACTED_VALUE;
    }

    const sanitized = value.replace(EMAIL_PATTERN, (match) =>
      this.maskEmail(match)
    );

    return this.truncateString(sanitized, MAX_STRING_LENGTH);
  }

  private serializeError(error: Error): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      name: error.name,
      message: this.truncateString(error.message, MAX_STRING_LENGTH),
    };

    if (error.stack) {
      payload.stack = this.truncateString(error.stack, MAX_STACK_LENGTH);
    }

    return payload;
  }

  private truncateString(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength)}…(truncated)`;
  }

  private maskEmail(email: string): string {
    const atIndex = email.indexOf("@");

    if (atIndex === -1) {
      return REDACTED_VALUE;
    }

    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);

    if (!local || !domain) {
      return REDACTED_VALUE;
    }

    if (local.length <= 2) {
      return `***@${domain}`;
    }

    return `${local[0]}***${local.slice(-1)}@${domain}`;
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, context);
    }
  }
}

export const logger = new Logger();
