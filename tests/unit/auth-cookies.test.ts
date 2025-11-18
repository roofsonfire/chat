import { describe, it, expect } from "vitest";
import { authOptions } from "@/lib/auth/logic";
import { env } from "@/lib/env";

describe("NextAuth Cookie Security", () => {
  describe("Session Token Cookie", () => {
    it("should have httpOnly flag set to true", () => {
      expect(authOptions.cookies?.sessionToken?.options?.httpOnly).toBe(true);
    });

    it("should have sameSite set based on environment", () => {
      const expectedSameSite = env.NODE_ENV === "production" ? "strict" : "lax";
      expect(authOptions.cookies?.sessionToken?.options?.sameSite).toBe(
        expectedSameSite
      );
    });

    it("should have path set to root", () => {
      expect(authOptions.cookies?.sessionToken?.options?.path).toBe("/");
    });

    it("should use secure flag based on NODE_ENV", () => {
      const isProduction = env.NODE_ENV === "production";
      expect(authOptions.cookies?.sessionToken?.options?.secure).toBe(
        isProduction
      );
    });

    it("should use __Secure- prefix in production only", () => {
      const name = authOptions.cookies?.sessionToken?.name || "";
      const isProduction = env.NODE_ENV === "production";

      if (isProduction) {
        expect(name).toContain("__Secure-");
      } else {
        expect(name).not.toContain("__Secure-");
      }
    });

    it("should set domain to .daza.ar in production only", () => {
      const domain = authOptions.cookies?.sessionToken?.options?.domain;
      const isProduction = env.NODE_ENV === "production";

      if (isProduction) {
        expect(domain).toBe(".daza.ar");
      } else {
        expect(domain).toBeUndefined();
      }
    });
  });

  describe("Callback URL Cookie", () => {
    it("should have httpOnly flag set to true", () => {
      expect(authOptions.cookies?.callbackUrl?.options?.httpOnly).toBe(true);
    });

    it("should have sameSite set based on environment", () => {
      const expectedSameSite = env.NODE_ENV === "production" ? "strict" : "lax";
      expect(authOptions.cookies?.callbackUrl?.options?.sameSite).toBe(
        expectedSameSite
      );
    });

    it("should have path set to root", () => {
      expect(authOptions.cookies?.callbackUrl?.options?.path).toBe("/");
    });

    it("should use secure flag based on NODE_ENV", () => {
      const isProduction = env.NODE_ENV === "production";
      expect(authOptions.cookies?.callbackUrl?.options?.secure).toBe(
        isProduction
      );
    });

    it("should use __Secure- prefix in production only", () => {
      const name = authOptions.cookies?.callbackUrl?.name || "";
      const isProduction = env.NODE_ENV === "production";

      if (isProduction) {
        expect(name).toContain("__Secure-");
      } else {
        expect(name).not.toContain("__Secure-");
      }
    });
  });

  describe("CSRF Token Cookie", () => {
    it("should have httpOnly flag set to true", () => {
      expect(authOptions.cookies?.csrfToken?.options?.httpOnly).toBe(true);
    });

    it("should have sameSite set based on environment", () => {
      const expectedSameSite = env.NODE_ENV === "production" ? "strict" : "lax";
      expect(authOptions.cookies?.csrfToken?.options?.sameSite).toBe(
        expectedSameSite
      );
    });

    it("should have path set to root", () => {
      expect(authOptions.cookies?.csrfToken?.options?.path).toBe("/");
    });

    it("should use secure flag based on NODE_ENV", () => {
      const isProduction = env.NODE_ENV === "production";
      expect(authOptions.cookies?.csrfToken?.options?.secure).toBe(
        isProduction
      );
    });

    it("should use __Host- prefix in production only", () => {
      const name = authOptions.cookies?.csrfToken?.name || "";
      const isProduction = env.NODE_ENV === "production";

      if (isProduction) {
        expect(name).toContain("__Host-");
      } else {
        expect(name).not.toContain("__Host-");
      }
    });
  });

  describe("Session Configuration", () => {
    it("should use JWT strategy", () => {
      expect(authOptions.session?.strategy).toBe("jwt");
    });

    it("should have maxAge set to 24 hours", () => {
      const expectedMaxAge = 24 * 60 * 60; // 24 hours in seconds
      expect(authOptions.session?.maxAge).toBe(expectedMaxAge);
    });

    it("should have updateAge set to 1 hour", () => {
      const expectedUpdateAge = 60 * 60; // 1 hour in seconds
      expect(authOptions.session?.updateAge).toBe(expectedUpdateAge);
    });
  });

  describe("Cookie Security Best Practices", () => {
    it("should configure all cookies with security attributes", () => {
      const cookies = authOptions.cookies;

      // Verify all three cookies are configured
      expect(cookies).toBeDefined();
      expect(cookies?.sessionToken).toBeDefined();
      expect(cookies?.callbackUrl).toBeDefined();
      expect(cookies?.csrfToken).toBeDefined();
    });

    it("should protect against XSS with httpOnly on all cookies", () => {
      expect(authOptions.cookies?.sessionToken?.options?.httpOnly).toBe(true);
      expect(authOptions.cookies?.callbackUrl?.options?.httpOnly).toBe(true);
      expect(authOptions.cookies?.csrfToken?.options?.httpOnly).toBe(true);
    });

    it("should protect against CSRF with sameSite on all cookies", () => {
      const expectedSameSite = env.NODE_ENV === "production" ? "strict" : "lax";
      expect(authOptions.cookies?.sessionToken?.options?.sameSite).toBe(
        expectedSameSite
      );
      expect(authOptions.cookies?.callbackUrl?.options?.sameSite).toBe(
        expectedSameSite
      );
      expect(authOptions.cookies?.csrfToken?.options?.sameSite).toBe(
        expectedSameSite
      );
    });
  });
});
