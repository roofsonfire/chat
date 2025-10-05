/**
 * Logger utility for consistent logging across the application.
 * This abstraction allows easy replacement with a proper logging service
 * (e.g., Sentry, LogRocket, Winston) in the future.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(context && { context }),
    };

    // In development, use console for better DX
    if (process.env.NODE_ENV === "development") {
      const consoleMethod =
        level === "error" || level === "warn" ? level : "log";
      console[consoleMethod](
        `[${level.toUpperCase()}]`,
        message,
        context || ""
      );
    } else {
      // In production, structure logs as JSON for better parsing
      // This can be easily replaced with a logging service
      console.log(JSON.stringify(logData));
    }
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
