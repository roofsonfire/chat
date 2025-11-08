import { NextResponse } from "next/server";
import { describe, it, expect } from "vitest";

import {
  buildContentSecurityPolicy,
  securityHeadersMiddleware,
} from "@/middleware/security";

const TEST_NONCE = "test-nonce-value";

describe("securityHeadersMiddleware", () => {
  it("applies hardened security headers", () => {
    const response = new NextResponse();

    const secured = securityHeadersMiddleware(response, TEST_NONCE);
    const csp = secured.headers.get("Content-Security-Policy");

    expect(csp).toBeTruthy();
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(csp).toContain(`nonce-${TEST_NONCE}`);
    expect(csp).toContain("strict-dynamic");
    expect(csp).toContain("lh3.googleusercontent.com");
    expect(secured.headers.get("X-CSP-Nonce")).toBe(TEST_NONCE);
  });
});

describe("buildContentSecurityPolicy", () => {
  it("returns a CSP string with the provided nonce", () => {
    const csp = buildContentSecurityPolicy(TEST_NONCE);

    expect(typeof csp).toBe("string");
    expect(csp).toContain(`nonce-${TEST_NONCE}`);
    expect(csp.split("; ")).toContain("default-src 'self'");
  });
});
