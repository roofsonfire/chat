import { env } from "@/lib/env";

/**
 * Get the list of allowed email addresses from environment variables.
 * Emails are stored as a comma-separated string in ALLOWED_EMAILS.
 *
 * Example: ALLOWED_EMAILS="user1@example.com,user2@example.com,user3@example.com"
 *
 * @returns Array of allowed email addresses
 */
export function getAllowlist(): string[] {
  return env.ALLOWED_EMAILS.split(",").map((email) => email.trim());
}

/**
 * Legacy export for backward compatibility.
 * This will be dynamically populated from environment variables.
 */
export const allowlist = getAllowlist();
